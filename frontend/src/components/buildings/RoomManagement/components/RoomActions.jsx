// components/buildings/RoomManagement/components/RoomActions.jsx
import React from "react";

const RoomActions = ({
  isEditing,
  selectedBuildingId,
  rooms,
  onSave,
  onUpdate,
  onDelete,
  onClose,
}) => {
  const isSaveDisabled = isEditing
    ? !selectedBuildingId || !rooms[0]?.nombre_sala.trim()
    : !selectedBuildingId || rooms.some((room) => !room.nombre_sala.trim());

  if (isEditing) {
    return (
      <div className="room-actions">
        <button type="button" onClick={onDelete} className="delete-btn">
          <span className="material-icons">delete</span>
          Eliminar
        </button>
        <div className="edit-actions">
          <button type="button" onClick={onClose} className="cancel-btn">
            <span className="material-icons">cancel</span>
            Cancelar
          </button>
          <button
            type="button"
            onClick={onUpdate}
            className="save-btn"
            disabled={isSaveDisabled}>
            <span className="material-icons">save</span>
            Actualizar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="room-actions">
      <button type="button" onClick={onClose} className="cancel-btn">
        <span className="material-icons">cancel</span>
        Cancelar
      </button>
      <button
        type="button"
        onClick={onSave}
        className="save-btn"
        disabled={isSaveDisabled}>
        <span className="material-icons">save</span>
        Guardar {rooms.length === 1 ? "1 Sala" : `${rooms.length} Salas`}
      </button>
    </div>
  );
};

export default RoomActions;
