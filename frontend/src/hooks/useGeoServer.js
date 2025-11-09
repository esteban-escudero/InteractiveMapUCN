// hooks/useGeoServer.js
import { useState, useCallback } from "react";
import { SpatialUtils } from "../utils/spatialUtils";

export const useGeoServer = () => {
  const [status, setStatus] = useState("idle");
  const [features, setFeatures] = useState([]);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  // CARGAR DATOS WFS CON ANÁLISIS TURF
  const loadWFSData = useCallback(
    async (mapInstance, layerName = "edificio") => {
      setStatus("loading");
      setError(null);

      try {
        console.log("Cargando datos WFS con análisis Turf...");

        // Simular carga de datos WFS (reemplazar con implementación real)
        const mockFeatures = await simulateWFSLoad();

        // ANALIZAR FEATURES CON TURF
        const featuresWithTurfAnalysis = mockFeatures.map((feature) => {
          try {
            let turfData = {
              ubicacion_valida: false,
              area_calculada: null,
              centroide: null,
              bounding_box: null,
              tipo_geometria: "desconocido",
            };

            if (feature.geometry) {
              if (feature.geometry.type === "Polygon") {
                turfData.tipo_geometria = "polygon";

                // Calcular área
                try {
                  turfData.area_calculada = Math.round(
                    SpatialUtils.calculatePolygonArea(
                      feature.geometry.coordinates[0]
                    )
                  );
                } catch (areaError) {
                  console.error("Error calculando área:", areaError);
                }

                // Calcular centroide y bounding box
                try {
                  const points = feature.geometry.coordinates[0].map(
                    (coord) => ({
                      lng: coord[0],
                      lat: coord[1],
                    })
                  );
                  turfData.centroide = SpatialUtils.calculateCentroid(points);
                  turfData.bounding_box =
                    SpatialUtils.calculateBoundingBox(points);

                  // Validar ubicación dentro del campus
                  if (turfData.centroide) {
                    turfData.ubicacion_valida = SpatialUtils.isPointInPolygon(
                      turfData.centroide[1],
                      turfData.centroide[0],
                      [
                        [-71.355622, -29.967316],
                        [-71.346738, -29.967316],
                        [-71.346738, -29.963208],
                        [-71.355622, -29.963208],
                        [-71.355622, -29.967316],
                      ]
                    );
                  }
                } catch (geometryError) {
                  console.error("Error en análisis geométrico:", geometryError);
                }
              } else if (feature.geometry.type === "Point") {
                turfData.tipo_geometria = "point";
                const [lng, lat] = feature.geometry.coordinates;

                turfData.ubicacion_valida = SpatialUtils.isPointInPolygon(
                  lat,
                  lng,
                  [
                    [-71.355622, -29.967316],
                    [-71.346738, -29.967316],
                    [-71.346738, -29.963208],
                    [-71.355622, -29.963208],
                    [-71.355622, -29.967316],
                  ]
                );

                turfData.centroide = [lng, lat];
              }
            }

            return {
              ...feature,
              turf: turfData,
            };
          } catch (turfError) {
            console.error("Error en análisis Turf para feature:", turfError);
            return feature;
          }
        });

        setFeatures(featuresWithTurfAnalysis);

        // CALCULAR ANALÍTICAS
        calculateGeoServerAnalytics(featuresWithTurfAnalysis);

        // AGREGAR CAPAS AL MAPA
        if (mapInstance) {
          addFeaturesToMap(mapInstance, featuresWithTurfAnalysis);
        }

        setStatus("success");
        console.log(
          `${featuresWithTurfAnalysis.length} features WFS cargados con Turf`
        );
      } catch (err) {
        const errorMessage = err.message || "Error cargando datos WFS";
        console.error("Error en useGeoServer.loadWFSData:", errorMessage);
        setError(errorMessage);
        setStatus("error");
      }
    },
    []
  );

  // CALCULAR ANALÍTICAS DE FEATURES WFS
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
    } catch (error) {
      console.error("Error calculando analytics GeoServer:", error);
    }
  }, []);

  // AGREGAR FEATURES AL MAPA
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
  }, []);

  // CREAR POPUP INFORMATIVO
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

  // LIMPIAR CAPAS DEL MAPA
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

  // SIMULAR CARGA WFS (REEMPLAZAR CON IMPLEMENTACIÓN REAL)
  const simulateWFSLoad = useCallback(async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            type: "Feature",
            properties: {
              nombre: "Edificio A",
              tipo: "académico",
            },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [-71.352, -29.966],
                  [-71.3515, -29.966],
                  [-71.3515, -29.9655],
                  [-71.352, -29.9655],
                  [-71.352, -29.966],
                ],
              ],
            },
          },
          {
            type: "Feature",
            properties: {
              nombre: "Edificio B",
              tipo: "administrativo",
            },
            geometry: {
              type: "Point",
              coordinates: [-71.353, -29.965],
            },
          },
        ]);
      }, 1000);
    });
  }, []);

  // OBTENER FEATURES POR TIPO DE GEOMETRÍA
  const getFeaturesByGeometryType = useCallback(
    (geometryType) => {
      return features.filter(
        (feature) => feature.turf?.tipo_geometria === geometryType
      );
    },
    [features]
  );

  // OBTENER FEATURES VÁLIDOS/INVÁLIDOS
  const getFeaturesByValidity = useCallback(
    (isValid) => {
      return features.filter(
        (feature) => feature.turf?.ubicacion_valida === isValid
      );
    },
    [features]
  );

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
    hasFeatures: features.length > 0,
    isValidFeature: (feature) => feature?.turf?.ubicacion_valida === true,

    // Métricas Turf
    turfEnabled: true,
    turfVersion: "6.5.0",
  };
};

export default useGeoServer;
