import React from "react";
import "./BuildingForm.css";
import { useBuildingForm } from "./hooks/useBuildingForm";
import BuildingFormUI from "./components/BuildingFormUI";

const BuildingForm = ({
  onSave,
  onCancel,
  isVisible = false,
  building = null,
  isEditing = false,
  capturedCoordinates = null,
  onClearCoordinates = () => {},
  onToggleCoordinateDetection = null,
}) => {
  const {
    formData,
    validation,
    isCapturing,
    handleInputChange,
    handleCoordinateChange,
    handleCaptureCoordinates,
    handleSubmit,
    handleCancel,
    isEditing: editing,
  } = useBuildingForm({
    onSave,
    onCancel,
    isVisible,
    building,
    isEditing,
    capturedCoordinates,
    onClearCoordinates,
    onToggleCoordinateDetection,
  });

  // SOLO ocultar durante captura activa, no cuando ya tenemos coordenadas
  if (isCapturing) {
    console.log("Modo captura activo - ocultando formulario");
    return null;
  }

  // Si el formulario no es visible, no mostrar nada
  if (!isVisible) {
    console.log("Formulario no visible");
    return null;
  }

  console.log("Mostrando formulario de edificio", {
    isCapturing,
    isVisible,
    hasCoordinates: !!capturedCoordinates,
  });

  return (
    <BuildingFormUI
      formData={formData}
      validation={validation}
      isEditing={editing}
      capturedCoordinates={capturedCoordinates}
      onInputChange={handleInputChange}
      onCoordinateChange={handleCoordinateChange}
      onCaptureCoordinates={handleCaptureCoordinates}
      onClearCoordinates={onClearCoordinates}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
    />
  );
};

export default BuildingForm;
