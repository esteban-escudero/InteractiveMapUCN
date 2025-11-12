// components/routes/RouteForm/components/RouteDetailsSection.jsx
import React from "react";

const RouteDetailsSection = ({ formData }) => {
  return (
    <div className="route-details">
      <h4>
        <span className="material-icons">analytics</span>
        Detalles de Ruta (Turf.js)
      </h4>
      <div className="route-stats">
        <div className="stat-item">
          <span className="stat-label">Distancia:</span>
          <span className="stat-value">{formData.distancia} m</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Tiempo estimado:</span>
          <span className="stat-value">{formData.tiempo_estimado} min</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Puntos:</span>
          <span className="stat-value">{formData.puntos_ruta.length}</span>
        </div>
      </div>
    </div>
  );
};

export default RouteDetailsSection;
