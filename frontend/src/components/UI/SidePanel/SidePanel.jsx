import React, { useState } from "react";
import "./SidePanel.css";
import { tiposRuta, tiposEdificio } from "../../shared/constants/constants.ts";
import UserManagement from "../../admin/UserManagement/UserManagement";

const SidePanel = ({
  status,
  onLogout,
  onSyncData,
  backendStatus,
  onAddBuilding,
  onManageBuildings,
  onAddRoute,
  onManageRoutes,
  categoryFilter,
  routeTypeFilter,
  onCategoryFilterChange,
  onRouteTypeFilterChange,
  onClearFilters,
  allBuildings = [],
  filteredBuildings = [],
}) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [showUserManagement, setShowUserManagement] = useState(false);

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
    console.log("SidePanel: Agregar Edificio clickeado");
    if (onAddBuilding) onAddBuilding();
  };

  const handleManageBuildings = () => {
    console.log("SidePanel: Gestionar Edificios clickeado");
    if (onManageBuildings) onManageBuildings();
  };

  const handleAddRoute = () => {
    console.log("SidePanel: Agregar Ruta clickeado");
    if (onAddRoute) onAddRoute();
  };

  const handleManageRoutes = () => {
    console.log("SidePanel: Gestionar Rutas clickeado");
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
      return "Error conectando al backend";
    }

    switch (status) {
      case "checking":
        return "Conectando...";
      case "loading":
        return "⏳ Cargando edificios...";
      case "empty":
        return "Base de datos vacía";
      case "error":
        return "Error de conexión";
      default:
        return "Sistema listo";
    }
  };

  return (
    <div className="Panel">
      <div className="dropdowns-container">
        {/* Dropdown Principal - Edificios y Salas */}
        <div
          className={`dropdown ${activeMenu === "Edificios" ? "active" : ""}`}>
          <button
            className="dropdown-toggle"
            onClick={() => toggleMenu("Edificios")}>
            <span className="material-icons">business</span>
            Edificios y Salas
            <span className="material-icons">
              {activeMenu === "Edificios" ? "expand_less" : "expand_more"}
            </span>
          </button>
          {activeMenu === "Edificios" && (
            <ul className="dropdown-menu">
              <li>
                <button onClick={handleAddBuilding}>
                  <span className="material-icons">add_location</span>
                  Agregar Edificio
                </button>
              </li>
              <li>
                <button onClick={handleManageBuildings}>
                  <span className="material-icons">edit_location</span>
                  Gestionar Edificios y Salas
                </button>
              </li>
            </ul>
          )}
        </div>

        {/* Dropdown para Rutas */}
        <div className={`dropdown ${activeMenu === "Rutas" ? "active" : ""}`}>
          <button
            className="dropdown-toggle"
            onClick={() => toggleMenu("Rutas")}>
            <span className="material-icons">route</span>
            Rutas
            <span className="material-icons">
              {activeMenu === "Rutas" ? "expand_less" : "expand_more"}
            </span>
          </button>
          {activeMenu === "Rutas" && (
            <ul className="dropdown-menu">
              <li>
                <button onClick={handleAddRoute}>
                  <span className="material-icons">add_road</span>
                  Agregar Ruta
                </button>
              </li>
              <li>
                <button onClick={handleManageRoutes}>
                  <span className="material-icons">edit</span>
                  Gestionar Rutas
                </button>
              </li>
            </ul>
          )}
        </div>

        {/* Dropdown para Administradores */}
        <div className={`dropdown ${activeMenu === "Administradores" ? "active" : ""}`}>
          <button
            className="dropdown-toggle"
            onClick={() => toggleMenu("Administradores")}>
            <span className="material-icons">admin_panel_settings</span>
            Administradores
            <span className="material-icons">
              {activeMenu === "Administradores" ? "expand_less" : "expand_more"}
            </span>
          </button>
          {activeMenu === "Administradores" && (
            <ul className="dropdown-menu">
              <li>
                <button onClick={() => setShowUserManagement(true)}>
                  <span className="material-icons">people</span>
                  Gestionar Administradores
                </button>
              </li>
            </ul>
          )}
        </div>

        {/* SECCIÓN DE FILTROS */}
        <div
          className={`filters-dropdown ${activeMenu === "Filtros" ? "active" : ""
            }`}>
          <button
            className="filters-toggle"
            onClick={() => toggleMenu("Filtros")}>
            <span className="material-icons">filter_alt</span>
            Filtros del Mapa
            <span className="material-icons">
              {activeMenu === "Filtros" ? "expand_less" : "expand_more"}
            </span>
          </button>
          {activeMenu === "Filtros" && (
            <div className="filters-content">
              {/* Filtro por Tipo de Ruta */}
              <div className="filter-group">
                <label>
                  <span className="material-icons">alt_route</span>
                  Tipo de Ruta:
                </label>
                <select
                  value={routeTypeFilter || ""}
                  onChange={onRouteTypeFilterChange}
                  className="filter-select">
                  <option value="">Todos los tipos</option>
                  {tiposRuta.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>


              {/* Filtro por Categoria */}
              <div className="filter-group">
                <label>
                  <span className="material-icons">category</span>
                  Categoría:
                </label>
                <select
                  value={categoryFilter}
                  onChange={onCategoryFilterChange}
                  className="filter-select">
                  <option value="">Todas las categorías</option>
                  {tiposEdificio.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Boton Limpiar Filtros */}
              <button
                onClick={onClearFilters}
                className="clear-filters-btn"
                disabled={
                  !categoryFilter &&
                  !routeTypeFilter
                }>
                <span className="material-icons">clear_all</span>
                Limpiar Filtros
              </button>
            </div>
          )}
        </div>
      </div>

      <button className="logout-btn" onClick={handleLogout}>
        Cerrar Sesión
      </button>

      {/* Modal de Gestión de Usuarios */}
      <UserManagement
        isOpen={showUserManagement}
        onClose={() => setShowUserManagement(false)}
        currentUser={{ email: localStorage.getItem("userEmail") }}
      />
    </div>
  );
};

export default SidePanel;
