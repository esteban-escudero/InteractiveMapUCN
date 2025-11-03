import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "./RouteLayer.css";

const RouteLayer = ({ mapInstance, routes, onRouteClick }) => {
  const routeLayersRef = useRef([]);

  // Crear íconos para diferentes tipos de puntos de ruta
  const createRoutePointIcon = (tipo) => {
    const colors = {
      inicio: "#27ae60",
      fin: "#e74c3c",
      intermedio: "#3498db",
      default: "#f39c12",
    };

    return L.divIcon({
      html: `<div style="background-color: ${colors[tipo] || colors.default};
                width: 16px; height: 16px;
                border-radius: 50%; border: 3px solid white; 
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
      iconSize: [22, 22],
      className: `route-point-icon ${tipo}`,
    });
  };

  // Estilos para diferentes tipos de rutas
  const getRouteStyle = (tipo) => {
    const styles = {
      peatonal: { color: "#27ae60", weight: 6, opacity: 0.8, dashArray: null },
      vehicular: { color: "#e74c3c", weight: 5, opacity: 0.7, dashArray: null },
      accesible: {
        color: "#3498db",
        weight: 6,
        opacity: 0.8,
        dashArray: "5, 10",
      },
      default: { color: "#f39c12", weight: 4, opacity: 0.7, dashArray: null },
    };

    return styles[tipo] || styles.default;
  };

  useEffect(() => {
    if (!mapInstance || !routes.length) return;

    console.log("🛣️ Renderizando rutas en el mapa:", routes.length);

    // Limpiar capas anteriores
    routeLayersRef.current.forEach((layer) => {
      if (mapInstance.hasLayer(layer)) {
        mapInstance.removeLayer(layer);
      }
    });
    routeLayersRef.current = [];

    routes.forEach((route) => {
      try {
        if (!route.geometria || route.geometria.type !== "LineString") {
          console.warn("❌ Geometría de ruta inválida:", route);
          return;
        }

        const style = getRouteStyle(route.tipo);

        // Crear línea de la ruta
        const coordinates = route.geometria.coordinates.map((coord) => [
          coord[1],
          coord[0],
        ]);
        const routeLine = L.polyline(coordinates, {
          color: style.color,
          weight: style.weight,
          opacity: style.opacity,
          dashArray: style.dashArray,
          className: "route-line",
        });

        // Agregar popup a la ruta
        const popupContent = `
          <div class="route-popup">
            <h4>${route.nombre}</h4>
            <div class="route-info">
              <p><strong>Tipo:</strong> ${route.tipo}</p>
              <p><strong>Distancia:</strong> ${route.distancia} metros</p>
              <p><strong>Tiempo estimado:</strong> ${route.tiempo_estimado} minutos</p>
            </div>
            <div class="route-actions">
              <button onclick="window.selectRoute(${route.id})" class="select-route-btn">
                🧭 Usar esta ruta
              </button>
            </div>
          </div>
        `;

        routeLine.bindPopup(popupContent);

        // Agregar evento de clic
        routeLine.on("click", (e) => {
          if (onRouteClick) {
            onRouteClick(route);
          }
          e.originalEvent.preventDefault();
          e.originalEvent.stopPropagation();
        });

        // Agregar al mapa
        routeLine.addTo(mapInstance);
        routeLayersRef.current.push(routeLine);

        // Crear marcadores para puntos de ruta
        if (route.puntos_ruta && route.puntos_ruta.length > 0) {
          route.puntos_ruta.forEach((punto) => {
            if (punto.coordenadas && punto.coordenadas.type === "Point") {
              const [lng, lat] = punto.coordenadas.coordinates;
              const pointMarker = L.marker([lat, lng], {
                icon: createRoutePointIcon(punto.tipo_punto),
                zIndexOffset: 1000,
              });

              const pointPopup = `
                <div class="route-point-popup">
                  <h5>${punto.descripcion || "Punto de ruta"}</h5>
                  <p><strong>Tipo:</strong> ${punto.tipo_punto}</p>
                  <p><strong>Orden:</strong> ${punto.orden}</p>
                </div>
              `;

              pointMarker.bindPopup(pointPopup);
              pointMarker.addTo(mapInstance);
              routeLayersRef.current.push(pointMarker);
            }
          });
        }

        console.log(`✅ Ruta "${route.nombre}" renderizada`);
      } catch (error) {
        console.error("❌ Error renderizando ruta:", route.nombre, error);
      }
    });

    // Función global para seleccionar ruta desde popup
    window.selectRoute = (routeId) => {
      const route = routes.find((r) => r.id === routeId);
      if (route && onRouteClick) {
        onRouteClick(route);
      }
    };

    return () => {
      // Limpiar al desmontar
      routeLayersRef.current.forEach((layer) => {
        if (mapInstance.hasLayer(layer)) {
          mapInstance.removeLayer(layer);
        }
      });
      routeLayersRef.current = [];
      delete window.selectRoute;
    };
  }, [mapInstance, routes, onRouteClick]);

  return null;
};

export default RouteLayer;
