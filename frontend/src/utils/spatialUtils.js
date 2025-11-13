// utils/spatialUtils.js
import * as turf from "@turf/turf";

export const SpatialUtils = {
  // Calcular distancia entre dos puntos
  calculateDistance(point1, point2) {
    try {
      if (!point1 || !point2) {
        console.warn("Puntos inválidos para calcular distancia");
        return Infinity;
      }

      const { lat: lat1, lng: lng1 } = point1;
      const { lat: lat2, lng: lng2 } = point2;

      // Validar que las coordenadas sean números
      if (
        typeof lat1 !== "number" ||
        typeof lng1 !== "number" ||
        typeof lat2 !== "number" ||
        typeof lng2 !== "number" ||
        isNaN(lat1) ||
        isNaN(lng1) ||
        isNaN(lat2) ||
        isNaN(lng2)
      ) {
        console.warn("Coordenadas inválidas para calcular distancia:", {
          point1,
          point2,
        });
        return Infinity;
      }

      // Usar Turf.js para cálculo más preciso
      const from = turf.point([lng1, lat1]);
      const to = turf.point([lng2, lat2]);
      const distance = turf.distance(from, to, { units: "meters" });

      return distance;
    } catch (error) {
      console.error("Error calculando distancia:", error);
      return Infinity;
    }
  },

  // Calcular longitud total de una ruta
  calculateRouteLength(coordinates, units = "meters") {
    if (!coordinates || coordinates.length < 2) return 0;
    try {
      const line = turf.lineString(coordinates);
      return turf.length(line, { units: units });
    } catch (error) {
      console.error("Error calculando longitud de ruta:", error);
      return 0;
    }
  },

  // Verificar si un punto está dentro de un polígono
  isPointInPolygon(lat, lng, polygonCoords) {
    try {
      const turfPolygon = turf.polygon([polygonCoords]);
      const testPoint = turf.point([lng, lat]);
      return turf.booleanPointInPolygon(testPoint, turfPolygon);
    } catch (error) {
      console.error("Error verificando punto en polígono:", error);
      return false;
    }
  },

  // Calcular área de un polígono
  calculatePolygonArea(polygonCoords, units = "meters") {
    try {
      const turfPolygon = turf.polygon([polygonCoords]);
      return turf.area(turfPolygon);
    } catch (error) {
      console.error("Error calculando área:", error);
      return 0;
    }
  },

  // FUNCIÓN CORREGIDA PARA ENCONTRAR PUNTO MÁS CERCANO
  findNearestPoint(targetPoint, points) {
    try {
      if (!targetPoint || !points || !points.length) {
        console.warn("Puntos inválidos para encontrar el más cercano");
        return null;
      }

      let nearestPoint = null;
      let minDistance = Infinity;

      // Filtrar puntos válidos
      const validPoints = points.filter(
        (point) =>
          point &&
          typeof point.lat === "number" &&
          typeof point.lng === "number" &&
          !isNaN(point.lat) &&
          !isNaN(point.lng)
      );

      if (validPoints.length === 0) {
        console.warn("No hay puntos válidos para comparar");
        return null;
      }

      for (const point of validPoints) {
        try {
          const distance = this.calculateDistance(targetPoint, point);

          if (distance < minDistance) {
            minDistance = distance;
            nearestPoint = point;
          }
        } catch (error) {
          console.warn("Error calculando distancia para punto:", point, error);
          continue;
        }
      }

      console.log(
        `Punto más cercano encontrado: ${
          nearestPoint ? nearestPoint.building?.nombre : "N/A"
        } (${Math.round(minDistance)}m)`
      );
      return nearestPoint;
    } catch (error) {
      console.error("Error en findNearestPoint:", error);
      return null;
    }
  },

  // Calcular punto a lo largo de una línea
  pointAlongLine(coordinates, distance, units = "meters") {
    try {
      const line = turf.lineString(coordinates);
      const pointOnLine = turf.along(line, distance, { units: units });
      return pointOnLine.geometry.coordinates; // [lng, lat]
    } catch (error) {
      console.error("Error calculando punto en línea:", error);
      return null;
    }
  },

  // Calcular rumbo entre dos puntos
  calculateBearing(point1, point2) {
    try {
      return turf.bearing([point1.lng, point1.lat], [point2.lng, point2.lat]);
    } catch (error) {
      console.error("Error calculando rumbo:", error);
      return 0;
    }
  },

  // Calcular destino desde un punto con rumbo y distancia
  calculateDestination(startPoint, distance, bearing, units = "meters") {
    try {
      const destinationPoint = turf.destination(
        [startPoint.lng, startPoint.lat],
        distance,
        bearing,
        { units: units }
      );
      return destinationPoint.geometry.coordinates; // [lng, lat]
    } catch (error) {
      console.error("Error calculando destino:", error);
      return null;
    }
  },

  // Calcular centroide de un conjunto de puntos
  calculateCentroid(points) {
    try {
      const turfPoints = points.map((p) => turf.point([p.lng, p.lat]));
      const centroidPoint = turf.centroid({
        type: "FeatureCollection",
        features: turfPoints,
      });
      return centroidPoint.geometry.coordinates; // [lng, lat]
    } catch (error) {
      console.error("Error calculando centroide:", error);
      return null;
    }
  },

  // Calcular bounding box
  calculateBoundingBox(points) {
    try {
      const turfPoints = points.map((p) => turf.point([p.lng, p.lat]));
      const bboxCoords = turf.bbox({
        type: "FeatureCollection",
        features: turfPoints,
      });
      return bboxCoords; // [minLng, minLat, maxLng, maxLat]
    } catch (error) {
      console.error("Error calculando bounding box:", error);
      return null;
    }
  },

  // Validar geometría de línea
  isValidLineString(coordinates) {
    try {
      if (!coordinates || coordinates.length < 2) return false;
      const line = turf.lineString(coordinates);
      return line !== null;
    } catch (error) {
      return false;
    }
  },

  // Simplificar línea (reducir puntos)
  simplifyLine(coordinates, tolerance = 0.0001, highQuality = false) {
    try {
      const line = turf.lineString(coordinates);
      const simplified = turf.simplify(line, { tolerance, highQuality });
      return simplified.geometry.coordinates;
    } catch (error) {
      console.error("Error simplificando línea:", error);
      return coordinates;
    }
  },

  // En utils/spatialUtils.js - Verifica que esta función existe:
  calculateDistanceToLine(point, lineStart, lineEnd) {
    try {
      if (!point || !lineStart || !lineEnd) {
        console.warn("Puntos inválidos para calculateDistanceToLine");
        return Infinity;
      }

      const isValidCoord = (coord) =>
        coord &&
        typeof coord.lat === "number" &&
        typeof coord.lng === "number" &&
        !isNaN(coord.lat) &&
        !isNaN(coord.lng);

      if (
        !isValidCoord(point) ||
        !isValidCoord(lineStart) ||
        !isValidCoord(lineEnd)
      ) {
        console.warn("Coordenadas inválidas:", { point, lineStart, lineEnd });
        return Infinity;
      }

      const pointTurf = turf.point([point.lng, point.lat]);
      const lineTurf = turf.lineString([
        [lineStart.lng, lineStart.lat],
        [lineEnd.lng, lineEnd.lat],
      ]);

      const nearestPoint = turf.nearestPointOnLine(lineTurf, pointTurf);
      return turf.distance(pointTurf, nearestPoint, { units: "meters" });
    } catch (error) {
      console.error("Error calculating distance to line:", error);
      return Infinity;
    }
  },
};

export default SpatialUtils;
