import React, { useState } from "react";
import { useNotification } from "../../../hooks/useNotification";
import Notification from "../Notification/Notification";
import "./BuildingList.css";

function BuildingList({
  buildings,
  onEditBuilding,
  onDeleteBuilding,
  onClose,
  onEditRoom,
  onCreateRooms,
  onDeleteRoom,
  onReload,
}) {
  const [deletingId, setDeletingId] = useState(null);
  const [expandedBuilding, setExpandedBuilding] = useState(null);
  const [deletingRoomId, setDeletingRoomId] = useState(null);
  const { notification, showNotification, hideNotification } =
    useNotification();

  const handleDelete = async (building) => {
    const buildingId = building.id || building._id || building.id_edificio;
    const buildingName = building.nombre;

    setDeletingId(buildingId);

    try {
      await onDeleteBuilding(building);
      // Las notificaciones de éxito/error se manejan en Map.js
    } catch (error) {
      // Los errores se manejan en Map.js
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
    onClose();
  };

  const handleEditRoom = (room) => {
    if (onEditRoom) {
      onEditRoom(room);
      onClose();
    }
  };

  // FUNCIÓN PARA ELIMINAR SALAS
  const handleDeleteRoom = async (room, building) => {
    setDeletingRoomId(room.id);

    try {
      if (onDeleteRoom) {
        await onDeleteRoom(room.id);
        if (onReload) {
          await onReload();
        }
      }
    } catch (error) {
      // Los errores se manejan en el componente padre
    } finally {
      setDeletingRoomId(null);
    }
  };

  return (
    <div className="building-list-overlay">
      {/* NOTIFICACIÓN GLOBAL */}
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
          duration={4000}
          position="top-right"
        />
      )}

      <div className="building-list-modal">
        <div className="building-list-header">
          <h2>
            <span className="material-icons">apartment</span>
            Gestionar Edificios
          </h2>
          <button className="close-btn" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>

        <div className="building-list-content">
          {buildings.length === 0 ? (
            <div className="empty-state">
              <p>
                <span className="material-icons">apartment</span>
                No hay edificios registrados
              </p>
              <small>
                Crea el primer edificio usando el botón "Agregar Edificio"
              </small>
            </div>
          ) : (
            <div className="buildings-grid">
              {buildings.map((building) => {
                const buildingId =
                  building.id || building._id || building.id_edificio;
                const isDeleting = deletingId === buildingId;
                const isExpanded = expandedBuilding === buildingId;
                const salas = building.salas || [];

                return (
                  <div
                    key={buildingId}
                    className={`building-card ${isExpanded ? "expanded" : ""}`}>
                    <div className="building-info">
                      <div className="building-header">
                        <h3>{building.nombre}</h3>
                        <button
                          className="expand-btn"
                          onClick={() => toggleBuildingExpansion(buildingId)}>
                          {isExpanded ? "▲" : "▼"}
                        </button>
                      </div>
                      <p className="building-description">
                        {building.descripcion}
                      </p>
                      <div className="building-meta">
                        <span className="building-type">
                          {building.tipo || "Sin tipo"}
                        </span>
                        <span className="rooms-count">
                          Salas Registradas: {salas.length} sala
                          {salas.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    {/* Sección de Salas (expandible) */}
                    {isExpanded && (
                      <div className="rooms-section">
                        <div className="rooms-header">
                          <h4>
                            <span className="material-icons">meeting_room</span>
                            Salas del Edificio ({salas.length})
                          </h4>
                          <button
                            className="add-room-btn"
                            onClick={() => handleCreateRooms(building)}>
                            <span className="material-icons">add</span>
                            Agregar Sala
                          </button>
                        </div>

                        {salas.length === 0 ? (
                          <div className="empty-rooms">
                            <p>No hay salas registradas en este edificio</p>
                            <small>
                              Usa el botón "Agregar Sala" para crear la primera
                            </small>
                          </div>
                        ) : (
                          <div className="rooms-list">
                            {salas.map((room) => {
                              const isRoomDeleting = deletingRoomId === room.id;
                              return (
                                <div key={room.id} className="room-item">
                                  <div className="room-info">
                                    <strong>{room.nombre_sala}</strong>
                                    <span className="room-details">
                                      Piso {room.piso} • {room.tipo_sala}
                                      {room.accesible_silla_ruedas && (
                                        <span
                                          className="material-icons"
                                          title="Accesible para silla de ruedas">
                                          accessible
                                        </span>
                                      )}
                                    </span>
                                    <span className="room-id">
                                      ID: {room.id}
                                    </span>
                                  </div>
                                  <div className="room-actions">
                                    <button
                                      className="edit-room-btn"
                                      onClick={() => handleEditRoom(room)}
                                      title="Editar sala"
                                      disabled={isRoomDeleting}>
                                      <span className="material-icons">
                                        edit
                                      </span>
                                    </button>
                                    <button
                                      className="delete-room-btn"
                                      onClick={() =>
                                        handleDeleteRoom(room, building)
                                      }
                                      title="Eliminar sala"
                                      disabled={isRoomDeleting}>
                                      <span className="material-icons">
                                        {isRoomDeleting
                                          ? "hourglass_empty"
                                          : "delete"}
                                      </span>
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
                        disabled={isDeleting}>
                        <span className="material-icons">edit</span>
                        Editar
                      </button>
                      <button
                        className="manage-rooms-btn"
                        onClick={() => toggleBuildingExpansion(buildingId)}>
                        {isExpanded ? "▲ Ocultar" : "▼ Ver"} Salas
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(building)}
                        disabled={isDeleting}>
                        {isDeleting ? "Eliminando..." : "Eliminar"}
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
          <small style={{ color: "#e74c3c", marginTop: "5px" }}>
            La eliminación es permanente e irreversible
          </small>
        </div>
      </div>
    </div>
  );
}

export default BuildingList;
