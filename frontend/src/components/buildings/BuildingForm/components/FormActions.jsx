import React from "react";

const FormActions = ({ formData, isEditing, onCancel, onSubmit }) => {
  const isFormValid = formData.nombre.trim() && formData.lat && formData.lng;

  return (
    <div className="form-actions">
      <button type="button" className="cancel-btn" onClick={onCancel}>
        <span className="material-icons">cancel</span>
        Cancelar
      </button>
      <button type="submit" className="save-btn" disabled={!isFormValid}>
        <span className="material-icons">add_circle</span>
        {isEditing ? "Actualizar" : "Crear"} Edificio
      </button>
    </div>
  );
};

export default FormActions;
