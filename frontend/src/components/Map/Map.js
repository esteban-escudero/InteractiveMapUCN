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
  const [mapUpdateCount, setMapUpdateCount] = useState(0); // ✅ Para debugging
  
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

  // ✅ FUNCIÓN MEJORADA: Para guardar/actualizar edificio
  const handleSaveBuilding = async (buildingData) => {
    try {
      if (editingBuilding) {
        const buildingId = editingBuilding.id || editingBuilding._id || editingBuilding.id_edificio;
        console.log('🆔 Actualizando edificio ID:', buildingId);
        
        await buildingService.updateBuilding(buildingId, buildingData);
        alert('✅ Edificio actualizado exitosamente');
        
      } else {
        await buildingService.createBuilding(buildingData);
        alert('✅ Edificio guardado exitosamente');
      }
      
      // ✅ FORZAR ACTUALIZACIÓN INMEDIATA DEL MAPA
      console.log('🔄 Recargando edificios para actualizar mapa...');
      await loadBuildings(); // Esto actualizará el estado 'buildings'
      
      setEditingBuilding(null);
      setShowBuildingForm(false);
      
      console.log('✅ Operación completada, mapa debería actualizarse');
      
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

  // ✅ FUNCIÓN MEJORADA: Para manejar eliminación PERMANENTE
  const handleDeleteBuilding = async (building) => {
    try {
      const buildingId = building.id || building._id || building.id_edificio;
      const buildingName = building.nombre;
      console.log('🗑️ Eliminando edificio:', buildingName, 'ID:', buildingId);
      
      await deleteBuilding(buildingId);
      
      // ✅ EL MAPA SE ACTUALIZARÁ AUTOMÁTICAMENTE porque 'buildings' cambió
      console.log('✅ Edificio eliminado, mapa se actualizará automáticamente');
      
    } catch (error) {
      console.error('Error eliminando edificio:', error);
      throw error;
    }
  };

  // ✅ EFECTO PRINCIPAL MEJORADO: Procesar edificios y actualizar mapa
  useEffect(() => {
    if (!mapInstance) {
      console.log('⏳ Mapa no listo, esperando inicialización...');
      return;
    }

    console.log(`🔄 [Actualización #${mapUpdateCount}] Procesando ${buildings.length} edificios`);
    
    // Limpiar TODAS las capas anteriores
    buildingLayers.forEach(layer => {
      mapInstance.removeLayer(layer);
    });

    const newLayers = [];

    buildings.forEach(building => {
      if (!building.ubicacion) {
        console.warn('⚠️ Edificio sin ubicación:', building.nombre);
        return;
      }

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

        console.log('📍 Capa agregada para:', building.nombre);

      } catch (error) {
        console.error(`❌ Error procesando edificio ${building.nombre}:`, error);
      }
    });

    setBuildingLayers(newLayers);
    setMapUpdateCount(prev => prev + 1);
    
    console.log(`✅ [Actualización #${mapUpdateCount}] Mapa actualizado: ${newLayers.length} edificios mostrados`);

  }, [mapInstance, buildings]); // ✅ Se ejecuta cuando cambian los edificios O el mapa

  // ✅ DEBUG: Verificar cambios en edificios
  useEffect(() => {
    console.log('🏢 Estado de edificios actualizado:', {
      count: buildings.length,
      buildings: buildings.map(b => ({
        id: b.id || b._id || b.id_edificio,
        nombre: b.nombre,
        tieneUbicacion: !!b.ubicacion
      }))
    });
  }, [buildings]);

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
        
        // ✅ ACTUALIZAR MAPA después de sincronización
        await loadBuildings();
        
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

      {/* Formulario de edificio */}
      <BuildingForm 
        onSave={handleSaveBuilding}
        onCancel={handleCancelEdit}
        isVisible={showBuildingForm}
        building={editingBuilding}
        isEditing={!!editingBuilding}
      />
      
      {/* Lista de edificios para editar/eliminar */}
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

        {/* ✅ Indicador de actualización del mapa */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          right: '10px',
          background: 'rgba(52, 152, 219, 0.8)',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '5px',
          fontSize: '12px',
          zIndex: 1000
        }}>
          🗺️ Capas: {buildingLayers.length}
        </div>
      </div>
    </div>
  );
}

export default Map;