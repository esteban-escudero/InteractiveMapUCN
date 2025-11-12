// components/buildings/BuildingForm/hooks/useBuildingForm.js
import { useState, useEffect } from "react";
import { useCoordinateCapture } from "./useCoordinateCapture";
import { useBuildingValidation } from "./useBuildingValidation";

export const useBuildingForm = ({
  onSave,
  onCancel,
  isVisible = false,
  building = null,
  isEditing = false,
  capturedCoordinates = null,
  onClearCoordinates = () => {},
  onToggleCoordinateDetection = null,
}) => {
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    lat: "",
    lng: "",
    tipo: "Sala de Clase",
    estado: "activo",
  });

  const { isCapturing, handleCaptureCoordinates, handleClearCapture } =
    useCoordinateCapture({
      onToggleCoordinateDetection,
      onClearCoordinates,
      setFormData,
      capturedCoordinates,
    });

  const { validation, validateCoordinates } = useBuildingValidation();

  // Efectos de inicialización
  useEffect(() => {
    if (isVisible) {
      if (isEditing && building) {
        initializeFormWithBuilding();
      } else {
        resetForm();
      }
    }
  }, [isVisible, isEditing, building]);

  // Efecto para coordenadas capturadas - SOLO actualizar el formulario
  useEffect(() => {
    if (capturedCoordinates) {
      console.log(
        "Coordenadas capturadas recibidas en el formulario:",
        capturedCoordinates
      );
      updateFormWithCapturedCoordinates(capturedCoordinates);
    }
  }, [capturedCoordinates]); // Removemos isCapturing de las dependencias

  const initializeFormWithBuilding = () => {
    let lat, lng;

    if (building.ubicacion && building.ubicacion.type === "Point") {
      [lng, lat] = building.ubicacion.coordinates;
    } else {
      lat = building.lat || "";
      lng = building.lng || "";
    }

    setFormData({
      nombre: building.nombre || "",
      descripcion: building.descripcion || "",
      lat: lat.toString(),
      lng: lng.toString(),
      tipo: building.tipo || "Sala de Clase",
      estado: building.estado || "activo",
    });
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      lat: "",
      lng: "",
      tipo: "Sala de Clase",
      estado: "activo",
    });
  };

  const updateFormWithCapturedCoordinates = (coordinates) => {
    console.log("Actualizando formulario con coordenadas:", coordinates);

    setFormData((prev) => ({
      ...prev,
      lat: coordinates.lat.toString(),
      lng: coordinates.lng.toString(),
    }));

    validateCoordinates(coordinates.lat, coordinates.lng);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validar coordenadas en tiempo real
    if ((name === "lat" || name === "lng") && formData.lat && formData.lng) {
      validateCoordinates(
        name === "lat" ? value : formData.lat,
        name === "lng" ? value : formData.lng
      );
    }
  };

  const handleCoordinateChange = (coordType, value) => {
    setFormData((prev) => ({
      ...prev,
      [coordType]: value,
    }));

    // Validar cuando ambos campos están llenos
    const otherCoord = coordType === "lat" ? formData.lng : formData.lat;
    if (value && otherCoord) {
      validateCoordinates(
        coordType === "lat" ? value : otherCoord,
        coordType === "lng" ? value : otherCoord
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const buildingData = prepareBuildingData();

    try {
      await onSave(buildingData);
      handleClearCapture();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar el edificio: " + error.message);
    }
  };

  const validateForm = () => {
    if (!formData.nombre.trim()) {
      alert("El nombre del edificio es requerido");
      return false;
    }

    if (!formData.lat || !formData.lng) {
      alert("Las coordenadas son requeridas");
      return false;
    }

    const lat = parseFloat(formData.lat);
    const lng = parseFloat(formData.lng);

    if (isNaN(lat) || isNaN(lng)) {
      alert("Las coordenadas deben ser números válidos");
      return false;
    }

    return true;
  };

  const prepareBuildingData = () => {
    const lat = parseFloat(formData.lat);
    const lng = parseFloat(formData.lng);

    return {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim(),
      lat: lat,
      lng: lng,
      tipo: formData.tipo,
      estado: formData.estado,
      ubicacion: {
        type: "Point",
        coordinates: [lng, lat],
      },
    };
  };

  const handleCancel = () => {
    console.log("Cancelando formulario...");
    handleClearCapture();
    onCancel();
  };

  return {
    formData,
    validation,
    isCapturing,
    handleInputChange,
    handleCoordinateChange,
    handleCaptureCoordinates,
    handleSubmit,
    handleCancel,
    isEditing,
  };
};
