/**
 * Middleware de validación genérico
 * Proporciona funciones de validación reutilizables
 */

/**
 * Valida que un campo requerido esté presente
 */
const validateRequired = (field, value, fieldName) => {
  if (value === undefined || value === null || value === '') {
    throw new Error(`${fieldName || field} es requerido`);
  }
};

/**
 * Valida que un valor sea un número
 */
const validateNumber = (field, value, fieldName) => {
  if (value !== undefined && value !== null && isNaN(Number(value))) {
    throw new Error(`${fieldName || field} debe ser un número`);
  }
};

/**
 * Valida que un valor esté en un rango
 */
const validateRange = (field, value, min, max, fieldName) => {
  const numValue = Number(value);
  if (numValue < min || numValue > max) {
    throw new Error(
      `${fieldName || field} debe estar entre ${min} y ${max}`
    );
  }
};

/**
 * Valida coordenadas geográficas
 */
const validateCoordinates = (coordinates) => {
  if (!Array.isArray(coordinates)) {
    throw new Error('Las coordenadas deben ser un array');
  }

  if (coordinates.length < 2) {
    throw new Error('Las coordenadas deben tener al menos 2 elementos [lat, lng]');
  }

  const [lat, lng] = coordinates;
  
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    throw new Error('Las coordenadas deben ser números');
  }

  if (lat < -90 || lat > 90) {
    throw new Error('La latitud debe estar entre -90 y 90');
  }

  if (lng < -180 || lng > 180) {
    throw new Error('La longitud debe estar entre -180 y 180');
  }
};

/**
 * Valida geometría GeoJSON
 */
const validateGeoJSON = (geometry) => {
  if (!geometry || typeof geometry !== 'object') {
    throw new Error('La geometría debe ser un objeto');
  }

  if (!geometry.type) {
    throw new Error('La geometría debe tener un tipo');
  }

  const validTypes = ['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon'];
  if (!validTypes.includes(geometry.type)) {
    throw new Error(`Tipo de geometría inválido. Debe ser uno de: ${validTypes.join(', ')}`);
  }

  if (!geometry.coordinates || !Array.isArray(geometry.coordinates)) {
    throw new Error('La geometría debe tener coordenadas válidas');
  }
};

/**
 * Middleware para validar el body de la petición
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      if (schema) {
        schema(req.body);
      }
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error de validación',
      });
    }
  };
};

/**
 * Middleware para validar parámetros de URL
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      if (schema) {
        schema(req.params);
      }
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error de validación de parámetros',
      });
    }
  };
};

/**
 * Middleware para validar query parameters
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      if (schema) {
        schema(req.query);
      }
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error de validación de query',
      });
    }
  };
};

module.exports = {
  validateRequired,
  validateNumber,
  validateRange,
  validateCoordinates,
  validateGeoJSON,
  validateBody,
  validateParams,
  validateQuery,
};

