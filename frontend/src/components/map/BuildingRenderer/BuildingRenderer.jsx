// components/map/BuildingRenderer/BuildingRenderer.jsx - MEJORADO
import { useEffect, useState } from "react";
import L from "leaflet";
import { SpatialUtils } from "../../../utils/spatialUtils";

// Iconos personalizados según tipo de edificio
const createBuildingIcon = (isHighlighted, highlightType) => {
  let color = "#ae279eff"; // Color por defecto
  let size = 14;
  let borderWidth = 2;
  let borderColor = "white";
  let emoji = "";

  if (isHighlighted) {
    size = 20;
    borderWidth = 3;

    if (highlightType === "origin") {
      color = "#27ae60"; // Verde para origen
      borderColor = "#1e8449";
    } else if (highlightType === "destination") {
      color = "#e74c3c"; // Rojo para destino
      borderColor = "#c0392b";
    }
  }

  return L.divIcon({
    html: `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
      ">
        <div style="
          background-color: ${color};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: ${borderWidth}px solid ${borderColor};
          box-shadow: 0 2px 8px rgba(0,0,0,${isHighlighted ? 0.5 : 0.3});
          ${isHighlighted ? "animation: pulse 2s infinite;" : ""}
        "></div>
        ${
          emoji
            ? `<div style="
          position: absolute;
          top: -25px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 20px;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        ">${emoji}</div>`
            : ""
        }
      </div>
      <style>
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
      </style>
    `,
    iconSize: [size + 10, size + 30],
    className: isHighlighted
      ? "highlighted-building-icon"
      : "database-building-icon",
  });
};

const BuildingRenderer = ({
  mapInstance,
  isMapReady,
  buildings,
  highlightedBuildings = { origin: null, destination: null },
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
        if (building.ubicacion.type === "Point") {
          const [lng, lat] = building.ubicacion.coordinates;
          layer = L.marker([lat, lng], {
            icon: createBuildingIcon(isHighlighted, highlightType),
            zIndexOffset: isHighlighted ? 1000 : 0, // Destacados al frente
          });
        } else if (building.ubicacion.type === "Polygon") {
          const coords = building.ubicacion.coordinates[0].map((c) => [
            c[1],
            c[0],
          ]);

          let fillColor = "#27ae60";
          let fillOpacity = 0.3;
          let weight = 3;

          if (isHighlighted) {
            fillOpacity = 0.5;
            weight = 5;
            if (isOrigin) {
              fillColor = "#27ae60"; // Verde
            } else if (isDestination) {
              fillColor = "#e74c3c"; // Rojo
            }
          }

          layer = L.polygon(coords, {
            color: fillColor,
            weight: weight,
            fillOpacity: fillOpacity,
            className: isHighlighted
              ? "building-polygon highlighted"
              : "building-polygon",
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

          // Color y texto del estado
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

          // Badge de destacado
          let highlightBadge = "";
          if (isOrigin) {
            highlightBadge = `
              <div style="
                background: linear-gradient(135deg, #27ae60, #229954);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 600;
                margin-bottom: 8px;
                text-align: center;
              ">
                PUNTO DE ORIGEN
              </div>
            `;
          } else if (isDestination) {
            highlightBadge = `
              <div style="
                background: linear-gradient(135deg, #e74c3c, #c0392b);
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 600;
                margin-bottom: 8px;
                text-align: center;
              ">
                PUNTO DE DESTINO
              </div>
            `;
          }

          const popup = `
        <div style="
          min-width: 200px;
          max-width: 220px;
          padding: 0;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          border-top: 3px solid ${
            isHighlighted ? (isOrigin ? "#27ae60" : "#e74c3c") : "#3498db"
          };
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          overflow: hidden;
        ">
          <h4 style="
            margin: 0;
            padding: 10px 12px;
            background: ${
              isHighlighted ? (isOrigin ? "#27ae60" : "#e74c3c") : "#3498db"
            };
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
            ${highlightBadge}
            
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
                  SpatialUtils.calculatePolygonArea(
                    building.ubicacion.coordinates[0]
                  )
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

    console.log(
      `✅ Renderizados ${newLayers.length} edificios (${
        highlightedBuildings.origin ? 1 : 0
      } origen, ${highlightedBuildings.destination ? 1 : 0} destino)`
    );
  }, [mapInstance, buildings, isMapReady, highlightedBuildings]);

  return null;
};

export default BuildingRenderer;
