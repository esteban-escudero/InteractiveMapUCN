// frontend/src/services/userService.js
import { api } from "./api";

export const userService = {
    /**
     * Obtener todos los administradores
     */
    async getAllUsers() {
        try {
            console.log("Obteniendo lista de administradores...");
            const response = await api.get("/users");

            if (response.success !== false) {
                console.log(`✅ ${response.data.length} administradores obtenidos`);
                return response.data || response;
            } else {
                throw new Error(response.message || "Error obteniendo usuarios");
            }
        } catch (error) {
            console.error("Error obteniendo usuarios:", error);
            throw error;
        }
    },

    /**
     * Crear nuevo administrador
     */
    async createUser(userData) {
        try {
            console.log("Creando nuevo administrador:", userData.email);
            const response = await api.post("/users", userData);

            if (response.success !== false) {
                console.log("✅ Administrador creado exitosamente");
                return response.data || response;
            } else {
                throw new Error(response.message || "Error creando usuario");
            }
        } catch (error) {
            console.error("Error creando usuario:", error);
            throw error;
        }
    },

    /**
     * Eliminar administrador
     */
    async deleteUser(userId) {
        try {
            console.log(" Eliminando administrador ID:", userId);
            const response = await api.delete(`/users/${userId}`);

            if (response.success !== false) {
                console.log("✅ Administrador eliminado exitosamente");
                return response;
            } else {
                throw new Error(response.message || "Error eliminando usuario");
            }
        } catch (error) {
            console.error("Error eliminando usuario:", error);
            throw error;
        }
    },

    /**
     * Actualizar contraseña de un usuario
     */
    async updatePassword(userId, newPassword) {
        try {
            const response = await api.put(`/users/${userId}/password`, { newPassword });
            console.log(`✅ Contraseña actualizada para usuario ID: ${userId}`);
            return response.data;
        } catch (error) {
            console.error("Error actualizando contraseña:", error.response?.data || error.message);
            throw error;
        }
    },

    /**
     * Actualizar estado activo de un usuario
     */
    async updateUserStatus(userId, activo) {
        try {
            const response = await api.put(`/users/${userId}/status`, { activo });
            console.log(`✅ Estado actualizado para usuario ID: ${userId} - Activo: ${activo}`);
            return response.data;
        } catch (error) {
            console.error("Error actualizando estado:", error.response?.data || error.message);
            throw error;
        }
    },
};
