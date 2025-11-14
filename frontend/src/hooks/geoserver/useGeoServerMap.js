/**
 * Hook para renderizado de features de GeoServer en el mapa
 */
import { useCallback } from "react";

export const useGeoServerMap = () => {
  /**
   * Crear contenido de popup para feature
   */
  const createFeaturePopup = useCallback((feature) => {
    const turfInfo = feature.turf || {};

    let metricsHTML = "";
    if (turfInfo.area_calculada) {
      metricsHTML += `<p><strong>Área Turf:</strong> ${turfInfo.area_calculada} m²</p>`;
    }
    if (turfInfo.tipo_geometria) {
      metricsHTML += `<p><strong>Geometría:</strong> ${turfInfo.tipo_geometria}</p>`;
    }

    const statusIcon = turfInfo.ubicacion_valida ? "" : "⚠️";
    const statusText = turfInfo.ubicacion_valida
      ? "Dentro del campus"
      : "FUERA del campus";

    return `
      <div style="min-width: 200px;">
        <h4>${feature.properties?.nombre || "Feature sin nombre"}</h4>
        <p><strong>Estado:</strong> ${statusIcon} ${statusText}</p>
        ${metricsHTML}
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
          <small>GeoServer + Turf.js</small>
        </div>
      </div>
    `;
  }, []);

  /**
   * Agregar features al mapa
   */
  const addFeaturesToMap = useCallback((mapInstance, featuresData) => {
    try {
      if (!mapInstance || !window.L) return;

      // Limpiar capas anteriores
      clearMapLayers(mapInstance);

      featuresData.forEach((feature) => {
        try {
          if (!feature.geometry) return;

          let layer;
          const isValid = feature.turf?.ubicacion_valida;

          if (feature.geometry.type === "Polygon") {
            const latLngs = feature.geometry.coordinates[0].map((coord) => [
              coord[1],
              coord[0],
            ]);
            layer = window.L.polygon(latLngs, {
              color: isValid ? "#27ae60" : "#e74c3c",
              weight: 3,
              fillOpacity: 0.3,
              className: `geoserver-polygon ${isValid ? "valid" : "invalid"}`,
            });
          } else if (feature.geometry.type === "Point") {
            const [lng, lat] = feature.geometry.coordinates;
            layer = window.L.marker([lat, lng], {
              icon: window.L.divIcon({
                html: `<div style="background-color: ${
                  isValid ? "#27ae60" : "#e74c3c"
                }; 
                       width: 12px; height: 12px; border-radius: 50%; 
                       border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
                iconSize: [16, 16],
                className: `geoserver-point ${isValid ? "valid" : "invalid"}`,
              }),
            });
          }

          if (layer) {
            // Agregar popup con información Turf
            const popupContent = createFeaturePopup(feature);
            layer.bindPopup(popupContent);
            layer.addTo(mapInstance);
          }
        } catch (layerError) {
          console.error("Error agregando feature al mapa:", layerError);
        }
      });

      console.log(`${featuresData.length} features agregados al mapa`);
    } catch (error) {
      console.error("Error en addFeaturesToMap:", error);
    }
  }, [createFeaturePopup]);

  /**
   * Limpiar capas del mapa
   */
  const clearMapLayers = useCallback((mapInstance) => {
    if (!mapInstance) return;

    try {
      mapInstance.eachLayer((layer) => {
        if (
          layer instanceof window.L.Polygon ||
          layer instanceof window.L.Marker
        ) {
          if (layer.options?.className?.includes("geoserver-")) {
            mapInstance.removeLayer(layer);
          }
        }
      });
      console.log("Capas GeoServer limpiadas del mapa");
    } catch (error) {
      console.error("Error limpiando capas del mapa:", error);
    }
  }, []);

  return {
    addFeaturesToMap,
    clearMapLayers,
    createFeaturePopup,
  };
};

