import React from "react";
import BuildingDetailsSection from "./BuildingDetailsSection";
import CoordinateSection from "./CoordinateSection";
import TypeStatusSection from "./TypeStatusSection";
import FloorImageSection from "./FloorImageSection";
import FormActions from "./FormActions";

const BuildingFormUI = ({
  formData,
  validation,
  isEditing,
  capturedCoordinates,
  onInputChange,
  onCoordinateChange,
  onCaptureCoordinates,
  onClearCoordinates,
  onSubmit,
  onCancel,
  floorImageSectionRef,
}) => {
  return (
    <div className="building-form-overlay">
      <div className="building-form-container">
        <div className="building-form-header">
          <h3>
            <span className="material-icons">{isEditing ? "edit" : "add"}</span>
            {isEditing ? "Editar Edificio" : "Crear Edificio"}
          </h3>
          <button className="close-btn" onClick={onCancel}>
            <span className="material-icons">close</span>
          </button>
        </div>

        <form onSubmit={onSubmit} className="building-form">
          {/* Detalles del edificio */}
          <BuildingDetailsSection
            formData={formData}
            onInputChange={onInputChange}
          />

          {/* Sección de coordenadas */}
          <CoordinateSection
            formData={formData}
            validation={validation}
            capturedCoordinates={capturedCoordinates}
            onCoordinateChange={onCoordinateChange}
            onCaptureCoordinates={onCaptureCoordinates}
            onClearCoordinates={onClearCoordinates}
          />

          {/* Tipo y estado */}
          <TypeStatusSection
            formData={formData}
            onInputChange={onInputChange}
          />

          {/* Imágenes por piso */}
          <FloorImageSection
            ref={floorImageSectionRef}
            buildingId={formData.id}
            buildingName={formData.nombre}
            isEditing={isEditing}
          />

          {/* Acciones del formulario */}
          <FormActions
            formData={formData}
            isEditing={isEditing}
            onCancel={onCancel}
            onSubmit={onSubmit}
          />
        </form>
      </div>
    </div>
  );
};

export default BuildingFormUI;
