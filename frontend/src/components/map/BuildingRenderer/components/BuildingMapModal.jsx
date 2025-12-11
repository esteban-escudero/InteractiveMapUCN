import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./BuildingMapModal.css";

const BuildingMapModal = ({ isOpen, onClose, buildingName, maps = [] }) => {
    const [selectedMapIndex, setSelectedMapIndex] = useState(null);

    // Reset view when modal opens
    useEffect(() => {
        setSelectedMapIndex(null);
    }, [isOpen, maps]);

    if (!isOpen || !maps || maps.length === 0) return null;

    // Sort maps: extract numbers from "Piso -1", "Piso 1", etc.
    const sortedMaps = [...maps].sort((a, b) => {
        const getNum = (str) => {
            const match = str ? str.match(/-?\d+/) : null;
            return match ? parseInt(match[0], 10) : 0;
        };
        return getNum(a.piso) - getNum(b.piso);
    });

    const showMap = selectedMapIndex !== null;
    const selectedMap = showMap ? sortedMaps[selectedMapIndex] : null;

    return ReactDOM.createPortal(
        <div className="building-map-modal-overlay" onClick={onClose} style={{ zIndex: 99999 }}>
            <div
                className="building-map-modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="building-map-modal-header">
                    <h3>
                        <span className="material-icons">map</span>
                        {buildingName}
                    </h3>
                    <button
                        className="building-map-close-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                    >
                        <span className="material-icons">close</span>
                    </button>
                </div>

                <div className="building-map-modal-body" style={{ position: "relative" }}>
                    {/* List View - Always rendered in background, but maybe hidden if we wanted, 
                        but user asked for "on top of that". We'll keep it in DOM. */}
                    <div className="map-list-container">
                        <h4 style={{ margin: "0 0 16px 0", color: "#34495e", textAlign: "center" }}>
                            Selecciona el piso que deseas ver:
                        </h4>
                        <div className="map-grid">
                            {sortedMaps.map((map, index) => (
                                <button
                                    key={index}
                                    className="map-grid-item"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedMapIndex(index);
                                    }}
                                >
                                    <span className="material-icons" style={{ fontSize: "32px", marginBottom: "8px" }}>
                                        layers
                                    </span>
                                    <span style={{ fontWeight: 600 }}>{map.piso || `Piso ${index + 1}`}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Map Overlay */}
                    {showMap && (
                        <div className="map-overlay-view">
                            <button
                                className="close-map-overlay-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedMapIndex(null);
                                }}
                            >
                                <span className="material-icons">close</span>
                            </button>

                            <div className="map-overlay-title">
                                {selectedMap.piso}
                            </div>

                            <div className="map-container">
                                <img
                                    src={selectedMap.url}
                                    alt={`${buildingName} - ${selectedMap.piso}`}
                                    className="floor-plan-image"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.getElementById("modal-root") || document.body
    );
};

export default BuildingMapModal;


