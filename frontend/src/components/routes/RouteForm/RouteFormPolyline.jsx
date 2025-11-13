// components/routes/RouteForm/RouteFormPolyline.jsx
import React from "react";
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

  const getSegmentCount = () => {
    if (!polylineRef.current) return 0;
    const latLngs = polylineRef.current.getLatLngs();
    return latLngs ? latLngs.length - 1 : 0;
  };

  if (!isVisible) return null;

  return (
    <div className="route-form-polyline">
      <div className="form-header">
        <h3>{isEditing ? "Editar Ruta" : "Crear Nueva Ruta"}</h3>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Campos básicos */}
        <div className="form-section">
          <label>Nombre de la Ruta</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            placeholder="Ej: Ruta Peatonal Principal"
          />
        </div>

        <div className="form-section">
          <label>Tipo de Ruta</label>
          <select
            name="tipo"
            value={formData.tipo}
            onChange={handleInputChange}>
            <option value="peatonal">Peatonal</option>
            <option value="accesible">Accesible</option>
            <option value="vehicular">Vehicular</option>
            <option value="emergencia">Emergencia</option>
            <option value="rapida">Rápida</option>
          </select>
        </div>

        {/* Controles de dibujo */}
        <div className="drawing-section">
          <h4>Dibujar Ruta en el Mapa</h4>

          {!drawingMode ? (
            <button
              type="button"
              onClick={activateDrawing}
              className="draw-btn">
              🗺️ Comenzar a Dibujar
            </button>
          ) : (
            <div className="drawing-controls">
              <p>
                💡 Haz clic en el mapa para agregar puntos. Presiona ESC para
                terminar.
              </p>
              <div className="drawing-stats">
                <span>
                  Puntos:{" "}
                  {polylineRef.current
                    ? polylineRef.current.getLatLngs().length
                    : 0}
                </span>
                {formData.distancia > 0 && (
                  <span>Distancia: {formData.distancia}m</span>
                )}
              </div>
              <div className="drawing-actions">
                <button
                  type="button"
                  onClick={finishDrawing}
                  className="finish-btn">
                  ✅ Terminar
                </button>
                <button type="button" onClick={clearMap} className="cancel-btn">
                  ❌ Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Información de la ruta */}
        {formData.distancia > 0 && (
          <div className="route-info">
            <h4>Información de la Ruta</h4>
            <p>
              <strong>Distancia:</strong> {formData.distancia}m
            </p>
            <p>
              <strong>Tiempo estimado:</strong> {formData.tiempo_estimado} min
            </p>
            <p>
              <strong>Puntos:</strong>{" "}
              {polylineRef.current
                ? polylineRef.current.getLatLngs().length
                : 0}
            </p>
          </div>
        )}

        {/* Modo edición activo */}
        {editingMode && (
          <div className="editing-active">
            <div className="editing-header">
              <span className="editing-indicator">✏️ Editando...</span>
            </div>

            <div className="editing-instructions">
              <p>
                💡 <strong>Modo edición activo:</strong>
              </p>
              <ul>
                <li>
                  Arrastra los <strong>puntos azules</strong> para moverlos
                </li>
                <li>
                  Haz clic en los <strong>segmentos de línea</strong> para
                  agregar puntos
                </li>
                <li>
                  Punto <span style={{ color: "#27ae60" }}>verde</span>: Inicio
                </li>
                <li>
                  Punto <span style={{ color: "#e74c3c" }}>rojo</span>: Fin
                </li>
              </ul>
            </div>

            <div className="editing-actions">
              <button
                type="button"
                onClick={removeLastPoint}
                className="action-btn warning">
                🗑️ Eliminar Último Punto
              </button>
              <button
                type="button"
                onClick={clearMap}
                className="action-btn danger">
                ❌ Limpiar Todo
              </button>
            </div>
          </div>
        )}

        {/* Acciones del formulario */}
        <div className="form-actions">
          <button
            type="submit"
            disabled={!formData.geometria}
            className="save-btn">
            💾 {isEditing ? "Actualizar Ruta" : "Guardar Ruta"}
          </button>

          <button type="button" onClick={handleCancel} className="cancel-btn">
            ❌ Cancelar
          </button>
        </div>

        {/* Estado del formulario */}
        <div className="form-status">
          {!formData.geometria && (
            <div className="status-warning">
              ⚠️ Debes dibujar una ruta en el mapa antes de guardar
            </div>
          )}
          {formData.geometria && (
            <div className="status-success">
              ✅ Ruta lista para guardar - {formData.distancia}m de longitud
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default RouteFormPolyline;
