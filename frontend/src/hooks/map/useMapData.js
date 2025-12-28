import { useMemo, useCallback } from "react";

export const useMapData = (
  mapState,
  buildings,
  routes,
  getPrioritizedRoutes,
  buildingGraphs,
  hasData
) => {
  // Validación de Filtros
  const filtersValid = useMemo(() => {
    return (
      mapState.filters.origin &&
      mapState.filters.destination &&
      buildings.some((b) => b.nombre === mapState.filters.origin) &&
      buildings.some((b) => b.nombre === mapState.filters.destination)
    );
  }, [mapState.filters, buildings]);

  // Rutas Priorizadas o Filtradas
  const prioritizedRoutes = useMemo(() => {
    // 🔥 NUEVO: Si hay origen, destino Y tipo de ruta, NO usar sistema antiguo
    // El nuevo sistema de Dijkstra se encarga de dibujar la ruta calculada
    if (
      mapState.filters.origin &&
      mapState.filters.destination &&
      mapState.filters.routeType
    ) {
      console.log("🎯 Usando nuevo sistema de cálculo de rutas (Dijkstra)");
      console.log("   No se dibujan rutas del sistema antiguo");
      return []; // No dibujar rutas del sistema antiguo
    }

    // 1. Si hay origen Y destino (SIN tipo): calcular ruta óptima con sistema antiguo
    if (mapState.filters.origin && mapState.filters.destination) {
      const getBuildingFromName = (buildingName) => {
        return buildings.find((b) => b.nombre === buildingName);
      };

      const originBuilding = getBuildingFromName(mapState.filters.origin);
      const destinationBuilding = getBuildingFromName(
        mapState.filters.destination
      );

      if (originBuilding && destinationBuilding) {
        console.log("Calculando rutas priorizadas entre:", {
          origin: originBuilding.nombre,
          destination: destinationBuilding.nombre,
        });

        try {
          const result = getPrioritizedRoutes(
            originBuilding.nombre,
            destinationBuilding.nombre
          );

          return result || [];
        } catch (error) {
          console.error("Error en getPrioritizedRoutes:", error);
          return routes;
        }
      }
    }

    // 2. Si SOLO hay filtro de tipo de ruta: mostrar todas las rutas de ese tipo
    if (
      mapState.filters.routeType &&
      !mapState.filters.origin &&
      !mapState.filters.destination
    ) {
      const filteredRoutes = routes.filter(
        (route) =>
          route.tipo &&
          route.tipo.toLowerCase() === mapState.filters.routeType.toLowerCase()
      );
      console.log(
        `Mostrando todas las rutas tipo "${mapState.filters.routeType}": ${filteredRoutes.length} rutas`
      );
      return filteredRoutes;
    }

    // 3. Sin filtros: mostrar todas las rutas
    return routes;

  }, [
    mapState.filters.origin,
    mapState.filters.destination,
    mapState.filters.routeType,
    getPrioritizedRoutes,
    routes,
    buildings,
  ]);

  // Diagnostico del Sistema
  const diagnoseRouteIssues = useCallback(() => {
    console.log("DIAGNÓSTICO DEL SISTEMA DE RUTAS:");

    // 1. Verificar datos de entrada
    console.log("1. DATOS DE ENTRADA:", {
      buildings: {
        total: buildings.length,
        withCoordinates: buildings.filter((b) => b.ubicacion?.coordinates)
          .length,
        sample: buildings.slice(0, 3).map((b) => ({
          name: b.nombre,
          coords: b.ubicacion?.coordinates,
        })),
      },
      routes: {
        total: routes.length,
        withGeometry: routes.filter((r) => r.geometria?.coordinates).length,
        types: [...new Set(routes.map((r) => r.tipo))],
        sample: routes.slice(0, 3).map((r) => ({
          name: r.nombre,
          type: r.tipo,
          coords: r.geometria?.coordinates?.length,
        })),
      },
    });

    // 2. Verificar filtros actuales
    console.log("2. FILTROS ACTUALES:", {
      origin: mapState.filters.origin,
      destination: mapState.filters.destination,
      routeType: mapState.filters.routeType,
      originExists: buildings.some((b) => b.nombre === mapState.filters.origin),
      destinationExists: buildings.some(
        (b) => b.nombre === mapState.filters.destination
      ),
      valid: filtersValid,
    });

    // 3. Verificar grafo
    if (buildingGraphs) {
      console.log("3. GRAFOS DE CONEXIONES:", {
        totalGraphs: Object.keys(buildingGraphs).length,
        graphTypes: Object.keys(buildingGraphs),
        sampleGraph: Object.keys(buildingGraphs)
          .slice(0, 1)
          .map((graphType) => ({
            type: graphType,
            nodes: Object.keys(buildingGraphs[graphType]).length,
            nodesWithConnections: Object.keys(buildingGraphs[graphType]).filter(
              (node) =>
                Object.keys(buildingGraphs[graphType][node]?.connections || {})
                  .length > 0
            ).length,
          })),
      });
    }

    // 4. Verificar rutas prioritarias
    console.log("4. RUTAS PRIORITARIAS:", {
      total: prioritizedRoutes.length,
      byType: prioritizedRoutes.reduce((acc, route) => {
        acc[route.tipo] = (acc[route.tipo] || 0) + 1;
        return acc;
      }, {}),
      byCategory: {
        complete: prioritizedRoutes.filter((r) => r.es_ruta_completa).length,
        combined: prioritizedRoutes.filter((r) => r.es_combinada).length,
        segments: prioritizedRoutes.filter((r) => r.es_segmento).length,
      },
    });
  }, [
    buildings,
    routes,
    mapState.filters,
    buildingGraphs,
    prioritizedRoutes,
    filtersValid,
  ]);

  // Verificacion de Datos
  const verifyData = useCallback(() => {
    console.log("VERIFICACIÓN DE DATOS EN MAP:", {
      edificios: {
        count: buildings.length,
        nombres: buildings.map((b) => b.nombre),
        conCoordenadas: buildings.filter((b) => b.ubicacion?.coordinates)
          .length,
      },
      rutas: {
        count: routes.length,
        nombres: routes.map((r) => r.nombre),
        conGeometria: routes.filter((r) => r.geometria?.coordinates).length,
        tipos: [...new Set(routes.map((r) => r.tipo))],
      },
      grafo: {
        disponible: !!buildingGraphs,
        tipos: buildingGraphs ? Object.keys(buildingGraphs) : [],
        tieneDatos: hasData,
      },
      filtros: {
        activos: !!mapState.filters.origin && !!mapState.filters.destination,
        routeType: mapState.filters.routeType,
        validos: filtersValid,
      },
    });
  }, [
    buildings,
    routes,
    buildingGraphs,
    hasData,
    mapState.filters,
    filtersValid,
  ]);

  return {
    filtersValid,
    prioritizedRoutes,
    diagnoseRouteIssues,
    verifyData,
  };
};
