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

  // Agrega este useEffect para manejar ESC a nivel del componente
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === "Escape" && drawingMode) {
        // Si estamos en modo dibujo, solo finaliza el dibujo, no cierres el formulario
        e.preventDefault();
        e.stopPropagation();
        return;
      }
    };

    if (isVisible) {
      document.addEventListener("keydown", handleGlobalKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [drawingMode, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="route-form-overlay">
      <div className="route-form-container">
        <div className="route-form-header">
          <h3>
            <span className="material-icons">
              {isEditing ? "edit_road" : "add_road"}
            </span>
            {isEditing ? "Editar Ruta" : "Crear Ruta"}
            {drawingMode && (
              <span
                style={{
                  color: "#e74c3c",
                  fontSize: "0.8em",
                  marginLeft: "10px",
                  fontWeight: "normal",
                }}>
                (Modo Selección - Presiona ESC para finalizar)
              </span>
            )}
          </h3>
          <button
            className="close-btn"
            onClick={handleCancel}
            disabled={drawingMode}>
            <span className="material-icons">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="route-form">
          {/* Información básica */}
          <div className="form-group">
            <label>Nombre de la Ruta (opcional)</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              placeholder="Dejar vacío para nombre automático"
              disabled={drawingMode}
            />
          </div>

          <div className="form-group">
            <label>Tipo de Ruta</label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleInputChange}
              disabled={drawingMode}>
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
              {drawingMode && (
                <span
                  style={{
                    color: "#e74c3c",
                    fontSize: "0.8em",
                    marginLeft: "10px",
                    fontWeight: "normal",
                  }}>
                  (Haz clic en el mapa para agregar puntos)
                </span>
              )}
            </h4>

            {/* Advertencia de mapa no disponible */}
            {!mapInstance && (
              <div className="map-unavailable-warning">
                <span className="material-icons">warning</span>
                El mapa no está disponible. Recarga la página.
              </div>
            )}

            {/* Instrucciones */}
            <div className="selection-instructions">
              <p>
                <span className="material-icons">looks_one</span>
                <strong>Primero selecciona los puntos en el mapa</strong>
              </p>
              <p>
                <span className="material-icons">looks_two</span>
                Haz clic en "Activar Selección"
              </p>
              <p>
                <span className="material-icons">looks_3</span>
                Haz varios clics en el mapa para agregar puntos
              </p>
              <p>
                <span className="material-icons">looks_4</span>
                Presiona <strong>ESC</strong> para finalizar
              </p>
            </div>

            {/* Controles de selección */}
            <div className="map-selection-controls">
              {!drawingMode ? (
                <button
                  type="button"
                  className="select-btn"
                  onClick={activateDrawing}
                  disabled={!mapInstance}>
                  <span className="material-icons">my_location</span>
                  Activar Selección en Mapa
                </button>
              ) : (
                <button
                  type="button"
                  className="select-btn"
                  onClick={finishDrawing}
                  style={{ backgroundColor: "#27ae60" }}>
                  <span className="material-icons">check</span>
                  Finalizar Selección (o presiona ESC)
                </button>
              )}

              <div className="point-actions">
                <button
                  type="button"
                  className="remove-btn"
                  onClick={removeLastPoint}
                  disabled={
                    !polylineRef.current ||
                    polylineRef.current.getLatLngs().length === 0 ||
                    drawingMode
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
                    polylineRef.current.getLatLngs().length === 0 ||
                    drawingMode
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
              {formData.distancia > 0 && (
                <span style={{ color: "#27ae60", marginLeft: "10px" }}>
                  <span className="material-icons">straighten</span>
                  {formData.distancia.toLocaleString()}m calculados
                </span>
              )}
            </div>
          </div>

          {/* Detalles de la ruta */}
          {formData.geometria && !drawingMode && (
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

          {/* Acciones del formulario */}
          <div className="form-actions">
            <button
              type="submit"
              className="save-btn"
              disabled={!formData.geometria || drawingMode}>
              <span className="material-icons">save</span>
              {isEditing ? "Actualizar Ruta" : "Guardar Ruta"}
            </button>

            <button
              type="button"
              className="cancel-btn"
              onClick={handleCancel}
              disabled={drawingMode}>
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
