import React, { useState } from "react";
import "./FloorImageSection.css";

const FloorImageUpload = ({ buildingId, formId, onFileSelected, showRemove = false, onRemove }) => {
    const [floor, setFloor] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState("");

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar tipo de archivo
            const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
            if (!allowedTypes.includes(file.type)) {
                setError("Solo se permiten archivos JPG, PNG o GIF");
                return;
            }

            // Validar tamaño (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError("El archivo no debe superar 5MB");
                return;
            }

            setSelectedFile(file);
            setError("");

            // Notificar al padre sobre la selección
            if (onFileSelected) {
                console.log(`[FloorImageUpload] FormID ${formId}: Seleccionado archivo ${file.name}, Piso actual: "${floor}"`);
                onFileSelected(formId, floor, file);
            }
        }
    };

    const handleFloorChange = (e) => {
        const newFloor = e.target.value;
        console.log(`[FloorImageUpload] FormID ${formId}: Cambio de piso a "${newFloor}"`);
        setFloor(newFloor);

        // Notificar al padre si hay archivo seleccionado
        if (selectedFile && onFileSelected) {
            console.log(`[FloorImageUpload] FormID ${formId}: Notificando al padre -> Piso: ${newFloor}, Archivo: ${selectedFile.name}`);
            onFileSelected(formId, newFloor, selectedFile);
        }
    };

    const handleClear = () => {
        setFloor("");
        setSelectedFile(null);
        setError("");

        // Notificar al padre que se limpió
        if (onFileSelected) {
            onFileSelected(formId, "", null);
        }
    };

    return (
        <div className="floor-image-upload">
            <div className="upload-header">
                <div className="upload-header-left">
                    <span className="material-icons">add_photo_alternate</span>
                    <h4>Subir Plano por Piso</h4>
                </div>
                {showRemove && (
                    <button
                        type="button"
                        className="remove-upload-form-btn"
                        onClick={onRemove}
                        title="Quitar este formulario"
                    >
                        <span className="material-icons">close</span>
                    </button>
                )}
            </div>

            <div className="upload-form">
                {/* Fila 1: Número de Piso con input */}
                <div className="form-row-horizontal">
                    <label htmlFor={`floor-number-${buildingId}-${formId}`}>
                        <span className="material-icons">layers</span>
                        Número de Piso *
                    </label>
                    <input
                        id={`floor-number-${buildingId}-${formId}`}
                        type="number"
                        value={floor}
                        onChange={handleFloorChange}
                        placeholder="Ej: -1, 1, 2..."
                    />
                </div>

                {/* Fila 2: Solo label de Seleccionar Imagen */}
                <div className="form-row-label-only">
                    <label htmlFor={`image-file-${buildingId}-${formId}`}>
                        <span className="material-icons">image</span>
                        Seleccionar Imagen *
                    </label>
                </div>

                {/* Fila 3: Botón seleccionar archivo y nombre */}
                <div className="form-row-file-input">
                    <div className="file-input-wrapper">
                        <input
                            id={`image-file-${buildingId}-${formId}`}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/gif"
                            onChange={handleFileSelect}
                        />
                        <div className="file-input-display">
                            <button type="button" className="file-select-btn">
                                Seleccionar archivo
                            </button>
                            <span className="file-name">
                                {selectedFile ? selectedFile.name : "Ningún archivo seleccionado"}
                            </span>
                        </div>
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                {selectedFile && floor && (
                    <div className="file-ready-indicator">
                        <span className="material-icons">check_circle</span>
                        <span>Listo para subir al guardar el edificio</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FloorImageUpload;
