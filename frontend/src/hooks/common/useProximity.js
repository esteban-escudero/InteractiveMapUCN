import { useState, useCallback } from "react";
import { proximityService } from "../../services/proximityService";

export const useProximity = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [proximityData, setProximityData] = useState(null);

  /**
   * Encontrar ruta más cercana a un edificio
   */
  const findClosestRoute = useCallback(async (buildingId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await proximityService.getClosestRoute(buildingId);
      setProximityData(response.data);
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Error buscando ruta cercana";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Encontrar rutas cercanas dentro de un radio
   */
  const findRoutesInRadius = useCallback(async (buildingId, radius = 100) => {
    setLoading(true);
    setError(null);

    try {
      const response = await proximityService.getRoutesInRadius(
        buildingId,
        radius
      );
      setProximityData(response.data);
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Error buscando rutas cercanas";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener análisis completo de proximidad
   */
  const getProximityAnalysis = useCallback(async (buildingId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await proximityService.getProximityAnalysis(buildingId);
      setProximityData(response.data);
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Error en análisis de proximidad";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Asignar rutas a múltiples edificios
   */
  const assignRoutesToBuildings = useCallback(async (buildingIds) => {
    setLoading(true);
    setError(null);

    try {
      const response = await proximityService.assignRoutesToBuildings(
        buildingIds
      );
      setProximityData(response.data);
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Error asignando rutas";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Encontrar rutas que conectan dos edificios
   */
  const findConnectingRoutes = useCallback(async (originId, destinationId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await proximityService.getConnectingRoutes(
        originId,
        destinationId
      );
      setProximityData(response.data);
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Error buscando rutas conectivas";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Limpiar datos de proximidad
   */
  const clearProximityData = useCallback(() => {
    setProximityData(null);
    setError(null);
  }, []);

  return {
    // Estado
    loading,
    error,
    proximityData,

    // Acciones
    findClosestRoute,
    findRoutesInRadius,
    getProximityAnalysis,
    assignRoutesToBuildings,
    findConnectingRoutes,
    clearProximityData,

    // Utilidades
    hasProximityData: proximityData !== null,
    isBuildingConnected: (buildingId) => {
      if (!proximityData) return false;
      return proximityData.closestRoute !== null;
    },
  };
};

export default useProximity;
