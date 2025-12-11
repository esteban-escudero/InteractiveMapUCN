const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Crear directorio de uploads si no existe
const uploadDir = path.join(__dirname, "..", "uploads", "buildings");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("📁 Directorio de uploads creado:", uploadDir);
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generar nombre legible: BuildingName_Piso_X_timestamp.ext
        const ext = path.extname(file.originalname);
        const name = req.body.buildingName ? req.body.buildingName.replace(/[^a-zA-Z0-9]/g, "_") : "Edificio";
        const floor = req.body.floor || "0";
        const timestamp = Date.now();

        // Formato exacto: Nombre_Piso_X...
        const filename = `${name}_Piso_${floor}_${timestamp}${ext}`;
        cb(null, filename);
    },
});

// Filtro de tipos de archivo
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(
        path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(
            new Error(
                "Tipo de archivo no permitido. Solo se permiten: JPG, JPEG, PNG, GIF"
            )
        );
    }
};

// Configuración de multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: fileFilter,
});

module.exports = upload;
