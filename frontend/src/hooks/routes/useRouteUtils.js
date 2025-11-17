import { useCallback } from "react";
import { SpatialUtils } from "../../utils/spatialUtils";

export const useRouteUtils = (mapInstance, mapManagement) => {
  /**
   * Maneja el click en una ruta - SELECCIONAR
   * Hace zoom a la ruta y muestra sus detalles
   */
  const handleRouteClick = useCallback(
    (route) => {
      console.log("Ruta seleccionada:", route.nombre);

      // Marcar como seleccionada
      mapManagement.setSelectedRoute(route);

      // Si hay geometría válida, hacer zoom a la ruta
      if (route.geometria && route.geometria.coordinates && mapInstance) {
        try {
          const coordinates = route.geometria.coordinates;

          // Convertir coordenadas [lng, lat] a [lat, lng] para Leaflet
          const latLngs = coordinates.map((coord) => [coord[1], coord[0]]);

          if (latLngs.length >= 2) {
            // Crear bounds de la ruta
            const bounds = window.L.latLngBounds(latLngs);

            // Hacer zoom a la ruta con padding
            mapInstance.fitBounds(bounds, {
              padding: [50, 50],
              maxZoom: 17,
              animate: true,
              duration: 0.5,
            });

            console.log("Zoom a ruta completado");
          }
        } catch (error) {
          console.error("❌ Error haciendo zoom a ruta:", error);
        }
      }
    },
    [mapInstance, mapManagement]
  );

  /**
   * Maneja la edición de una ruta - EDITAR
   * Abre el formulario con los datos cargados
   */
  const handleEditRoute = useCallback(
    (route) => {
      console.log("✏️ Editando ruta:", route.nombre);

      // Establecer la ruta en edición
      mapManagement.setEditingRoute(route);

      // Abrir el formulario
      mapManagement.setShowRouteForm(true);

      // Cerrar la lista de rutas
      mapManagement.setShowRouteList(false);
    },
    [mapManagement]
  );

  /**
   * Valida la geometría de una ruta
   */
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
    handleEditRoute,
    validateRouteGeometry,
  };
};
