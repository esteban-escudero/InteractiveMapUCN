// components/Forms/BuildingForm.js
import React, { useState, useEffect } from "react";
import "./BuildingForm.css";
import { SpatialUtils } from "../../utils/spatialUtils";

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
    lat: "",
    lng: "",
    tipo: "académico",
    estado: "activo",
  });

  const [validation, setValidation] = useState({
    isValidLocation: true,
    distanceToNearest: null,
    nearestBuilding: null,
    isInCampus: true,
  });

  const [isCapturing, setIsCapturing] = useState(false);
  const [hasBeenReset, setHasBeenReset] = useState(false);

  // ✅ CARGAR DATOS SI ESTAMOS EDITANDO - CON RESET MEJORADO
  useEffect(() => {
    if (isVisible && !hasBeenReset) {
      if (isEditing && building) {
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
          tipo: building.tipo || "académico",
          estado: building.estado || "activo",
        });
      } else {
        // Modo creación: resetear completamente el formulario
        setFormData({
          nombre: "",
          descripcion: "",
          lat: "",
          lng: "",
          tipo: "académico",
          estado: "activo",
        });
      }
      setHasBeenReset(true);
    }

    // Resetear el flag cuando el formulario se cierra
    if (!isVisible) {
      setHasBeenReset(false);
    }
  }, [isVisible, isEditing, building, hasBeenReset]);

  // ✅ USAR COORDENADAS CAPTURADAS - ADAPTADO CON isCapturing
  useEffect(() => {
    if (capturedCoordinates && isCapturing) {
      console.log("📍 Coordenadas capturadas recibidas:", capturedCoordinates);

      // Actualizar el formulario con las nuevas coordenadas
      setFormData(prev => ({
        ...prev,
        lat: capturedCoordinates.lat.toString(),
        lng: capturedCoordinates.lng.toString(),
      }));

      // Desactivar modo captura
      setIsCapturing(false);

      // Validar automáticamente las coordenadas capturadas
      validateCoordinates(capturedCoordinates.lat, capturedCoordinates.lng);

      console.log("✅ Coordenadas actualizadas en el formulario");
    }
  }, [capturedCoordinates, isCapturing]);

  // ✅ Efecto para limpiar coordenadas cuando se inicia la captura
  useEffect(() => {
    if (isCapturing) {
      // Limpiar solo las coordenadas, mantener el resto del formulario
      setFormData(prev => ({
        ...prev,
        lat: "",
        lng: "",
      }));
    }
  }, [isCapturing]);

  // ✅ VALIDAR COORDENADAS CON TURF
  const validateCoordinates = (lat, lng) => {
    if (!lat || !lng) return;

    try {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      
      if (isNaN(latNum) || isNaN(lngNum)) {
        setValidation({
          isValidLocation: false,
          distanceToNearest: null,
          nearestBuilding: null,
          isInCampus: false,
        });
        return;
      }

      // Validar si está dentro del campus (coordenadas aproximadas de UCN Coquimbo)
      const isInCampus = SpatialUtils.isPointInPolygon(latNum, lngNum, [
        [-71.355622, -29.967316],
        [-71.346738, -29.967316],
        [-71.346738, -29.963208],
        [-71.355622, -29.963208],
        [-71.355622, -29.967316]
      ]);

      setValidation(prev => ({
        ...prev,
        isInCampus,
        isValidLocation: true
      }));

      console.log(`📍 Validación Turf: ${isInCampus ? 'DENTRO' : 'FUERA'} del campus`);

    } catch (error) {
      console.error("❌ Error validando coordenadas:", error);
      setValidation(prev => ({
        ...prev,
        isValidLocation: false,
        isInCampus: false
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    setFormData(prev => ({
      ...prev,
      [coordType]: value
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

  // ✅ FUNCIÓN MEJORADA PARA CAPTURAR COORDENADAS
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

    // Validaciones básicas
    if (!formData.nombre.trim()) {
      alert("❌ El nombre del edificio es requerido");
      return;
    }

    if (!formData.lat || !formData.lng) {
      alert("❌ Las coordenadas son requeridas");
      return;
    }

    const lat = parseFloat(formData.lat);
    const lng = parseFloat(formData.lng);

    if (isNaN(lat) || isNaN(lng)) {
      alert("❌ Las coordenadas deben ser números válidos");
      return;
    }

    // Preparar datos para enviar
    const buildingData = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim(),
      lat: lat,
      lng: lng,
      tipo: formData.tipo,
      estado: formData.estado,
      ubicacion: {
        type: "Point",
        coordinates: [lng, lat]
      }
    };

    console.log("✅ Enviando edificio con Turf:", {
      nombre: buildingData.nombre,
      coordenadas: [lng, lat],
      validacion: validation
    });

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
    onClearCoordinates?.();
    onCancel();
  };

  // ✅ SI ESTAMOS EN MODO CAPTURA, NO MOSTRAR NINGÚN FORMULARIO - SOLO EL MAPA
  if (isCapturing) {
    return null;
  }

  // Si el formulario no es visible, no mostrar nada
  if (!isVisible) return null;

  // ✅ VISTA PRINCIPAL DEL FORMULARIO (solo se muestra cuando NO estamos capturando)
  return (
    <div className="building-form-overlay">
      <div className="building-form-container">
        <div className="building-form-header">
          <h3>{isEditing ? "✏️ Editar Edificio" : "➕ Crear Edificio"}</h3>
          <button className="close-btn" onClick={handleCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="building-form">
          {/* NOMBRE */}
          <div className="form-group">
            <label>Nombre del Edificio *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              placeholder="Ej: Departamento de Ingeniería"
              required
            />
          </div>

          {/* DESCRIPCIÓN */}
          <div className="form-group">
            <label>Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              placeholder="Descripción del edificio..."
              rows="3"
            />
          </div>

          {/* COORDENADAS */}
          <div className="coordinates-section">
            <div className="section-header">
              <h4>📍 Coordenadas</h4>
              <button
                type="button"
                className="capture-btn"
                onClick={handleCaptureCoordinates} // ✅ USAR LA NUEVA FUNCIÓN
              >
                🎯 Capturar del Mapa
              </button>
            </div>

            {capturedCoordinates && (
              <div className="captured-coords-info">
                <span>✅ Coordenadas capturadas del mapa</span>
                <button 
                  type="button" 
                  onClick={onClearCoordinates}
                  className="clear-capture-btn"
                >
                  ×
                </button>
              </div>
            )}

            <div className="coordinates-inputs">
              <div className="form-group">
                <label>Latitud *</label>
                <input
                  type="number"
                  step="any"
                  name="lat"
                  value={formData.lat}
                  onChange={(e) => handleCoordinateChange("lat", e.target.value)}
                  placeholder="Ej: -29.965000"
                  required
                  className={formData.lat && formData.lng ? (validation.isInCampus ? 'input-valid' : 'input-warning') : ''}
                />
              </div>

              <div className="form-group">
                <label>Longitud *</label>
                <input
                  type="number"
                  step="any"
                  name="lng"
                  value={formData.lng}
                  onChange={(e) => handleCoordinateChange("lng", e.target.value)}
                  placeholder="Ej: -71.350000"
                  required
                  className={formData.lat && formData.lng ? (validation.isInCampus ? 'input-valid' : 'input-warning') : ''}
                />
              </div>
            </div>

            {/* ✅ VALIDACIÓN TURF */}
            {formData.lat && formData.lng && (
              <div className={`validation-info ${validation.isInCampus ? 'valid' : 'invalid'}`}>
                <div className="validation-icon">
                  {validation.isInCampus ? '✅' : '⚠️'}
                </div>
                <div className="validation-details">
                  <strong>
                    {validation.isInCampus 
                      ? 'Dentro del campus UCN' 
                      : 'FUERA de los límites del campus'
                    }
                  </strong>
                  <div className="validation-coords">
                    📍 {parseFloat(formData.lat).toFixed(6)}, {parseFloat(formData.lng).toFixed(6)}
                  </div>
                  {!validation.isInCampus && (
                    <div className="validation-warning">
                      Esta ubicación está fuera del Campus Guayacán
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* TIPO Y ESTADO */}
          <div className="form-row">
            <div className="form-group">
              <label>Tipo de Edificio</label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
              >
                <option value="académico">Académico</option>
                <option value="administrativo">Administrativo</option>
                <option value="investigación">Investigación</option>
                <option value="servicios">Servicios</option>
                <option value="deportivo">Deportivo</option>
              </select>
            </div>

            <div className="form-group">
              <label>Estado</label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleInputChange}
              >
                <option value="activo">Activo</option>
                <option value="mantención">En Mantención</option>
                <option value="cerrado">Cerrado</option>
                <option value="construcción">En Construcción</option>
              </select>
            </div>
          </div>

          {/* ACCIONES */}
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancelar
            </button>
            <button 
              type="submit" 
              className="save-btn"
              disabled={!formData.nombre.trim() || !formData.lat || !formData.lng}
            >
              {isEditing ? "Actualizar" : "Crear"} Edificio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuildingForm;