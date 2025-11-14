import React from "react";

const BuildingDetailsSection = ({ formData, onInputChange }) => {
  return (
    <>
      <div className="form-group">
        <label>Nombre del Edificio *</label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={onInputChange}
          placeholder="Ej: Departamento de Ingeniería"
          required
        />
      </div>

      <div className="form-group">
        <label>Descripción</label>
        <textarea
          name="descripcion"
          value={formData.descripcion}
          onChange={onInputChange}
          placeholder="Descripción del edificio..."
          rows="3"
        />
      </div>
    </>
  );
};

export default BuildingDetailsSection;
