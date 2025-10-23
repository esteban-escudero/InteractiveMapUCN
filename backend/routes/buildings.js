// backend/routes/buildings.js
const express = require('express');
const router = express.Router();
const buildingsController = require('../controllers/buildingsController');

// ✅ RUTAS CORRECTAS
router.get('/', buildingsController.getAllBuildings);
router.post('/', buildingsController.createBuilding);
router.put('/:id', buildingsController.updateBuilding);
router.delete('/:id', buildingsController.deleteBuilding);
router.post('/sync', buildingsController.syncWithGeoServer);

module.exports = router;