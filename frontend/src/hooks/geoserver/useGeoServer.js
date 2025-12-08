/**
 * Hook principal para GeoServer
 * Combina data, map y analytics
 */
import { useGeoServerData } from "hooks/geoserver/useGeoServerData";
import { useGeoServerMap } from "hooks/geoserver/useGeoServerMap";
import { useGeoServerAnalytics } from "hooks/geoserver/useGeoServerAnalytics";

export const useGeoServer = () => {
  const {
    status,
    features,
    error,
    loadWFSData: loadWFSDataBase,
    getFeaturesByGeometryType,
    getFeaturesByValidity,
    hasFeatures,
    isValidFeature,
  } = useGeoServerData();

  const { addFeaturesToMap, clearMapLayers } = useGeoServerMap();
  const { analytics, calculateGeoServerAnalytics } = useGeoServerAnalytics();

  /**
   * Cargar datos WFS y agregar al mapa
   */
  const loadWFSData = async (mapInstance, layerName = "edificio") => {
    try {
      const featuresData = await loadWFSDataBase(mapInstance, layerName);

      // Calcular analytics
      calculateGeoServerAnalytics(featuresData);

      // Agregar capas al mapa
      if (mapInstance) {
        addFeaturesToMap(mapInstance, featuresData);
      }

      return featuresData;
    } catch (err) {
      throw err;
    }
  };

  return {
    // Estado
    status,
    features,
    error,
    analytics,

    // Acciones
    loadWFSData,
    clearMapLayers,
    getFeaturesByGeometryType,
    getFeaturesByValidity,

    // Utilidades
    hasFeatures,
    isValidFeature,

    // Métricas Turf
    turfEnabled: true,
    turfVersion: "6.5.0",
  };
};

export default useGeoServer;

