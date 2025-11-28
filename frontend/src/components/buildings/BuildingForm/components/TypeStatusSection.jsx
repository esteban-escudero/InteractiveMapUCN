import React from "react";
import {
  tiposEdificio,
  estadosEdificio,
} from "../../../../constants/constants.ts";
import "./TypeStatusSection.css";

const TypeStatusSection = ({ formData, onInputChange }) => {
  const selectedTipo = tiposEdificio.find(t => t.value === formData.tipo);
  const selectedEstado = estadosEdificio.find(e => e.value === formData.estado);

  return (
    <div className="form-row">
      <div className="form-group">
        <label>Tipo de Edificio *</label>
        <select
          name="tipo"
          value={formData.tipo}
          onChange={onInputChange}
          required>
          <option value="">Seleccionar...</option>
          {tiposEdificio.map((tipo) => (
            <option key={tipo.value} value={tipo.value}>
              {tipo.label}
            </option>
          ))}
        </select>
        {selectedTipo && (
          <div className="icon-preview">
            <span className="material-icons">{selectedTipo.icon}</span>
            <span>{selectedTipo.label}</span>
          </div>
        )}
      </div>

      <div className="form-group">
        <label>Estado *</label>
        <select
          name="estado"
          value={formData.estado}
          onChange={onInputChange}
          required>
          <option value="">Seleccionar...</option>
          {estadosEdificio.map((estado) => (
            <option key={estado.value} value={estado.value}>
              {estado.label}
            </option>
          ))}
        </select>
        {selectedEstado && (
          <div className="icon-preview">
            <span className="material-icons">{selectedEstado.icon}</span>
            <span>{selectedEstado.label}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TypeStatusSection;


