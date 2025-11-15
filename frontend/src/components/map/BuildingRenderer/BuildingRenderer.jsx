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

          // Determinar color y texto del estado
          let estadoColor = "#95a5a6";
          let estadoText = "No especificado";
          let estadoIcon = "⚪";

          if (building.estado === "activo" || building.estado === "Activo") {
            estadoColor = "#27ae60";
            estadoText = "Activo";
            estadoIcon = "🟢";
          } else if (
            building.estado === "inactivo" ||
            building.estado === "Inactivo"
          ) {
            estadoColor = "#e74c3c";
            estadoText = "Inactivo";
            estadoIcon = "";
          } else if (
            building.estado === "mantenimiento" ||
            building.estado === "Mantenimiento"
          ) {
            estadoColor = "#f39c12";
            estadoText = "Mantenimiento";
            estadoIcon = "🟡";
          }

          const popup = `
        <div style="
          min-width: 200px;
          max-width: 220px;
          padding: 0;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          border-top: 3px solid #3498db;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          overflow: hidden;
        ">
          <h4 style="
            margin: 0;
            padding: 10px 12px;
            background: #3498db;
            color: white;
            font-size: 1em;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 6px;
          ">
            <span style="font-size: 1em;">🏢</span>
            ${building.nombre || "Sin nombre"}
          </h4>
          
          <div style="padding: 10px 12px; display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 14px;">📝</span>
              <div style="flex: 1;">
                <strong style="color: #34495e; font-size: 11px;">Descripción:</strong>
                <div style="color: #546e7a; font-size: 12px;">${
                  building.descripcion || "Sin descripción"
                }</div>
              </div>
            </div>
            
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 14px;">🏷️</span>
              <div style="flex: 1;">
                <strong style="color: #34495e; font-size: 11px;">Categoría:</strong>
                <div style="color: #546e7a; font-size: 12px;">${
                  building.categoria || building.tipo || "No especificada"
                }</div>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 14px;">${estadoIcon}</span>
              <div style="flex: 1;">
                <strong style="color: #34495e; font-size: 11px;">Estado:</strong>
                <div style="color: ${estadoColor}; font-size: 12px; font-weight: 500;">${estadoText}</div>
              </div>
            </div>
      
      ${
        areaInfo
          ? `
      <div style="display: flex; align-items: center; gap: 6px;">
        <span style="font-size: 14px;">📐</span>
        <div style="flex: 1;">
          <strong style="color: #34495e; font-size: 11px;">Área:</strong>
          <div style="color: #546e7a; font-size: 12px;">${Math.round(
            SpatialUtils.calculatePolygonArea(building.ubicacion.coordinates[0])
          )} m²</div>
        </div>
      </div>
      `
          : ""
      }
    </div>
  </div>
`;

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
