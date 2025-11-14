/**
 * Contenedor principal del mapa
 */
import React from "react";

export const MapContainer = ({ mapRef, isMapReady, children }) => {
  return (
    <div className="Mapa">
      <div ref={mapRef} className="map-container"></div>

      {!isMapReady && (
        <div className="loading-overlay">
          <div className="loading-message">
            <div>Cargando mapa...</div>
            <div className="loading-spinner"></div>
          </div>
        </div>
      )}

      {children}
    </div>
  );
};

