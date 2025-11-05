// 🎯 Coordenadas del Campus Guayacán - Universidad Católica del Norte
export const UCN_COQUIMBO_BOUNDS = [
  [-29.967362, -71.355547], // Suroeste
  [-29.963179, -71.346513], // Noreste
];

export const UCN_CAMPUS_CENTER = [-29.965335, -71.3519868]; // Centro calculado

export const MAP_ZOOM_LIMITS = {
  min: 17.5, // Más zoom out para ver contexto
  max: 19.5, // Mantener máximo zoom para detalles
  default: 18, // Zoom inicial más alejado para ver todo el campus
};

export const GEO_SERVER_CONFIG = {
  baseUrl: "http://localhost:8080/geoserver",
  workspace: "InteractiveMap",
  layerName: "edificio",
};
