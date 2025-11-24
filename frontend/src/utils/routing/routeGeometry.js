// utils/routing/routeGeometry.js
import { SpatialUtils } from "../spatialUtils";

/**
 * Calcula el ángulo entre tres puntos
 * @param {Array} pointA - Punto A [lng, lat]
 * @param {Array} pointB - Punto B [lng, lat] (vértice)
 * @param {Array} pointC - Punto C [lng, lat]
 * @returns {number} Ángulo en grados
 */
export const calculateAngle = (pointA, pointB, pointC) => {
    const vector1 = [pointA[0] - pointB[0], pointA[1] - pointB[1]];
    const vector2 = [pointC[0] - pointB[0], pointC[1] - pointB[1]];
    const dotProduct = vector1[0] * vector2[0] + vector1[1] * vector2[1];
    const magnitude1 = Math.sqrt(vector1[0] ** 2 + vector1[1] ** 2);
    const magnitude2 = Math.sqrt(vector2[0] ** 2 + vector2[1] ** 2);

    const cosine = dotProduct / (magnitude1 * magnitude2);
    const angle = Math.acos(Math.max(-1, Math.min(1, cosine))) * (180 / Math.PI);

    return angle;
};

/**
 * Encuentra el punto más cercano en una ruta a unas coordenadas dadas
 * @param {object} buildingCoords - Coordenadas del edificio {lat, lng}
 * @param {Array} routeCoordinates - Array de coordenadas de la ruta [[lng, lat], ...]
 * @returns {object} {point, distance, index}
 */
export const findClosestPointOnRoute = (buildingCoords, routeCoordinates) => {
    let closestPoint = null;
    let minDistance = Infinity;
    let closestIndex = -1;

    routeCoordinates.forEach((coord, index) => {
        const distance = SpatialUtils.calculateDistance(
            { lat: buildingCoords.lat, lng: buildingCoords.lng },
            { lat: coord[1], lng: coord[0] }
        );

        if (distance < minDistance) {
            minDistance = distance;
            closestPoint = coord;
            closestIndex = index;
        }
    });
    return { point: closestPoint, distance: minDistance, index: closestIndex };
};

/**
 * Extrae un segmento de ruta entre dos índices
 * @param {Array} routeCoordinates - Coordenadas de la ruta
 * @param {number} startIndex - Índice de inicio
 * @param {number} endIndex - Índice de fin
 * @returns {Array} Segmento de coordenadas
 */
export const extractRouteSegment = (routeCoordinates, startIndex, endIndex) => {
    if (startIndex < endIndex) {
        return routeCoordinates.slice(startIndex, endIndex + 1);
    } else {
        return routeCoordinates.slice(endIndex, startIndex + 1).reverse();
    }
};

/**
 * Valida y limpia un array de coordenadas
 * @param {Array} coordinates - Array de coordenadas [[lng, lat], ...]
 * @returns {Array|null} Coordenadas limpias o null si son inválidas
 */
export const validateAndCleanCoordinates = (coordinates) => {
    if (!Array.isArray(coordinates)) return null;

    const cleaned = coordinates
        .map((coord) => {
            if (!Array.isArray(coord) || coord.length < 2) return null;
            const [lng, lat] = coord;
            if (
                typeof lng !== "number" ||
                typeof lat !== "number" ||
                isNaN(lng) ||
                isNaN(lat)
            ) {
                return null;
            }
            if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
                return null;
            }
            return [lng, lat];
        })
        .filter((coord) => coord !== null);

    return cleaned.length >= 2 ? cleaned : null;
};

/**
 * Encuentra el edificio más cercano a un punto en un grafo
 * @param {Array} point - Punto [lng, lat]
 * @param {object} graph - Grafo de edificios
 * @param {number} maxDistance - Distancia máxima en metros
 * @returns {object} {building, distance}
 */
export const findClosestBuilding = (point, graph, maxDistance = 100) => {
    let closestBuilding = null;
    let minDistance = Infinity;

    Object.keys(graph).forEach((buildingName) => {
        const building = graph[buildingName];
        const distance = SpatialUtils.calculateDistance(
            { lat: point[1], lng: point[0] },
            { lat: building.coords.lat, lng: building.coords.lng }
        );

        if (distance < minDistance && distance < maxDistance) {
            minDistance = distance;
            closestBuilding = buildingName;
        }
    });

    return { building: closestBuilding, distance: minDistance };
};
