import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';

import { useMap } from '../../hooks/useMap';
import { useGeoServer } from '../../hooks/useGeoServer';
import SidePanel from '../UI/SidePanel';
import { UCN_COQUIMBO_BOUNDS } from '../../constants/mapConfig';

// Configuración de íconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function Map() {
  const { mapRef, initializeMap, mapInstance, isMapReady } = useMap();
  const { status, features, loadWFSData } = useGeoServer();
  const [mapInitialized, setMapInitialized] = useState(false);

  useEffect(() => {
    if (!mapInitialized && mapRef.current) {
      console.log('🚀 Inicializando aplicación...');
      initializeMap(UCN_COQUIMBO_BOUNDS);
      setMapInitialized(true);
    }
  }, [mapInitialized, mapRef, initializeMap]);

  useEffect(() => {
    if (isMapReady && mapInstance && status === 'checking') {
      console.log('📡 Cargando datos WFS...');
      setTimeout(() => {
        loadWFSData(mapInstance, 'edificio');
      }, 500);
    }
  }, [isMapReady, mapInstance, status, loadWFSData]);

  const handleLogout = () => {
    console.log('Cerrando sesión...');
    alert('Cerrando sesión...');
  };

  return (
    <div className="container">
      <SidePanel 
        status={status} 
        featuresCount={features.length} 
        onLogout={handleLogout}
      />
      <div className="Mapa">
        <div ref={mapRef} className="map-container"></div>
        {!isMapReady && (
          <div className="loading-message">
            🗺️ Cargando mapa...
          </div>
        )}
      </div>
    </div>
  );
}

export default Map;