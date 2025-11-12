// components/buildings/BuildingForm/components/CoordinateSection.jsx
import React from "react";

const CoordinateSection = ({
  formData,
  validation,
  capturedCoordinates,
  onCoordinateChange,
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

      <div className="coordinates-inputs">
        <div className="form-group">
          <label>Latitud *</label>
          <input
            type="number"
            step="any"
            name="lat"
            value={formData.lat}
            onChange={(e) => onCoordinateChange("lat", e.target.value)}
            placeholder="Ej: -29.965000"
            required
            className={
              formData.lat && formData.lng
                ? validation.isInCampus
                  ? "input-valid"
                  : "input-warning"
                : ""
            }
          />
        </div>

        <div className="form-group">
          <label>Longitud *</label>
          <input
            type="number"
            step="any"
            name="lng"
            value={formData.lng}
            onChange={(e) => onCoordinateChange("lng", e.target.value)}
            placeholder="Ej: -71.350000"
            required
            className={
              formData.lat && formData.lng
                ? validation.isInCampus
                  ? "input-valid"
                  : "input-warning"
                : ""
            }
          />
        </div>
      </div>

      {/* Validación de coordenadas */}
      {formData.lat && formData.lng && (
        <div
          className={`validation-info ${
            validation.isInCampus ? "valid" : "invalid"
          }`}>
          <div className="validation-icon">
            {validation.isInCampus ? "" : "⚠️"}
          </div>
          <div className="validation-details">
            <strong>
              {validation.isInCampus
                ? "Dentro del campus UCN"
                : "FUERA de los límites del campus"}
            </strong>
            <div className="validation-coords">
              📍 {parseFloat(formData.lat).toFixed(6)},{" "}
              {parseFloat(formData.lng).toFixed(6)}
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
  );
};

export default CoordinateSection;
