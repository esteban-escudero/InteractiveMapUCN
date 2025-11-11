import { api } from "./api";

export const proximityService = {
  /**
   * Obtener ruta más cercana a un edificio
   */
  async getClosestRoute(buildingId) {
    try {
      console.log(`Buscando ruta más cercana para edificio: ${buildingId}`);
      const response = await api.get(
        `/proximity/building/${buildingId}/closest-route`
      );
      return response.data;
    } catch (error) {
      console.error("Error en proximityService.getClosestRoute:", error);
      throw error;
    }
  },

  /**
   * Obtener rutas cercanas a un edificio dentro de un radio
   */
  async getRoutesInRadius(buildingId, radius = 100) {
    try {
      console.log(
        `Buscando rutas dentro de ${radius}m del edificio ${buildingId}`
      );
      const response = await api.get(
        `/proximity/building/${buildingId}/nearby-routes?radius=${radius}`
      );
      return response.data;
    } catch (error) {
      console.error("Error en proximityService.getRoutesInRadius:", error);
      throw error;
    }
  },

  /**
   * Obtener análisis completo de proximidad
   */
  async getProximityAnalysis(buildingId) {
    try {
      console.log(
        `Realizando análisis de proximidad para edificio: ${buildingId}`
      );
      const response = await api.get(
        `/proximity/building/${buildingId}/proximity-analysis`
      );
      return response.data;
    } catch (error) {
      console.error("Error en proximityService.getProximityAnalysis:", error);
      throw error;
    }
  },

  /**
   * Asignar rutas a múltiples edificios
   */
  async assignRoutesToBuildings(buildingIds) {
    try {
      console.log(`Asignando rutas a ${buildingIds.length} edificios`);
      const response = await api.post("/proximity/buildings/assign-routes", {
        buildingIds: buildingIds,
      });
      return response.data;
    } catch (error) {
      console.error(
        "Error en proximityService.assignRoutesToBuildings:",
        error
      );
      throw error;
    }
  },

  /**
   * Encontrar rutas que conectan dos edificios
   */
  async getConnectingRoutes(originId, destinationId) {
    try {
      console.log(
        `Buscando rutas que conectan edificios ${originId} y ${destinationId}`
      );
      const response = await api.get(
        `/proximity/connect/${originId}/${destinationId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error en proximityService.getConnectingRoutes:", error);
      throw error;
    }
  },

  /**
   * Obtener edificio más cercano a una ruta
   */
  async getClosestBuilding(routeId) {
    try {
      console.log(`Buscando edificio más cercano a ruta: ${routeId}`);
      const response = await api.get(
        `/proximity/route/${routeId}/closest-building`
      );
      return response.data;
    } catch (error) {
      console.error("Error en proximityService.getClosestBuilding:", error);
      throw error;
    }
  },
};
