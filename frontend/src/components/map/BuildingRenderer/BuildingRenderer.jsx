// components/map/BuildingRenderer/BuildingRenderer.jsx - REFACTORIZADO
import { useBuildingMarkers } from "./hooks/useBuildingMarkers";
import BuildingMapModal from "./components/BuildingMapModal";
import { useState, useEffect } from "react";
import { API_CONFIG } from "../../../config/app";

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

  const [selectedBuildingMap, setSelectedBuildingMap] = useState(null);

  useEffect(() => {
    const handleOpenMap = (event) => {
      const buildingId = event.detail.id;
      const building = buildings.find((b) => b.id === buildingId);
      if (building && building.planos && building.planos.length > 0) {
        setSelectedBuildingMap({
          name: building.nombre,
          maps: building.planos,
        });
      }
    };

    window.addEventListener("open-building-map", handleOpenMap);
    return () => {
      window.removeEventListener("open-building-map", handleOpenMap);
    };
  }, [buildings]);

  // Este componente no renderiza nada en el DOM de React, excepto el modal
  return (
    <BuildingMapModal
      isOpen={!!selectedBuildingMap}
      onClose={() => setSelectedBuildingMap(null)}
      buildingName={selectedBuildingMap?.name}
      maps={selectedBuildingMap?.maps}
      apiBaseUrl={API_CONFIG.baseURL}
    />
  );
};

export default BuildingRenderer;
