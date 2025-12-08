// components/map/Map/Map.jsx
import React, { useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.css";

// Hooks
import { useMap } from "hooks/map/useMap.js";
import { useMapState } from "hooks/map/useMapState.js";
import { useMapManagement } from "hooks/map/useMapManagement.js";
import { useMapData } from "hooks/map/useMapData.js";
import { useMapEffects } from "hooks/map/useMapEffects.js";
import { useMapActions } from "hooks/map/useMapActions.js";
import { useMapClickHandler } from "hooks/map/useMapClickHandler.js";
import { useBusinessHandlers } from "hooks/map/useBusinessHandlers.js";
import { useMapOperations } from "hooks/map/useMapOperations.js";
import { useCoordinateManagement } from "hooks/map/useCoordinateManagement.js";
import { useInteractionHandlers } from "hooks/map/useInteractionHandlers.js";
import { useRouteUtils } from "hooks/routes/useRouteUtils.js";
import { useBuildingFilters } from "hooks/buildings/useBuildingFilters.js";
import useBuildings from "hooks/buildings/useBuildings.js";
import useGeoServer from "hooks/geoserver/useGeoServer.js";
import useRoutes from "hooks/routes/useRoutes.js";
import { useNotification } from "hooks/common/useNotification.js";
import { useConfirm } from "hooks/common/useConfirm.js";
import useProximity from "hooks/common/useProximity.js";
import { useRouteIntelligence } from "hooks/routes/useRouteIntelligence.js";
import { useAuth } from "contexts/AuthContext.js";

// Componentes
import { ConfirmDialog, UINotification, SidePanel } from "components/ui/index.js";
import { BuildingList, BuildingForm } from "components/buildings/index.js";
import { RouteList, RouteFormPolyline } from "components/routes/index.js";

import MapIndicators from "components/map/MapIndicators/MapIndicators.jsx";
import { MapContainer } from "components/map/Map/components/MapContainer.jsx";
import { MapForms } from "components/map/Map/components/MapForms.jsx";
import { MapLists } from "components/map/Map/components/MapLists.jsx";
import { MapLayers } from "components/map/Map/components/MapLayers.jsx";

function Map() {
  // Hooks Principales
  const { mapRef, initializeMap, mapInstance, isMapReady } = useMap();
  const [mapInitialized, setMapInitialized] = useState(false);
  const [isRouteDrawingActive, setIsRouteDrawingActive] = useState(false);

  // Auth Context
  const { logout } = useAuth();

  // Notificaciones y confirmaciones
  const { notification, showUINotification, hideNotification } =
    useNotification();
  const { confirmState, showConfirm, hideConfirm, handleConfirm } =
    useConfirm();

  // Estado del mapa (SOLO ESTADO)
  const mapState = useMapState();

  // Gestión del mapa (SOLO LÓGICA)
  const mapManagement = useMapManagement(mapState);

  // Datos principales
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
    getProximityAnalysis,
  } = useProximity();

  const { getPrioritizedRoutes, buildingGraphs, hasData } =
    useRouteIntelligence(routes, buildings);

  //  Filtros
  const {
    filteredBuildings, // Solo filtrados por categoría
    highlightedBuildings, // Origen y destino destacados
    filtersState, // Estado de validación
    buildingOptions, // Opciones para selectores
    categoryOptions, // Categorías disponibles
    stats, // Estadísticas
  } = useBuildingFilters(buildings, mapState.filters, routes);

  // Log de filtros activos
  console.log("🎯 Estado de filtros:", {
    categoría: mapState.filters.category || "ninguna",
    origen: mapState.filters.origin || "ninguno",
    destino: mapState.filters.destination || "ninguno",
    tipoRuta: mapState.filters.routeType || "todos",
    edificiosMostrados: stats.filtered,
    edificiosDestacados: stats.highlighted,
    rutaLista: filtersState.routeCalculationReady,
  });

  //Hooks Factorizados

  // Datos y lógica del mapa
  const mapData = useMapData(
    mapState,
    buildings,
    routes,
    getPrioritizedRoutes,
    buildingGraphs,
    hasData
  );

  // Operaciones del mapa
  const { validateCoordinates, findNearestBuilding } =
    useMapOperations(buildings);

  // Gestión de coordenadas
  const coordinateManagement = useCoordinateManagement(
    mapInstance,
    validateCoordinates,
    findNearestBuilding
  );

  // Handlers de interacción especializados
  const { interactionHandlers } = useInteractionHandlers(
    showUINotification,
    getProximityAnalysis
  );

  // Handlers de negocio
  const businessHandlers = useBusinessHandlers(
    showUINotification,
    showConfirm,
    validateCoordinates,
    loadBuildings,
    loadRoutes,
    deleteBuilding,
    createRoute,
    updateRoute,
    deleteRoute,
    mapState, // Estado
    coordinateManagement,
    mapInstance
  );

  // Utilidades de rutas
  const { handleRouteClick, handleEditRoute } = useRouteUtils(
    mapInstance,
    mapState
  );

  // Acciones del mapa
  const { handleLogout, handleSyncData, handleResetView } = useMapActions(
    mapInstance,
    showUINotification,
    showConfirm,
    syncWithGeoServer,
    geoServerFeatures,
    loadBuildings
  );

  // Effects
  useMapEffects(
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
    loadWFSData
  );

  // Manejo de Interacciones del Mapa
  useMapClickHandler(
    mapInstance,
    coordinateManagement,
    validateCoordinates,
    findNearestBuilding,
    mapState,
    isRouteDrawingActive
  );

  // Logout real que usa AuthContext
  const handleRealLogout = async () => {
    try {
      await logout();
      showUINotification("Sesión cerrada correctamente", "success");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      showUINotification("Error al cerrar sesión", "error");
    }
  };

  // Manejo de logout con confirmación
  const handleLogoutWithConfirmation = () => {
    // CORRECCIÓN: Pasar parámetros individuales en lugar de objeto
    showConfirm(
      "Cerrar Sesión",
      "¿Estás seguro de que deseas cerrar la sesión?",
      handleRealLogout, // Función a ejecutar cuando confirme
      {
        type: "warning",
        confirmText: "Sí, cerrar sesión",
        cancelText: "Cancelar",
      }
    );
  };

  // Renderizado
  return (
    <div className="container">
      {/* Panel Lateral */}
      <SidePanel
        status={backendStatus === "connected" ? "success" : "error"}
        featuresCount={buildings.length}
        routesCount={routes.length}
        onLogout={handleLogoutWithConfirmation}
        onSyncData={handleSyncData}
        onResetView={handleResetView}
        buildingsLoading={buildingsLoading}
        backendStatus={backendStatus}
        geoServerStatus={geoServerStatus}
        geoServerFeaturesCount={geoServerFeatures.length}
        onAddBuilding={mapManagement.handleAddBuilding}
        onManageBuildings={mapManagement.handleManageBuildings}
        onAddRoute={mapManagement.handleAddRoute}
        onManageRoutes={mapManagement.handleManageRoutes}
        categoryFilter={mapState.filters.category}
        routeTypeFilter={mapState.filters.routeType}
        onCategoryFilterChange={(e) =>
          mapManagement.handleFilterChange("category", e.target.value)
        }
        onRouteTypeFilterChange={(e) =>
          mapManagement.handleFilterChange("routeType", e.target.value)
        }
        onToggleCoordinateDetection={
          coordinateManagement.toggleCoordinateDetection
        }
        coordinateDetectionActive={coordinateManagement.coordinateDetection}
        onToggleRouteNetwork={() =>
          mapState.setShowRouteNetwork(!mapState.showRouteNetwork)
        }
        routeNetworkActive={mapState.showRouteNetwork}
        onClearFilters={mapManagement.handleClearFilters}
        allBuildings={buildings}
        filteredBuildings={filteredBuildings}
        filtersValid={filtersState.routeCalculationReady}
      />

      {/* Notificaciones y Diálogos */}
      {notification.show && (
        <UINotification
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

      {/* Formularios */}
      <MapForms
        mapState={mapState} // ESTADO
        mapManagement={mapManagement} // GESTIÓN
        businessHandlers={businessHandlers} // NEGOCIO
        coordinateManagement={coordinateManagement}
        mapInstance={mapInstance}
        isRouteDrawingActive={isRouteDrawingActive}
        setIsRouteDrawingActive={setIsRouteDrawingActive}
        showUINotification={showUINotification}
      />

      {/* Listas Y Gestión */}
      <MapLists
        mapState={mapState} // ESTADO
        mapManagement={mapManagement} // GESTIÓN
        businessHandlers={businessHandlers} // NEGOCIO
        filteredBuildings={filteredBuildings}
        routes={routes}
        buildings={buildings}
        loadBuildings={loadBuildings}
        handleRouteClick={handleRouteClick}
        handleEditRoute={handleEditRoute}
      />

      {/* Componentes del Mapa */}
      <MapContainer mapRef={mapRef} isMapReady={isMapReady}>
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
      </MapContainer>

      {/* Capas Del Mapa */}
      <MapLayers
        mapInstance={mapInstance}
        isMapReady={isMapReady}
        filteredBuildings={filteredBuildings}
        highlightedBuildings={highlightedBuildings}
        prioritizedRoutes={mapData.prioritizedRoutes}
        mapState={mapState}
        routes={routes}
        handleRouteClick={handleRouteClick}
        interactionHandlers={interactionHandlers} // ✅ AHORA VIENE DEL HOOK
      />
    </div>
  );
}

export default Map;
