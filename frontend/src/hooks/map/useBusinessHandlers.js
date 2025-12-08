// frontend/src/hooks/map/useBusinessHandlers.js
/**
 * Hook principal que combina todos los handlers de negocio
 * Refactorizado para usar hooks especializados por dominio
 */
import { useCallback } from "react";
import { useBuildingHandlers } from "hooks/buildings/useBuildingHandlers";
import { useRoomHandlers } from "hooks/buildings/useRoomHandlers";
import { useRouteHandlers } from "hooks/routes/useRouteHandlers";

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
  // Handlers especializados por dominio
  const { handleSaveBuilding, handleDeleteBuilding: handleDeleteBuildingBase } =
    useBuildingHandlers(
      showUINotification,
      showConfirm, // ✅ AÑADIR showConfirm
      validateCoordinates,
      loadBuildings,
      deleteBuilding,
      mapState,
      coordinateManagement
    );

  const { handleSaveRooms, handleUpdateRoom, handleDeleteRoom } =
    useRoomHandlers(showUINotification, loadBuildings);

  const { handleSaveRoute, handleDeleteRoute } = useRouteHandlers(
    showUINotification,
    showConfirm,
    validateCoordinates,
    createRoute,
    updateRoute,
    deleteRoute,
    loadRoutes,
    mapState
  );

  // Wrapper para handleDeleteBuilding que incluye showConfirm
  const handleDeleteBuilding = useCallback(
    (building) => {
      handleDeleteBuildingBase(building, showConfirm);
    },
    [handleDeleteBuildingBase, showConfirm]
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
