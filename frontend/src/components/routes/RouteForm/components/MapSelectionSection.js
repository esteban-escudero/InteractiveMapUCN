// components/routes/RouteForm/components/MapSelectionSection.jsx
import React from "react";

const MapSelectionSection = ({
  formData,
  existingNodes,
  mapAvailable,
  selectionActive,
  onActivateMapSelection,
  onClearPoints,
  onRemoveLastPoint,
  onFinishWithESC,
}) => {
  return (
    <div className="route-selection-section">
      <h4>
        <span className="material-icons">map</span>
        Seleccionar Puntos en el Mapa
      </h4>

      {/* Advertencia de mapa no disponible */}
      {!mapAvailable && (
        <div className="map-unavailable-warning">
          El mapa no está disponible
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
          <span className="material-icons">looks_3</span>
          Al hacer clic cerca de un nodo existente, podrás reutilizarlo
        </p>
        <p>
          <span className="material-icons">looks_4</span>
          Presiona <strong>ESC</strong> para finalizar
        </p>
      </div>

      {/* Controles de selección */}
      <div className="map-selection-controls">
        <button
          type="button"
          className="select-btn"
          onClick={onActivateMapSelection}
          disabled={!mapAvailable || selectionActive}>
          <span className="material-icons">
            {selectionActive ? "location_searching" : "my_location"}
          </span>
          {selectionActive ? "Seleccionando..." : "Activar Selección en Mapa"}
        </button>

        <div className="point-actions">
          <button
            type="button"
            className="remove-btn"
            onClick={onRemoveLastPoint}
            disabled={formData.puntos_ruta.length === 0}>
            <span className="material-icons">undo</span>
            Eliminar Último
          </button>

          <button
            type="button"
            className="clear-btn"
            onClick={onClearPoints}
            disabled={formData.puntos_ruta.length === 0}>
            <span className="material-icons">clear_all</span>
            Limpiar Todos
          </button>
        </div>
      </div>

      {/* Contador de puntos */}
      <div className="points-counter">
        <span className="material-icons">location_on</span>
        Puntos seleccionados: <strong>{formData.puntos_ruta.length}</strong>
        {formData.puntos_ruta.length >= 2 && (
          <span style={{ color: "#27ae60", marginLeft: "10px" }}>
            <span className="material-icons">straighten</span>
            {formData.distancia}m calculados
          </span>
        )}
      </div>
    </div>
  );
};

export default MapSelectionSection;
