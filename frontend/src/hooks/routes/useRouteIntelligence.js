/**
 * Hook de Inteligencia de Rutas - REFACTORIZADO
 * Implementa Dijkstra optimizado para redes de rutas por tipo
 */
import { useCallback, useMemo } from "react";
import { SpatialUtils } from "../../utils/spatialUtils";
import {
  calculateAngle,
  findClosestPointOnRoute,
  extractRouteSegment,
  validateAndCleanCoordinates,
  findClosestBuilding,
} from "../../utils/routing/routeGeometry";
import { findShortestPath } from "../../utils/routing/graphAlgorithms";

export const useRouteIntelligence = (routes, buildings) => {
  // ========== CONSTRUCCIÓN DE GRAFOS POR TIPO ==========
  const buildingGraphs = useMemo(() => {
    if (!buildings?.length || !routes?.length) {
      return {};
    }

    const graphs = {
      peatonal: {},
      accesible: {},
      default: {},
    };

    // 1. Inicializar nodos (edificios)
    buildings.forEach((building) => {
      if (
        building.ubicacion?.type === "Point" &&
        building.ubicacion.coordinates?.length === 2
      ) {
        const [lng, lat] = building.ubicacion.coordinates;
        const buildingKey = building.nombre;

        if (
          typeof lng === "number" &&
          typeof lat === "number" &&
          !isNaN(lng) &&
          !isNaN(lat)
        ) {
          Object.keys(graphs).forEach((graphType) => {
            graphs[graphType][buildingKey] = {
              coords: { lng, lat },
              connections: {},
              buildingData: building,
            };
          });
        }
      }
    });

    // 2. Crear conexiones basadas en rutas
    routes.forEach((route) => {
      if (
        !route.geometria?.coordinates ||
        route.geometria.coordinates.length < 2
      ) {
        return;
      }

      const coordinates = validateAndCleanCoordinates(
        route.geometria.coordinates
      );
      if (!coordinates || coordinates.length < 2) return;

      const routeType = route.tipo?.toLowerCase() || "default";
      const targetGraph = graphs[routeType] || graphs.default;

      // Encontrar puntos estratégicos
      const strategicPoints = [];
      strategicPoints.push(coordinates[0]);
      strategicPoints.push(coordinates[coordinates.length - 1]);

      // Puntos intermedios
      const step = Math.max(1, Math.floor(coordinates.length / 5));
      for (let i = step; i < coordinates.length - 1; i += step) {
        strategicPoints.push(coordinates[i]);
      }

      // Puntos con cambio de dirección
      for (let i = 1; i < coordinates.length - 1; i++) {
        const angle = calculateAngle(
          coordinates[i - 1],
          coordinates[i],
          coordinates[i + 1]
        );
        if (angle < 150) {
          strategicPoints.push(coordinates[i]);
        }
      }

      // Eliminar duplicados
      const uniquePoints = [];
      strategicPoints.forEach((point) => {
        const isDuplicate = uniquePoints.some(
          (existingPoint) =>
            SpatialUtils.calculateDistance(
              { lat: point[1], lng: point[0] },
              { lat: existingPoint[1], lng: existingPoint[0] }
            ) < 15
        );
        if (!isDuplicate) {
          uniquePoints.push(point);
        }
      });

      // Conectar edificios
      const connectedBuildings = new Set();
      uniquePoints.forEach((point) => {
        const buildingInfo = findClosestBuilding(point, targetGraph, 100);
        if (buildingInfo.building) {
          connectedBuildings.add(buildingInfo.building);
        }
      });

      const buildingArray = Array.from(connectedBuildings);

      // Crear todas las conexiones posibles
      if (buildingArray.length >= 2) {
        for (let i = 0; i < buildingArray.length; i++) {
          for (let j = i + 1; j < buildingArray.length; j++) {
            const buildingA = buildingArray[i];
            const buildingB = buildingArray[j];

            if (!targetGraph[buildingA] || !targetGraph[buildingB]) continue;

            const pointA = findClosestPointOnRoute(
              targetGraph[buildingA].coords,
              coordinates
            );
            const pointB = findClosestPointOnRoute(
              targetGraph[buildingB].coords,
              coordinates
            );

            const segmentCoordinates = extractRouteSegment(
              coordinates,
              pointA.index,
              pointB.index
            );

            const validSegmentCoordinates =
              validateAndCleanCoordinates(segmentCoordinates);

            if (
              !validSegmentCoordinates ||
              validSegmentCoordinates.length < 2
            ) {
              continue;
            }

            const segmentDistance = SpatialUtils.calculateRouteLength(
              validSegmentCoordinates
            );

            if (segmentDistance > 0 && segmentDistance < 5000) {
              const existingConnection =
                targetGraph[buildingA].connections[buildingB];

              // Solo guardar si es la conexión más corta
              if (
                !existingConnection ||
                segmentDistance < existingConnection.distance
              ) {
                targetGraph[buildingA].connections[buildingB] = {
                  routeId: route.id,
                  distance: segmentDistance,
                  coordinates: validSegmentCoordinates,
                  routeName: route.nombre,
                  routeType: routeType,
                  isSegment: true,
                };

                targetGraph[buildingB].connections[buildingA] = {
                  routeId: route.id,
                  distance: segmentDistance,
                  coordinates: [...validSegmentCoordinates].reverse(),
                  routeName: route.nombre,
                  routeType: routeType,
                  isSegment: true,
                };
              }
            }
          }
        }
      }
    });

    return graphs;
  }, [buildings, routes]);

  // ========== CALCULAR TODAS LAS RUTAS POR TIPO ==========
  const getPrioritizedRoutes = useCallback(
    (origin, destination) => {
      if (!routes?.length) {
        return [];
      }

      if (!origin || !destination) {
        return routes;
      }

      const allCalculatedRoutes = [];

      // Calcular para cada tipo de ruta
      Object.keys(buildingGraphs).forEach((routeType) => {
        const graph = buildingGraphs[routeType];

        if (!graph[origin] || !graph[destination]) {
          return;
        }

        const result = findShortestPath(graph, origin, destination);

        if (result?.isValid && result.path.length > 0) {
          // Crear ruta completa
          const completeCoordinates = [];
          result.path.forEach((segment, index) => {
            if (segment.coordinates?.length > 0) {
              if (index === 0) {
                completeCoordinates.push(...segment.coordinates);
              } else {
                completeCoordinates.push(...segment.coordinates.slice(1));
              }
            }
          });

          if (completeCoordinates.length >= 2) {
            allCalculatedRoutes.push({
              id: `calculated-${routeType}-${Date.now()}`,
              nombre: `Ruta ${routeType.charAt(0).toUpperCase() + routeType.slice(1)
                } Óptima`,
              tipo: routeType,
              geometria: {
                type: "LineString",
                coordinates: completeCoordinates,
              },
              distancia: Math.round(result.totalDistance),
              tiempo_estimado: Math.round(result.totalDistance / 80),
              prioridad: "alta",
              es_ruta_calculada: true,
              segmentos: result.path.length,
              origen: origin,
              destino: destination,
            });
          }
        }
      });

      // Ordenar por distancia
      allCalculatedRoutes.sort((a, b) => a.distancia - b.distancia);

      return allCalculatedRoutes;
    },
    [buildingGraphs, routes]
  );

  return {
    getPrioritizedRoutes,
    buildingGraphs,
    hasData: buildings.length > 0 && routes.length > 0,
  };
};
