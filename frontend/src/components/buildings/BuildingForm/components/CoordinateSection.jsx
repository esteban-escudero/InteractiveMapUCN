import React from "react";

const CoordinateSection = ({
  capturedCoordinates,
  onCaptureCoordinates,
  onClearCoordinates,
}) => {
  return (
    <div className="coordinates-section">
      <div className="section-header">
        <h4>
          <span className="material-icons">location_on</span>
          Coordenadas
        </h4>
        <button
          type="button"
          className="capture-btn"
          onClick={onCaptureCoordinates}>
          <span className="material-icons">my_location</span>
          Capturar del Mapa
        </button>
      </div>

      {capturedCoordinates && (
        <div className="captured-coords-info">
          <span>Coordenadas capturadas del mapa</span>
          <button
            type="button"
            onClick={onClearCoordinates}
            className="clear-capture-btn">
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default CoordinateSection;
