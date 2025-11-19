// backend/controllers/authController.js
const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");

/**
 * Generar Access Token (corta duración)
 */
const generateAccessToken = (admin) => {
  return jwt.sign(
    {
      id: admin.id_admin,
      email: admin.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" } // 15 minutos
  );
};

/**
 * Generar Refresh Token (larga duración)
 */
const generateRefreshToken = (admin) => {
  return jwt.sign(
    {
      id: admin.id_admin,
      email: admin.email,
      type: "refresh",
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" } // 7 días
  );
};

/**
 * LOGIN
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validar campos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email y contraseña son requeridos",
      });
    }

    // 2. Buscar admin
    const admin = await UserModel.findByEmail(email);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    // 3. Verificar contraseña
    const isValidPassword = await UserModel.verifyPassword(
      password,
      admin.password_hash
    );

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    // 4. Generar tokens
    const accessToken = generateAccessToken(admin);
    const refreshToken = generateRefreshToken(admin);

    // 5. Guardar refresh token en BD
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"];

    await UserModel.saveRefreshToken(
      admin.id_admin,
      refreshToken,
      expiresAt,
      ipAddress,
      userAgent
    );

    // 6. Actualizar última actividad (opcional)
    await UserModel.updateLastLogin(admin.id_admin);

    // 7. Responder
    res.json({
      success: true,
      message: "Login exitoso",
      data: {
        admin: {
          id: admin.id_admin,
          email: admin.email,
          nombre: admin.nombre,
        },
        accessToken,
        refreshToken,
        expiresIn: 900, // 15 minutos en segundos
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      success: false,
      message: "Error al procesar login",
    });
  }
};

/**
 * REFRESH TOKEN - Renovar access token
 */
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token no proporcionado",
      });
    }

    // 1. Verificar que el token sea válido
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Refresh token inválido o expirado",
      });
    }

    // 2. Buscar token en BD
    const tokenData = await UserModel.findRefreshToken(refreshToken);

    if (!tokenData) {
      return res.status(401).json({
        success: false,
        message: "Refresh token no válido",
      });
    }

    // 3. Generar nuevo access token
    const admin = {
      id_admin: tokenData.id_admin,
      email: tokenData.email,
    };

    const newAccessToken = generateAccessToken(admin);

    // 4. Responder
    res.json({
      success: true,
      message: "Token renovado",
      data: {
        accessToken: newAccessToken,
        expiresIn: 900, // 15 minutos
      },
    });
  } catch (error) {
    console.error("Error en refresh:", error);
    res.status(500).json({
      success: false,
      message: "Error al renovar token",
    });
  }
};

/**
 * LOGOUT - Cerrar sesión
 */
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Eliminar el refresh token de la BD
      await UserModel.deleteRefreshToken(refreshToken);
    }

    res.json({
      success: true,
      message: "Sesión cerrada correctamente",
    });
  } catch (error) {
    console.error("Error en logout:", error);
    res.status(500).json({
      success: false,
      message: "Error al cerrar sesión",
    });
  }
};

/**
 * LOGOUT ALL - Cerrar todas las sesiones
 */
const logoutAll = async (req, res) => {
  try {
    const adminId = req.admin.id; // Del middleware authenticateToken

    await UserModel.deleteAllRefreshTokens(adminId);

    res.json({
      success: true,
      message: "Todas las sesiones cerradas correctamente",
    });
  } catch (error) {
    console.error("Error en logoutAll:", error);
    res.status(500).json({
      success: false,
      message: "Error al cerrar sesiones",
    });
  }
};

/**
 * ME - Obtener información del admin actual
 */
const me = async (req, res) => {
  try {
    const admin = await UserModel.findById(req.admin.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin no encontrado",
      });
    }

    res.json({
      success: true,
      data: {
        admin: {
          id: admin.id_admin,
          email: admin.email,
          nombre: admin.nombre,
          activo: admin.activo,
          fecha_creacion: admin.fecha_creacion,
        },
      },
    });
  } catch (error) {
    console.error("Error en me:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener información del usuario",
    });
  }
};

/**
 * GET SESSIONS - Obtener sesiones activas
 */
const getSessions = async (req, res) => {
  try {
    const sessions = await UserModel.getActiveSessions(req.admin.id);

    res.json({
      success: true,
      data: {
        sessions: sessions.map((s) => ({
          id: s.id,
          createdAt: s.created_at,
          expiresAt: s.expires_at,
          ipAddress: s.ip_address,
          userAgent: s.user_agent,
        })),
      },
    });
  } catch (error) {
    console.error("Error en getSessions:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener sesiones",
    });
  }
};

module.exports = {
  login,
  refresh,
  logout,
  logoutAll,
  me,
  getSessions,
};
