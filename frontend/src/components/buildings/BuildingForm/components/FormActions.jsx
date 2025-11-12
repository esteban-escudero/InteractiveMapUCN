// components/buildings/BuildingForm/components/FormActions.jsx
import React from "react";

const FormActions = ({ formData, isEditing, onCancel, onSubmit }) => {
  const isFormValid = formData.nombre.trim() && formData.lat && formData.lng;

  return (
    <div className="form-actions">
      <button type="button" className="cancel-btn" onClick={onCancel}>
        Cancelar
      </button>
      <button type="submit" className="save-btn" disabled={!isFormValid}>
        {isEditing ? "Actualizar" : "Crear"} Edificio
      </button>
    </div>
  );
};

export default FormActions;
