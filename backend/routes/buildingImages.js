const express = require("express");
const router = express.Router();
const buildingImageController = require("../controllers/buildingImageController");
const upload = require("../middleware/uploadMiddleware");

// Subir imagen
router.post(
    "/upload",
    upload.single("image"),
    buildingImageController.uploadImage
);

// Obtener imágenes por edificio
router.get(
    "/building/:buildingId",
    buildingImageController.getImagesByBuilding
);

// Obtener imágenes por edificio y piso
router.get(
    "/building/:buildingId/floor/:floor",
    buildingImageController.getImagesByFloor
);

// Eliminar imagen
router.delete("/:imageId", buildingImageController.deleteImage);

module.exports = router;
