import React, { useEffect, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';

import { useMap } from '../../hooks/useMap';
import { useBuildings } from '../../hooks/useBuildings';
import { useGeoServer } from '../../hooks/useGeoServer';
import SidePanel from '../UI/SidePanel';
import BuildingForm from '../Forms/BuildingForm';
import BuildingList from '../UI/BuildingList/BuildingList';
import { UCN_COQUIMBO_BOUNDS } from '../../constants/mapConfig';
import { buildingService } from '../../services/buildingService';

// 🔧 Configuración de íconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// 🏗️ Ícono para edificios guardados en la base de datos
const createDatabaseIcon = () =>
  L.divIcon({
    html: `<div style="background-color: #27ae60; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [18, 18],
    className: 'database-building-icon'
  });

// 📍 Ícono para coordenadas temporales
const createTempIcon = () =>
  L.divIcon({
    html: `<div style="background-color: #e74c3c; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(231,76,60,0.5);"></div>`,
    iconSize: [22, 22],
    className: 'temp-coordinate-icon'
  });

function Map() {
  const { mapRef, initializeMap, mapInstance, isMapReady } = useMap();
  const [mapInitialized, setMapInitialized] = useState(false);

  const [showBuildingForm, setShowBuildingForm] = useState(false);
  const [showBuildingList, setShowBuildingList] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [mapUpdateCount, setMapUpdateCount] = useState(0);

  // 📍 Estados del modo captura de coordenadas
  const [coordinateDetection, setCoordinateDetection] = useState(false);
  const [tempMarker, setTempMarker] = useState(null);
  const [capturedCoords, setCapturedCoords] = useState(null);

  const {
    buildings,
    loading: buildingsLoading,
    error: buildingsError,
    backendStatus,
    syncWithGeoServer,
    loadBuildings,
    deleteBuilding
  } = useBuildings();

  const { status: geoServerStatus, features: geoServerFeatures, loadWFSData } = useGeoServer();
  const [buildingLayers, setBuildingLayers] = useState([]);

  // ✅ Alternar modo captura de coordenadas
  const toggleCoordinateDetection = useCallback(() => {
    const newState = !coordinateDetection;
    setCoordinateDetection(newState);

    if (newState) {
      console.log('📍 Modo captura ACTIVADO');
      if (mapInstance) mapInstance.getContainer().style.cursor = 'crosshair';
    } else {
      console.log('📍 Modo captura DESACTIVADO');

      // Limpiar marcador temporal
      if (tempMarker && mapInstance) {
        mapInstance.removeLayer(tempMarker);
        setTempMarker(null);
      }
      
      // Restaurar cursor normal
      if (mapInstance) {
        mapInstance.getContainer().style.cursor = '';
      }
      
      setCapturedCoords(null);
    }
  }, [coordinateDetection, mapInstance, tempMarker]);

  // ✅ Capturar clic en el mapa
  useEffect(() => {
    if (!mapInstance || !coordinateDetection) return;

    const handleMapClick = (e) => {
      const { lat, lng } = e.latlng;
      console.log('📍 Coordenadas capturadas:', { lat, lng });

      if (tempMarker) mapInstance.removeLayer(tempMarker);

      const newTempMarker = L.marker([lat, lng], { icon: createTempIcon(), zIndexOffset: 1000 }).addTo(mapInstance);
      newTempMarker.bindPopup(`
        <div style="text-align: center;">
          <h4>📍 Coordenadas Capturadas</h4>
          <p><strong>Lat:</strong> ${lat.toFixed(6)}</p>
          <p><strong>Lng:</strong> ${lng.toFixed(6)}</p>
          <button onclick="window.useCapturedCoords(${lat}, ${lng})" 
            style="background: #27ae60; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
            Usar estas coordenadas
          </button>
        </div>
      `).openPopup();

      setTempMarker(newTempMarker);
      setCapturedCoords({ lat, lng });
    };

    window.useCapturedCoords = (lat, lng) => {
      console.log('🔄 Coordenadas usadas:', { lat, lng });
      setCapturedCoords({ lat, lng });
      setCoordinateDetection(false);
      setEditingBuilding(null);
      setShowBuildingForm(true);
      if (tempMarker) mapInstance.removeLayer(tempMarker);
      setTempMarker(null);
      mapInstance.getContainer().style.cursor = '';
    };

    mapInstance.on('click', handleMapClick);
    return () => {
      mapInstance.off('click', handleMapClick);
      delete window.useCapturedCoords;
    };
  }, [mapInstance, coordinateDetection, tempMarker]);

  // ✅ Guardar o actualizar edificio
  const handleSaveBuilding = async (buildingData) => {
    try {
      if (editingBuilding) {
        const id = editingBuilding.id || editingBuilding._id || editingBuilding.id_edificio;
        await buildingService.updateBuilding(id, buildingData);
        alert('✅ Edificio actualizado');
      } else {
        await buildingService.createBuilding(buildingData);
        alert('✅ Edificio creado');
      }

      await loadBuildings();
      setEditingBuilding(null);
      setShowBuildingForm(false);
      setCapturedCoords(null);
    } catch (error) {
      console.error('❌ Error al guardar edificio:', error);
    }
  };

  const handleAddBuilding = () => {
    setEditingBuilding(null);
    setShowBuildingForm(true);
  };

  const handleEditBuildings = () => setShowBuildingList(true);
  const handleEditBuilding = (b) => { setEditingBuilding(b); setShowBuildingForm(true); setShowBuildingList(false); };
  const handleCancelEdit = () => { setEditingBuilding(null); setShowBuildingForm(false); };
  const handleCloseBuildingList = () => setShowBuildingList(false);

  const handleDeleteBuilding = async (b) => {
    try {
      const id = b.id || b._id || b.id_edificio;
      await deleteBuilding(id);
      console.log('✅ Edificio eliminado');
    } catch (err) {
      console.error('Error al eliminar edificio:', err);
    }
  };

  // ✅ Renderizar edificios en el mapa - VERSIÓN CORREGIDA
  useEffect(() => {
    if (!mapInstance) return;

    buildingLayers.forEach((l) => mapInstance.removeLayer(l));
    const newLayers = [];

    buildings.forEach((b) => {
      if (!b.ubicacion) return;

      let layer;
      if (b.ubicacion.type === 'Point') {
        const [lng, lat] = b.ubicacion.coordinates;
        layer = L.marker([lat, lng], { icon: createDatabaseIcon() });
      } else if (b.ubicacion.type === 'Polygon') {
        const coords = b.ubicacion.coordinates[0].map((c) => [c[1], c[0]]);
        layer = L.polygon(coords, { color: '#27ae60', weight: 3, fillOpacity: 0.3 });
      }

      // ✅ POPUP CORREGIDO - Mostrar tipo en lugar de estado activo
      const popup = `
        <div style="min-width:200px;">
          <h4>🏛️ ${b.nombre}</h4>
          <p><strong>Descripción:</strong> ${b.descripcion}</p>
          <p><strong>Tipo:</strong> ${b.tipo || 'No especificado'}</p>
          <p><strong>ID:</strong> ${b.id || b._id || b.id_edificio}</p>
          <hr><small style="color:#27ae60;">✅ En Base de Datos</small>
        </div>`;
      layer.bindPopup(popup).addTo(mapInstance);
      newLayers.push(layer);
    });

    setBuildingLayers(newLayers);
    setMapUpdateCount((c) => c + 1);
  }, [mapInstance, buildings]);

  // Inicializar mapa
  useEffect(() => {
    if (!mapInitialized && mapRef.current) {
      initializeMap(UCN_COQUIMBO_BOUNDS);
      setMapInitialized(true);
    }
  }, [mapInitialized, mapRef, initializeMap]);

  // Cargar GeoServer al iniciar
  useEffect(() => {
    if (isMapReady && mapInstance && geoServerStatus === 'checking') {
      setTimeout(() => loadWFSData(mapInstance, 'edificio'), 500);
    }
  }, [isMapReady, mapInstance, geoServerStatus, loadWFSData]);

  const handleLogout = () => alert('Cerrando sesión...');
  const handleSyncData = async () => {
    if (geoServerFeatures.length > 0) {
      try {
        await syncWithGeoServer(geoServerFeatures);
        alert(`✅ ${geoServerFeatures.length} edificios sincronizados`);
        await loadBuildings();
      } catch {
        alert('❌ Error sincronizando datos');
      }
    } else alert('ℹ️ No hay datos de GeoServer para sincronizar');
  };

  return (
    <div className="container">
      <SidePanel
        status={backendStatus === 'connected' ? 'success' : 'error'}
        featuresCount={buildings.length}
        onLogout={handleLogout}
        onSyncData={handleSyncData}
        buildingsLoading={buildingsLoading}
        backendStatus={backendStatus}
        geoServerStatus={geoServerStatus}
        geoServerFeaturesCount={geoServerFeatures.length}
        onAddBuilding={handleAddBuilding}
        onEditBuildings={handleEditBuildings}
        onToggleCoordinateDetection={toggleCoordinateDetection}
        coordinateDetectionActive={coordinateDetection}
      />

      {/* Formulario de edificio - Pasar coordenadas capturadas */}
      <BuildingForm 
        onSave={handleSaveBuilding}
        onCancel={handleCancelEdit}
        isVisible={showBuildingForm}
        building={editingBuilding}
        isEditing={!!editingBuilding}
        capturedCoordinates={capturedCoords}
        onClearCoordinates={() => setCapturedCoords(null)}
      />

      {showBuildingList && (
        <BuildingList
          buildings={buildings}
          onEditBuilding={handleEditBuilding}
          onDeleteBuilding={handleDeleteBuilding}
          onClose={handleCloseBuildingList}
        />
      )}

      {/* ✅ SOLO el indicador pequeño en la esquina (opcional) */}
      {coordinateDetection && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
                background: 'rgba(231, 76, 60, 0.9)',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: 'bold',
      zIndex: 1000,
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
    }}>
      🎯 Modo Captura
    </div>
  )}

  <div className="Mapa">
    <div ref={mapRef} className="map-container"></div>

    {!isMapReady && (
      <div className="loading-message">🗺️ Cargando mapa...</div>
    )}

    {buildingsLoading && (
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#3498db',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '5px',
        zIndex: 1000
      }}>
        ⏳ Cargando edificios...
      </div>
    )}

    {buildingsError && (
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#e74c3c',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '5px',
        zIndex: 1000
      }}>
        ❌ Error: {buildingsError}
      </div>
    )}

    <div style={{
      position: 'absolute',
      bottom: '10px',
      right: '10px',
      background: 'rgba(52,152,219,0.8)',
      color: 'white',
      padding: '5px 10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 1000
    }}>
      🏢 Edificios: {buildingLayers.length}
    </div>
  </div>
</div>
  );
}

export default Map;