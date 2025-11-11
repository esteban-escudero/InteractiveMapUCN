import { useCallback, useMemo, useEffect } from "react";
import { SpatialUtils } from "../utils/spatialUtils";

// FUNCIÓN PARA CALCULAR ÁNGULO ENTRE TRES PUNTOS (mover fuera del hook)
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

// FUNCIÓN PARA ENCONTRAR EL PUNTO MÁS CERCANO EN UNA RUTA
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

// FUNCIÓN PARA EXTRAER SEGMENTO DE RUTA ENTRE DOS PUNTOS
const extractRouteSegment = (routeCoordinates, startIndex, endIndex) => {
  if (startIndex < endIndex) {
    return routeCoordinates.slice(startIndex, endIndex + 1);
  } else {
    return routeCoordinates.slice(endIndex, startIndex + 1).reverse();
  }
};

export const useRouteIntelligence = (routes, buildings) => {
  // CONSTRUIR GRAFOS SEPARADOS POR TIPO DE RUTA
  const buildingGraphs = useMemo(() => {
    if (
      !buildings ||
      buildings.length === 0 ||
      !routes ||
      routes.length === 0
    ) {
      console.log("⏳ Esperando datos para construir grafos...");
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

    console.log("🏗️ Building graphs for different route types");

    // 1. AGREGAR TODOS LOS EDIFICIOS A CADA GRAFO
    buildings.forEach((building) => {
      if (
        building.ubicacion &&
        building.ubicacion.type === "Point" &&
        building.ubicacion.coordinates &&
        building.ubicacion.coordinates.length === 2
      ) {
        const [lng, lat] = building.ubicacion.coordinates;
        const buildingKey = building.nombre;

        // Agregar a todos los grafos
        Object.keys(graphs).forEach((graphType) => {
          graphs[graphType][buildingKey] = {
            coords: { lng, lat },
            connections: {},
            buildingData: building,
          };
        });
      }
    });

    // 2. CONECTAR EDIFICIOS EN CADA GRAFO SEGÚN TIPO DE RUTA
    routes.forEach((route) => {
      if (
        !route.geometria?.coordinates ||
        route.geometria.coordinates.length < 2
      ) {
        return;
      }

      const coordinates = route.geometria.coordinates;
      const routeType = route.tipo?.toLowerCase() || "default";
      const targetGraph = graphs[routeType] || graphs.default;

      // ESTRATEGIA MEJORADA: Conectar edificios cercanos a TODOS los vértices importantes
      const findClosestBuilding = (point, graph, maxDistance = 30) => {
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

      // ENCONTRAR EDIFICIOS CERCANOS A VÉRTICES ESTRATÉGICOS
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
            ) < 10 // 10 metros
        );
        if (!isDuplicate) {
          uniquePoints.push(point);
        }
      });

      console.log(
        `🔄 Route "${route.nombre}": ${strategicPoints.length} strategic points → ${uniquePoints.length} unique points`
      );

      // CONECTAR EDIFICIOS ENTRE PUNTOS ESTRATÉGICOS
      const connectedBuildings = new Set();

      // Para cada punto estratégico, encontrar el edificio más cercano
      uniquePoints.forEach((point) => {
        const buildingInfo = findClosestBuilding(point, targetGraph, 30); // 30 metros de radio
        if (buildingInfo.building) {
          connectedBuildings.add(buildingInfo.building);
        }
      });

      const buildingArray = Array.from(connectedBuildings);

      // CREAR CONEXIONES ENTRE TODOS LOS EDIFICIOS ENCONTRADOS
      if (buildingArray.length >= 2) {
        const distance =
          route.distancia_turf ||
          route.distancia ||
          SpatialUtils.calculateRouteLength(coordinates);

        // Conectar cada edificio con todos los demás en la lista
        for (let i = 0; i < buildingArray.length; i++) {
          for (let j = i + 1; j < buildingArray.length; j++) {
            const buildingA = buildingArray[i];
            const buildingB = buildingArray[j];

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

            const segmentDistance =
              SpatialUtils.calculateRouteLength(segmentCoordinates);

            // Solo crear conexión si no existe ya
            if (!targetGraph[buildingA].connections[buildingB]) {
              targetGraph[buildingA].connections[buildingB] = {
                routeId: route.id,
                distance: segmentDistance,
                coordinates: segmentCoordinates,
                routeName: route.nombre,
                routeType: routeType,
                isSegment: true,
                startIndex: Math.min(pointA.index, pointB.index),
                endIndex: Math.max(pointA.index, pointB.index),
              };

              targetGraph[buildingB].connections[buildingA] = {
                routeId: route.id,
                distance: segmentDistance,
                coordinates: segmentCoordinates.reverse(),
                routeName: route.nombre,
                routeType: routeType,
                isSegment: true,
                startIndex: Math.min(pointA.index, pointB.index),
                endIndex: Math.max(pointA.index, pointB.index),
              };
            }
          }
        }

        console.log(
          `🔗 Route "${route.nombre}" connected ${buildingArray.length} buildings with segments:`,
          buildingArray
        );
      } else if (buildingArray.length === 1) {
        console.log(
          `➖ Route "${route.nombre}" found only 1 building:`,
          buildingArray[0]
        );
      } else {
        console.log(`❌ Route "${route.nombre}" found no nearby buildings`);
      }
    });

    // 3. REPORTE DE GRAFOS CONSTRUIDOS
    console.log("📊 GRAPHS CONSTRUCTION COMPLETE:", {
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

  // ALGORITMO DIJKSTRA PARA UN GRAFO ESPECÍFICO
  const findShortestPathInGraph = useCallback(
    (graph, startBuilding, endBuilding) => {
      if (!graph[startBuilding] || !graph[endBuilding]) {
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

      return {
        path: path,
        totalDistance: distances[endBuilding],
        isValid: path.length > 0 && distances[endBuilding] < Infinity,
      };
    },
    []
  );

  // CALCULAR RUTA MÁS CORTA PARA CADA TIPO
  const calculateShortestRoutesByType = useCallback(
    (origin, destination) => {
      console.log(
        `🎯 Calculating shortest routes by type: ${origin} → ${destination}`
      );

      const results = {};

      // CALCULAR RUTA MÁS CORTA PARA CADA TIPO DE GRAFO
      Object.keys(buildingGraphs).forEach((routeType) => {
        const graph = buildingGraphs[routeType];

        if (!graph[origin] || !graph[destination]) {
          console.log(
            `➖ No graph data for ${routeType}: ${origin} or ${destination} not found`
          );
          return;
        }

        console.log(`🔍 Calculating ${routeType} route...`);
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
              // GARANTIZAR QUE TENGA GEOMETRÍA VÁLIDA
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

          console.log(`✅ ${routeType} route found:`, {
            distance: shortestPath.totalDistance,
            segments: shortestPath.path.length,
            segmentsWithCoords: shortestPath.path.filter(
              (p) => p.coordinates && p.coordinates.length > 0
            ).length,
          });
        } else {
          console.log(
            `❌ No ${routeType} route found from ${origin} to ${destination}`
          );
        }
      });

      console.log("📊 Route calculation results:", {
        totalTypes: Object.keys(results).length,
        availableTypes: Object.keys(results),
      });

      return results;
    },
    [buildingGraphs, findShortestPathInGraph]
  );

  // OBTENER RUTAS PRIORITARIAS DE TODOS LOS TIPOS
  const getPrioritizedRoutes = useCallback(
    (origin, destination) => {
      if (!routes || routes.length === 0) {
        return [];
      }

      if (!origin || !destination) {
        console.log("ℹ️ No origin/destination - showing all routes");
        return routes;
      }

      console.log(
        `🔍 Getting prioritized routes for all types: ${origin} → ${destination}`
      );

      const shortestRoutesByType = calculateShortestRoutesByType(
        origin,
        destination
      );
      const prioritizedRoutes = [];

      // AGREGAR SEGMENTOS INDIVIDUALES PRIMERO
      Object.keys(shortestRoutesByType).forEach((routeType) => {
        const routeData = shortestRoutesByType[routeType];

        if (!routeData.segments || routeData.segments.length === 0) {
          console.log(`➖ No segments for ${routeType}`);
          return;
        }

        // FILTRAR SEGMENTOS VÁLIDOS (CON COORDENADAS)
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

        // AGREGAR CADA SEGMENTO VÁLIDO
        validSegments.forEach((segment, index) => {
          const segmentRoute = {
            ...segment,
            // GARANTIZAR QUE TENGA EL TIPO CORRECTO
            tipo: routeType, // ← ESTA ES LA LÍNEA CLAVE
            es_ruta_completa: false,
            es_segmento: true,
            segment_index: index,
            total_segments: validSegments.length,
            // Información adicional para el tooltip
            origen: index === 0 ? origin : `Punto ${segment.startIndex}`,
            destino:
              index === validSegments.length - 1
                ? destination
                : `Punto ${segment.endIndex}`,
          };
          prioritizedRoutes.push(segmentRoute);
          console.log(`📌 Added segment ${index} for ${routeType}:`, {
            name: segmentRoute.nombre,
            type: segmentRoute.tipo, // ← VERIFICAR QUE TENGA TIPO
            coordinates: segmentRoute.geometria.coordinates.length,
          });
        });

        // CREAR RUTA COMPLETA SOLO SI HAY MÚLTIPLES SEGMENTOS VÁLIDOS
        if (validSegments.length > 1) {
          const allCoordinates = [];
          validSegments.forEach((segment, index) => {
            if (
              segment.geometria?.coordinates &&
              segment.geometria.coordinates.length > 0
            ) {
              if (index === 0) {
                allCoordinates.push(...segment.geometria.coordinates);
              } else {
                // Evitar duplicar puntos al unir segmentos
                allCoordinates.push(...segment.geometria.coordinates.slice(1));
              }
            }
          });

          if (allCoordinates.length >= 2) {
            const completeRoute = {
              id: `complete-route-${routeType}-${origin}-${destination}-${Date.now()}`,
              nombre: `Ruta ${
                routeType.charAt(0).toUpperCase() + routeType.slice(1)
              }: ${origin} → ${destination}`,
              geometria: {
                type: "LineString",
                coordinates: allCoordinates,
              },
              distancia: routeData.totalDistance,
              tiempo_estimado: routeData.estimatedTime,
              tipo: routeType, // ← GARANTIZAR TIPO EN RUTA COMPLETA
              es_ruta_completa: true,
              es_segmento: false,
              ruta_completa: routeData,
              segmentos_originales: validSegments.length,
              origen: origin,
              destino: destination,
            };

            console.log(`🎯 Created ${routeType} complete route:`, {
              name: completeRoute.nombre,
              type: completeRoute.tipo, // ← VERIFICAR TIPO
              points: completeRoute.geometria.coordinates.length,
              distance: completeRoute.distancia,
              segments: validSegments.length,
            });

            prioritizedRoutes.push(completeRoute);
          }
        } else if (validSegments.length === 1) {
          // Si solo hay un segmento, marcarlo como ruta completa también
          const singleSegment = validSegments[0];
          const completeRoute = {
            ...singleSegment,
            id: `complete-route-${routeType}-${origin}-${destination}-${Date.now()}`,
            nombre: `Ruta ${
              routeType.charAt(0).toUpperCase() + routeType.slice(1)
            }: ${origin} → ${destination}`,
            tipo: routeType, // ← GARANTIZAR TIPO EN RUTA ÚNICA
            es_ruta_completa: true,
            es_segmento: false,
            origen: origin,
            destino: destination,
          };
          prioritizedRoutes.push(completeRoute);
          console.log(
            `🔄 Single segment marked as complete route for ${routeType}`
          );
        }
      });

      console.log("✅ Final prioritized routes:", {
        total: prioritizedRoutes.length,
        complete: prioritizedRoutes.filter((r) => r.es_ruta_completa).length,
        segments: prioritizedRoutes.filter((r) => r.es_segmento).length,
        types: [...new Set(prioritizedRoutes.map((r) => r.tipo))],
        routesWithGeometry: prioritizedRoutes.filter(
          (r) => r.geometria?.coordinates
        ).length,
        routesWithType: prioritizedRoutes.filter((r) => r.tipo).length, // ← NUEVO DEBUG
      });

      // DEBUG DETALLADO DE CADA RUTA - VERIFICAR TIPOS
      prioritizedRoutes.forEach((route, index) => {
        console.log(`Route ${index}:`, {
          name: route.nombre,
          type: route.tipo, // ← VERIFICAR QUE TENGA TIPO
          hasType: !!route.tipo, // ← NUEVO
          hasGeometry: !!route.geometria,
          coordinates: route.geometria?.coordinates?.length || 0,
          isComplete: route.es_ruta_completa,
          isSegment: route.es_segmento,
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
