import React, { useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.css";

// Hooks
import { useMap } from "../../../hooks/map/useMap.js";
import { useMapState } from "../../../hooks/map/useMapState.js";
import { useMapData } from "../../../hooks/map/useMapData.js";
import { useMapEffects } from "../../../hooks/map/useMapEffects.js";
import { useMapHandlers } from "../../../hooks/map/useMapHandlers.js";
import { useMapActions } from "../../../hooks/map/useMapActions.js";
import { useMapClickHandler } from "../../../hooks/map/useMapClickHandler.js";
import { useBusinessHandlers } from "../../../hooks/map/useBusinessHandlers.js";
import { useMapOperations } from "../../../hooks/map/useMapOperations.js";
import { useCoordinateManagement } from "../../../hooks/map/useCoordinateManagement.js";

import { useRouteUtils } from "../../../hooks/routes/useRouteUtils.js";
import { useBuildingFilters } from "../../../hooks/buildings/useBuildingFilters.js";
import useBuildings from "../../../hooks/buildings/useBuildings.js";
import useGeoServer from "../../../hooks/geoserver/useGeoServer.js";
import useRoutes from "../../../hooks/routes/useRoutes.js";
import { useNotification } from "../../../hooks/common/useNotification.js";
import { useConfirm } from "../../../hooks/common/useConfirm.js";
import useProximity from "../../../hooks/common/useProximity.js";
import { useRouteIntelligence } from "../../../hooks/routes/useRouteIntelligence.js";

// Componentes
import { ConfirmDialog, UINotification, SidePanel } from "../../ui/index.js";
import { BuildingList, BuildingForm } from "../../buildings/index.js";
import { RouteList, RouteFormPolyline } from "../../routes/index.js";

import MapIndicators from "../MapIndicators/MapIndicators.jsx";
import { MapContainer } from "./components/MapContainer.jsx";
import { MapForms } from "./components/MapForms.jsx";
import { MapLists } from "./components/MapLists.jsx";
import { MapLayers } from "./components/MapLayers.jsx";

function Map() {
  // Hooks Principales
  const { mapRef, initializeMap, mapInstance, isMapReady } = useMap();
  const [mapInitialized, setMapInitialized] = useState(false);
  const [isRouteDrawingActive, setIsRouteDrawingActive] = useState(false);

  // Notificaciones y confirmaciones
  const { notification, showUINotification, hideNotification } =
    useNotification();
  const { confirmState, showConfirm, hideConfirm, handleConfirm } =
    useConfirm();

  // Estado del mapa
  const mapState = useMapState();

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

  //  Filtros Mejordos
  const {
    filteredBuildings, // Solo filtrados por categoría
    highlightedBuildings, // Origen y destino destacados
    filtersState, // Estado de validación
    buildingOptions, // Opciones para selectores
    categoryOptions, // Categorías disponibles
    stats, // Estadísticas
  } = useBuildingFilters(buildings, mapState.filters);

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
    mapState,
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

  // Handlers de interacción
  const interactionHandlers = useMapHandlers(
    mapInstance,
    showUINotification,
    getProximityAnalysis,
    routes,
    mapState,
    handleRouteClick
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

  // Renderizado
  return (
    <div className="container">
      {/* Panel Lateral */}
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
        onAddBuilding={mapState.handleAddBuilding}
        onManageBuildings={mapState.handleManageBuildings}
        onToggleCoordinateDetection={
          coordinateManagement.toggleCoordinateDetection
        }
        coordinateDetectionActive={coordinateManagement.coordinateDetection}
        onAddRoute={mapState.handleAddRoute}
        onManageRoutes={mapState.handleManageRoutes}
        onToggleRouteNetwork={() =>
          mapState.setShowRouteNetwork(!mapState.showRouteNetwork)
        }
        routeNetworkActive={mapState.showRouteNetwork}
        originFilter={mapState.filters.origin}
        destinationFilter={mapState.filters.destination}
        categoryFilter={mapState.filters.category}
        routeTypeFilter={mapState.filters.routeType}
        onOriginFilterChange={(e) =>
          mapState.handleFilterChange("origin", e.target.value)
        }
        onDestinationFilterChange={(e) =>
          mapState.handleFilterChange("destination", e.target.value)
        }
        onCategoryFilterChange={(e) =>
          mapState.handleFilterChange("category", e.target.value)
        }
        onRouteTypeFilterChange={(e) =>
          mapState.handleFilterChange("routeType", e.target.value)
        }
        onClearFilters={mapState.handleClearFilters}
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
        mapState={mapState}
        businessHandlers={businessHandlers}
        coordinateManagement={coordinateManagement}
        mapInstance={mapInstance}
        isRouteDrawingActive={isRouteDrawingActive}
        setIsRouteDrawingActive={setIsRouteDrawingActive}
        showUINotification={showUINotification}
      />

      {/* Listas Y Gestión */}
      <MapLists
        mapState={mapState}
        businessHandlers={businessHandlers}
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
        interactionHandlers={interactionHandlers}
      />
    </div>
  );
}

export default Map;
