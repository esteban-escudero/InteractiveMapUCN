// utils/buildings/buildingQueries.js
import { SpatialUtils } from "../spatialUtils";

/**
 * Encuentra edificios cercanos a un punto
 * @param {Array} buildings - Array de edificios
 * @param {object} point - Punto {lat, lng}
 * @param {number} maxDistance - Distancia máxima en metros
 * @returns {Array} Edificios cercanos ordenados por distancia
 */
export const findBuildingsNearPoint = (buildings, point, maxDistance = 200) => {
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

        return edificiosCercanos;
    } catch (error) {
        console.error("Error en findBuildingsNearPoint:", error);
        return [];
    }
};

/**
 * Valida si un edificio es válido
 * @param {object} building - Edificio a validar
 * @returns {boolean} True si es válido
 */
export const isValidBuilding = (building) => {
    return building && building.ubicacion_valida !== false;
};

/**
 * Obtiene un edificio por ID
 * @param {Array} buildings - Array de edificios
 * @param {string} id - ID del edificio
 * @returns {object|undefined} Edificio encontrado
 */
export const getBuildingById = (buildings, id) => {
    return buildings.find((building) => building.id === id);
};
