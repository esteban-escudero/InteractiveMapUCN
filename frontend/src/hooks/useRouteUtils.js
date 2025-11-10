import { useCallback } from "react";
import L from "leaflet";
import { SpatialUtils } from "../utils/spatialUtils";

export const useRouteUtils = (mapInstance, mapManagement) => {
  const handleRouteClick = useCallback(
    (route) => {
      console.log("Ruta seleccionada:", route);
      mapManagement.setSelectedRoute(route);

      if (mapInstance && route.geometria) {
        const coordinates = route.geometria.coordinates;
        if (coordinates.length > 0) {
          try {
            const points = coordinates.map((coord) => ({
              lng: coord[0],
              lat: coord[1],
            }));
            const bbox = SpatialUtils.calculateBoundingBox(points);
            if (bbox) {
              const bounds = L.latLngBounds(
                [bbox[1], bbox[0]],
                [bbox[3], bbox[2]]
              );
              mapInstance.fitBounds(bounds, { padding: [20, 20] });
            }
          } catch (error) {
            console.error("Error calculando bounds con Turf:", error);
            const bounds = coordinates.map((coord) => [coord[1], coord[0]]);
            mapInstance.fitBounds(bounds, { padding: [20, 20] });
          }
        }
      }
    },
    [mapInstance, mapManagement]
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
