import { useCallback } from "react";
import L from "leaflet";
import {
  UCN_COQUIMBO_BOUNDS,
  MAP_ZOOM_LIMITS,
} from "../../constants/mapConfig";

export const useMapActions = (
  mapInstance,
  showNotification,
  showConfirm,
  syncWithGeoServer,
  geoServerFeatures,
  loadBuildings
) => {
  const handleLogout = useCallback(() => {
    showConfirm(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      () => {
        showNotification("Sesión cerrada correctamente", "success");
      },
      {
        type: "info",
        confirmText: "Cerrar Sesión",
        cancelText: "Cancelar",
      }
    );
  }, [showConfirm, showNotification]);

  const handleSyncData = useCallback(async () => {
    if (geoServerFeatures.length > 0) {
      try {
        await syncWithGeoServer(geoServerFeatures);
        showNotification(
          `${geoServerFeatures.length} edificios sincronizados`,
          "success"
        );
        await loadBuildings();
      } catch (error) {
        console.error("Error sincronizando datos:", error);
        showNotification("Error sincronizando datos", "error");
      }
    } else {
      showNotification("No hay datos de GeoServer para sincronizar", "warning");
    }
  }, [geoServerFeatures, syncWithGeoServer, showNotification, loadBuildings]);

  const handleResetView = useCallback(() => {
    if (mapInstance) {
      const boundsLatLng = L.latLngBounds(UCN_COQUIMBO_BOUNDS);
      mapInstance.fitBounds(boundsLatLng, {
        padding: [50, 50],
        maxZoom: MAP_ZOOM_LIMITS.default,
        animate: true,
        duration: 0.5,
      });
      console.log("Vista reseteada al Campus Guayacán");
    }
  }, [mapInstance]);

  return {
    handleLogout,
    handleSyncData,
    handleResetView,
  };
};
