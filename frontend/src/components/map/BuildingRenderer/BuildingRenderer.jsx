// components/map/BuildingRenderer/BuildingRenderer.jsx - REFACTORIZADO
import { useBuildingMarkers } from "./hooks/useBuildingMarkers";

/**
 * Componente para renderizar edificios en el mapa
 * @param {object} mapInstance - Instancia del mapa de Leaflet
 * @param {boolean} isMapReady - Si el mapa está listo
 * @param {Array} buildings - Lista de edificios a renderizar
 * @param {object} highlightedBuildings - Edificios destacados {origin, destination}
 * @param {boolean} isAdminView - Si es vista de administrador
 */
const BuildingRenderer = ({
  mapInstance,
  isMapReady,
  buildings,
  highlightedBuildings = { origin: null, destination: null },
  isAdminView = false,
}) => {
  // Hook que gestiona toda la lógica de markers
  useBuildingMarkers(mapInstance, isMapReady, buildings, highlightedBuildings, isAdminView);

  // Este componente no renderiza nada en el DOM de React
  // Solo gestiona las capas de Leaflet
  return null;
};

export default BuildingRenderer;
