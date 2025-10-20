import { useRef, useEffect, useState } from 'react';
import L from 'leaflet';

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
      const centerLat = (bounds[0][0] + bounds[1][0]) / 2;
      const centerLng = (bounds[0][1] + bounds[1][1]) / 2;

      const map = L.map(mapRef.current, {
        center: [centerLat, centerLng],
        zoom: 18,
        minZoom: 17,
        maxZoom: 19,
        zoomControl: true,
        attributionControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        minZoom: 17,
        maxZoom: 19
      }).addTo(map);

      map.setMaxBounds(bounds);

      map.on('zoomend', function() {
        const currentZoom = map.getZoom();
        if (currentZoom < 17) map.setZoom(17);
        else if (currentZoom > 19) map.setZoom(19);
      });

      map.on('drag', function() {
        map.panInsideBounds(bounds, { animate: false });
      });

      mapInstanceRef.current = map;
      setIsMapReady(true);

      setTimeout(() => {
        map.invalidateSize();
      }, 100);

      return map;

    } catch (error) {
      console.error('Error inicializando mapa:', error);
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