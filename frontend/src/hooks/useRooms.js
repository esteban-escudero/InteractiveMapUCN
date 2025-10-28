import { useState } from "react";

/**
 * Hook personalizado para gestionar las operaciones de salas
 * Responsabilidad: Lógica de negocio para CRUD de salas
 */
export const useRooms = (loadBuildings) => {
  const [showRoomManagement, setShowRoomManagement] = useState(false);
  const [roomManagementMode, setRoomManagementMode] = useState("create");
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectedBuildingForRooms, setSelectedBuildingForRooms] =
    useState(null);

  const openCreateRooms = (building = null) => {
    setRoomManagementMode("create");
    setSelectedRooms([]);
    setSelectedBuildingForRooms(building);
    setShowRoomManagement(true);
    console.log(
      "➕ Abriendo creación de salas",
      building ? `para ${building.nombre}` : ""
    );
  };

  const openEditRoom = (room) => {
    setRoomManagementMode("edit");
    setSelectedRooms([room]);
    setSelectedBuildingForRooms(null);
    setShowRoomManagement(true);
    console.log("✏️ Abriendo edición de sala:", room);
  };

  const closeRoomManagement = () => {
    setShowRoomManagement(false);
    setSelectedRooms([]);
    setSelectedBuildingForRooms(null);
  };

  const saveRooms = async (roomsData) => {
    try {
      await roomService.createRooms(roomsData);
      await loadBuildings();
      console.log("✅ Salas creadas exitosamente");
      closeRoomManagement();
    } catch (error) {
      console.error("❌ Error al crear salas:", error);
      throw error;
    }
  };

  const updateRoom = async (roomId, roomData) => {
    try {
      await roomService.updateRoom(roomId, roomData);
      await loadBuildings();
      console.log("✅ Sala actualizada exitosamente");
      closeRoomManagement();
    } catch (error) {
      console.error("❌ Error al actualizar sala:", error);
      throw error;
    }
  };

  const deleteRoom = async (roomId) => {
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

  return {
    // State
    showRoomManagement,
    roomManagementMode,
    selectedRooms,
    selectedBuildingForRooms,
    // Actions
    openCreateRooms,
    openEditRoom,
    closeRoomManagement,
    saveRooms,
    updateRoom,
    deleteRoom,
  };
};
