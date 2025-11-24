// utils/buildings/buildingAnalytics.js
import { SpatialUtils } from "../spatialUtils";

/**
 * Enriquece un edificio con análisis de Turf.js
 * @param {object} building - Datos del edificio
 * @returns {object} Edificio enriquecido con datos Turf
 */
export const enrichBuildingWithTurf = (building) => {
    try {
        let turfData = {
            ubicacion_valida: false,
            distancia_al_centro: null,
            area_calculada: null,
            es_poligono: false,
            centroide: null,
            bounding_box: null,
        };

        // Bounds del campus UCN
        const campusBounds = [
            [-71.355622, -29.967316],
            [-71.346738, -29.967316],
            [-71.346738, -29.963208],
            [-71.355622, -29.963208],
            [-71.355622, -29.967316],
        ];

        const centroCampus = { lat: -29.965262, lng: -71.35118 };

        // ANALIZAR UBICACIÓN CON TURF
        if (building.ubicacion) {
            if (building.ubicacion.type === "Point") {
                const [lng, lat] = building.ubicacion.coordinates;

                // Validar si está dentro del campus
                turfData.ubicacion_valida = SpatialUtils.isPointInPolygon(
                    lat,
                    lng,
                    campusBounds
                );

                // Calcular distancia al centro del campus
                turfData.distancia_al_centro = Math.round(
                    SpatialUtils.calculateDistance({ lat, lng }, centroCampus)
                );

                turfData.centroide = [lng, lat];
            } else if (building.ubicacion.type === "Polygon") {
                turfData.es_poligono = true;

                // Calcular área del polígono
                try {
                    turfData.area_calculada = Math.round(
                        SpatialUtils.calculatePolygonArea(building.ubicacion.coordinates[0])
                    );
                } catch (areaError) {
                    console.error(
                        `Error calculando área para ${building.nombre}:`,
                        areaError
                    );
                }

                // Calcular centroide
                try {
                    const points = building.ubicacion.coordinates[0].map((coord) => ({
                        lng: coord[0],
                        lat: coord[1],
                    }));
                    turfData.centroide = SpatialUtils.calculateCentroid(points);
                    turfData.bounding_box = SpatialUtils.calculateBoundingBox(points);
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
};

/**
 * Calcula analíticas globales de un conjunto de edificios
 * @param {Array} buildingsData - Array de edificios
 * @returns {object} Analíticas calculadas
 */
export const calculateBuildingAnalytics = (buildingsData) => {
    try {
        if (!buildingsData || buildingsData.length === 0) {
            return null;
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

        return analytics;
    } catch (error) {
        console.error("Error calculando analytics de edificios:", error);
        return null;
    }
};

/**
 * Calcula estadísticas de densidad del campus
 * @param {number} totalEdificios - Total de edificios
 * @param {number} totalSalas - Total de salas
 * @param {number} areaTotal - Área total en m²
 * @returns {object} Estadísticas de densidad
 */
export const calculateDensityStats = (totalEdificios, totalSalas, areaTotal) => {
    const stats = {
        total_edificios: totalEdificios,
        total_salas: totalSalas,
        area_total: areaTotal,
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
    stats.densidad_salas = ((stats.total_salas / areaCampusAprox) * 10000).toFixed(
        2
    );
    stats.edificios_por_hectarea = (stats.total_edificios / 20).toFixed(1);

    return stats;
};
