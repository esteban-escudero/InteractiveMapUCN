import React, { useEffect, useState, useCallback, useMemo } from "react"; // ✅ AGREGAR useMemo
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
import {
  UCN_COQUIMBO_BOUNDS,
  MAP_ZOOM_LIMITS,
} from "../../constants/mapConfig";
import { buildingService } from "../../services/buildingService";
import { roomService } from "../../services/roomService";
import useRoutes from "../../hooks/useRoutes";
import RouteFormWithNodes from "../Forms/RouteFormWithNodes";
import RouteLayer from "./RouteLayer";
import RouteList from "../UI/RouteList/RouteList";
import { SpatialUtils } from "../../utils/spatialUtils";
import RouteNetwork from '../RouteNetwork/RouteNetwork';

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
  const [campusBoundsPolygon, setCampusBoundsPolygon] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [showRouteList, setShowRouteList] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showRouteNetwork, setShowRouteNetwork] = useState(false);

  const [originFilter, setOriginFilter] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

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

  // ✅ INICIALIZAR POLÍGONO DEL CAMPUS CON TURF
  useEffect(() => {
    if (UCN_COQUIMBO_BOUNDS && UCN_COQUIMBO_BOUNDS.length >= 2) {
      try {
        const polygonCoords = [
          [UCN_COQUIMBO_BOUNDS[0][1], UCN_COQUIMBO_BOUNDS[0][0]], // [lng, lat]
          [UCN_COQUIMBO_BOUNDS[1][1], UCN_COQUIMBO_BOUNDS[0][0]],
          [UCN_COQUIMBO_BOUNDS[1][1], UCN_COQUIMBO_BOUNDS[1][0]],
          [UCN_COQUIMBO_BOUNDS[0][1], UCN_COQUIMBO_BOUNDS[1][0]],
          [UCN_COQUIMBO_BOUNDS[0][1], UCN_COQUIMBO_BOUNDS[0][0]], // cerrar polígono
        ];
        setCampusBoundsPolygon(polygonCoords);
        console.log("✅ Polígono del campus inicializado con Turf");
      } catch (error) {
        console.error("❌ Error inicializando polígono del campus:", error);
      }
    }
  }, []);

  // ✅ VALIDAR COORDENADAS CON TURF
  const validateCoordinates = useCallback((lat, lng) => {
    if (!campusBoundsPolygon) return true; // Si no hay polígono, permitir todas
    
    try {
      const isValid = SpatialUtils.isPointInPolygon(lat, lng, campusBoundsPolygon);
      if (!isValid) {
        console.warn(`❌ Coordenadas fuera del campus: ${lat}, ${lng}`);
        setValidationErrors(prev => [...prev, {
          type: 'out_of_bounds',
          lat,
          lng,
          message: 'Coordenadas fuera de los límites del campus'
        }]);
      }
      return isValid;
    } catch (error) {
      console.error("❌ Error validando coordenadas:", error);
      return true; // En caso de error, permitir
    }
  }, [campusBoundsPolygon]);

  // ✅ ENCONTRAR EDIFICIO MÁS CERCANO CON TURF
  const findNearestBuilding = useCallback((lat, lng) => {
    if (!buildings.length) return null;
    
    try {
      const targetPoint = { lat, lng };
      const buildingPoints = buildings.map(building => {
        let buildingLat, buildingLng;
        
        if (building.ubicacion && building.ubicacion.type === "Point") {
          [buildingLng, buildingLat] = building.ubicacion.coordinates;
        } else if (building.lat && building.lng) {
          buildingLat = building.lat;
          buildingLng = building.lng;
        } else {
          return null;
        }
        
        return {
          lat: buildingLat,
          lng: buildingLng,
          building: building
        };
      }).filter(Boolean);

      if (buildingPoints.length === 0) return null;

      const nearest = SpatialUtils.findNearestPoint(targetPoint, buildingPoints);
      return nearest ? nearest.building : null;
    } catch (error) {
      console.error("❌ Error encontrando edificio más cercano:", error);
      return null;
    }
  }, [buildings]);

  // ✅ FUNCIÓN PARA FILTRAR EDIFICIOS POR CATEGORÍA
  const filteredBuildings = useMemo(() => {
    if (!categoryFilter) return buildings;
    
    return buildings.filter(building => 
      building.categoria === categoryFilter || 
      building.tipo === categoryFilter
    );
  }, [buildings, categoryFilter]);

  // INICIALIZAR MAPA
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

  // ✅ UN SOLO useEffect PARA RENDERIZAR EDIFICIOS (ELIMINAR EL DUPLICADO)
  useEffect(() => {
    if (!mapInstance || !isMapReady) return;

    // Limpiar capas anteriores
    buildingLayers.forEach((layer) => {
      if (mapInstance.hasLayer(layer)) {
        mapInstance.removeLayer(layer);
      }
    });

    const newLayers = [];

    // ✅ USAR filteredBuildings EN LUGAR DE buildings
    filteredBuildings.forEach((b) => {
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
          // ✅ CALCULAR ÁREA CON TURF PARA POLÍGONOS
          let areaInfo = "";
          if (b.ubicacion.type === "Polygon") {
            try {
              const area = SpatialUtils.calculatePolygonArea(b.ubicacion.coordinates[0]);
              areaInfo = `<p><strong>Área aproximada:</strong> ${Math.round(area)} m²</p>`;
            } catch (error) {
              console.error("Error calculando área:", error);
            }
          }

          const popup = `
            <div style="min-width:200px;">
              <h4>${b.nombre || "Sin nombre"}</h4>
              <p><strong>Descripción:</strong> ${
                b.descripcion || "Sin descripción"
              }</p>
              <p><strong>Categoría:</strong> ${
                b.categoria || b.tipo || "No especificada"
              }</p>
              ${areaInfo}
            </div>`;

          layer.bindPopup(popup).addTo(mapInstance);
          newLayers.push(layer);
        }
      } catch (error) {
        console.error("❌ Error renderizando edificio:", b.nombre, error);
      }
    });

    setBuildingLayers(newLayers);
    console.log(`🏢 ${newLayers.length} edificios renderizados (filtro: ${categoryFilter || 'ninguno'})`);
  }, [mapInstance, filteredBuildings, isMapReady]); // ✅ SOLO filteredBuildings

  // FUNCIONES PARA GESTIÓN DE SALAS
  const handleCreateRoomsForBuilding = (building) => {
    console.log("🏢 Agregando sala al edificio:", building.nombre);
    setSelectedBuildingForRooms(building);
    setRoomManagementMode("create");
    setSelectedRooms([]);
    setShowRoomManagement(true);
    setShowBuildingList(false);
    console.log("🏢 Creando salas para edificio:", building.nombre);
  };

  const handleOpenCreateRooms = () => {
    setRoomManagementMode("create");
    setSelectedRooms([]);
    setSelectedBuildingForRooms(null);
    setShowRoomManagement(true);
    setShowBuildingList(false);
    console.log("➕ Abriendo creación de salas (sin edificio específico)");
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
      // ✅ VALIDAR RUTA CON TURF ANTES DE GUARDAR
      if (routeData.puntos_ruta && routeData.puntos_ruta.length >= 2) {
        const coordinates = routeData.puntos_ruta.map(p => p.coordenadas.coordinates);
        
        // Validar que todos los puntos estén dentro del campus
        const invalidPoints = routeData.puntos_ruta.filter(punto => {
          const [lng, lat] = punto.coordenadas.coordinates;
          return !validateCoordinates(lat, lng);
        });

        if (invalidPoints.length > 0) {
          alert("⚠️ Algunos puntos de la ruta están fuera de los límites del campus");
          return;
        }

        // Validar geometría de la ruta
        if (!SpatialUtils.isValidLineString(coordinates)) {
          alert("❌ La geometría de la ruta no es válida");
          return;
        }
      }

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
    
    // ✅ USAR TURF PARA CALCULAR BOUNDS DE LA RUTA
    if (mapInstance && route.geometria) {
      const coordinates = route.geometria.coordinates;
      if (coordinates.length > 0) {
        try {
          const points = coordinates.map(coord => ({ lng: coord[0], lat: coord[1] }));
          const bbox = SpatialUtils.calculateBoundingBox(points);
          if (bbox) {
            const bounds = L.latLngBounds(
              [bbox[1], bbox[0]], // [minLat, minLng]
              [bbox[3], bbox[2]]  // [maxLat, maxLng]
            );
            mapInstance.fitBounds(bounds, { padding: [20, 20] });
          }
        } catch (error) {
          console.error("❌ Error calculando bounds con Turf:", error);
          // Fallback al método original
          const bounds = coordinates.map(coord => [coord[1], coord[0]]);
          mapInstance.fitBounds(bounds, { padding: [20, 20] });
        }
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

  // ✅ CAPTURAR CLIC EN EL MAPA CON VALIDACIÓN TURF
  useEffect(() => {
    if (!mapInstance || !coordinateDetection) return;

    const handleMapClick = (e) => {
      const { lat, lng } = e.latlng;
      console.log("📍 Coordenadas capturadas:", { lat, lng });

      // ✅ VALIDAR CON TURF
      const isValid = validateCoordinates(lat, lng);
      
      if (tempMarker) mapInstance.removeLayer(tempMarker);

      const newTempMarker = L.marker([lat, lng], {
        icon: createTempIcon(),
        zIndexOffset: 1000,
      }).addTo(mapInstance);

      let popupContent = `
        <div style="text-align: center;">
          <h4>📍 Coordenadas Capturadas</h4>
          <p><strong>Lat:</strong> ${lat.toFixed(6)}</p>
          <p><strong>Lng:</strong> ${lng.toFixed(6)}</p>
      `;

      if (!isValid) {
        popupContent += `
          <p style="color: #e74c3c; font-weight: bold;">
            ⚠️ Fuera del campus
          </p>
        `;
      }

      // ✅ ENCONTRAR EDIFICIO MÁS CERCANO
      const nearestBuilding = findNearestBuilding(lat, lng);
      if (nearestBuilding) {
        const distance = SpatialUtils.calculateDistance(
          { lat, lng },
          { 
            lat: nearestBuilding.lat || nearestBuilding.ubicacion?.coordinates[1],
            lng: nearestBuilding.lng || nearestBuilding.ubicacion?.coordinates[0]
          }
        );
        popupContent += `
          <p style="color: #27ae60; font-size: 12px;">
            🏢 Más cercano: ${nearestBuilding.nombre} (${Math.round(distance)}m)
          </p>
        `;
      }

      popupContent += `
          <button onclick="window.useCapturedCoords(${lat}, ${lng})" 
            style="background: ${isValid ? '#27ae60' : '#e74c3c'}; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-top: 5px;">
            ${isValid ? 'Usar estas coordenadas' : 'Usar de todas formas'}
          </button>
        </div>
      `;

      newTempMarker.bindPopup(popupContent).openPopup();

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
  }, [mapInstance, coordinateDetection, tempMarker, validateCoordinates, findNearestBuilding]);

  // Guardar o actualizar edificio
  const handleSaveBuilding = async (buildingData) => {
    try {
      // ✅ VALIDAR COORDENADAS CON TURF ANTES DE GUARDAR
      const isValid = validateCoordinates(buildingData.lat, buildingData.lng);
      
      if (!isValid) {
        const confirmSave = window.confirm(
          "⚠️ Las coordenadas están fuera de los límites del campus. ¿Deseas guardar de todas formas?"
        );
        if (!confirmSave) return;
      }

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

  // 🎯 Función para resetear vista al campus
  const handleResetView = () => {
    if (mapInstance) {
      const boundsLatLng = L.latLngBounds(UCN_COQUIMBO_BOUNDS);
      mapInstance.fitBounds(boundsLatLng, {
        padding: [50, 50],
        maxZoom: MAP_ZOOM_LIMITS.default,
        animate: true,
        duration: 0.5,
      });
      console.log("🎯 Vista reseteada al Campus Guayacán");
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
        // AGREGAR PROPS PARA RouteNetwork
        onToggleRouteNetwork={() => setShowRouteNetwork(!showRouteNetwork)}
        routeNetworkActive={showRouteNetwork}
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
        onToggleCoordinateDetection={toggleCoordinateDetection}
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
          onClose={() => {
            setShowRoomManagement(false);
            setSelectedBuildingForRooms(null);
            setSelectedRooms([]);
          }}
          existingRooms={selectedRooms}
        />
      )}

      {/* ✅ RouteFormWithNodes */}
      <RouteFormWithNodes
        onSave={handleSaveRoute}
        onCancel={handleCancelRouteEdit}
        isVisible={showRouteForm}
        route={editingRoute}
        isEditing={!!editingRoute}
        mapInstance={mapInstance}
        existingRoutes={routes}
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

      {/* AGREGAR COMPONENTE RouteNetwork */}
      {showRouteNetwork && (
        <RouteNetwork
          mapInstance={mapInstance}
          onNodeClick={(node) => {
            console.log('🔗 Nodo seleccionado:', node);
            // Zoom automático al nodo
            if (mapInstance) {
              mapInstance.setView([node.coordenadas.lat, node.coordenadas.lng], 18);
            }
          }}
          onRouteClick={(routeInfo) => {
            console.log('🛣️ Ruta seleccionada desde nodo:', routeInfo);
            // Buscar la ruta completa y seleccionarla
            const fullRoute = routes.find(r => r.id === routeInfo.routeId);
            if (fullRoute) {
              setSelectedRoute(fullRoute);
              handleRouteClick(fullRoute);
            }
          }}
        />
      )}

      {/* MODO CAPTURA */}
      {coordinateDetection && (
        <div className="coordinate-detection-indicator">
          🎯 Modo Captura - Haz clic en el mapa
          <span style={{color: '#27ae60', marginLeft: '10px'}}>
            📍 Turf.js activado
          </span>
        </div>
      )}

      {/* ✅ INDICADOR DE VALIDACIONES TURF */}
      {validationErrors.length > 0 && (
        <div className="error-indicator" style={{top: '110px'}}>
          ⚠️ {validationErrors.length} advertencia(s) de validación
          <button 
            onClick={() => setValidationErrors([])}
            style={{marginLeft: '10px', background: 'none', border: 'none', color: 'white', cursor: 'pointer'}}>
            ×
          </button>
        </div>
      )}

    {/* CONTENEDOR DEL MAPA */}
      <div className="Mapa">
        {/* ✅ CONTENEDOR DE FILTROS EN LA PARTE SUPERIOR */}
        <div className="map-filters-container">
          {/* FILTRO POR ORIGEN */}
          <div className="map-filter">
            <label htmlFor="origin-filter">🔍 Origen:</label>
            <select
              id="origin-filter"
              value={originFilter}
              onChange={(e) => setOriginFilter(e.target.value)}
              className="map-select"
            >
              <option value="">Seleccionar origen</option>
              {filteredBuildings
                .filter((building, index, self) => 
                  self.findIndex(b => b.nombre === building.nombre) === index
                )
                .map(building => (
                  <option key={`origin-${building.id || building._id}`} value={building.nombre}>
                    {building.nombre || 'Sin nombre'}
                  </option>
                ))
              }
            </select>
          </div>

          {/* FILTRO POR DESTINO */}
          <div className="map-filter">
            <label htmlFor="destination-filter">🔍 Destino:</label>
            <select
              id="destination-filter"
              value={destinationFilter}
              onChange={(e) => setDestinationFilter(e.target.value)}
              className="map-select"
            >
              <option value="">Seleccionar destino</option>
              {filteredBuildings
                .filter((building, index, self) => 
                  self.findIndex(b => b.nombre === building.nombre) === index
                )
                .map(building => (
                  <option key={`destination-${building.id || building._id}`} value={building.nombre}>
                    {building.nombre || 'Sin nombre'}
                  </option>
                ))
              }
            </select>
          </div>

          {/* FILTRO POR CATEGORÍA */}
          <div className="map-filter">
            <label htmlFor="category-filter">🏛️ Categoria:</label>
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                // ✅ LIMPIAR ORIGEN Y DESTINO AL CAMBIAR CATEGORÍA
                setOriginFilter('');
                setDestinationFilter('');
              }}
              className="map-select"
            >
              <option value="">Todas las categorías</option>
              <option value="Académico">Académico</option>
              <option value="Administrativo">Administrativo</option>
              <option value="Servicios">Servicios</option>
              <option value="Deportivo">Deportivo</option>
              <option value="Cultural">Cultural</option>
              <option value="Investigación">Investigación</option>
            </select>
          </div>

          {/* BOTÓN PARA LIMPIAR FILTROS - SIEMPRE PRESENTE */}
          <button
            onClick={() => {
              setOriginFilter('');
              setDestinationFilter('');
              setCategoryFilter('');
            }}
            className="clear-filters-btn"
            disabled={!originFilter && !destinationFilter && !categoryFilter}
          >
            🗑️ Limpiar Filtros
          </button>
        </div>

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

        {routesError && (
          <div className="error-indicator">❌ Error rutas: {routesError}</div>
        )}
      </div>
    </div>
  );
}

export default Map;