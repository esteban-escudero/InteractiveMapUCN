import { api } from './api';

export const buildingService = {
  async getAllBuildings() {
    try {
      const response = await api.get('/buildings');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo edificios:', error);
      throw error;
    }
  },

  async createBuilding(buildingData) {
    try {
      const response = await api.post('/buildings', buildingData);
      return response.data;
    } catch (error) {
      console.error('Error creando edificio:', error);
      throw error;
    }
  },

  async syncWithGeoServer(geoServerData) {
    try {
      const response = await api.post('/buildings/sync', geoServerData);
      return response.data;
    } catch (error) {
      console.error('Error sincronizando con GeoServer:', error);
      throw error;
    }
  },

  async checkHealth() {
    try {
      const response = await api.get('/health');
      return response;
    } catch (error) {
      console.error('Error verificando salud del backend:', error);
      throw error;
    }
  }
};