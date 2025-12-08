/**
 * Hook para analytics y métricas de rutas
 */
import { useState, useCallback } from "react";
import { SpatialUtils } from "utils/spatialUtils";

export const useRouteAnalytics = () => {
  const [routeAnalytics, setRouteAnalytics] = useState(null);

  /**
   * Calcular analytics globales de rutas
   */
  const calculateRouteAnalytics = useCallback((routesData) => {
    try {
      if (!routesData || routesData.length === 0) {
        setRouteAnalytics(null);
        return;
      }

      const analytics = {
        total_rutas: routesData.length,
        total_distancia: 0,
        total_puntos: 0,
        rutas_por_tipo: {},
        rutas_validas: 0,
        rutas_invalidas: 0,
        distancia_promedio: 0,
        puntos_promedio: 0,
        distribucion_longitud: {
          cortas: 0, // < 100m
          medias: 0, // 100-500m
          largas: 0, // > 500m
        },
      };

      routesData.forEach((route) => {
        // Distancia total
        analytics.total_distancia += route.distancia_turf || 0;
        analytics.total_puntos += route.puntos_count || 0;

        // Conteo por tipo
        const tipo = route.tipo || "peatonal";
        analytics.rutas_por_tipo[tipo] =
          (analytics.rutas_por_tipo[tipo] || 0) + 1;

        // Validación
        if (route.es_valida) {
          analytics.rutas_validas++;
        } else {
          analytics.rutas_invalidas++;
        }

        // Distribución por longitud
        const distancia = route.distancia_turf || 0;
        if (distancia < 100) analytics.distribucion_longitud.cortas++;
        else if (distancia <= 500) analytics.distribucion_longitud.medias++;
        else analytics.distribucion_longitud.largas++;
      });

      // Cálculos promedios
      analytics.distancia_promedio = Math.round(
        analytics.total_distancia / analytics.total_rutas
      );
      analytics.puntos_promedio = (
        analytics.total_puntos / analytics.total_rutas
      ).toFixed(1);

      console.log("Analytics Turf calculadas:", analytics);
      setRouteAnalytics(analytics);
      return analytics;
    } catch (error) {
      console.error("Error calculando analytics:", error);
      return null;
    }
  }, []);

  /**
   * Obtener estadísticas de rendimiento
   */
  const getPerformanceStats = useCallback(
    (routes) => {
      if (!routes || routes.length === 0) return null;

      const stats = {
        total_rutas: routes.length,
        total_distancia: routeAnalytics?.total_distancia || 0,
        distancia_promedio: routeAnalytics?.distancia_promedio || 0,
        rutas_validas: routeAnalytics?.rutas_validas || 0,
        rutas_invalidas: routeAnalytics?.rutas_invalidas || 0,
        eficiencia_geometrica: 0,
      };

      // Calcular eficiencia geométrica (relación distancia directa vs real)
      let totalEficiencia = 0;
      let rutasConEficiencia = 0;

      routes.forEach((route) => {
        if (route.geometria && route.geometria.coordinates.length >= 2) {
          const coordinates = route.geometria.coordinates;
          const distanciaDirecta = SpatialUtils.calculateDistance(
            { lng: coordinates[0][0], lat: coordinates[0][1] },
            {
              lng: coordinates[coordinates.length - 1][0],
              lat: coordinates[coordinates.length - 1][1],
            }
          );

          if (distanciaDirecta > 0) {
            const eficiencia = (distanciaDirecta / route.distancia_turf) * 100;
            totalEficiencia += eficiencia;
            rutasConEficiencia++;
          }
        }
      });

      stats.eficiencia_geometrica =
        rutasConEficiencia > 0
          ? (totalEficiencia / rutasConEficiencia).toFixed(1)
          : 0;

      return stats;
    },
    [routeAnalytics]
  );

  /**
   * Enriquecer rutas con datos Turf
   */
  const enrichRoutesWithTurf = useCallback((routesArray) => {
    return routesArray.map((route) => {
      try {
        let turfData = {
          distancia_turf: route.distancia || 0,
          tiempo_estimado_turf: route.tiempo_estimado || 0,
          puntos_count: 0,
          es_valida: false,
          bounding_box: null,
          centroide: null,
        };

        // Analizar geometría con Turf
        if (route.geometria && route.geometria.coordinates) {
          const coordinates = route.geometria.coordinates;
          turfData.puntos_count = coordinates.length;

          if (coordinates.length >= 2) {
            // Calcular distancia real con Turf
            turfData.distancia_turf = Math.round(
              SpatialUtils.calculateRouteLength(coordinates)
            );

            // Calcular tiempo estimado (80m/min caminando)
            turfData.tiempo_estimado_turf = Math.round(
              turfData.distancia_turf / 80
            );

            // Validar geometría
            turfData.es_valida = SpatialUtils.isValidLineString(coordinates);

            // Calcular bounding box
            const points = coordinates.map((coord) => ({
              lng: coord[0],
              lat: coord[1],
            }));
            turfData.bounding_box = SpatialUtils.calculateBoundingBox(points);
            turfData.centroide = SpatialUtils.calculateCentroid(points);
          }
        }

        // Analizar puntos de ruta
        if (route.puntos_ruta && Array.isArray(route.puntos_ruta)) {
          turfData.puntos_count = route.puntos_ruta.length;

          // Calcular métricas de puntos
          const puntosInicio = route.puntos_ruta.filter(
            (p) => p.tipo_punto === "inicio"
          );
          const puntosFin = route.puntos_ruta.filter(
            (p) => p.tipo_punto === "fin"
          );
          const puntosIntermedios = route.puntos_ruta.filter(
            (p) => p.tipo_punto === "intermedio"
          );

          turfData.metricas_puntos = {
            inicio: puntosInicio.length,
            fin: puntosFin.length,
            intermedios: puntosIntermedios.length,
          };
        }

        return {
          ...route,
          ...turfData,
          // Mantener compatibilidad con código existente
          distancia: turfData.distancia_turf,
          tiempo_estimado: turfData.tiempo_estimado_turf,
        };
      } catch (turfError) {
        console.error(
          `Error en análisis Turf para ruta ${route.nombre}:`,
          turfError
        );
        return route; // Devolver ruta original si hay error
      }
    });
  }, []);

  return {
    routeAnalytics,
    calculateRouteAnalytics,
    getPerformanceStats,
    enrichRoutesWithTurf,
  };
};

