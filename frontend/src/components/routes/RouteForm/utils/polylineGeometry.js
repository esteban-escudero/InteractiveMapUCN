// components/routes/RouteForm/utils/polylineGeometry.js
import { SpatialUtils } from "utils/spatialUtils";

/**
 * Calcula la longitud total de una ruta
 * @param {Array} latLngs - Array de coordenadas [lat, lng]
 * @returns {number} Longitud en metros
 */
export const calculateRouteLength = (latLngs) => {
    if (!latLngs || latLngs.length < 2) {
        return 0;
    }

    let totalDistance = 0;

    for (let i = 0; i < latLngs.length - 1; i++) {
        const point1 = {
            lat: latLngs[i][0],
            lng: latLngs[i][1],
        };
        const point2 = {
            lat: latLngs[i + 1][0],
            lng: latLngs[i + 1][1],
        };

        try {
            const segmentDistance = SpatialUtils.calculateDistance(point1, point2);
            totalDistance += segmentDistance;
        } catch (error) {
            console.error("Error calculando distancia del segmento:", error);
        }
    }

    return Math.round(totalDistance);
};

/**
 * Encuentra el punto más cercano en un segmento de línea
 * @param {object} point - Punto {lat, lng}
 * @param {object} lineStart - Inicio del segmento {lat, lng}
 * @param {object} lineEnd - Fin del segmento {lat, lng}
 * @returns {object} Punto más cercano {lat, lng}
 */
export const getClosestPointOnSegment = (point, lineStart, lineEnd) => {
    const A = point.lat - lineStart.lat;
    const B = point.lng - lineStart.lng;
    const C = lineEnd.lat - lineStart.lat;
    const D = lineEnd.lng - lineStart.lng;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
        param = dot / lenSq;
    }

    let closestLat, closestLng;

    if (param < 0) {
        closestLat = lineStart.lat;
        closestLng = lineStart.lng;
    } else if (param > 1) {
        closestLat = lineEnd.lat;
        closestLng = lineEnd.lng;
    } else {
        closestLat = lineStart.lat + param * C;
        closestLng = lineStart.lng + param * D;
    }

    return { lat: closestLat, lng: closestLng };
};

/**
 * Calcula la distancia de un punto a un segmento de línea
 * @param {object} point - Punto {lat, lng}
 * @param {object} lineStart - Inicio del segmento {lat, lng}
 * @param {object} lineEnd - Fin del segmento {lat, lng}
 * @returns {number} Distancia en metros
 */
export const getDistanceToSegment = (point, lineStart, lineEnd) => {
    const closestPoint = getClosestPointOnSegment(point, lineStart, lineEnd);

    try {
        return SpatialUtils.calculateDistance(point, closestPoint);
    } catch (error) {
        console.error("Error calculando distancia al segmento:", error);
        return Infinity;
    }
};
