import { useEffect, useState } from "react";
import L from "leaflet";

const createTempIcon = () =>
  L.divIcon({
    html: `<div style="background-color: #e74c3c; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(231,76,60,0.5);"></div>`,
    iconSize: [22, 22],
    className: "temp-coordinate-icon",
  });

/**
 * Componente para capturar coordenadas en el mapa
 * Responsabilidad: Gestionar el modo de captura y el marcador temporal
 */
export const CoordinateCapture = ({
  mapInstance,
  isActive,
  onCaptured,
  onToggle,
}) => {
  const [tempMarker, setTempMarker] = useState(null);

  // Cambiar cursor cuando se activa/desactiva el modo captura
  useEffect(() => {
    if (!mapInstance) return;

    if (isActive) {
      console.log("📍 Modo captura ACTIVADO");
      mapInstance.getContainer().style.cursor = "crosshair";
    } else {
      console.log("📍 Modo captura DESACTIVADO");
      mapInstance.getContainer().style.cursor = "";
      // Limpiar marcador si existe
      if (tempMarker) {
        mapInstance.removeLayer(tempMarker);
        setTempMarker(null);
      }
    }
  }, [isActive, mapInstance, tempMarker]);

  // Manejar clic en el mapa para capturar coordenadas
  useEffect(() => {
    if (!mapInstance || !isActive) return;

    const handleMapClick = (e) => {
      const { lat, lng } = e.latlng;
      console.log("📍 Coordenadas capturadas:", { lat, lng });

      // Remover marcador anterior si existe
      if (tempMarker) {
        mapInstance.removeLayer(tempMarker);
      }

      // Crear nuevo marcador temporal
      const newMarker = L.marker([lat, lng], {
        icon: createTempIcon(),
        zIndexOffset: 1000,
      }).addTo(mapInstance);

      // Popup con las coordenadas
      newMarker
        .bindPopup(
          `
        <div style="text-align: center;">
          <h4>📍 Coordenadas Capturadas</h4>
          <p><strong>Lat:</strong> ${lat.toFixed(6)}</p>
          <p><strong>Lng:</strong> ${lng.toFixed(6)}</p>
          <button onclick="window.useCoordinates(${lat}, ${lng})" 
            style="background: #27ae60; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
            Usar estas coordenadas
          </button>
        </div>
      `
        )
        .openPopup();

      setTempMarker(newMarker);
    };

    // Función global para usar coordenadas desde el popup
    window.useCoordinates = (lat, lng) => {
      console.log("🔄 Usando coordenadas:", { lat, lng });
      onCaptured({ lat, lng });
      onToggle(); // Desactivar modo captura
      if (tempMarker) {
        mapInstance.removeLayer(tempMarker);
        setTempMarker(null);
      }
    };

    mapInstance.on("click", handleMapClick);

    return () => {
      mapInstance.off("click", handleMapClick);
      delete window.useCoordinates;
    };
  }, [mapInstance, isActive, tempMarker, onCaptured, onToggle]);

  // Indicador visual cuando está activo
  if (!isActive) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        background: "rgba(231, 76, 60, 0.9)",
        color: "white",
        padding: "8px 12px",
        borderRadius: "6px",
        fontSize: "12px",
        fontWeight: "bold",
        zIndex: 1000,
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      }}
    >
      🎯 Modo Captura - Haz clic en el mapa
    </div>
  );
};
