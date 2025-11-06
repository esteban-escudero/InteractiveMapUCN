const express = require("express");
const router = express.Router();
const routesController = require("../controllers/routesController");
const spatialValidation = require('../middleware/spatialValidation');

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

// LUEGO MODIFICAR LAS RUTAS:
router.post("/", 
  spatialValidation.validateRouteGeometry,
  spatialValidation.validateRoutePoints, 
  spatialValidation.optimizeRoute,
  routesController.createRoute
);

router.put("/:id",
  spatialValidation.validateRouteGeometry,
  spatialValidation.validateRoutePoints,
  spatialValidation.optimizeRoute, 
  routesController.updateRoute
);

module.exports = router;
