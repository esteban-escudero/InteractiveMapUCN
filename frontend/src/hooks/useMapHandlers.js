import { useCallback } from "react";
import { buildingService } from "../services/buildingService";
import { roomService } from "../services/roomService";
import { SpatialUtils } from "../utils/spatialUtils";

export const useMapHandlers = (
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
) => {
  // Guardar edificio
  const handleSaveBuilding = useCallback(
    async (buildingData) => {
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
    },
    [
      validateCoordinates,
      mapManagement,
      coordinateManagement,
      showNotification,
      loadBuildings,
    ]
  );

  // Eliminar edificio
  const handleDeleteBuilding = useCallback(
    (building) => {
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
    },
    [showConfirm, deleteBuilding, showNotification]
  );

  // Manejar salas
  const handleSaveRooms = useCallback(
    async (roomsData) => {
      try {
        await roomService.createRooms(roomsData);
        await loadBuildings();
        showNotification("Salas creadas exitosamente", "success");
      } catch (error) {
        console.error("Error al crear salas:", error);
        showNotification("Error al crear salas", "error");
        throw error;
      }
    },
    [showNotification, loadBuildings]
  );

  const handleUpdateRoom = useCallback(
    async (roomId, roomData) => {
      try {
        await roomService.updateRoom(roomId, roomData);
        await loadBuildings();
        showNotification("Sala actualizada exitosamente", "success");
      } catch (error) {
        console.error("Error al actualizar sala:", error);
        showNotification("Error al actualizar sala", "error");
        throw error;
      }
    },
    [showNotification, loadBuildings]
  );

  const handleDeleteRoom = useCallback(
    async (roomId) => {
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
    },
    [showNotification, loadBuildings]
  );

  // Guardar ruta
  const handleSaveRoute = useCallback(
    async (routeData) => {
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
    },
    [
      validateCoordinates,
      mapManagement,
      showNotification,
      createRoute,
      updateRoute,
      loadRoutes,
    ]
  );

  // Eliminar ruta
  const handleDeleteRoute = useCallback(
    (route) => {
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
    },
    [showConfirm, deleteRoute, showNotification, mapManagement]
  );

  return {
    handleSaveBuilding,
    handleDeleteBuilding,
    handleSaveRooms,
    handleUpdateRoom,
    handleDeleteRoom,
    handleSaveRoute,
    handleDeleteRoute,
  };
};
