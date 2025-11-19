// src/components/auth/ProtectedRoute.jsx
import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import LoginForm from "./LoginForm";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}>
        <div
          style={{
            background: "white",
            padding: "40px",
            borderRadius: "16px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            textAlign: "center",
          }}>
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "4px solid #e2e8f0",
              borderTopColor: "#667eea",
              borderRadius: "50%",
              margin: "0 auto 16px",
              animation: "spin 1s linear infinite",
            }}></div>
          <p style={{ margin: 0, color: "#718096" }}>
            Verificando autenticación...
          </p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Si está autenticado, mostrar contenido
  return children;
};

export default ProtectedRoute;
