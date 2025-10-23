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

// Configuración de íconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Ícono personalizado para edificios de la base de datos
const createDatabaseIcon = () => {
  return L.divIcon({
    html: `<div style="background-color: #27ae60; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [18, 18],
    className: 'database-building-icon'
  });
};

function Map() {
  const { mapRef, initializeMap, mapInstance, isMapReady } = useMap();
  const [mapInitialized, setMapInitialized] = useState(false);
  
  const [showBuildingForm, setShowBuildingForm] = useState(false);
  const [showBuildingList, setShowBuildingList] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState(null);
  
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

  // Función para guardar/actualizar edificio
  const handleSaveBuilding = async (buildingData) => {
    try {
      if (editingBuilding) {
        const buildingId = editingBuilding.id || editingBuilding._id || editingBuilding.id_edificio;
        console.log('🆔 Actualizando edificio ID:', buildingId);
        
        await buildingService.updateBuilding(buildingId, buildingData);
        alert('✅ Edificio actualizado exitosamente');
        
        // ✅ FORZAR RECARGA COMPLETA
        console.log('🔄 Forzando recarga de edificios...');
        await loadBuildings();
        
      } else {
        await buildingService.createBuilding(buildingData);
        alert('✅ Edificio guardado exitosamente');
        await loadBuildings();
      }
      
      setEditingBuilding(null);
      setShowBuildingForm(false);
      
    } catch (error) {
      console.error('Error al guardar edificio:', error);
      throw error;
    }
  };

  // Función para abrir formulario de nuevo edificio
  const handleAddBuilding = () => {
    console.log('🟢 Abriendo formulario para nuevo edificio');
    setEditingBuilding(null);
    setShowBuildingForm(true);
  };

  // Función para abrir lista de edificios
  const handleEditBuildings = () => {
    console.log('📝 Abriendo lista de edificios para edición');
    setShowBuildingList(true);
  };

  // Función para editar un edificio específico
  const handleEditBuilding = (building) => {
    console.log('✏️ Editando edificio:', building.nombre);
    setEditingBuilding(building);
    setShowBuildingList(false);
    setShowBuildingForm(true);
  };

  // Función para cancelar edición
  const handleCancelEdit = () => {
    console.log('❌ Cancelando edición');
    setEditingBuilding(null);
    setShowBuildingForm(false);
  };

  // Función para cerrar lista de edificios
  const handleCloseBuildingList = () => {
    setShowBuildingList(false);
  };

  // ✅ Función para manejar eliminación PERMANENTE
  const handleDeleteBuilding = async (building) => {
    try {
      const buildingId = building.id || building._id || building.id_edificio;
      console.log('🗑️ Eliminando edificio ID:', buildingId);
      
      await deleteBuilding(buildingId);
      
      // ✅ También eliminar la capa del mapa si existe
      if (mapInstance) {
        const layersToRemove = [];
        buildingLayers.forEach((layer, index) => {
          // Buscar la capa que corresponde al edificio eliminado
          const layerCoords = layer.getLatLng ? layer.getLatLng() : layer.getBounds().getCenter();
          const buildingCoords = building.ubicacion?.coordinates;
          
          if (buildingCoords && layerCoords) {
            const layerLat = layerCoords.lat;
            const layerLng = layerCoords.lng;
            const buildingLat = buildingCoords[1];
            const buildingLng = buildingCoords[0];
            
            // Comparar coordenadas para encontrar la capa correcta
            if (Math.abs(layerLat - buildingLat) < 0.0001 && Math.abs(layerLng - buildingLng) < 0.0001) {
              mapInstance.removeLayer(layer);
              layersToRemove.push(index);
            }
          }
        });
        
        // Actualizar el estado de las capas
        if (layersToRemove.length > 0) {
          const newLayers = buildingLayers.filter((_, index) => 
            !layersToRemove.includes(index)
          );
          setBuildingLayers(newLayers);
          console.log('🗺️ Capa eliminada del mapa');
        }
      }
      
    } catch (error) {
      console.error('Error eliminando edificio:', error);
      throw error;
    }
  };

  // Procesar edificios de la base de datos y mostrarlos en el mapa
  useEffect(() => {
    if (!mapInstance || buildings.length === 0) return;

    // Limpiar capas anteriores
    buildingLayers.forEach(layer => {
      mapInstance.removeLayer(layer);
    });

    const newLayers = [];

    buildings.forEach(building => {
      if (!building.ubicacion) return;

      try {
        let layer;
        
        // Crear capa según el tipo de geometría
        if (building.ubicacion.type === 'Point') {
          const coords = building.ubicacion.coordinates;
          layer = L.marker([coords[1], coords[0]], { 
            icon: createDatabaseIcon() 
          });
        } else if (building.ubicacion.type === 'Polygon') {
          const coordinates = building.ubicacion.coordinates[0].map(coord => [coord[1], coord[0]]);
          layer = L.polygon(coordinates, {
            color: '#27ae60',
            weight: 3,
            fillColor: '#27ae60',
            fillOpacity: 0.3
          });
        } else {
          console.warn('Tipo de geometría no soportado:', building.ubicacion.type);
          return;
        }

        // Agregar popup con información del edificio
        const popupContent = `
          <div style="min-width: 200px;">
            <h4>🏛️ ${building.nombre}</h4>
            <p><strong>Descripción:</strong> ${building.descripcion}</p>
            <p><strong>ID:</strong> ${building.id || building._id || building.id_edificio}</p>
            <p><strong>Estado:</strong> ${building.activo ? '🟢 Activo' : '🔴 Inactivo'}</p>
            <hr>
            <small style="color: #27ae60;">✅ Almacenado en Base de Datos</small>
          </div>
        `;
        
        layer.bindPopup(popupContent);
        
        // ✅ Guardar referencia al edificio en la capa
        layer.buildingId = building.id || building._id || building.id_edificio;
        layer.buildingName = building.nombre;
        
        layer.addTo(mapInstance);
        newLayers.push(layer);

      } catch (error) {
        console.error(`Error procesando edificio ${building.nombre}:`, error);
      }
    });

    setBuildingLayers(newLayers);
    console.log(`🗺️ ${newLayers.length} edificios mostrados en el mapa`);

  }, [mapInstance, buildings]);

  // Inicializar mapa
  useEffect(() => {
    if (!mapInitialized && mapRef.current) {
      console.log('🚀 Inicializando aplicación...');
      initializeMap(UCN_COQUIMBO_BOUNDS);
      setMapInitialized(true);
    }
  }, [mapInitialized, mapRef, initializeMap]);

  // Cargar datos de GeoServer cuando el mapa esté listo
  useEffect(() => {
    if (isMapReady && mapInstance && geoServerStatus === 'checking') {
      console.log('📡 Cargando datos WFS de GeoServer...');
      setTimeout(() => {
        loadWFSData(mapInstance, 'edificio');
      }, 500);
    }
  }, [isMapReady, mapInstance, geoServerStatus, loadWFSData]);

  const handleLogout = () => {
    console.log('Cerrando sesión...');
    alert('Cerrando sesión...');
  };

  const handleSyncData = async () => {
    if (geoServerFeatures.length > 0) {
      try {
        await syncWithGeoServer(geoServerFeatures);
        alert(`✅ ${geoServerFeatures.length} edificios sincronizados con la base de datos`);
      } catch (error) {
        alert('❌ Error sincronizando datos con la base de datos');
      }
    } else {
      alert('ℹ️ No hay datos de GeoServer para sincronizar');
    }
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
      />

      {/* Formulario de edificio - ÚNICA INSTANCIA */}
      <BuildingForm 
        onSave={handleSaveBuilding}
        onCancel={handleCancelEdit}
        isVisible={showBuildingForm}
        building={editingBuilding}
        isEditing={!!editingBuilding}
      />
      
      {/* Lista de edificios para editar */}
      {showBuildingList && (
        <BuildingList 
          buildings={buildings}
          onEditBuilding={handleEditBuilding}
          onDeleteBuilding={handleDeleteBuilding}
          onClose={handleCloseBuildingList}
        />
      )}

      <div className="Mapa">
        <div ref={mapRef} className="map-container"></div>
        
        {!isMapReady && (
          <div className="loading-message">
            🗺️ Cargando mapa...
          </div>
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
            ⏳ Cargando edificios desde la base de datos...
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
      </div>
    </div>
  );
}

export default Map;