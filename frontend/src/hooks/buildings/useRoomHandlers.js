/**
 * Handlers específicos para salas
 */
import { useCallback } from "react";
import { roomService } from "../../services/roomService";

export const useRoomHandlers = (showUINotification, loadBuildings) => {
  /**
   * Guardar múltiples salas
   */
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

  /**
   * Actualizar sala
   */
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

  /**
   * Eliminar sala
   */
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

  return {
    handleSaveRooms,
    handleUpdateRoom,
    handleDeleteRoom,
  };
};

