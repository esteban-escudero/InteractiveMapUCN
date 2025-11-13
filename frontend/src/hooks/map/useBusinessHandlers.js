// frontend/src/hooks/map/useBusinessHandlers.js
import { useCallback } from "react";
import { buildingService } from "../../services/buildingService";
import { roomService } from "../../services/roomService";
import { SpatialUtils } from "../../utils/spatialUtils";

export const useBusinessHandlers = (
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

        if (mapState.editingBuilding) {
          const id =
            mapState.editingBuilding.id ||
            mapState.editingBuilding._id ||
            mapState.editingBuilding.id_edificio;
          await buildingService.updateBuilding(id, buildingData);
          showUINotification("Edificio actualizado correctamente", "success");
        } else {
          await buildingService.createBuilding(buildingData);
          showUINotification("Edificio creado correctamente", "success");
        }

        await loadBuildings();
        mapState.setEditingBuilding(null);
        mapState.setShowBuildingForm(false);
        coordinateManagement.setCapturedCoords(null);
      } catch (error) {
        console.error("Error al guardar edificio:", error);
        showUINotification("Error al guardar edificio", "error");
      }
    },
    [
      validateCoordinates,
      mapState,
      coordinateManagement,
      showUINotification,
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
            showUINotification("Edificio eliminado correctamente", "success");
          } catch (err) {
            console.error("Error al eliminar edificio:", err);
            showUINotification("Error al eliminar edificio", "error");
          }
        },
        {
          type: "danger",
          confirmText: "Eliminar",
          cancelText: "Cancelar",
        }
      );
    },
    [showConfirm, deleteBuilding, showUINotification]
  );

  // Manejar salas
  const handleSaveRooms = useCallback(
    async (roomsData) => {
      try {
        await roomService.createRooms(roomsData);
        await loadBuildings();
        showUINotification("Salas creadas exitosamente", "success");
      } catch (error) {
        console.error("Error al crear salas:", error);
        showUINotification("Error al crear salas", "error");
        throw error;
      }
    },
    [showUINotification, loadBuildings]
  );

  const handleUpdateRoom = useCallback(
    async (roomId, roomData) => {
      try {
        await roomService.updateRoom(roomId, roomData);
        await loadBuildings();
        showUINotification("Sala actualizada exitosamente", "success");
      } catch (error) {
        console.error("Error al actualizar sala:", error);
        showUINotification("Error al actualizar sala", "error");
        throw error;
      }
    },
    [showUINotification, loadBuildings]
  );

  const handleDeleteRoom = useCallback(
    async (roomId) => {
      try {
        console.log("Eliminando sala ID:", roomId);
        await roomService.deleteRoom(roomId);
        await loadBuildings();
        showUINotification("Sala eliminada exitosamente", "success");
      } catch (error) {
        console.error("Error al eliminar sala:", error);
        showUINotification("Error al eliminar sala", "error");
        throw error;
      }
    },
    [showUINotification, loadBuildings]
  );

  // REEMPLAZA COMPLETAMENTE handleSaveRoute en useBusinessHandlers.js
  const handleSaveRoute = useCallback(
    async (routeData) => {
      try {
        console.log("🔍 INICIANDO GUARDADO DE RUTA - DEBUG:");
        console.log("📊 Datos recibidos:", routeData);
        console.log("📍 Geometría:", routeData.geometria);
        console.log(
          "🔢 Puntos en geometría:",
          routeData.geometria?.coordinates?.length || 0
        );
        console.log("🗂️ Puntos_ruta:", routeData.puntos_ruta?.length || 0);

        // VALIDACIÓN SIMPLIFICADA - solo verificar que tenemos geometría con puntos
        if (!routeData.geometria || !routeData.geometria.coordinates) {
          console.log("❌ FALTA GEOMETRÍA - Bloqueando guardado");
          showUINotification(
            "Error: La ruta no tiene geometría válida",
            "error"
          );
          return;
        }

        const coordinates = routeData.geometria.coordinates;
        console.log("📐 Coordenadas a validar:", coordinates);

        if (coordinates.length < 2) {
          console.log("❌ MENOS DE 2 PUNTOS - Bloqueando guardado");
          showUINotification("La ruta debe tener al menos 2 puntos", "error");
          return;
        }

        // Validar coordenadas fuera de límites (pero permitir guardar con advertencia)
        const invalidPoints = coordinates.filter((coord) => {
          const [lng, lat] = coord;
          return !validateCoordinates(lat, lng);
        });

        if (invalidPoints.length > 0) {
          console.log("⚠️ Puntos fuera de límites:", invalidPoints.length);
          const confirmSave = window.confirm(
            `${invalidPoints.length} puntos están fuera de los límites del campus. ¿Deseas guardar de todas formas?`
          );
          if (!confirmSave) {
            console.log("❌ USUARIO CANCELÓ POR PUNTOS FUERA DE LÍMITES");
            return;
          }
        }

        // Validar con SpatialUtils (pero si falla, solo mostrar advertencia)
        let isValidGeometry = true;
        try {
          isValidGeometry = SpatialUtils.isValidLineString(coordinates);
          console.log("✅ Validación SpatialUtils:", isValidGeometry);
        } catch (error) {
          console.warn("⚠️ Error en validación SpatialUtils:", error);
          isValidGeometry = false;
        }

        if (!isValidGeometry) {
          const confirmSave = window.confirm(
            "La geometría de la ruta podría no ser válida. ¿Deseas guardar de todas formas?"
          );
          if (!confirmSave) {
            console.log("❌ USUARIO CANCELÓ POR GEOMETRÍA INVÁLIDA");
            return;
          }
        }

        console.log(
          "✅ TODAS LAS VALIDACIONES PASARON - Procediendo a guardar..."
        );

        // GUARDAR RUTA
        if (mapState.editingRoute) {
          console.log("🔄 Actualizando ruta existente...");
          await updateRoute(mapState.editingRoute.id, routeData);
          showUINotification("Ruta actualizada correctamente", "success");
        } else {
          console.log("🆕 Creando nueva ruta...");
          await createRoute(routeData);
          showUINotification("Ruta creada correctamente", "success");
        }

        console.log("✅ RUTA GUARDADA EXITOSAMENTE");
        mapState.setEditingRoute(null);
        mapState.setShowRouteForm(false);
        await loadRoutes();
      } catch (error) {
        console.error("❌ ERROR CRÍTICO al guardar ruta:", error);
        showUINotification(`Error al guardar ruta: ${error.message}`, "error");
      }
    },
    [
      validateCoordinates,
      mapState,
      showUINotification,
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
            showUINotification("Ruta eliminada correctamente", "success");
            if (
              mapState.selectedRoute &&
              mapState.selectedRoute.id === route.id
            ) {
              mapState.setSelectedRoute(null);
            }
          } catch (err) {
            console.error("Error al eliminar ruta:", err);
            showUINotification("Error al eliminar ruta", "error");
          }
        },
        {
          type: "warning",
          confirmText: "Eliminar Ruta",
          cancelText: "Cancelar",
        }
      );
    },
    [showConfirm, deleteRoute, showUINotification, mapState]
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
