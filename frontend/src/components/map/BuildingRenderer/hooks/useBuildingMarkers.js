// components/map/BuildingRenderer/hooks/useBuildingMarkers.js
import { useEffect, useState } from "react";
import L from "leaflet";
import { createBuildingIcon, getPolygonStyle, getBuildingStatus } from "../utils/buildingIcons";
import { createBuildingPopup } from "../utils/buildingPopup";

/**
 * Hook para gestionar los markers de edificios en el mapa
 * @param {object} mapInstance - Instancia del mapa de Leaflet
 * @param {boolean} isMapReady - Si el mapa está listo
 * @param {Array} buildings - Lista de edificios
 * @param {object} highlightedBuildings - Edificios destacados {origin, destination}
 * @param {boolean} isAdminView - Si es vista de administrador
 * @returns {Array} Lista de capas renderizadas
 */
export const useBuildingMarkers = (
    mapInstance,
    isMapReady,
    buildings,
    highlightedBuildings,
    isAdminView = false
) => {
    const [buildingLayers, setBuildingLayers] = useState([]);

    useEffect(() => {
        if (!mapInstance || !isMapReady) return;

        // Limpiar capas anteriores
        buildingLayers.forEach((layer) => {
            if (mapInstance.hasLayer(layer)) {
                mapInstance.removeLayer(layer);
            }
        });

        const newLayers = [];

        buildings.forEach((building) => {
            if (!building.ubicacion) return;

            // Determinar si este edificio está destacado
            const isOrigin = highlightedBuildings.origin?.nombre === building.nombre;
            const isDestination =
                highlightedBuildings.destination?.nombre === building.nombre;
            const isHighlighted = isOrigin || isDestination;
            const highlightType = isOrigin
                ? "origin"
                : isDestination
                    ? "destination"
                    : null;

            let layer;
            try {
                // Crear marker o polígono según el tipo de ubicación
                if (building.ubicacion.type === "Point") {
                    layer = createPointMarker(building, isHighlighted, highlightType);
                } else if (building.ubicacion.type === "Polygon") {
                    layer = createPolygonMarker(building, isHighlighted, isOrigin, isDestination);
                }

                if (layer) {
                    // Crear y vincular popup
                    const estadoInfo = getBuildingStatus(building.estado);
                    const popup = createBuildingPopup(
                        building,
                        isHighlighted,
                        isOrigin,
                        isDestination,
                        estadoInfo,
                        isAdminView
                    );

                    layer.bindPopup(popup).addTo(mapInstance);
                    newLayers.push(layer);
                }
            } catch (error) {
                console.error("Error renderizando edificio:", building.nombre, error);
            }
        });

        setBuildingLayers(newLayers);
    }, [mapInstance, buildings, isMapReady, highlightedBuildings, isAdminView]);

    return buildingLayers;
};

/**
 * Crea un marker de punto para un edificio
 */
const createPointMarker = (building, isHighlighted, highlightType) => {
    const [lng, lat] = building.ubicacion.coordinates;
    return L.marker([lat, lng], {
        icon: createBuildingIcon(isHighlighted, highlightType, building.tipo),
        zIndexOffset: isHighlighted ? 1000 : 0, // Destacados al frente
    });
};

/**
 * Crea un polígono para un edificio
 */
const createPolygonMarker = (building, isHighlighted, isOrigin, isDestination) => {
    const coords = building.ubicacion.coordinates[0].map((c) => [c[1], c[0]]);
    const style = getPolygonStyle(isHighlighted, isOrigin, isDestination, building.tipo);
    return L.polygon(coords, style);
};

