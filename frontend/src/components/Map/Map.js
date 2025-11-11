import React, { useEffect, useState, useCallback, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.css";
import { SpatialUtils } from "../../utils/spatialUtils";

// Hooks
import { useMap } from "../../hooks/useMap";
import { useBuildings } from "../../hooks/useBuildings";
import { useGeoServer } from "../../hooks/useGeoServer";
import { useMapManagement } from "../../hooks/useMapManagement";
import { useCoordinateManagement } from "../../hooks/useCoordinateManagement";
import { useMapOperations } from "../../hooks/useMapOperations";
import { useMapHandlers } from "../../hooks/useMapHandlers";
import { useMapClickHandler } from "../../hooks/useMapClickHandler";
import { useRouteUtils } from "../../hooks/useRouteUtils";
import { useBuildingFilters } from "../../hooks/useBuildingFilters";
import { useMapActions } from "../../hooks/useMapActions";
import useRoutes from "../../hooks/useRoutes";
import { useNotification } from "../../hooks/useNotification";
import { useConfirm } from "../../hooks/useConfirm";
import useProximity from "../../hooks/useProximity";
import { useRouteIntelligence } from "../../hooks/useRouteIntelligence";

// Componentes
import SidePanel from "../UI/SidePanel";
import BuildingForm from "../Forms/BuildingForm";
import BuildingList from "../UI/BuildingList/BuildingList";
import RoomManagement from "../UI/RoomManagement/RoomManagement";
import RouteFormWithNodes from "../Forms/RouteFormWithNodes";
import RouteLayer from "./RouteLayer";
import RouteList from "../UI/RouteList/RouteList";
import RouteNetwork from "../RouteNetwork/RouteNetwork";
import BuildingRenderer from "./BuildingRenderer";
import MapIndicators from "./MapIndicators";
import Notification from "../UI/Notification/Notification";
import ConfirmDialog from "../UI/ConfirmDialog/ConfirmDialog";

// Constantes y servicios
import { UCN_COQUIMBO_BOUNDS } from "../../constants/mapConfig";

// Componente principal del mapa
function Map() {
  const { mapRef, initializeMap, mapInstance, isMapReady } = useMap();
  const [mapInitialized, setMapInitialized] = useState(false);
  const { notification, showNotification, hideNotification } =
    useNotification();
  const { confirmState, showConfirm, hideConfirm, handleConfirm } =
    useConfirm();

  //Hooks de datos
  const {
    buildings,
    loading: buildingsLoading,
    error: buildingsError,
    backendStatus,
    syncWithGeoServer,
    loadBuildings,
    deleteBuilding,
  } = useBuildings();

  const {
    routes,
    loading: routesLoading,
    error: routesError,
    createRoute,
    updateRoute,
    deleteRoute,
    loadRoutes,
  } = useRoutes();

  const {
    status: geoServerStatus,
    features: geoServerFeatures,
    loadWFSData,
  } = useGeoServer();

  const {
    loading: proximityLoading,
    error: proximityError,
    proximityData,
    findClosestRoute,
    findRoutesInRadius,
    getProximityAnalysis,
  } = useProximity();

  // Hook de Inteligencia de Rutas
  const {
    getPrioritizedRoutes,
    buildingGraphs,
    calculateShortestRoutesByType,
    hasData,
  } = useRouteIntelligence(routes, buildings);

  // ========== HOOKS DE GESTIÓN DE ESTADO DEL MAPA ==========
  const mapManagement = useMapManagement();
  const { validateCoordinates, findNearestBuilding } =
    useMapOperations(buildings);
  const coordinateManagement = useCoordinateManagement(
    mapInstance,
    validateCoordinates,
    findNearestBuilding
  );
  const { filteredBuildings } = useBuildingFilters(
    buildings,
    mapManagement.filters
  );

  // ========== VALIDACIÓN DE FILTROS ==========
  const filtersValid = useMemo(() => {
    return (
      mapManagement.filters.origin &&
      mapManagement.filters.destination &&
      buildings.some((b) => b.nombre === mapManagement.filters.origin) &&
      buildings.some((b) => b.nombre === mapManagement.filters.destination)
    );
  }, [mapManagement.filters, buildings]);

  // ========== RUTAS PRIORIZADAS - VERSIÓN CORREGIDA ==========
  const prioritizedRoutes = useMemo(() => {
    // OBTENER EDIFICIOS COMPLETOS A PARTIR DE LOS NOMBRES
    const getBuildingFromName = (buildingName) => {
      return buildings.find((b) => b.nombre === buildingName);
    };

    const originBuilding = getBuildingFromName(mapManagement.filters.origin);
    const destinationBuilding = getBuildingFromName(
      mapManagement.filters.destination
    );

    if (originBuilding && destinationBuilding) {
      console.log("Calculando rutas priorizadas entre:", {
        origin: originBuilding.nombre,
        destination: destinationBuilding.nombre,
        originCoords: originBuilding.ubicacion?.coordinates,
        destinationCoords: destinationBuilding.ubicacion?.coordinates,
      });

      try {
        const result = getPrioritizedRoutes(
          originBuilding.nombre,
          destinationBuilding.nombre
        );

        console.log("Resultado del cálculo de rutas priorizadas:", {
          totalRoutes: result?.length || 0,
          routeTypes: result ? [...new Set(result.map((r) => r.tipo))] : [],
          completeRoutes: result
            ? result.filter((r) => r.es_ruta_completa).length
            : 0,
          segments: result ? result.filter((r) => r.es_segmento).length : 0,
          combinedRoutes: result
            ? result.filter((r) => r.es_combinada).length
            : 0,
        });

        // DEBUG DETALLADO DE CADA RUTA
        if (result && result.length > 0) {
          console.log("Detalle de rutas generadas:");
          result.forEach((route, index) => {
            console.log(`Route ${index}:`, {
              name: route.nombre,
              type: route.tipo,
              priority: route.prioridad,
              distance: route.distancia,
              isComplete: route.es_ruta_completa,
              isSegment: route.es_segmento,
              isCombined: route.es_combinada,
              coordinates: route.geometria?.coordinates?.length || 0,
              origin: route.origen,
              destination: route.destino,
            });
          });
        }

        return result || [];
      } catch (error) {
        console.error("Error en getPrioritizedRoutes:", error);
        return routes; // Fallback a todas las rutas
      }
    } else {
      // DEBUG de rutas disponibles
      if (routes.length > 0) {
        console.log(
          "Rutas Disponibles:",
          routes.map((r) => ({
            name: r.nombre,
            type: r.tipo,
            distance: r.distancia,
            coordinates: r.geometria?.coordinates?.length || 0,
          }))
        );
      }

      return routes;
    }
  }, [
    mapManagement.filters.origin,
    mapManagement.filters.destination,
    getPrioritizedRoutes,
    routes,
    buildings,
  ]);

  // ========== DIAGNÓSTICO DEL SISTEMA ==========
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
      origin: mapManagement.filters.origin,
      destination: mapManagement.filters.destination,
      originExists: buildings.some(
        (b) => b.nombre === mapManagement.filters.origin
      ),
      destinationExists: buildings.some(
        (b) => b.nombre === mapManagement.filters.destination
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
    mapManagement.filters,
    buildingGraphs,
    prioritizedRoutes,
    filtersValid,
  ]);

  // Debug detallado de rutas priorizadas cuando los filtros cambian
  useEffect(() => {
    if (mapManagement.filters.origin && mapManagement.filters.destination) {
      console.log("RUTAS PRIORITARIAS POR TIPO:", {
        origen: mapManagement.filters.origin,
        destino: mapManagement.filters.destination,
        totalRutas: prioritizedRoutes.length,
        tiposEncontrados: [...new Set(prioritizedRoutes.map((r) => r.tipo))],
        detalles: prioritizedRoutes.map((r) => ({
          tipo: r.tipo,
          nombre: r.nombre,
          distancia: r.distancia,
          segmentos: r.segmentos_originales,
          prioridad: r.prioridad,
        })),
      });

      // Ejecutar diagnóstico después de un delay
      setTimeout(diagnoseRouteIssues, 1000);
    }
  }, [prioritizedRoutes, mapManagement.filters, diagnoseRouteIssues]);

  // DEBUG DEL GRAFO
  useEffect(() => {
    if (
      buildingGraphs &&
      mapManagement.filters.origin &&
      mapManagement.filters.destination
    ) {
      console.log("DEBUG COMPLETO DEL BUILDING GRAPH:", {
        totalGraphs: Object.keys(buildingGraphs).length,
        graphTypes: Object.keys(buildingGraphs),
        currentFilters: {
          origin: mapManagement.filters.origin,
          destination: mapManagement.filters.destination,
        },
        connectionStatus: Object.keys(buildingGraphs).map((graphType) => ({
          type: graphType,
          hasOrigin:
            !!buildingGraphs[graphType]?.[mapManagement.filters.origin],
          hasDestination:
            !!buildingGraphs[graphType]?.[mapManagement.filters.destination],
          originConnections: buildingGraphs[graphType]?.[
            mapManagement.filters.origin
          ]
            ? Object.keys(
                buildingGraphs[graphType][mapManagement.filters.origin]
                  .connections || {}
              )
            : [],
          destinationConnections: buildingGraphs[graphType]?.[
            mapManagement.filters.destination
          ]
            ? Object.keys(
                buildingGraphs[graphType][mapManagement.filters.destination]
                  .connections || {}
              )
            : [],
        })),
      });
    }
  }, [buildingGraphs, mapManagement.filters]);

  // VERIFICACIÓN DE DATOS
  useEffect(() => {
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
        activos:
          !!mapManagement.filters.origin && !!mapManagement.filters.destination,
        validos: filtersValid,
      },
    });
  }, [
    buildings,
    routes,
    buildingGraphs,
    hasData,
    mapManagement.filters,
    filtersValid,
  ]);

  // ========== HANDLERS Y UTILITARIOS ==========
  const businessHandlers = useMapHandlers(
    showNotification,
    showConfirm,
    validateCoordinates,
    loadBuildings,
    loadRoutes,
    deleteBuilding,
    createRoute,
    updateRoute,
    deleteRoute,
    mapManagement,
    coordinateManagement,
    mapInstance
  );

  const { handleRouteClick } = useRouteUtils(mapInstance, mapManagement);

  const { handleLogout, handleSyncData, handleResetView } = useMapActions(
    mapInstance,
    showNotification,
    showConfirm,
    syncWithGeoServer,
    geoServerFeatures,
    loadBuildings
  );

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

  // Función para manejar clic en edificio con análisis de proximidad
  const handleBuildingClickWithProximity = useCallback(
    async (building) => {
      if (!building.id) return;

      try {
        showNotification({
          message: `Buscando ruta más cercana a ${building.nombre}...`,
          type: "info",
        });

        const analysis = await getProximityAnalysis(building.id);
        console.log(
          `Análisis de proximidad para ${building.nombre}:`,
          analysis
        );

        // Mostrar notificación con resultados
        if (analysis.closestRoute) {
          const { route, distancia } = analysis.closestRoute;
          showNotification({
            message: `Ruta más cercana: ${route.nombre} (${distancia}m)`,
            type: "success",
          });

          // Encontrar la ruta completa y seleccionarla
          const fullRoute = routes.find((r) => r.id === route.id);
          if (fullRoute && mapInstance) {
            mapManagement.setSelectedRoute(fullRoute);
            handleRouteClick(fullRoute);
          }
        } else {
          showNotification({
            message: "No se encontraron rutas cercanas a este edificio",
            type: "warning",
          });
        }
      } catch (error) {
        console.error("Error en análisis de proximidad:", error);
        showNotification({
          message: "Error al buscar rutas cercanas",
          type: "error",
        });
      }
    },
    [
      getProximityAnalysis,
      showNotification,
      routes,
      mapInstance,
      mapManagement,
      handleRouteClick,
    ]
  );

  // ========== EFFECTS ==========

  // Inicializar mapa
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
          showNotification({
            message: "Error al inicializar el mapa",
            type: "error",
          });
        }
      };

      const timer = setTimeout(initialize, 100);
      return () => clearTimeout(timer);
    }
  }, [mapInitialized, mapRef, initializeMap, mapInstance, showNotification]);

  // Cargar datos cuando el mapa esté listo
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
          showNotification({
            message: "Error cargando datos del mapa",
            type: "error",
          });
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
    showNotification,
    buildings.length,
    routes.length,
  ]);

  // ========== MANEJO DE INTERACCIONES DEL MAPA ==========
  useMapClickHandler(
    mapInstance,
    coordinateManagement,
    validateCoordinates,
    findNearestBuilding,
    mapManagement
  );

  // ========== RENDERIZADO ==========
  return (
    <div className="container">
      {/* PANEL LATERAL */}
      <SidePanel
        status={backendStatus === "connected" ? "success" : "error"}
        featuresCount={buildings.length}
        routesCount={routes.length}
        onLogout={handleLogout}
        onSyncData={handleSyncData}
        onResetView={handleResetView}
        buildingsLoading={buildingsLoading}
        backendStatus={backendStatus}
        geoServerStatus={geoServerStatus}
        geoServerFeaturesCount={geoServerFeatures.length}
        onAddBuilding={mapManagement.handleAddBuilding}
        onManageBuildings={mapManagement.handleManageBuildings}
        onToggleCoordinateDetection={
          coordinateManagement.toggleCoordinateDetection
        }
        coordinateDetectionActive={coordinateManagement.coordinateDetection}
        onAddRoute={mapManagement.handleAddRoute}
        onManageRoutes={mapManagement.handleManageRoutes}
        onToggleRouteNetwork={() =>
          mapManagement.setShowRouteNetwork(!mapManagement.showRouteNetwork)
        }
        routeNetworkActive={mapManagement.showRouteNetwork}
        originFilter={mapManagement.filters.origin}
        destinationFilter={mapManagement.filters.destination}
        categoryFilter={mapManagement.filters.category}
        onOriginFilterChange={(e) =>
          mapManagement.handleFilterChange("origin", e.target.value)
        }
        onDestinationFilterChange={(e) =>
          mapManagement.handleFilterChange("destination", e.target.value)
        }
        onCategoryFilterChange={(e) =>
          mapManagement.handleFilterChange("category", e.target.value)
        }
        onClearFilters={mapManagement.handleClearFilters}
        allBuildings={buildings}
        filteredBuildings={filteredBuildings}
        filtersValid={filtersValid}
      />

      {/* NOTIFICACIONES Y DIÁLOGOS */}
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
          duration={3000}
          position="top-right"
        />
      )}

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        type={confirmState.type}
        onConfirm={handleConfirm}
        onCancel={hideConfirm}
      />

      {/* FORMULARIOS */}
      <BuildingForm
        onSave={businessHandlers.handleSaveBuilding}
        onCancel={() => {
          mapManagement.setShowBuildingForm(false);
          mapManagement.setEditingBuilding(null);
          coordinateManagement.clearCapturedCoords();
        }}
        isVisible={mapManagement.showBuildingForm}
        building={mapManagement.editingBuilding}
        isEditing={!!mapManagement.editingBuilding}
        capturedCoordinates={coordinateManagement.capturedCoords}
        onClearCoordinates={coordinateManagement.clearCapturedCoords}
        onToggleCoordinateDetection={
          coordinateManagement.toggleCoordinateDetection
        }
      />

      <RouteFormWithNodes
        onSave={businessHandlers.handleSaveRoute}
        onCancel={() => {
          mapManagement.setShowRouteForm(false);
          mapManagement.setEditingRoute(null);
        }}
        isVisible={mapManagement.showRouteForm}
        route={mapManagement.editingRoute}
        isEditing={!!mapManagement.editingRoute}
        mapInstance={mapInstance}
        existingRoutes={routes}
      />

      {/* LISTAS Y GESTIÓN */}
      {mapManagement.showBuildingList && (
        <BuildingList
          buildings={buildings}
          onEditBuilding={mapManagement.handleEditBuilding}
          onDeleteBuilding={businessHandlers.handleDeleteBuilding}
          onClose={mapManagement.handleCloseBuildingList}
          onEditRoom={mapManagement.handleOpenEditRoom}
          onCreateRooms={mapManagement.handleCreateRoomsForBuilding}
          onAddRooms={() => mapManagement.handleCreateRoomsForBuilding(null)}
          onDeleteRoom={businessHandlers.handleDeleteRoom}
          onReload={loadBuildings}
        />
      )}

      {mapManagement.showRoomManagement && (
        <RoomManagement
          mode={mapManagement.roomManagementMode}
          buildings={buildings}
          selectedBuilding={mapManagement.selectedBuildingForRooms}
          onSaveRooms={businessHandlers.handleSaveRooms}
          onUpdateRoom={businessHandlers.handleUpdateRoom}
          onDeleteRoom={businessHandlers.handleDeleteRoom}
          onClose={mapManagement.handleCloseRoomManagement}
          existingRooms={mapManagement.selectedRooms}
        />
      )}

      {mapManagement.showRouteList && (
        <RouteList
          routes={routes}
          onEditRoute={mapManagement.handleEditRoute}
          onDeleteRoute={businessHandlers.handleDeleteRoute}
          onClose={mapManagement.handleCloseRouteList}
          onSelectRoute={handleRouteClick}
        />
      )}

      {/* COMPONENTES DEL MAPA */}
      <div className="Mapa">
        <div ref={mapRef} className="map-container"></div>

        {!isMapReady && (
          <div className="loading-overlay">
            <div className="loading-message">
              <div>Cargando mapa...</div>
              <div className="loading-spinner"></div>
            </div>
          </div>
        )}

        <MapIndicators
          coordinateDetection={coordinateManagement.coordinateDetection}
          validationErrors={coordinateManagement.validationErrors}
          buildingsLoading={buildingsLoading}
          buildingsError={buildingsError}
          routesError={routesError}
          proximityLoading={proximityLoading}
          proximityError={proximityError}
          onClearValidationErrors={coordinateManagement.clearValidationErrors}
        />
      </div>

      {/* CAPAS DEL MAPA */}
      <BuildingRenderer
        mapInstance={mapInstance}
        isMapReady={isMapReady}
        buildings={buildings}
        onBuildingClick={handleBuildingClickWithProximity}
      />

      {/* ROUTE LAYER CON RUTAS PRIORIZADAS */}
      <RouteLayer
        mapInstance={mapInstance}
        routes={prioritizedRoutes}
        onRouteClick={handleRouteClick}
        originFilter={mapManagement.filters.origin}
        destinationFilter={mapManagement.filters.destination}
        selectedRoute={mapManagement.selectedRoute}
      />

      {mapManagement.showRouteNetwork && (
        <RouteNetwork
          mapInstance={mapInstance}
          onNodeClick={(node) => {
            if (mapInstance) {
              mapInstance.setView(
                [node.coordenadas.lat, node.coordenadas.lng],
                18
              );
            }
          }}
          onRouteClick={(routeInfo) => {
            const fullRoute = routes.find((r) => r.id === routeInfo.routeId);
            if (fullRoute) {
              mapManagement.setSelectedRoute(fullRoute);
              handleRouteClick(fullRoute);
            }
          }}
        />
      )}
    </div>
  );
}

export default Map;
