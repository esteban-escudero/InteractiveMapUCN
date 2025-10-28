import { api } from "./api";

export const roomService = {
  async createRooms(roomsData) {
    try {
      console.log("📤 Enviando salas al backend:", roomsData);
      const response = await api.post("/rooms", roomsData);
      console.log("✅ Salas guardadas:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error en roomService.createRooms:", error);
      throw error;
    }
  },

  async getRoomsByBuilding(buildingId) {
    try {
      const response = await api.get(`/rooms/building/${buildingId}`);
      return response.data;
    } catch (error) {
      console.error("Error obteniendo salas:", error);
      throw error;
    }
  },

  async updateRoom(roomId, roomData) {
    try {
      console.log("✏️ Actualizando sala:", roomId, roomData);
      const response = await api.put(`/rooms/${roomId}`, roomData);
      console.log("✅ Sala actualizada:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error actualizando sala:", error);
      throw error;
    }
  },

  async deleteRoom(roomId) {
    try {
      console.log("🗑️ Enviando solicitud para eliminar sala ID:", roomId);
      const response = await api.delete(`/rooms/${roomId}`);
      console.log("✅ Sala eliminada del backend:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error eliminando sala:", error);
      throw error;
    }
  },
};
