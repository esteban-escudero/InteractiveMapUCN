// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar autenticación al cargar
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (authService.isAuthenticated()) {
        // Obtener admin del storage primero (más rápido)
        const storedAdmin = authService.getStoredAdmin();
        setAdmin(storedAdmin);

        // Luego verificar con el servidor
        try {
          const currentAdmin = await authService.getCurrentAdmin();
          setAdmin(currentAdmin);
        } catch (error) {
          // Si falla, mantener el admin del storage pero marcar como no autenticado
          console.error("Error verificando admin:", error);
          logout();
        }
      }
    } catch (error) {
      console.error("Error en checkAuth:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      const data = await authService.login(email, password);
      setAdmin(data.admin);

      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setAdmin(null);
    } catch (error) {
      console.error("Error en logout:", error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    admin,
    loading,
    error,
    isAuthenticated: !!admin,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};
