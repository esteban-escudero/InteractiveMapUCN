// components/buildings/BuildingForm/hooks/useBuildingValidation.js
import { useState } from "react";
import { SpatialUtils } from "../../../../utils/spatialUtils";

export const useBuildingValidation = () => {
  const [validation, setValidation] = useState({
    isValidLocation: true,
    distanceToNearest: null,
    nearestBuilding: null,
    isInCampus: true,
  });

  const validateCoordinates = (lat, lng) => {
    if (!lat || !lng) return;

    try {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);

      if (isNaN(latNum) || isNaN(lngNum)) {
        setValidation({
          isValidLocation: false,
          distanceToNearest: null,
          nearestBuilding: null,
          isInCampus: false,
        });
        return;
      }

      // Validar si está dentro del campus (coordenadas aproximadas de UCN Coquimbo)
      const isInCampus = SpatialUtils.isPointInPolygon(latNum, lngNum, [
        [-71.355622, -29.967316],
        [-71.346738, -29.967316],
        [-71.346738, -29.963208],
        [-71.355622, -29.963208],
        [-71.355622, -29.967316],
      ]);

      setValidation((prev) => ({
        ...prev,
        isInCampus,
        isValidLocation: true,
      }));

      console.log(
        `Validación Turf: ${isInCampus ? "DENTRO" : "FUERA"} del campus`
      );
    } catch (error) {
      console.error("Error validando coordenadas:", error);
      setValidation((prev) => ({
        ...prev,
        isValidLocation: false,
        isInCampus: false,
      }));
    }
  };

  return {
    validation,
    validateCoordinates,
  };
};
