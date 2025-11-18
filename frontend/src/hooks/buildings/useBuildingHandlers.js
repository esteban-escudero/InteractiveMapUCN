/**
 * Handlers específicos para edificios
 */
import { useCallback } from "react";
import { buildingService } from "../../services/buildingService";

export const useBuildingHandlers = (
  showUINotification,
  showConfirm, // ✅ RECIBIR showConfirm
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
          // ✅ USAR showConfirm EN LUGAR DE window.confirm
          showConfirm(
            "Coordenadas fuera del campus",
            "Las coordenadas están fuera de los límites del campus. ¿Deseas guardar de todas formas?",
            async () => {
              await saveBuilding(buildingData);
            },
            {
              type: "warning",
              confirmText: "Guardar",
              cancelText: "Cancelar",
            }
          );
        } else {
          await saveBuilding(buildingData);
        }
      } catch (error) {
        console.error("Error al guardar edificio:", error);
        showUINotification("Error al guardar edificio", "error");
      }
    },
    [
      validateCoordinates,
      showConfirm,
      showUINotification,
      loadBuildings,
      mapState,
      coordinateManagement,
    ]
  );

  // Función auxiliar para guardar el edificio
  const saveBuilding = async (buildingData) => {
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
  };

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
