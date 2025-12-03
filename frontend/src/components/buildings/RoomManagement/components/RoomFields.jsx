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
    <div className="room-list-item-editable">
      {/* Nombre de la Sala */}
      <div className="room-field-inline room-name-field">
        <input
          type="text"
          value={room.nombre_sala}
          onChange={(e) => onUpdateRoom(index, "nombre_sala", e.target.value)}
          placeholder="Nombre de la sala"
          className="field-input-inline"
          required
        />
      </div>

      {/* Piso */}
      <div className="room-field-inline room-floor-field">
        <label className="field-label-inline">Piso</label>
        <input
          type="number"
          min="1"
          max="20"
          value={room.piso}
          onChange={(e) => onUpdateRoom(index, "piso", e.target.value)}
          className="field-input-inline field-input-small"
          required
        />
      </div>

      {/* Tipo de Sala */}
      <div className="room-field-inline room-type-field">
        <select
          value={room.tipo_sala}
          onChange={(e) => onUpdateRoom(index, "tipo_sala", e.target.value)}
          className="field-select-inline"
          required>
          {TIPOS_SALA.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
      </div>

      {/* Accesible */}
      <div className="room-field-inline room-accessibility-field">
        <label className="checkbox-label-inline" title="Accesible para silla de ruedas">
          <input
            type="checkbox"
            checked={room.accesible_silla_ruedas}
            onChange={(e) =>
              onUpdateRoom(index, "accesible_silla_ruedas", e.target.checked)
            }
            className="checkbox-input-inline"
          />
          <span className="material-icons accessibility-icon-inline">accessible</span>
        </label>
      </div>

      {/* Botones de acción */}
      {!isEditing && roomsCount > 1 && (
        <div className="room-item-actions-inline">
          <button
            type="button"
            onClick={() => onRemoveRoom(index)}
            className="action-btn-small delete-btn-small"
            title="Eliminar sala">
            <span className="material-icons">delete</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default RoomFields;
