import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import "./Map.css";

import { useBuildingManagement } from "../../hooks/useBuildingManagement";
import { useBuildings } from "../../hooks/useBuildings";
import { useCoordinateDetection } from "../../hooks/useCoordinateDetection";
import { useGeoServer } from "../../hooks/useGeoServer";
import { useMap } from "../../hooks/useMap";
import { useRooms } from "../../hooks/useRooms";

import BuildingForm from "../Forms/BuildingForm";
import BuildingList from "../ui/BuildingList/BuildingList";
import RoomManagement from "../ui/RoomManagement/RoomManagement";
import { BuildingLayers } from "./BuildingLayers";
import { CoordinateCapture } from "./CoordinateCapture";
import { MapControls } from "./MapControls";

import { UCN_COQUIMBO_BOUNDS } from "../../constants/mapConfig";
import SidePanel from "../ui/SidePanel/SidePanel";

// 🔧 Configuración de íconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

/**
 * Componente principal del mapa
 * Responsabilidad: Orquestar la inicialización del mapa y coordinar los diferentes módulos
 */
function Map() {
  // 🗺️ Estado y control del mapa
  const { mapRef, initializeMap, mapInstance, isMapReady } = useMap();
  const [mapInitialized, setMapInitialized] = useState(false);

  // 🏢 Gestión de edificios (datos)
  const {
    buildings,
    loading: buildingsLoading,
    error: buildingsError,
    backendStatus,
    syncWithGeoServer,
    loadBuildings,
    deleteBuilding,
  } = useBuildings();

  // 🌐 GeoServer
  const {
    status: geoServerStatus,
    features: geoServerFeatures,
    loadWFSData,
  } = useGeoServer();

  // 🏢 Gestión de edificios (UI y operaciones)
  const buildingMgmt = useBuildingManagement(loadBuildings, deleteBuilding);

  // 🚪 Gestión de salas
  const roomsMgmt = useRooms(loadBuildings);

  // 📍 Modo de captura de coordenadas
  const coordCapture = useCoordinateDetection();

  // 🔄 Handler cuando se capturan coordenadas
  const handleCoordinatesCaptured = (coords) => {
    buildingMgmt.handleCoordinatesCaptured(coords);
    coordCapture.deactivate();
  };

  // 🔄 Handler para crear salas desde el listado de edificios
  const handleCreateRoomsForBuilding = (building) => {
    roomsMgmt.openCreateRooms(building);
    buildingMgmt.closeBuildingList();
  };

  // 🔄 Sincronizar con GeoServer
  const handleSyncData = async () => {
    if (geoServerFeatures.length > 0) {
      try {
        await syncWithGeoServer(geoServerFeatures);
        alert(`${geoServerFeatures.length} edificios sincronizados`);
        await loadBuildings();
      } catch {
        alert("Error sincronizando datos");
      }
    } else {
      alert("No hay datos de GeoServer para sincronizar");
    }
  };

  // 🚪 Cerrar sesión
  const handleLogout = () => {
    alert("Cerrando sesión...");
  };

  // 🗺️ Inicializar mapa
  useEffect(() => {
    if (!mapInitialized && mapRef.current) {
      initializeMap(UCN_COQUIMBO_BOUNDS);
      setMapInitialized(true);
    }
  }, [mapInitialized, mapRef, initializeMap]);

  // 🌐 Cargar datos de GeoServer
  useEffect(() => {
    if (isMapReady && mapInstance && geoServerStatus === "checking") {
      setTimeout(() => loadWFSData(mapInstance, "edificio"), 500);
    }
  }, [isMapReady, mapInstance, geoServerStatus, loadWFSData]);

  return (
    <div className="container">
      {/* 🎛️ PANEL LATERAL */}
      <SidePanel
        status={backendStatus === "connected" ? "success" : "error"}
        featuresCount={buildings.length}
        onLogout={handleLogout}
        onSyncData={handleSyncData}
        buildingsLoading={buildingsLoading}
        backendStatus={backendStatus}
        geoServerStatus={geoServerStatus}
        geoServerFeaturesCount={geoServerFeatures.length}
        onAddBuilding={buildingMgmt.openAddBuilding}
        onEditBuildings={buildingMgmt.openBuildingList}
        onToggleCoordinateDetection={coordCapture.toggle}
        coordinateDetectionActive={coordCapture.isActive}
        onManageRooms={() => roomsMgmt.openCreateRooms()}
        onEditRoom={roomsMgmt.openEditRoom}
        onCreateRooms={handleCreateRoomsForBuilding}
      />

      {/* 📝 FORMULARIO DE EDIFICIOS */}
      <BuildingForm
        onSave={buildingMgmt.saveBuilding}
        onCancel={buildingMgmt.closeBuildingForm}
        isVisible={buildingMgmt.showBuildingForm}
        building={buildingMgmt.editingBuilding}
        isEditing={!!buildingMgmt.editingBuilding}
        capturedCoordinates={buildingMgmt.capturedCoords}
        onClearCoordinates={buildingMgmt.clearCapturedCoordinates}
      />

      {/* 📋 LISTA DE EDIFICIOS */}
      {buildingMgmt.showBuildingList && (
        <BuildingList
          buildings={buildings}
          onEditBuilding={buildingMgmt.openEditBuilding}
          onDeleteBuilding={buildingMgmt.handleDeleteBuilding}
          onClose={buildingMgmt.closeBuildingList}
          onEditRoom={roomsMgmt.openEditRoom}
          onCreateRooms={handleCreateRoomsForBuilding}
          onDeleteRoom={roomsMgmt.deleteRoom}
          onReload={loadBuildings}
        />
      )}

      {/* 🚪 GESTIÓN DE SALAS */}
      {roomsMgmt.showRoomManagement && (
        <RoomManagement
          buildings={buildings}
          onSaveRooms={roomsMgmt.saveRooms}
          onUpdateRoom={roomsMgmt.updateRoom}
          onDeleteRoom={roomsMgmt.deleteRoom}
          onClose={roomsMgmt.closeRoomManagement}
          existingRooms={roomsMgmt.selectedRooms}
          mode={roomsMgmt.roomManagementMode}
          selectedBuilding={roomsMgmt.selectedBuildingForRooms}
        />
      )}

      {/* 🗺️ CONTENEDOR DEL MAPA */}
      <div className="Mapa">
        <div ref={mapRef} className="map-container"></div>

        {/* 📍 MODO CAPTURA DE COORDENADAS */}
        <CoordinateCapture
          mapInstance={mapInstance}
          isActive={coordCapture.isActive}
          onCaptured={handleCoordinatesCaptured}
          onToggle={coordCapture.toggle}
        />

        {/* 🎮 CONTROLES DEL MAPA */}
        <MapControls
          mapInstance={mapInstance}
          buildingsCount={buildings.length}
        />

        {/* 🏢 CAPAS DE EDIFICIOS */}
        <BuildingLayers mapInstance={mapInstance} buildings={buildings} />

        {/* ⏳ INDICADOR DE CARGA */}
        {!isMapReady && (
          <div className="loading-message">🗺️ Cargando mapa...</div>
        )}

        {buildingsLoading && (
          <div
            style={{
              position: "absolute",
              top: "10px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#3498db",
              color: "white",
              padding: "10px 20px",
              borderRadius: "5px",
              zIndex: 1000,
            }}
          >
            Cargando edificios...
          </div>
        )}

        {buildingsError && (
          <div
            style={{
              position: "absolute",
              top: "10px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#e74c3c",
              color: "white",
              padding: "10px 20px",
              borderRadius: "5px",
              zIndex: 1000,
            }}
          >
            Error: {buildingsError}
          </div>
        )}
      </div>
    </div>
  );
}

export default Map;
