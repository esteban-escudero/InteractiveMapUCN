const express = require('express');
const router = express.Router();
const roomsController = require('../controllers/roomsController');

// POST /api/rooms - Crear múltiples salas
router.post('/', roomsController.createRooms);

// GET /api/rooms/building/:buildingId - Obtener salas por edificio
router.get('/building/:buildingId', roomsController.getRoomsByBuilding);

// PUT /api/rooms/:id - Actualizar sala
router.put('/:id', roomsController.updateRoom);

// DELETE /api/rooms/:id - Eliminar sala
router.delete('/:id', roomsController.deleteRoom);

module.exports = router;