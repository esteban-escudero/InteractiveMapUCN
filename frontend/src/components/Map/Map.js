import React, { useEffect, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.css";

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

// Constantes y servicios
import { UCN_COQUIMBO_BOUNDS } from "../../constants/mapConfig";
import { useNotification } from "../../hooks/useNotification";
import Notification from "../UI/Notification/Notification";
import { useConfirm } from "../../hooks/useConfirm";
import ConfirmDialog from "../UI/ConfirmDialog/ConfirmDialog";

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

// Componente principal del mapa
function Map() {
  // Hooks básicos
  const { mapRef, initializeMap, mapInstance, isMapReady } = useMap();
  const [mapInitialized, setMapInitialized] = useState(false);

  // Hooks globales
  const { notification, showNotification, hideNotification } =
    useNotification();
  const { confirmState, showConfirm, hideConfirm, handleConfirm } =
    useConfirm();

  // Hooks de datos
  const {
    buildings,
    loading: buildingsLoading,
    error: buildingsError,
    backendStatus,
    syncWithGeoServer,
    loadBuildings,
    deleteBuilding,
  } = useBuildings();

  // Hooks de GeoServer
  const {
    status: geoServerStatus,
    features: geoServerFeatures,
    loadWFSData,
  } = useGeoServer();

  // Hooks de rutas
  const {
    routes,
    loading: routesLoading,
    error: routesError,
    createRoute,
    updateRoute,
    deleteRoute,
    loadRoutes,
  } = useRoutes();

  // Hooks de operaciones del mapa
  const { validateCoordinates, findNearestBuilding } =
    useMapOperations(buildings);

  // Hooks de gestión de estado
  const mapManagement = useMapManagement();

  const coordinateManagement = useCoordinateManagement(
    mapInstance,
    validateCoordinates,
    findNearestBuilding
  );

  // Handlers de negocio
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

  // Utilitarios de rutas
  const { handleRouteClick } = useRouteUtils(mapInstance, mapManagement);

  // Filtros de edificios
  const { filteredBuildings } = useBuildingFilters(
    buildings,
    mapManagement.filters
  );

  // Acciones del mapa
  const { handleLogout, handleSyncData, handleResetView } = useMapActions(
    mapInstance,
    showNotification,
    showConfirm,
    syncWithGeoServer,
    geoServerFeatures,
    loadBuildings
  );

  // Manejo de clics en el mapa
  useMapClickHandler(
    mapInstance,
    coordinateManagement,
    validateCoordinates,
    findNearestBuilding,
    mapManagement
  );

  // Inicializar mapa
  useEffect(() => {
    if (!mapInitialized && mapRef.current && !mapInstance) {
      console.log("Inicializando mapa por primera vez...");

      const timer = setTimeout(() => {
        try {
          initializeMap(UCN_COQUIMBO_BOUNDS);
          setMapInitialized(true);
          console.log("Mapa inicializado exitosamente");
        } catch (error) {
          console.error("Error inicializando mapa:", error);
          setTimeout(() => {
            if (mapRef.current) {
              initializeMap(UCN_COQUIMBO_BOUNDS);
              setMapInitialized(true);
            }
          }, 1000);
        }
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [mapInitialized, mapRef, initializeMap, mapInstance]);

  // Cargar datos de GeoServer cuando el mapa esté listo
  useEffect(() => {
    if (isMapReady && mapInstance && geoServerStatus === "checking") {
      console.log("Cargando datos de GeoServer...");
      setTimeout(() => {
        loadWFSData(mapInstance, "edificio");
      }, 1000);
    }
  }, [isMapReady, mapInstance, geoServerStatus, loadWFSData]);

  // Renderizado del componente
  return (
    <div className="container">
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
        filteredBuildings={filteredBuildings}
      />

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

      {mapManagement.showRouteList && (
        <RouteList
          routes={routes}
          onEditRoute={mapManagement.handleEditRoute}
          onDeleteRoute={businessHandlers.handleDeleteRoute}
          onClose={mapManagement.handleCloseRouteList}
          onSelectRoute={handleRouteClick}
        />
      )}

      <RouteLayer
        mapInstance={mapInstance}
        routes={routes}
        onRouteClick={handleRouteClick}
      />

      <BuildingRenderer
        mapInstance={mapInstance}
        isMapReady={isMapReady}
        buildings={filteredBuildings}
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
          onClearValidationErrors={coordinateManagement.clearValidationErrors}
        />
      </div>
    </div>
  );
}

export default Map;
