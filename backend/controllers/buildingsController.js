const buildingModel = require('../models/buildingModel');

const buildingsController = {
  async getAllBuildings(req, res) {
    try {
      const buildings = await buildingModel.getAll();
      res.json({
        success: true,
        data: buildings,
        count: buildings.length
      });
    } catch (error) {
      console.error('Error obteniendo edificios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  async syncWithGeoServer(req, res) {
    try {
      const { features } = req.body;
      
      if (!features || !Array.isArray(features)) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere un array de features'
        });
      }
      
      const syncedBuildings = await buildingModel.syncFromGeoServer(features);
      
      res.json({
        success: true,
        message: `Sincronización completada. ${syncedBuildings.length} nuevos edificios agregados.`,
        data: syncedBuildings
      });
    } catch (error) {
      console.error('Error sincronizando con GeoServer:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
};

module.exports = buildingsController;