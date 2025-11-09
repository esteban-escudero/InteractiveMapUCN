import { useEffect, useState } from "react";
import L from "leaflet";

const createDatabaseIcon = () =>
  L.divIcon({
    html: `<div style="background-color: #ae279eff; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [18, 18],
    className: "database-building-icon",
  });

const BuildingRenderer = ({
  mapInstance,
  isMapReady,
  buildings,
  SpatialUtils,
}) => {
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

      let layer;
      try {
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
            className: "building-polygon",
          });
        }

        if (layer) {
          let areaInfo = "";
          if (building.ubicacion.type === "Polygon") {
            try {
              const area = SpatialUtils.calculatePolygonArea(
                building.ubicacion.coordinates[0]
              );
              areaInfo = `<p><strong>Área aproximada:</strong> ${Math.round(
                area
              )} m²</p>`;
            } catch (error) {
              console.error("Error calculando área:", error);
            }
          }

          const popup = `
            <div style="min-width:200px;">
              <h4>${building.nombre || "Sin nombre"}</h4>
              <p><strong>Descripción:</strong> ${
                building.descripcion || "Sin descripción"
              }</p>
              <p><strong>Categoría:</strong> ${
                building.categoria || building.tipo || "No especificada"
              }</p>
              ${areaInfo}
            </div>`;

          layer.bindPopup(popup).addTo(mapInstance);
          newLayers.push(layer);
        }
      } catch (error) {
        console.error("Error renderizando edificio:", building.nombre, error);
      }
    });

    setBuildingLayers(newLayers);
  }, [mapInstance, buildings, isMapReady]);

  return null;
};

export default BuildingRenderer;
