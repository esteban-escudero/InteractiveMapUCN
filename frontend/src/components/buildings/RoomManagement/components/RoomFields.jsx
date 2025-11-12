// components/buildings/RoomManagement/components/RoomFields.jsx
import React from "react";

const RoomFields = ({ room, index, TIPOS_SALA, onUpdateRoom }) => {
  return (
    <div className="room-fields">
      <div className="form-group">
        <label>Nombre de la Sala *</label>
        <input
          type="text"
          value={room.nombre_sala}
          onChange={(e) => onUpdateRoom(index, "nombre_sala", e.target.value)}
          placeholder="Ej: Aula 101, Laboratorio Física"
          required
        />
      </div>

      <div className="form-group">
        <label>Piso *</label>
        <input
          type="number"
          min="1"
          max="20"
          value={room.piso}
          onChange={(e) => onUpdateRoom(index, "piso", e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Tipo de Sala *</label>
        <select
          value={room.tipo_sala}
          onChange={(e) => onUpdateRoom(index, "tipo_sala", e.target.value)}
          required>
          {TIPOS_SALA.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            checked={room.accesible_silla_ruedas}
            onChange={(e) =>
              onUpdateRoom(index, "accesible_silla_ruedas", e.target.checked)
            }
          />
          Accesible para silla de ruedas
        </label>
      </div>
    </div>
  );
};

export default RoomFields;
