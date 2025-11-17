/**
 * Hook de Inteligencia de Rutas - MEJORADO
 * Implementa Dijkstra optimizado para redes de rutas por tipo
 */
import { useCallback, useMemo } from "react";
import { SpatialUtils } from "../../utils/spatialUtils";

// ========== UTILIDADES ==========

const calculateAngle = (pointA, pointB, pointC) => {
  const vector1 = [pointA[0] - pointB[0], pointA[1] - pointB[1]];
  const vector2 = [pointC[0] - pointB[0], pointC[1] - pointB[1]];
  const dotProduct = vector1[0] * vector2[0] + vector1[1] * vector2[1];
  const magnitude1 = Math.sqrt(vector1[0] ** 2 + vector1[1] ** 2);
  const magnitude2 = Math.sqrt(vector2[0] ** 2 + vector2[1] ** 2);

  const cosine = dotProduct / (magnitude1 * magnitude2);
  const angle = Math.acos(Math.max(-1, Math.min(1, cosine))) * (180 / Math.PI);

  return angle;
};

const findClosestPointOnRoute = (buildingCoords, routeCoordinates) => {
  let closestPoint = null;
  let minDistance = Infinity;
  let closestIndex = -1;

  routeCoordinates.forEach((coord, index) => {
    const distance = SpatialUtils.calculateDistance(
      { lat: buildingCoords.lat, lng: buildingCoords.lng },
      { lat: coord[1], lng: coord[0] }
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestPoint = coord;
      closestIndex = index;
    }
  });
  return { point: closestPoint, distance: minDistance, index: closestIndex };
};

const extractRouteSegment = (routeCoordinates, startIndex, endIndex) => {
  if (startIndex < endIndex) {
    return routeCoordinates.slice(startIndex, endIndex + 1);
  } else {
    return routeCoordinates.slice(endIndex, startIndex + 1).reverse();
  }
};

const validateAndCleanCoordinates = (coordinates) => {
  if (!Array.isArray(coordinates)) return null;

  const cleaned = coordinates
    .map((coord) => {
      if (!Array.isArray(coord) || coord.length < 2) return null;
      const [lng, lat] = coord;
      if (
        typeof lng !== "number" ||
        typeof lat !== "number" ||
        isNaN(lng) ||
        isNaN(lat)
      ) {
        return null;
      }
      if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        return null;
      }
      return [lng, lat];
    })
    .filter((coord) => coord !== null);

  return cleaned.length >= 2 ? cleaned : null;
};

// ========== HOOK PRINCIPAL ==========

export const useRouteIntelligence = (routes, buildings) => {
  // ========== CONSTRUCCIÓN DE GRAFOS POR TIPO ==========
  const buildingGraphs = useMemo(() => {
    if (!buildings?.length || !routes?.length) {
      console.log("⚠️ Sin edificios o rutas para construir grafo");
      return {};
    }

    console.log("🏗️ Construyendo grafos de rutas...");

    const graphs = {
      peatonal: {},
      accesible: {},
      emergencia: {},
      rapida: {},
      vehicular: {},
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

    console.log(`${Object.keys(graphs.peatonal).length} edificios en grafos`);

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

      // Encontrar edificio más cercano a un punto
      const findClosestBuilding = (point, graph, maxDistance = 100) => {
        let closestBuilding = null;
        let minDistance = Infinity;

        Object.keys(graph).forEach((buildingName) => {
          const building = graph[buildingName];
          const distance = SpatialUtils.calculateDistance(
            { lat: point[1], lng: point[0] },
            { lat: building.coords.lat, lng: building.coords.lng }
          );

          if (distance < minDistance && distance < maxDistance) {
            minDistance = distance;
            closestBuilding = buildingName;
          }
        });

        return { building: closestBuilding, distance: minDistance };
      };

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

        console.log(
          `  ✅ "${route.nombre}" (${routeType}): ${buildingArray.length} edificios conectados`
        );
      }
    });

    // Reportar estadísticas
    console.log("📊 Grafos construidos:");
    Object.keys(graphs).forEach((type) => {
      const buildingCount = Object.keys(graphs[type]).length;
      const connectionCount = Object.keys(graphs[type]).reduce(
        (sum, b) => sum + Object.keys(graphs[type][b].connections).length,
        0
      );
      if (connectionCount > 0) {
        console.log(
          `  ${type}: ${buildingCount} edificios, ${connectionCount} conexiones`
        );
      }
    });

    return graphs;
  }, [buildings, routes]);

  // ========== DIJKSTRA OPTIMIZADO ==========
  const findShortestPath = useCallback((graph, start, end) => {
    if (!graph[start] || !graph[end]) {
      console.log(`❌ No hay datos para ${start} o ${end}`);
      return null;
    }

    const distances = {};
    const previous = {};
    const unvisited = new Set();

    // Inicializar
    Object.keys(graph).forEach((building) => {
      distances[building] = Infinity;
      previous[building] = null;
      unvisited.add(building);
    });

    distances[start] = 0;

    // Dijkstra
    while (unvisited.size > 0) {
      let current = null;
      for (const building of unvisited) {
        if (current === null || distances[building] < distances[current]) {
          current = building;
        }
      }

      if (current === null || distances[current] === Infinity) break;
      if (current === end) break;

      unvisited.delete(current);

      for (const neighbor in graph[current].connections) {
        if (!unvisited.has(neighbor)) continue;

        const alt =
          distances[current] + graph[current].connections[neighbor].distance;

        if (alt < distances[neighbor]) {
          distances[neighbor] = alt;
          previous[neighbor] = {
            from: current,
            connection: graph[current].connections[neighbor],
          };
        }
      }
    }

    // Reconstruir camino
    const path = [];
    let current = end;

    while (previous[current]) {
      path.unshift(previous[current].connection);
      current = previous[current].from;
    }

    return {
      path,
      totalDistance: distances[end],
      isValid: path.length > 0 && distances[end] < Infinity,
    };
  }, []);

  // ========== CALCULAR TODAS LAS RUTAS POR TIPO ==========
  const getPrioritizedRoutes = useCallback(
    (origin, destination) => {
      if (!routes?.length) {
        console.log("❌ Sin rutas disponibles");
        return [];
      }

      if (!origin || !destination) {
        console.log("ℹ️ Sin filtros - mostrando todas las rutas");
        return routes;
      }

      console.log(`Calculando rutas: ${origin} → ${destination}`);

      const allCalculatedRoutes = [];

      // Calcular para cada tipo de ruta
      Object.keys(buildingGraphs).forEach((routeType) => {
        const graph = buildingGraphs[routeType];

        if (!graph[origin] || !graph[destination]) {
          console.log(`  ⚠️ ${routeType}: Sin grafo válido`);
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
              nombre: `Ruta ${
                routeType.charAt(0).toUpperCase() + routeType.slice(1)
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

            console.log(
              `  ✅ ${routeType}: ${Math.round(result.totalDistance)}m en ${
                result.path.length
              } segmentos`
            );
          }
        } else {
          console.log(`  ❌ ${routeType}: No se encontró ruta`);
        }
      });

      // Ordenar por distancia
      allCalculatedRoutes.sort((a, b) => a.distancia - b.distancia);

      console.log(`🎉 ${allCalculatedRoutes.length} rutas calculadas`);

      return allCalculatedRoutes;
    },
    [buildingGraphs, findShortestPath, routes]
  );

  return {
    getPrioritizedRoutes,
    buildingGraphs,
    hasData: buildings.length > 0 && routes.length > 0,
  };
};
