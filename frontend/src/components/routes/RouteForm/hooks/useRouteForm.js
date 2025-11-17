// components/routes/RouteForm/hooks/useRouteForm.js
// VERSIÓN LIMPIA - Sistema de polilíneas únicamente (SIN sistema de nodos)
import { useState, useEffect } from "react";
import { useMapSelection } from "./useMapSelection";
import { useRouteCalculations } from "./useRouteCalculations";

export const useRouteForm = ({
  onSave,
  onCancel,
  isVisible,
  route,
  isEditing,
  mapInstance,
}) => {
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "peatonal",
    distancia: 0,
    tiempo_estimado: 0,
    geometria: null,
    puntos_ruta: [],
  });

  const {
    tempMarkers,
    tempLine,
    selectionActive,
    mapAvailable,
    handleActivateMapSelection,
    handleDeactivateMapSelection,
    clearTempMarkers,
    removeMapClickListener,
    updateMarkersWithColors,
    drawRouteLine,
  } = useMapSelection({
    mapInstance,
    formData,
    setFormData,
  });

  const { calculateTotalDistance, handleFinishWithESC } = useRouteCalculations({
    formData,
    setFormData,
    updateMarkersWithColors,
    drawRouteLine,
    handleDeactivateMapSelection,
  });

  // Efectos de inicialización
  useEffect(() => {
    if (isVisible) {
      if (route && isEditing) {
        setFormData({
          nombre: route.nombre || "",
          tipo: route.tipo || "peatonal",
          distancia: route.distancia || 0,
          tiempo_estimado: route.tiempo_estimado || 0,
          geometria: route.geometria || null,
          puntos_ruta: route.puntos_ruta || [],
        });
      } else {
        resetForm();
      }
    }
  }, [isVisible, route, isEditing]);

  useEffect(() => {
    if (formData.puntos_ruta.length >= 2) {
      const distancia = calculateTotalDistance(formData.puntos_ruta);
      const tiempo_estimado = Math.round(distancia / 80);

      setFormData((prev) => ({
        ...prev,
        distancia,
        tiempo_estimado,
      }));
    } else if (formData.puntos_ruta.length < 2) {
      setFormData((prev) => ({
        ...prev,
        distancia: 0,
        tiempo_estimado: 0,
      }));
    }
  }, [formData.puntos_ruta, calculateTotalDistance]);

  // Funciones del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearPoints = () => {
    clearTempMarkers();
    removeMapClickListener();
    setFormData((prev) => ({
      ...prev,
      puntos_ruta: [],
      geometria: null,
      distancia: 0,
      tiempo_estimado: 0,
    }));
  };

  const handleRemoveLastPoint = () => {
    if (formData.puntos_ruta.length === 0) return;

    const updatedPuntos = formData.puntos_ruta.slice(0, -1);
    setFormData((prev) => ({
      ...prev,
      puntos_ruta: updatedPuntos,
    }));

    if (updatedPuntos.length < 2) {
      setFormData((prev) => ({
        ...prev,
        geometria: null,
        distancia: 0,
        tiempo_estimado: 0,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.puntos_ruta.length < 2) {
      alert("Se necesitan al menos 2 puntos para crear una ruta");
      return;
    }

    const datosParaGuardar = prepareDataForSave();
    clearTempMarkers();
    removeMapClickListener();
    onSave(datosParaGuardar);
  };

  const handleCancel = () => {
    clearTempMarkers();
    removeMapClickListener();

    if (!isEditing) {
      resetForm();
    }

    onCancel();
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      tipo: "peatonal",
      distancia: 0,
      tiempo_estimado: 0,
      geometria: null,
      puntos_ruta: [],
    });
  };

  const prepareDataForSave = () => {
    const nombreParaEnviar = formData.nombre.trim() || generateDefaultName();

    let distanciaParaEnviar = formData.distancia;
    let tiempoParaEnviar = formData.tiempo_estimado;

    if (!distanciaParaEnviar && formData.puntos_ruta.length >= 2) {
      distanciaParaEnviar = calculateTotalDistance(formData.puntos_ruta);
      tiempoParaEnviar = Math.round(distanciaParaEnviar / 80);
    }

    return {
      ...formData,
      nombre: nombreParaEnviar,
      distancia: distanciaParaEnviar,
      tiempo_estimado: tiempoParaEnviar,
      geometria: formData.geometria || generateGeometry(),
    };
  };

  const generateDefaultName = () => {
    const now = new Date();
    return `Ruta ${now.toLocaleDateString("es-ES")} ${now.toLocaleTimeString(
      "es-ES",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    )}`;
  };

  const generateGeometry = () => {
    const coordinates = formData.puntos_ruta.map(
      (p) => p.coordenadas.coordinates
    );
    return {
      type: "LineString",
      coordinates: coordinates,
    };
  };

  return {
    // State
    formData,
    tempMarkers,
    tempLine,
    selectionActive,
    mapAvailable,

    // Handlers
    handleInputChange,
    handleActivateMapSelection,
    handleDeactivateMapSelection,
    handleClearPoints,
    handleRemoveLastPoint,
    handleSubmit,
    handleCancel,
    handleFinishWithESC,
  };
};
