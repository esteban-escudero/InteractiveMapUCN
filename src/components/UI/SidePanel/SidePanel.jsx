import React, { useState } from 'react';

const SidePanel = ({ status, featuresCount, onLogout }) => {
  const [activeMenu, setActiveMenu] = useState(null);

  const toggleMenu = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const handleLogout = () => {
    console.log('Cerrando sesión...');
    if (onLogout) onLogout();
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

    switch (status) {
      case 'success': return { ...baseStyle, backgroundColor: '#2ecc71' };
      case 'empty': return { ...baseStyle, backgroundColor: '#f39c12' };
      case 'error': return { ...baseStyle, backgroundColor: '#e74c3c' };
      default: return { ...baseStyle, backgroundColor: '#3498db' };
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'checking': return '🔍 Conectando...';
      case 'loading': return '⏳ Cargando edificios...';
      case 'success': return `✅ ${featuresCount} edificios cargados`;
      case 'empty': return '⚠️ Capa sin datos';
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
              <li><button>Ingresar Edificio</button></li>
              <li><button>Editar Información Edificio</button></li>
              <li><button>Eliminar Edificio</button></li>
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
              <li><button>Ingresar Rutas</button></li>
              <li><button>Editar Información Rutas</button></li>
              <li><button>Eliminar Rutas</button></li>
            </ul>
          )}
        </div>

        <div className={`dropdown ${activeMenu === 'Salas' ? 'active' : ''}`}>
          <button 
            className="dropdown-toggle"
            onClick={() => toggleMenu('Salas')}
          >
            Salas {activeMenu === 'Salas' ? '▲' : '▼'}
          </button>
          {activeMenu === 'Salas' && (
            <ul className="dropdown-menu">
              <li><button>Ingresar Salas</button></li>
              <li><button>Editar Información Salas</button></li>
              <li><button>Eliminar Salas</button></li>
            </ul>
          )}
        </div>
      </div>
      
      <div style={getStatusStyle()}>
        {getStatusText()}
      </div>

      <div style={{
        padding: '8px',
        backgroundColor: '#2c3e50',
        borderRadius: '5px',
        fontSize: '10px',
        color: '#ecf0f1',
        marginBottom: '10px'
      }}>
        <strong>Capa actual:</strong><br/>
        InteractiveMap:edificio<br/>
        <strong>Features:</strong> {featuresCount}
      </div>

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