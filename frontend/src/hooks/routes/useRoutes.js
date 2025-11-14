/**
 * Hook principal para gestión de rutas
 * Combina CRUD, Analytics y Queries
 */
import { useState, useEffect, useCallback } from "react";
import { routeService } from "../../services/routeService";
import { useRouteCRUD } from "./useRouteCRUD";
import { useRouteAnalytics } from "./useRouteAnalytics";
import { useRouteQueries } from "./useRouteQueries";

export const useRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);

  // Hooks especializados
  const { createRoute: createRouteCRUD, updateRoute: updateRouteCRUD, deleteRoute: deleteRouteCRUD } = useRouteCRUD();
  const { calculateRouteAnalytics, enrichRoutesWithTurf, getPerformanceStats } = useRouteAnalytics();
  const { calculateOptimalRoute, findRoutesNearPoint, getRouteById, isValidRoute } = useRouteQueries(routes);

  /**
   * Cargar todas las rutas con análisis Turf
   */
  const loadRoutes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Cargando rutas con análisis Turf...");
      const response = await routeService.getAllRoutes();

      // Asegurar que sea un array
      const routesArray = Array.isArray(response)
        ? response
        : response.data
        ? response.data
        : [];

      console.log(`${routesArray.length} rutas recibidas del backend`);

      // Enriquecer rutas con datos Turf
      const routesWithTurfAnalysis = enrichRoutesWithTurf(routesArray);

      setRoutes(routesWithTurfAnalysis);

      // Calcular analytics globales
      calculateRouteAnalytics(routesWithTurfAnalysis);

      console.log(
        `${routesWithTurfAnalysis.length} rutas cargadas con análisis Turf`
      );
      return routesWithTurfAnalysis;
    } catch (err) {
      const errorMessage = err.message || "Error cargando rutas";
      console.error("Error en useRoutes.loadRoutes:", errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Funciones estables, no necesitan estar en dependencias

  /**
   * Crear ruta (wrapper que recarga después)
   */
  const createRoute = useCallback(
    async (routeData) => {
      const response = await createRouteCRUD(routeData);
      await loadRoutes(); // Recargar para incluir análisis Turf
      return response;
    },
    [createRouteCRUD, loadRoutes]
  );

  /**
   * Actualizar ruta (wrapper que recarga después)
   */
  const updateRoute = useCallback(
    async (routeId, routeData) => {
      const response = await updateRouteCRUD(routeId, routeData);

      // Actualizar estado local
      setRoutes((prev) =>
        prev.map((route) =>
          route.id === routeId ? { ...route, ...routeData } : route
        )
      );

      // Recalcular analytics
      await loadRoutes();

      return response;
    },
    [updateRouteCRUD, loadRoutes]
  );

  /**
   * Eliminar ruta (wrapper que recarga después)
   */
  const deleteRoute = useCallback(
    async (routeId) => {
      const response = await deleteRouteCRUD(routeId);

      // Actualizar estado local
      setRoutes((prev) => prev.filter((route) => route.id !== routeId));

      // Si la ruta eliminada estaba seleccionada, limpiar selección
      if (selectedRoute && selectedRoute.id === routeId) {
        setSelectedRoute(null);
      }

      // Recalcular analytics
      await loadRoutes();

      return response;
    },
    [deleteRouteCRUD, selectedRoute, loadRoutes]
  );

  // Cargar rutas al inicializar (solo una vez)
  useEffect(() => {
    loadRoutes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar al montar el componente

  return {
    // Estado
    routes,
    loading,
    error,
    selectedRoute,
    setSelectedRoute,

    // Acciones CRUD
    loadRoutes,
    createRoute,
    updateRoute,
    deleteRoute,

    // Queries
    calculateOptimalRoute,
    findRoutesNearPoint,
    getRouteById,
    isValidRoute,

    // Analytics
    getPerformanceStats,

    // Utilidades
    hasRoutes: routes.length > 0,

    // Métricas Turf
    turfEnabled: true,
    turfVersion: "6.5.0",
  };
};

export default useRoutes;
