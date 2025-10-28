import { useRef, useEffect, useState } from 'react';
import L from 'leaflet';
import { MAP_ZOOM_LIMITS } from '../constants/mapConfig'; // ✅ Importar la configuración

export const useMap = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const initializeMap = (bounds) => {
    if (!mapRef.current) {
      console.error('Contenedor del mapa no encontrado');
      return null;
    }

    if (mapInstanceRef.current) {
      return mapInstanceRef.current;
    }

    try {
      // ✅ CALCULAR CORRECTAMENTE el centro
      const centerLat = (bounds[0][0] + bounds[1][0]) / 2;
      const centerLng = (bounds[0][1] + bounds[1][1]) / 2;

      console.log('🗺️ Inicializando mapa:', {
        center: [centerLat, centerLng],
        bounds: bounds,
        zoom: MAP_ZOOM_LIMITS.default
      });

      const map = L.map(mapRef.current, {
        center: [centerLat, centerLng],
        zoom: MAP_ZOOM_LIMITS.default, 
        minZoom: MAP_ZOOM_LIMITS.min,  
        maxZoom: MAP_ZOOM_LIMITS.max, 
        zoomControl: false,
        attributionControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        minZoom: MAP_ZOOM_LIMITS.min, // ✅ Usar configuración
        maxZoom: MAP_ZOOM_LIMITS.max  // ✅ Usar configuración
      }).addTo(map);

      // ✅ ESTABLECER LÍMITES
      map.setMaxBounds(bounds);
      console.log('📍 Límites establecidos:', bounds);

      // ✅ EVENTOS PARA MANTENER DENTRO DE LOS LÍMITES
      map.on('zoomend', function() {
        const currentZoom = map.getZoom();
        if (currentZoom < MAP_ZOOM_LIMITS.min) {
          map.setZoom(MAP_ZOOM_LIMITS.min);
        } else if (currentZoom > MAP_ZOOM_LIMITS.max) {
          map.setZoom(MAP_ZOOM_LIMITS.max);
        }
      });

      map.on('drag', function() {
        map.panInsideBounds(bounds, { animate: false });
      });

      // ✅ EVENTO PARA DEBUG
      map.on('load', function() {
        console.log('✅ Mapa cargado completamente');
        console.log('📊 Estado final:', {
          center: map.getCenter(),
          zoom: map.getZoom(),
          bounds: map.getBounds()
        });
      });

      mapInstanceRef.current = map;
      setIsMapReady(true);

      // ✅ FORZAR REDIMENSIONADO
      setTimeout(() => {
        map.invalidateSize();
        console.log('🔄 Mapa redimensionado');
      }, 300);

      return map;

    } catch (error) {
      console.error('❌ Error inicializando mapa:', error);
      return null;
    }
  };

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
    isMapReady 
  };
};