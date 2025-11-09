import React, { useEffect, useState, useCallback, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.css";

// Hooks
import { useMap } from "../../hooks/useMap";
import { useBuildings } from "../../hooks/useBuildings";
import { useGeoServer } from "../../hooks/useGeoServer";
import { useMapManagement } from "../../hooks/useMapManagement";
import { useCoordinateManagement } from "../../hooks/useCoordinateManagement";

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
import {
  UCN_COQUIMBO_BOUNDS,
  MAP_ZOOM_LIMITS,
} from "../../constants/mapConfig";
import { buildingService } from "../../services/buildingService";
import { roomService } from "../../services/roomService";
import useRoutes from "../../hooks/useRoutes";
import { SpatialUtils } from "../../utils/spatialUtils";
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
  const [campusBoundsPolygon, setCampusBoundsPolygon] = useState(null);

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

  // Validación de coordenadas y búsqueda del edificio más cercano
  const validateCoordinates = useCallback(
    (lat, lng) => {
      if (!campusBoundsPolygon) return true;

      // Validar que lat y lng sean números válidos
      try {
        const isValid = SpatialUtils.isPointInPolygon(
          lat,
          lng,
          campusBoundsPolygon
        );
        if (!isValid) {
          console.warn(`Coordenadas fuera del campus: ${lat}, ${lng}`);
        }
        return isValid;
      } catch (error) {
        console.error("Error validando coordenadas:", error);
        return true;
      }
    },
    [campusBoundsPolygon]
  );

  // Búsqueda del edificio más cercano
  const findNearestBuilding = useCallback(
    (lat, lng) => {
      if (!buildings || !buildings.length) {
        console.log("No hay edificios para buscar el más cercano");
        return null;
      }

      try {
        const targetPoint = { lat, lng };

        if (
          typeof lat !== "number" ||
          typeof lng !== "number" ||
          isNaN(lat) ||
          isNaN(lng)
        ) {
          console.warn("Coordenadas objetivo inválidas:", { lat, lng });
          return null;
        }

        const buildingPoints = buildings
          .map((building) => {
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

              if (
                typeof buildingLat !== "number" ||
                typeof buildingLng !== "number" ||
                isNaN(buildingLat) ||
                isNaN(buildingLng)
              ) {
                console.warn(
                  "Coordenadas de edificio inválidas:",
                  building.nombre,
                  { buildingLat, buildingLng }
                );
                return null;
              }

              return {
                lat: buildingLat,
                lng: buildingLng,
                building: building,
              };
            } catch (error) {
              console.warn(
                "Error procesando edificio:",
                building?.nombre,
                error
              );
              return null;
            }
          })
          .filter(Boolean);

        if (buildingPoints.length === 0) {
          console.log("No se encontraron puntos de edificio válidos");
          return null;
        }

        console.log(
          `Buscando entre ${buildingPoints.length} edificios válidos`
        );
        const nearest = SpatialUtils.findNearestPoint(
          targetPoint,
          buildingPoints
        );
        return nearest ? nearest.building : null;
      } catch (error) {
        console.error("Error encontrando edificio más cercano:", error);
        return null;
      }
    },
    [buildings]
  );

  // Hooks de gestión de estado
  const mapManagement = useMapManagement();
  const coordinateManagement = useCoordinateManagement(
    mapInstance,
    validateCoordinates,
    findNearestBuilding
  );

  // Inicialización del polígono del campus
  useEffect(() => {
    if (UCN_COQUIMBO_BOUNDS && UCN_COQUIMBO_BOUNDS.length >= 2) {
      try {
        const polygonCoords = [
          [UCN_COQUIMBO_BOUNDS[0][1], UCN_COQUIMBO_BOUNDS[0][0]],
          [UCN_COQUIMBO_BOUNDS[1][1], UCN_COQUIMBO_BOUNDS[0][0]],
          [UCN_COQUIMBO_BOUNDS[1][1], UCN_COQUIMBO_BOUNDS[1][0]],
          [UCN_COQUIMBO_BOUNDS[0][1], UCN_COQUIMBO_BOUNDS[1][0]],
          [UCN_COQUIMBO_BOUNDS[0][1], UCN_COQUIMBO_BOUNDS[0][0]],
        ];
        setCampusBoundsPolygon(polygonCoords);
        console.log("Polígono del campus inicializado con Turf");
      } catch (error) {
        console.error("Error inicializando polígono del campus:", error);
      }
    }
  }, []);

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

  // Manejo de clics en el mapa para captura de coordenadas
  useEffect(() => {
    if (!mapInstance || !coordinateManagement.coordinateDetection) return;

    const handleMapClick = (e) => {
      const { lat, lng } = e.latlng;
      console.log("Coordenadas capturadas:", { lat, lng });

      if (
        typeof lat !== "number" ||
        typeof lng !== "number" ||
        isNaN(lat) ||
        isNaN(lng)
      ) {
        console.error("Coordenadas capturadas inválidas");
        return;
      }

      const isValid = validateCoordinates(lat, lng);

      // Limpiar marcador anterior si existe
      if (coordinateManagement.tempMarker && mapInstance) {
        mapInstance.removeLayer(coordinateManagement.tempMarker);
      }

      const newTempMarker = L.marker([lat, lng], {
        icon: coordinateManagement.createTempIcon(),
        zIndexOffset: 1000,
      }).addTo(mapInstance);

      let popupContent = `
        <div style="text-align: center;">
          <h4>Coordenadas Capturadas</h4>
          <p><strong>Lat:</strong> ${lat.toFixed(6)}</p>
          <p><strong>Lng:</strong> ${lng.toFixed(6)}</p>
      `;

      if (!isValid) {
        popupContent += `
          <p style="color: #e74c3c; font-weight: bold;">
            Fuera del campus
          </p>
        `;
      }

      // Encontrar edificio más cercano
      try {
        const nearestBuilding = findNearestBuilding(lat, lng);
        if (nearestBuilding) {
          const distance = SpatialUtils.calculateDistance(
            { lat, lng },
            {
              lat:
                nearestBuilding.lat ||
                nearestBuilding.ubicacion?.coordinates[1],
              lng:
                nearestBuilding.lng ||
                nearestBuilding.ubicacion?.coordinates[0],
            }
          );

          if (!isNaN(distance) && distance !== Infinity) {
            popupContent += `
              <p style="color: #27ae60; font-size: 12px;">
                Más cercano: ${nearestBuilding.nombre} (${Math.round(
              distance
            )}m)
              </p>
            `;
          }
        }
      } catch (error) {
        console.warn("Error mostrando edificio más cercano:", error);
      }

      popupContent += `
          <button onclick="window.useCapturedCoords(${lat}, ${lng})" 
            style="background: ${
              isValid ? "#27ae60" : "#e74c3c"
            }; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-top: 5px;">
            ${isValid ? "Usar estas coordenadas" : "Usar de todas formas"}
          </button>
        </div>
      `;

      newTempMarker.bindPopup(popupContent).openPopup();
      coordinateManagement.setTempMarker(newTempMarker);
      coordinateManagement.setCapturedCoords({ lat, lng });
    };

    window.useCapturedCoords = (lat, lng) => {
      console.log("Coordenadas usadas:", { lat, lng });

      coordinateManagement.toggleCoordinateDetection();
      coordinateManagement.setCapturedCoords({ lat, lng });

      if (coordinateManagement.tempMarker && mapInstance) {
        mapInstance.removeLayer(coordinateManagement.tempMarker);
        coordinateManagement.setTempMarker(null);
      }

      mapManagement.setEditingBuilding(null);
      mapManagement.setShowBuildingForm(true);
    };

    mapInstance.on("click", handleMapClick);

    return () => {
      mapInstance.off("click", handleMapClick);
      delete window.useCapturedCoords;

      if (coordinateManagement.coordinateDetection) {
        coordinateManagement.toggleCoordinateDetection();
        if (coordinateManagement.tempMarker && mapInstance) {
          mapInstance.removeLayer(coordinateManagement.tempMarker);
          coordinateManagement.setTempMarker(null);
        }
      }
    };
  }, [
    mapInstance,
    coordinateManagement,
    validateCoordinates,
    findNearestBuilding,
    mapManagement,
  ]);

  // Funciones de negocio
  const handleSaveBuilding = async (buildingData) => {
    try {
      const isValid = validateCoordinates(buildingData.lat, buildingData.lng);

      if (!isValid) {
        const confirmSave = window.confirm(
          "Las coordenadas están fuera de los límites del campus. ¿Deseas guardar de todas formas?"
        );
        if (!confirmSave) return;
      }

      if (mapManagement.editingBuilding) {
        const id =
          mapManagement.editingBuilding.id ||
          mapManagement.editingBuilding._id ||
          mapManagement.editingBuilding.id_edificio;
        await buildingService.updateBuilding(id, buildingData);
        showNotification("Edificio actualizado correctamente", "success");
      } else {
        await buildingService.createBuilding(buildingData);
        showNotification("Edificio creado correctamente", "success");
      }

      await loadBuildings();
      mapManagement.setEditingBuilding(null);
      mapManagement.setShowBuildingForm(false);
      coordinateManagement.setCapturedCoords(null);
    } catch (error) {
      console.error("Error al guardar edificio:", error);
      showNotification("Error al guardar edificio", "error");
    }
  };

  // Eliminar edificio
  const handleDeleteBuilding = async (building) => {
    showConfirm(
      "Eliminar Edificio",
      `¿Estás seguro de eliminar el edificio "${building.nombre}"?\n\nEsta acción no se puede deshacer.`,
      async () => {
        try {
          const id = building.id || building._id || building.id_edificio;
          await deleteBuilding(id);
          showNotification("Edificio eliminado correctamente", "success");
        } catch (err) {
          console.error("Error al eliminar edificio:", err);
          showNotification("Error al eliminar edificio", "error");
        }
      },
      {
        type: "danger",
        confirmText: "Eliminar",
        cancelText: "Cancelar",
      }
    );
  };

  // Crear nuevas salas
  const handleSaveRooms = async (roomsData) => {
    try {
      await roomService.createRooms(roomsData);
      await loadBuildings();
      showNotification("Salas creadas exitosamente", "success");
    } catch (error) {
      console.error("Error al crear salas:", error);
      showNotification("Error al crear salas", "error");
      throw error;
    }
  };

  // Actualizar sala existente
  const handleUpdateRoom = async (roomId, roomData) => {
    try {
      await roomService.updateRoom(roomId, roomData);
      await loadBuildings();
      showNotification("Sala actualizada exitosamente", "success");
    } catch (error) {
      console.error("Error al actualizar sala:", error);
      showNotification("Error al actualizar sala", "error");
      throw error;
    }
  };

  const handleDeleteRoom = async (roomId) => {
    try {
      console.log("Eliminando sala ID:", roomId);
      await roomService.deleteRoom(roomId);
      await loadBuildings();
      showNotification("Sala eliminada exitosamente", "success");
    } catch (error) {
      console.error("Error al eliminar sala:", error);
      showNotification("Error al eliminar sala", "error");
      throw error;
    }
  };

  // Guardar ruta
  const handleSaveRoute = async (routeData) => {
    try {
      if (routeData.puntos_ruta && routeData.puntos_ruta.length >= 2) {
        const coordinates = routeData.puntos_ruta.map(
          (p) => p.coordenadas.coordinates
        );

        const invalidPoints = routeData.puntos_ruta.filter((punto) => {
          const [lng, lat] = punto.coordenadas.coordinates;
          return !validateCoordinates(lat, lng);
        });

        if (invalidPoints.length > 0) {
          showNotification(
            "Algunos puntos de la ruta están fuera de los límites del campus",
            "warning"
          );
          return;
        }

        if (!SpatialUtils.isValidLineString(coordinates)) {
          showNotification("La geometría de la ruta no es válida", "error");
          return;
        }
      }

      if (mapManagement.editingRoute) {
        await updateRoute(mapManagement.editingRoute.id, routeData);
        showNotification("Ruta actualizada correctamente", "success");
      } else {
        await createRoute(routeData);
        showNotification("Ruta creada correctamente", "success");
      }

      mapManagement.setEditingRoute(null);
      mapManagement.setShowRouteForm(false);
      await loadRoutes();
    } catch (error) {
      console.error("Error al guardar ruta:", error);
      showNotification("Error al guardar ruta", "error");
    }
  };

  // Eliminar ruta
  const handleDeleteRoute = async (route) => {
    showConfirm(
      "Eliminar Ruta",
      `¿Estás seguro de eliminar la ruta "${route.nombre}"?\n\nEsta acción no se puede deshacer.`,
      async () => {
        try {
          await deleteRoute(route.id);
          showNotification("Ruta eliminada correctamente", "success");
          if (
            mapManagement.selectedRoute &&
            mapManagement.selectedRoute.id === route.id
          ) {
            mapManagement.setSelectedRoute(null);
          }
        } catch (err) {
          console.error("Error al eliminar ruta:", err);
          showNotification("Error al eliminar ruta", "error");
        }
      },
      {
        type: "warning",
        confirmText: "Eliminar Ruta",
        cancelText: "Cancelar",
      }
    );
  };

  // Manejar clic en ruta para ajustar vista
  const handleRouteClick = (route) => {
    console.log("Ruta seleccionada:", route);
    mapManagement.setSelectedRoute(route);

    if (mapInstance && route.geometria) {
      const coordinates = route.geometria.coordinates;
      if (coordinates.length > 0) {
        try {
          const points = coordinates.map((coord) => ({
            lng: coord[0],
            lat: coord[1],
          }));
          const bbox = SpatialUtils.calculateBoundingBox(points);
          if (bbox) {
            const bounds = L.latLngBounds(
              [bbox[1], bbox[0]],
              [bbox[3], bbox[2]]
            );
            mapInstance.fitBounds(bounds, { padding: [20, 20] });
          }
        } catch (error) {
          console.error("Error calculando bounds con Turf:", error);
          const bounds = coordinates.map((coord) => [coord[1], coord[0]]);
          mapInstance.fitBounds(bounds, { padding: [20, 20] });
        }
      }
    }
  };

  // Cerrar sesión
  const handleLogout = () => {
    showConfirm(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      () => {
        showNotification("Sesión cerrada correctamente", "success");
      },
      {
        type: "info",
        confirmText: "Cerrar Sesión",
        cancelText: "Cancelar",
      }
    );
  };

  // Sincronizar datos con GeoServer
  const handleSyncData = async () => {
    if (geoServerFeatures.length > 0) {
      try {
        await syncWithGeoServer(geoServerFeatures);
        showNotification(
          `${geoServerFeatures.length} edificios sincronizados`,
          "success"
        );
        await loadBuildings();
      } catch (error) {
        console.error("Error sincronizando datos:", error);
        showNotification("Error sincronizando datos", "error");
      }
    } else {
      showNotification("No hay datos de GeoServer para sincronizar", "warning");
    }
  };

  // Resetear vista al campus
  const handleResetView = () => {
    if (mapInstance) {
      const boundsLatLng = L.latLngBounds(UCN_COQUIMBO_BOUNDS);
      mapInstance.fitBounds(boundsLatLng, {
        padding: [50, 50],
        maxZoom: MAP_ZOOM_LIMITS.default,
        animate: true,
        duration: 0.5,
      });
      console.log("Vista reseteada al Campus Guayacán");
    }
  };

  // Filtrar edificios según categoría
  const filteredBuildings = useMemo(() => {
    if (!mapManagement.filters.category) return buildings;
    return buildings.filter(
      (building) =>
        building.categoria === mapManagement.filters.category ||
        building.tipo === mapManagement.filters.category
    );
  }, [buildings, mapManagement.filters.category]);

  // Renderizado del componente
  return (
    <div className="container">
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
        onSave={handleSaveBuilding}
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
          onDeleteBuilding={handleDeleteBuilding}
          onClose={mapManagement.handleCloseBuildingList}
          onEditRoom={mapManagement.handleOpenEditRoom}
          onCreateRooms={mapManagement.handleCreateRoomsForBuilding}
          onAddRooms={() => mapManagement.handleCreateRoomsForBuilding(null)}
          onDeleteRoom={handleDeleteRoom}
          onReload={loadBuildings}
        />
      )}

      {mapManagement.showRoomManagement && (
        <RoomManagement
          mode={mapManagement.roomManagementMode}
          buildings={buildings}
          selectedBuilding={mapManagement.selectedBuildingForRooms}
          onSaveRooms={handleSaveRooms}
          onUpdateRoom={handleUpdateRoom}
          onDeleteRoom={handleDeleteRoom}
          onClose={mapManagement.handleCloseRoomManagement}
          existingRooms={mapManagement.selectedRooms}
        />
      )}

      <RouteFormWithNodes
        onSave={handleSaveRoute}
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
          onDeleteRoute={handleDeleteRoute}
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
        SpatialUtils={SpatialUtils}
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
