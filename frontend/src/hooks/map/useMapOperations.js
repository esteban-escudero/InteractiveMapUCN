import { useCallback, useState, useEffect } from "react";
import { SpatialUtils } from "utils/spatialUtils";
import { UCN_COQUIMBO_BOUNDS } from "constants/mapConfig";

export const useMapOperations = (buildings) => {
  const [campusBoundsPolygon, setCampusBoundsPolygon] = useState(null);

  // Inicialización del polígono del campus
  useEffect(() => {
    if (UCN_COQUIMBO_BOUNDS && UCN_COQUIMBO_BOUNDS.length >= 2) {
      try {
        const polygonCoords = [
          [UCN_COQUIMBO_BOUNDS[0][1], UCN_COQUIMBO_BOUNDS[0][0]],
          [UCN_COQUIMBO_BOUNDS[1][1], UCN_COQUIMBO_BOUNDS[0][0]],
          [UCN_COQUIMBO_BOUNDS[1][1], UCN_COQUIMBO_BOUNDS[1][0]],
          [UCN_COQUIMBO_BOUNDS[0][1], UCN_COQUIMBO_BOUNDS[1][0]],
          [UCN_COQUIMBO_BOUNDS[0][1], UCN_COQUIMBO_BOUNDS[0][0]],
        ];
        setCampusBoundsPolygon(polygonCoords);
        console.log("Polígono del campus inicializado con Turf");
      } catch (error) {
        console.error("Error inicializando polígono del campus:", error);
      }
    }
  }, []);

  // Validación de coordenadas
  const validateCoordinates = useCallback(
    (lat, lng) => {
      if (!campusBoundsPolygon) return true;

      try {
        const isValid = SpatialUtils.isPointInPolygon(
          lat,
          lng,
          campusBoundsPolygon
        );
        if (!isValid) {
          console.warn(`Coordenadas fuera del campus: ${lat}, ${lng}`);
        }
        return isValid;
      } catch (error) {
        console.error("Error validando coordenadas:", error);
        return true;
      }
    },
    [campusBoundsPolygon]
  );

  // Búsqueda del edificio más cercano
  const findNearestBuilding = useCallback(
    (lat, lng) => {
      if (!buildings || !buildings.length) {
        console.log("No hay edificios para buscar el más cercano");
        return null;
      }

      try {
        const targetPoint = { lat, lng };

        if (
          typeof lat !== "number" ||
          typeof lng !== "number" ||
          isNaN(lat) ||
          isNaN(lng)
        ) {
          console.warn("Coordenadas objetivo inválidas:", { lat, lng });
          return null;
        }

        const buildingPoints = buildings
          .map((building) => {
            try {
              if (!building) return null;

              let buildingLat, buildingLng;

              if (building.ubicacion && building.ubicacion.type === "Point") {
                const coords = building.ubicacion.coordinates;
                if (!coords || coords.length < 2) return null;
                [buildingLng, buildingLat] = coords;
              } else if (building.lat && building.lng) {
                buildingLat = building.lat;
                buildingLng = building.lng;
              } else {
                return null;
              }

              if (
                typeof buildingLat !== "number" ||
                typeof buildingLng !== "number" ||
                isNaN(buildingLat) ||
                isNaN(buildingLng)
              ) {
                console.warn(
                  "Coordenadas de edificio inválidas:",
                  building.nombre,
                  { buildingLat, buildingLng }
                );
                return null;
              }

              return {
                lat: buildingLat,
                lng: buildingLng,
                building: building,
              };
            } catch (error) {
              console.warn(
                "Error procesando edificio:",
                building?.nombre,
                error
              );
              return null;
            }
          })
          .filter(Boolean);

        if (buildingPoints.length === 0) {
          console.log("No se encontraron puntos de edificio válidos");
          return null;
        }

        console.log(
          `Buscando entre ${buildingPoints.length} edificios válidos`
        );
        const nearest = SpatialUtils.findNearestPoint(
          targetPoint,
          buildingPoints
        );
        return nearest ? nearest.building : null;
      } catch (error) {
        console.error("Error encontrando edificio más cercano:", error);
        return null;
      }
    },
    [buildings]
  );

  return {
    campusBoundsPolygon,
    validateCoordinates,
    findNearestBuilding,
  };
};
