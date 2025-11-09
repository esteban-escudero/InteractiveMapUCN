import { api } from "./api";

export const routeService = {
  async getAllRoutes() {
    try {
      console.log("Solicitando todas las rutas...");
      const response = await api.get("/routes");
      console.log("Respuesta de rutas:", response);

      // Manejo consistente de respuesta
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
      console.log("Creando nueva ruta:", routeData);
      const response = await api.post("/routes", routeData);
      console.log("Respuesta creación ruta:", response);

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
      console.log(`Actualizando ruta ID: ${routeId}`, routeData);
      const response = await api.put(`/routes/${routeId}`, routeData);
      console.log("Respuesta actualización ruta:", response);

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
      console.log(`Eliminando ruta ID: ${routeId}`);
      const response = await api.delete(`/routes/${routeId}`);
      console.log("Respuesta eliminación ruta:", response);

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

  async calculateRoute(origen, destino, tipo_ruta = "peatonal") {
    try {
      console.log("Calculando ruta desde:", origen, "hasta:", destino);
      const response = await api.post("/routes/calculate", {
        origen,
        destino,
        tipo_ruta,
      });
      console.log("Ruta calculada exitosamente:", response);

      if (response.success !== false) {
        return response.data || response;
      } else {
        throw new Error(response.message || "Error calculando ruta");
      }
    } catch (error) {
      console.error("Error calculando ruta:", error);
      throw error;
    }
  },
};
