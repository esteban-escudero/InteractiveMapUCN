import React, { useEffect, useState, useCallback, useMemo } from "react";
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
import { useNotification } from "../../hooks/useNotification"; // ← CORRECTO
import Notification from "../UI/Notification/Notification"; // ← CORREGIDO

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

  const { notification, showNotification, hideNotification } = useNotification();

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
    if (!buildings || !buildings.length) {
      console.log('🏢 No hay edificios para buscar el más cercano');
      return null;
    }

    try {
      const targetPoint = { lat, lng };
      
      // Validar coordenadas objetivo
      if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
        console.warn('❌ Coordenadas objetivo inválidas:', { lat, lng });
        return null;
      }

      const buildingPoints = buildings.map(building => {
        try {
          if (!building) return null;

          let buildingLat, buildingLng;
          
          if (building.ubicacion && building.ubicacion.type === "Point") {
            const coords = building.ubicacion.coordinates;
            if (!coords || coords.length < 2) return null;
            [buildingLng, buildingLat] = coords;
          } else if (building.lat && building.lng) {
            buildingLat = building.lat;
            buildingLng = building.lng;
          } else {
            return null;
          }

          // Validar que las coordenadas del edificio sean números
          if (typeof buildingLat !== 'number' || typeof buildingLng !== 'number' ||
              isNaN(buildingLat) || isNaN(buildingLng)) {
            console.warn('❌ Coordenadas de edificio inválidas:', building.nombre, { buildingLat, buildingLng });
            return null;
          }

          return {
            lat: buildingLat,
            lng: buildingLng,
            building: building
          };
        } catch (error) {
          console.warn('❌ Error procesando edificio:', building?.nombre, error);
          return null;
        }
      }).filter(Boolean);

      if (buildingPoints.length === 0) {
        console.log('🏢 No se encontraron puntos de edificio válidos');
        return null;
      }

      console.log(`🏢 Buscando entre ${buildingPoints.length} edificios válidos`);
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
      showNotification("✅ Salas creadas exitosamente", "success");
    } catch (error) {
      console.error("Error al crear salas:", error);
      showNotification("❌ Error al crear salas", "error");
      throw error;
    }
  };

  const handleUpdateRoom = async (roomId, roomData) => {
    try {
      await roomService.updateRoom(roomId, roomData);
      await loadBuildings();
      showNotification("✅ Sala actualizada exitosamente", "success");
    } catch (error) {
      console.error("Error al actualizar sala:", error);
      showNotification("❌ Error al actualizar sala", "error");
      throw error;
    }
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      console.log("🗑️ Eliminando sala ID:", roomId);
      await roomService.deleteRoom(roomId);
      await loadBuildings();
      showNotification("✅ Sala eliminada exitosamente", "success");
    } catch (error) {
      console.error("❌ Error al eliminar sala:", error);
      showNotification("❌ Error al eliminar sala", "error");
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
          showNotification("⚠️ Algunos puntos de la ruta están fuera de los límites del campus", "warning");
          return;
        }

        // Validar geometría de la ruta
        if (!SpatialUtils.isValidLineString(coordinates)) {
          showNotification("❌ La geometría de la ruta no es válida", "error");
          return;
        }
      }

      if (editingRoute) {
        await updateRoute(editingRoute.id, routeData);
        showNotification("✅ Ruta actualizada correctamente", "success");
      } else {
        await createRoute(routeData);
        showNotification("✅ Ruta creada correctamente", "success");
      }

      setEditingRoute(null);
      setShowRouteForm(false);
      await loadRoutes();
    } catch (error) {
      console.error("Error al guardar ruta:", error);
      showNotification("❌ Error al guardar ruta", "error");
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
      try {
        await deleteRoute(route.id);
        showNotification("✅ Ruta eliminada correctamente", "success");
        if (selectedRoute && selectedRoute.id === route.id) {
          setSelectedRoute(null);
        }
      } catch (err) {
        console.error("❌ Error al eliminar ruta:", err);
        showNotification("❌ Error al eliminar ruta", "error");
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

      // ✅ VALIDAR COORDENADAS ANTES DE PROCESAR
      if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
        console.error('❌ Coordenadas capturadas inválidas');
        return;
      }

      // ✅ VALIDAR CON TURF
      const isValid = validateCoordinates(lat, lng);

      // Limpiar marcador anterior si existe
      if (tempMarker && mapInstance) {
        mapInstance.removeLayer(tempMarker);
      }

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
      try {
        const nearestBuilding = findNearestBuilding(lat, lng);
        if (nearestBuilding) {
          const distance = SpatialUtils.calculateDistance(
            { lat, lng },
            { 
              lat: nearestBuilding.lat || nearestBuilding.ubicacion?.coordinates[1],
              lng: nearestBuilding.lng || nearestBuilding.ubicacion?.coordinates[0]
            }
          );
          
          // Solo mostrar si la distancia es un número válido
          if (!isNaN(distance) && distance !== Infinity) {
            popupContent += `
              <p style="color: #27ae60; font-size: 12px;">
                🏢 Más cercano: ${nearestBuilding.nombre} (${Math.round(distance)}m)
              </p>
            `;
          }
        }
      } catch (error) {
        console.warn('❌ Error mostrando edificio más cercano:', error);
        // No agregar nada al popup si hay error
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
        showNotification("Edificio actualizado correctamente", "success");
      } else {
        await buildingService.createBuilding(buildingData);
        showNotification("Edificio creado correctamente", "success");
      }

      await loadBuildings();
      setEditingBuilding(null);
      setShowBuildingForm(false);
      setCapturedCoords(null);
    } catch (error) {
      console.error("Error al guardar edificio:", error);
      showNotification("Error al guardar edificio", "error");
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
// Map.js - VERSIÓN CORREGIDA:
const handleDeleteBuilding = async (b) => {
  // ✅ ELIMINAR EL CONFIRM - EJECUTAR DIRECTAMENTE
  try {
    const id = b.id || b._id || b.id_edificio;
    await deleteBuilding(id);
    showNotification("✅ Edificio eliminado correctamente", "success");
  } catch (err) {
    console.error("❌ Error al eliminar edificio:", err);
    showNotification("❌ Error al eliminar edificio", "error");
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
      showNotification("👋 Sesión cerrada correctamente", "success");
    }
  };

  const handleSyncData = async () => {
    if (geoServerFeatures.length > 0) {
      try {
        await syncWithGeoServer(geoServerFeatures);
        showNotification(`✅ ${geoServerFeatures.length} edificios sincronizados`, "success");
        await loadBuildings();
      } catch (error) {
        console.error("❌ Error sincronizando datos:", error);
        showNotification("❌ Error sincronizando datos", "error");
      }
    } else {
      showNotification("ℹ️ No hay datos de GeoServer para sincronizar", "warning");
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
        originFilter={originFilter}
        destinationFilter={destinationFilter}
        categoryFilter={categoryFilter}
        onOriginFilterChange={(e) => setOriginFilter(e.target.value)}
        onDestinationFilterChange={(e) => setDestinationFilter(e.target.value)}
        onCategoryFilterChange={(e) => setCategoryFilter(e.target.value)} // ✅ SIN LIMPIAR ORIGEN/DESTINO
        onClearFilters={() => {
          setOriginFilter('');
          setDestinationFilter('');
          setCategoryFilter('');
        }}
        filteredBuildings={filteredBuildings}
      />

       {/* 🆕 REEMPLAZAR LA NOTIFICACIÓN INLINE POR EL COMPONENTE */}
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
          duration={3000}
          position="top-right"
        />
      )}

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

      {/* MODO CAPTURA - REVISAR*/}
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