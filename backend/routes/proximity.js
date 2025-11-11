const express = require("express");
const router = express.Router();
const proximityController = require("../controllers/proximityController");

// Rutas para proximidad entre edificios y rutas
router.get(
  "/building/:buildingId/closest-route",
  proximityController.getClosestRoute
);
router.get(
  "/building/:buildingId/nearby-routes",
  proximityController.getRoutesInRadius
);
router.get(
  "/building/:buildingId/proximity-analysis",
  proximityController.getProximityAnalysis
);
router.get(
  "/route/:routeId/closest-building",
  proximityController.getClosestBuilding
);
router.post(
  "/buildings/assign-routes",
  proximityController.assignRoutesToBuildings
);
router.get(
  "/connect/:originId/:destinationId",
  proximityController.getConnectingRoutes
);

module.exports = router;
