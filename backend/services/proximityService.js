const pool = require("../config/database");

class ProximityService {
  /**
   * Encuentra la ruta más cercana a un edificio usando PostGIS
   * @param {Object} building - Edificio con ubicación
   * @returns {Object} - Ruta más cercana y distancia
   */
  static async findClosestRouteToBuilding(buildingId) {
    try {
      console.log(`Buscando ruta más cercana para edificio ID: ${buildingId}`);

      const query = `
        WITH building_location AS (
          SELECT ubicacion as geom
          FROM edificio 
          WHERE id_edificio = $1
        ),
        closest_route AS (
          SELECT 
            r.id_ruta as id,
            r.nombre_ruta as nombre,
            r.tipo_ruta as tipo,
            ST_Distance(
              r.geometria_ruta::geography,
              (SELECT geom FROM building_location)::geography
            ) as distancia_metros,
            ST_AsGeoJSON(r.geometria_ruta) as geometria_geojson
          FROM ruta r
          WHERE r.geometria_ruta IS NOT NULL
          ORDER BY ST_Distance(
            r.geometria_ruta::geography,
            (SELECT geom FROM building_location)::geography
          )
          LIMIT 1
        )
        SELECT * FROM closest_route
      `;

      const result = await pool.query(query, [buildingId]);

      if (result.rows.length === 0) {
        return null;
      }

      const routeData = result.rows[0];
      return {
        route: {
          id: routeData.id,
          nombre: routeData.nombre,
          tipo: routeData.tipo,
          geometria: routeData.geometria_geojson
            ? JSON.parse(routeData.geometria_geojson)
            : null,
        },
        distancia: Math.round(routeData.distancia_metros),
      };
    } catch (error) {
      console.error(
        "Error en ProximityService.findClosestRouteToBuilding:",
        error
      );
      throw error;
    }
  }

  /**
   * Encuentra todas las rutas dentro de un radio específico de un edificio
   * @param {number} buildingId - ID del edificio
   * @param {number} maxDistance - Radio máximo en metros
   * @returns {Array} - Rutas dentro del radio
   */
  static async findRoutesInRadius(buildingId, maxDistance = 100) {
    try {
      console.log(
        `Buscando rutas dentro de ${maxDistance}m del edificio ${buildingId}`
      );

      const query = `
        SELECT 
          r.id_ruta as id,
          r.nombre_ruta as nombre,
          r.tipo_ruta as tipo,
          ST_Distance(
            r.geometria_ruta::geography,
            e.ubicacion::geography
          ) as distancia_metros,
          ST_AsGeoJSON(r.geometria_ruta) as geometria_geojson
        FROM ruta r, edificio e
        WHERE e.id_edificio = $1
          AND r.geometria_ruta IS NOT NULL
          AND ST_DWithin(
            r.geometria_ruta::geography,
            e.ubicacion::geography,
            $2
          )
        ORDER BY distancia_metros
      `;

      const result = await pool.query(query, [buildingId, maxDistance]);

      return result.rows.map((row) => ({
        id: row.id,
        nombre: row.nombre,
        tipo: row.tipo,
        distancia: Math.round(row.distancia_metros),
        geometria: row.geometria_geojson
          ? JSON.parse(row.geometria_geojson)
          : null,
      }));
    } catch (error) {
      console.error("Error en ProximityService.findRoutesInRadius:", error);
      throw error;
    }
  }

  /**
   * Encuentra el edificio más cercano a una ruta
   * @param {number} routeId - ID de la ruta
   * @returns {Object} - Edificio más cercano y distancia
   */
  static async findClosestBuildingToRoute(routeId) {
    try {
      console.log(`Buscando edificio más cercano a ruta ID: ${routeId}`);

      const query = `
        SELECT 
          e.id_edificio as id,
          e.nombre,
          e.tipo,
          ST_Distance(
            e.ubicacion::geography,
            r.geometria_ruta::geography
          ) as distancia_metros
        FROM edificio e, ruta r
        WHERE r.id_ruta = $1
          AND r.geometria_ruta IS NOT NULL
        ORDER BY ST_Distance(
          e.ubicacion::geography,
          r.geometria_ruta::geography
        )
        LIMIT 1
      `;

      const result = await pool.query(query, [routeId]);

      if (result.rows.length === 0) {
        return null;
      }

      const buildingData = result.rows[0];
      return {
        building: {
          id: buildingData.id,
          nombre: buildingData.nombre,
          tipo: buildingData.tipo,
        },
        distancia: Math.round(buildingData.distancia_metros),
      };
    } catch (error) {
      console.error(
        "Error en ProximityService.findClosestBuildingToRoute:",
        error
      );
      throw error;
    }
  }

  /**
   * Asigna rutas a múltiples edificios basado en proximidad
   * @param {Array} buildingIds - IDs de edificios
   * @returns {Array} - Asignaciones de rutas
   */
  static async assignRoutesToBuildings(buildingIds) {
    try {
      console.log(`Asignando rutas a ${buildingIds.length} edificios`);

      const assignments = [];

      for (const buildingId of buildingIds) {
        const closestRoute = await this.findClosestRouteToBuilding(buildingId);

        assignments.push({
          buildingId: buildingId,
          closestRoute: closestRoute,
        });
      }

      return assignments;
    } catch (error) {
      console.error(
        "Error en ProximityService.assignRoutesToBuildings:",
        error
      );
      throw error;
    }
  }

  /**
   * Encuentra rutas que conectan dos edificios
   * @param {number} originBuildingId - ID edificio origen
   * @param {number} destinationBuildingId - ID edificio destino
   * @returns {Array} - Rutas que conectan los edificios
   */
  static async findConnectingRoutes(originBuildingId, destinationBuildingId) {
    try {
      console.log(
        `Buscando rutas que conectan edificios ${originBuildingId} y ${destinationBuildingId}`
      );

      const query = `
        WITH origin_building AS (
          SELECT ubicacion as geom FROM edificio WHERE id_edificio = $1
        ),
        destination_building AS (
          SELECT ubicacion as geom FROM edificio WHERE id_edificio = $2
        ),
        connecting_routes AS (
          SELECT 
            r.id_ruta as id,
            r.nombre_ruta as nombre,
            r.tipo_ruta as tipo,
            ST_Distance(r.geometria_ruta::geography, o.geom::geography) as distancia_origen,
            ST_Distance(r.geometria_ruta::geography, d.geom::geography) as distancia_destino,
            ST_Length(r.geometria_ruta::geography) as longitud_ruta,
            ST_AsGeoJSON(r.geometria_ruta) as geometria_geojson
          FROM ruta r, origin_building o, destination_building d
          WHERE r.geometria_ruta IS NOT NULL
            AND ST_DWithin(r.geometria_ruta::geography, o.geom::geography, 100)
            AND ST_DWithin(r.geometria_ruta::geography, d.geom::geography, 100)
          ORDER BY (ST_Distance(r.geometria_ruta::geography, o.geom::geography) + 
                   ST_Distance(r.geometria_ruta::geography, d.geom::geography))
        )
        SELECT * FROM connecting_routes
      `;

      const result = await pool.query(query, [
        originBuildingId,
        destinationBuildingId,
      ]);

      return result.rows.map((row) => ({
        id: row.id,
        nombre: row.nombre,
        tipo: row.tipo,
        distancia_origen: Math.round(row.distancia_origen),
        distancia_destino: Math.round(row.distancia_destino),
        longitud_ruta: Math.round(row.longitud_ruta),
        geometria: row.geometria_geojson
          ? JSON.parse(row.geometria_geojson)
          : null,
      }));
    } catch (error) {
      console.error("Error en ProximityService.findConnectingRoutes:", error);
      throw error;
    }
  }
}

module.exports = ProximityService;
