// backend/middleware/spatialValidation.js
const TurfUtils = require("../utils/turfUtils");

const spatialValidation = {
  // MIDDLEWARE: VALIDAR COORDENADAS DE EDIFICIO
  validateBuildingLocation: (req, res, next) => {
    try {
      const { lat, lng, ubicacion } = req.body;

      let latitude, longitude;

      if (ubicacion && ubicacion.type === "Point") {
        [longitude, latitude] = ubicacion.coordinates;
      } else if (lat !== undefined && lng !== undefined) {
        latitude = parseFloat(lat);
        longitude = parseFloat(lng);
      } else {
        return res.status(400).json({
          success: false,
          message: "Coordenadas o ubicación GeoJSON requeridas",
        });
      }

      // Validar que sean números
      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({
          success: false,
          message: "Las coordenadas deben ser números válidos",
        });
      }

      // Validar rango de coordenadas
      if (
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        return res.status(400).json({
          success: false,
          message: "Coordenadas fuera de rango válido",
        });
      }

      // Validar que esté dentro del campus UCN
      const isValid = TurfUtils.isValidCampusLocation(latitude, longitude);

      if (!isValid) {
        console.warn(`Coordenadas fuera del campus: ${latitude}, ${longitude}`);
        // No bloqueamos, solo advertimos
        req.spatialWarning = "Ubicación fuera de los límites del campus UCN";
      }

      // Agregar datos validados al request
      req.validatedCoords = { lat: latitude, lng: longitude };
      next();
    } catch (error) {
      console.error("Error en validación espacial:", error);
      return res.status(500).json({
        success: false,
        message: "Error en validación de coordenadas",
      });
    }
  },

  // MIDDLEWARE: VALIDAR GEOMETRÍA DE RUTA
  validateRouteGeometry: (req, res, next) => {
    try {
      const { geometria } = req.body;

      if (!geometria) {
        return res.status(400).json({
          success: false,
          message: "Geometría de ruta requerida",
        });
      }

      if (geometria.type !== "LineString") {
        return res.status(400).json({
          success: false,
          message: "Tipo de geometría debe ser LineString",
        });
      }

      const { coordinates } = geometria;

      if (!Array.isArray(coordinates) || coordinates.length < 2) {
        return res.status(400).json({
          success: false,
          message: "La ruta debe tener al menos 2 puntos",
        });
      }

      // Validar cada coordenada
      for (const coord of coordinates) {
        if (!Array.isArray(coord) || coord.length !== 2) {
          return res.status(400).json({
            success: false,
            message: "Cada coordenada debe ser un array [lng, lat]",
          });
        }

        const [lng, lat] = coord;

        if (isNaN(lng) || isNaN(lat)) {
          return res.status(400).json({
            success: false,
            message: "Todas las coordenadas deben ser números válidos",
          });
        }
      }

      // Validar geometría con Turf
      const isValid = TurfUtils.isValidLineString(coordinates);
      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: "Geometría de ruta no válida",
        });
      }

      // Calcular distancia real si no viene
      if (!req.body.distancia) {
        const realDistance = Math.round(
          TurfUtils.calculateRouteLength(coordinates)
        );
        req.body.distancia = realDistance;

        // Calcular tiempo estimado si no viene
        if (!req.body.tiempo_estimado) {
          req.body.tiempo_estimado = Math.round(realDistance / 80); // 80m/min caminando
        }
      }

      next();
    } catch (error) {
      console.error("Error validando geometría de ruta:", error);
      return res.status(500).json({
        success: false,
        message: "Error en validación de geometría",
      });
    }
  },

  // MIDDLEWARE: VALIDAR PUNTOS DE RUTA
  validateRoutePoints: (req, res, next) => {
    try {
      const { puntos_ruta } = req.body;

      if (!puntos_ruta || !Array.isArray(puntos_ruta)) {
        return next(); // No es requerido
      }

      for (const punto of puntos_ruta) {
        if (!punto.coordenadas || punto.coordenadas.type !== "Point") {
          return res.status(400).json({
            success: false,
            message: "Cada punto debe tener coordenadas tipo Point",
          });
        }

        const [lng, lat] = punto.coordenadas.coordinates;

        if (isNaN(lng) || isNaN(lat)) {
          return res.status(400).json({
            success: false,
            message: "Coordenadas de punto deben ser números válidos",
          });
        }

        // Validar ubicación en campus
        const isValid = TurfUtils.isValidCampusLocation(lat, lng);
        if (!isValid) {
          console.warn(`Punto de ruta fuera del campus: ${lat}, ${lng}`);
        }
      }

      next();
    } catch (error) {
      console.error("Error validando puntos de ruta:", error);
      return res.status(500).json({
        success: false,
        message: "Error en validación de puntos de ruta",
      });
    }
  },

  // MIDDLEWARE: OPTIMIZAR RUTA ANTES DE GUARDAR
  optimizeRoute: (req, res, next) => {
    try {
      const { geometria, puntos_ruta } = req.body;

      if (!geometria || !geometria.coordinates) return next();

      // Simplificar ruta si tiene muchos puntos
      if (geometria.coordinates.length > 50) {
        console.log("Simplificando ruta con muchos puntos...");
        const simplified = TurfUtils.simplifyRoute(geometria.coordinates);
        req.body.geometria.coordinates = simplified;

        console.log(
          `Ruta simplificada: ${geometria.coordinates.length} → ${simplified.length} puntos`
        );
      }

      next();
    } catch (error) {
      console.error("Error optimizando ruta:", error);
      next(); // Continuar sin optimización
    }
  },
};

module.exports = spatialValidation;
