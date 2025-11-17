import React, { useState } from "react";
import "./RouteList.css";

const RouteList = ({
  routes = [],
  onEditRoute,
  onDeleteRoute,
  onClose,
  onSelectRoute,
}) => {
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredRoutes = routes.filter((route) => {
    const matchesFilter = filter === "all" || route.tipo === filter;
    const matchesSearch = route.nombre
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getRouteTypeIcon = (tipo) => {
    const icons = {
      peatonal: "🚶",
      vehicular: "🚗",
      accesible: "♿",
      default: "🛣️",
    };
    return icons[tipo] || icons.default;
  };

  const getRouteTypeColor = (tipo) => {
    const colors = {
      peatonal: "#27ae60",
      vehicular: "#e74c3c",
      accesible: "#3498db",
      default: "#f39c12",
    };
    return colors[tipo] || colors.default;
  };

  // En RouteList.jsx, busca la función handleRouteAction
  // Y reemplázala con esta versión:

  const handleRouteAction = (route, action) => {
    console.log(`Acción: ${action} en ruta:`, route.nombre);

    switch (action) {
      case "edit":
        if (onEditRoute) {
          console.log("✏️ Llamando a onEditRoute");
          onEditRoute(route);
          // ⭐ Cerrar la lista después de editar
          if (onClose) {
            onClose();
          }
        }
        break;
      case "delete":
        if (onDeleteRoute) {
          console.log("Llamando a onDeleteRoute");
          onDeleteRoute(route);
        }
        break;
      case "select":
        if (onSelectRoute) {
          console.log("Llamando a onSelectRoute");
          onSelectRoute(route);
          // ⭐ Cerrar la lista después de seleccionar
          if (onClose) {
            console.log("🚪 Cerrando lista de rutas");
            onClose();
          }
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="route-list-overlay">
      <div className="route-list-container">
        <div className="route-list-header">
          <h3>
            <span className="material-icons">map</span>
            Gestión de Rutas
          </h3>
          <button className="close-btn" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>

        <div className="route-list-controls">
          <div className="search-box">
            <span className="material-icons">search</span>
            <input
              type="text"
              placeholder="Buscar rutas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}>
              <span className="material-icons">all_inclusive</span>
              Todas
            </button>
            <button
              className={`filter-btn ${filter === "accesible" ? "active" : ""}`}
              onClick={() => setFilter("accesible")}>
              <span className="material-icons">accessible</span>
              Accesibles
            </button>
            <button
              className={`filter-btn ${
                filter === "emergencia" ? "active" : ""
              }`}
              onClick={() => setFilter("emergencia")}>
              <span className="material-icons">emergency</span>
              Emergencia
            </button>
            <button
              className={`filter-btn ${filter === "peatonal" ? "active" : ""}`}
              onClick={() => setFilter("peatonal")}>
              <span className="material-icons">directions_walk</span>
              Peatonales
            </button>
            <button
              className={`filter-btn ${filter === "rapida" ? "active" : ""}`}
              onClick={() => setFilter("rapida")}>
              <span className="material-icons">bolt</span>
              Rápidas
            </button>
            <button
              className={`filter-btn ${filter === "vehicular" ? "active" : ""}`}
              onClick={() => setFilter("vehicular")}>
              <span className="material-icons">directions_car</span>
              Vehiculares
            </button>
          </div>
        </div>

        <div className="route-list-content">
          {filteredRoutes.length === 0 ? (
            <div className="empty-state">
              {routes.length === 0 ? (
                <>
                  <div className="empty-icon">
                    <span className="material-icons">route</span>
                  </div>
                  <h4>No hay rutas creadas</h4>
                  <p>Crea tu primera ruta para comenzar</p>
                </>
              ) : (
                <>
                  <div className="empty-icon">
                    <span className="material-icons">search_off</span>
                  </div>
                  <h4>No se encontraron rutas</h4>
                  <p>Intenta con otros filtros o términos de búsqueda</p>
                </>
              )}
            </div>
          ) : (
            <div className="routes-grid">
              {filteredRoutes.map((route) => (
                <div key={route.id} className="route-card">
                  <div
                    className="route-color-bar"
                    style={{
                      backgroundColor: getRouteTypeColor(route.tipo),
                    }}></div>

                  <div className="route-content">
                    <div className="route-header">
                      <div className="route-icon">
                        {getRouteTypeIcon(route.tipo)}
                      </div>
                      <div className="route-info">
                        <h4 className="route-name">{route.nombre}</h4>
                        <span className="route-type">{route.tipo}</span>
                      </div>
                    </div>

                    <div className="route-stats">
                      <div className="stat">
                        <span className="stat-label">Distancia:</span>
                        <span className="stat-value">{route.distancia}m</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Tiempo:</span>
                        <span className="stat-value">
                          {route.tiempo_estimado}min
                        </span>
                      </div>
                    </div>

                    <div className="route-actions">
                      <button
                        className="action-btn select-btn"
                        onClick={() => handleRouteAction(route, "select")}
                        title="Seleccionar ruta en el mapa">
                        <span className="material-icons">my_location</span>
                        Seleccionar
                      </button>
                      <button
                        className="action-btn edit-btn"
                        onClick={() => handleRouteAction(route, "edit")}
                        title="Editar ruta">
                        <span className="material-icons">edit</span>
                        Editar
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleRouteAction(route, "delete")}
                        title="Eliminar ruta">
                        <span className="material-icons">delete</span>
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="route-list-footer">
          <div className="routes-summary">
            Mostrando {filteredRoutes.length} de {routes.length} rutas
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteList;
