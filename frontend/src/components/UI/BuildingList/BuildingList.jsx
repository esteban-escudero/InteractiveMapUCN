// components/UI/BuildingList/BuildingList.jsx
import React, { useState } from 'react';
import './BuildingList.css';

function BuildingList({ buildings, onEditBuilding, onDeleteBuilding, onClose }) {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (building) => {
    const buildingId = building.id || building._id || building.id_edificio;
    const buildingName = building.nombre;
    
    if (!window.confirm(
      `⚠️ ¿ESTÁS SEGURO DE QUE QUIERES ELIMINAR PERMANENTEMENTE?\n\n` +
      `Edificio: ${buildingName}\n` +
      `ID: ${buildingId}\n\n` +
      `🚨 ESTA ACCIÓN NO SE PUEDE DESHACER 🚨\n\n` +
      `Escribe "ELIMINAR" para confirmar:`
    )) {
      return;
    }

    const userInput = prompt(
      `Para confirmar la eliminación permanente de "${buildingName}", escribe ELIMINAR:`
    );

    if (userInput !== 'ELIMINAR') {
      alert('❌ Eliminación cancelada. No se escribió "ELIMINAR" correctamente.');
      return;
    }

    setDeletingId(buildingId);
    
    try {
      await onDeleteBuilding(building);
      alert(`✅ Edificio "${buildingName}" eliminado permanentemente`);
    } catch (error) {
      alert(`❌ Error al eliminar el edificio: ${error.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="building-list-overlay">
      <div className="building-list-modal">
        <div className="building-list-header">
          <h2>📝 Gestionar Edificios</h2>
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
              {buildings.map(building => {
                const buildingId = building.id || building._id || building.id_edificio;
                const isDeleting = deletingId === buildingId;
                
                return (
                  <div 
                    key={buildingId}
                    className="building-card"
                  >
                    <div className="building-info">
                      <h3>🏛️ {building.nombre}</h3>
                      <p className="building-description">{building.descripcion}</p>
                      <div className="building-meta">
                        <span className="building-type">{building.tipo || 'Sin tipo'}</span>
                        <span className="building-id">ID: {buildingId}</span>
                      </div>
                    </div>
                    <div className="building-actions">
                      <button 
                        className="edit-btn"
                        onClick={() => onEditBuilding(building)}
                        disabled={isDeleting}
                      >
                        ✏️ Editar
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => handleDelete(building)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? '🗑️ Eliminando...' : '🗑️ Eliminar'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="building-list-footer">
          <p>Total: {buildings.length} edificio(s)</p>
          <small style={{color: '#e74c3c', marginTop: '5px'}}>
            ⚠️ La eliminación es permanente e irreversible
          </small>
        </div>
      </div>
    </div>
  );
}

export default BuildingList;