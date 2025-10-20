const express = require('express');
const router = express.Router();
const buildingsController = require('../controllers/buildingsController');

router.get('/', buildingsController.getAllBuildings);
router.post('/sync', buildingsController.syncWithGeoServer);

module.exports = router;