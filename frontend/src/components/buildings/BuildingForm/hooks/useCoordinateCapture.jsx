// components/buildings/BuildingForm/hooks/useCoordinateCapture.js
import { useState, useEffect } from "react";

export const useCoordinateCapture = ({
  onToggleCoordinateDetection,
  onClearCoordinates,
  setFormData,
  capturedCoordinates,
}) => {
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    if (isCapturing) {
      // Limpiar coordenadas cuando se inicia la captura
      setFormData((prev) => ({
        ...prev,
        lat: "",
        lng: "",
      }));
    }
  }, [isCapturing, setFormData]);

  // Efecto para detectar cuando se han capturado coordenadas
  useEffect(() => {
    if (capturedCoordinates && isCapturing) {
      // Coordenadas capturadas - desactivar modo captura pero mantener el formulario visible
      console.log("Coordenadas capturadas, desactivando modo captura");
      setIsCapturing(false);

      // Notificar que ya no estamos capturando
      if (onToggleCoordinateDetection) {
        onToggleCoordinateDetection();
      }
    }
  }, [capturedCoordinates, isCapturing, onToggleCoordinateDetection]);

  const handleCaptureCoordinates = () => {
    console.log("Iniciando captura de coordenadas...");

    if (onToggleCoordinateDetection) {
      setIsCapturing(true);
      onToggleCoordinateDetection();
    } else {
      console.error("onToggleCoordinateDetection no está definido");
      alert("Error: Función de captura no disponible");
    }
  };

  const handleClearCapture = () => {
    console.log("Limpiando captura...");

    if (isCapturing && onToggleCoordinateDetection) {
      onToggleCoordinateDetection();
    }
    setIsCapturing(false);
    onClearCoordinates?.();
  };

  return {
    isCapturing,
    handleCaptureCoordinates,
    handleClearCapture,
  };
};
