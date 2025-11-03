const express = require("express");
const router = express.Router();
const routesController = require("../controllers/routesController");

// GET /api/routes - Obtener todas las rutas
router.get("/", routesController.getAllRoutes);

// POST /api/routes - Crear nueva ruta
router.post("/", routesController.createRoute);

// PUT /api/routes/:id - Actualizar ruta existente
router.put("/:id", routesController.updateRoute);

// DELETE /api/routes/:id - Eliminar ruta
router.delete("/:id", routesController.deleteRoute);

// POST /api/routes/calculate - Calcular ruta entre dos puntos
router.post("/calculate", routesController.calculateRoute);

module.exports = router;
