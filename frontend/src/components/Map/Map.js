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
  // ========== ESTADOS Y HOOKS BÁSICOS ==========
  const { mapRef, initializeMap, mapInstance, isMapReady } = useMap();
  const [mapInitialized, setMapInitialized] = useState(false);

  // ========== HOOKS DE GESTIÓN DE ESTADO GLOBAL ==========
  const { notification, showNotification, hideNotification } =
    useNotification();
  const { confirmState, showConfirm, hideConfirm, handleConfirm } =
    useConfirm();

  // ========== HOOKS DE DATOS ==========
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

  // ========== HOOK DE INTELIGENCIA DE RUTAS ==========
  const { getPrioritizedRoutes, buildingGraph, calculateShortestRoute } =
    useRouteIntelligence(routes, buildings);

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

  // ========== RUTAS PRIORIZADAS ==========
  const prioritizedRoutes = useMemo(() => {
    if (mapManagement.filters.origin && mapManagement.filters.destination) {
      console.log("🎯 Calculating prioritized route:", {
        origin: mapManagement.filters.origin,
        destination: mapManagement.filters.destination,
      });

      const result = getPrioritizedRoutes(
        mapManagement.filters.origin,
        mapManagement.filters.destination
      );

      console.log("📊 Prioritized routes result:", {
        total: result.length,
        routes: result.map((r) => ({
          name: r.nombre,
          isSegment: r.es_segmento,
          coords: r.geometria?.coordinates?.length || 0,
        })),
      });

      return result;
    } else {
      console.log("🔄 No filters - showing all routes:", routes.length);
      return routes;
    }
  }, [
    mapManagement.filters.origin,
    mapManagement.filters.destination,
    getPrioritizedRoutes,
    routes,
  ]);

  // ========== DEBUG CRÍTICO - RUTAS PRIORIZADAS ==========
  useEffect(() => {
    if (mapManagement.filters.origin && mapManagement.filters.destination) {
      console.log("🔍🔄 DEBUG CRÍTICO - RUTAS PRIORIZADAS:", {
        origen: mapManagement.filters.origin,
        destino: mapManagement.filters.destination,
        totalRutasPrioritarias: prioritizedRoutes.length,
        detallesRutas: prioritizedRoutes.map((r, i) => ({
          index: i,
          nombre: r.nombre,
          es_ruta_completa: r.es_ruta_completa,
          es_segmento: r.es_segmento,
          puntos: r.geometria?.coordinates?.length || 0,
          distancia: r.distancia,
          origen: r.origen,
          destino: r.destino,
        })),
      });

      // Verificar si hay alguna ruta completa
      const rutasCompletas = prioritizedRoutes.filter(
        (r) => r.es_ruta_completa
      );
      console.log("✅ RUTAS COMPLETAS ENCONTRADAS:", rutasCompletas.length);

      if (rutasCompletas.length > 0) {
        console.log("🎯 DETALLE RUTA COMPLETA:", rutasCompletas[0]);
      } else {
        console.log(
          "❌ NO HAY RUTAS COMPLETAS - mostrando segmentos:",
          prioritizedRoutes.filter((r) => r.es_segmento).length
        );
      }
    }
  }, [prioritizedRoutes, mapManagement.filters]);

  // ========== DEBUG CRÍTICO DEL SISTEMA DE RUTAS ==========
  useEffect(() => {
    if (!buildingGraph) {
      console.log("🔍🔄 buildingGraph no disponible para debug del sistema");
      return;
    }

    if (mapManagement.filters.origin && mapManagement.filters.destination) {
      console.log("🔍🔄 DEBUG CRÍTICO - Estado del Sistema de Rutas:", {
        filters: mapManagement.filters,
        buildingGraph: {
          hasOrigin: !!buildingGraph[mapManagement.filters.origin],
          hasDestination: !!buildingGraph[mapManagement.filters.destination],
          totalBuildings: Object.keys(buildingGraph).length,
          sampleBuildings: Object.keys(buildingGraph).slice(0, 3),
        },
        originConnections: buildingGraph[mapManagement.filters.origin]
          ?.connections
          ? Object.keys(buildingGraph[mapManagement.filters.origin].connections)
          : [],
        routesState: {
          total: routes.length,
          withGeometry: routes.filter((r) => r.geometria?.coordinates).length,
          sample: routes.slice(0, 2).map((r) => ({
            id: r.id,
            name: r.nombre,
            coords: r.geometria?.coordinates?.length || 0,
          })),
        },
      });

      if (
        buildingGraph[mapManagement.filters.origin] &&
        buildingGraph[mapManagement.filters.destination]
      ) {
        const testResult = calculateShortestRoute(
          mapManagement.filters.origin,
          mapManagement.filters.destination
        );
        console.log("🧪 Test Route Calculation:", testResult);
      }
    }
  }, [mapManagement.filters, buildingGraph, routes, calculateShortestRoute]);

  // En Map.js - Agrega este debug
  useEffect(() => {
    if (mapManagement.filters.origin && mapManagement.filters.destination) {
      console.log("🔍🔄 RUTAS PRIORITARIAS POR TIPO:", {
        origen: mapManagement.filters.origin,
        destino: mapManagement.filters.destination,
        totalRutas: prioritizedRoutes.length,
        tiposEncontrados: prioritizedRoutes.map((r) => r.tipo),
        detalles: prioritizedRoutes.map((r) => ({
          tipo: r.tipo,
          nombre: r.nombre,
          distancia: r.distancia,
          segmentos: r.segmentos_originales,
        })),
      });
    }
  }, [prioritizedRoutes, mapManagement.filters]);

  // ========== DEBUG DEL GRAFO ==========
  useEffect(() => {
    if (!buildingGraph) {
      console.log("🔗🔄 buildingGraph no está disponible aún");
      return;
    }

    console.log("🔗🔄 DEBUG DEL GRAFO DE CONEXIONES:", {
      totalEdificios: Object.keys(buildingGraph).length,
      edificiosConConexiones: Object.keys(buildingGraph).filter(
        (b) => Object.keys(buildingGraph[b]?.connections || {}).length > 0
      ),
      todasLasConexiones: Object.keys(buildingGraph).map((edificio) => ({
        edificio,
        conexiones: Object.keys(buildingGraph[edificio]?.connections || {}),
      })),
      casino: buildingGraph["Casino"]
        ? {
            tieneConexiones:
              Object.keys(buildingGraph["Casino"]?.connections || {}).length >
              0,
            conexiones: Object.keys(buildingGraph["Casino"]?.connections || {}),
          }
        : "NO EXISTE",
      museo: buildingGraph["Museo"]
        ? {
            tieneConexiones:
              Object.keys(buildingGraph["Museo"]?.connections || {}).length > 0,
            conexiones: Object.keys(buildingGraph["Museo"]?.connections || {}),
          }
        : "NO EXISTE",
    });
  }, [buildingGraph]);

  // ========== CONEXIONES DETALLADAS ==========
  useEffect(() => {
    if (!buildingGraph) {
      console.log(
        "🔍 buildingGraph no está disponible para conexiones detalladas"
      );
      return;
    }

    console.log("🔍 CONEXIONES DETALLADAS DEL GRAFO:", {
      todosLosEdificios: Object.keys(buildingGraph),

      casino: buildingGraph["Casino"]
        ? {
            conexiones: Object.keys(
              buildingGraph["Casino"]?.connections || {}
            ).map((target) => ({
              hacia: target,
              distancia: Math.round(
                buildingGraph["Casino"]?.connections[target]?.distance || 0
              ),
              ruta:
                buildingGraph["Casino"]?.connections[target]?.routeName ||
                "N/A",
            })),
          }
        : "NO EXISTE",

      museo: buildingGraph["Museo"]
        ? {
            conexiones: Object.keys(
              buildingGraph["Museo"]?.connections || {}
            ).map((target) => ({
              hacia: target,
              distancia: Math.round(
                buildingGraph["Museo"]?.connections[target]?.distance || 0
              ),
              ruta:
                buildingGraph["Museo"]?.connections[target]?.routeName || "N/A",
            })),
          }
        : "NO EXISTE",

      posiblesCaminos: Object.keys(buildingGraph)
        .filter(
          (edificio) =>
            buildingGraph[edificio]?.connections &&
            Object.keys(buildingGraph[edificio]?.connections || {}).includes(
              "Museo"
            )
        )
        .map((conectadoAMuseo) => ({
          desdeCasino: buildingGraph["Casino"]?.connections?.[conectadoAMuseo]
            ? "SÍ"
            : "NO",
          intermediario: conectadoAMuseo,
          haciaMuseo: "SÍ",
        })),
    });
  }, [buildingGraph]);

  // En Map.js - Agrega este useEffect para verificar datos
  useEffect(() => {
    console.log("📊 VERIFICACIÓN DE DATOS EN MAP:", {
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
      },
      grafo: {
        edificios: buildingGraph ? Object.keys(buildingGraph).length : 0,
        tieneConexiones: buildingGraph
          ? Object.keys(buildingGraph).filter(
              (b) => Object.keys(buildingGraph[b]?.connections || {}).length > 0
            ).length
          : 0,
      },
    });
  }, [buildings, routes, buildingGraph]);

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
        buildings={filteredBuildings}
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
