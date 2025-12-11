import { api } from "./api";

const API_BASE_URL = "http://localhost:3001/api";

const buildingImageService = {
    /**
     * Subir una imagen para un edificio
     */
    async uploadImage(buildingId, floor, file, buildingName) {
        try {
            const formData = new FormData();
            // IMPORTANTE: Los campos de texto deben ir PRIMERO para que multer los lea en req.body
            formData.append("buildingId", buildingId);
            formData.append("floor", floor);
            if (buildingName) formData.append("buildingName", buildingName);
            // El archivo va al final
            formData.append("image", file);

            // Usar fetch directamente para FormData (no JSON)
            const response = await fetch(`${API_BASE_URL}/building-images/upload`, {
                method: "POST",
                body: formData,
                // No establecer Content-Type, el navegador lo hará automáticamente con boundary
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error al subir imagen");
            }

            return await response.json();
        } catch (error) {
            console.error("Error en uploadImage:", error);
            throw error;
        }
    },

    /**
     * Obtener todas las imágenes de un edificio
     */
    async getImagesByBuilding(buildingId) {
        try {
            const response = await api.get(`/building-images/building/${buildingId}`);
            return response.data;
        } catch (error) {
            console.error("Error en getImagesByBuilding:", error);
            throw error;
        }
    },

    /**
     * Obtener imágenes de un edificio por piso
     */
    async getImagesByFloor(buildingId, floor) {
        try {
            const response = await api.get(
                `/building-images/building/${buildingId}/floor/${floor}`
            );
            return response.data;
        } catch (error) {
            console.error("Error en getImagesByFloor:", error);
            throw error;
        }
    },

    /**
     * Eliminar una imagen
     */
    async deleteImage(imageId) {
        try {
            const response = await api.delete(`/building-images/${imageId}`);
            return response.data;
        } catch (error) {
            console.error("Error en deleteImage:", error);
            throw error;
        }
    },
};

export default buildingImageService;
