import { useState } from "react";
import { menuConfig, statusConfig } from "./menuConfig";
import { MenuDropdown } from "./MenuDropdown";
import "./SidePanel.css";

/**
 * Panel lateral con menús configurables
 */
const SidePanel = ({
  // Estado
  status = "checking",
  featuresCount = 0,
  buildingsLoading = false,
  backendStatus = "checking",
  geoServerStatus = "checking",
  geoServerFeaturesCount = 0,
  coordinateDetectionActive = false,

  // Handlers de edificios
  onAddBuilding,
  onEditBuildings,

  // Handlers de salas
  onManageRooms,

  // Handlers de rutas (futuro)
  onAddRoute,
  onManageRoutes,

  // Otros handlers
  onLogout,
  onSyncData,
  onToggleCoordinateDetection,
}) => {
  const [activeMenu, setActiveMenu] = useState(null);

  // 🎯 Mapa de handlers para pasarlos al MenuDropdown
  const handlers = {
    onAddBuilding,
    onEditBuildings,
    onManageRooms,
    onAddRoute,
    onManageRoutes,
  };

  // 🔄 Toggle de menú
  const toggleMenu = (menuId) => {
    setActiveMenu(activeMenu === menuId ? null : menuId);
  };

  // 🚪 Cerrar sesión
  const handleLogout = () => {
    console.log("🚪 Cerrando sesión...");
    if (onLogout) onLogout();
  };

  // 🔄 Sincronizar con GeoServer
  const handleSyncClick = () => {
    if (onSyncData) onSyncData();
  };

  // 📍 Toggle de detección de coordenadas
  const handleToggleCoordinateDetection = () => {
    console.log("📍 Toggle detección de coordenadas");
    if (onToggleCoordinateDetection) {
      onToggleCoordinateDetection();
    }
  };

  // 🎨 Obtener estilo según estado
  const getStatusStyle = () => {
    const currentStatus = backendStatus === "error" ? "error" : status;
    const config = statusConfig[currentStatus] || statusConfig.checking;

    return {
      padding: "10px",
      borderRadius: "5px",
      textAlign: "center",
      fontSize: "12px",
      fontWeight: "bold",
      color: "white",
      marginBottom: "10px",
      backgroundColor: config.color,
    };
  };

  // 📝 Obtener texto según estado
  const getStatusText = () => {
    const currentStatus = backendStatus === "error" ? "error" : status;
    const config = statusConfig[currentStatus] || statusConfig.checking;
    return config.text;
  };

  return (
    <div className="Panel">
      {/* 📊 ESTADO DEL SISTEMA */}
      <div style={getStatusStyle()}>{getStatusText()}</div>

      {/* 📋 MENÚS DROPDOWN */}
      <div className="dropdowns-container">
        {menuConfig.map((menu) => (
          <MenuDropdown
            key={menu.id}
            menu={menu}
            isActive={activeMenu === menu.id}
            onToggle={() => toggleMenu(menu.id)}
            handlers={handlers}
          />
        ))}
      </div>

      {/* 📍 CAPTURA DE COORDENADAS */}
      <div className="coordinate-detection-section">
        <button
          className={`coordinate-detection-btn ${
            coordinateDetectionActive ? "active" : ""
          }`}
          onClick={handleToggleCoordinateDetection}
          aria-pressed={coordinateDetectionActive}
        >
          {coordinateDetectionActive
            ? "📍 Capturando..."
            : "📍 Capturar Coordenadas"}
        </button>
        {coordinateDetectionActive && (
          <small
            style={{
              color: "#e74c3c",
              display: "block",
              textAlign: "center",
              marginTop: "5px",
              fontSize: "11px",
            }}
          >
            Haz clic en el mapa para capturar
          </small>
        )}
      </div>

      {/* 🔄 SINCRONIZAR (si hay features en GeoServer) */}
      {geoServerFeaturesCount > 0 && (
        <div className="sync-section">
          <button
            className="sync-btn"
            onClick={handleSyncClick}
            title={`Sincronizar ${geoServerFeaturesCount} edificios de GeoServer`}
          >
            🔄 Sincronizar GeoServer ({geoServerFeaturesCount})
          </button>
        </div>
      )}

      {/* 📊 INFORMACIÓN */}
      {buildingsLoading && (
        <div className="info-box loading">⏳ Cargando edificios...</div>
      )}

      {!buildingsLoading && featuresCount > 0 && (
        <div className="info-box success">
          🏢 {featuresCount} edificio{featuresCount !== 1 ? "s" : ""} en el mapa
        </div>
      )}

      {/* 🚪 CERRAR SESIÓN */}
      <button className="logout-btn" onClick={handleLogout}>
        🚪 Cerrar Sesión
      </button>
    </div>
  );
};

export default SidePanel;
