/**
 * Configuración centralizada de la aplicación frontend
 */

export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 30000,
};

export const GEO_SERVER_CONFIG = {
  baseUrl: process.env.REACT_APP_GEO_SERVER_URL || 'http://localhost:8080/geoserver',
  workspace: process.env.REACT_APP_GEO_SERVER_WORKSPACE || 'InteractiveMap',
  layerName: process.env.REACT_APP_GEO_SERVER_LAYER || 'edificio',
};

export const MAP_CONFIG = {
  bounds: [
    [-29.967316, -71.355622], // Coordenadas funcionales, no cambiar
    [-29.963208, -71.346738], // Estas tampoco
  ],
  zoom: {
    min: parseInt(process.env.REACT_APP_MIN_ZOOM) || 17,
    max: parseInt(process.env.REACT_APP_MAX_ZOOM) || 19,
    default: parseInt(process.env.REACT_APP_DEFAULT_ZOOM) || 17,
  },
};

export const APP_CONFIG = {
  name: 'InteractiveMapUCN',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
};

