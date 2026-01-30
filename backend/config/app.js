/**
 * Configuración centralizada de la aplicación
 */

require('dotenv').config();

module.exports = {
  // Configuracion del servidor
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development',
  },

  // Configuración de base de datos
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5433,
    name: process.env.DB_NAME || 'InteractiveMapDB',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'admin',
  },

  // Configuración CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  // Configuración GeoServer
  geoserver: {
    url: process.env.GEO_SERVER_URL || 'http://localhost:8080/geoserver',
    workspace: process.env.GEO_SERVER_WORKSPACE || 'InteractiveMap',
  },

  // Límites de carga
  limits: {
    json: '10mb',
  },
};

