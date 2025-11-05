export const UCN_COQUIMBO_BOUNDS = [
  [-29.967316, -71.355622], //Coordenadas funcionales, no cambiar
  [-29.963208, -71.346738], //Estas tampoco
];

export const MAP_ZOOM_LIMITS = {
  min: 17, //Evita alejar demasiado.
  max: 19, //Evita acercar demasiado
  default: 17, //Zoom inicial
};

export const GEO_SERVER_CONFIG = {
  baseUrl: "http://localhost:8080/geoserver",
  workspace: "InteractiveMap",
  layerName: "edificio",
};
