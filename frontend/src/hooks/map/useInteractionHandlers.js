// hooks/map/useInteractionHandlers.js
import { useCallback } from "react";

/**
 * Hook especializado para manejar todas las interacciones del mapa
 * Reemplaza la funcionalidad de useMapHandlers.js eliminado
 */
export const useInteractionHandlers = (
  showUINotification,
  getProximityAnalysis
) => {
  // Handler para clic en edificios
  const handleBuildingClickWithProximity = useCallback(
    (building) => {
      console.log("🏢 Clic en edificio:", building.nombre);
      if (getProximityAnalysis) {
        getProximityAnalysis(building);
      }
      showUINotification(`Edificio seleccionado: ${building.nombre}`, "info");
    },
    [getProximityAnalysis, showUINotification]
  );

  // Handler para clic en el mapa (puede expandirse)
  const handleMapClick = useCallback((e) => {
    console.log("🗺️ Clic en mapa:", e.latlng);
    // Aquí puedes añadir más lógica para clicks en el mapa
    // como captura de coordenadas, creación de rutas, etc.
  }, []);

  // Handler para clic en rutas (si es necesario)
  const handleRouteClick = useCallback(
    (route) => {
      console.log("🛣️ Clic en ruta:", route.nombre);
      showUINotification(`Ruta seleccionada: ${route.nombre}`, "info");
      // Lógica adicional para selección de rutas
    },
    [showUINotification]
  );

  // Handler para hover en edificios (para futuras mejoras)
  const handleBuildingHover = useCallback((building, isHovering) => {
    if (isHovering) {
      console.log("👆 Hover sobre edificio:", building.nombre);
      // Podría mostrar tooltip o información adicional
    }
  }, []);

  return {
    // Handlers principales
    handleBuildingClickWithProximity,
    handleMapClick,
    handleRouteClick,
    handleBuildingHover,

    // Objeto completo para compatibilidad
    interactionHandlers: {
      handleBuildingClickWithProximity,
      handleMapClick,
      handleRouteClick,
      handleBuildingHover,
    },
  };
};

export default useInteractionHandlers;
