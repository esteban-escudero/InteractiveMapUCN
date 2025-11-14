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
        <div style="
          min-width: 280px;
          padding: 20px;
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15);
          border: 1px solid #e9ecef;
          border-top: 4px solid #3498db;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          backdrop-filter: blur(10px);
        ">
          <h4 style="
            margin: 0 0 16px 0;
            color: #2c3e50;
            font-size: 1.4em;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 8px;
            padding-bottom: 12px;
            border-bottom: 2px solid #f1f3f4;
          ">
            <span style="font-size: 1.2em;">🏢</span>
            ${building.nombre || "Sin nombre"}
          </h4>
          
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div style="display: flex; align-items: flex-start; gap: 10px;">
              <span style="
                background: #e3f2fd;
                border-radius: 6px;
                padding: 6px;
                color: #1976d2;
                font-size: 14px;
                min-width: 24px;
                text-align: center;
              ">📝</span>
              <div>
                <strong style="color: #34495e; font-size: 13px; display: block; margin-bottom: 4px;">Descripción:</strong>
                <span style="color: #546e7a; font-size: 14px; line-height: 1.4;">${
                  building.descripcion || "Sin descripción"
                }</span>
              </div>
            </div>
            
            <div style="display: flex; align-items: flex-start; gap: 10px;">
              <span style="
                background: #e8f5e9;
                border-radius: 6px;
                padding: 6px;
                color: #388e3c;
                font-size: 14px;
                min-width: 24px;
                text-align: center;
              ">🏷️</span>
        <div>
          <strong style="color: #34495e; font-size: 13px; display: block; margin-bottom: 4px;">Categoría:</strong>
          <span style="color: #546e7a; font-size: 14px; line-height: 1.4;">${
            building.categoria || building.tipo || "No especificada"
          }</span>
        </div>
      </div>
      
      ${
        areaInfo
          ? `
      <div style="display: flex; align-items: flex-start; gap: 10px;">
        <span style="
          background: #fff3e0;
          border-radius: 6px;
          padding: 6px;
          color: #f57c00;
          font-size: 14px;
          min-width: 24px;
          text-align: center;
        ">📐</span>
        <div>
          <strong style="color: #34495e; font-size: 13px; display: block; margin-bottom: 4px;">Área:</strong>
          <span style="color: #546e7a; font-size: 14px; line-height: 1.4;">${areaInfo}</span>
        </div>
      </div>
      `
          : ""
      }
    </div>
    
    <div style="
      margin-top: 16px;
      padding-top: 12px;
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
