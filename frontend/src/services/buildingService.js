// services/buildingService.js
import { api } from './api';

export const buildingService = {
  async getAllBuildings() {
    try {
      console.log('🔄 Solicitando edificios CON SALAS al backend...');
      const response = await api.get('/buildings');
      
      // ✅ Asegurarnos de que cada edificio tenga un array de salas
      const buildingsData = response.data.data || response.data;
      const buildingsWithRooms = Array.isArray(buildingsData) 
        ? buildingsData.map(building => ({
            ...building,
            salas: building.salas || [] // ✅ INCLUIR SALAS
          }))
        : [];
      
      console.log(`✅ ${buildingsWithRooms.length} edificios recibidos del backend`);
      
      // ✅ DEBUG DETALLADO
      let totalSalas = 0;
      buildingsWithRooms.forEach(building => {
        const salasCount = building.salas ? building.salas.length : 0;
        totalSalas += salasCount;
        console.log(`🏢 "${building.nombre}": ${salasCount} salas`);
        
        if (building.salas && building.salas.length > 0) {
          building.salas.forEach(sala => {
            console.log(`   🚪 ${sala.nombre_sala} (Piso ${sala.piso})`);
          });
        }
      });
      
      console.log(`📊 TOTAL RECIBIDO: ${buildingsWithRooms.length} edificios, ${totalSalas} salas`);
      
      return { 
        ...response, 
        data: buildingsWithRooms 
      };
    } catch (error) {
      console.error('❌ Error obteniendo edificios:', error);
      throw error;
    }
  },

  async createBuilding(buildingData) {
    try {
      const response = await api.post('/buildings', buildingData);
      return response.data;
    } catch (error) {
      console.error('❌ Error creando edificio:', error);
      throw error;
    }
  },

  async updateBuilding(id, buildingData) {
    try {
      const response = await api.put(`/buildings/${id}`, buildingData);
      return response.data;
    } catch (error) {
      console.error('❌ Error actualizando edificio:', error);
      throw error;
    }
  },

  async deleteBuilding(id) {
    try {
      const response = await api.delete(`/buildings/${id}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error eliminando edificio:', error);
      throw error;
    }
  },

  async syncWithGeoServer(geoServerData) {
    try {
      const response = await api.post('/buildings/sync', geoServerData);
      return response.data;
    } catch (error) {
      console.error('❌ Error sincronizando con GeoServer:', error);
      throw error;
    }
  },

  async checkHealth() {
    try {
      const response = await api.get('/health');
      return response;
    } catch (error) {
      console.error('❌ Error verificando salud del backend:', error);
      throw error;
    }
  }
};