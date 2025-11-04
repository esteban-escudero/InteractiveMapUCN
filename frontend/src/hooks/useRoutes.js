import { useState, useEffect } from "react";
import { routeService } from "../services/routeService";

const useRoutes = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadRoutes = async () => {
    setLoading(true);
    setError(null);
    try {
      const routesData = await routeService.getAllRoutes();
      setRoutes(Array.isArray(routesData) ? routesData : []);
      console.log(`✅ ${routesData.length} rutas cargadas`);
    } catch (err) {
      setError(err.message);
      console.error("❌ Error loading routes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  const createRoute = async (routeData) => {
    try {
      const newRoute = await routeService.createRoute(routeData);
      await loadRoutes();
      return newRoute;
    } catch (err) {
      console.error("❌ Error creating route:", err);
      throw err;
    }
  };

  const updateRoute = async (routeId, routeData) => {
    try {
      const updatedRoute = await routeService.updateRoute(routeId, routeData);
      await loadRoutes();
      return updatedRoute;
    } catch (err) {
      console.error("❌ Error updating route:", err);
      throw err;
    }
  };

  const deleteRoute = async (routeId) => {
    try {
      await routeService.deleteRoute(routeId);
      await loadRoutes();
    } catch (err) {
      console.error("❌ Error deleting route:", err);
      throw err;
    }
  };

  return {
    routes,
    loading,
    error,
    createRoute,
    updateRoute,
    deleteRoute,
    loadRoutes,
  };
};

export default useRoutes;
