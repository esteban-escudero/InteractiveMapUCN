// components/map/BuildingRenderer/utils/buildingPopup.js
import { SpatialUtils } from "utils/spatialUtils";

/**
 * Crea el HTML del popup para un edificio
 * @param {object} building - Datos del edificio
 * @param {boolean} isHighlighted - Si el edificio está destacado
 * @param {boolean} isOrigin - Si es el punto de origen
 * @param {boolean} isDestination - Si es el punto de destino
 * @param {object} estadoInfo - Información del estado (color, texto, icono)
 * @param {boolean} isAdminView - Si es vista de administrador (muestra todos los datos)
 * @returns {string} HTML del popup
 */
export const createBuildingPopup = (
  building,
  isHighlighted,
  isOrigin,
  isDestination,
  estadoInfo,
  isAdminView = false
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
        <div style="display: flex; align-items: flex-start; gap: 8px;">
          <span class="material-icons" style="font-size: 20px; margin-top: 2px; color: #4a235a;">square_foot</span>
          <div style="flex: 1;">
            <strong style="color: #34495e; font-size: 12px; display: block; margin-bottom: 2px;">Área:</strong>
            <div style="color: #546e7a; font-size: 13px;">${Math.round(area)} m²</div>
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

  // Vista simplificada para usuarios (solo nombre y descripción si existe)
  if (!isAdminView) {
    // Solo mostrar descripción si existe
    const descriptionHTML = building.descripcion ? `
      <div style="display: flex; align-items: flex-start; gap: 8px;">
        <span class="material-icons" style="font-size: 20px; margin-top: 2px; color: #4a235a;">description</span>
        <div style="flex: 1;">
          <strong style="color: #34495e; font-size: 12px; display: block; margin-bottom: 2px;">Descripción:</strong>
          <div style="color: #546e7a; font-size: 13px; white-space: pre-wrap;">${building.descripcion}</div>
        </div>
      </div>
    ` : '';

    return `
        <div style="
          min-width: 220px;
          max-width: 240px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        ">
          <h4 style="
            margin: 0 0 12px 0;
            padding: 0;
            color: ${headerColor};
            font-size: 16px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 6px;
            border-bottom: 2px solid ${headerColor};
            padding-bottom: 8px;
          ">
            <span class="material-icons" style="font-size: 20px; color: ${headerColor};">business</span>
            ${building.nombre || "Sin nombre"}
          </h4>
          
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${highlightBadge}
            ${descriptionHTML}
            
            ${building.planos && building.planos.length > 0
        ? `
              <button 
                onclick="window.dispatchEvent(new CustomEvent('open-building-map', { detail: { id: ${building.id} } }))"
                style="
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 8px;
                  background-color: #3498db;
                  color: white;
                  border: none;
                  padding: 8px 12px;
                  border-radius: 6px;
                  font-family: inherit;
                  font-weight: 500;
                  font-size: 13px;
                  cursor: pointer;
                  width: 100%;
                  transition: background 0.2s;
                "
                onmouseover="this.style.backgroundColor='#2980b9'"
                onmouseout="this.style.backgroundColor='#3498db'"
              >
                <span class="material-icons" style="font-size: 16px;">map</span>
                Ver Mapa Interior
              </button>
            `
        : ""
      }
          </div>
        </div>
      `;
  }

  // Vista completa para administradores
  return `
    <div style="
      min-width: 220px;
      max-width: 240px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    ">
      <h4 style="
        margin: 0 0 12px 0;
        padding: 0;
        color: ${headerColor};
        font-size: 16px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 6px;
        border-bottom: 2px solid ${headerColor};
        padding-bottom: 8px;
      ">
        <span class="material-icons" style="font-size: 20px; color: ${headerColor};">business</span>
        ${building.nombre || "Sin nombre"}
      </h4>
      
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${highlightBadge}
        
        <div style="display: flex; align-items: flex-start; gap: 8px;">
          <span class="material-icons" style="font-size: 20px; margin-top: 2px; color: #4a235a;">description</span>
          <div style="flex: 1;">
            <strong style="color: #34495e; font-size: 12px; display: block; margin-bottom: 2px;">Descripción:</strong>
            <div style="color: #546e7a; font-size: 13px; white-space: pre-wrap;">${building.descripcion || "Sin descripción"}</div>
          </div>
        </div>
        
        <div style="display: flex; align-items: flex-start; gap: 8px;">
          <span class="material-icons" style="font-size: 20px; margin-top: 2px; color: #4a235a;">label</span>
          <div style="flex: 1;">
            <strong style="color: #34495e; font-size: 12px; display: block; margin-bottom: 2px;">Categoría:</strong>
            <div style="color: #546e7a; font-size: 13px;">${building.categoria || building.tipo || "No especificada"}</div>
          </div>
        </div>

        <div style="display: flex; align-items: flex-start; gap: 8px;">
          <span class="material-icons" style="font-size: 20px; margin-top: 2px; color: ${estadoColor};">${estadoIcon}</span>
          <div style="flex: 1;">
            <strong style="color: #34495e; font-size: 12px; display: block; margin-bottom: 2px;">Estado:</strong>
            <div style="color: ${estadoColor}; font-size: 13px; font-weight: 500;">${estadoText}</div>
          </div>
        </div>
  
        ${areaHTML}
      </div>
    </div>
  `;
};
