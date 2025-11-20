// components/user/MobileMapControls.jsx
import React from 'react';
import './mobile-components.css';

/**
 * Controles flotantes del mapa (zoom, ubicación, rutas)
 */
function MobileMapControls({
    onMyLocation,
    onRouteToggle,
    geoLoading,
    mapInstance
}) {
    const handleZoomIn = () => {
        if (mapInstance) {
            mapInstance.zoomIn();
        }
    };

    const handleZoomOut = () => {
        if (mapInstance) {
            mapInstance.zoomOut();
        }
    };

    return (
        <div className="mobile-map-controls">
            {/* Botón de ubicación actual */}
            <button
                className="map-control-button location-button"
                onClick={onMyLocation}
                disabled={geoLoading}
                aria-label="Mi ubicación"
            >
                {geoLoading ? (
                    <svg className="spinner" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="2" x2="12" y2="6"></line>
                        <line x1="12" y1="18" x2="12" y2="22"></line>
                        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                        <line x1="2" y1="12" x2="6" y2="12"></line>
                        <line x1="18" y1="12" x2="22" y2="12"></line>
                        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                    </svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v2"></path>
                        <path d="M12 20v2"></path>
                        <path d="m4.93 4.93 1.41 1.41"></path>
                        <path d="m17.66 17.66 1.41 1.41"></path>
                        <path d="M2 12h2"></path>
                        <path d="M20 12h2"></path>
                        <path d="m6.34 17.66-1.41 1.41"></path>
                        <path d="m19.07 4.93-1.41 1.41"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                )}
            </button>

            {/* Botón de rutas */}
            <button
                className="map-control-button route-button"
                onClick={onRouteToggle}
                aria-label="Calcular ruta"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="6" cy="19" r="3"></circle>
                    <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"></path>
                    <circle cx="18" cy="5" r="3"></circle>
                </svg>
            </button>

            {/* Controles de zoom */}
            <div className="zoom-controls">
                <button
                    className="zoom-button"
                    onClick={handleZoomIn}
                    aria-label="Acercar"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>
                <div className="zoom-divider" />
                <button
                    className="zoom-button"
                    onClick={handleZoomOut}
                    aria-label="Alejar"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </button>
            </div>
        </div>
    );
}

export default MobileMapControls;
