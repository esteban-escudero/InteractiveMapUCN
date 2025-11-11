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
  originFilter,
  destinationFilter,
  categoryFilter,
  onOriginFilterChange,
  onDestinationFilterChange,
  onCategoryFilterChange,
  onClearFilters,
  allBuildings = [], // ← CORRECCIÓN: Nueva prop para lista completa
  filteredBuildings = [],
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
        {/* DROPDOWN PRINCIPAL - EDIFICIOS Y SALAS */}
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

        {/* DROPDOWN PARA RUTAS */}
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
      </div>

      {/* SECCIÓN DE FILTROS */}
      {/* DROPDOWN PARA FILTROS DEL MAPA */}
      <div
        className={`filters-dropdown ${
          activeMenu === "Filtros" ? "active" : ""
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
            {/* FILTRO POR ORIGEN */}
            <div className="filter-group">
              <label>
                <span className="material-icons">trip_origin</span>
                Origen:
              </label>
              <select
                value={originFilter}
                onChange={onOriginFilterChange}
                className="filter-select">
                <option value="">Seleccionar origen</option>
                {allBuildings // ← CORRECCIÓN: Usar allBuildings en lugar de filteredBuildings
                  .filter(
                    (building, index, self) =>
                      self.findIndex((b) => b.nombre === building.nombre) ===
                      index
                  )
                  .map((building) => (
                    <option
                      key={`origin-${building.id || building._id}`}
                      value={building.nombre}>
                      {building.nombre || "Sin nombre"}
                    </option>
                  ))}
              </select>
            </div>

            {/* FILTRO POR DESTINO */}
            <div className="filter-group">
              <label>
                <span className="material-icons">location_on</span>
                Destino:
              </label>
              <select
                value={destinationFilter}
                onChange={onDestinationFilterChange}
                className="filter-select">
                <option value="">Seleccionar destino</option>
                {allBuildings // ← CORRECCIÓN: Usar allBuildings en lugar de filteredBuildings
                  .filter(
                    (building, index, self) =>
                      self.findIndex((b) => b.nombre === building.nombre) ===
                      index
                  )
                  .map((building) => (
                    <option
                      key={`destination-${building.id || building._id}`}
                      value={building.nombre}>
                      {building.nombre || "Sin nombre"}
                    </option>
                  ))}
              </select>
            </div>

            {/* FILTRO POR CATEGORÍA */}
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
                <option value="Académico">Académico</option>
                <option value="Administrativo">Administrativo</option>
                <option value="Baño">Baño</option>
                <option value="Biblioteca">Biblioteca</option>
                <option value="Cafeteria">Cafetería</option>
                <option value="Casino">Casino</option>
                <option value="Centro de Salud">Centro de Salud</option>
                <option value="Cultural">Cultural</option>
                <option value="Deportivo">Deportivo</option>
                <option value="Estacionamiento">Estacionamiento</option>
                <option value="Gimnasio">Gimnasio</option>
                <option value="Investigación">Investigación</option>
                <option value="Laboratorio">Laboratorio</option>
                <option value="Oficina Administracion">
                  Oficina Administración
                </option>
                <option value="Oficina Profesor">Oficina Profesor</option>
                <option value="Sala de Clase">Sala de Clase</option>
                <option value="Sala de Estudio">Sala de Estudio</option>
                <option value="Servicios">Servicios</option>
              </select>
            </div>

            {/* BOTÓN LIMPIAR FILTROS */}
            <button
              onClick={onClearFilters}
              className="clear-filters-btn"
              disabled={!originFilter && !destinationFilter && !categoryFilter}>
              <span className="material-icons">clear_all</span>
              Limpiar Filtros
            </button>
          </div>
        )}
      </div>

      <button className="logout-btn" onClick={handleLogout}>
        Cerrar Sesión
      </button>
    </div>
  );
};

export default SidePanel;
