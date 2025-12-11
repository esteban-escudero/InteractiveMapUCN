const buildingImageModel = require("../models/buildingImageModel");
const fs = require("fs");
const path = require("path");

const buildingImageController = {
    /**
     * Subir una nueva imagen para un edificio
     */
    async uploadImage(req, res) {
        try {
            console.log('[uploadImage] Iniciando subida de imagen');
            console.log('[uploadImage] req.file:', req.file);
            console.log('[uploadImage] req.body:', req.body);

            if (!req.file) {
                console.log('[uploadImage] ERROR: No se proporcionó archivo');
                return res.status(400).json({
                    success: false,
                    message: "No se proporcionó ningún archivo",
                });
            }

            const { buildingId, floor } = req.body;

            // Validaciones
            if (!buildingId || !floor) {
                console.log('[uploadImage] ERROR: Faltan buildingId o floor');
                // Eliminar archivo subido si falta información
                fs.unlinkSync(req.file.path);
                return res.status(400).json({
                    success: false,
                    message: "Se requiere buildingId y floor",
                });
            }

            const floorNumber = parseInt(floor);
            if (isNaN(floorNumber)) {
                console.log('[uploadImage] ERROR: floor no es un número válido');
                fs.unlinkSync(req.file.path);
                return res.status(400).json({
                    success: false,
                    message: "El número de piso debe ser un número válido",
                });
            }

            // Asegurar que el directorio de uploads existe
            const uploadsDir = path.join(__dirname, '..', 'uploads', 'buildings');
            if (!fs.existsSync(uploadsDir)) {
                console.log('[uploadImage] Creando directorio de uploads:', uploadsDir);
                fs.mkdirSync(uploadsDir, { recursive: true });
            }

            // Extraer formato de imagen (extensión sin el punto)
            const format = path.extname(req.file.filename).substring(1).toLowerCase();

            // Crear registro en la base de datos
            const imageData = {
                buildingId: parseInt(buildingId),
                floor: floorNumber,
                filename: req.file.filename,
                filepath: `/uploads/buildings/${req.file.filename}`,
                format: format,
                sizeBytes: req.file.size,
            };

            console.log('[uploadImage] Creando registro en BD:', imageData);
            const newImage = await buildingImageModel.create(imageData);

            console.log("✅ Imagen subida exitosamente:", newImage);

            res.status(201).json({
                success: true,
                message: "Imagen subida exitosamente",
                data: newImage,
            });
        } catch (error) {
            console.error("[uploadImage] ERROR:", error);
            console.error("[uploadImage] Stack:", error.stack);

            // Eliminar archivo si hubo error en BD
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            res.status(500).json({
                success: false,
                message: "Error al subir la imagen",
                error: error.message,
            });
        }
    },

    /**
     * Obtener todas las imágenes de un edificio
     */
    async getImagesByBuilding(req, res) {
        try {
            const { buildingId } = req.params;

            if (!buildingId) {
                return res.status(400).json({
                    success: false,
                    message: "Se requiere buildingId",
                });
            }

            const images = await buildingImageModel.getByBuildingId(
                parseInt(buildingId)
            );

            res.status(200).json({
                success: true,
                data: images,
            });
        } catch (error) {
            console.error("Error en getImagesByBuilding:", error.message);
            res.status(500).json({
                success: false,
                message: "Error al obtener las imágenes",
                error: error.message,
            });
        }
    },

    /**
     * Obtener imágenes de un edificio por piso
     */
    async getImagesByFloor(req, res) {
        try {
            const { buildingId, floor } = req.params;

            if (!buildingId || !floor) {
                return res.status(400).json({
                    success: false,
                    message: "Se requiere buildingId y floor",
                });
            }

            const images = await buildingImageModel.getByBuildingAndFloor(
                parseInt(buildingId),
                parseInt(floor)
            );

            res.status(200).json({
                success: true,
                data: images,
            });
        } catch (error) {
            console.error("Error en getImagesByFloor:", error.message);
            res.status(500).json({
                success: false,
                message: "Error al obtener las imágenes",
                error: error.message,
            });
        }
    },

    /**
     * Eliminar una imagen
     */
    async deleteImage(req, res) {
        try {
            const { imageId } = req.params;

            if (!imageId) {
                return res.status(400).json({
                    success: false,
                    message: "Se requiere imageId",
                });
            }

            // Eliminar de la base de datos
            const deletedImage = await buildingImageModel.delete(parseInt(imageId));

            // Eliminar archivo físico
            const filepath = path.join(
                __dirname,
                "..",
                "uploads",
                "buildings",
                deletedImage.filename
            );

            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
                console.log("🗑️ Archivo eliminado:", filepath);
            }

            res.status(200).json({
                success: true,
                message: "Imagen eliminada exitosamente",
                data: deletedImage,
            });
        } catch (error) {
            console.error("Error en deleteImage:", error.message);
            res.status(500).json({
                success: false,
                message: "Error al eliminar la imagen",
                error: error.message,
            });
        }
    },
};

module.exports = buildingImageController;
