// 🎯 Coordenadas del Campus Guayacán - Universidad Católica del Norte
export const UCN_COQUIMBO_BOUNDS = [
  [-29.96672, -71.356201], // Suroeste
  [-29.96328, -71.346792], // Noreste
];

export const UCN_CAMPUS_CENTER = [-29.965, -71.35103]; // Centro calculado

export const MAP_ZOOM_LIMITS = {
  min: 16, // Más zoom out para ver contexto
  max: 19, // Mantener máximo zoom para detalles
  default: 17, // Zoom inicial más alejado para ver todo el campus
};

export const GEO_SERVER_CONFIG = {
  baseUrl: "http://localhost:8080/geoserver",
  workspace: "InteractiveMap",
  layerName: "edificio",
};
