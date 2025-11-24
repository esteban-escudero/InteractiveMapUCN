// components/map/BuildingRenderer/utils/buildingPopup.js
import { SpatialUtils } from "../../../../utils/spatialUtils";

/**
 * Crea el HTML del popup para un edificio
 * @param {object} building - Datos del edificio
 * @param {boolean} isHighlighted - Si el edificio está destacado
 * @param {boolean} isOrigin - Si es el punto de origen
 * @param {boolean} isDestination - Si es el punto de destino
 * @param {object} estadoInfo - Información del estado (color, texto, icono)
 * @returns {string} HTML del popup
 */
export const createBuildingPopup = (
    building,
    isHighlighted,
    isOrigin,
    isDestination,
    estadoInfo
) => {
    const { estadoColor, estadoText, estadoIcon } = estadoInfo;

    // Calcular área si es polígono
    let areaHTML = "";
    if (building.ubicacion.type === "Polygon") {
        try {
            const area = SpatialUtils.calculatePolygonArea(
                building.ubicacion.coordinates[0]
            );
            areaHTML = `
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 14px;">📐</span>
          <div style="flex: 1;">
            <strong style="color: #34495e; font-size: 11px;">Área:</strong>
            <div style="color: #546e7a; font-size: 12px;">${Math.round(area)} m²</div>
          </div>
        </div>
      `;
        } catch (error) {
            console.error("Error calculando área:", error);
        }
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

    const headerColor = isHighlighted
        ? isOrigin
            ? "#27ae60"
            : "#e74c3c"
        : "#3498db";

    return `
    <div style="
      min-width: 200px;
      max-width: 220px;
      padding: 0;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      border-top: 3px solid ${headerColor};
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      overflow: hidden;
    ">
      <h4 style="
        margin: 0;
        padding: 10px 12px;
        background: ${headerColor};
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
            <div style="color: #546e7a; font-size: 12px;">${building.descripcion || "Sin descripción"
        }</div>
          </div>
        </div>
        
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 14px;">🏷️</span>
          <div style="flex: 1;">
            <strong style="color: #34495e; font-size: 11px;">Categoría:</strong>
            <div style="color: #546e7a; font-size: 12px;">${building.categoria || building.tipo || "No especificada"
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
  
        ${areaHTML}
      </div>
    </div>
  `;
};
