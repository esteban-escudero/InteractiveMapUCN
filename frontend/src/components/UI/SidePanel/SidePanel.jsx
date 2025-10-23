import React, { useState } from 'react';
import './SidePanel.css';

const SidePanel = ({ 
  status, 
  featuresCount, 
  onLogout, 
  onSyncData,
  buildingsLoading,
  backendStatus,
  geoServerStatus,
  geoServerFeaturesCount,
  onAddBuilding,
  onEditBuildings,
  markersCount,
  onClearMarkers
}) => {
  const [activeMenu, setActiveMenu] = useState(null);

  const toggleMenu = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const handleLogout = () => {
    console.log('Cerrando sesión...');
    if (onLogout) onLogout();
  };

  const handleSyncClick = () => {
    if (onSyncData) {
      onSyncData();
    }
  };

  const handleAddBuilding = () => {
    console.log('🟢 SidePanel: Agregar Edificio clickeado');
    if (onAddBuilding) {
      onAddBuilding();
    } else {
      console.error('❌ onAddBuilding no está definido');
    }
  };

  const handleEditBuildings = () => {
    console.log('📝 SidePanel: Editar Edificios clickeado');
    if (onEditBuildings) {
      onEditBuildings();
    } else {
      console.error('❌ onEditBuildings no está definido');
      alert('La función de edición no está disponible');
    }
  };

  // ✅ CORREGIDO: Función para eliminar edificios
  const handleDeleteBuildings = () => {
    console.log('🗑️ SidePanel: Eliminar Edificios clickeado');
    if (onEditBuildings) {
      onEditBuildings(); // ✅ Misma función que "Editar Información"
    } else {
      console.error('❌ onEditBuildings no está definido');
      alert('La función de eliminación no está disponible');
    }
  };

  const getStatusStyle = () => {
    const baseStyle = {
      padding: '10px',
      borderRadius: '5px',
      textAlign: 'center',
      fontSize: '12px',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '10px'
    };

    if (backendStatus === 'error') {
      return { ...baseStyle, backgroundColor: '#e74c3c' };
    }

    switch (status) {
      case 'success': return { ...baseStyle, backgroundColor: '#2ecc71' };
      case 'empty': return { ...baseStyle, backgroundColor: '#f39c12' };
      case 'error': return { ...baseStyle, backgroundColor: '#e74c3c' };
      default: return { ...baseStyle, backgroundColor: '#3498db' };
    }
  };

  const getStatusText = () => {
    if (backendStatus === 'error') {
      return '❌ Error conectando al backend';
    }

    switch (status) {
      case 'checking': return '🔍 Conectando...';
      case 'loading': return '⏳ Cargando edificios...';
      case 'success': return `✅ ${featuresCount} edificios cargados`;
      case 'empty': return '⚠️ Base de datos vacía';
      case 'error': return '❌ Error de conexión';
      default: return 'Estado desconocido';
    }
  };

  return (
    <div className="Panel">
      <div className="dropdowns-container">
        <div className={`dropdown ${activeMenu === 'Edificios' ? 'active' : ''}`}>
          <button 
            className="dropdown-toggle"
            onClick={() => toggleMenu('Edificios')}
          >
            Edificios {activeMenu === 'Edificios' ? '▲' : '▼'}
          </button>
          {activeMenu === 'Edificios' && (
            <ul className="dropdown-menu">
              <li>
                <button onClick={handleAddBuilding}>
                  ➕ Agregar Edificio
                </button>
              </li>
              <li>
                <button onClick={handleEditBuildings}>
                  ✏️ Editar Información
                </button>
              </li>
              <li>
                {/* ✅ CORREGIDO: Ahora tiene función asignada */}
                <button onClick={handleDeleteBuildings}>
                  🗑️ Eliminar Edificio
                </button>
              </li>
            </ul>
          )}
        </div>
        
        <div className={`dropdown ${activeMenu === 'Rutas' ? 'active' : ''}`}>
          <button 
            className="dropdown-toggle"
            onClick={() => toggleMenu('Rutas')}
          >
            Rutas {activeMenu === 'Rutas' ? '▲' : '▼'}
          </button>
          {activeMenu === 'Rutas' && (
            <ul className="dropdown-menu">
              <li><button>➕ Agregar Ruta</button></li>
              <li><button>✏️ Editar Ruta</button></li>
              <li><button>🗑️ Eliminar Ruta</button></li>
            </ul>
          )}
        </div>
      </div>
      
      {/* Estado del Backend */}
      <div style={getStatusStyle()}>
        {getStatusText()}
      </div>

      {/* Información de conexión */}
      <div style={{
        padding: '8px',
        backgroundColor: backendStatus === 'connected' ? '#2c3e50' : '#e74c3c',
        borderRadius: '5px',
        fontSize: '10px',
        color: '#ecf0f1',
        marginBottom: '10px'
      }}>
        <strong>🔗 Estado del Backend:</strong><br/>
        <small>{backendStatus === 'connected' ? '✅ Conectado' : '❌ Desconectado'}</small><br/>
        <small>Edificios en DB: {featuresCount}</small>
      </div>

      {/* Estado de GeoServer */}
      <div style={{
        padding: '8px',
        backgroundColor: '#8e44ad',
        borderRadius: '5px',
        fontSize: '10px',
        color: '#ecf0f1',
        marginBottom: '10px'
      }}>
        <strong>🌐 GeoServer:</strong><br/>
        <small>Estado: {geoServerStatus}</small><br/>
        <small>Features: {geoServerFeaturesCount}</small>
      </div>

      {/* Información del campus */}
      <div style={{
        padding: '8px',
        backgroundColor: '#8e44ad',
        borderRadius: '5px',
        fontSize: '10px',
        color: '#ecf0f1',
        marginBottom: '10px'
      }}>
        <strong>📍 UCN Coquimbo</strong><br/>
        <small>Zoom: 17-19</small><br/>
        <small>Límites activos</small>
      </div>
      
      <button className="logout-btn" onClick={handleLogout}>
        Cerrar Sesión
      </button>
    </div>
  );
};

export default SidePanel;