// backend/routes/buildings.js
const express = require('express');
const router = express.Router();
const buildingsController = require('../controllers/buildingsController');
const spatialValidation = require('../middleware/spatialValidation');

// RUTAS CORRECTAS
router.get('/', buildingsController.getAllBuildings);
router.post('/', buildingsController.createBuilding);
router.put('/:id', buildingsController.updateBuilding);
router.delete('/:id', buildingsController.deleteBuilding);
router.post('/sync', buildingsController.syncWithGeoServer);

router.post('/', 
  spatialValidation.validateBuildingLocation,
  buildingsController.createBuilding
);

router.put('/:id',
  spatialValidation.validateBuildingLocation, 
  buildingsController.updateBuilding
);

module.exports = router;