import { useRef, useEffect, useState, useCallback } from "react";
import L from "leaflet";
import { MAP_ZOOM_LIMITS } from "../constants/mapConfig";

export const useMap = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const initializeMap = useCallback((bounds) => {
    if (!mapRef.current) {
      console.error("❌ Contenedor del mapa no encontrado");
      return null;
    }

    if (mapInstanceRef.current) {
      console.log("⚠️ Mapa ya inicializado, retornando instancia existente");
      return mapInstanceRef.current;
    }

    try {
      console.log("🗺️ Inicializando mapa con bounds:", bounds);

      // 🎯 Calcular centro para inicialización
      const centerLat = (bounds[0][0] + bounds[1][0]) / 2;
      const centerLng = (bounds[0][1] + bounds[1][1]) / 2;

      // 🎯 Crear mapa con centro y zoom inicial
      const map = L.map(mapRef.current, {
        center: [centerLat, centerLng],
        zoom: MAP_ZOOM_LIMITS.default,
        minZoom: MAP_ZOOM_LIMITS.min,
        maxZoom: MAP_ZOOM_LIMITS.max,
        zoomControl: true, // Activar controles de zoom
        attributionControl: true,
        maxBoundsViscosity: 0.8, // Permite desplazamiento suave en los bordes
        zoomSnap: 0.5, // Permite zooms intermedios más suaves
        zoomDelta: 0.5,
        wheelPxPerZoomLevel: 80, // Control más suave del zoom con rueda
      });

      // 🗺️ Agregar capa de tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        minZoom: MAP_ZOOM_LIMITS.min,
        maxZoom: MAP_ZOOM_LIMITS.max,
      }).addTo(map);

      // ✅ Establecer límites flexibles (permite salir un poco pero vuelve)
      const boundsLatLng = L.latLngBounds(bounds);
      map.setMaxBounds(boundsLatLng);

      console.log("✅ Vista inicial establecida:", {
        bounds: boundsLatLng,
        center: map.getCenter(),
        zoom: map.getZoom(),
      });

      // 📊 Eventos de monitoreo
      map.on("zoomend", () => {
        const currentZoom = map.getZoom();
        console.log("🔍 Zoom actual:", currentZoom);

        // Prevenir zoom fuera de límites
        if (currentZoom < MAP_ZOOM_LIMITS.min) {
          map.setZoom(MAP_ZOOM_LIMITS.min);
        } else if (currentZoom > MAP_ZOOM_LIMITS.max) {
          map.setZoom(MAP_ZOOM_LIMITS.max);
        }
      });

      map.on("moveend", () => {
        const center = map.getCenter();
        console.log("📍 Centro actual:", center);
      });

      // ✅ Evento LOAD para ajustar vista cuando el mapa esté completamente listo
      map.whenReady(() => {
        console.log("✅ Mapa listo (whenReady)");
        // 🎯 Usar fitBounds solo cuando el mapa esté completamente inicializado
        setTimeout(() => {
          try {
            map.invalidateSize();
            const boundsLatLng = L.latLngBounds(bounds);
            map.fitBounds(boundsLatLng, {
              padding: [50, 50],
              maxZoom: MAP_ZOOM_LIMITS.default,
              animate: true,
            });
            console.log("🔄 Vista ajustada con fitBounds");
          } catch (error) {
            console.warn(
              "⚠️ No se pudo ajustar con fitBounds, manteniendo vista inicial:",
              error
            );
          }
        }, 100);
      });

      mapInstanceRef.current = map;
      setIsMapReady(true);

      return map;
    } catch (error) {
      console.error("❌ Error inicializando mapa:", error);
      return null;
    }
  }, []); // useCallback sin dependencias porque mapRef es ref

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setIsMapReady(false);
      }
    };
  }, []);

  return {
    mapRef,
    initializeMap,
    mapInstance: mapInstanceRef.current,
    isMapReady,
  };
};
