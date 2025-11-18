// components/buildings/BuildingList/components/RoomItem.jsx
import React from "react";

const RoomItem = ({ room, isDeleting, onEditRoom, onDeleteRoom }) => {
  const handleEditClick = () => {
    console.log("✏️ RoomItem - Editando sala:", room);
    onEditRoom(room);
  };
  return (
    <div className="room-item">
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
      </div>
      <div className="room-actions">
        <button
          className="edit-room-btn"
          onClick={handleEditClick}
          title="Editar sala"
          disabled={isDeleting}>
          <span className="material-icons">edit</span>
        </button>
        <button
          className="delete-room-btn"
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
