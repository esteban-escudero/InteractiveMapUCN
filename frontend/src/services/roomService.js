import { api } from './api';

export const roomService = {
  async createRooms(roomsData) {
    try {
      console.log('📤 Enviando salas al backend:', roomsData);
      const response = await api.post('/rooms', roomsData);
      console.log('✅ Salas guardadas:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error en roomService.createRooms:', error);
      throw error;
    }
  },

  async getRoomsByBuilding(buildingId) {
    try {
      const response = await api.get(`/rooms/building/${buildingId}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo salas:', error);
      throw error;
    }
  },

  async updateRoom(roomId, roomData) {
    try {
      const response = await api.put(`/rooms/${roomId}`, roomData);
      return response.data;
    } catch (error) {
      console.error('Error actualizando sala:', error);
      throw error;
    }
  },

  async deleteRoom(roomId) {
    try {
      const response = await api.delete(`/rooms/${roomId}`);
      return response.data;
    } catch (error) {
      console.error('Error eliminando sala:', error);
      throw error;
    }
  }
};