import { useEffect, useState } from "react";
import L from "leaflet";

const createDatabaseIcon = () =>
  L.divIcon({
    html: `<div style="background-color: #ae279eff;
                width: 14px; height: 14px;
               border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [18, 18],
    className: "database-building-icon",
  });

/**
 * Componente para renderizar los edificios como capas en el mapa
 * Responsabilidad: Gestionar la visualización de edificios (markers y polygons)
 */
export const BuildingLayers = ({ mapInstance, buildings }) => {
  const [layers, setLayers] = useState([]);

  useEffect(() => {
    if (!mapInstance || !buildings) return;

    // Limpiar capas anteriores
    layers.forEach((layer) => {
      mapInstance.removeLayer(layer);
    });

    const newLayers = [];

    buildings.forEach((building) => {
      if (!building.ubicacion) return;

      let layer;

      // Crear marker o polygon según el tipo de ubicación
      if (building.ubicacion.type === "Point") {
        const [lng, lat] = building.ubicacion.coordinates;
        layer = L.marker([lat, lng], { icon: createDatabaseIcon() });
      } else if (building.ubicacion.type === "Polygon") {
        const coords = building.ubicacion.coordinates[0].map((c) => [
          c[1],
          c[0],
        ]);
        layer = L.polygon(coords, {
          color: "#27ae60",
          weight: 3,
          fillOpacity: 0.3,
        });
      }

      if (layer) {
        // Popup con información del edificio
        const roomsCount = building.salas ? building.salas.length : 0;
        const popup = `
          <div style="min-width:200px;">
            <h4 style="margin: 0 0 10px 0; color: #2c3e50;">${
              building.nombre
            }</h4>
            <p style="margin: 5px 0;"><strong>Descripción:</strong> ${
              building.descripcion || "N/A"
            }</p>
            <p style="margin: 5px 0;"><strong>Tipo:</strong> ${
              building.tipo || "No especificado"
            }</p>
            <p style="margin: 5px 0;"><strong>Salas:</strong> ${roomsCount}</p>
            <hr style="margin: 10px 0;">
            <small style="color:#27ae60;">✓ En Base de Datos</small>
          </div>
        `;

        layer.bindPopup(popup).addTo(mapInstance);
        newLayers.push(layer);
      }
    });

    setLayers(newLayers);
    console.log(`🏢 ${newLayers.length} edificios renderizados en el mapa`);

    // Cleanup al desmontar
    return () => {
      newLayers.forEach((layer) => {
        if (mapInstance.hasLayer(layer)) {
          mapInstance.removeLayer(layer);
        }
      });
    };
  }, [mapInstance, buildings]); // Solo depende de mapInstance y buildings

  // Este componente no renderiza nada en el DOM de React
  return null;
};
