// frontend/src/hooks/map/useMapEffects.js
import { useEffect } from "react";
import L from "leaflet";
import { UCN_COQUIMBO_BOUNDS } from "../../constants/mapConfig.js";

export const useMapEffects = (
  mapRef,
  mapInstance,
  isMapReady,
  mapInitialized,
  setMapInitialized,
  initializeMap,
  showUINotification,
  loadBuildings,
  loadRoutes,
  geoServerStatus,
  loadWFSData,
  buildings,
  routes,
  mapState,
  mapData,
  buildingGraphs
) => {
  // ========== CONFIGURACIÓN DE LEAFLET ==========
  useEffect(() => {
    // Configuración de íconos de Leaflet
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
  }, []);

  // ========== INICIALIZACIÓN DEL MAPA ==========
  useEffect(() => {
    if (!mapInitialized && mapRef.current && !mapInstance) {
      console.log("Inicializando mapa...");

      const initialize = () => {
        try {
          const initializedMap = initializeMap(UCN_COQUIMBO_BOUNDS);
          if (initializedMap) {
            setMapInitialized(true);
            console.log("Mapa inicializado exitosamente");
          }
        } catch (error) {
          console.error("Error inicializando mapa:", error);
          showUINotification("Error al inicializar el mapa", "error");
        }
      };

      const timer = setTimeout(initialize, 100);
      return () => clearTimeout(timer);
    }
  }, [mapInitialized, mapRef, initializeMap, mapInstance, showUINotification]);

  // ========== CARGA DE DATOS ==========
  useEffect(() => {
    if (isMapReady && mapInstance) {
      console.log("Mapa listo, cargando datos...");

      const loadData = async () => {
        try {
          await loadBuildings();
          await loadRoutes();

          if (geoServerStatus === "checking") {
            await loadWFSData(mapInstance, "edificio");
          }

          console.log("Datos cargados exitosamente:", {
            edificios: buildings.length,
            rutas: routes.length,
          });
        } catch (error) {
          console.error("Error cargando datos:", error);
          showUINotification("Error cargando datos del mapa", "error");
        }
      };

      loadData();
    }
  }, [
    isMapReady,
    mapInstance,
    geoServerStatus,
    loadWFSData,
    loadBuildings,
    loadRoutes,
    showUINotification,
    buildings.length,
    routes.length,
  ]);

  // ========== EFECTOS PARA ACTUALIZACIÓN DE UI ==========

  // ELIMINAR O COMENTAR ESTE EFECTO QUE CAUSA EL BUCLE INFINITO
  /*
  // Efecto para forzar actualización del BuildingList cuando cambian los filtros
  useEffect(() => {
    if (mapState.showBuildingList) {
      // Forzar re-render del BuildingList cerrando y abriendo
      mapState.handleCloseBuildingList();
      setTimeout(() => {
        mapState.handleManageBuildings();
      }, 100);
    }
  }, [
    mapState.filters.category,
    mapState.filters.origin,
    mapState.filters.destination,
    mapState.showBuildingList,
    mapState.handleCloseBuildingList,
    mapState.handleManageBuildings
  ]);
  */

  // ========== EFECTOS PARA DEBUG ==========

  // Debug detallado de rutas priorizadas cuando los filtros cambian
  useEffect(() => {
    if (mapState.filters.origin && mapState.filters.destination) {
      console.log("RUTAS PRIORITARIAS POR TIPO:", {
        origen: mapState.filters.origin,
        destino: mapState.filters.destination,
        totalRutas: mapData.prioritizedRoutes.length,
        tiposEncontrados: [
          ...new Set(mapData.prioritizedRoutes.map((r) => r.tipo)),
        ],
        detalles: mapData.prioritizedRoutes.map((r) => ({
          tipo: r.tipo,
          nombre: r.nombre,
          distancia: r.distancia,
          segmentos: r.segmentos_originales,
          prioridad: r.prioridad,
        })),
      });

      // Ejecutar diagnóstico después de un delay
      setTimeout(mapData.diagnoseRouteIssues, 1000);
    }
  }, [
    mapData.prioritizedRoutes,
    mapState.filters,
    mapData.diagnoseRouteIssues,
  ]);

  // DEBUG DEL GRAFO
  useEffect(() => {
    if (
      buildingGraphs &&
      mapState.filters.origin &&
      mapState.filters.destination
    ) {
      console.log("DEBUG COMPLETO DEL BUILDING GRAPH:", {
        totalGraphs: Object.keys(buildingGraphs).length,
        graphTypes: Object.keys(buildingGraphs),
        currentFilters: {
          origin: mapState.filters.origin,
          destination: mapState.filters.destination,
        },
        connectionStatus: Object.keys(buildingGraphs).map((graphType) => ({
          type: graphType,
          hasOrigin: !!buildingGraphs[graphType]?.[mapState.filters.origin],
          hasDestination:
            !!buildingGraphs[graphType]?.[mapState.filters.destination],
          originConnections: buildingGraphs[graphType]?.[
            mapState.filters.origin
          ]
            ? Object.keys(
                buildingGraphs[graphType][mapState.filters.origin]
                  .connections || {}
              )
            : [],
          destinationConnections: buildingGraphs[graphType]?.[
            mapState.filters.destination
          ]
            ? Object.keys(
                buildingGraphs[graphType][mapState.filters.destination]
                  .connections || {}
              )
            : [],
        })),
      });
    }
  }, [buildingGraphs, mapState.filters]);

  // VERIFICACIÓN DE DATOS
  useEffect(() => {
    mapData.verifyData();
  }, [mapData.verifyData]);

  return {};
};
