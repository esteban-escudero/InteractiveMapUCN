// components/map/BuildingRenderer/utils/buildingIcons.js
import L from "leaflet";

/**
 * Obtiene el color según la categoría del edificio
 * @param {string} category - Categoría del edificio
 * @returns {string} Color hexadecimal
 */
export const getCategoryColor = (category) => {
    const categoryColors = {
        "academico": "#3498db",           // Azul
        "administrativo": "#9b59b6",      // Morado
        "baño": "#95a5a6",                // Gris
        "biblioteca": "#e67e22",          // Naranja
        "cafeteria": "#f39c12",           // Amarillo/Naranja
        "casino": "#f39c12",              // Amarillo/Naranja
        "centro de salud": "#e74c3c",     // Rojo
        "cultural": "#8e44ad",            // Morado oscuro
        "deportivo": "#27ae60",           // Verde
        "estacionamiento": "#7f8c8d",     // Gris oscuro
        "gimnasio": "#16a085",            // Verde azulado
        "investigacion": "#2980b9",       // Azul oscuro
        "laboratorio": "#c0392b",         // Rojo oscuro
        "oficina administracion": "#8e44ad", // Morado oscuro
        "oficina profesor": "#2c3e50",    // Azul muy oscuro
        "sala de clase": "#3498db",       // Azul
        "sala de estudio": "#1abc9c",     // Turquesa
        "servicios": "#95a5a6",           // Gris
    };

    // Normalizar la categoría a minúsculas para comparación
    const normalizedCategory = category ? category.toLowerCase() : '';
    return categoryColors[normalizedCategory] || "#ae279eff";
};

/**
 * Crea un icono personalizado para un edificio
 * @param {boolean} isHighlighted - Si el edificio está destacado
 * @param {string} highlightType - Tipo de destacado: 'origin' o 'destination'
 * @param {string} category - Categoría del edificio
 * @returns {L.DivIcon} Icono de Leaflet
 */
export const createBuildingIcon = (isHighlighted, highlightType, category) => {
    let color = getCategoryColor(category); // Usar color de categoría
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
        ${emoji
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

/**
 * Obtiene el color y estilo para un polígono de edificio
 * @param {boolean} isHighlighted - Si el edificio está destacado
 * @param {boolean} isOrigin - Si es el punto de origen
 * @param {boolean} isDestination - Si es el punto de destino
 * @param {string} category - Categoría del edificio
 * @returns {object} Configuración de estilo del polígono
 */
export const getPolygonStyle = (isHighlighted, isOrigin, isDestination, category) => {
    let fillColor = getCategoryColor(category); // Usar color de categoría
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

    return {
        color: fillColor,
        weight,
        fillOpacity,
        className: isHighlighted ? "building-polygon highlighted" : "building-polygon",
    };
};

/**
 * Obtiene información del estado del edificio
 * @param {string} estado - Estado del edificio
 * @returns {object} Color, texto e icono del estado
 */
export const getBuildingStatus = (estado) => {
    let estadoColor = "#95a5a6";
    let estadoText = "No especificado";
    let estadoIcon = "help_outline";

    if (estado === "activo" || estado === "Activo") {
        estadoColor = "#27ae60";
        estadoText = "Activo";
        estadoIcon = "check_circle";
    } else if (estado === "inactivo" || estado === "Inactivo" || estado === "cerrado" || estado === "Cerrado") {
        estadoColor = "#e74c3c";
        estadoText = "Cerrado";
        estadoIcon = "block";
    } else if (estado === "mantenimiento" || estado === "Mantenimiento") {
        estadoColor = "#f39c12";
        estadoText = "En Mantenimiento";
        estadoIcon = "construction";
    } else if (estado === "construccion" || estado === "Construcción" || estado === "En Construcción") {
        estadoColor = "#9b59b6";
        estadoText = "En Construcción";
        estadoIcon = "engineering";
    }

    return { estadoColor, estadoText, estadoIcon };
};
