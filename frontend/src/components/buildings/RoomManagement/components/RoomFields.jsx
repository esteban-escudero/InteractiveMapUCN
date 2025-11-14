// components/buildings/RoomManagement/components/RoomFields.jsx
import React from "react";

const RoomFields = ({
  room,
  index,
  TIPOS_SALA,
  onUpdateRoom,
  isEditing,
  roomsCount,
  onRemoveRoom,
}) => {
  return (
    <div className="room-form-container">
      {/* HEADER CON BOTÓN DE ELIMINAR DENTRO DE LA TARJETA */}
      <div className="room-form-header">
        <h2 className="room-form-title">
          {isEditing ? `Editando: ${room.nombre_sala}` : `Sala ${index + 1}`}
          {room.id && <span className="room-id"> (ID: {room.id})</span>}
        </h2>
        {!isEditing && roomsCount > 1 && (
          <button
            type="button"
            onClick={() => onRemoveRoom(index)}
            className="remove-room-btn"
            title="Eliminar sala">
            ✕
          </button>
        )}
      </div>

      {/* GRID DE CAMPOS */}
      <div className="room-fields-grid">
        {/* Nombre de la Sala */}
        <div className="form-field-group">
          <label className="field-label">Nombre de la Sala *</label>
          <input
            type="text"
            value={room.nombre_sala}
            onChange={(e) => onUpdateRoom(index, "nombre_sala", e.target.value)}
            placeholder="Ej: Aula 101, Laboratorio Física"
            className="field-input"
            required
          />
        </div>

        {/* Piso */}
        <div className="form-field-group">
          <label className="field-label">Piso *</label>
          <input
            type="number"
            min="1"
            max="20"
            value={room.piso}
            onChange={(e) => onUpdateRoom(index, "piso", e.target.value)}
            className="field-input"
            required
          />
        </div>

        {/* Tipo de Sala */}
        <div className="form-field-group">
          <label className="field-label">Tipo de Sala *</label>
          <select
            value={room.tipo_sala}
            onChange={(e) => onUpdateRoom(index, "tipo_sala", e.target.value)}
            className="field-select"
            required>
            {TIPOS_SALA.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>

        {/* Accesible */}
        <div className="checkbox-field-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={room.accesible_silla_ruedas}
              onChange={(e) =>
                onUpdateRoom(index, "accesible_silla_ruedas", e.target.checked)
              }
              className="checkbox-input"
            />
            Accesible para silla de ruedas
          </label>
        </div>
      </div>
    </div>
  );
};

export default RoomFields;
