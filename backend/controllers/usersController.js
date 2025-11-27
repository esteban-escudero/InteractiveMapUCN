// backend/controllers/usersController.js
const UserModel = require('../models/userModel');
const bcrypt = require('bcryptjs');

class UsersController {
    /**
     * Obtener todos los administradores
     * GET /api/users
     */
    async getAllUsers(req, res) {
        try {
            const query = `
        SELECT 
          id_admin,
          email,
          nombre,
          activo,
          fecha_creacion
        FROM administrador 
        WHERE activo = true
        ORDER BY fecha_creacion DESC
      `;

            const pool = require('../config/database');
            const result = await pool.query(query);

            console.log(`📋 ${result.rows.length} administradores encontrados`);

            res.json({
                success: true,
                data: result.rows,
            });
        } catch (error) {
            console.error('❌ Error obteniendo usuarios:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener la lista de administradores',
                error: error.message,
            });
        }
    }

    /**
     * Crear nuevo administrador
     * POST /api/users
     */
    async createUser(req, res) {
        try {
            const { email, password, nombre } = req.body;

            // Validaciones
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email y contraseña son requeridos',
                });
            }

            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Formato de email inválido',
                });
            }

            // Validar longitud de contraseña
            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'La contraseña debe tener al menos 6 caracteres',
                });
            }

            // Verificar si el email ya existe
            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'Ya existe un administrador con este email',
                });
            }

            // Crear el nuevo administrador
            const newUser = await UserModel.create(email, password, nombre || email.split('@')[0]);

            console.log(`✅ Nuevo administrador creado: ${email}`);

            res.status(201).json({
                success: true,
                message: 'Administrador creado exitosamente',
                data: {
                    id_admin: newUser.id_admin,
                    email: newUser.email,
                    nombre: newUser.nombre,
                    fecha_creacion: newUser.fecha_creacion,
                },
            });
        } catch (error) {
            console.error('❌ Error creando usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear el administrador',
                error: error.message,
            });
        }
    }

    /**
     * Eliminar administrador (soft delete)
     * DELETE /api/users/:id
     */
    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const currentUserId = req.admin.id; // Del middleware de autenticación

            // Validar que el ID sea un número
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de usuario inválido',
                });
            }

            // No permitir auto-eliminación
            if (parseInt(id) === currentUserId) {
                return res.status(403).json({
                    success: false,
                    message: 'No puedes eliminar tu propia cuenta',
                });
            }

            // Verificar que el usuario existe
            const user = await UserModel.findById(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Administrador no encontrado',
                });
            }

            // Contar administradores activos
            const pool = require('../config/database');
            const countQuery = 'SELECT COUNT(*) as count FROM administrador WHERE activo = true';
            const countResult = await pool.query(countQuery);
            const activeAdmins = parseInt(countResult.rows[0].count);

            // No permitir eliminar el último administrador
            if (activeAdmins <= 1) {
                return res.status(403).json({
                    success: false,
                    message: 'No se puede eliminar el último administrador del sistema',
                });
            }

            // Soft delete: marcar como inactivo
            const deleteQuery = `
        UPDATE administrador 
        SET activo = false 
        WHERE id_admin = $1
        RETURNING email
      `;
            const result = await pool.query(deleteQuery, [id]);

            // Eliminar todos los refresh tokens del usuario
            await UserModel.deleteAllRefreshTokens(id);

            console.log(`🗑️ Administrador eliminado: ${result.rows[0].email}`);

            res.json({
                success: true,
                message: 'Administrador eliminado exitosamente',
            });
        } catch (error) {
            console.error('❌ Error eliminando usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar el administrador',
                error: error.message,
            });
        }
    }

    /**
     * Actualizar contraseña de administrador
     * PUT /api/users/:id/password
     */
    async updatePassword(req, res) {
        try {
            const { id } = req.params;
            const { newPassword } = req.body;

            // Validaciones
            if (!newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'La nueva contraseña es requerida',
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'La contraseña debe tener al menos 6 caracteres',
                });
            }

            // Verificar que el usuario existe
            const user = await UserModel.findById(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Administrador no encontrado',
                });
            }

            // Hashear la nueva contraseña
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Actualizar la contraseña
            const pool = require('../config/database');
            const updateQuery = `
        UPDATE administrador 
        SET password_hash = $1 
        WHERE id_admin = $2
        RETURNING email
      `;
            const result = await pool.query(updateQuery, [hashedPassword, id]);

            // Eliminar todos los refresh tokens para forzar re-login
            await UserModel.deleteAllRefreshTokens(id);

            console.log(`🔑 Contraseña actualizada para: ${result.rows[0].email}`);

            res.json({
                success: true,
                message: 'Contraseña actualizada exitosamente',
            });
        } catch (error) {
            console.error('❌ Error actualizando contraseña:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar la contraseña',
                error: error.message,
            });
        }
    }

    /**
     * Actualizar estado activo de administrador
     * PUT /api/users/:id/status
     */
    async updateUserStatus(req, res) {
        try {
            const { id } = req.params;
            const { activo } = req.body;

            // Validaciones
            if (typeof activo !== 'boolean') {
                return res.status(400).json({
                    success: false,
                    message: 'El estado activo debe ser un valor booleano',
                });
            }

            // Verificar que el usuario existe
            const user = await UserModel.findById(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Administrador no encontrado',
                });
            }

            // Actualizar el estado
            const pool = require('../config/database');
            const updateQuery = `
            UPDATE administrador 
            SET activo = $1 
            WHERE id_admin = $2
            RETURNING email, activo
        `;
            const result = await pool.query(updateQuery, [activo, id]);

            console.log(`🔄 Estado actualizado para: ${result.rows[0].email} - Activo: ${activo}`);

            res.json({
                success: true,
                message: 'Estado actualizado exitosamente',
            });
        } catch (error) {
            console.error('❌ Error actualizando estado:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar el estado',
                error: error.message,
            });
        }
    }
}

module.exports = new UsersController();
