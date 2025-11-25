import { useRef, useEffect, useState } from "react";
import L from "leaflet";
import { MAP_ZOOM_LIMITS } from "../../constants/mapConfig";

export const useMap = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);

  const initializeMap = (bounds) => {
    if (!mapRef.current) {
      console.error("Contenedor del mapa no encontrado");
      return null;
    }

    // VERIFICAR SI EL MAPA YA ESTÁ INICIALIZADO
    if (mapInstanceRef.current) {
      console.log("Mapa ya inicializado, retornando instancia existente");
      return mapInstanceRef.current;
    }

    // VERIFICAR SI EL CONTENEDOR YA TIENE UN MAPA (más robusto)
    if (mapRef.current._leaflet_id) {
      console.log("Contenedor ya tiene un mapa, limpiando primero");
      // Limpiar cualquier instancia previa de Leaflet
      const container = mapRef.current;
      container._leaflet_id = null;
      container.innerHTML = "";
    }

    try {
      console.log("Inicializando mapa con bounds:", bounds);

      const map = L.map(mapRef.current, {
        minZoom: MAP_ZOOM_LIMITS.min,
        maxZoom: MAP_ZOOM_LIMITS.max,
        zoomControl: false, // Desactivar controles de zoom
        attributionControl: false,
        maxBoundsViscosity: 0.8,
        zoomSnap: 0.5,
        zoomDelta: 0.5,
        wheelPxPerZoomLevel: 80,
        scrollWheelZoom: false, // Desactivar zoom con rueda del mouse
        doubleClickZoom: false, // Desactivar zoom con doble click
        touchZoom: false, // Desactivar zoom táctil
        boxZoom: false, // Desactivar zoom con selección de área
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        minZoom: MAP_ZOOM_LIMITS.min,
        maxZoom: MAP_ZOOM_LIMITS.max,
      }).addTo(map);

      const boundsLatLng = L.latLngBounds(bounds);
      map.fitBounds(boundsLatLng, {
        padding: [50, 50],
        maxZoom: MAP_ZOOM_LIMITS.default,
        animate: false,
      });

      map.setMaxBounds(boundsLatLng);

      console.log("Vista inicial establecida:", {
        bounds: bounds,
        center: map.getCenter(),
        zoom: map.getZoom(),
      });

      console.log("Vista inicial establecida:", {
        bounds: bounds,
        center: map.getCenter(),
        zoom: map.getZoom(),
      });

      // EVENTO PARA DEBUG
      map.on("load", function () {
        console.log("Mapa cargado completamente");
        console.log("Estado inicial:", {
          center: map.getCenter(),
          zoom: map.getZoom(),
          bounds: map.getBounds(),
        });
      });

      mapInstanceRef.current = map;
      setMapInstance(map);
      setIsMapReady(true);

      // FORZAR REDIMENSIONADO (con más delay)
      setTimeout(() => {
        if (map && !map._destroyed) {
          try {
            map.invalidateSize(true);
            console.log("Mapa redimensionado");
          } catch (sizeError) {
            console.error("Error en invalidateSize:", sizeError);
          }
        }
      }, 500);

      return map;
    } catch (error) {
      console.error("Error crítico inicializando mapa:", error);

      // LIMPIEZA COMPLETA EN CASO DE ERROR
      if (mapRef.current) {
        mapRef.current._leaflet_id = null;
        mapRef.current.innerHTML = "";
      }
      mapInstanceRef.current = null;
      setMapInstance(null);
      setIsMapReady(false);

      return null;
    }
  };

  // FUNCIÓN PARA REAJUSTAR EL MAPA A LOS BOUNDS
  const fitToBounds = (bounds) => {
    if (
      mapInstanceRef.current &&
      bounds &&
      !mapInstanceRef.current._destroyed
    ) {
      try {
        mapInstanceRef.current.fitBounds(bounds, {
          padding: [20, 20],
          maxZoom: 18,
        });
      } catch (error) {
        console.error("Error en fitToBounds:", error);
      }
    }
  };

  // FUNCIÓN PARA LIMPIAR COMPLETAMENTE
  const cleanupMap = () => {
    if (mapInstanceRef.current && !mapInstanceRef.current._destroyed) {
      try {
        mapInstanceRef.current.remove();
      } catch (error) {
        console.error("Error limpiando mapa:", error);
      }
    }
    mapInstanceRef.current = null;

    if (mapRef.current) {
      mapRef.current._leaflet_id = null;
      mapRef.current.innerHTML = "";
    }

    setMapInstance(null);
    setIsMapReady(false);
  };

  useEffect(() => {
    return () => {
      cleanupMap();
    };
  }, []);

  return {
    mapRef,
    initializeMap,
    mapInstance,
    isMapReady,
    fitToBounds,
    cleanupMap,
  };
};
