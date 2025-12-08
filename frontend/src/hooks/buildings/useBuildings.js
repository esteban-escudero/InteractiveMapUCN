// hooks/buildings/useBuildings.js - REFACTORIZADO
import { useState, useEffect, useCallback } from "react";
import { buildingService } from "services/buildingService";
import { SpatialUtils } from "utils/spatialUtils";
import {
  enrichBuildingWithTurf,
  calculateBuildingAnalytics,
  calculateDensityStats,
} from "utils/buildings/buildingAnalytics";
import {
  findBuildingsNearPoint,
  isValidBuilding,
  getBuildingById,
} from "utils/buildings/buildingQueries";

export const useBuildings = () => {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState("checking");
  const [buildingAnalytics, setBuildingAnalytics] = useState(null);

  // CARGAR EDIFICIOS CON ANÁLISIS TURF
  const loadBuildings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await buildingService.getAllBuildings();

      // Asegurar que sea un array
      const buildingsArray = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];

      // ENRIQUECER EDIFICIOS CON DATOS TURF (usando utilidad)
      const buildingsWithTurfAnalysis = buildingsArray.map(enrichBuildingWithTurf);

      setBuildings(buildingsWithTurfAnalysis);

      // CALCULAR ANALÍTICAS GLOBALES (usando utilidad)
      const analytics = calculateBuildingAnalytics(buildingsWithTurfAnalysis);
      setBuildingAnalytics(analytics);

      setBackendStatus("connected");
      return buildingsWithTurfAnalysis;
    } catch (err) {
      const errorMessage = err.message || "Error cargando edificios";
      console.error("Error en useBuildings.loadBuildings:", errorMessage);
      setError(errorMessage);
      setBackendStatus("error");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // CREAR EDIFICIO CON VALIDACIÓN TURF
  const createBuilding = useCallback(
    async (buildingData) => {
      setLoading(true);
      setError(null);

      try {
        // VALIDACIÓN PREVIA CON TURF
        if (buildingData.lat && buildingData.lng) {
          const campusBounds = [
            [-71.355622, -29.967316],
            [-71.346738, -29.967316],
            [-71.346738, -29.963208],
            [-71.355622, -29.963208],
            [-71.355622, -29.967316],
          ];

          const isValid = SpatialUtils.isPointInPolygon(
            buildingData.lat,
            buildingData.lng,
            campusBounds
          );

          if (!isValid) {
            console.warn("Edificio creado fuera de los límites del campus");
          }
        }

        const response = await buildingService.createBuilding(buildingData);

        // Recargar edificios para incluir análisis Turf
        await loadBuildings();

        return response;
      } catch (err) {
        const errorMessage = err.message || "Error creando edificio";
        console.error("Error en useBuildings.createBuilding:", errorMessage);
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadBuildings]
  );

  // ACTUALIZAR EDIFICIO
  const updateBuilding = useCallback(
    async (buildingId, buildingData) => {
      setLoading(true);
      setError(null);

      try {
        const response = await buildingService.updateBuilding(
          buildingId,
          buildingData
        );

        // Actualizar estado local
        setBuildings((prev) =>
          prev.map((building) =>
            building.id === buildingId
              ? { ...building, ...buildingData }
              : building
          )
        );

        // Recalcular analytics
        await loadBuildings();

        return response;
      } catch (err) {
        const errorMessage = err.message || "Error actualizando edificio";
        console.error("Error en useBuildings.updateBuilding:", errorMessage);
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadBuildings]
  );

  // ELIMINAR EDIFICIO
  const deleteBuilding = useCallback(
    async (buildingId) => {
      setLoading(true);
      setError(null);

      try {
        const response = await buildingService.deleteBuilding(buildingId);

        // Actualizar estado local
        setBuildings((prev) =>
          prev.filter((building) => building.id !== buildingId)
        );

        // Recalcular analytics
        await loadBuildings();

        return response;
      } catch (err) {
        const errorMessage = err.message || "Error eliminando edificio";
        console.error("Error en useBuildings.deleteBuilding:", errorMessage);
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadBuildings]
  );

  // SINCRONIZAR CON GEOSERVER
  const syncWithGeoServer = useCallback(
    async (geoServerData) => {
      setLoading(true);
      setError(null);

      try {
        const response = await buildingService.syncWithGeoServer(geoServerData);

        // Recargar edificios después de sincronización
        await loadBuildings();

        return response;
      } catch (err) {
        const errorMessage = err.message || "Error sincronizando con GeoServer";
        console.error("Error en useBuildings.syncWithGeoServer:", errorMessage);
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadBuildings]
  );

  // VERIFICAR SALUD DEL BACKEND
  const checkBackendHealth = useCallback(async () => {
    try {
      const response = await buildingService.checkHealth();
      setBackendStatus("connected");
      return response;
    } catch (err) {
      console.error("Backend no disponible:", err);
      setBackendStatus("error");
      throw err;
    }
  }, []);

  // OBTENER ESTADÍSTICAS DE DENSIDAD (usando utilidad)
  const getDensityStats = useCallback(() => {
    if (!buildings.length) return null;

    return calculateDensityStats(
      buildings.length,
      buildingAnalytics?.total_salas || 0,
      buildingAnalytics?.area_total || 0
    );
  }, [buildings, buildingAnalytics]);

  // CARGAR EDIFICIOS AL INICIALIZAR (solo una vez)
  useEffect(() => {
    loadBuildings();

    // Verificar salud del backend periódicamente
    const healthCheckInterval = setInterval(() => {
      checkBackendHealth().catch(() => { });
    }, 30000); // Cada 30 segundos

    return () => clearInterval(healthCheckInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar al montar el componente

  return {
    // Estado
    buildings,
    loading,
    error,
    backendStatus,
    buildingAnalytics,

    // Acciones CRUD
    loadBuildings,
    createBuilding,
    updateBuilding,
    deleteBuilding,
    syncWithGeoServer,
    checkBackendHealth,

    // Queries (usando utilidades)
    findBuildingsNearPoint: (point, maxDistance) =>
      findBuildingsNearPoint(buildings, point, maxDistance),
    getDensityStats,

    // Utilidades (usando utilidades)
    hasBuildings: buildings.length > 0,
    isValidBuilding,
    getBuildingById: (id) => getBuildingById(buildings, id),

    // Métricas Turf
    turfEnabled: true,
    turfVersion: "6.5.0",
  };
};

export default useBuildings;
