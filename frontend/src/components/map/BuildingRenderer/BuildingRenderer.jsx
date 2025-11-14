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
            estadoIcon = "🔴";
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
          min-width: 220px;
          max-width: 240px;
          padding: 16px;
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15);
          border: 1px solid #e9ecef;
          border-top: 4px solid #3498db;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          backdrop-filter: blur(10px);
        ">
          <h4 style="
            margin: 0 0 12px 0;
            color: #2c3e50;
            font-size: 1.2em;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 8px;
            padding-bottom: 10px;
            border-bottom: 2px solid #f1f3f4;
          ">
            <span style="font-size: 1.1em;">🏢</span>
            ${building.nombre || "Sin nombre"}
          </h4>
          
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; align-items: flex-start; gap: 8px;">
              <span style="
                background: #e3f2fd;
                border-radius: 6px;
                padding: 6px;
                color: #1976d2;
                font-size: 13px;
                min-width: 22px;
                text-align: center;
              ">📝</span>
              <div>
                <strong style="color: #34495e; font-size: 12px; display: block; margin-bottom: 2px;">Descripción:</strong>
                <span style="color: #546e7a; font-size: 13px; line-height: 1.3;">${
                  building.descripcion || "Sin descripción"
                }</span>
              </div>
            </div>
            
            <div style="display: flex; align-items: flex-start; gap: 8px;">
              <span style="
                background: #e8f5e9;
                border-radius: 6px;
                padding: 6px;
                color: #388e3c;
                font-size: 13px;
                min-width: 22px;
                text-align: center;
              ">🏷️</span>
              <div>
                <strong style="color: #34495e; font-size: 12px; display: block; margin-bottom: 2px;">Categoría:</strong>
                <span style="color: #546e7a; font-size: 13px; line-height: 1.3;">${
                  building.categoria || building.tipo || "No especificada"
                }</span>
              </div>
            </div>

            <div style="display: flex; align-items: flex-start; gap: 8px;">
              <span style="
                background: ${estadoColor}20;
                border-radius: 6px;
                padding: 6px;
                color: ${estadoColor};
                font-size: 13px;
                min-width: 22px;
                text-align: center;
              ">${estadoIcon}</span>
              <div>
                <strong style="color: #34495e; font-size: 12px; display: block; margin-bottom: 2px;">Estado:</strong>
                <span style="color: ${estadoColor}; font-size: 13px; line-height: 1.3; font-weight: 500;">${estadoText}</span>
              </div>
            </div>
      
      ${
        areaInfo
          ? `
      <div style="display: flex; align-items: flex-start; gap: 8px;">
        <span style="
          background: #fff3e0;
          border-radius: 6px;
          padding: 6px;
          color: #f57c00;
          font-size: 13px;
          min-width: 22px;
          text-align: center;
        ">📐</span>
        <div>
          <strong style="color: #34495e; font-size: 12px; display: block; margin-bottom: 2px;">Área:</strong>
          <span style="color: #546e7a; font-size: 13px; line-height: 1.3;">${areaInfo}</span>
        </div>
      </div>
      `
          : ""
      }
    </div>
    
    <div style="
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px dashed #e0e0e0;
      text-align: center;
    ">
      
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
