import { useState, useEffect, useCallback } from "react";
import { buildingService } from "../services/buildingService";
import { SpatialUtils } from "../utils/spatialUtils";

export const useBuildings = () => {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState("checking");
  const [buildingAnalytics, setBuildingAnalytics] = useState(null);

  // CARGAR EDIFICIOS CON ANÁLISIS TURF
  const loadBuildings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Cargando edificios con análisis Turf...");
      const response = await buildingService.getAllBuildings();

      // Asegurar que sea un array
      const buildingsArray = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];

      console.log(`${buildingsArray.length} edificios recibidos del backend`);

      // ENRIQUECER EDIFICIOS CON DATOS TURF
      const buildingsWithTurfAnalysis = buildingsArray.map((building) => {
        try {
          let turfData = {
            ubicacion_valida: false,
            distancia_al_centro: null,
            area_calculada: null,
            es_poligono: false,
            centroide: null,
            bounding_box: null,
          };

          // ANALIZAR UBICACIÓN CON TURF
          if (building.ubicacion) {
            if (building.ubicacion.type === "Point") {
              const [lng, lat] = building.ubicacion.coordinates;

              // Validar si está dentro del campus
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

              // Calcular distancia al centro del campus
              const centroCampus = { lat: -29.965262, lng: -71.35118 };
              turfData.distancia_al_centro = Math.round(
                SpatialUtils.calculateDistance({ lat, lng }, centroCampus)
              );

              turfData.centroide = [lng, lat];
            } else if (building.ubicacion.type === "Polygon") {
              turfData.es_poligono = true;

              // Calcular área del polígono
              try {
                turfData.area_calculada = Math.round(
                  SpatialUtils.calculatePolygonArea(
                    building.ubicacion.coordinates[0]
                  )
                );
              } catch (areaError) {
                console.error(
                  `Error calculando área para ${building.nombre}:`,
                  areaError
                );
              }

              // Calcular centroide
              try {
                const points = building.ubicacion.coordinates[0].map(
                  (coord) => ({
                    lng: coord[0],
                    lat: coord[1],
                  })
                );
                turfData.centroide = SpatialUtils.calculateCentroid(points);
                turfData.bounding_box =
                  SpatialUtils.calculateBoundingBox(points);
              } catch (centroidError) {
                console.error(
                  `Error calculando centroide para ${building.nombre}:`,
                  centroidError
                );
              }
            }
          }

          // ANALIZAR SALAS CON MÉTRICAS ESPACIALES
          let salasAnalysis = {};
          if (building.salas && Array.isArray(building.salas)) {
            const salasCount = building.salas.length;
            const pisos = [...new Set(building.salas.map((sala) => sala.piso))];

            salasAnalysis = {
              total_salas: salasCount,
              pisos_count: pisos.length,
              pisos: pisos.sort(),
              densidad_salas: salasCount / (turfData.area_calculada || 1),
            };
          }

          return {
            ...building,
            ...turfData,
            salas_analysis: salasAnalysis,
          };
        } catch (turfError) {
          console.error(
            `Error en análisis Turf para edificio ${building.nombre}:`,
            turfError
          );
          return building; // Devolver edificio original si hay error
        }
      });

      setBuildings(buildingsWithTurfAnalysis);

      // CALCULAR ANALÍTICAS GLOBALES
      calculateBuildingAnalytics(buildingsWithTurfAnalysis);

      setBackendStatus("connected");
      console.log(
        `${buildingsWithTurfAnalysis.length} edificios cargados con análisis Turf`
      );
      return buildingsWithTurfAnalysis;
    } catch (err) {
      const errorMessage = err.message || "Error cargando edificios";
      console.error("Error en useBuildings.loadBuildings:", errorMessage);
      setError(errorMessage);
      setBackendStatus("error");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // CALCULAR ANALÍTICAS GLOBALES DE EDIFICIOS
  const calculateBuildingAnalytics = useCallback((buildingsData) => {
    try {
      if (!buildingsData || buildingsData.length === 0) {
        setBuildingAnalytics(null);
        return;
      }

      const analytics = {
        total_edificios: buildingsData.length,
        edificios_validos: 0,
        edificios_invalidos: 0,
        total_salas: 0,
        edificios_por_tipo: {},
        area_total: 0,
        distancia_promedio_centro: 0,
        distribucion_ubicacion: {
          puntos: 0,
          poligonos: 0,
        },
      };

      let totalDistancia = 0;
      let edificiosConDistancia = 0;

      buildingsData.forEach((building) => {
        // Conteo por validez
        if (building.ubicacion_valida) {
          analytics.edificios_validos++;
        } else {
          analytics.edificios_invalidos++;
        }

        // Conteo por tipo de geometría
        if (building.es_poligono) {
          analytics.distribucion_ubicacion.poligonos++;
          if (building.area_calculada) {
            analytics.area_total += building.area_calculada;
          }
        } else {
          analytics.distribucion_ubicacion.puntos++;
        }

        // Conteo por tipo de edificio
        const tipo = building.tipo || "académico";
        analytics.edificios_por_tipo[tipo] =
          (analytics.edificios_por_tipo[tipo] || 0) + 1;

        // Salas
        if (building.salas_analysis) {
          analytics.total_salas += building.salas_analysis.total_salas || 0;
        }

        // Distancia al centro
        if (building.distancia_al_centro) {
          totalDistancia += building.distancia_al_centro;
          edificiosConDistancia++;
        }
      });

      // Cálculos promedios
      analytics.distancia_promedio_centro =
        edificiosConDistancia > 0
          ? Math.round(totalDistancia / edificiosConDistancia)
          : 0;

      console.log("Analytics edificios calculadas:", analytics);
      setBuildingAnalytics(analytics);
    } catch (error) {
      console.error("Error calculando analytics de edificios:", error);
    }
  }, []);

  // CREAR EDIFICIO CON VALIDACIÓN TURF
  const createBuilding = useCallback(
    async (buildingData) => {
      setLoading(true);
      setError(null);

      try {
        console.log("Creando edificio con validación Turf...", buildingData);

        // VALIDACIÓN PREVIA CON TURF
        if (buildingData.lat && buildingData.lng) {
          const isValid = SpatialUtils.isPointInPolygon(
            buildingData.lat,
            buildingData.lng,
            [
              [-71.355622, -29.967316],
              [-71.346738, -29.967316],
              [-71.346738, -29.963208],
              [-71.355622, -29.963208],
              [-71.355622, -29.967316],
            ]
          );

          if (!isValid) {
            console.warn("Edificio creado fuera de los límites del campus");
          }
        }

        const response = await buildingService.createBuilding(buildingData);

        // Recargar edificios para incluir análisis Turf
        await loadBuildings();

        console.log("Edificio creado exitosamente con Turf");
        return response;
      } catch (err) {
        const errorMessage = err.message || "Error creando edificio";
        console.error("Error en useBuildings.createBuilding:", errorMessage);
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadBuildings]
  );

  // ACTUALIZAR EDIFICIO
  const updateBuilding = useCallback(
    async (buildingId, buildingData) => {
      setLoading(true);
      setError(null);

      try {
        console.log(`Actualizando edificio ${buildingId}...`);

        const response = await buildingService.updateBuilding(
          buildingId,
          buildingData
        );

        // Actualizar estado local
        setBuildings((prev) =>
          prev.map((building) =>
            building.id === buildingId
              ? { ...building, ...buildingData }
              : building
          )
        );

        // Recalcular analytics
        await loadBuildings();

        console.log("Edificio actualizado");
        return response;
      } catch (err) {
        const errorMessage = err.message || "Error actualizando edificio";
        console.error("Error en useBuildings.updateBuilding:", errorMessage);
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadBuildings]
  );

  // ELIMINAR EDIFICIO
  const deleteBuilding = useCallback(
    async (buildingId) => {
      setLoading(true);
      setError(null);

      try {
        console.log(`Eliminando edificio ${buildingId}...`);

        const response = await buildingService.deleteBuilding(buildingId);

        // Actualizar estado local
        setBuildings((prev) =>
          prev.filter((building) => building.id !== buildingId)
        );

        // Recalcular analytics
        await loadBuildings();

        console.log("Edificio eliminado");
        return response;
      } catch (err) {
        const errorMessage = err.message || "Error eliminando edificio";
        console.error("Error en useBuildings.deleteBuilding:", errorMessage);
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadBuildings]
  );

  // SINCRONIZAR CON GEOSERVER
  const syncWithGeoServer = useCallback(
    async (geoServerData) => {
      setLoading(true);
      setError(null);

      try {
        console.log("Sincronizando con GeoServer...");

        const response = await buildingService.syncWithGeoServer(geoServerData);

        // Recargar edificios después de sincronización
        await loadBuildings();

        console.log("Sincronización con GeoServer completada");
        return response;
      } catch (err) {
        const errorMessage = err.message || "Error sincronizando con GeoServer";
        console.error("Error en useBuildings.syncWithGeoServer:", errorMessage);
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [loadBuildings]
  );

  // VERIFICAR SALUD DEL BACKEND
  const checkBackendHealth = useCallback(async () => {
    try {
      console.log("Verificando salud del backend...");

      const response = await buildingService.checkHealth();
      setBackendStatus("connected");

      console.log("Backend saludable");
      return response;
    } catch (err) {
      console.error("Backend no disponible:", err);
      setBackendStatus("error");
      throw err;
    }
  }, []);

  // ENCONTRAR EDIFICIOS CERCANOS
  const findBuildingsNearPoint = useCallback(
    (point, maxDistance = 200) => {
      try {
        if (!point || !point.lat || !point.lng) {
          console.warn("Punto inválido para búsqueda de edificios cercanos");
          return [];
        }

        const edificiosCercanos = buildings.filter((building) => {
          try {
            if (!building.ubicacion || building.ubicacion.type !== "Point")
              return false;

            const [lng, lat] = building.ubicacion.coordinates;
            const distance = SpatialUtils.calculateDistance(point, {
              lat,
              lng,
            });

            return distance <= maxDistance;
          } catch (error) {
            console.error(
              `Error calculando distancia a edificio ${building.nombre}:`,
              error
            );
            return false;
          }
        });

        // Ordenar por distancia
        edificiosCercanos.sort((a, b) => {
          const [lngA, latA] = a.ubicacion.coordinates;
          const [lngB, latB] = b.ubicacion.coordinates;

          const distA = SpatialUtils.calculateDistance(point, {
            lat: latA,
            lng: lngA,
          });
          const distB = SpatialUtils.calculateDistance(point, {
            lat: latB,
            lng: lngB,
          });

          return distA - distB;
        });

        console.log(
          `Encontrados ${edificiosCercanos.length} edificios dentro de ${maxDistance}m`
        );
        return edificiosCercanos;
      } catch (error) {
        console.error("Error en findBuildingsNearPoint:", error);
        return [];
      }
    },
    [buildings]
  );

  // OBTENER ESTADÍSTICAS DE DENSIDAD
  const getDensityStats = useCallback(() => {
    if (!buildings.length) return null;

    const stats = {
      total_edificios: buildings.length,
      total_salas: buildingAnalytics?.total_salas || 0,
      area_total: buildingAnalytics?.area_total || 0,
      densidad_edificios: 0,
      densidad_salas: 0,
      edificios_por_hectarea: 0,
    };

    // Calcular densidad (asumiendo área aproximada del campus)
    const areaCampusAprox = 200000; // 20 hectáreas en m²
    stats.densidad_edificios = (
      (stats.total_edificios / areaCampusAprox) *
      10000
    ).toFixed(2);
    stats.densidad_salas = (
      (stats.total_salas / areaCampusAprox) *
      10000
    ).toFixed(2);
    stats.edificios_por_hectarea = (stats.total_edificios / 20).toFixed(1);

    return stats;
  }, [buildings, buildingAnalytics]);

  // CARGAR EDIFICIOS AL INICIALIZAR
  useEffect(() => {
    loadBuildings();

    // Verificar salud del backend periódicamente
    const healthCheckInterval = setInterval(() => {
      checkBackendHealth().catch(() => {});
    }, 30000); // Cada 30 segundos

    return () => clearInterval(healthCheckInterval);
  }, [loadBuildings, checkBackendHealth]);

  return {
    // Estado
    buildings,
    loading,
    error,
    backendStatus,
    buildingAnalytics,

    // Acciones
    loadBuildings,
    createBuilding,
    updateBuilding,
    deleteBuilding,
    syncWithGeoServer,
    checkBackendHealth,
    findBuildingsNearPoint,
    getDensityStats,

    // Utilidades
    hasBuildings: buildings.length > 0,
    isValidBuilding: (building) =>
      building && building.ubicacion_valida !== false,
    getBuildingById: (id) => buildings.find((building) => building.id === id),

    // Métricas Turf
    turfEnabled: true,
    turfVersion: "6.5.0",
  };
};

export default useBuildings;
