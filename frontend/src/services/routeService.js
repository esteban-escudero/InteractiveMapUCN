// services/routeService.js
import { api } from "./api";

export const routeService = {
  async getAllRoutes() {
    try {
      const response = await api.get("/routes");
      if (response.success !== false) {
        return response.data || response;
      } else {
        throw new Error(response.message || "Error obteniendo rutas");
      }
    } catch (error) {
      console.error("Error obteniendo rutas:", error);
      throw error;
    }
  },

  async createRoute(routeData) {
    try {
      const routeToSave = {
        nombre: routeData.nombre,
        tipo: routeData.tipo,
        descripcion: routeData.descripcion || "",
        prioridad: routeData.prioridad || "media",
        distancia: Math.round(routeData.distancia),
        tiempo_estimado: Math.round(routeData.tiempo_estimado),
        geometria: routeData.geometria,
        origen: "Dibujado en mapa",
        destino: "Dibujado en mapa",
        puntos_ruta: [],
      };

      const response = await api.post("/routes", routeToSave);

      if (response.success !== false) {
        return response.data || response;
      } else {
        throw new Error(response.message || "Error creando ruta");
      }
    } catch (error) {
      console.error("Error creando ruta:", error);
      throw error;
    }
  },

  async updateRoute(routeId, routeData) {
    try {
      const routeToUpdate = {
        nombre: routeData.nombre,
        tipo: routeData.tipo,
        descripcion: routeData.descripcion || "",
        prioridad: routeData.prioridad || "media",
        distancia: Math.round(routeData.distancia),
        tiempo_estimado: Math.round(routeData.tiempo_estimado),
        geometria: routeData.geometria,
        puntos_ruta: [],
      };

      const response = await api.put(`/routes/${routeId}`, routeToUpdate);

      if (response.success !== false) {
        return response.data || response;
      } else {
        throw new Error(response.message || "Error actualizando ruta");
      }
    } catch (error) {
      console.error("Error actualizando ruta:", error);
      throw error;
    }
  },

  async deleteRoute(routeId) {
    try {
      const response = await api.delete(`/routes/${routeId}`);

      if (response.success !== false) {
        return response.data || response;
      } else {
        throw new Error(response.message || "Error eliminando ruta");
      }
    } catch (error) {
      console.error("Error eliminando ruta:", error);
      throw error;
    }
  },
};
