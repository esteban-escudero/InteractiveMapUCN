// components/routes/RouteForm/components/RouteFormUI.jsx
import React from "react";
import MapSelectionSection from "./MapSelectionSection";
import RouteDetailsSection from "./RouteDetailsSection";
import FormActions from "./FormActions";

const RouteFormUI = ({
  formData,
  existingNodes,
  isEditing,
  mapAvailable,
  selectionActive,
  onInputChange,
  onActivateMapSelection,
  onClearPoints,
  onRemoveLastPoint,
  onSubmit,
  onCancel,
  onFinishWithESC,
}) => {
  return (
    <div className="route-form-overlay">
      <div className="route-form-container">
        <div className="route-form-header">
          <h3>
            <span className="material-icons">
              {isEditing ? "edit_road" : "add_road"}
            </span>
            {isEditing ? "Editar Ruta" : "Crear Ruta"}
          </h3>
          <button className="close-btn" onClick={onCancel}>
            <span className="material-icons">close</span>
          </button>
        </div>

        <form onSubmit={onSubmit} className="route-form">
          {/* Información básica */}
          <div className="form-group">
            <label>Nombre de la Ruta (opcional)</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={onInputChange}
              placeholder="Dejar vacío para nombre automático"
            />
          </div>

          <div className="form-group">
            <label>Tipo de Ruta</label>
            <select name="tipo" value={formData.tipo} onChange={onInputChange}>
              <option value="accesible">Accesible</option>
              <option value="emergencia">Emergencia</option>
              <option value="peatonal">Peatonal</option>
              <option value="rapida">Rápida</option>
              <option value="vehicular">Vehicular</option>
            </select>
          </div>

          {/* Selección en mapa */}
          <MapSelectionSection
            formData={formData}
            existingNodes={existingNodes}
            mapAvailable={mapAvailable}
            selectionActive={selectionActive}
            onActivateMapSelection={onActivateMapSelection}
            onClearPoints={onClearPoints}
            onRemoveLastPoint={onRemoveLastPoint}
            onFinishWithESC={onFinishWithESC}
          />

          {/* Detalles de la ruta */}
          {formData.geometria && <RouteDetailsSection formData={formData} />}

          {/* Acciones del formulario */}
          <FormActions
            puntosCount={formData.puntos_ruta.length}
            isEditing={isEditing}
            onCancel={onCancel}
            onSubmit={onSubmit}
          />
        </form>
      </div>
    </div>
  );
};

export default RouteFormUI;
