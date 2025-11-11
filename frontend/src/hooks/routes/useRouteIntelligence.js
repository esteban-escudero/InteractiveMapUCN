import { useCallback, useMemo, useEffect } from "react";
import { SpatialUtils } from "../../utils/spatialUtils";

//Función para calcular angulo entre tres puntos
const calculateAngle = (pointA, pointB, pointC) => {
  const vector1 = [pointA[0] - pointB[0], pointA[1] - pointB[1]];
  const vector2 = [pointC[0] - pointB[0], pointC[1] - pointB[1]];

  // Calcular el ángulo entre los dos vectores usando el producto punto
  const dotProduct = vector1[0] * vector2[0] + vector1[1] * vector2[1];
  const magnitude1 = Math.sqrt(vector1[0] ** 2 + vector1[1] ** 2);
  const magnitude2 = Math.sqrt(vector2[0] ** 2 + vector1[1] ** 2);

  // Evitar división por cero
  const cosine = dotProduct / (magnitude1 * magnitude2);
  const angle = Math.acos(Math.max(-1, Math.min(1, cosine))) * (180 / Math.PI);

  return angle;
};

//Funcion para encontrar el punto más cercano en una ruta
const findClosestPointOnRoute = (buildingCoords, routeCoordinates) => {
  let closestPoint = null;
  let minDistance = Infinity;
  let closestIndex = -1;

  // Recorrer las coordenadas de la ruta
  routeCoordinates.forEach((coord, index) => {
    const distance = SpatialUtils.calculateDistance(
      { lat: buildingCoords.lat, lng: buildingCoords.lng },
      { lat: coord[1], lng: coord[0] }
    );

    // Actualizar si es el punto más cercano hasta ahora
    if (distance < minDistance) {
      minDistance = distance;
      closestPoint = coord;
      closestIndex = index;
    }
  });
  return { point: closestPoint, distance: minDistance, index: closestIndex };
};

// Función para extraer segmento de ruta entre dos índices
const extractRouteSegment = (routeCoordinates, startIndex, endIndex) => {
  if (startIndex < endIndex) {
    return routeCoordinates.slice(startIndex, endIndex + 1);
  } else {
    return routeCoordinates.slice(endIndex, startIndex + 1).reverse();
  }
};

// Función para validar y limpiar coordenadas
const validateAndCleanCoordinates = (coordinates) => {
  if (!Array.isArray(coordinates)) return null;

  // Limpiar coordenadas
  const cleaned = coordinates
    .map((coord) => {
      if (!Array.isArray(coord) || coord.length < 2) return null;

      const [lng, lat] = coord;

      // Validar que sean números válidos
      if (
        typeof lng !== "number" ||
        typeof lat !== "number" ||
        isNaN(lng) ||
        isNaN(lat)
      ) {
        return null;
      }

      // Validar rangos razonables
      if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        return null;
      }

      return [lng, lat];
    })
    .filter((coord) => coord !== null);

  return cleaned.length >= 2 ? cleaned : null;
};

export const useRouteIntelligence = (routes, buildings) => {
  // Construir grafos de edificios y conexiones
  const buildingGraphs = useMemo(() => {
    if (
      !buildings ||
      buildings.length === 0 ||
      !routes ||
      routes.length === 0
    ) {
      return {};
    }

    const graphs = {
      peatonal: {},
      accesible: {},
      emergencia: {},
      rapida: {},
      vehicular: {},
      default: {},
    };

    buildings.forEach((building) => {
      if (
        building.ubicacion &&
        building.ubicacion.type === "Point" &&
        building.ubicacion.coordinates &&
        building.ubicacion.coordinates.length === 2
      ) {
        const [lng, lat] = building.ubicacion.coordinates;
        const buildingKey = building.nombre;

        if (
          typeof lng === "number" &&
          typeof lat === "number" &&
          !isNaN(lng) &&
          !isNaN(lat)
        ) {
          // Agregar a todos los grafos
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

    console.log(
      `${Object.keys(graphs.peatonal).length} edificios agregados a los grafos`
    );

    // Conectar edificios en cada grafo segun tipo de ruta
    routes.forEach((route) => {
      if (
        !route.geometria?.coordinates ||
        route.geometria.coordinates.length < 2
      ) {
        console.log(`➖ Ruta "${route.nombre}" sin geometría válida`);
        return;
      }

      // Validar y limpiar coordenadas de la ruta
      const rawCoordinates = route.geometria.coordinates;
      const coordinates = validateAndCleanCoordinates(rawCoordinates);

      if (!coordinates || coordinates.length < 2) {
        console.log(
          `Ruta "${route.nombre}" sin coordenadas válidas después de limpieza`
        );
        return;
      }

      const routeType = route.tipo?.toLowerCase() || "default";
      const targetGraph = graphs[routeType] || graphs.default;

      // Función para encontrar el edificio más cercano a un punto dado
      const findClosestBuilding = (point, graph, maxDistance = 50) => {
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

      // Encontrar puntos estratégicos a lo largo de la ruta
      const strategicPoints = [];

      // Puntos inicial y final (siempre importantes)
      strategicPoints.push(coordinates[0]);
      strategicPoints.push(coordinates[coordinates.length - 1]);

      // Puntos intermedios estratégicos (cada 3-5 puntos o en cambios de dirección)
      const step = Math.max(1, Math.floor(coordinates.length / 5));
      for (let i = step; i < coordinates.length - 1; i += step) {
        strategicPoints.push(coordinates[i]);
      }

      // Puntos donde hay cambios significativos de dirección
      for (let i = 1; i < coordinates.length - 1; i++) {
        const prev = coordinates[i - 1];
        const curr = coordinates[i];
        const next = coordinates[i + 1];

        const angle = calculateAngle(prev, curr, next);
        // Si el ángulo es menor a 150°, es un cambio de dirección significativo
        if (angle < 150) {
          strategicPoints.push(curr);
        }
      }

      // ELIMINAR DUPLICADOS (puntos muy cercanos entre sí)
      const uniquePoints = [];
      strategicPoints.forEach((point) => {
        const isDuplicate = uniquePoints.some(
          (existingPoint) =>
            SpatialUtils.calculateDistance(
              { lat: point[1], lng: point[0] },
              { lat: existingPoint[1], lng: existingPoint[0] }
            ) < 15 // 15 metros
        );
        if (!isDuplicate) {
          uniquePoints.push(point);
        }
      });

      console.log(
        `Ruta "${route.nombre}": ${strategicPoints.length} puntos estratégicos → ${uniquePoints.length} puntos únicos`
      );

      // Conectar edificios entre puntos estratégicos
      const connectedBuildings = new Set();

      // Para cada punto estratégico, encontrar el edificio más cercano
      uniquePoints.forEach((point) => {
        const buildingInfo = findClosestBuilding(point, targetGraph, 50); // 50 metros de radio
        if (buildingInfo.building) {
          connectedBuildings.add(buildingInfo.building);
        }
      });

      const buildingArray = Array.from(connectedBuildings);

      // Crear conexiones entre todos los edificios encontrados
      if (buildingArray.length >= 2) {
        // Conectar cada edificio con todos los demás en la lista
        for (let i = 0; i < buildingArray.length; i++) {
          for (let j = i + 1; j < buildingArray.length; j++) {
            const buildingA = buildingArray[i];
            const buildingB = buildingArray[j];

            // Verificar que ambos edificios existan en el grafo
            if (!targetGraph[buildingA] || !targetGraph[buildingB]) {
              continue;
            }

            // Encontrar los puntos más cercanos para cada edificio
            const pointA = findClosestPointOnRoute(
              targetGraph[buildingA].coords,
              coordinates
            );
            const pointB = findClosestPointOnRoute(
              targetGraph[buildingB].coords,
              coordinates
            );

            // Extraer solo el segmento entre estos dos puntos
            const segmentCoordinates = extractRouteSegment(
              coordinates,
              pointA.index,
              pointB.index
            );

            // Validar segmento
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

            // Solo crear conexión si la distancia es válida y razonable
            if (segmentDistance > 0 && segmentDistance < 5000) {
              // Máximo 5km
              // Solo crear conexión si no existe ya o si esta es más corta
              const existingConnection =
                targetGraph[buildingA].connections[buildingB];
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
                  startIndex: Math.min(pointA.index, pointB.index),
                  endIndex: Math.max(pointA.index, pointB.index),
                };

                targetGraph[buildingB].connections[buildingA] = {
                  routeId: route.id,
                  distance: segmentDistance,
                  coordinates: validSegmentCoordinates.reverse(),
                  routeName: route.nombre,
                  routeType: routeType,
                  isSegment: true,
                  startIndex: Math.min(pointA.index, pointB.index),
                  endIndex: Math.max(pointA.index, pointB.index),
                };
              }
            }
          }
        }

        console.log(
          `Ruta "${route.nombre}" conecta ${buildingArray.length} edificios`
        );
      } else if (buildingArray.length === 1) {
        console.log(
          `Ruta "${route.nombre}" encontró solo 1 edificio:`,
          buildingArray[0]
        );
      } else {
        console.log(`Ruta "${route.nombre}" no encontró edificios cercanos`);
      }
    });

    // Reportar resumen de grafos
    console.log("Construccion de grafos completa:", {
      totalBuildings: Object.keys(graphs.peatonal).length,
      graphs: Object.keys(graphs).map((type) => ({
        type,
        buildings: Object.keys(graphs[type]).length,
        connections: Object.keys(graphs[type]).reduce(
          (sum, b) => sum + Object.keys(graphs[type][b].connections).length,
          0
        ),
      })),
    });

    return graphs;
  }, [buildings, routes]);

  // Algoritmo de Dijkstra para ruta más corta
  const findShortestPathInGraph = useCallback(
    (graph, startBuilding, endBuilding) => {
      if (!graph[startBuilding] || !graph[endBuilding]) {
        console.log(`❌ No graph data for ${startBuilding} or ${endBuilding}`);
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

      distances[startBuilding] = 0;

      // Algoritmo Dijkstra
      while (unvisited.size > 0) {
        let current = null;
        for (const building of unvisited) {
          if (current === null || distances[building] < distances[current]) {
            current = building;
          }
        }

        if (current === null || distances[current] === Infinity) break;
        if (current === endBuilding) break;

        unvisited.delete(current);

        // Explorar conexiones
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
      let current = endBuilding;

      while (previous[current]) {
        path.unshift(previous[current].connection);
        current = previous[current].from;
      }

      const result = {
        path: path,
        totalDistance: distances[endBuilding],
        isValid: path.length > 0 && distances[endBuilding] < Infinity,
      };

      console.log(
        `Resultado Dijkstra: ${result.isValid ? "Valido" : "No Valido"}`,
        {
          start: startBuilding,
          end: endBuilding,
          distance: result.totalDistance,
          segments: result.path.length,
        }
      );

      return result;
    },
    []
  );

  // Calcular ruta más corta para cada tipo
  const calculateShortestRoutesByType = useCallback(
    (origin, destination) => {
      console.log(`Calculando rutas por tipo: ${origin} → ${destination}`);

      const results = {};

      // Calcular ruta más corta para cada tipo de grafo
      Object.keys(buildingGraphs).forEach((routeType) => {
        const graph = buildingGraphs[routeType];

        if (!graph[origin] || !graph[destination]) {
          console.log(
            `Sin datos de grafo para ${routeType}: ${origin} o ${destination} no encontrado`
          );
          return;
        }

        console.log(`Calculando ruta ${routeType}...`);
        const shortestPath = findShortestPathInGraph(
          graph,
          origin,
          destination
        );

        if (shortestPath?.isValid) {
          results[routeType] = {
            segments: shortestPath.path.map((segment, index) => ({
              id: `${segment.routeId}-${index}-${Date.now()}`,
              nombre: `Segmento ${index + 1}: ${segment.routeName}`,
              geometria: {
                type: "LineString",
                coordinates: segment.coordinates || [],
              },
              distancia: segment.distance || 0,
              tiempo_estimado: Math.round((segment.distance || 0) / 80),
              routeId: segment.routeId,
              routeName: segment.routeName,
              routeType: segment.routeType,
              es_segmento: true,
              es_ruta_completa: false,
              segment_index: index,
              isSegment: segment.isSegment,
              startIndex: segment.startIndex,
              endIndex: segment.endIndex,
            })),
            totalDistance: shortestPath.totalDistance,
            estimatedTime: Math.round(shortestPath.totalDistance / 80),
            origin: origin,
            destination: destination,
            routeType: routeType,
          };

          console.log(`${routeType} ruta encontrada:`, {
            distance: shortestPath.totalDistance,
            segments: shortestPath.path.length,
            segmentsWithCoords: shortestPath.path.filter(
              (p) => p.coordinates && p.coordinates.length > 0
            ).length,
          });
        } else {
          console.log(
            `No se encontró ruta ${routeType} de ${origin} a ${destination}`
          );
        }
      });

      console.log("Resultados de cálculo de rutas:", {
        totalTypes: Object.keys(results).length,
        availableTypes: Object.keys(results),
      });

      return results;
    },
    [buildingGraphs, findShortestPathInGraph]
  );

  // OBTENER TODAS LAS RUTAS POSIBLES SEGÚN TIPO
  const getPrioritizedRoutes = useCallback(
    (origin, destination) => {
      if (!routes || routes.length === 0) {
        console.log("Sin rutas disponibles");
        return [];
      }

      if (!origin || !destination) {
        console.log("No origin/destination - mostrando todas las rutas");
        return routes;
      }

      console.log(
        `Obteniendo TODAS las rutas posibles para TODOS los tipos: ${origin} → ${destination}`
      );

      const shortestRoutesByType = calculateShortestRoutesByType(
        origin,
        destination
      );

      if (Object.keys(shortestRoutesByType).length === 0) {
        console.log("No se encontraron rutas para ningún tipo");
        return [];
      }

      const allPossibleRoutes = [];

      // Agregar rutas por tipo
      Object.keys(shortestRoutesByType).forEach((routeType) => {
        const routeData = shortestRoutesByType[routeType];

        if (!routeData.segments || routeData.segments.length === 0) {
          console.log(`Sin segmentos para ${routeType}`);
          return;
        }

        // Filtrar segmentos válidos
        const validSegments = routeData.segments.filter(
          (segment) =>
            segment.geometria?.coordinates &&
            segment.geometria.coordinates.length >= 2
        );

        if (validSegments.length === 0) {
          console.log(`❌ No valid segments with coordinates for ${routeType}`);
          return;
        }

        console.log(
          `✅ ${routeType} has ${validSegments.length} valid segments`
        );

        // Estrategia: Crear multiples opciones de ruta.

        // 1. Ruta Completa (todas las conexiones)
        const completeRouteCoordinates = [];
        validSegments.forEach((segment, index) => {
          if (
            segment.geometria?.coordinates &&
            segment.geometria.coordinates.length > 0
          ) {
            if (index === 0) {
              completeRouteCoordinates.push(...segment.geometria.coordinates);
            } else {
              completeRouteCoordinates.push(
                ...segment.geometria.coordinates.slice(1)
              );
            }
          }
        });

        if (completeRouteCoordinates.length >= 2) {
          const completeRoute = {
            id: `complete-${routeType}-${origin}-${destination}-${Date.now()}`,
            nombre: `Ruta Completa ${
              routeType.charAt(0).toUpperCase() + routeType.slice(1)
            }`,
            geometria: {
              type: "LineString",
              coordinates: completeRouteCoordinates,
            },
            distancia: routeData.totalDistance,
            tiempo_estimado: routeData.estimatedTime,
            tipo: routeType,
            es_ruta_completa: true,
            es_segmento: false,
            ruta_completa: routeData,
            segmentos_originales: validSegments.length,
            origen: origin,
            destino: destination,
            prioridad: "alta",
          };

          allPossibleRoutes.push(completeRoute);
          console.log(`Agregado ruta completa ${routeType}`);
        }

        // 2. Rutas por segmentos (opciones alternativas)
        validSegments.forEach((segment, segmentIndex) => {
          if (
            segment.geometria?.coordinates &&
            segment.geometria.coordinates.length >= 2
          ) {
            const segmentRoute = {
              id: `segment-${routeType}-${segmentIndex}-${origin}-${destination}-${Date.now()}`,
              nombre: `Segmento ${segmentIndex + 1} - ${
                routeType.charAt(0).toUpperCase() + routeType.slice(1)
              }`,
              geometria: {
                type: "LineString",
                coordinates: segment.geometria.coordinates,
              },
              distancia: segment.distance || 0,
              tiempo_estimado: Math.round((segment.distance || 0) / 80),
              tipo: routeType,
              es_ruta_completa: false,
              es_segmento: true,
              segmento_index: segmentIndex,
              segmento_total: validSegments.length,
              routeName: segment.routeName,
              origen: origin,
              destino: destination,
              prioridad: "media",
            };

            allPossibleRoutes.push(segmentRoute);
          }
        });

        // 3. Rutas Bombinadas (subconjuntos de segmentos)
        if (validSegments.length > 1) {
          for (let i = 0; i < validSegments.length - 1; i++) {
            const combinedSegments = validSegments.slice(0, i + 2);
            const combinedCoordinates = [];

            combinedSegments.forEach((segment, index) => {
              if (
                segment.geometria?.coordinates &&
                segment.geometria.coordinates.length > 0
              ) {
                if (index === 0) {
                  combinedCoordinates.push(...segment.geometria.coordinates);
                } else {
                  combinedCoordinates.push(
                    ...segment.geometria.coordinates.slice(1)
                  );
                }
              }
            });

            if (combinedCoordinates.length >= 2) {
              const combinedDistance = combinedSegments.reduce(
                (sum, seg) => sum + (seg.distance || 0),
                0
              );

              const combinedRoute = {
                id: `combined-${routeType}-${i}-${origin}-${destination}-${Date.now()}`,
                nombre: `Ruta Parcial ${
                  routeType.charAt(0).toUpperCase() + routeType.slice(1)
                } (${i + 2} segmentos)`,
                geometria: {
                  type: "LineString",
                  coordinates: combinedCoordinates,
                },
                distancia: combinedDistance,
                tiempo_estimado: Math.round(combinedDistance / 80),
                tipo: routeType,
                es_ruta_completa: false,
                es_segmento: false,
                es_combinada: true,
                segmentos_incluidos: i + 2,
                segmentos_totales: validSegments.length,
                origen: origin,
                destino: destination,
                prioridad: "media-alta",
              };

              allPossibleRoutes.push(combinedRoute);
            }
          }
        }
      });

      // Ordenar rutas por prioridad y distancia
      const prioritizedRoutes = allPossibleRoutes.sort((a, b) => {
        const priorityOrder = { alta: 0, "media-alta": 1, media: 2, baja: 3 };
        const priorityA = priorityOrder[a.prioridad] || 3;
        const priorityB = priorityOrder[b.prioridad] || 3;

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        return (a.distancia || 0) - (b.distancia || 0);
      });

      console.log("Todas las rutas posibles:", {
        totalRoutes: prioritizedRoutes.length,
        byType: Object.keys(shortestRoutesByType).reduce((acc, type) => {
          acc[type] = prioritizedRoutes.filter((r) => r.tipo === type).length;
          return acc;
        }, {}),
        byPriority: prioritizedRoutes.reduce((acc, route) => {
          acc[route.prioridad] = (acc[route.prioridad] || 0) + 1;
          return acc;
        }, {}),
      });

      prioritizedRoutes.forEach((route, index) => {
        console.log(`Route ${index}:`, {
          name: route.nombre,
          type: route.tipo,
          priority: route.prioridad,
          distance: route.distancia,
          segments:
            route.segmentos_originales || route.segmentos_incluidos || 1,
          isComplete: route.es_ruta_completa,
          isSegment: route.es_segmento,
          isCombined: route.es_combinada,
        });
      });

      return prioritizedRoutes;
    },
    [calculateShortestRoutesByType, routes]
  );

  return {
    calculateShortestRoutesByType,
    getPrioritizedRoutes,
    buildingGraphs,
    hasData: buildings.length > 0 && routes.length > 0,
  };
};
