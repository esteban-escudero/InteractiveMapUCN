// backend/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");

/**
 * Middleware para verificar JWT Access Token
 */
const authenticateToken = async (req, res, next) => {
  try {
    // 1. Obtener token del header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token de acceso no proporcionado",
      });
    }

    // 2. Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Verificar que el admin siga activo
    const admin = await UserModel.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Usuario no autorizado",
      });
    }

    // 4. Agregar info del admin al request
    req.admin = {
      id: decoded.id,
      email: decoded.email,
      nombre: admin.nombre,
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expirado",
        code: "TOKEN_EXPIRED",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token inválido",
      });
    }

    console.error("Error en authenticateToken:", error);
    return res.status(500).json({
      success: false,
      message: "Error al verificar autenticación",
    });
  }
};

/**
 * Middleware opcional - Solo verifica si hay token pero no falla
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const admin = await UserModel.findById(decoded.id);

      if (admin) {
        req.admin = {
          id: decoded.id,
          email: decoded.email,
          nombre: admin.nombre,
        };
      }
    }

    next();
  } catch (error) {
    // No hacer nada, simplemente continuar sin admin
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
};
