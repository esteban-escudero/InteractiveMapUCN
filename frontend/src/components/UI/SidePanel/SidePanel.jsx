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
  onToggleCoordinateDetection,
  coordinateDetectionActive = false,
  onManageRooms,
  // ✅ NUEVAS PROPS PARA GESTIÓN DE SALAS
  onEditRoom,
  onCreateRooms
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

  // ✅Función para eliminar edificios
  const handleDeleteBuildings = () => {
    console.log('🗑️ SidePanel: Eliminar Edificios clickeado');
    if (onEditBuildings) {
      onEditBuildings(); // ✅ Misma función que "Editar Información"
    } else {
      console.error('❌ onEditBuildings no está definido');
      alert('La función de eliminación no está disponible');
    }
  };

  // ✅Manejar toggle de detección de coordenadas
  const handleToggleCoordinateDetection = () => {
    console.log('📍 Botón detección de coordenadas clickeado');
    if (onToggleCoordinateDetection) {
      onToggleCoordinateDetection();
    } else {
      console.error('❌ onToggleCoordinateDetection no está definido');
    }
  };

  // ✅NUEVA: Manejar gestión de salas - CREAR NUEVAS
  const handleManageRooms = () => {
    console.log('🚪 SidePanel: Gestionar Salas clickeado');
    if (onManageRooms) {
      onManageRooms();
    } else {
      console.error('❌ onManageRooms no está definido');
      alert('La función de gestión de salas no está disponible');
    }
  };

  // ✅NUEVA: Manejar edición de salas existentes
  const handleEditRooms = () => {
    console.log('✏️ SidePanel: Editar Salas clickeado');
    if (onEditBuildings) {
      // Abrir BuildingList para editar salas desde allí
      onEditBuildings();
    } else {
      console.error('❌ onEditBuildings no está definido');
      alert('Abre la gestión de edificios para editar salas');
    }
  };

  // ✅NUEVA: Manejar creación de salas para edificio específico
  const handleCreateRoomsForBuilding = () => {
    console.log('➕ SidePanel: Crear Salas para Edificio clickeado');
    if (onEditBuildings) {
      // Abrir BuildingList para seleccionar edificio
      onEditBuildings();
    } else {
      console.error('❌ onEditBuildings no está definido');
      alert('Abre la gestión de edificios para crear salas');
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
            🏢 Edificios {activeMenu === 'Edificios' ? '▲' : '▼'}
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
                  ✏️ Gestionar Edificios
                </button>
              </li>
            </ul>
          )}
        </div>
        
        {/* ✅ DROPDOWN PARA SALAS ACTUALIZADO */}
        <div className={`dropdown ${activeMenu === 'Salas' ? 'active' : ''}`}>
          <button 
            className="dropdown-toggle"
            onClick={() => toggleMenu('Salas')}
          >
            🚪 Salas {activeMenu === 'Salas' ? '▲' : '▼'}
          </button>
          {activeMenu === 'Salas' && (
            <ul className="dropdown-menu">
              <li>
                <button onClick={handleManageRooms}>
                  ➕ Crear Nuevas Salas
                </button>
              </li>
              <li>
                <button onClick={handleEditRooms}>
                  ✏️ Gestionar Salas Existentes
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
            🗺️ Rutas {activeMenu === 'Rutas' ? '▲' : '▼'}
          </button>
          {activeMenu === 'Rutas' && (
            <ul className="dropdown-menu">
              <li><button onClick={() => alert('Funcionalidad en desarrollo')}>➕ Agregar Ruta</button></li>
              <li><button onClick={() => alert('Funcionalidad en desarrollo')}>✏️ Editar Ruta</button></li>
              <li><button onClick={() => alert('Funcionalidad en desarrollo')}>🗑️ Eliminar Ruta</button></li>
            </ul>
          )}
        </div>
      </div>

      {/* ✅ BOTÓN: Detección de coordenadas */}
      <div className="coordinate-detection-section">
        <button 
          className={`coordinate-detection-btn ${coordinateDetectionActive ? 'active' : ''}`}
          onClick={handleToggleCoordinateDetection}
        >
          {coordinateDetectionActive ? '📍 Capturando...' : '📍 Capturar Coordenadas'}
        </button>
        {coordinateDetectionActive && (
          <small style={{color: '#e74c3c', display: 'block', textAlign: 'center', marginTop: '5px'}}>
            Haz clic en el mapa
          </small>
        )}
      </div>

      

      <button className="logout-btn" onClick={handleLogout}>
        Cerrar Sesión
      </button>
    </div>
  );
};

export default SidePanel;