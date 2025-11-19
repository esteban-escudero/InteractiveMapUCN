// backend/routes/auth.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/authMiddleware");

/**
 * @route   POST /api/auth/login
 * @desc    Login de admin
 * @access  Public
 */
router.post("/login", authController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Renovar access token usando refresh token
 * @access  Public
 */
router.post("/refresh", authController.refresh);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout (eliminar refresh token)
 * @access  Public
 */
router.post("/logout", authController.logout);

/**
 * @route   POST /api/auth/logout-all
 * @desc    Cerrar todas las sesiones
 * @access  Private (requiere token)
 */
router.post("/logout-all", authenticateToken, authController.logoutAll);

/**
 * @route   GET /api/auth/me
 * @desc    Obtener información del admin actual
 * @access  Private
 */
router.get("/me", authenticateToken, authController.me);

/**
 * @route   GET /api/auth/sessions
 * @desc    Obtener sesiones activas del admin
 * @access  Private
 */
router.get("/sessions", authenticateToken, authController.getSessions);

module.exports = router;
