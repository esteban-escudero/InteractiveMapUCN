// components/routes/RouteForm/utils/polylineIcons.js
import L from "leaflet";

/**
 * Obtiene el color de una ruta según su tipo
 * @param {string} tipo - Tipo de ruta
 * @returns {string} Color hexadecimal
 */
export const getRouteColor = (tipo) => {
    const colors = {
        peatonal: "#4a235a",
        accesible: "#2ecc71",
        rapida: "#e74c3c",
        emergencia: "#f39c12",
        vehicular: "#3498db",
    };
    return colors[tipo?.toLowerCase()] || "#4a235a";
};

/**
 * Crea un icono de preview para snap
 * @param {string} snapType - Tipo de snap ('node' o 'segment')
 * @returns {L.DivIcon} Icono de Leaflet
 */
export const createSnapPreviewIcon = (snapType) => {
    const isNode = snapType === "node";
    return L.divIcon({
        html: `
      <div style="
        width: 12px;
        height: 12px;
        background-color: ${isNode ? "#27ae60" : "#3498db"};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        animation: pulse-snap 1s infinite;
      "></div>
      <style>
        @keyframes pulse-snap {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
        }
      </style>
    `,
        iconSize: [12, 12],
        className: "snap-preview-icon",
    });
};

/**
 * Crea un icono de marker fantasma
 * @returns {L.DivIcon} Icono de Leaflet
 */
export const createGhostMarkerIcon = () => {
    return L.divIcon({
        html: `
      <div style="
        width: 10px;
        height: 10px;
        background-color: rgba(52, 152, 219, 0.5);
        border: 2px solid rgba(52, 152, 219, 0.8);
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      "></div>
    `,
        iconSize: [10, 10],
        className: "ghost-marker-icon",
    });
};

/**
 * Crea un icono de marker numerado
 * @param {number} index - Índice del marker
 * @param {number} total - Total de markers
 * @returns {L.DivIcon} Icono de Leaflet
 */
export const createMarkerIcon = (index, total) => {
    const isFirst = index === 0;
    const isLast = index === total - 1;

    let backgroundColor = "#3498db";
    let label = index + 1;

    if (isFirst) {
        backgroundColor = "#27ae60";
        label = "A";
    } else if (isLast) {
        backgroundColor = "#e74c3c";
        label = "B";
    }

    return L.divIcon({
        html: `
      <div style="
        width: 28px;
        height: 28px;
        background-color: ${backgroundColor};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: move;
      ">${label}</div>
    `,
        iconSize: [28, 28],
        className: "route-marker-icon",
    });
};

/**
 * Genera un nombre por defecto para una ruta
 * @returns {string} Nombre generado
 */
export const generateDefaultName = () => {
    const timestamp = new Date().toLocaleTimeString("es-CL", {
        hour: "2-digit",
        minute: "2-digit",
    });
    return `Ruta ${timestamp}`;
};
