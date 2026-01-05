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

/*export const MAP_CONFIG = {
  bounds: [
    [-29.967316, -71.355622],
    [-29.963208, -71.346738], 
  ],
  zoom: {
    min: 19, 
    max: 19,
    default: 19, 
  },
};*/

//Coordenadas de Prueba
export const MAP_CONFIG = {
  bounds: [
    [-30.81757, -71.26728],
    [-30.84844, -71.24359],
  ],


  zoom: {
    min: 19,
    max: 19,
    default: 19,
  },
};

export const APP_CONFIG = {
  name: 'InteractiveMapUCN',
  version: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
};

