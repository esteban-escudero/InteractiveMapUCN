const pool = require("../config/database");
const RouteNodes = require('../utils/routeNodes');

const routeModel = {
  async getAll() {
    try {
      console.log("🔍 Ejecutando consulta de rutas...");

      const query = `
        SELECT 
          r.id_ruta as id,
          r.nombre_ruta as nombre,
          r.tipo_ruta as tipo,
          r.distancia_metros as distancia,
          r.tiempo_estimado_minutos as tiempo_estimado,
          r.activa,
          -- Usar coordenadas_geo (PostGIS geometry)
          CASE 
            WHEN r.geometria_ruta IS NOT NULL THEN
              ST_AsGeoJSON(r.geometria_ruta)
            ELSE NULL
          END as geometria_geojson,
          COALESCE(
            json_agg(
              json_build_object(
                'id', pr.id_punto,
                'orden', pr.orden,
                'tipo_punto', pr.tipo_punto,
                'descripcion', pr.descripcion,
                'nombre_punto', pr.nombre_punto,
                'coordenadas', 
                CASE 
                  WHEN pr.coordenadas_geo IS NOT NULL THEN
                    json_build_object(
                      'type', 'Point',
                      'coordinates', ARRAY[ST_X(pr.coordenadas_geo), ST_Y(pr.coordenadas_geo)]
                    )
                  -- Fallback: usar latitud/longitud si existen
                  WHEN pr.latitud IS NOT NULL AND pr.longitud IS NOT NULL THEN
                    json_build_object(
                      'type', 'Point',
                      'coordinates', ARRAY[pr.longitud::float, pr.latitud::float]
                    )
                  ELSE NULL
                END
              ) ORDER BY pr.orden
            ) FILTER (WHERE pr.id_punto IS NOT NULL),
            '[]'
          ) as puntos_ruta
        FROM ruta r
        LEFT JOIN punto_ruta pr ON r.id_ruta = pr.id_ruta
        GROUP BY r.id_ruta, r.nombre_ruta, r.tipo_ruta, r.distancia_metros, 
                 r.tiempo_estimado_minutos, r.activa, r.geometria_ruta
        ORDER BY r.id_ruta
      `;

      const result = await pool.query(query);
      console.log(`📊 ${result.rows.length} rutas encontradas`);

      const routes = result.rows.map((row) => {
        let geometria = null;
        try {
          if (row.geometria_geojson) {
            geometria = JSON.parse(row.geometria_geojson);
          }
        } catch (error) {
          console.warn("❌ Error parseando geometría para ruta", row.id, error);
        }

        const route = {
          id: row.id,
          nombre: row.nombre,
          tipo: row.tipo,
          distancia: row.distancia,
          tiempo_estimado: row.tiempo_estimado,
          activa: row.activa,
          geometria: geometria,
          puntos_ruta: row.puntos_ruta || [],
        };

        console.log(
          `🛣️ Ruta ${route.id}: "${route.nombre}", puntos: ${route.puntos_ruta.length}`
        );
        return route;
      });

      return routes;
    } catch (error) {
      console.error("❌ Error en routeModel.getAll:", error.message);
      return await this.getAllBasic();
    }
  },

  async getAllBasic() {
    try {
      const query = `
        SELECT 
          id_ruta as id,
          nombre_ruta as nombre,
          tipo_ruta as tipo,
          distancia_metros as distancia,
          tiempo_estimado_minutos as tiempo_estimado,
          activa
        FROM ruta 
        ORDER BY id_ruta
      `;

      const result = await pool.query(query);

      const routes = result.rows.map((row) => ({
        id: row.id,
        nombre: row.nombre,
        tipo: row.tipo,
        distancia: row.distancia,
        tiempo_estimado: row.tiempo_estimado,
        activa: row.activa,
        geometria: null,
        puntos_ruta: [],
      }));

      console.log(`⚠️ ${routes.length} rutas cargadas (modo básico)`);
      return routes;
    } catch (error) {
      console.error("❌ Error en consulta básica:", error.message);
      return [];
    }
  },

  async create(routeData) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      console.log("🛣️ Creando nueva ruta en la base de datos:", routeData);

      // Crear geometría LineString desde coordenadas
      let geometriaWKT = null;
      if (routeData.geometria && routeData.geometria.type === "LineString") {
        const coords = routeData.geometria.coordinates
          .map((coord) => `${coord[0]} ${coord[1]}`)
          .join(",");
        geometriaWKT = `LINESTRING(${coords})`;
      }

      // Insertar la ruta principal
      const routeQuery = `
        INSERT INTO ruta (
          nombre_ruta, 
          tipo_ruta, 
          distancia_metros, 
          tiempo_estimado_minutos,
          geometria_ruta
        ) VALUES ($1, $2, $3, $4, ST_GeomFromText($5, 4326))
        RETURNING 
          id_ruta as id,
          nombre_ruta as nombre,
          tipo_ruta as tipo,
          distancia_metros as distancia,
          tiempo_estimado_minutos as tiempo_estimado,
          activa
      `;

      const routeValues = [
        routeData.nombre,
        routeData.tipo || "peatonal",
        routeData.distancia || 0,
        routeData.tiempo_estimado || 0,
        geometriaWKT || "LINESTRING(0 0, 1 1)",
      ];

      const routeResult = await client.query(routeQuery, routeValues);
      const newRoute = routeResult.rows[0];

      // Insertar puntos de ruta si existen
      if (routeData.puntos_ruta && routeData.puntos_ruta.length > 0) {
        for (const punto of routeData.puntos_ruta) {
          if (punto.coordenadas && punto.coordenadas.type === "Point") {
            const [lng, lat] = punto.coordenadas.coordinates;

            // ✅ CORREGIDO: Usar solo las columnas que existen en la BD
            const puntoQuery = `
              INSERT INTO punto_ruta (
                id_ruta,
                orden,
                tipo_punto,
                descripcion,
                nombre_punto,
                coordenadas_geo,
                latitud,
                longitud
              ) VALUES ($1, $2, $3, $4, $5, ST_GeomFromText($6, 4326), $7, $8)
            `;

            const puntoValues = [
              newRoute.id,
              punto.orden,
              punto.tipo_punto,
              punto.descripcion || "",
              punto.nombre_punto || punto.descripcion || `Punto ${punto.orden}`,
              `POINT(${lng} ${lat})`,
              lat,
              lng,
            ];

            await client.query(puntoQuery, puntoValues);
          }
        }
      }

      await client.query("COMMIT");

      console.log("✅ Ruta creada exitosamente con ID:", newRoute.id);

      return {
        id: newRoute.id,
        nombre: newRoute.nombre,
        tipo: newRoute.tipo,
        distancia: newRoute.distancia,
        tiempo_estimado: newRoute.tiempo_estimado,
        activa: newRoute.activa,
        geometria: routeData.geometria,
        puntos_ruta: routeData.puntos_ruta || [],
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("❌ Error en routeModel.create:", error.message);
      throw error;
    } finally {
      client.release();
    }
  },

  async update(id, routeData) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      console.log("✏️ Actualizando ruta ID:", id);

      // Crear geometría LineString desde coordenadas
      let geometriaWKT = null;
      if (routeData.geometria && routeData.geometria.type === "LineString") {
        const coords = routeData.geometria.coordinates
          .map((coord) => `${coord[0]} ${coord[1]}`)
          .join(",");
        geometriaWKT = `LINESTRING(${coords})`;
      }

      // Actualizar ruta principal
      const routeQuery = `
        UPDATE ruta 
        SET 
          nombre_ruta = $1,
          tipo_ruta = $2,
          distancia_metros = $3,
          tiempo_estimado_minutos = $4,
          geometria_ruta = ST_GeomFromText($5, 4326)
        WHERE id_ruta = $6
        RETURNING 
          id_ruta as id,
          nombre_ruta as nombre,
          tipo_ruta as tipo,
          distancia_metros as distancia,
          tiempo_estimado_minutos as tiempo_estimado,
          activa
      `;

      const routeValues = [
        routeData.nombre,
        routeData.tipo || "peatonal",
        routeData.distancia || 0,
        routeData.tiempo_estimado || 0,
        geometriaWKT || "LINESTRING(0 0, 1 1)",
        id,
      ];

      const routeResult = await client.query(routeQuery, routeValues);

      if (routeResult.rows.length === 0) {
        throw new Error(`No se encontró la ruta con ID: ${id}`);
      }

      // Eliminar puntos existentes y crear nuevos
      await client.query("DELETE FROM punto_ruta WHERE id_ruta = $1", [id]);

      // Insertar nuevos puntos de ruta
      if (routeData.puntos_ruta && routeData.puntos_ruta.length > 0) {
        for (const punto of routeData.puntos_ruta) {
          if (punto.coordenadas && punto.coordenadas.type === "Point") {
            const [lng, lat] = punto.coordenadas.coordinates;

            // ✅ CORREGIDO: Usar solo las columnas que existen en la BD
            const puntoQuery = `
              INSERT INTO punto_ruta (
                id_ruta,
                orden,
                tipo_punto,
                descripcion,
                nombre_punto,
                coordenadas_geo,
                latitud,
                longitud
              ) VALUES ($1, $2, $3, $4, $5, ST_GeomFromText($6, 4326), $7, $8)
            `;

            const puntoValues = [
              id,
              punto.orden,
              punto.tipo_punto,
              punto.descripcion || "",
              punto.nombre_punto || punto.descripcion || `Punto ${punto.orden}`,
              `POINT(${lng} ${lat})`,
              lat,
              lng,
            ];

            await client.query(puntoQuery, puntoValues);
          }
        }
      }

      await client.query("COMMIT");

      console.log("✅ Ruta actualizada exitosamente");

      return {
        id: routeResult.rows[0].id,
        nombre: routeResult.rows[0].nombre,
        tipo: routeResult.rows[0].tipo,
        distancia: routeResult.rows[0].distancia,
        tiempo_estimado: routeResult.rows[0].tiempo_estimado,
        activa: routeResult.rows[0].activa,
        geometria: routeData.geometria,
        puntos_ruta: routeData.puntos_ruta || [],
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("❌ Error en routeModel.update:", error.message);
      throw error;
    } finally {
      client.release();
    }
  },

  async delete(id) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      console.log("🗑️ Eliminando ruta ID:", id);

      // Primero eliminar puntos de ruta (por la FK)
      await client.query("DELETE FROM punto_ruta WHERE id_ruta = $1", [id]);

      // Luego eliminar la ruta
      const deleteQuery = `
        DELETE FROM ruta 
        WHERE id_ruta = $1 
        RETURNING id_ruta as id, nombre_ruta as nombre
      `;

      const deleteResult = await client.query(deleteQuery, [id]);

      if (deleteResult.rows.length === 0) {
        throw new Error(`No se encontró la ruta con ID: ${id}`);
      }

      await client.query("COMMIT");

      console.log("✅ Ruta eliminada:", deleteResult.rows[0]);

      return {
        id: deleteResult.rows[0].id,
        nombre: deleteResult.rows[0].nombre,
        message: `Ruta "${deleteResult.rows[0].nombre}" eliminada permanentemente`,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("❌ Error en routeModel.delete:", error.message);
      throw error;
    } finally {
      client.release();
    }
  },

   async createWithSharedNodes(routeData) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      console.log("🛣️ Creando ruta con nodos compartidos:", routeData);

      // Crear geometría LineString
      let geometriaWKT = null;
      if (routeData.geometria && routeData.geometria.type === "LineString") {
        const coords = routeData.geometria.coordinates
          .map((coord) => `${coord[0]} ${coord[1]}`)
          .join(",");
        geometriaWKT = `LINESTRING(${coords})`;
      }

      // Insertar la ruta principal
      const routeQuery = `
        INSERT INTO ruta (
          nombre_ruta, 
          tipo_ruta, 
          distancia_metros, 
          tiempo_estimado_minutos,
          geometria_ruta
        ) VALUES ($1, $2, $3, $4, ST_GeomFromText($5, 4326))
        RETURNING id_ruta as id
      `;

      const routeValues = [
        routeData.nombre,
        routeData.tipo || "peatonal",
        routeData.distancia || 0,
        routeData.tiempo_estimado || 0,
        geometriaWKT || "LINESTRING(0 0, 1 1)",
      ];

      const routeResult = await client.query(routeQuery, routeValues);
      const newRouteId = routeResult.rows[0].id;

      // Insertar puntos de ruta con nodos compartidos
      if (routeData.puntos_ruta && routeData.puntos_ruta.length > 0) {
        for (const punto of routeData.puntos_ruta) {
          if (punto.coordenadas && punto.coordenadas.type === "Point") {
            const [lng, lat] = punto.coordenadas.coordinates;

            // Buscar o crear nodo
            const nodeResult = await RouteNodes.createOrReuseNode({
              lng, lat, 
              nombre_punto: punto.nombre_punto,
              tipo_punto: punto.tipo_punto
            });

            if (nodeResult.reutilizado) {
              // Reutilizar nodo existente
              console.log(`🔄 Reutilizando nodo existente: ${nodeResult.nodo_existente.id}`);
              
              const reuseQuery = `
                INSERT INTO punto_ruta (
                  id_ruta, id_punto, orden, tipo_punto, descripcion, nombre_punto
                ) VALUES ($1, $2, $3, $4, $5, $6)
              `;
              
              await client.query(reuseQuery, [
                newRouteId,
                nodeResult.nodo_existente.id,
                punto.orden,
                punto.tipo_punto,
                punto.descripcion || "",
                punto.nombre_punto || `Punto ${punto.orden}`
              ]);
              
            } else {
              // Crear nuevo nodo
              const puntoQuery = `
                INSERT INTO punto_ruta (
                  id_ruta, orden, tipo_punto, descripcion, nombre_punto,
                  coordenadas_geo, latitud, longitud
                ) VALUES ($1, $2, $3, $4, $5, ST_GeomFromText($6, 4326), $7, $8)
                RETURNING id_punto
              `;

              const puntoValues = [
                newRouteId,
                punto.orden,
                punto.tipo_punto,
                punto.descripcion || "",
                punto.nombre_punto || punto.descripcion || `Punto ${punto.orden}`,
                `POINT(${lng} ${lat})`,
                lat,
                lng,
              ];

              await client.query(puntoQuery, puntoValues);
            }
          }
        }
      }

      await client.query("COMMIT");

      console.log("✅ Ruta creada con nodos compartidos, ID:", newRouteId);

      // Obtener la ruta completa para retornar
      const completeRoute = await this.getById(newRouteId);
      return completeRoute;

    } catch (error) {
      await client.query("ROLLBACK");
      console.error("❌ Error en routeModel.createWithSharedNodes:", error.message);
      throw error;
    } finally {
      client.release();
    }
  },

  async getById(routeId) {
    try {
      const query = `
        SELECT 
          r.id_ruta as id,
          r.nombre_ruta as nombre,
          r.tipo_ruta as tipo,
          r.distancia_metros as distancia,
          r.tiempo_estimado_minutos as tiempo_estimado,
          r.activa,
          ST_AsGeoJSON(r.geometria_ruta) as geometria_geojson,
          COALESCE(
            json_agg(
              json_build_object(
                'id', pr.id_punto,
                'orden', pr.orden,
                'tipo_punto', pr.tipo_punto,
                'descripcion', pr.descripcion,
                'nombre_punto', pr.nombre_punto,
                'coordenadas', json_build_object(
                  'type', 'Point',
                  'coordinates', ARRAY[ST_X(pr.coordenadas_geo), ST_Y(pr.coordenadas_geo)]
                )
              ) ORDER BY pr.orden
            ) FILTER (WHERE pr.id_punto IS NOT NULL),
            '[]'
          ) as puntos_ruta
        FROM ruta r
        LEFT JOIN punto_ruta pr ON r.id_ruta = pr.id_ruta
        WHERE r.id_ruta = $1
        GROUP BY r.id_ruta
      `;

      const result = await pool.query(query, [routeId]);
      
      if (result.rows.length === 0) return null;
      
      const row = result.rows[0];
      let geometria = null;
      
      try {
        if (row.geometria_geojson) {
          geometria = JSON.parse(row.geometria_geojson);
        }
      } catch (error) {
        console.warn("❌ Error parseando geometría:", error);
      }

      return {
        id: row.id,
        nombre: row.nombre,
        tipo: row.tipo,
        distancia: row.distancia,
        tiempo_estimado: row.tiempo_estimado,
        activa: row.activa,
        geometria: geometria,
        puntos_ruta: row.puntos_ruta || []
      };
      
    } catch (error) {
      console.error("❌ Error en routeModel.getById:", error.message);
      throw error;
    }
  },
};

module.exports = routeModel;
