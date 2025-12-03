// components/buildings/BuildingList/components/RoomItem.jsx
import React from "react";

const RoomItem = ({ room, isDeleting, onEditRoom, onDeleteRoom }) => {
  const handleEditClick = () => {
    console.log("RoomItem - Editando sala:", room);
    onEditRoom(room);
  };

  return (
    <div className="room-item-horizontal">
      <div className="room-number-display">
        <strong>{room.nombre_sala}</strong>
      </div>

      <div className="room-info-display">
        <span className="room-detail-text">Piso {room.piso}</span>
        <span className="room-detail-separator">•</span>
        <span className="room-detail-text">{room.tipo_sala}</span>
      </div>

      {room.accesible_silla_ruedas && (
        <div className="accessibility-badge" title="Accesible para silla de ruedas">
          <span className="material-icons">accessible</span>
        </div>
      )}

      <div className="room-actions-horizontal">
        <button
          className="edit-room-btn-small"
          onClick={handleEditClick}
          title="Editar sala"
          disabled={isDeleting}>
          <span className="material-icons">edit</span>
        </button>
        <button
          className="delete-room-btn-small"
          onClick={() => onDeleteRoom(room)}
          title="Eliminar sala"
          disabled={isDeleting}>
          <span className="material-icons">
            {isDeleting ? "hourglass_empty" : "delete"}
          </span>
        </button>
      </div>
    </div>
  );
};

export default RoomItem;
