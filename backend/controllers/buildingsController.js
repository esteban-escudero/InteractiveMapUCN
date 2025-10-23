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

  async createBuilding(req, res) {
    try {
      const { nombre, descripcion, ubicacion, activo } = req.body;
      
      console.log('📥 Datos recibidos para crear edificio:', req.body);
      
      // Validaciones básicas
      if (!nombre || !ubicacion) {
        return res.status(400).json({
          success: false,
          message: 'Nombre y ubicación son campos requeridos'
        });
      }
      
      // ✅ SOLO enviar los campos que existen en la BD
      const buildingData = {
        nombre,
        descripcion: descripcion || '',
        ubicacion,
        activo: activo !== false
      };
      
      console.log('📤 Datos a guardar en BD:', buildingData);
      
      // Llamar al model para crear el edificio
      const newBuilding = await buildingModel.create(buildingData);
      
      res.status(201).json({
        success: true,
        message: 'Edificio creado exitosamente',
        data: newBuilding
      });
      
    } catch (error) {
      console.error('Error creando edificio:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al crear el edificio: ' + error.message
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