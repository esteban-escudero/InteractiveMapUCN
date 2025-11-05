<<<<<<< HEAD
/*
export const UCN_COQUIMBO_BOUNDS = [
  [-29.967316, -71.355622],
  [-29.963208, -71.346738],
];
*/

export const UCN_COQUIMBO_BOUNDS = [
  [-29.968, -71.3565], // suroeste
  [-29.9628, -71.3467], // noreste
=======
// 🎯 Coordenadas del Campus Guayacán - Universidad Católica del Norte
export const UCN_COQUIMBO_BOUNDS = [
  [-29.967362, -71.355547], // Suroeste
  [-29.963179, -71.346513], // Noreste
>>>>>>> origin/main
];

export const UCN_CAMPUS_CENTER = [-29.965335, -71.3519868]; // Centro calculado

export const MAP_ZOOM_LIMITS = {
<<<<<<< HEAD
  min: 17.5,
  max: 19.5,
  default: 18,
=======
  min: 17.5, // Más zoom out para ver contexto
  max: 19.5, // Mantener máximo zoom para detalles
  default: 18, // Zoom inicial más alejado para ver todo el campus
>>>>>>> origin/main
};

export const GEO_SERVER_CONFIG = {
  baseUrl: "http://localhost:8080/geoserver",
  workspace: "InteractiveMap",
  layerName: "edificio",
};
