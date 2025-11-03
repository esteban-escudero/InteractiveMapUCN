import React, { useEffect, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.css";

import { useMap } from "../../hooks/useMap";
import { useBuildings } from "../../hooks/useBuildings";
import { useGeoServer } from "../../hooks/useGeoServer";
import SidePanel from "../UI/SidePanel";
import BuildingForm from "../Forms/BuildingForm";
import BuildingList from "../UI/BuildingList/BuildingList";
import RoomManagement from "../UI/RoomManagement/RoomManagement";
import { UCN_COQUIMBO_BOUNDS } from "../../constants/mapConfig";
import { buildingService } from "../../services/buildingService";
import { roomService } from "../../services/roomService";

// IMPORTACIONES AGREGADAS
import useRoutes from "../../hooks/useRoutes";
import RouteForm from "../Forms/RouteForm";
import RouteLayer from "./RouteLayer";
import RouteList from "../UI/RouteList/RouteList";

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

const createDatabaseIcon = () =>
  L.divIcon({
    html: `<div style="background-color: #ae279eff;
                width: 14px; height: 14px;
               border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [18, 18],
    className: "database-building-icon",
  });

const createTempIcon = () =>
  L.divIcon({
    html: `<div style="background-color: #e74c3c; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(231,76,60,0.5);"></div>`,
    iconSize: [22, 22],
    className: "temp-coordinate-icon",
  });

function Map() {
  const { mapRef, initializeMap, mapInstance, isMapReady } = useMap();
  const [mapInitialized, setMapInitialized] = useState(false);

  const [showBuildingForm, setShowBuildingForm] = useState(false);
  const [showBuildingList, setShowBuildingList] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [mapUpdateCount, setMapUpdateCount] = useState(0);

  const [coordinateDetection, setCoordinateDetection] = useState(false);
  const [tempMarker, setTempMarker] = useState(null);
  const [capturedCoords, setCapturedCoords] = useState(null);

  const [showRoomManagement, setShowRoomManagement] = useState(false);
  const [roomManagementMode, setRoomManagementMode] = useState("create");
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectedBuildingForRooms, setSelectedBuildingForRooms] =
    useState(null);

  // DENTRO DEL COMPONENTE Map, AGREGAR ESTOS ESTADOS:
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [showRouteList, setShowRouteList] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);

  // Hook para edificios
  const {
    buildings,
    loading: buildingsLoading,
    error: buildingsError,
    backendStatus,
    syncWithGeoServer,
    loadBuildings,
    deleteBuilding,
  } = useBuildings();

  // Hook para GeoServer
  const {
    status: geoServerStatus,
    features: geoServerFeatures,
    loadWFSData,
  } = useGeoServer();
  const [buildingLayers, setBuildingLayers] = useState([]);

  // AGREGAR HOOK DE RUTAS
  const {
    routes,
    loading: routesLoading,
    error: routesError,
    createRoute,
    updateRoute,
    deleteRoute,
    loadRoutes,
  } = useRoutes();

  useEffect(() => {
    if (!mapInitialized && mapRef.current && !mapInstance) {
      console.log("🔄 Inicializando mapa por primera vez...");

      const timer = setTimeout(() => {
        try {
          initializeMap(UCN_COQUIMBO_BOUNDS);
          setMapInitialized(true);
          console.log("✅ Mapa inicializado exitosamente");
        } catch (error) {
          console.error("❌ Error inicializando mapa:", error);
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

  // FUNCIONES PARA SALAS - AHORA DENTRO DE EDIFICIOS
  const handleOpenCreateRooms = () => {
    setRoomManagementMode("create");
    setSelectedRooms([]);
    setSelectedBuildingForRooms(null);
    setShowRoomManagement(true);
    setShowBuildingList(false);
    console.log("➕ Abriendo creación de salas");
  };

  const handleOpenEditRoom = (room) => {
    setRoomManagementMode("edit");
    setSelectedRooms([room]);
    setShowRoomManagement(true);
    setShowBuildingList(false);
    console.log("✏️ Abriendo edición de sala:", room);
  };

  const handleSaveRooms = async (roomsData) => {
    try {
      await roomService.createRooms(roomsData);
      await loadBuildings();
      console.log("✅ Salas creadas exitosamente");
    } catch (error) {
      console.error("Error al crear salas:", error);
      throw error;
    }
  };

  const handleUpdateRoom = async (roomId, roomData) => {
    try {
      await roomService.updateRoom(roomId, roomData);
      await loadBuildings();
      console.log("✅ Sala actualizada exitosamente");
    } catch (error) {
      console.error("Error al actualizar sala:", error);
      throw error;
    }
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      console.log("🗑️ Eliminando sala ID:", roomId);
      await roomService.deleteRoom(roomId);
      await loadBuildings();
      console.log("✅ Sala eliminada exitosamente");
    } catch (error) {
      console.error("❌ Error al eliminar sala:", error);
      throw error;
    }
  };

  // ✅ FUNCIÓN PARA CREAR SALAS DESDE BUILDINGLIST
  const handleCreateRoomsForBuilding = (building) => {
    setSelectedBuildingForRooms(building);
    setRoomManagementMode("create");
    setSelectedRooms([]);
    setShowRoomManagement(true);
    setShowBuildingList(false);
    console.log("🏢 Creando salas para edificio:", building.nombre);
  };

  // FUNCIONES PARA RUTAS - AGREGAR
  const handleAddRoute = () => {
    setEditingRoute(null);
    setShowRouteForm(true);
    setShowRouteList(false);
  };

  const handleManageRoutes = () => {
    setShowRouteList(true);
    setShowBuildingList(false);
    setShowRoomManagement(false);
  };

  const handleEditRoute = (route) => {
    setEditingRoute(route);
    setShowRouteForm(true);
    setShowRouteList(false);
  };

  const handleSaveRoute = async (routeData) => {
    try {
      if (editingRoute) {
        await updateRoute(editingRoute.id, routeData);
        alert("✅ Ruta actualizada");
      } else {
        await createRoute(routeData);
        alert("✅ Ruta creada");
      }

      setEditingRoute(null);
      setShowRouteForm(false);
      await loadRoutes();
    } catch (error) {
      console.error("Error al guardar ruta:", error);
      alert("❌ Error al guardar ruta");
    }
  };

  const handleCancelRouteEdit = () => {
    setEditingRoute(null);
    setShowRouteForm(false);
  };

  const handleRouteClick = (route) => {
    console.log("🛣️ Ruta seleccionada:", route);
    setSelectedRoute(route);
    // Opcional: centrar el mapa en la ruta
    if (mapInstance && route.geometria) {
      const coordinates = route.geometria.coordinates;
      if (coordinates.length > 0) {
        const bounds = coordinates.map((coord) => [coord[1], coord[0]]);
        mapInstance.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  };

  const handleDeleteRoute = async (route) => {
    if (
      window.confirm(`¿Estás seguro de eliminar la ruta "${route.nombre}"?`)
    ) {
      try {
        await deleteRoute(route.id);
        console.log("✅ Ruta eliminada");
        if (selectedRoute && selectedRoute.id === route.id) {
          setSelectedRoute(null);
        }
      } catch (err) {
        console.error("❌ Error al eliminar ruta:", err);
        alert("Error al eliminar ruta");
      }
    }
  };

  const handleCloseRouteList = () => {
    setShowRouteList(false);
  };

  const toggleCoordinateDetection = useCallback(() => {
    const newState = !coordinateDetection;
    setCoordinateDetection(newState);

    if (newState) {
      console.log("📍 Modo captura ACTIVADO");
      if (mapInstance) mapInstance.getContainer().style.cursor = "crosshair";
    } else {
      console.log("📍 Modo captura DESACTIVADO");
      if (tempMarker && mapInstance) {
        mapInstance.removeLayer(tempMarker);
        setTempMarker(null);
      }
      if (mapInstance) {
        mapInstance.getContainer().style.cursor = "";
      }
      setCapturedCoords(null);
    }
  }, [coordinateDetection, mapInstance, tempMarker]);

  // ✅ Capturar clic en el mapa
  useEffect(() => {
    if (!mapInstance || !coordinateDetection) return;

    const handleMapClick = (e) => {
      const { lat, lng } = e.latlng;
      console.log("📍 Coordenadas capturadas:", { lat, lng });

      if (tempMarker) mapInstance.removeLayer(tempMarker);

      const newTempMarker = L.marker([lat, lng], {
        icon: createTempIcon(),
        zIndexOffset: 1000,
      }).addTo(mapInstance);

      newTempMarker
        .bindPopup(
          `
        <div style="text-align: center;">
          <h4>📍 Coordenadas Capturadas</h4>
          <p><strong>Lat:</strong> ${lat.toFixed(6)}</p>
          <p><strong>Lng:</strong> ${lng.toFixed(6)}</p>
          <button onclick="window.useCapturedCoords(${lat}, ${lng})" 
            style="background: #27ae60; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
            Usar estas coordenadas
          </button>
        </div>
      `
        )
        .openPopup();

      setTempMarker(newTempMarker);
      setCapturedCoords({ lat, lng });
    };

    window.useCapturedCoords = (lat, lng) => {
      console.log("🔄 Coordenadas usadas:", { lat, lng });
      setCapturedCoords({ lat, lng });
      setCoordinateDetection(false);
      setEditingBuilding(null);
      setShowBuildingForm(true);
      if (tempMarker) mapInstance.removeLayer(tempMarker);
      setTempMarker(null);
      mapInstance.getContainer().style.cursor = "";
    };

    mapInstance.on("click", handleMapClick);

    return () => {
      mapInstance.off("click", handleMapClick);
      delete window.useCapturedCoords;
    };
  }, [mapInstance, coordinateDetection, tempMarker]);

  // Guardar o actualizar edificio
  const handleSaveBuilding = async (buildingData) => {
    try {
      if (editingBuilding) {
        const id =
          editingBuilding.id ||
          editingBuilding._id ||
          editingBuilding.id_edificio;
        await buildingService.updateBuilding(id, buildingData);
        alert("✅ Edificio actualizado");
      } else {
        await buildingService.createBuilding(buildingData);
        alert("✅ Edificio creado");
      }

      await loadBuildings();
      setEditingBuilding(null);
      setShowBuildingForm(false);
      setCapturedCoords(null);
    } catch (error) {
      console.error("Error al guardar edificio:", error);
      alert("❌ Error al guardar edificio");
    }
  };

  const handleAddBuilding = () => {
    setEditingBuilding(null);
    setShowBuildingForm(true);
  };

  // FUNCIÓN UNIFICADA PARA GESTIÓN DE EDIFICIOS
  const handleManageBuildings = () => {
    setShowBuildingList(true);
    setShowRoomManagement(false);
    setShowRouteList(false);
  };

  const handleEditBuilding = (b) => {
    setEditingBuilding(b);
    setShowBuildingForm(true);
    setShowBuildingList(false);
  };

  const handleCancelEdit = () => {
    setEditingBuilding(null);
    setShowBuildingForm(false);
    setCapturedCoords(null);
  };

  const handleCloseBuildingList = () => setShowBuildingList(false);

  const handleDeleteBuilding = async (b) => {
    if (
      window.confirm(`¿Estás seguro de eliminar el edificio "${b.nombre}"?`)
    ) {
      try {
        const id = b.id || b._id || b.id_edificio;
        await deleteBuilding(id);
        console.log("✅ Edificio eliminado");
      } catch (err) {
        console.error("❌ Error al eliminar edificio:", err);
        alert("Error al eliminar edificio");
      }
    }
  };

  // Render de capas de edificios
  useEffect(() => {
    if (!mapInstance || !isMapReady) return;

    // Limpiar capas anteriores
    buildingLayers.forEach((layer) => {
      if (mapInstance.hasLayer(layer)) {
        mapInstance.removeLayer(layer);
      }
    });

    const newLayers = [];

    buildings.forEach((b) => {
      if (!b.ubicacion) return;

      let layer;
      try {
        if (b.ubicacion.type === "Point") {
          const [lng, lat] = b.ubicacion.coordinates;
          layer = L.marker([lat, lng], { icon: createDatabaseIcon() });
        } else if (b.ubicacion.type === "Polygon") {
          const coords = b.ubicacion.coordinates[0].map((c) => [c[1], c[0]]);
          layer = L.polygon(coords, {
            color: "#27ae60",
            weight: 3,
            fillOpacity: 0.3,
            className: "building-polygon",
          });
        }

        if (layer) {
          const popup = `
            <div style="min-width:200px;">
              <h4>${b.nombre || "Sin nombre"}</h4>
              <p><strong>Descripción:</strong> ${
                b.descripcion || "Sin descripción"
              }</p>
              <p><strong>Tipo:</strong> ${b.tipo || "No especificado"}</p>
              <hr>
              <small style="color:#27ae60;">📍 En Base de Datos</small>
            </div>`;

          layer.bindPopup(popup).addTo(mapInstance);
          newLayers.push(layer);
        }
      } catch (error) {
        console.error("❌ Error renderizando edificio:", b.nombre, error);
      }
    });

    setBuildingLayers(newLayers);
    console.log(`🏢 ${newLayers.length} edificios renderizados`);
  }, [mapInstance, buildings, isMapReady]);

  // Cargar datos de GeoServer cuando el mapa esté listo
  useEffect(() => {
    if (isMapReady && mapInstance && geoServerStatus === "checking") {
      console.log("🌍 Cargando datos de GeoServer...");
      setTimeout(() => {
        loadWFSData(mapInstance, "edificio");
      }, 1000);
    }
  }, [isMapReady, mapInstance, geoServerStatus, loadWFSData]);

  const handleLogout = () => {
    if (window.confirm("¿Estás seguro de que quieres cerrar sesión?")) {
      alert("Sesión cerrada");
    }
  };

  const handleSyncData = async () => {
    if (geoServerFeatures.length > 0) {
      try {
        await syncWithGeoServer(geoServerFeatures);
        alert(`✅ ${geoServerFeatures.length} edificios sincronizados`);
        await loadBuildings();
      } catch (error) {
        console.error("❌ Error sincronizando datos:", error);
        alert("❌ Error sincronizando datos");
      }
    } else {
      alert("ℹ️ No hay datos de GeoServer para sincronizar");
    }
  };

  return (
    <div className="container">
      {/* SIDEPANEL SIMPLIFICADO */}
      <SidePanel
        status={backendStatus === "connected" ? "success" : "error"}
        featuresCount={buildings.length}
        routesCount={routes.length}
        onLogout={handleLogout}
        onSyncData={handleSyncData}
        buildingsLoading={buildingsLoading}
        backendStatus={backendStatus}
        geoServerStatus={geoServerStatus}
        geoServerFeaturesCount={geoServerFeatures.length}
        onAddBuilding={handleAddBuilding}
        onManageBuildings={handleManageBuildings}
        onToggleCoordinateDetection={toggleCoordinateDetection}
        coordinateDetectionActive={coordinateDetection}
        onAddRoute={handleAddRoute}
        onManageRoutes={handleManageRoutes}
      />

      {/* BUILDINGFORM */}
      <BuildingForm
        onSave={handleSaveBuilding}
        onCancel={handleCancelEdit}
        isVisible={showBuildingForm}
        building={editingBuilding}
        isEditing={!!editingBuilding}
        capturedCoordinates={capturedCoords}
        onClearCoordinates={() => setCapturedCoords(null)}
      />

      {/* BUILDINGLIST CON GESTIÓN DE SALAS INTEGRADA */}
      {showBuildingList && (
        <BuildingList
          buildings={buildings}
          onEditBuilding={handleEditBuilding}
          onDeleteBuilding={handleDeleteBuilding}
          onClose={handleCloseBuildingList}
          onEditRoom={handleOpenEditRoom}
          onCreateRooms={handleCreateRoomsForBuilding}
          onAddRooms={handleOpenCreateRooms}
          onDeleteRoom={handleDeleteRoom}
          onReload={loadBuildings}
        />
      )}

      {/* ROOMMANAGEMENT */}
      {showRoomManagement && (
        <RoomManagement
          mode={roomManagementMode}
          buildings={buildings}
          selectedBuilding={selectedBuildingForRooms}
          onSaveRooms={handleSaveRooms}
          onUpdateRoom={handleUpdateRoom}
          onDeleteRoom={handleDeleteRoom}
          onClose={() => setShowRoomManagement(false)}
          existingRooms={selectedRooms}
        />
      )}

      {/* AGREGAR LOS NUEVOS COMPONENTES AL JSX */}
      {/* RouteForm */}
      <RouteForm
        onSave={handleSaveRoute}
        onCancel={handleCancelRouteEdit}
        isVisible={showRouteForm}
        route={editingRoute}
        isEditing={!!editingRoute}
        buildings={buildings}
      />

      {/* RouteList */}
      {showRouteList && (
        <RouteList
          routes={routes}
          onEditRoute={handleEditRoute}
          onDeleteRoute={handleDeleteRoute}
          onClose={handleCloseRouteList}
          onSelectRoute={handleRouteClick}
        />
      )}

      {/* RouteLayer */}
      <RouteLayer
        mapInstance={mapInstance}
        routes={routes}
        onRouteClick={handleRouteClick}
      />

      {/* MODO CAPTURA */}
      {coordinateDetection && (
        <div className="coordinate-detection-indicator">
          🎯 Modo Captura - Haz clic en el mapa
        </div>
      )}

      {/* CONTENEDOR DEL MAPA */}
      <div className="Mapa">
        <div ref={mapRef} className="map-container"></div>

        {!isMapReady && (
          <div className="loading-overlay">
            <div className="loading-message">
              <div>🗺️ Cargando mapa...</div>
              <div className="loading-spinner"></div>
            </div>
          </div>
        )}

        {buildingsLoading && (
          <div className="loading-indicator">📍 Cargando edificios...</div>
        )}

        {buildingsError && (
          <div className="error-indicator">❌ Error: {buildingsError}</div>
        )}

        {/* INDICADORES AGREGAR AL MAPA */}
        {routesLoading && (
          <div className="loading-indicator">🛣️ Cargando rutas...</div>
        )}

        {selectedRoute && (
          <div className="selected-route-indicator">
            🧭 Ruta seleccionada: {selectedRoute.nombre}
            {selectedRoute.distancia && ` (${selectedRoute.distancia}m`}
            {selectedRoute.tiempo_estimado &&
              ` - ${selectedRoute.tiempo_estimado}min)`}
            <button onClick={() => setSelectedRoute(null)}>×</button>
          </div>
        )}

        {routesError && (
          <div className="error-indicator">❌ Error rutas: {routesError}</div>
        )}

        <div className="building-counter">
          🏢 Edificios: {buildingLayers.length}
        </div>
      </div>
    </div>
  );
}

export default Map;
