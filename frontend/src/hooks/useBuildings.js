import { useState, useEffect, useCallback } from 'react';
import { buildingService } from '../services/buildingService';

export const useBuildings = () => {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');

  const loadBuildings = useCallback(async () => {
    if (backendStatus === 'error') {
      console.log('⚠️ Backend no disponible, omitiendo carga de edificios');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const buildingsData = await buildingService.getAllBuildings();
      setBuildings(buildingsData.data || buildingsData); // ✅ ACTUALIZA ESTADO
      setBackendStatus('connected');
      console.log(`🏢 ${buildingsData.length || buildingsData.data?.length} edificios cargados desde el backend`);
    } catch (err) {
      setError(err.message);
      setBackendStatus('error');
      console.error('Error cargando edificios:', err);
    } finally {
      setLoading(false);
    }
  }, [backendStatus]);

  const checkBackendHealth = useCallback(async () => {
    try {
      console.log('🔍 Verificando salud del backend...');
      await buildingService.checkHealth();
      setBackendStatus('connected');
      console.log('✅ Backend conectado');
      return true;
    } catch (error) {
      console.warn('❌ Backend no disponible:', error.message);
      setBackendStatus('error');
      return false;
    }
  }, []);

  useEffect(() => {
    checkBackendHealth().then(isHealthy => {
      if (isHealthy) {
        loadBuildings();
      }
    });
  }, [loadBuildings, checkBackendHealth]);

  const syncWithGeoServer = useCallback(async (geoServerFeatures) => {
    if (backendStatus === 'error') {
      throw new Error('Backend no disponible para sincronización');
    }

    setLoading(true);
    setError(null);
    try {
      const result = await buildingService.syncWithGeoServer({
        features: geoServerFeatures,
        syncDate: new Date().toISOString()
      });
      await loadBuildings(); // ✅ RECARGA después de sincronizar
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadBuildings, backendStatus]);

  // ✅ FUNCIÓN CLAVE: Eliminar edificio y actualizar estado
  const deleteBuilding = useCallback(async (id) => {
    try {
      setLoading(true);
      const result = await buildingService.deleteBuilding(id);
      
      // ✅ ACTUALIZAR ESTADO LOCAL - Esto dispara la actualización del mapa
      setBuildings(prev => prev.filter(building => {
        const buildingId = building.id || building._id || building.id_edificio;
        return buildingId !== id;
      }));
      
      console.log('✅ Edificio eliminado del estado local, disparando actualización del mapa');
      return result;
      
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    buildings,
    loading,
    error,
    backendStatus,
    loadBuildings,
    syncWithGeoServer,
    deleteBuilding
  };
};