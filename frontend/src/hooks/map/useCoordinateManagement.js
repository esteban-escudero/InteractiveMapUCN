import { useState, useCallback } from "react";

export const useCoordinateManagement = (
  mapInstance,
  validateCoordinates,
  findNearestBuilding
) => {
  const [coordinateDetection, setCoordinateDetection] = useState(false);
  const [tempMarker, setTempMarker] = useState(null);
  const [capturedCoords, setCapturedCoords] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  const createTempIcon = () =>
    L.divIcon({
      html: `<div style="background-color: #e74c3c; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(231,76,60,0.5);"></div>`,
      iconSize: [22, 22],
      className: "temp-coordinate-icon",
    });

  const toggleCoordinateDetection = useCallback(() => {
    const newState = !coordinateDetection;
    setCoordinateDetection(newState);

    if (newState) {
      if (mapInstance) mapInstance.getContainer().style.cursor = "crosshair";
      setCapturedCoords(null);
    } else {
      if (tempMarker && mapInstance) {
        mapInstance.removeLayer(tempMarker);
        setTempMarker(null);
      }
      if (mapInstance) mapInstance.getContainer().style.cursor = "";
      setCapturedCoords(null);
    }
  }, [coordinateDetection, mapInstance, tempMarker]);

  const clearTempMarker = useCallback(() => {
    if (tempMarker && mapInstance) {
      mapInstance.removeLayer(tempMarker);
      setTempMarker(null);
    }
  }, [tempMarker, mapInstance]);

  const clearCapturedCoords = useCallback(() => {
    setCapturedCoords(null);
  }, []);

  const clearValidationErrors = useCallback(() => {
    setValidationErrors([]);
  }, []);

  return {
    coordinateDetection,
    tempMarker,
    capturedCoords,
    validationErrors,
    toggleCoordinateDetection,
    clearTempMarker,
    clearCapturedCoords,
    clearValidationErrors,
    setTempMarker,
    setCapturedCoords,
    setValidationErrors,
    createTempIcon,
  };
};
