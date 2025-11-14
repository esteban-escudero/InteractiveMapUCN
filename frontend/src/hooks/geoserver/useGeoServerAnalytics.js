/**
 * Hook para analytics de features de GeoServer
 */
import { useState, useCallback } from "react";

export const useGeoServerAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);

  /**
   * Calcular analytics de features WFS
   */
  const calculateGeoServerAnalytics = useCallback((featuresData) => {
    try {
      if (!featuresData || featuresData.length === 0) {
        setAnalytics(null);
        return;
      }

      const analyticsData = {
        total_features: featuresData.length,
        features_validos: 0,
        features_invalidos: 0,
        por_tipo_geometria: {
          polygon: 0,
          point: 0,
          desconocido: 0,
        },
        area_total: 0,
        distribucion_areas: {
          pequeñas: 0, // < 1000 m²
          medianas: 0, // 1000-5000 m²
          grandes: 0, // > 5000 m²
        },
      };

      featuresData.forEach((feature) => {
        // Conteo por validez
        if (feature.turf?.ubicacion_valida) {
          analyticsData.features_validos++;
        } else {
          analyticsData.features_invalidos++;
        }

        // Conteo por tipo de geometría
        const tipo = feature.turf?.tipo_geometria || "desconocido";
        analyticsData.por_tipo_geometria[tipo]++;

        // Área y distribución
        if (feature.turf?.area_calculada) {
          analyticsData.area_total += feature.turf.area_calculada;

          const area = feature.turf.area_calculada;
          if (area < 1000) analyticsData.distribucion_areas.pequeñas++;
          else if (area <= 5000) analyticsData.distribucion_areas.medianas++;
          else analyticsData.distribucion_areas.grandes++;
        }
      });

      console.log("Analytics GeoServer calculadas:", analyticsData);
      setAnalytics(analyticsData);
      return analyticsData;
    } catch (error) {
      console.error("Error calculando analytics GeoServer:", error);
      return null;
    }
  }, []);

  return {
    analytics,
    calculateGeoServerAnalytics,
  };
};

