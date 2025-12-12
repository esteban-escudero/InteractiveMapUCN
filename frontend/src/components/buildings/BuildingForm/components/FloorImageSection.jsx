import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import FloorImageUpload from "./FloorImageUpload";
import FloorImageList from "./FloorImageList";
import buildingImageService from "../../../../services/buildingImageService";
import "./FloorImageSection.css";

const FloorImageSection = forwardRef(({ buildingId, buildingName, isEditing }, ref) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [uploadForms, setUploadForms] = useState([{ id: 1 }]);
    const [pendingUploads, setPendingUploads] = useState({});

    const apiBaseUrl = process.env.REACT_APP_API_URL || "http://localhost:3001";

    // Exponer método para subir imágenes pendientes
    useImperativeHandle(ref, () => ({
        async uploadPendingImages() {
            console.log('[FloorImageSection] uploadPendingImages llamado');
            console.log('[FloorImageSection] buildingId:', buildingId);
            console.log('[FloorImageSection] pendingUploads:', pendingUploads);

            const uploads = Object.values(pendingUploads).filter(
                upload => upload.file && upload.floor
            );

            console.log('[FloorImageSection] Uploads filtrados:', uploads.length);

            if (uploads.length === 0) {
                console.log('[FloorImageSection] No hay uploads pendientes');
                return { success: true, uploaded: 0 };
            }

            const results = [];
            for (const upload of uploads) {
                try {
                    console.log(`[FloorImageSection] ------ INICIO SUBIDA ------`);
                    console.log(`[FloorImageSection] Archivo:`, upload.file.name);
                    console.log(`[FloorImageSection] Piso (raw):`, upload.floor, typeof upload.floor);

                    if (parseInt(upload.floor) < 0) {
                        console.log(`[FloorImageSection] Piso negativo detectado (permitido):`, upload.floor);
                    }

                    const response = await buildingImageService.uploadImage(
                        buildingId,
                        upload.floor,
                        upload.file,
                        buildingName
                    );
                    console.log('[FloorImageSection] Upload exitoso:', response);
                    results.push({ success: true, data: response.data });
                } catch (error) {
                    console.error('[FloorImageSection] Error en upload:', error);
                    results.push({ success: false, error: error.message });
                }
            }

            // Limpiar uploads pendientes exitosos
            setPendingUploads({});
            setUploadForms([{ id: 1 }]);

            // Recargar imágenes
            await loadImages();

            const successful = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;

            console.log(`[FloorImageSection] Resultado: ${successful} exitosos, ${failed} fallidos`);

            return {
                success: failed === 0,
                uploaded: successful,
                failed: failed
            };
        },
        getPendingUploads() {
            return Object.values(pendingUploads);
        }
    }));

    // Cargar imágenes cuando se está editando
    useEffect(() => {
        if (isEditing && buildingId) {
            loadImages();
        }
    }, [isEditing, buildingId]);

    const loadImages = async () => {
        console.log('[FloorImageSection] loadImages llamado, buildingId:', buildingId);
        setLoading(true);
        setError("");
        try {
            const response = await buildingImageService.getImagesByBuilding(
                buildingId
            );
            console.log('[FloorImageSection] Respuesta de getImagesByBuilding:', response);
            // response ya es el array de imágenes, no necesita .data
            const imageArray = Array.isArray(response) ? response : (response.data || []);
            console.log('[FloorImageSection] Imágenes a cargar:', imageArray);
            setImages(imageArray);
            console.log('[FloorImageSection] Imágenes cargadas:', imageArray.length);
        } catch (err) {
            console.error("[FloorImageSection] Error al cargar imágenes:", err);
            setError("");
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelected = (formId, floor, file) => {
        setPendingUploads(prev => ({
            ...prev,
            [formId]: { floor, file }
        }));
    };

    const handleDeleteImage = async (imageId) => {
        try {
            await buildingImageService.deleteImage(imageId);
            setImages((prev) => prev.filter((img) => img.id !== imageId));
        } catch (error) {
            throw error;
        }
    };

    const handleAddUploadForm = () => {
        const newId = uploadForms.length > 0 ? Math.max(...uploadForms.map(f => f.id)) + 1 : 1;
        setUploadForms([...uploadForms, { id: newId }]);
    };

    const handleRemoveUploadForm = (formId) => {
        if (uploadForms.length > 1) {
            setUploadForms(uploadForms.filter(f => f.id !== formId));
            // Limpiar pending upload
            setPendingUploads(prev => {
                const newPending = { ...prev };
                delete newPending[formId];
                return newPending;
            });
        }
    };

    // Solo mostrar si estamos editando un edificio existente
    if (!isEditing || !buildingId) {
        return (
            <div className="floor-image-section">
                <div className="section-header">
                    <span className="material-icons">photo_library</span>
                    <h4>Planos por Piso</h4>
                </div>
                <div className="info-message">
                    <span className="material-icons">info</span>
                    <p>Guarde el edificio primero para poder agregar planos</p>
                </div>
            </div>
        );
    }

    const pendingCount = Object.values(pendingUploads).filter(u => u.file && u.floor).length;

    return (
        <div className="floor-image-section">
            <div className="section-header">
                <span className="material-icons">photo_library</span>
                <h4>Planos por Piso</h4>
                {pendingCount > 0 && (
                    <span className="pending-uploads-badge">
                        {pendingCount} {pendingCount === 1 ? 'plano pendiente' : 'planos pendientes'}
                    </span>
                )}
            </div>

            {/* Formularios de carga */}
            <div className="upload-forms-container">
                {uploadForms.map((form, index) => (
                    <div key={form.id} className="upload-form-wrapper">
                        <FloorImageUpload
                            buildingId={buildingId}
                            formId={form.id}
                            onFileSelected={handleFileSelected}
                            showRemove={uploadForms.length > 1}
                            onRemove={() => handleRemoveUploadForm(form.id)}
                        />
                    </div>
                ))}

                <button
                    type="button"
                    className="add-upload-form-btn"
                    onClick={handleAddUploadForm}
                >
                    <span className="material-icons">add_circle</span>
                    Agregar otro plano
                </button>
            </div>

            {/* Lista de imágenes */}
            {loading ? (
                <div className="loading-images">
                    <span className="material-icons spinning">sync</span>
                    <p>Cargando planos...</p>
                </div>
            ) : images.length === 0 ? (
                <div className="no-images-message">
                    <span className="material-icons">architecture</span>
                    <p>Este edificio no tiene planos asignados</p>
                    <small>Seleccione planos y guarde el edificio para subirlos</small>
                </div>
            ) : (
                <FloorImageList
                    images={images}
                    onDeleteImage={handleDeleteImage}
                    apiBaseUrl={apiBaseUrl}
                />
            )}
        </div>
    );
});

export default FloorImageSection;
