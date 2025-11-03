import { useRef, useEffect, useState } from "react";
import L from "leaflet";
import { MAP_ZOOM_LIMITS } from "../constants/mapConfig";

export const useMap = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const initializeMap = (bounds) => {
    if (!mapRef.current) {
      console.error("Contenedor del mapa no encontrado");
      return null;
    }

    // VERIFICAR SI EL MAPA YA ESTÁ INICIALIZADO
    if (mapInstanceRef.current) {
      console.log("🗺️ Mapa ya inicializado, retornando instancia existente");
      return mapInstanceRef.current;
    }

    // VERIFICAR SI EL CONTENEDOR YA TIENE UN MAPA (más robusto)
    if (mapRef.current._leaflet_id) {
      console.log("⚠️ Contenedor ya tiene un mapa, limpiando primero");
      // Limpiar cualquier instancia previa de Leaflet
      const container = mapRef.current;
      container._leaflet_id = null;
      container.innerHTML = "";
    }

    try {
      // CALCULAR CORRECTAMENTE el centro
      const centerLat = (bounds[0][0] + bounds[1][0]) / 2;
      const centerLng = (bounds[0][1] + bounds[1][1]) / 2;

      console.log("Inicializando mapa:", {
        center: [centerLat, centerLng],
        bounds: bounds,
        zoom: MAP_ZOOM_LIMITS.default,
      });

      const map = L.map(mapRef.current, {
        center: [centerLat, centerLng],
        zoom: MAP_ZOOM_LIMITS.default,
        minZoom: 15,
        maxZoom: 20,
        zoomControl: false,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        minZoom: 15,
        maxZoom: 20,
      }).addTo(map);

      // ESTABLECER LÍMITES DE MOVIMIENTO PRIMERO
      const extendedBounds = [
        [bounds[0][0] - 0.002, bounds[0][1] - 0.002],
        [bounds[1][0] + 0.002, bounds[1][1] + 0.002],
      ];

      map.setMaxBounds(extendedBounds);
      console.log("Límites establecidos:", extendedBounds);

      // AJUSTAR AL BOUNDS INICIALMENTE (con delay)
      setTimeout(() => {
        try {
          if (map && !map._destroyed) {
            map.fitBounds(bounds, {
              padding: [20, 20],
              maxZoom: 17,
            });
            console.log("📍 Mapa ajustado a bounds:", bounds);
          }
        } catch (fitError) {
          console.error("Error en fitBounds:", fitError);
        }
      }, 150);

      // EVENTOS PARA MANTENER DENTRO DE LOS LÍMITES
      map.on("drag", function () {
        if (!map._destroyed) {
          map.panInsideBounds(bounds, { animate: false });
        }
      });

      // EVENTO PARA DEBUG (cuando el mapa está realmente listo)
      map.on("load", function () {
        console.log("✅ Mapa cargado completamente");
        console.log("📊 Estado inicial:", {
          center: map.getCenter(),
          zoom: map.getZoom(),
          bounds: map.getBounds(),
        });
      });

      mapInstanceRef.current = map;
      setIsMapReady(true);

      // FORZAR REDIMENSIONADO (con más delay)
      setTimeout(() => {
        if (map && !map._destroyed) {
          try {
            map.invalidateSize(true);
            console.log("🔄 Mapa redimensionado");
          } catch (sizeError) {
            console.error("Error en invalidateSize:", sizeError);
          }
        }
      }, 500);

      return map;
    } catch (error) {
      console.error("❌ Error crítico inicializando mapa:", error);

      // LIMPIEZA COMPLETA EN CASO DE ERROR
      if (mapRef.current) {
        mapRef.current._leaflet_id = null;
        mapRef.current.innerHTML = "";
      }
      mapInstanceRef.current = null;
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
    mapInstance: mapInstanceRef.current,
    isMapReady,
    fitToBounds,
    cleanupMap,
  };
};
