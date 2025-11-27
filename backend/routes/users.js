// backend/routes/users.js
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

/**
 * @route   GET /api/users
 * @desc    Obtener todos los administradores
 * @access  Private (requiere autenticación)
 */
router.get('/', usersController.getAllUsers);

/**
 * @route   POST /api/users
 * @desc    Crear nuevo administrador
 * @access  Private (requiere autenticación)
 */
router.post('/', usersController.createUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Eliminar administrador
 * @access  Private (requiere autenticación)
 */
router.delete('/:id', usersController.deleteUser);

/**
 * @route   PUT /api/users/:id/password
 * @desc    Actualizar contraseña de administrador
 * @access  Private (requiere autenticación)
 */
router.put('/:id/password', usersController.updatePassword);

/**
 * @route   PUT /api/users/:id/status
 * @desc    Actualizar estado activo de administrador
 * @access  Private (requiere autenticación)
 */
router.put('/:id/status', usersController.updateUserStatus);

module.exports = router;
