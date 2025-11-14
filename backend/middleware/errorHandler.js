/**
 * Middleware de manejo de errores centralizado
 */
const config = require('../config/app');

const errorHandler = (err, req, res, next) => {
  // Log del error
  console.error('Error:', {
    message: err.message,
    stack: config.server.env === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Determinar código de estado
  const statusCode = err.statusCode || err.status || 500;

  // Respuesta de error
  const response = {
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(config.server.env === 'development' && {
      error: {
        message: err.message,
        stack: err.stack,
      },
    }),
  };

  // Errores de validación
  if (err.name === 'ValidationError') {
    response.message = 'Error de validación';
    response.errors = err.errors || err.message;
  }

  // Errores de base de datos
  if (err.code === '23505') {
    // Violación de constraint único
    response.message = 'El recurso ya existe';
    return res.status(409).json(response);
  }

  if (err.code === '23503') {
    // Violación de foreign key
    response.message = 'No se puede eliminar el recurso porque tiene dependencias';
    return res.status(409).json(response);
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;