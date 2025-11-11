const ProximityService = require("../services/proximityService");

const proximityController = {
  /**
   * Obtener ruta más cercana para un edificio
   */
  getClosestRoute: async (req, res) => {
    try {
      const { buildingId } = req.params;

      console.log(`Solicitando ruta más cercana para edificio: ${buildingId}`);

      const result = await ProximityService.findClosestRouteToBuilding(
        buildingId
      );

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "No se encontraron rutas cercanas al edificio",
        });
      }

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error en proximityController.getClosestRoute:", error);
      res.status(500).json({
        success: false,
        message: "Error al buscar ruta más cercana",
        error: error.message,
      });
    }
  },

  /**
   * Obtener rutas cercanas a un edificio dentro de un radio
   */
  getRoutesInRadius: async (req, res) => {
    try {
      const { buildingId } = req.params;
      const { radius = 100 } = req.query;

      console.log(
        `Buscando rutas dentro de ${radius}m del edificio ${buildingId}`
      );

      const routes = await ProximityService.findRoutesInRadius(
        buildingId,
        parseInt(radius)
      );

      res.json({
        success: true,
        data: {
          buildingId: parseInt(buildingId),
          radius: parseInt(radius),
          routes: routes,
          count: routes.length,
        },
      });
    } catch (error) {
      console.error("Error en proximityController.getRoutesInRadius:", error);
      res.status(500).json({
        success: false,
        message: "Error al buscar rutas cercanas",
        error: error.message,
      });
    }
  },

  /**
   * Obtener edificio más cercano a una ruta
   */
  getClosestBuilding: async (req, res) => {
    try {
      const { routeId } = req.params;

      console.log(`Buscando edificio más cercano a ruta: ${routeId}`);

      const result = await ProximityService.findClosestBuildingToRoute(routeId);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "No se encontraron edificios cercanos a la ruta",
        });
      }

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Error en proximityController.getClosestBuilding:", error);
      res.status(500).json({
        success: false,
        message: "Error al buscar edificio más cercano",
        error: error.message,
      });
    }
  },

  /**
   * Asignar rutas a múltiples edificios
   */
  assignRoutesToBuildings: async (req, res) => {
    try {
      const { buildingIds } = req.body;

      if (!buildingIds || !Array.isArray(buildingIds)) {
        return res.status(400).json({
          success: false,
          message: "Se requiere un array de buildingIds",
        });
      }

      console.log(`Asignando rutas a ${buildingIds.length} edificios`);

      const assignments = await ProximityService.assignRoutesToBuildings(
        buildingIds
      );

      res.json({
        success: true,
        data: {
          assignments: assignments,
          total: assignments.length,
        },
      });
    } catch (error) {
      console.error(
        "Error en proximityController.assignRoutesToBuildings:",
        error
      );
      res.status(500).json({
        success: false,
        message: "Error al asignar rutas a edificios",
        error: error.message,
      });
    }
  },

  /**
   * Encontrar rutas que conectan dos edificios
   */
  getConnectingRoutes: async (req, res) => {
    try {
      const { originId, destinationId } = req.params;

      console.log(
        `Buscando rutas que conectan edificios ${originId} y ${destinationId}`
      );

      const routes = await ProximityService.findConnectingRoutes(
        originId,
        destinationId
      );

      res.json({
        success: true,
        data: {
          originBuildingId: parseInt(originId),
          destinationBuildingId: parseInt(destinationId),
          connectingRoutes: routes,
          count: routes.length,
        },
      });
    } catch (error) {
      console.error("Error en proximityController.getConnectingRoutes:", error);
      res.status(500).json({
        success: false,
        message: "Error al buscar rutas conectivas",
        error: error.message,
      });
    }
  },

  /**
   * Análisis de proximidad general
   */
  getProximityAnalysis: async (req, res) => {
    try {
      const { buildingId } = req.params;

      console.log(
        `Realizando análisis de proximidad para edificio: ${buildingId}`
      );

      // Obtener rutas cercanas en diferentes radios
      const [routes50m, routes100m, closestRoute] = await Promise.all([
        ProximityService.findRoutesInRadius(buildingId, 50),
        ProximityService.findRoutesInRadius(buildingId, 100),
        ProximityService.findClosestRouteToBuilding(buildingId),
      ]);

      res.json({
        success: true,
        data: {
          buildingId: parseInt(buildingId),
          closestRoute: closestRoute,
          routesIn50m: routes50m,
          routesIn100m: routes100m,
          summary: {
            totalRoutes50m: routes50m.length,
            totalRoutes100m: routes100m.length,
            hasCloseRoutes: routes50m.length > 0,
            hasNearbyRoutes: routes100m.length > 0,
          },
        },
      });
    } catch (error) {
      console.error(
        "Error en proximityController.getProximityAnalysis:",
        error
      );
      res.status(500).json({
        success: false,
        message: "Error en análisis de proximidad",
        error: error.message,
      });
    }
  },
};

module.exports = proximityController;
