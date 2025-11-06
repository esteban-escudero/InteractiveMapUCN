// utils/spatialUtils.js
import { 
  distance, 
  length, 
  lineString, 
  point, 
  polygon, 
  booleanPointInPolygon,
  area,
  nearestPoint,
  along,
  bearing,
  destination,
  centroid,
  bbox,
  bboxPolygon
} from '@turf/turf';

export const SpatialUtils = {
  // ✅ Calcular distancia entre dos puntos
  calculateDistance: (point1, point2, units = 'meters') => {
    return distance([point1.lng, point1.lat], [point2.lng, point2.lat], { 
      units: units 
    });
  },
  
  // ✅ Calcular longitud total de una ruta
  calculateRouteLength: (coordinates, units = 'meters') => {
    if (coordinates.length < 2) return 0;
    const line = lineString(coordinates);
    return length(line, { units: units });
  },
  
  // ✅ Verificar si un punto está dentro de un polígono
  isPointInPolygon: (lat, lng, polygonCoords) => {
    try {
      const turfPolygon = polygon([polygonCoords]);
      const testPoint = point([lng, lat]);
      return booleanPointInPolygon(testPoint, turfPolygon);
    } catch (error) {
      console.error('Error verificando punto en polígono:', error);
      return false;
    }
  },
  
  // ✅ Calcular área de un polígono
  calculatePolygonArea: (polygonCoords, units = 'meters') => {
    try {
      const turfPolygon = polygon([polygonCoords]);
      return area(turfPolygon);
    } catch (error) {
      console.error('Error calculando área:', error);
      return 0;
    }
  },
  
  // ✅ Encontrar el punto más cercano
  findNearestPoint: (targetPoint, points) => {
    try {
      const turfTarget = point([targetPoint.lng, targetPoint.lat]);
      const turfPoints = points.map((p, index) => 
        point([p.lng, p.lat], { index, ...p })
      );
      
      const nearest = nearestPoint(turfTarget, turfPoints);
      return nearest.properties;
    } catch (error) {
      console.error('Error encontrando punto más cercano:', error);
      return null;
    }
  },
  
  // ✅ Calcular punto a lo largo de una línea
  pointAlongLine: (coordinates, distance, units = 'meters') => {
    try {
      const line = lineString(coordinates);
      const pointOnLine = along(line, distance, { units: units });
      return pointOnLine.geometry.coordinates; // [lng, lat]
    } catch (error) {
      console.error('Error calculando punto en línea:', error);
      return null;
    }
  },
  
  // ✅ Calcular rumbo entre dos puntos
  calculateBearing: (point1, point2) => {
    return bearing([point1.lng, point1.lat], [point2.lng, point2.lat]);
  },
  
  // ✅ Calcular destino desde un punto con rumbo y distancia
  calculateDestination: (startPoint, distance, bearing, units = 'meters') => {
    const destinationPoint = destination(
      [startPoint.lng, startPoint.lat],
      distance,
      bearing,
      { units: units }
    );
    return destinationPoint.geometry.coordinates; // [lng, lat]
  },
  
  // ✅ Calcular centroide de un conjunto de puntos
  calculateCentroid: (points) => {
    try {
      const turfPoints = points.map(p => point([p.lng, p.lat]));
      const centroidPoint = centroid({
        type: 'FeatureCollection',
        features: turfPoints
      });
      return centroidPoint.geometry.coordinates; // [lng, lat]
    } catch (error) {
      console.error('Error calculando centroide:', error);
      return null;
    }
  },
  
  // ✅ Calcular bounding box
  calculateBoundingBox: (points) => {
    try {
      const turfPoints = points.map(p => point([p.lng, p.lat]));
      const bboxCoords = bbox({
        type: 'FeatureCollection',
        features: turfPoints
      });
      return bboxCoords; // [minLng, minLat, maxLng, maxLat]
    } catch (error) {
      console.error('Error calculando bounding box:', error);
      return null;
    }
  },
  
  // ✅ Validar geometría de línea
  isValidLineString: (coordinates) => {
    try {
      if (!coordinates || coordinates.length < 2) return false;
      const line = lineString(coordinates);
      return line !== null;
    } catch (error) {
      return false;
    }
  },
  
  // ✅ Simplificar línea (reducir puntos)
  simplifyLine: (coordinates, tolerance = 0.0001, highQuality = false) => {
    try {
      const { simplify } = require('@turf/turf');
      const line = lineString(coordinates);
      const simplified = simplify(line, { tolerance, highQuality });
      return simplified.geometry.coordinates;
    } catch (error) {
      console.error('Error simplificando línea:', error);
      return coordinates;
    }
  }
};

export default SpatialUtils;