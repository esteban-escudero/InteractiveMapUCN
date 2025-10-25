const roomModel = require('../models/roomModel');

const roomsController = {
  async createRooms(req, res) {
    try {
      const roomsData = req.body;
      
      console.log('📥 Datos recibidos para crear salas:', roomsData);
      
      if (!Array.isArray(roomsData) || roomsData.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere un array de salas'
        });
      }

      // Validar datos básicos
      for (const room of roomsData) {
        if (!room.id_edificio || !room.nombre_sala || !room.piso || !room.tipo_sala) {
          return res.status(400).json({
            success: false,
            message: 'Todos los campos son requeridos: id_edificio, nombre_sala, piso, tipo_sala'
          });
        }
      }
      
      const createdRooms = await roomModel.createRooms(roomsData);
      
      res.status(201).json({
        success: true,
        message: `${createdRooms.length} salas creadas exitosamente`,
        data: createdRooms
      });
      
    } catch (error) {
      console.error('Error creando salas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al crear las salas: ' + error.message
      });
    }
  },

  async getRoomsByBuilding(req, res) {
    try {
      const { buildingId } = req.params;
      
      if (!buildingId) {
        return res.status(400).json({
          success: false,
          message: 'ID del edificio es requerido'
        });
      }
      
      const rooms = await roomModel.getByBuildingId(buildingId);
      
      res.json({
        success: true,
        data: rooms,
        count: rooms.length
      });
      
    } catch (error) {
      console.error('Error obteniendo salas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al obtener las salas: ' + error.message
      });
    }
  },

  async updateRoom(req, res) {
    try {
      const { id } = req.params;
      const roomData = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID de la sala es requerido'
        });
      }
      
      const updatedRoom = await roomModel.update(id, roomData);
      
      if (!updatedRoom) {
        return res.status(404).json({
          success: false,
          message: 'Sala no encontrada'
        });
      }
      
      res.json({
        success: true,
        message: 'Sala actualizada exitosamente',
        data: updatedRoom
      });
      
    } catch (error) {
      console.error('Error actualizando sala:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al actualizar la sala: ' + error.message
      });
    }
  },

  async deleteRoom(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID de la sala es requerido'
        });
      }
      
      const result = await roomModel.delete(id);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Sala no encontrada'
        });
      }
      
      res.json({
        success: true,
        message: `Sala "${result.nombre_sala}" eliminada exitosamente`,
        data: { id: result.id_sala, nombre: result.nombre_sala }
      });
      
    } catch (error) {
      console.error('Error eliminando sala:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al eliminar la sala: ' + error.message
      });
    }
  }
};

module.exports = roomsController;