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
  showUINotification,
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
    snapEnabled,
    setSnapEnabled,
    snapThreshold,
    setSnapThreshold,
    minPointDistance,
    setMinPointDistance,
    showSnapIndicators,
    setShowSnapIndicators,
    snappedPreview,
  } = usePolylineRoute({
    mapInstance,
    onSave,
    onCancel,
    isVisible,
    route,
    isEditing,
    showUINotification,
  });

  // Notificar al padre cuando empieza/termina la selección
  useEffect(() => {
    if (drawingMode && onSelectionStart) {
      console.log(" Notificando INICIO de selección al padre");
      onSelectionStart();
    }
  }, [drawingMode, onSelectionStart]);

  useEffect(() => {
    if (!drawingMode && onSelectionEnd) {
      console.log(" Notificando FIN de selección al padre");
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
      console.log(" Agregando listener de teclado para ESC");
      document.addEventListener("keydown", handleGlobalKeyDown);
    }

    return () => {
      console.log(" Removiendo listener de teclado");
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [drawingMode, finishDrawing]);

  // 🔹 OCULTAR FORMULARIO DURANTE SELECCIÓN ACTIVA
  if (drawingMode) {
    console.log("FORMULARIO OCULTO - drawingMode activo");
    return null;
  }

  // Ocultar si no es visible
  if (!isVisible) {
    console.log("Formulario OCULTO - isVisible es false");
    return null;
  }

  //
  console.log(
    "FORMULARIO VISIBLE - drawingMode:",
    drawingMode,
    "editingMode:",
    editingMode
  );

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
            {/* 🆕 CONTROLES DE SNAPPING */}
            <div className="snap-controls-section">
              <h4
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "14px",
                  margin: "15px 0 10px 0",
                  color: "#2c3e50",
                }}>
                <span className="material-icons" style={{ fontSize: "18px" }}>
                  settings
                </span>
                Configuración de Snapping
              </h4>

              <div
                className="snap-controls-grid"
                style={{
                  display: "grid",
                  gap: "12px",
                  background: "#f8f9fa",
                  padding: "15px",
                  borderRadius: "8px",
                  border: "1px solid #e0e0e0",
                }}>
                {/* Toggle Snapping */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    padding: "8px",
                    background: "white",
                    borderRadius: "6px",
                    border: "1px solid #ddd",
                  }}>
                  <input
                    type="checkbox"
                    checked={snapEnabled}
                    onChange={(e) => setSnapEnabled(e.target.checked)}
                    style={{ cursor: "pointer", width: "18px", height: "18px" }}
                  />
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "13px",
                    }}>
                    <span
                      className="material-icons"
                      style={{
                        fontSize: "16px",
                        color: snapEnabled ? "#27ae60" : "#95a5a6",
                      }}>
                      {snapEnabled ? "check_circle" : "cancel"}
                    </span>
                    <strong>Activar Snapping Automático</strong>
                  </span>
                </label>

                {/* Distancia de Snap */}
                <div
                  style={{
                    opacity: snapEnabled ? 1 : 0.5,
                    pointerEvents: snapEnabled ? "auto" : "none",
                  }}>
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#555",
                      marginBottom: "6px",
                      display: "block",
                    }}>
                    <span
                      className="material-icons"
                      style={{ fontSize: "14px", verticalAlign: "middle" }}>
                      gps_fixed
                    </span>{" "}
                    Radio de captura:{" "}
                    <strong style={{ color: "#3498db" }}>
                      {snapThreshold}m
                    </strong>
                  </label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      step="5"
                      value={snapThreshold}
                      onChange={(e) => setSnapThreshold(Number(e.target.value))}
                      disabled={!snapEnabled}
                      style={{ flex: 1, cursor: "pointer" }}
                    />
                    <span
                      style={{
                        minWidth: "40px",
                        textAlign: "center",
                        fontSize: "13px",
                        fontWeight: "bold",
                        color: "#3498db",
                        background: "#ecf0f1",
                        padding: "4px 8px",
                        borderRadius: "4px",
                      }}>
                      {snapThreshold}m
                    </span>
                  </div>
                  <small
                    style={{
                      fontSize: "11px",
                      color: "#7f8c8d",
                      display: "block",
                      marginTop: "4px",
                    }}>
                    Distancia máxima para conectar con puntos existentes
                  </small>
                </div>

                {/* Distancia Mínima */}
                <div>
                  <label
                    style={{
                      fontSize: "12px",
                      fontWeight: "600",
                      color: "#555",
                      marginBottom: "6px",
                      display: "block",
                    }}>
                    <span
                      className="material-icons"
                      style={{ fontSize: "14px", verticalAlign: "middle" }}>
                      social_distance
                    </span>{" "}
                    Distancia mínima entre puntos:{" "}
                    <strong style={{ color: "#e67e22" }}>
                      {minPointDistance}m
                    </strong>
                  </label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="1"
                      value={minPointDistance}
                      onChange={(e) =>
                        setMinPointDistance(Number(e.target.value))
                      }
                      style={{ flex: 1, cursor: "pointer" }}
                    />
                    <span
                      style={{
                        minWidth: "40px",
                        textAlign: "center",
                        fontSize: "13px",
                        fontWeight: "bold",
                        color: "#e67e22",
                        background: "#ecf0f1",
                        padding: "4px 8px",
                        borderRadius: "4px",
                      }}>
                      {minPointDistance}m
                    </span>
                  </div>
                  <small
                    style={{
                      fontSize: "11px",
                      color: "#7f8c8d",
                      display: "block",
                      marginTop: "4px",
                    }}>
                    Evita puntos demasiado juntos (0 = sin límite)
                  </small>
                </div>

                {/* Indicadores Visuales */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    cursor: "pointer",
                    padding: "8px",
                    background: "white",
                    borderRadius: "6px",
                    border: "1px solid #ddd",
                    opacity: snapEnabled ? 1 : 0.5,
                    pointerEvents: snapEnabled ? "auto" : "none",
                  }}>
                  <input
                    type="checkbox"
                    checked={showSnapIndicators}
                    onChange={(e) => setShowSnapIndicators(e.target.checked)}
                    disabled={!snapEnabled}
                    style={{ cursor: "pointer", width: "18px", height: "18px" }}
                  />
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: "13px",
                    }}>
                    <span
                      className="material-icons"
                      style={{
                        fontSize: "16px",
                        color: showSnapIndicators ? "#9b59b6" : "#95a5a6",
                      }}>
                      visibility
                    </span>
                    Mostrar indicadores visuales
                  </span>
                </label>

                {/* Estado Actual */}
                {snappedPreview && snapEnabled && (
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      color: "white",
                      padding: "10px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      animation: "fadeIn 0.3s",
                    }}>
                    <span
                      className="material-icons"
                      style={{ fontSize: "18px" }}>
                      {snappedPreview.snapType === "node"
                        ? "gps_fixed"
                        : "place"}
                    </span>
                    <div>
                      <strong>
                        {snappedPreview.snapType === "node"
                          ? "Nodo detectado"
                          : "Línea detectada"}
                      </strong>
                      <br />
                      <small>
                        Distancia: {Math.round(snappedPreview.snapDistance)}m -
                        Click para conectar
                      </small>
                    </div>
                  </div>
                )}
              </div>
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
