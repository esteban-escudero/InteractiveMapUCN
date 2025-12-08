import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "contexts/AuthContext";
import ProtectedRoute from "components/auth/ProtectedRoute";
import Map from "components/map/Map/Map.jsx";
import UserMapView from "components/user/UserMapView";
import "App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Ruta pública - Vista de usuario móvil */}
            <Route path="/" element={<UserMapView />} />

            {/* Ruta protegida - Panel de administración */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Map />
                </ProtectedRoute>
              }
            />

            {/* Ruta 404 - Redirigir a home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
