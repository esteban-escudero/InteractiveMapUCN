// components/user/MobileInfoPanel.jsx
import React from 'react';
import './mobile-components.css';

/**
 * Panel de información deslizable (bottom sheet)
 * Muestra detalles de la ubicación seleccionada
 */
function MobileInfoPanel({
    location,
    onClose,
    onSetAsOrigin,
    onSetAsDestination,
    onCalculateRoute
}) {
    if (!location) return null;

    return (
        <>
            {/* Overlay */}
            <div className="panel-overlay" onClick={onClose} />

            {/* Panel */}
            <div className="mobile-info-panel">
                {/* Handle para arrastrar */}
                <div className="panel-handle">
                    <div className="handle-bar" />
                </div>

                {/* Contenido */}
                <div className="panel-content">
                    {/* Header */}
                    <div className="panel-header">
                        <div className="location-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                        </div>
                        <div className="location-info">
                            <h2 className="location-name">{location.name}</h2>
                            {location.category && (
                                <span className="location-category">{location.category}</span>
                            )}
                        </div>
                        <button className="close-button" onClick={onClose} aria-label="Cerrar">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    {/* Descripción */}
                    {location.description && (
                        <div className="location-description">
                            <p>{location.description}</p>
                        </div>
                    )}

                    {/* Detalles adicionales */}
                    <div className="location-details">
                        {location.floor && (
                            <div className="detail-item">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="9" y1="9" x2="15" y2="9"></line>
                                </svg>
                                <span>Piso {location.floor}</span>
                            </div>
                        )}
                        {location.capacity && (
                            <div className="detail-item">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                                <span>Capacidad: {location.capacity}</span>
                            </div>
                        )}
                    </div>

                    {/* Acciones */}
                    <div className="panel-actions">
                        <button
                            className="action-button secondary"
                            onClick={onSetAsOrigin}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            Establecer como origen
                        </button>

                        <button
                            className="action-button secondary"
                            onClick={onSetAsDestination}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            Establecer como destino
                        </button>

                        <button
                            className="action-button primary"
                            onClick={onCalculateRoute}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                            </svg>
                            Calcular ruta
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export default MobileInfoPanel;
