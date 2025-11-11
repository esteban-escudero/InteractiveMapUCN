// hooks/useRoutes.js
import { useState, useEffect, useCallback } from "react";
import { routeService } from "../../services/routeService";
import { SpatialUtils } from "../../utils/spatialUtils";

export const useRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [routeAnalytics, setRouteAnalytics] = useState(null);

  // CARGAR TODAS LAS RUTAS CON ANÁLISIS TURF
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

      // ENRIQUECER RUTAS CON DATOS TURF
      const routesWithTurfAnalysis = routesArray.map((route) => {
        try {
          let turfData = {
            distancia_turf: route.distancia || 0,
            tiempo_estimado_turf: route.tiempo_estimado || 0,
            puntos_count: 0,
            es_valida: false,
            bounding_box: null,
            centroide: null,
          };

          // ANALIZAR GEOMETRÍA CON TURF
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

          // ANALIZAR PUNTOS DE RUTA
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
            // MANTENER COMPATIBILIDAD CON CÓDIGO EXISTENTE
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

      setRoutes(routesWithTurfAnalysis);

      // CALCULAR ANALÍTICAS GLOBALES
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
  }, []);

  // CALCULAR ANALÍTICAS GLOBALES DE RUTAS
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
    } catch (error) {
      console.error("Error calculando analytics:", error);
    }
  }, []);

  // CREAR RUTA CON VALIDACIÓN TURF
  const createRoute = useCallback(
    async (routeData) => {
      setLoading(true);
      setError(null);

      try {
        console.log("Creando ruta con validación Turf...", routeData);

        // VALIDACIÓN PREVIA CON TURF
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

        // Recargar rutas para incluir análisis Turf
        await loadRoutes();

        console.log("Ruta creada exitosamente con Turf");
        return response;
      } catch (err) {
        const errorMessage = err.message || "Error creando ruta";
        console.error("Error en useRoutes.createRoute:", errorMessage);
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadRoutes]
  );

  // ACTUALIZAR RUTA CON VALIDACIÓN TURF
  const updateRoute = useCallback(
    async (routeId, routeData) => {
      setLoading(true);
      setError(null);

      try {
        console.log(`Actualizando ruta ${routeId} con Turf...`);

        // VALIDACIÓN TURF PARA ACTUALIZACIÓN
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

        // Actualizar estado local
        setRoutes((prev) =>
          prev.map((route) =>
            route.id === routeId ? { ...route, ...routeData } : route
          )
        );

        // Recalcular analytics
        await loadRoutes();

        console.log("Ruta actualizada con Turf");
        return response;
      } catch (err) {
        const errorMessage = err.message || "Error actualizando ruta";
        console.error("Error en useRoutes.updateRoute:", errorMessage);
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadRoutes]
  );

  // ELIMINAR RUTA
  const deleteRoute = useCallback(
    async (routeId) => {
      setLoading(true);
      setError(null);

      try {
        console.log(`Eliminando ruta ${routeId}...`);

        const response = await routeService.deleteRoute(routeId);

        // Actualizar estado local
        setRoutes((prev) => prev.filter((route) => route.id !== routeId));

        // Si la ruta eliminada estaba seleccionada, limpiar selección
        if (selectedRoute && selectedRoute.id === routeId) {
          setSelectedRoute(null);
        }

        // Recalcular analytics
        await loadRoutes();

        console.log("Ruta eliminada");
        return response;
      } catch (err) {
        const errorMessage = err.message || "Error eliminando ruta";
        console.error("Error en useRoutes.deleteRoute:", errorMessage);
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [selectedRoute, loadRoutes]
  );

  // CALCULAR RUTA ÓPTIMA ENTRE DOS PUNTOS
  const calculateOptimalRoute = useCallback(
    async (origen, destino, tipo_ruta = "peatonal") => {
      setLoading(true);
      setError(null);

      try {
        console.log("Calculando ruta óptima con Turf...", {
          origen,
          destino,
          tipo_ruta,
        });

        // VALIDAR PUNTOS CON TURF
        if (!origen || !destino) {
          throw new Error("Se requieren puntos de origen y destino");
        }

        // Validar que los puntos sean diferentes
        const distanciaDirecta = SpatialUtils.calculateDistance(
          origen,
          destino
        );
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
        console.error(
          "Error en useRoutes.calculateOptimalRoute:",
          errorMessage
        );
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ENCONTRAR RUTAS CERCANAS A UN PUNTO
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

  // OBTENER ESTADÍSTICAS DE RENDIMIENTO
  const getPerformanceStats = useCallback(() => {
    if (!routes.length) return null;

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
  }, [routes, routeAnalytics]);

  // CARGAR RUTAS AL INICIALIZAR
  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  return {
    // Estado
    routes,
    loading,
    error,
    selectedRoute,
    routeAnalytics,

    // Acciones
    loadRoutes,
    createRoute,
    updateRoute,
    deleteRoute,
    calculateOptimalRoute,
    findRoutesNearPoint,
    getPerformanceStats,

    // Selección
    setSelectedRoute,

    // Utilidades
    hasRoutes: routes.length > 0,
    isValidRoute: (route) => route && route.es_valida !== false,
    getRouteById: (id) => routes.find((route) => route.id === id),

    // Métricas Turf
    turfEnabled: true,
    turfVersion: "6.5.0",
  };
};

export default useRoutes;
