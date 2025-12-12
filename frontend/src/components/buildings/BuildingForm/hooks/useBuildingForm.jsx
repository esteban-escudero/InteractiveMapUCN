// components/buildings/BuildingForm/hooks/useBuildingForm.js
import { useState, useEffect } from "react";
import { useCoordinateCapture } from "./useCoordinateCapture";
import { useBuildingValidation } from "./useBuildingValidation";
import { useNotification } from "hooks/common/useNotification";

export const useBuildingForm = ({
  onSave,
  onCancel,
  isVisible = false,
  building = null,
  isEditing = false,
  capturedCoordinates = null,
  onClearCoordinates = () => { },
  onToggleCoordinateDetection = null,
  floorImageSectionRef = null,
}) => {
  const [formData, setFormData] = useState({
    id: null,
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
  const { notification, showUINotification, hideNotification } = useNotification();

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
      id: building.id || null,
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
      id: null,
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
      console.log('[useBuildingForm] Guardando edificio...');
      await onSave(buildingData);
      console.log('[useBuildingForm] Edificio guardado exitosamente');

      // Subir imágenes pendientes si estamos editando
      console.log('[useBuildingForm] isEditing:', isEditing);
      console.log('[useBuildingForm] floorImageSectionRef:', floorImageSectionRef);
      console.log('[useBuildingForm] floorImageSectionRef.current:', floorImageSectionRef?.current);

      if (isEditing && floorImageSectionRef?.current) {
        console.log('[useBuildingForm] Intentando subir imágenes pendientes...');
        try {
          const result = await floorImageSectionRef.current.uploadPendingImages();
          console.log('[useBuildingForm] Resultado de subida:', result);
          if (result.uploaded > 0) {
            console.log(`✅ ${result.uploaded} plano(s) subido(s) exitosamente`);
          }
          if (result.failed > 0) {
            console.warn(`⚠️ ${result.failed} plano(s) fallaron al subir`);
          }
        } catch (error) {
          console.error("Error al subir planos:", error);
          // No bloquear el guardado del edificio por errores en las imágenes
        }
      } else {
        console.log('[useBuildingForm] No se subirán imágenes (isEditing=false o ref no disponible)');
      }

      handleClearCapture();
    } catch (error) {
      console.error("Error al guardar:", error);
      showUINotification("Error al guardar el edificio: " + error.message, "error");
    }
  };

  const validateForm = () => {
    if (!formData.nombre.trim()) {
      showUINotification("El nombre del edificio es requerido", "warning");
      return false;
    }

    if (!formData.lat || !formData.lng) {
      showUINotification("Las coordenadas son requeridas", "warning");
      return false;
    }

    const lat = parseFloat(formData.lat);
    const lng = parseFloat(formData.lng);

    if (isNaN(lat) || isNaN(lng)) {
      showUINotification("Las coordenadas deben ser números válidos", "warning");
      return false;
    }

    // Validar que los planos pendientes tengan piso asignado
    if (isEditing && floorImageSectionRef?.current) {
      const pendingUploads = floorImageSectionRef.current.getPendingUploads?.();
      if (pendingUploads && pendingUploads.length > 0) {
        const uploadsWithoutFloor = pendingUploads.filter(
          upload => !upload.floor || upload.floor === ""
        );

        if (uploadsWithoutFloor.length > 0) {
          showUINotification("Hay planos sin número de piso asignado. Por favor, asigna un piso a todos los planos antes de guardar.", "warning");
          return false;
        }
      }
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
    notification,
    hideNotification,
  };
};
