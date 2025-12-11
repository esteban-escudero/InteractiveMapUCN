import React, { useState } from "react";
import ConfirmDialog from "../../../ui/ConfirmDialog/ConfirmDialog";

const FloorImageList = ({ images, onDeleteImage, apiBaseUrl }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [deleting, setDeleting] = useState(null);

    // Estado para confirmación
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [imageToDelete, setImageToDelete] = useState(null);

    // Agrupar imágenes por piso
    const imagesByFloor = images.reduce((acc, image) => {
        const floor = image.floor;
        if (!acc[floor]) {
            acc[floor] = [];
        }
        acc[floor].push(image);
        return acc;
    }, {});

    const handleDeleteClick = (image) => {
        setImageToDelete(image);
        setConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!imageToDelete) return;

        const imageId = imageToDelete.id;
        setConfirmOpen(false);
        setImageToDelete(null);

        setDeleting(imageId);
        try {
            await onDeleteImage(imageId);
        } catch (error) {
            console.error("Error al eliminar imagen:", error);
        } finally {
            setDeleting(null);
        }
    };

    const handleCancelDelete = () => {
        setConfirmOpen(false);
        setImageToDelete(null);
    };

    const handleImageClick = (image) => {
        setSelectedImage(image);
    };

    const closeModal = () => {
        setSelectedImage(null);
    };

    if (images.length === 0) {
        return (
            <div className="no-images">
                <span className="material-icons">photo_library</span>
                <p>No hay imágenes cargadas para este edificio</p>
            </div>
        );
    }

    return (
        <div className="floor-image-list">
            {Object.keys(imagesByFloor)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map((floor) => (
                    <div key={floor} className="floor-group">
                        {imagesByFloor[floor].map((image) => (
                            <div key={image.id} className="image-item">
                                <div className="floor-label">
                                    <span className="material-icons">layers</span>
                                    <span className="floor-text">Piso {floor}</span>
                                </div>

                                <span className="material-icons file-icon">insert_drive_file</span>
                                <a
                                    href="#"
                                    className="image-filename"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleImageClick(image);
                                    }}
                                    title="Click para ver imagen completa"
                                >
                                    {image.filename}
                                </a>

                                <button
                                    type="button"
                                    className="delete-image-btn"
                                    onClick={() => handleDeleteClick(image)}
                                    disabled={deleting === image.id}
                                    title="Eliminar imagen"
                                >
                                    {deleting === image.id ? (
                                        <span className="material-icons spinning">sync</span>
                                    ) : (
                                        <span className="material-icons">close</span>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                ))}

            {/* Modal para ver imagen completa */}
            {selectedImage && (
                <div className="image-modal" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-modal-btn" onClick={closeModal}>
                            <span className="material-icons">close</span>
                        </button>
                        <img
                            src={`${apiBaseUrl}${selectedImage.filepath}`}
                            alt={`Piso ${selectedImage.floor}`}
                        />
                        <div className="modal-info">
                            <p>
                                <strong>Piso:</strong> {selectedImage.floor}
                            </p>
                            <p>
                                <strong>Fecha:</strong>{" "}
                                {new Date(selectedImage.uploadDate).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Diálogo de Confirmación */}
            <ConfirmDialog
                isOpen={confirmOpen}
                title="Eliminar Plano"
                message={`¿Está seguro de que desea eliminar el plano del Piso ${imageToDelete?.floor}? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
                type="danger"
            />
        </div>
    );
};

export default FloorImageList;
