// backend/routes/routeNodes.js
const express = require('express');
const router = express.Router();
const routeNodesController = require('../controllers/routeNodesController');

// GET /api/route-nodes/shared - Obtener todos los nodos compartidos
router.get('/shared', routeNodesController.getSharedNodes);

// GET /api/route-nodes/:nodeId/routes - Obtener rutas que comparten un nodo
router.get('/:nodeId/routes', routeNodesController.getRoutesByNode);

// GET /api/route-nodes/intersections/:route1Id/:route2Id - Intersecciones entre rutas
router.get('/intersections/:route1Id/:route2Id', routeNodesController.getRouteIntersections);

// POST /api/route-nodes/suggest/:routeId - Sugerir conexiones para una ruta
router.post('/suggest/:routeId', routeNodesController.suggestConnections);

// GET /api/route-nodes/analyze-network - Analizar red completa
router.get('/analyze-network', routeNodesController.analyzeNetwork);

// POST /api/route-nodes/nearby - Encontrar nodos cercanos a un punto
router.post('/nearby', routeNodesController.findNearbyNodes);

module.exports = router;