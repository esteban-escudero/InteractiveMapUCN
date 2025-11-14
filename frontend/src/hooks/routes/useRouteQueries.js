/**
 * Hook para búsquedas y consultas de rutas
 */
import { useCallback } from "react";
import { routeService } from "../../services/routeService";
import { SpatialUtils } from "../../utils/spatialUtils";

export const useRouteQueries = (routes) => {
  /**
   * Calcular ruta óptima entre dos puntos
   */
  const calculateOptimalRoute = useCallback(
    async (origen, destino, tipo_ruta = "peatonal") => {
      try {
        console.log("Calculando ruta óptima con Turf...", {
          origen,
          destino,
          tipo_ruta,
        });

        // Validar puntos con Turf
        if (!origen || !destino) {
          throw new Error("Se requieren puntos de origen y destino");
        }

        // Validar que los puntos sean diferentes
        const distanciaDirecta = SpatialUtils.calculateDistance(origen, destino);
        if (distanciaDirecta < 10) {
          // 10 metros
          throw new Error(
            "Los puntos de origen y destino están demasiado cerca"
          );
        }

        // Usar el servicio del backend para cálculo de ruta
        const response = await routeService.calculateRoute(
          origen,
          destino,
          tipo_ruta
        );

        console.log("Ruta óptima calculada con Turf");
        return response;
      } catch (err) {
        const errorMessage = err.message || "Error calculando ruta óptima";
        console.error("Error en useRouteQueries.calculateOptimalRoute:", errorMessage);
        throw err;
      }
    },
    []
  );

  /**
   * Encontrar rutas cercanas a un punto
   */
  const findRoutesNearPoint = useCallback(
    (point, maxDistance = 100) => {
      try {
        if (!point || !point.lat || !point.lng) {
          console.warn("Punto inválido para búsqueda de rutas cercanas");
          return [];
        }

        const rutasCercanas = routes.filter((route) => {
          try {
            if (!route.geometria || !route.geometria.coordinates) return false;

            // Calcular distancia del punto a cada segmento de la ruta
            const coordinates = route.geometria.coordinates;
            let minDistance = Infinity;

            for (let i = 0; i < coordinates.length - 1; i++) {
              const segmentStart = {
                lng: coordinates[i][0],
                lat: coordinates[i][1],
              };
              const segmentEnd = {
                lng: coordinates[i + 1][0],
                lat: coordinates[i + 1][1],
              };

              // Calcular distancia del punto al segmento
              const distanceToSegment = SpatialUtils.calculateDistanceToLine(
                point,
                segmentStart,
                segmentEnd
              );

              if (distanceToSegment < minDistance) {
                minDistance = distanceToSegment;
              }
            }

            return minDistance <= maxDistance;
          } catch (error) {
            console.error(
              `Error calculando distancia a ruta ${route.nombre}:`,
              error
            );
            return false;
          }
        });

        console.log(
          `Encontradas ${rutasCercanas.length} rutas dentro de ${maxDistance}m`
        );
        return rutasCercanas;
      } catch (error) {
        console.error("Error en findRoutesNearPoint:", error);
        return [];
      }
    },
    [routes]
  );

  /**
   * Obtener ruta por ID
   */
  const getRouteById = useCallback(
    (id) => {
      return routes.find((route) => route.id === id);
    },
    [routes]
  );

  /**
   * Validar si una ruta es válida
   */
  const isValidRoute = useCallback((route) => {
    return route && route.es_valida !== false;
  }, []);

  return {
    calculateOptimalRoute,
    findRoutesNearPoint,
    getRouteById,
    isValidRoute,
  };
};

