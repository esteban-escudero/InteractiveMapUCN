import { useState, useEffect } from "react";
import { routeService } from "../services/routeService";

export const useRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Cargando rutas...");

      const response = await routeService.getAllRoutes();

      // ✅ CORREGIDO: Manejar diferentes estructuras de respuesta
      const routesData = response.data || response || [];
      console.log("📦 Respuesta de rutas:", response);
      console.log("🛣️ Datos de rutas:", routesData);

      setRoutes(routesData);

      console.log(`✅ ${routesData.length} rutas cargadas`);
      return routesData;
    } catch (err) {
      console.error("❌ Error cargando rutas:", err);
      setError(err.message);
      setRoutes([]);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createRoute = async (routeData) => {
    try {
      setError(null);
      console.log("➕ Creando ruta...");

      const response = await routeService.createRoute(routeData);

      // ✅ CORREGIDO: Manejar diferentes estructuras de respuesta
      const newRoute = response.data || response;
      await loadRoutes(); // Recargar la lista

      console.log("✅ Ruta creada exitosamente");
      return newRoute;
    } catch (err) {
      console.error("❌ Error creando ruta:", err);
      setError(err.message);
      throw err;
    }
  };

  const updateRoute = async (routeId, routeData) => {
    try {
      setError(null);
      console.log(`✏️ Actualizando ruta ${routeId}...`);

      const response = await routeService.updateRoute(routeId, routeData);

      // ✅ CORREGIDO: Manejar diferentes estructuras de respuesta
      const updatedRoute = response.data || response;
      await loadRoutes(); // Recargar la lista

      console.log("✅ Ruta actualizada exitosamente");
      return updatedRoute;
    } catch (err) {
      console.error("❌ Error actualizando ruta:", err);
      setError(err.message);
      throw err;
    }
  };

  const deleteRoute = async (routeId) => {
    try {
      setError(null);
      console.log(`🗑️ Eliminando ruta ${routeId}...`);

      const response = await routeService.deleteRoute(routeId);
      await loadRoutes(); // Recargar la lista

      console.log("✅ Ruta eliminada exitosamente");
      return response;
    } catch (err) {
      console.error("❌ Error eliminando ruta:", err);
      setError(err.message);
      throw err;
    }
  };

  const calculateRoute = async (origen, destino, tipo_ruta) => {
    try {
      setError(null);
      console.log("🧮 Calculando ruta...");

      const response = await routeService.calculateRoute(
        origen,
        destino,
        tipo_ruta
      );

      // ✅ CORREGIDO: Manejar diferentes estructuras de respuesta
      const calculatedRoute = response.data || response;

      console.log("✅ Ruta calculada exitosamente");
      return calculatedRoute;
    } catch (err) {
      console.error("❌ Error calculando ruta:", err);
      setError(err.message);
      throw err;
    }
  };

  // Cargar rutas al inicializar el hook
  useEffect(() => {
    loadRoutes();
  }, []);

  return {
    routes,
    loading,
    error,
    loadRoutes,
    createRoute,
    updateRoute,
    deleteRoute,
    calculateRoute,
  };
};

export default useRoutes;
