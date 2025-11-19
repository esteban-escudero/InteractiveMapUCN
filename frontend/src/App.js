import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Map from "./components/map/Map/Map.jsx";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <ProtectedRoute>
          <Map />
        </ProtectedRoute>
      </div>
    </AuthProvider>
  );
}

export default App;
