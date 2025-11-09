// backend/utils/routeNodes.js
const TurfUtils = require("./turfUtils");
const pool = require("../config/database");

const RouteNodes = {
  // ENCONTRAR NODOS EXISTENTES CERCANOS (puntos compartibles)
  async findNearbyNodes(point, toleranceMeters = 10) {
    try {
      const { lat, lng } = point;

      const query = `
        SELECT 
          id_punto as id,
          nombre_punto as nombre,
          tipo_punto,
          ST_X(coordenadas_geo) as lng,
          ST_Y(coordenadas_geo) as lat,
          COUNT(DISTINCT id_ruta) as rutas_compartidas,
          ARRAY_AGG(DISTINCT id_ruta) as ids_rutas
        FROM punto_ruta 
        WHERE ST_DWithin(
          coordenadas_geo::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          $3
        )
        GROUP BY id_punto, nombre_punto, tipo_punto, coordenadas_geo
        ORDER BY rutas_compartidas DESC
      `;

      const result = await pool.query(query, [lng, lat, toleranceMeters]);

      console.log(
        `Encontrados ${result.rows.length} nodos cercanos dentro de ${toleranceMeters}m`
      );

      return result.rows.map((row) => ({
        id: row.id,
        nombre: row.nombre,
        tipo_punto: row.tipo_punto,
        coordenadas: { lng: parseFloat(row.lng), lat: parseFloat(row.lat) },
        rutas_compartidas: row.rutas_compartidas,
        ids_rutas: row.ids_rutas,
      }));
    } catch (error) {
      console.error("Error buscando nodos cercanos:", error);
      return [];
    }
  },

  // CREAR O REUTILIZAR NODO
  async createOrReuseNode(pointData, toleranceMeters = 10) {
    try {
      const { lng, lat, nombre_punto, tipo_punto = "intermedio" } = pointData;

      // Buscar nodos existentes cercanos
      const nearbyNodes = await this.findNearbyNodes(
        { lng, lat },
        toleranceMeters
      );

      if (nearbyNodes.length > 0) {
        // Reutilizar el nodo más cercano y con más rutas compartidas
        const bestNode = nearbyNodes[0];
        console.log(
          `Reutilizando nodo existente: ${bestNode.nombre} (${bestNode.rutas_compartidas} rutas)`
        );

        return {
          id_punto: bestNode.id,
          reutilizado: true,
          nodo_existente: bestNode,
        };
      }

      // Crear nuevo nodo
      console.log(`Creando nuevo nodo: ${nombre_punto || "Sin nombre"}`);

      return {
        id_punto: null, // Se asignará al insertar
        reutilizado: false,
        nodo_existente: null,
      };
    } catch (error) {
      console.error("Error en createOrReuseNode:", error);
      return { id_punto: null, reutilizado: false, nodo_existente: null };
    }
  },

  // OBTENER TODOS LOS NODOS CON RUTAS COMPARTIDAS
  async getAllSharedNodes() {
    try {
      const query = `
        SELECT 
          id_punto as id,
          nombre_punto as nombre,
          tipo_punto,
          ST_X(coordenadas_geo) as lng,
          ST_Y(coordenadas_geo) as lat,
          COUNT(DISTINCT id_ruta) as total_rutas,
          ARRAY_AGG(DISTINCT id_ruta) as ids_rutas,
          STRING_AGG(DISTINCT r.nombre_ruta, ', ') as nombres_rutas
        FROM punto_ruta pr
        LEFT JOIN ruta r ON pr.id_ruta = r.id_ruta
        GROUP BY id_punto, nombre_punto, tipo_punto, coordenadas_geo
        HAVING COUNT(DISTINCT id_ruta) > 1
        ORDER BY total_rutas DESC, id_punto
      `;

      const result = await pool.query(query);

      console.log(
        `Encontrados ${result.rows.length} nodos compartidos entre rutas`
      );

      return result.rows.map((row) => ({
        id: row.id,
        nombre: row.nombre,
        tipo_punto: row.tipo_punto,
        coordenadas: { lng: parseFloat(row.lng), lat: parseFloat(row.lat) },
        total_rutas: row.total_rutas,
        ids_rutas: row.ids_rutas,
        nombres_rutas: row.nombres_rutas.split(", "),
      }));
    } catch (error) {
      console.error("Error obteniendo nodos compartidos:", error);
      return [];
    }
  },

  // OBTENER RUTAS QUE COMPARTEN UN NODO ESPECÍFICO
  async getRoutesSharingNode(nodeId) {
    try {
      const query = `
        SELECT 
          r.id_ruta as id,
          r.nombre_ruta as nombre,
          r.tipo_ruta as tipo,
          pr.orden,
          pr.tipo_punto
        FROM punto_ruta pr
        JOIN ruta r ON pr.id_ruta = r.id_ruta
        WHERE pr.id_punto = $1
        ORDER BY r.nombre_ruta, pr.orden
      `;

      const result = await pool.query(query, [nodeId]);

      return result.rows.map((row) => ({
        id: row.id,
        nombre: row.nombre,
        tipo: row.tipo,
        orden_en_ruta: row.orden,
        tipo_punto: row.tipo_punto,
      }));
    } catch (error) {
      console.error("Error obteniendo rutas que comparten nodo:", error);
      return [];
    }
  },

  // ENCONTRAR INTERSECCIONES ENTRE RUTAS
  async findRouteIntersections(route1Id, route2Id) {
    try {
      const query = `
        WITH puntos_ruta1 AS (
          SELECT 
            id_punto,
            ST_X(coordenadas_geo) as lng1,
            ST_Y(coordenadas_geo) as lat1,
            orden as orden1,
            tipo_punto as tipo1
          FROM punto_ruta 
          WHERE id_ruta = $1
        ),
        puntos_ruta2 AS (
          SELECT 
            id_punto,
            ST_X(coordenadas_geo) as lng2,
            ST_Y(coordenadas_geo) as lat2,
            orden as orden2,
            tipo_punto as tipo2
          FROM punto_ruta 
          WHERE id_ruta = $2
        )
        SELECT 
          r1.id_punto,
          r1.lng1 as lng,
          r1.lat1 as lat,
          r1.orden1 as orden_ruta1,
          r2.orden2 as orden_ruta2,
          r1.tipo1 as tipo_ruta1,
          r2.tipo2 as tipo_ruta2
        FROM puntos_ruta1 r1
        INNER JOIN puntos_ruta2 r2 ON r1.id_punto = r2.id_punto
        ORDER BY r1.orden1
      `;

      const result = await pool.query(query, [route1Id, route2Id]);

      console.log(
        `Encontradas ${result.rows.length} intersecciones entre rutas ${route1Id} y ${route2Id}`
      );

      return result.rows.map((row) => ({
        id_punto: row.id_punto,
        coordenadas: { lng: parseFloat(row.lng), lat: parseFloat(row.lat) },
        orden_ruta1: row.orden_ruta1,
        orden_ruta2: row.orden_ruta2,
        tipo_ruta1: row.tipo_ruta1,
        tipo_ruta2: row.tipo_ruta2,
      }));
    } catch (error) {
      console.error("Error encontrando intersecciones entre rutas:", error);
      return [];
    }
  },

  // SUGERIR CONEXIONES ENTRE RUTAS
  async suggestRouteConnections(routeId, maxDistanceMeters = 50) {
    try {
      const query = `
        WITH puntos_ruta_actual AS (
          SELECT 
            id_punto,
            ST_X(coordenadas_geo) as lng,
            ST_Y(coordenadas_geo) as lat,
            orden,
            tipo_punto
          FROM punto_ruta 
          WHERE id_ruta = $1
        ),
        otras_rutas AS (
          SELECT DISTINCT 
            pr.id_ruta,
            r.nombre_ruta,
            pr.id_punto,
            ST_X(pr.coordenadas_geo) as otro_lng,
            ST_Y(pr.coordenadas_geo) as otro_lat,
            pr.orden as otro_orden,
            pr.tipo_punto as otro_tipo
          FROM punto_ruta pr
          JOIN ruta r ON pr.id_ruta = r.id_ruta
          WHERE pr.id_ruta != $1
        )
        SELECT 
          pra.id_punto as punto_actual_id,
          pra.lng,
          pra.lat,
          pra.orden,
          pra.tipo_punto,
          orr.id_ruta as otra_ruta_id,
          orr.nombre_ruta as otra_ruta_nombre,
          orr.id_punto as otro_punto_id,
          orr.otro_lng,
          orr.otro_lat,
          orr.otro_orden,
          orr.otro_tipo,
          ST_Distance(
            ST_SetSRID(ST_MakePoint(pra.lng, pra.lat), 4326)::geography,
            ST_SetSRID(ST_MakePoint(orr.otro_lng, orr.otro_lat), 4326)::geography
          ) as distancia_metros
        FROM puntos_ruta_actual pra
        CROSS JOIN otras_rutas orr
        WHERE ST_DWithin(
          ST_SetSRID(ST_MakePoint(pra.lng, pra.lat), 4326)::geography,
          ST_SetSRID(ST_MakePoint(orr.otro_lng, orr.otro_lat), 4326)::geography,
          $2
        )
        ORDER BY pra.orden, distancia_metros
      `;

      const result = await pool.query(query, [routeId, maxDistanceMeters]);

      console.log(
        `${result.rows.length} conexiones sugeridas para ruta ${routeId}`
      );

      return result.rows.map((row) => ({
        punto_actual: {
          id: row.punto_actual_id,
          coordenadas: { lng: parseFloat(row.lng), lat: parseFloat(row.lat) },
          orden: row.orden,
          tipo_punto: row.tipo_punto,
        },
        otra_ruta: {
          id: row.otra_ruta_id,
          nombre: row.otra_ruta_nombre,
          punto_id: row.otro_punto_id,
          coordenadas: {
            lng: parseFloat(row.otro_lng),
            lat: parseFloat(row.otro_lat),
          },
          orden: row.otro_orden,
          tipo_punto: row.otro_tipo,
        },
        distancia_metros: Math.round(parseFloat(row.distancia_metros)),
      }));
    } catch (error) {
      console.error("Error sugiriendo conexiones:", error);
      return [];
    }
  },

  // ANALIZAR RED DE RUTAS
  async analyzeRouteNetwork() {
    try {
      const sharedNodes = await this.getAllSharedNodes();

      const analysis = {
        total_nodos_compartidos: sharedNodes.length,
        nodos_por_rutas: {},
        ruta_mas_conectada: null,
        conexiones_totales: 0,
      };

      // Contar nodos por número de rutas
      sharedNodes.forEach((node) => {
        const numRutas = node.total_rutas;
        analysis.nodos_por_rutas[numRutas] =
          (analysis.nodos_por_rutas[numRutas] || 0) + 1;
        analysis.conexiones_totales += numRutas;
      });

      // Encontrar la ruta más conectada
      const routeConnections = {};
      sharedNodes.forEach((node) => {
        node.ids_rutas.forEach((routeId) => {
          routeConnections[routeId] = (routeConnections[routeId] || 0) + 1;
        });
      });

      if (Object.keys(routeConnections).length > 0) {
        const mostConnected = Object.entries(routeConnections).sort(
          ([, a], [, b]) => b - a
        )[0];

        analysis.ruta_mas_conectada = {
          id_ruta: mostConnected[0],
          conexiones: mostConnected[1],
        };
      }

      console.log("Análisis de red de rutas:", analysis);
      return analysis;
    } catch (error) {
      console.error("Error analizando red de rutas:", error);
      return null;
    }
  },
};

module.exports = RouteNodes;
