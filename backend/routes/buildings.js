const express = require('express');
const router = express.Router();
const buildingsController = require('../controllers/buildingsController');

router.get('/', buildingsController.getAllBuildings);
router.post('/', buildingsController.createBuilding); // ✅ AGREGAR ESTA LÍNEA
router.post('/sync', buildingsController.syncWithGeoServer);

module.exports = router;