// components/routes/RouteForm/components/FormActions.jsx
import React from "react";

const FormActions = ({ puntosCount, isEditing, onCancel, onSubmit }) => {
  return (
    <div className="form-actions">
      <button type="button" className="cancel-btn" onClick={onCancel}>
        Cancelar
      </button>
      <button type="submit" className="save-btn" disabled={puntosCount < 2}>
        {isEditing ? "Actualizar" : "Crear"} Ruta
      </button>
    </div>
  );
};

export default FormActions;
