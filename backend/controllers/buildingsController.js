// backend/controllers/buildingsController.js
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
      
      if (!nombre || !ubicacion) {
        return res.status(400).json({
          success: false,
          message: 'Nombre y ubicación son campos requeridos'
        });
      }
      
      const buildingData = {
        nombre,
        descripcion: descripcion || '',
        ubicacion,
        activo: activo !== false
      };
      
      console.log('📤 Datos a guardar en BD:', buildingData);
      
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

  // ✅ AGREGAR ESTA FUNCIÓN FALTANTE
  async updateBuilding(req, res) {
    try {
      const { id } = req.params;
      const { nombre, descripcion, ubicacion, activo } = req.body;
      
      console.log(`📥 Actualizando edificio ID: ${id}`, req.body);
      
      if (!nombre || !ubicacion) {
        return res.status(400).json({
          success: false,
          message: 'Nombre y ubicación son campos requeridos'
        });
      }
      
      const buildingData = {
        nombre,
        descripcion: descripcion || '',
        ubicacion,
        activo: activo !== false
      };
      
      const updatedBuilding = await buildingModel.update(id, buildingData);
      
      if (!updatedBuilding) {
        return res.status(404).json({
          success: false,
          message: 'Edificio no encontrado'
        });
      }
      
      res.json({
        success: true,
        message: 'Edificio actualizado exitosamente',
        data: updatedBuilding
      });
      
    } catch (error) {
      console.error('Error actualizando edificio:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al actualizar el edificio: ' + error.message
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