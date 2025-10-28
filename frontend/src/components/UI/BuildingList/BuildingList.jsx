// components/UI/BuildingList/BuildingList.jsx
import React, { useState } from 'react';
import './BuildingList.css';

function BuildingList({ 
  buildings, 
  onEditBuilding, 
  onDeleteBuilding, 
  onClose, 
  onEditRoom, 
  onCreateRooms,
  onDeleteRoom,
  onReload
}) {
  const [deletingId, setDeletingId] = useState(null);
  const [expandedBuilding, setExpandedBuilding] = useState(null);
  const [deletingRoomId, setDeletingRoomId] = useState(null);

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

  const toggleBuildingExpansion = (buildingId) => {
    setExpandedBuilding(expandedBuilding === buildingId ? null : buildingId);
  };

  const handleCreateRooms = (building) => {
    if (onCreateRooms) {
      onCreateRooms(building);
    }
    onClose(); // Cerrar BuildingList al abrir RoomManagement
  };

  const handleEditRoom = (room) => {
    if (onEditRoom) {
      onEditRoom(room);
      onClose(); // Cerrar BuildingList al abrir RoomManagement
    }
  };

  // ✅ FUNCIÓN CORREGIDA PARA ELIMINAR SALAS
  const handleDeleteRoom = async (room, building) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar la sala "${room.nombre_sala}"?\n\n` +
      `Edificio: ${building.nombre}\n` +
      `Piso: ${room.piso}\n` +
      `Tipo: ${room.tipo_sala}\n\n` +
      `Esta acción no se puede deshacer.`
    );

    if (!confirmDelete) {
      return;
    }

    setDeletingRoomId(room.id);
    
    try {
      if (onDeleteRoom) {
        await onDeleteRoom(room.id);
        alert(`✅ Sala "${room.nombre_sala}" eliminada exitosamente`);
        
        // Recargar los datos si se proporciona la función
        if (onReload) {
          await onReload();
        }
      } else {
        alert('❌ Función de eliminación de salas no disponible');
      }
    } catch (error) {
      alert(`❌ Error al eliminar la sala: ${error.message}`);
    } finally {
      setDeletingRoomId(null);
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
                const isExpanded = expandedBuilding === buildingId;
                const salas = building.salas || [];
                
                return (
                  <div 
                    key={buildingId}
                    className={`building-card ${isExpanded ? 'expanded' : ''}`}
                  >
                    <div className="building-info">
                      <div className="building-header">
                        <h3>🏛️ {building.nombre}</h3>
                        <button 
                          className="expand-btn"
                          onClick={() => toggleBuildingExpansion(buildingId)}
                        >
                          {isExpanded ? '▼' : '▶'}
                        </button>
                      </div>
                      <p className="building-description">{building.descripcion}</p>
                      <div className="building-meta">
                        <span className="building-type">{building.tipo || 'Sin tipo'}</span>
                        <span className="building-id">ID: {buildingId}</span>
                        <span className="rooms-count">
                          {salas.length} sala{salas.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Sección de Salas (expandible) */}
                    {isExpanded && (
                      <div className="rooms-section">
                        <div className="rooms-header">
                          <h4>🏢 Salas del Edificio ({salas.length})</h4>
                          <button 
                            className="add-room-btn"
                            onClick={() => handleCreateRooms(building)}
                          >
                            + Agregar Sala
                          </button>
                        </div>
                        
                        {salas.length === 0 ? (
                          <div className="empty-rooms">
                            <p>No hay salas registradas en este edificio</p>
                            <small>Usa el botón "Agregar Sala" para crear la primera</small>
                          </div>
                        ) : (
                          <div className="rooms-list">
                            {salas.map(room => {
                              const isRoomDeleting = deletingRoomId === room.id;
                              return (
                                <div key={room.id} className="room-item">
                                  <div className="room-info">
                                    <strong>{room.nombre_sala}</strong>
                                    <span className="room-details">
                                      Piso {room.piso} • {room.tipo_sala}
                                      {room.accesible_silla_ruedas && ' ♿'}
                                    </span>
                                    <span className="room-id">ID: {room.id}</span>
                                  </div>
                                  <div className="room-actions">
                                    <button 
                                      className="edit-room-btn"
                                      onClick={() => handleEditRoom(room)}
                                      title="Editar sala"
                                      disabled={isRoomDeleting}
                                    >
                                      ✏️
                                    </button>
                                    <button 
                                      className="delete-room-btn"
                                      onClick={() => handleDeleteRoom(room, building)}
                                      title="Eliminar sala"
                                      disabled={isRoomDeleting}
                                    >
                                      {isRoomDeleting ? '⏳' : '🗑️'}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="building-actions">
                      <button 
                        className="edit-btn"
                        onClick={() => onEditBuilding(building)}
                        disabled={isDeleting}
                      >
                        ✏️ Editar
                      </button>
                      <button 
                        className="manage-rooms-btn"
                        onClick={() => toggleBuildingExpansion(buildingId)}
                      >
                        {isExpanded ? '▲ Ocultar' : '▼ Ver'} Salas
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