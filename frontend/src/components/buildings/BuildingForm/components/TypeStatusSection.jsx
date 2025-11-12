// components/buildings/BuildingForm/components/TypeStatusSection.jsx
import React from "react";
import {
  tiposEdificio,
  estadosEdificio,
} from "../../../shared/constants/constants.ts";

const TypeStatusSection = ({ formData, onInputChange }) => {
  return (
    <div className="form-row">
      <div className="form-group">
        <label>Tipo de Edificio *</label>
        <select
          name="tipo"
          value={formData.tipo}
          onChange={onInputChange}
          required>
          {tiposEdificio.map((tipo) => (
            <option key={tipo.value} value={tipo.value}>
              {tipo.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Estado *</label>
        <select
          name="estado"
          value={formData.estado}
          onChange={onInputChange}
          required>
          {estadosEdificio.map((estado) => (
            <option key={estado.value} value={estado.value}>
              {estado.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TypeStatusSection;
