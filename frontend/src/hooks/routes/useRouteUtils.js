import { useCallback } from "react";
import { SpatialUtils } from "../../utils/spatialUtils";

export const useRouteUtils = (mapInstance, mapManagement) => {
  const handleRouteClick = useCallback(
    (route) => {
      console.log("Ruta seleccionada:", route);
      mapManagement.setSelectedRoute(route);

      // Solo selecciona la ruta sin ajustar la vista del mapa
      // Esto elimina el cuadro negro del bounding box
    },
    [mapManagement] // ← Quita mapInstance de las dependencias ya que no se usa
  );

  const validateRouteGeometry = useCallback(
    (routeData, validateCoordinates) => {
      if (routeData.puntos_ruta && routeData.puntos_ruta.length >= 2) {
        const coordinates = routeData.puntos_ruta.map(
          (p) => p.coordenadas.coordinates
        );

        const invalidPoints = routeData.puntos_ruta.filter((punto) => {
          const [lng, lat] = punto.coordenadas.coordinates;
          return !validateCoordinates(lat, lng);
        });

        if (invalidPoints.length > 0) {
          return { isValid: false, error: "points_out_of_bounds" };
        }

        if (!SpatialUtils.isValidLineString(coordinates)) {
          return { isValid: false, error: "invalid_geometry" };
        }
      }

      return { isValid: true };
    },
    []
  );

  return {
    handleRouteClick,
    validateRouteGeometry,
  };
};
