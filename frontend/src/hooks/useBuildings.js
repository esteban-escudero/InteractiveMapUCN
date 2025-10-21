import { useState, useEffect, useCallback } from 'react';
import { buildingService } from '../services/buildingService';

export const useBuildings = () => {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');

  const loadBuildings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const buildingsData = await buildingService.getAllBuildings();
      setBuildings(buildingsData);
      setBackendStatus('connected');
      console.log(`🏢 ${buildingsData.length} edificios cargados desde el backend`);
    } catch (err) {
      setError(err.message);
      setBackendStatus('error');
      console.error('Error cargando edificios:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkBackendHealth = useCallback(async () => {
    try {
      await buildingService.checkHealth();
      setBackendStatus('connected');
      return true;
    } catch (error) {
      setBackendStatus('error');
      console.error('Backend no disponible:', error);
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
    setLoading(true);
    setError(null);
    try {
      const result = await buildingService.syncWithGeoServer({
        features: geoServerFeatures,
        syncDate: new Date().toISOString()
      });
      await loadBuildings();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadBuildings]);

  return {
    buildings,
    loading,
    error,
    backendStatus,
    loadBuildings,
    syncWithGeoServer,
    checkBackendHealth
  };
};