/**
 * Hook para carga y procesamiento de datos WFS de GeoServer
 */
import { useState, useCallback } from "react";
import { SpatialUtils } from "utils/spatialUtils";

export const useGeoServerData = () => {
  const [status, setStatus] = useState("idle");
  const [features, setFeatures] = useState([]);
  const [error, setError] = useState(null);

  /**
   * Enriquecer features con análisis Turf
   */
  const enrichFeaturesWithTurf = useCallback((featuresData) => {
    return featuresData.map((feature) => {
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
              const points = feature.geometry.coordinates[0].map((coord) => ({
                lng: coord[0],
                lat: coord[1],
              }));
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
  }, []);

  /**
   * Simular carga WFS (reemplazar con implementación real)
   */
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

  /**
   * Cargar datos WFS con análisis Turf
   */
  const loadWFSData = useCallback(
    async (mapInstance, layerName = "edificio") => {
      setStatus("loading");
      setError(null);

      try {
        console.log("Cargando datos WFS con análisis Turf...");

        // Simular carga de datos WFS (reemplazar con implementación real)
        const mockFeatures = await simulateWFSLoad();

        // Analizar features con Turf
        const featuresWithTurfAnalysis = enrichFeaturesWithTurf(mockFeatures);

        setFeatures(featuresWithTurfAnalysis);
        setStatus("success");
        console.log(
          `${featuresWithTurfAnalysis.length} features WFS cargados con Turf`
        );

        return featuresWithTurfAnalysis;
      } catch (err) {
        const errorMessage = err.message || "Error cargando datos WFS";
        console.error("Error en useGeoServerData.loadWFSData:", errorMessage);
        setError(errorMessage);
        setStatus("error");
        throw err;
      }
    },
    [enrichFeaturesWithTurf, simulateWFSLoad]
  );

  /**
   * Obtener features por tipo de geometría
   */
  const getFeaturesByGeometryType = useCallback(
    (geometryType) => {
      return features.filter(
        (feature) => feature.turf?.tipo_geometria === geometryType
      );
    },
    [features]
  );

  /**
   * Obtener features válidos/inválidos
   */
  const getFeaturesByValidity = useCallback(
    (isValid) => {
      return features.filter(
        (feature) => feature.turf?.ubicacion_valida === isValid
      );
    },
    [features]
  );

  return {
    status,
    features,
    error,
    loadWFSData,
    getFeaturesByGeometryType,
    getFeaturesByValidity,
    hasFeatures: features.length > 0,
    isValidFeature: (feature) => feature?.turf?.ubicacion_valida === true,
  };
};

