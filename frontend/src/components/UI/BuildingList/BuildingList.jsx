// components/UI/BuildingList/BuildingList.jsx
import React from 'react';
import './BuildingList.css';

function BuildingList({ buildings, onEditBuilding, onClose }) {
  // ✅ DEBUG: Ver la estructura real de los edificios
  React.useEffect(() => {
    if (buildings.length > 0) {
      console.log('🏢 Estructura del primer edificio:', buildings[0]);
      console.log('🔍 Todos los IDs disponibles:', buildings.map(b => ({
        id: b.id,
        _id: b._id,
        id_edificio: b.id_edificio,
        nombre: b.nombre
      })));
    }
  }, [buildings]);
  return (
    <div className="building-list-overlay">
      <div className="building-list-modal">
        <div className="building-list-header">
          <h2>📝 Editar Edificios</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="building-list-content">
          {buildings.length === 0 ? (
            <div className="empty-state">
              <p>🏗️ No hay edificios registrados</p>
              <small>Crea el primer edificio usando el botón "Agregar Edificio"</small>
            </div>
          ) : (
            <div className="buildings-grid">
              {buildings.map(building => (
                <div 
                  key={building.id || building._id || building.id_edificio} // ✅ KEY ÚNICA
                  className="building-card"
                >
                  <div className="building-info">
                    <h3>🏛️ {building.nombre}</h3>
                    <p className="building-description">{building.descripcion}</p>
                    <div className="building-meta">
                      <span className="building-type">{building.tipo || 'Sin tipo'}</span>
                      <span className="building-id">
                        ID: {building.id || building._id || building.id_edificio}
                      </span>
                    </div>
                  </div>
                  <div className="building-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => onEditBuilding(building)}
                    >
                      ✏️ Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="building-list-footer">
          <p>Total: {buildings.length} edificio(s)</p>
        </div>
      </div>
    </div>
  );
}

export default BuildingList;