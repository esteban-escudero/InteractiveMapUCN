// backend/models/userModel.js
const pool = require("../config/database");
const bcrypt = require("bcryptjs");

class UserModel {
  /**
   * Buscar admin por email
   */
  static async findByEmail(email) {
    const query = `
      SELECT 
        id_admin,
        email,
        password_hash,
        nombre,
        activo,
        fecha_creacion
      FROM administrador 
      WHERE email = $1 AND activo = true
    `;

    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  /**
   * Buscar admin por ID
   */
  static async findById(id) {
    const query = `
      SELECT 
        id_admin,
        email,
        nombre,
        activo,
        fecha_creacion
      FROM administrador 
      WHERE id_admin = $1 AND activo = true
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Verificar contraseña
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Crear admin (para uso interno/scripts)
   */
  static async create(email, password, nombre) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO administrador (email, password_hash, nombre, activo, fecha_creacion)
      VALUES ($1, $2, $3, true, NOW())
      RETURNING id_admin, email, nombre, activo, fecha_creacion
    `;

    const result = await pool.query(query, [email, hashedPassword, nombre]);
    return result.rows[0];
  }

  /**
   * Actualizar última actividad (opcional)
   */
  static async updateLastLogin(id) {
    const query = `
      UPDATE administrador 
      SET fecha_creacion = NOW() 
      WHERE id_admin = $1
    `;

    await pool.query(query, [id]);
  }

  /**
   * REFRESH TOKENS
   */

  /**
   * Guardar refresh token
   */
  static async saveRefreshToken(
    adminId,
    token,
    expiresAt,
    ipAddress,
    userAgent
  ) {
    const query = `
      INSERT INTO refresh_tokens (id_admin, token, expires_at, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;

    const result = await pool.query(query, [
      adminId,
      token,
      expiresAt,
      ipAddress || null,
      userAgent || null,
    ]);

    return result.rows[0];
  }

  /**
   * Buscar refresh token
   */
  static async findRefreshToken(token) {
    const query = `
      SELECT 
        rt.id,
        rt.id_admin,
        rt.token,
        rt.expires_at,
        a.email,
        a.nombre,
        a.activo
      FROM refresh_tokens rt
      INNER JOIN administrador a ON rt.id_admin = a.id_admin
      WHERE rt.token = $1 AND rt.expires_at > NOW() AND a.activo = true
    `;

    const result = await pool.query(query, [token]);
    return result.rows[0];
  }

  /**
   * Eliminar refresh token específico (logout)
   */
  static async deleteRefreshToken(token) {
    const query = "DELETE FROM refresh_tokens WHERE token = $1";
    await pool.query(query, [token]);
  }

  /**
   * Eliminar todos los refresh tokens de un admin (logout all devices)
   */
  static async deleteAllRefreshTokens(adminId) {
    const query = "DELETE FROM refresh_tokens WHERE id_admin = $1";
    await pool.query(query, [adminId]);
  }

  /**
   * Limpiar tokens expirados
   */
  static async cleanExpiredTokens() {
    const query = "DELETE FROM refresh_tokens WHERE expires_at < NOW()";
    const result = await pool.query(query);
    return result.rowCount;
  }

  /**
   * Obtener sesiones activas de un admin
   */
  static async getActiveSessions(adminId) {
    const query = `
      SELECT 
        id,
        created_at,
        expires_at,
        ip_address,
        user_agent
      FROM refresh_tokens
      WHERE id_admin = $1 AND expires_at > NOW()
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [adminId]);
    return result.rows;
  }
}

module.exports = UserModel;
