// components/Forms/BuildingForm.js
import React, { useState, useEffect } from "react";
import "./BuildingForm.css";

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
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    tipo: "Oficina Profesor",
    latitud: "",
    longitud: "",
  });

  const [isCapturing, setIsCapturing] = useState(false);
  const [hasBeenReset, setHasBeenReset] = useState(false);

  const tiposEdificio = [
    { value: "Oficina Profesor", label: "👨‍🏫 Oficina Profesor" },
    { value: "Oficina Administracion", label: "📊 Oficina Adminstrativa" },
    { value: "Sala de Clase", label: "📚 Sala de Clase" },
    { value: "Laboratorio", label: "🔬 Laboratorio" },
    { value: "Biblioteca", label: "📖 Biblioteca" },
    { value: "Sala de Estudio", label: "💻 Sala Estudio" },
    { value: "Baño", label: "🚻 Baño" },
    { value: "Casino", label: "🍽️ Casino" },
    { value: "Cafeteria", label: "☕ Cafetería" },
    { value: "Gimnasio", label: "💪 Gimnasio" },
    { value: "Estacionamiento", label: "🅿️ Estacionamiento" },
    { value: "Centro de Salud", label: "🏥 Centro de Salud" },
  ];

  // Resetear form solo cuando se abre por primera vez o cambia entre edición/creación
  useEffect(() => {
    if (isVisible && !hasBeenReset) {
      if (isEditing && building) {
        // Modo edición: cargar datos del edificio
        const coords = building.ubicacion?.coordinates || [];
        setFormData({
          nombre: building.nombre || "",
          descripcion: building.descripcion || "",
          tipo: building.tipo || "Oficina Profesor",
          latitud: coords[1]?.toString() || building.lat?.toString() || "",
          longitud: coords[0]?.toString() || building.lng?.toString() || "",
        });
      } else {
        // Modo creación: resetear completamente el formulario
        setFormData({
          nombre: "",
          descripcion: "",
          tipo: "Oficina Profesor",
          latitud: "",
          longitud: "",
        });
      }
      setHasBeenReset(true);
    }

    // Resetear el flag cuando el formulario se cierra
    if (!isVisible) {
      setHasBeenReset(false);
    }
  }, [isVisible, isEditing, building, hasBeenReset]);

  // Efecto específico para capturar coordenadas nuevas - ESTE ES EL IMPORTANTE
  useEffect(() => {
    if (capturedCoordinates && isCapturing) {
      console.log("📍 Coordenadas capturadas recibidas:", capturedCoordinates);

      // Actualizar el formulario con las nuevas coordenadas
      setFormData((prev) => ({
        ...prev,
        latitud: capturedCoordinates.lat.toString(),
        longitud: capturedCoordinates.lng.toString(),
      }));

      // Desactivar modo captura
      setIsCapturing(false);

      // Desactivar modo captura en el mapa si existe la función
      if (onToggleCoordinateDetection) {
        onToggleCoordinateDetection();
      }

      console.log("✅ Coordenadas actualizadas en el formulario");
    }
  }, [capturedCoordinates, isCapturing, onToggleCoordinateDetection]);

  // Efecto para limpiar coordenadas cuando se inicia la captura
  useEffect(() => {
    if (isCapturing) {
      // Limpiar solo las coordenadas, mantener el resto del formulario
      setFormData((prev) => ({
        ...prev,
        latitud: "",
        longitud: "",
      }));
    }
  }, [isCapturing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCaptureCoordinates = () => {
    console.log("📍 Iniciando captura de coordenadas para edificio...");

    if (onToggleCoordinateDetection) {
      setIsCapturing(true);
      onToggleCoordinateDetection();
      console.log("📍 Modo captura activado para edificio");
    } else {
      console.error("❌ onToggleCoordinateDetection no está definido");
      alert("Error: Función de captura no disponible");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      alert("El nombre del edificio es requerido");
      return;
    }

    if (!formData.latitud || !formData.longitud) {
      alert("Debes ingresar las coordenadas del edificio");
      return;
    }

    // Validar que las coordenadas sean números
    const lat = parseFloat(formData.latitud);
    const lng = parseFloat(formData.longitud);

    if (isNaN(lat) || isNaN(lng)) {
      alert("Las coordenadas deben ser números válidos");
      return;
    }

    const buildingData = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim(),
      tipo: formData.tipo,
      lat: lat,
      lng: lng,
    };

    try {
      await onSave(buildingData);
      setIsCapturing(false);
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar el edificio: " + error.message);
    }
  };

  const handleCancel = () => {
    if (isCapturing && onToggleCoordinateDetection) {
      onToggleCoordinateDetection(); // Desactivar modo captura
    }
    setIsCapturing(false);
    onCancel();
  };

  // Si estamos en modo captura, NO mostrar ningún formulario - solo el mapa
  if (isCapturing) {
    return null;
  }

  // Si el formulario no es visible, no mostrar nada
  if (!isVisible) return null;

  // Vista principal del formulario (solo se muestra cuando NO estamos capturando)
  return (
    <div className="building-form-overlay">
      <div className="building-form-container">
        <div className="form-content">
          <div className="form-header">
            <h3>
              {isEditing ? "✏️ Editar Edificio" : "🏗️ Agregar Nuevo Edificio"}
            </h3>
            {isEditing && building && (
              <small style={{ color: "#7f8c8d", fontSize: "12px" }}>
                Editando: {building.nombre}
              </small>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nombre">Nombre del Edificio *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ej: Edificio de Ingeniería"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="descripcion">Descripción</label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Descripción del edificio..."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="tipo">Tipo de Edificio *</label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                required
                style={{ fontSize: "14px" }}>
                {tiposEdificio.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sección de Coordenadas */}
            <div className="coordinates-section">
              <div className="coordinates-header">
                <label>Coordenadas *</label>
                <div className="coordinate-options">
                  <button
                    type="button"
                    className="capture-btn"
                    onClick={handleCaptureCoordinates}>
                    📍 Capturar en Mapa
                  </button>
                </div>
              </div>

              <div className="coordinates-group">
                <div className="form-group">
                  <label htmlFor="latitud">Latitud *</label>
                  <input
                    type="text"
                    id="latitud"
                    name="latitud"
                    value={formData.latitud}
                    onChange={handleInputChange}
                    placeholder="Ej: -29.953456"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="longitud">Longitud *</label>
                  <input
                    type="text"
                    id="longitud"
                    name="longitud"
                    value={formData.longitud}
                    onChange={handleInputChange}
                    placeholder="Ej: -71.340123"
                    required
                  />
                </div>
              </div>

              {formData.latitud && formData.longitud && (
                <div className="coordinates-feedback">
                  <span style={{ color: "green", fontSize: "12px" }}>
                    ✅ Coordenadas: {formData.latitud}, {formData.longitud}
                  </span>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="cancel-btn">
                Cancelar
              </button>
              <button
                type="submit"
                className="save-btn"
                disabled={
                  !formData.nombre.trim() ||
                  !formData.latitud ||
                  !formData.longitud
                }>
                {isEditing ? "💾 Actualizar Edificio" : "💾 Guardar Edificio"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BuildingForm;
