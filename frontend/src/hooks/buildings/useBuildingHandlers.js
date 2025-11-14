/**
 * Handlers específicos para edificios
 */
import { useCallback } from "react";
import { buildingService } from "../../services/buildingService";

export const useBuildingHandlers = (
  showUINotification,
  validateCoordinates,
  loadBuildings,
  deleteBuilding,
  mapState,
  coordinateManagement
) => {
  /**
   * Guardar edificio (crear o actualizar)
   */
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

  /**
   * Eliminar edificio con confirmación
   */
  const handleDeleteBuilding = useCallback(
    (building, showConfirm) => {
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
    [deleteBuilding, showUINotification]
  );

  return {
    handleSaveBuilding,
    handleDeleteBuilding,
  };
};

