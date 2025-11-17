// hooks/map/useMapClickHandler.js
import { useCallback, useEffect } from "react";
import L from "leaflet";
import { SpatialUtils } from "../../utils/spatialUtils";

export const useMapClickHandler = (
  mapInstance,
  coordinateManagement,
  validateCoordinates,
  findNearestBuilding,
  mapManagement,
  isRouteDrawing = false // 🆕 NUEVO PARÁMETRO
) => {
  const handleMapClick = useCallback(
    (e) => {
      // 🆕 IGNORAR CLICKS SI ESTAMOS DIBUJANDO RUTAS
      if (isRouteDrawing) {
        console.log(
          "🚫 useMapClickHandler: Ignorando click (modo dibujo de ruta activo)"
        );
        return;
      }

      const { lat, lng } = e.latlng;
      console.log("Coordenadas capturadas:", { lat, lng });

      if (
        typeof lat !== "number" ||
        typeof lng !== "number" ||
        isNaN(lat) ||
        isNaN(lng)
      ) {
        console.error("Coordenadas capturadas inválidas");
        return;
      }

      const isValid = validateCoordinates(lat, lng);

      // Limpiar marcador anterior si existe
      if (coordinateManagement.tempMarker && mapInstance) {
        mapInstance.removeLayer(coordinateManagement.tempMarker);
      }

      const newTempMarker = L.marker([lat, lng], {
        icon: coordinateManagement.createTempIcon(),
        zIndexOffset: 1000,
      }).addTo(mapInstance);

      let popupContent = `
      <div style="text-align: center;">
        <h4>Coordenadas Capturadas</h4>
        <p><strong>Lat:</strong> ${lat.toFixed(6)}</p>
        <p><strong>Lng:</strong> ${lng.toFixed(6)}</p>
    `;

      if (!isValid) {
        popupContent += `
        <p style="color: #e74c3c; font-weight: bold;">
          Fuera del campus
        </p>
      `;
      }

      // Encontrar edificio más cercano
      try {
        const nearestBuilding = findNearestBuilding(lat, lng);
        if (nearestBuilding) {
          const distance = SpatialUtils.calculateDistance(
            { lat, lng },
            {
              lat:
                nearestBuilding.lat ||
                nearestBuilding.ubicacion?.coordinates[1],
              lng:
                nearestBuilding.lng ||
                nearestBuilding.ubicacion?.coordinates[0],
            }
          );

          if (!isNaN(distance) && distance !== Infinity) {
            popupContent += `
            <p style="color: #27ae60; font-size: 12px;">
              Más cercano: ${nearestBuilding.nombre} (${Math.round(distance)}m)
            </p>
          `;
          }
        }
      } catch (error) {
        console.warn("Error mostrando edificio más cercano:", error);
      }

      popupContent += `
        <button onclick="window.useCapturedCoords(${lat}, ${lng})" 
          style="background: ${
            isValid ? "#27ae60" : "#e74c3c"
          }; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-top: 5px;">
          ${isValid ? "Usar estas coordenadas" : "Usar de todas formas"}
        </button>
      </div>
    `;

      newTempMarker.bindPopup(popupContent).openPopup();
      coordinateManagement.setTempMarker(newTempMarker);
      coordinateManagement.setCapturedCoords({ lat, lng });
    },
    [
      mapInstance,
      coordinateManagement,
      validateCoordinates,
      findNearestBuilding,
      isRouteDrawing, // 🆕 Agregar a dependencias
    ]
  );

  const handleUseCapturedCoords = useCallback(
    (lat, lng) => {
      console.log("Coordenadas usadas:", { lat, lng });

      coordinateManagement.toggleCoordinateDetection();
      coordinateManagement.setCapturedCoords({ lat, lng });

      if (coordinateManagement.tempMarker && mapInstance) {
        mapInstance.removeLayer(coordinateManagement.tempMarker);
        coordinateManagement.setTempMarker(null);
      }

      mapManagement.setEditingBuilding(null);
      mapManagement.setShowBuildingForm(true);
    },
    [coordinateManagement, mapInstance, mapManagement]
  );

  useEffect(() => {
    // 🆕 NO ACTIVAR EL HANDLER SI ESTAMOS DIBUJANDO RUTAS
    if (
      !mapInstance ||
      !coordinateManagement.coordinateDetection ||
      isRouteDrawing
    ) {
      if (isRouteDrawing) {
        console.log("useMapClickHandler: Desactivado (modo dibujo de ruta)");
      }
      return;
    }

    // Configurar función global
    window.useCapturedCoords = handleUseCapturedCoords;

    mapInstance.on("click", handleMapClick);

    return () => {
      mapInstance.off("click", handleMapClick);
      delete window.useCapturedCoords;

      if (coordinateManagement.coordinateDetection) {
        coordinateManagement.toggleCoordinateDetection();
        if (coordinateManagement.tempMarker && mapInstance) {
          mapInstance.removeLayer(coordinateManagement.tempMarker);
          coordinateManagement.setTempMarker(null);
        }
      }
    };
  }, [
    mapInstance,
    coordinateManagement.coordinateDetection,
    handleMapClick,
    handleUseCapturedCoords,
    coordinateManagement,
    isRouteDrawing, // 🆕 Agregar a dependencias
  ]);

  return {
    handleUseCapturedCoords,
  };
};
