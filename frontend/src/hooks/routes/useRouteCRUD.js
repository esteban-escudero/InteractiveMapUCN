/**
 * Hook para operaciones CRUD de rutas
 */
import { useState, useCallback } from "react";
import { routeService } from "../../services/routeService";
import { SpatialUtils } from "../../utils/spatialUtils";

export const useRouteCRUD = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Crear nueva ruta con validación Turf
   */
  const createRoute = useCallback(async (routeData) => {
    setLoading(true);
    setError(null);

    try {
      console.log("Creando ruta con validación Turf...", routeData);

      // Validación previa con Turf
      if (routeData.geometria && routeData.geometria.coordinates) {
        const coordinates = routeData.geometria.coordinates;

        // Validar geometría
        if (!SpatialUtils.isValidLineString(coordinates)) {
          throw new Error("La geometría de la ruta no es válida");
        }

        // Validar que tenga al menos 2 puntos
        if (coordinates.length < 2) {
          throw new Error("La ruta debe tener al menos 2 puntos");
        }

        // Calcular distancia con Turf si no viene
        if (!routeData.distancia) {
          routeData.distancia = Math.round(
            SpatialUtils.calculateRouteLength(coordinates)
          );
        }

        // Calcular tiempo estimado si no viene
        if (!routeData.tiempo_estimado) {
          routeData.tiempo_estimado = Math.round(routeData.distancia / 80);
        }
      }

      const response = await routeService.createRoute(routeData);
      console.log("Ruta creada exitosamente con Turf");
      return response;
    } catch (err) {
      const errorMessage = err.message || "Error creando ruta";
      console.error("Error en useRouteCRUD.createRoute:", errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar ruta existente con validación Turf
   */
  const updateRoute = useCallback(async (routeId, routeData) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`Actualizando ruta ${routeId} con Turf...`);

      // Validación Turf para actualización
      if (routeData.geometria && routeData.geometria.coordinates) {
        const coordinates = routeData.geometria.coordinates;

        if (!SpatialUtils.isValidLineString(coordinates)) {
          throw new Error("La geometría de la ruta no es válida");
        }

        // Recalcular métricas
        routeData.distancia = Math.round(
          SpatialUtils.calculateRouteLength(coordinates)
        );
        routeData.tiempo_estimado = Math.round(routeData.distancia / 80);
      }

      const response = await routeService.updateRoute(routeId, routeData);
      console.log("Ruta actualizada con Turf");
      return response;
    } catch (err) {
      const errorMessage = err.message || "Error actualizando ruta";
      console.error("Error en useRouteCRUD.updateRoute:", errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar ruta
   */
  const deleteRoute = useCallback(async (routeId) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`Eliminando ruta ${routeId}...`);
      const response = await routeService.deleteRoute(routeId);
      console.log("Ruta eliminada");
      return response;
    } catch (err) {
      const errorMessage = err.message || "Error eliminando ruta";
      console.error("Error en useRouteCRUD.deleteRoute:", errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createRoute,
    updateRoute,
    deleteRoute,
    loading,
    error,
  };
};

