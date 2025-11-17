const pool = require("../config/database");

const routeModel = {
  async getAll() {
    try {
      console.log("Ejecutando consulta de rutas...");

      const query = `
        SELECT 
          id_ruta as id,
          nombre_ruta as nombre,
          tipo_ruta as tipo,
          distancia_metros as distancia,
          tiempo_estimado_minutos as tiempo_estimado,
          activa,
          -- Obtener geometría como GeoJSON
          ST_AsGeoJSON(geometria_ruta) as geometria_geojson,
          -- Extraer puntos de inicio y fin desde la geometría
          ST_AsGeoJSON(ST_StartPoint(geometria_ruta)) as inicio_geojson,
          ST_AsGeoJSON(ST_EndPoint(geometria_ruta)) as fin_geojson
        FROM ruta 
        WHERE geometria_ruta IS NOT NULL
        ORDER BY id_ruta
      `;

      const result = await pool.query(query);
      console.log(`${result.rows.length} rutas encontradas`);

      const routes = result.rows.map((row) => {
        let geometria = null;
        let punto_inicio = null;
        let punto_fin = null;

        try {
          if (row.geometria_geojson) {
            geometria = JSON.parse(row.geometria_geojson);
          }
          if (row.inicio_geojson) {
            punto_inicio = JSON.parse(row.inicio_geojson);
          }
          if (row.fin_geojson) {
            punto_fin = JSON.parse(row.fin_geojson);
          }
        } catch (error) {
          console.warn("Error parseando geometría para ruta", row.id, error);
        }

        const route = {
          id: row.id,
          nombre: row.nombre,
          tipo: row.tipo,
          distancia: row.distancia,
          tiempo_estimado: row.tiempo_estimado,
          activa: row.activa,
          geometria: geometria,
          punto_inicio: punto_inicio,
          punto_fin: punto_fin,
        };

        console.log(`Ruta ${route.id}: "${route.nombre}"`);
        return route;
      });

      return routes;
    } catch (error) {
      console.error("Error en routeModel.getAll:", error.message);
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
        punto_inicio: null,
        punto_fin: null,
      }));

      console.log(`${routes.length} rutas cargadas (modo básico)`);
      return routes;
    } catch (error) {
      console.error("Error en consulta básica:", error.message);
      return [];
    }
  },

  async create(routeData) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      console.log("Creando nueva ruta:", routeData);

      // Crear geometría LineString desde coordenadas
      let geometriaWKT = null;
      if (routeData.geometria && routeData.geometria.type === "LineString") {
        const coords = routeData.geometria.coordinates
          .map((coord) => `${coord[0]} ${coord[1]}`)
          .join(",");
        geometriaWKT = `LINESTRING(${coords})`;
      } else {
        throw new Error("Se requiere una geometría LineString válida");
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
        geometriaWKT,
      ];

      const routeResult = await client.query(routeQuery, routeValues);
      const newRoute = routeResult.rows[0];

      await client.query("COMMIT");

      console.log("Ruta creada exitosamente con ID:", newRoute.id);

      // Obtener la ruta completa para retornar
      const completeRoute = await this.getById(newRoute.id);
      return completeRoute;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error en routeModel.create:", error.message);
      throw error;
    } finally {
      client.release();
    }
  },

  async update(id, routeData) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      console.log("Actualizando ruta ID:", id);

      // Crear geometría LineString desde coordenadas
      let geometriaWKT = null;
      if (routeData.geometria && routeData.geometria.type === "LineString") {
        const coords = routeData.geometria.coordinates
          .map((coord) => `${coord[0]} ${coord[1]}`)
          .join(",");
        geometriaWKT = `LINESTRING(${coords})`;
      } else {
        throw new Error("Se requiere una geometría LineString válida");
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
        geometriaWKT,
        id,
      ];

      const routeResult = await client.query(routeQuery, routeValues);

      if (routeResult.rows.length === 0) {
        throw new Error(`No se encontró la ruta con ID: ${id}`);
      }

      await client.query("COMMIT");

      console.log("Ruta actualizada exitosamente");

      // Obtener la ruta completa para retornar
      const completeRoute = await this.getById(id);
      return completeRoute;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error en routeModel.update:", error.message);
      throw error;
    } finally {
      client.release();
    }
  },

  async delete(id) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      console.log("Eliminando ruta ID:", id);

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

      console.log("Ruta eliminada:", deleteResult.rows[0]);

      return {
        id: deleteResult.rows[0].id,
        nombre: deleteResult.rows[0].nombre,
        message: `Ruta "${deleteResult.rows[0].nombre}" eliminada permanentemente`,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error en routeModel.delete:", error.message);
      throw error;
    } finally {
      client.release();
    }
  },

  async getById(routeId) {
    try {
      const query = `
        SELECT 
          id_ruta as id,
          nombre_ruta as nombre,
          tipo_ruta as tipo,
          distancia_metros as distancia,
          tiempo_estimado_minutos as tiempo_estimado,
          activa,
          ST_AsGeoJSON(geometria_ruta) as geometria_geojson,
          ST_AsGeoJSON(ST_StartPoint(geometria_ruta)) as inicio_geojson,
          ST_AsGeoJSON(ST_EndPoint(geometria_ruta)) as fin_geojson
        FROM ruta
        WHERE id_ruta = $1
      `;

      const result = await pool.query(query, [routeId]);

      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      let geometria = null;
      let punto_inicio = null;
      let punto_fin = null;

      try {
        if (row.geometria_geojson) {
          geometria = JSON.parse(row.geometria_geojson);
        }
        if (row.inicio_geojson) {
          punto_inicio = JSON.parse(row.inicio_geojson);
        }
        if (row.fin_geojson) {
          punto_fin = JSON.parse(row.fin_geojson);
        }
      } catch (error) {
        console.warn("Error parseando geometría:", error);
      }

      return {
        id: row.id,
        nombre: row.nombre,
        tipo: row.tipo,
        distancia: row.distancia,
        tiempo_estimado: row.tiempo_estimado,
        activa: row.activa,
        geometria: geometria,
        punto_inicio: punto_inicio,
        punto_fin: punto_fin,
      };
    } catch (error) {
      console.error("Error en routeModel.getById:", error.message);
      throw error;
    }
  },

  // Nuevos métodos para análisis espacial sin tabla punto_ruta
  async findNearbyRoutes(point, maxDistanceMeters = 50) {
    try {
      const { lng, lat } = point;

      const query = `
        SELECT 
          id_ruta as id,
          nombre_ruta as nombre,
          tipo_ruta as tipo,
          ST_Distance(
            geometria_ruta::geography,
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
          ) as distancia_metros,
          ST_AsGeoJSON(geometria_ruta) as geometria_geojson
        FROM ruta
        WHERE ST_DWithin(
          geometria_ruta::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          $3
        )
        ORDER BY distancia_metros
        LIMIT 10
      `;

      const result = await pool.query(query, [lng, lat, maxDistanceMeters]);

      return result.rows.map((row) => ({
        id: row.id,
        nombre: row.nombre,
        tipo: row.tipo,
        distancia_metros: Math.round(parseFloat(row.distancia_metros)),
        geometria: row.geometria_geojson
          ? JSON.parse(row.geometria_geojson)
          : null,
      }));
    } catch (error) {
      console.error("Error buscando rutas cercanas:", error);
      return [];
    }
  },

  async findRouteIntersections(route1Id, route2Id) {
    try {
      const query = `
        WITH ruta1 AS (
          SELECT geometria_ruta as geom1 FROM ruta WHERE id_ruta = $1
        ),
        ruta2 AS (
          SELECT geometria_ruta as geom2 FROM ruta WHERE id_ruta = $2
        )
        SELECT 
          ST_AsGeoJSON(ST_Intersection(geom1, geom2)) as interseccion_geojson,
          ST_NumGeometries(ST_Intersection(geom1, geom2)) as num_intersecciones
        FROM ruta1, ruta2
        WHERE ST_Intersects(geom1, geom2)
      `;

      const result = await pool.query(query, [route1Id, route2Id]);

      if (result.rows.length === 0) {
        return { intersecciones: [], total: 0 };
      }

      const row = result.rows[0];
      let intersecciones = [];

      try {
        if (row.interseccion_geojson) {
          const interseccion = JSON.parse(row.interseccion_geojson);

          // Si es una colección de geometrías, extraer cada una
          if (interseccion.type === "GeometryCollection") {
            intersecciones = interseccion.geometries.filter(
              (geom) => geom.type === "Point" || geom.type === "LineString"
            );
          } else if (
            interseccion.type === "Point" ||
            interseccion.type === "LineString"
          ) {
            intersecciones = [interseccion];
          }
        }
      } catch (error) {
        console.warn("Error parseando intersección:", error);
      }

      return {
        intersecciones: intersecciones,
        total: parseInt(row.num_intersecciones) || 0,
      };
    } catch (error) {
      console.error("Error encontrando intersecciones:", error);
      return { intersecciones: [], total: 0 };
    }
  },
};

module.exports = routeModel;
