// backend/utils/turfUtils.js
const turf = require('@turf/turf');

const TurfUtils = {
  // ✅ VALIDAR COORDENADAS DENTRO DEL CAMPUS UCN
  isValidCampusLocation: (lat, lng) => {
    try {
      const campusBounds = turf.polygon([[
        [-71.355622, -29.967316], // SO
        [-71.346738, -29.967316], // SE
        [-71.346738, -29.963208], // NE
        [-71.355622, -29.963208], // NO
        [-71.355622, -29.967316]  // Cerrar polígono
      ]]);

      const point = turf.point([lng, lat]);
      return turf.booleanPointInPolygon(point, campusBounds);
    } catch (error) {
      console.error('❌ Error validando ubicación campus:', error);
      return false;
    }
  },

  // ✅ CALCULAR DISTANCIA REAL ENTRE PUNTOS (metros)
  calculateDistance: (point1, point2) => {
    try {
      const from = turf.point([point1.lng, point1.lat]);
      const to = turf.point([point2.lng, point2.lat]);
      return turf.distance(from, to, { units: 'meters' });
    } catch (error) {
      console.error('❌ Error calculando distancia:', error);
      return null;
    }
  },

  // ✅ CALCULAR LONGITUD DE RUTA (metros)
  calculateRouteLength: (coordinates) => {
    try {
      if (!coordinates || coordinates.length < 2) return 0;
      
      const lineString = turf.lineString(coordinates);
      return turf.length(lineString, { units: 'meters' });
    } catch (error) {
      console.error('❌ Error calculando longitud de ruta:', error);
      return 0;
    }
  },

  // ✅ VALIDAR GEOMETRÍA DE LÍNEA
  isValidLineString: (coordinates) => {
    try {
      if (!coordinates || coordinates.length < 2) return false;
      
      const line = turf.lineString(coordinates);
      return turf.booleanValid(line);
    } catch (error) {
      console.error('❌ Error validando LineString:', error);
      return false;
    }
  },

  // ✅ SIMPLIFICAR RUTA (reducir puntos)
  simplifyRoute: (coordinates, tolerance = 0.0001) => {
    try {
      const line = turf.lineString(coordinates);
      const simplified = turf.simplify(line, { tolerance, highQuality: true });
      return simplified.geometry.coordinates;
    } catch (error) {
      console.error('❌ Error simplificando ruta:', error);
      return coordinates;
    }
  },

  // ✅ ENCONTRAR PUNTO MÁS CERCANO EN RUTA
  findNearestPointOnRoute: (targetPoint, routeCoordinates) => {
    try {
      const routeLine = turf.lineString(routeCoordinates);
      const point = turf.point([targetPoint.lng, targetPoint.lat]);
      
      const nearest = turf.nearestPointOnLine(routeLine, point);
      return {
        point: nearest.geometry.coordinates, // [lng, lat]
        distance: nearest.properties.dist * 1000, // metros
        location: nearest.properties.location // fracción a lo largo de la línea
      };
    } catch (error) {
      console.error('❌ Error encontrando punto más cercano:', error);
      return null;
    }
  },

  // ✅ CALCULAR ÁREA DE POLÍGONO (m²)
  calculatePolygonArea: (coordinates) => {
    try {
      const polygon = turf.polygon([coordinates]);
      return turf.area(polygon);
    } catch (error) {
      console.error('❌ Error calculando área:', error);
      return 0;
    }
  },

  // ✅ GENERAR BUFFER ALREDEDOR DE PUNTO
  createBuffer: (point, radiusMeters) => {
    try {
      const center = turf.point([point.lng, point.lat]);
      const buffer = turf.buffer(center, radiusMeters / 1000, { units: 'kilometers' });
      return buffer.geometry.coordinates[0]; // coordenadas del polígono del buffer
    } catch (error) {
      console.error('❌ Error creando buffer:', error);
      return null;
    }
  },

  // ✅ CALCULAR CENTROIDE DE GEOMETRÍA
  calculateCentroid: (coordinates) => {
    try {
      let feature;
      
      if (coordinates.length === 1 && Array.isArray(coordinates[0][0])) {
        // Es un polígono
        feature = turf.polygon(coordinates);
      } else if (Array.isArray(coordinates[0]) && coordinates[0].length === 2) {
        // Es una línea
        feature = turf.lineString(coordinates);
      } else {
        // Es un multipunto
        const points = coordinates.map(coord => turf.point(coord));
        feature = turf.featureCollection(points);
      }
      
      const centroid = turf.centroid(feature);
      return centroid.geometry.coordinates; // [lng, lat]
    } catch (error) {
      console.error('❌ Error calculando centroide:', error);
      return null;
    }
  },

  // ✅ OPTIMIZAR RUTA (algoritmo básico)
  optimizeRoute: (waypoints) => {
    try {
      if (waypoints.length < 3) return waypoints;
      
      // Algoritmo simple de optimización - en producción usar algo más sofisticado
      const points = waypoints.map((wp, index) => ({
        ...wp,
        originalIndex: index
      }));
      
      // Ordenar por proximidad (algoritmo del vecino más cercano)
      const optimized = [points[0]];
      const remaining = points.slice(1);
      
      while (remaining.length > 0) {
        const lastPoint = optimized[optimized.length - 1];
        let nearestIndex = 0;
        let minDistance = Infinity;
        
        for (let i = 0; i < remaining.length; i++) {
          const distance = this.calculateDistance(lastPoint, remaining[i]);
          if (distance < minDistance) {
            minDistance = distance;
            nearestIndex = i;
          }
        }
        
        optimized.push(remaining[nearestIndex]);
        remaining.splice(nearestIndex, 1);
      }
      
      return optimized.map(p => ({
        lng: p.lng,
        lat: p.lat,
        nombre: p.nombre
      }));
    } catch (error) {
      console.error('❌ Error optimizando ruta:', error);
      return waypoints;
    }
  },

  // ✅ CALCULAR INTERSECCIÓN ENTRE RUTAS
  findRouteIntersections: (route1Coords, route2Coords) => {
    try {
      const line1 = turf.lineString(route1Coords);
      const line2 = turf.lineString(route2Coords);
      
      const intersections = turf.lineIntersect(line1, line2);
      return intersections.features.map(feature => feature.geometry.coordinates);
    } catch (error) {
      console.error('❌ Error encontrando intersecciones:', error);
      return [];
    }
  },

  // ✅ VALIDAR SI RUTA ES ACCESIBLE (pendientes suaves)
  isRouteAccessible: (coordinates, maxSlope = 0.08) => {
    try {
      if (coordinates.length < 2) return true;
      
      let totalSlope = 0;
      let segmentsWithSlope = 0;
      
      for (let i = 0; i < coordinates.length - 1; i++) {
        const pointA = coordinates[i];
        const pointB = coordinates[i + 1];
        
        // En un caso real, aquí obtendrías la elevación de un DEM
        // Por ahora simulamos con datos planos
        const elevationA = 0; // Obtener de base de datos de elevación
        const elevationB = 0;
        
        const horizontalDistance = this.calculateDistance(
          { lng: pointA[0], lat: pointA[1] },
          { lng: pointB[0], lat: pointB[1] }
        );
        
        if (horizontalDistance > 0) {
          const slope = Math.abs(elevationB - elevationA) / horizontalDistance;
          totalSlope += slope;
          segmentsWithSlope++;
        }
      }
      
      const averageSlope = segmentsWithSlope > 0 ? totalSlope / segmentsWithSlope : 0;
      return averageSlope <= maxSlope;
    } catch (error) {
      console.error('❌ Error validando accesibilidad:', error);
      return true;
    }
  }
};

module.exports = TurfUtils;