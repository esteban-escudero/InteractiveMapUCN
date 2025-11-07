import React, { useState } from "react";
import "./SidePanel.css";

const SidePanel = ({
  status,
  onLogout,
  onSyncData,
  backendStatus,
  onAddBuilding,
  onManageBuildings,
  onAddRoute,
  onManageRoutes,
  routesCount = 0,
  onToggleRouteNetwork,
  routeNetworkActive
}) => {
  const [activeMenu, setActiveMenu] = useState(null);

  const toggleMenu = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const handleLogout = () => {
    console.log("Cerrando sesión...");
    if (onLogout) onLogout();
  };

  const handleSyncClick = () => {
    if (onSyncData) onSyncData();
  };

  const handleAddBuilding = () => {
    console.log("🟢 SidePanel: Agregar Edificio clickeado");
    if (onAddBuilding) onAddBuilding();
  };

  const handleManageBuildings = () => {
    console.log("🏢 SidePanel: Gestionar Edificios clickeado");
    if (onManageBuildings) onManageBuildings();
  };

  const handleAddRoute = () => {
    console.log("🛣️ SidePanel: Agregar Ruta clickeado");
    if (onAddRoute) onAddRoute();
  };

  const handleManageRoutes = () => {
    console.log("🗺️ SidePanel: Gestionar Rutas clickeado");
    if (onManageRoutes) onManageRoutes();
  };

  const getStatusStyle = () => {
    const baseStyle = {
      padding: "10px",
      borderRadius: "5px",
      textAlign: "center",
      fontSize: "12px",
      fontWeight: "bold",
      color: "white",
      marginBottom: "10px",
    };

    if (backendStatus === "error") {
      return { ...baseStyle, backgroundColor: "#e74c3c" };
    }

    switch (status) {
      case "success":
        return { ...baseStyle, backgroundColor: "#2ecc71" };
      case "empty":
        return { ...baseStyle, backgroundColor: "#f39c12" };
      case "error":
        return { ...baseStyle, backgroundColor: "#e74c3c" };
      default:
        return { ...baseStyle, backgroundColor: "#3498db" };
    }
  };

  const getStatusText = () => {
    if (backendStatus === "error") {
      return "❌ Error conectando al backend";
    }

    switch (status) {
      case "checking":
        return "🔍 Conectando...";
      case "loading":
        return "⏳ Cargando edificios...";
      case "empty":
        return "⚠️ Base de datos vacía";
      case "error":
        return "❌ Error de conexión";
      default:
        return "✅ Sistema listo";
    }
  };

  return (
    <div className="Panel">
      <div className="dropdowns-container">
        {/* DROPDOWN PRINCIPAL - EDIFICIOS Y SALAS */}
        <div
          className={`dropdown ${activeMenu === "Edificios" ? "active" : ""}`}>
          <button
            className="dropdown-toggle"
            onClick={() => toggleMenu("Edificios")}>
            🏢 Edificios y Salas {activeMenu === "Edificios" ? "▲" : "▼"}
          </button>
          {activeMenu === "Edificios" && (
            <ul className="dropdown-menu">
              <li>
                <button onClick={handleAddBuilding}>➕ Agregar Edificio</button>
              </li>
              <li>
                <button onClick={handleManageBuildings}>
                  📝 Gestionar Edificios y Salas
                </button>
              </li>
            </ul>
          )}
        </div>

        {/* DROPDOWN PARA RUTAS */}
        <div className={`dropdown ${activeMenu === "Rutas" ? "active" : ""}`}>
          <button
            className="dropdown-toggle"
            onClick={() => toggleMenu("Rutas")}>
            🗺️ Rutas {activeMenu === "Rutas" ? "▲" : "▼"}
          </button>
          {activeMenu === "Rutas" && (
            <ul className="dropdown-menu">
              <li>
                <button onClick={handleAddRoute}>➕ Agregar Ruta</button>
              </li>
              <li>
                <button onClick={handleManageRoutes}>
                  📝 Gestionar Rutas ({routesCount})
                </button>
              </li>
              
            </ul>
          )}
        </div>
      </div>

      

      <button className="logout-btn" onClick={handleLogout}>
        Cerrar Sesión
      </button>
    </div>
  );
};

export default SidePanel;