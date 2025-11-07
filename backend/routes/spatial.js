// backend/routes/spatial.js
const express = require('express');
const router = express.Router();
const spatialController = require('../controllers/spatialController');

// POST /api/spatial/calculate-route - Calcular ruta óptima
router.post('/calculate-route', spatialController.calculateOptimalRoute);

// POST /api/spatial/nearby-buildings - Encontrar edificios cercanos
router.post('/nearby-buildings', spatialController.findNearbyBuildings);

// GET /api/spatial/analyze-routes - Analizar todas las rutas
router.get('/analyze-routes', spatialController.analyzeRoutes);

// POST /api/spatial/validate-locations - Validar múltiples ubicaciones
router.post('/validate-locations', spatialController.validateLocations);

module.exports = router;