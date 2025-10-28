// 🎯 Coordenadas del Campus Guayacán - Universidad Católica del Norte
// Bounds ampliados para permitir navegación fluida
export const UCN_COQUIMBO_BOUNDS = [
  [-29.972, -71.362], // Suroeste (más margen)
  [-29.958, -71.343], // Noreste (más margen)
];

// 📍 Centro exacto del Campus Guayacán
export const UCN_CAMPUS_CENTER = [-29.965, -71.3525];

export const MAP_ZOOM_LIMITS = {
  min: 17, // Más zoom out para ver contexto
  max: 19, // Mantener máximo zoom para detalles
  default: 17.5, // Zoom inicial más alejado para ver todo el campus
};

export const GEO_SERVER_CONFIG = {
  baseUrl: "http://localhost:8080/geoserver",
  workspace: "InteractiveMap",
  layerName: "edificio",
};
