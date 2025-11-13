// components/routes/RouteForm/RouteFormPolyline.jsx
import React, { useEffect } from "react";
import { usePolylineRoute } from "./hooks/usePolylineRoute";
import "./RouteFormPolyline.css";

const RouteFormPolyline = ({
  onSave,
  onCancel,
  isVisible,
  route,
  isEditing,
  mapInstance,
  onSelectionStart,
  onSelectionEnd,
}) => {
  const {
    formData,
    drawingMode,
    editingMode,
    activateDrawing,
    finishDrawing,
    clearMap,
    removeLastPoint,
    handleInputChange,
    handleSubmit,
    handleCancel,
    polylineRef,
  } = usePolylineRoute({
    mapInstance,
    onSave,
    onCancel,
    isVisible,
    route,
    isEditing,
  });

  // Notificar al padre cuando empieza/termina la selección
  useEffect(() => {
    if (drawingMode && onSelectionStart) {
      console.log("🟡 Notificando INICIO de selección al padre");
      onSelectionStart();
    }
  }, [drawingMode, onSelectionStart]);

  useEffect(() => {
    if (!drawingMode && onSelectionEnd) {
      console.log("🟡 Notificando FIN de selección al padre");
      onSelectionEnd();
    }
  }, [drawingMode, onSelectionEnd]);

  // Manejo de tecla ESC
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === "Escape" && drawingMode) {
        console.log(
          "⌨️ ESC detectado en componente - drawingMode:",
          drawingMode
        );
        finishDrawing();
        e.preventDefault();
        e.stopPropagation();
      }
    };

    if (drawingMode) {
      console.log("🟡 Agregando listener de teclado para ESC");
      document.addEventListener("keydown", handleGlobalKeyDown);
    }

    return () => {
      console.log("🟡 Removiendo listener de teclado");
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [drawingMode, finishDrawing]);

  // 🔹 OCULTAR FORMULARIO DURANTE SELECCIÓN ACTIVA
  if (drawingMode) {
    console.log("🔴🔴🔴 FORMULARIO OCULTO - drawingMode activo");
    return null;
  }

  // Ocultar si no es visible
  if (!isVisible) {
    console.log("🔴 Formulario OCULTO - isVisible es false");
    return null;
  }

  console.log(
    "🟢🟢🟢 FORMULARIO VISIBLE - drawingMode:",
    drawingMode,
    "editingMode:",
    editingMode
  );

  // DEBUG: Verificar estado del botón guardar
  console.log("🔍 ESTADO DEL BOTÓN GUARDAR:");
  console.log("📊 formData.geometria:", formData.geometria);
  console.log("📍 ¿Puede guardar?:", !!formData.geometria);

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
          <button
            type="button"
            className="close-btn"
            onClick={handleCancel}
            title="Cerrar formulario">
            <span className="material-icons">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="route-form">
          {/* Información básica */}
          <div className="form-group">
            <label htmlFor="nombre-ruta">Nombre de la Ruta (opcional)</label>
            <input
              id="nombre-ruta"
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              placeholder="Dejar vacío para nombre automático"
            />
          </div>

          <div className="form-group">
            <label htmlFor="tipo-ruta">Tipo de Ruta</label>
            <select
              id="tipo-ruta"
              name="tipo"
              value={formData.tipo}
              onChange={handleInputChange}>
              <option value="accesible">Accesible</option>
              <option value="emergencia">Emergencia</option>
              <option value="peatonal">Peatonal</option>
              <option value="rapida">Rápida</option>
              <option value="vehicular">Vehicular</option>
            </select>
          </div>

          {/* Selección en mapa */}
          <div className="route-selection-section">
            <h4>
              <span className="material-icons">map</span>
              Seleccionar Puntos en el Mapa
            </h4>

            {!mapInstance && (
              <div className="map-unavailable-warning">
                <span className="material-icons">warning</span>
                El mapa no está disponible
              </div>
            )}

            <div className="selection-instructions">
              <p>
                <span className="material-icons">looks_one</span>
                <strong>Haz clic en "Activar Selección"</strong>
              </p>
              <p>
                <span className="material-icons">looks_two</span>
                Haz varios clics en el mapa para agregar puntos
              </p>
              <p>
                <span className="material-icons">looks_3</span>
                Presiona <strong>ESC</strong> para finalizar
              </p>
              <p>
                <span className="material-icons">looks_4</span>
                Luego guarda la ruta
              </p>
            </div>

            <div className="map-selection-controls">
              <button
                type="button"
                className="select-btn"
                onClick={() => {
                  console.log("🖱️ Botón Activar Selección clickeado");
                  activateDrawing();
                }}
                disabled={!mapInstance}>
                <span className="material-icons">my_location</span>
                Activar Selección en Mapa
              </button>

              <div className="point-actions">
                <button
                  type="button"
                  className="remove-btn"
                  onClick={removeLastPoint}
                  disabled={
                    !polylineRef.current ||
                    polylineRef.current.getLatLngs().length === 0
                  }>
                  <span className="material-icons">undo</span>
                  Eliminar Último
                </button>

                <button
                  type="button"
                  className="clear-btn"
                  onClick={clearMap}
                  disabled={
                    !polylineRef.current ||
                    polylineRef.current.getLatLngs().length === 0
                  }>
                  <span className="material-icons">clear_all</span>
                  Limpiar Todos
                </button>
              </div>
            </div>

            {/* Contador de puntos */}
            <div className="points-counter">
              <span className="material-icons">location_on</span>
              Puntos seleccionados:{" "}
              <strong>
                {polylineRef.current
                  ? polylineRef.current.getLatLngs().length
                  : 0}
              </strong>
              {formData.geometria && (
                <span style={{ color: "#3498db", marginLeft: "10px" }}>
                  (Guardados: {formData.geometria.coordinates.length})
                </span>
              )}
              {formData.distancia > 0 && (
                <span style={{ color: "#27ae60", marginLeft: "10px" }}>
                  <span className="material-icons">straighten</span>
                  {formData.distancia.toLocaleString()}m
                </span>
              )}
            </div>
          </div>

          {formData.geometria && (
            <div className="route-details-section">
              <h4>
                <span className="material-icons">info</span>
                Detalles de la Ruta
              </h4>
              <div className="route-details">
                <div className="detail-item">
                  <span className="detail-label">Distancia total:</span>
                  <span className="detail-value">
                    {formData.distancia.toLocaleString()}m
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Tiempo estimado:</span>
                  <span className="detail-value">
                    {formData.tiempo_estimado} min
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Puntos en ruta:</span>
                  <span className="detail-value">
                    {polylineRef.current
                      ? polylineRef.current.getLatLngs().length
                      : 0}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Tipo:</span>
                  <span className={`detail-value route-type-${formData.tipo}`}>
                    {formData.tipo}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="save-btn"
              disabled={!formData.geometria}>
              <span className="material-icons">save</span>
              {isEditing ? "Actualizar Ruta" : "Guardar Ruta"}
            </button>

            <button type="button" className="cancel-btn" onClick={handleCancel}>
              <span className="material-icons">cancel</span>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RouteFormPolyline;
