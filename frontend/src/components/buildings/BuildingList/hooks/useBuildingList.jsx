// components/buildings/BuildingList/hooks/useBuildingList.js
import { useState } from "react";
import { useNotification } from "../../../../hooks/common/useNotification";

export const useBuildingList = ({
  buildings,
  onDeleteBuilding,
  onEditRoom,
  onEditBuilding,
  onCreateRooms,
  onDeleteRoom,
  onReload,
  onClose,
}) => {
  const [deletingId, setDeletingId] = useState(null);
  const [expandedBuilding, setExpandedBuilding] = useState(null);
  const [deletingRoomId, setDeletingRoomId] = useState(null);
  const { notification, showNotification, hideNotification } =
    useNotification();

  const handleDeleteBuilding = async (building) => {
    const buildingId = building.id || building._id || building.id_edificio;
    setDeletingId(buildingId);

    try {
      await onDeleteBuilding(building);
    } catch (error) {
      // Los errores se manejan en Map.js
    } finally {
      setDeletingId(null);
    }
  };

  const toggleBuildingExpansion = (buildingId) => {
    setExpandedBuilding(expandedBuilding === buildingId ? null : buildingId);
  };

  const handleCreateRooms = (building) => {
    if (onCreateRooms) {
      onCreateRooms(building);
    }
    onClose();
  };

  const handleEditRoom = (room) => {
    console.log("🔄 handleEditRoom llamado con:", room);
    if (onEditRoom) {
      onEditRoom(room);
    }
  };

  const handleDeleteRoom = async (room) => {
    setDeletingRoomId(room.id);

    try {
      if (onDeleteRoom) {
        await onDeleteRoom(room.id);
        if (onReload) {
          await onReload();
        }
      }
    } catch (error) {
      // Los errores se manejan en el componente padre
    } finally {
      setDeletingRoomId(null);
    }
  };

  const handleEditBuilding = (building) => {
    if (onEditBuilding) {
      onEditBuilding(building);
      onClose(); // ← Esto cierra el menú de gestión
    }
  };

  return {
    deletingId,
    expandedBuilding,
    deletingRoomId,
    notification,
    hideNotification,
    handleDeleteBuilding,
    toggleBuildingExpansion,
    handleCreateRooms,
    handleEditRoom,
    handleDeleteRoom,
    handleEditBuilding,
  };
};
