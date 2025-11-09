// components/Map/RouteLayer.js
import React, { useEffect, useState, useRef, useCallback } from "react";
import L from "leaflet";
import { SpatialUtils } from "../../utils/spatialUtils";

const RouteLayer = ({ mapInstance, routes, onRouteClick }) => {
  const [routeLayers, setRouteLayers] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const previousRoutesRef = useRef([]);

  // REFERENCIAS PARA LAS FUNCIONES GLOBALES
  const selectRouteRef = useRef(null);
  const zoomToRouteRef = useRef(null);

  // CONFIGURACIÓN DE ESTILOS POR TIPO DE RUTA
  const getRouteStyle = (routeType) => {
    const styles = {
      peatonal: { color: "#27ae60", weight: 6, opacity: 0.8, dashArray: null },
      vehicular: { color: "#e74c3c", weight: 5, opacity: 0.8, dashArray: null },
      accesible: {
        color: "#3498db",
        weight: 6,
        opacity: 0.9,
        dashArray: "5, 5",
      },
      emergencia: {
        color: "#f39c12",
        weight: 7,
        opacity: 1.0,
        dashArray: null,
      },
      rapida: { color: "#9b59b6", weight: 5, opacity: 0.8, dashArray: "10, 5" },
    };
    return styles[routeType] || styles.peatonal;
  };

  // CREAR ICONOS PARA PUNTOS DE RUTA
  const createRoutePointIcon = (pointType, isSelected = false) => {
    const colors = {
      inicio: "#27ae60",
      fin: "#e74c3c",
      intermedio: "#3498db",
    };

    const size = isSelected ? 20 : 16;
    const border = isSelected ? 4 : 3;

    return L.divIcon({
      html: `
        <div style="
          background-color: ${colors[pointType] || "#95a5a6"};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: ${border}px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          ${isSelected ? "animation: pulse 1.5s infinite;" : ""}
        "></div>
      `,
      iconSize: [size + 8, size + 8],
      className: `route-point-${pointType} ${isSelected ? "selected" : ""}`,
    });
  };

  // CREAR POPUP INFORMATIVO CON MÉTRICAS TURF (CORREGIDO)
  const createRoutePopup = useCallback((route) => {
    let metricsHTML = "";

    try {
      if (route.geometria && route.geometria.coordinates.length >= 2) {
        // Calcular métricas adicionales con Turf
        const coordinates = route.geometria.coordinates;
        const length = SpatialUtils.calculateRouteLength(coordinates);
        const bearing =
          coordinates.length >= 2
            ? SpatialUtils.calculateBearing(
                { lng: coordinates[0][0], lat: coordinates[0][1] },
                { lng: coordinates[1][0], lat: coordinates[1][1] }
              ).toFixed(1)
            : "N/A";

        metricsHTML = `
          <div class="route-metrics">
            <div class="metric-item">
              <span class="metric-label">📏 Longitud Turf:</span>
              <span class="metric-value">${Math.round(length)}m</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">🧭 Rumbo inicial:</span>
              <span class="metric-value">${bearing}°</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">Puntos:</span>
              <span class="metric-value">${
                route.puntos_ruta?.length || coordinates.length
              }</span>
            </div>
          </div>
        `;
      }
    } catch (error) {
      console.error("Error calculando métricas Turf:", error);
    }

    // CORREGIDO: Usar data attributes en lugar de funciones globales
    return `
      <div class="route-popup">
        <h4>${route.nombre || "Ruta sin nombre"}</h4>
        <div class="route-info">
          <p><strong>Tipo:</strong> ${route.tipo || "peatonal"}</p>
          <p><strong>Distancia:</strong> ${route.distancia || 0}m</p>
          <p><strong>Tiempo estimado:</strong> ${
            route.tiempo_estimado || 0
          }min</p>
        </div>
      </div>
    `;
  }, []);

  // MANEJAR CLIC EN BOTONES DEL POPUP
  const handlePopupButtonClick = useCallback(
    (e) => {
      if (!mapInstance) return;

      const button = e.target;
      const routeId = button.getAttribute("data-route-id");
      const action = button.getAttribute("data-action");

      if (!routeId) return;

      const route = routes.find(
        (r) => r.id === routeId || r.id.toString() === routeId
      );
      if (!route) return;

      if (action === "select") {
        setSelectedRoute(route);
        onRouteClick?.(route);
        console.log(`Ruta seleccionada: ${route.nombre}`);
      } else if (action === "zoom") {
        // USAR TURF PARA CALCULAR BOUNDS DE LA RUTA
        if (route.geometria) {
          const coordinates = route.geometria.coordinates;
          if (coordinates.length > 0) {
            try {
              const points = coordinates.map((coord) => ({
                lng: coord[0],
                lat: coord[1],
              }));
              const bbox = SpatialUtils.calculateBoundingBox(points);
              if (bbox) {
                const bounds = L.latLngBounds(
                  [bbox[1], bbox[0]], // [minLat, minLng]
                  [bbox[3], bbox[2]] // [maxLat, maxLng]
                );
                mapInstance.fitBounds(bounds, { padding: [20, 20] });
                console.log(`🔍 Zoom a ruta: ${route.nombre}`);
              }
            } catch (error) {
              console.error("Error calculando bounds con Turf:", error);
              // Fallback al método original
              const bounds = coordinates.map((coord) => [coord[1], coord[0]]);
              mapInstance.fitBounds(bounds, { padding: [20, 20] });
            }
          }
        }
      }
    },
    [mapInstance, routes, onRouteClick]
  );

  // AGREGAR EVENT LISTENER PARA POPUPS
  useEffect(() => {
    if (!mapInstance) return;

    const handleMapClick = (e) => {
      const button = e.target;
      if (button.classList.contains("popup-btn")) {
        handlePopupButtonClick(e);
      }
    };

    // Agregar event listener al contenedor del mapa
    const mapContainer = mapInstance.getContainer();
    mapContainer.addEventListener("click", handleMapClick);

    return () => {
      mapContainer.removeEventListener("click", handleMapClick);
    };
  }, [mapInstance, handlePopupButtonClick]);

  // RENDERIZAR RUTAS EN EL MAPA
  useEffect(() => {
    if (!mapInstance || !routes.length) {
      // Limpiar capas si no hay rutas
      if (routeLayers.length > 0) {
        routeLayers.forEach((layer) => {
          if (mapInstance?.hasLayer(layer)) {
            mapInstance.removeLayer(layer);
          }
        });
        setRouteLayers([]);
      }
      return;
    }

    // Verificar si las rutas cambiaron
    const routesChanged =
      JSON.stringify(routes) !== JSON.stringify(previousRoutesRef.current);
    if (!routesChanged && routeLayers.length > 0) return;

    console.log(`Renderizando ${routes.length} rutas con Turf.js`);

    // Limpiar capas anteriores
    routeLayers.forEach((layer) => {
      if (mapInstance.hasLayer(layer)) {
        mapInstance.removeLayer(layer);
      }
    });

    const newLayers = [];

    routes.forEach((route) => {
      try {
        if (!route.geometria || !route.geometria.coordinates) {
          console.warn(`Ruta sin geometría: ${route.nombre}`);
          return;
        }

        const coordinates = route.geometria.coordinates;
        if (coordinates.length < 2) {
          console.warn(`Ruta con menos de 2 puntos: ${route.nombre}`);
          return;
        }

        // CREAR LÍNEA DE RUTA
        const style = getRouteStyle(route.tipo);
        const latLngs = coordinates.map((coord) => [coord[1], coord[0]]);

        const routeLine = L.polyline(latLngs, {
          color: style.color,
          weight: style.weight,
          opacity: style.opacity,
          dashArray: style.dashArray,
          className: `route-line route-${route.tipo}`,
        });

        // AGREGAR POPUP Y EVENTOS (CORREGIDO)
        routeLine.bindPopup(createRoutePopup(route));

        routeLine.on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          setSelectedRoute(route);
          onRouteClick?.(route);
        });

        routeLine.addTo(mapInstance);
        newLayers.push(routeLine);

        // CREAR PUNTOS DE LA RUTA
        if (route.puntos_ruta && route.puntos_ruta.length > 0) {
          route.puntos_ruta.forEach((punto, index) => {
            if (punto.coordenadas && punto.coordenadas.coordinates) {
              const [lng, lat] = punto.coordenadas.coordinates;
              const isSelected = selectedRoute && selectedRoute.id === route.id;

              const pointMarker = L.marker([lat, lng], {
                icon: createRoutePointIcon(punto.tipo_punto, isSelected),
                zIndexOffset: isSelected ? 1000 : 500,
              });

              pointMarker.bindPopup(`
                <div class="point-popup">
                  <h5>${punto.nombre_punto || `Punto ${index + 1}`}</h5>
                  <p><strong>Tipo:</strong> ${punto.tipo_punto}</p>
                  <p><strong>Coordenadas:</strong><br>
                  ${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
                  <p><strong>Orden:</strong> ${punto.orden || index + 1}</p>
                </div>
              `);

              pointMarker.addTo(mapInstance);
              newLayers.push(pointMarker);
            }
          });
        }

        console.log(
          `Ruta "${route.nombre}" renderizada: ${coordinates.length} puntos`
        );
      } catch (error) {
        console.error(`Error renderizando ruta ${route.nombre}:`, error);
      }
    });

    setRouteLayers(newLayers);
    previousRoutesRef.current = routes;
  }, [mapInstance, routes, selectedRoute, onRouteClick, createRoutePopup]);

  // EFECTO PARA DESTACAR RUTA SELECCIONADA
  useEffect(() => {
    if (!mapInstance || routeLayers.length === 0) return;

    routeLayers.forEach((layer) => {
      if (layer instanceof L.Polyline) {
        // Verificar si esta capa pertenece a la ruta seleccionada
        const isSelected =
          selectedRoute &&
          layer._popup &&
          layer._popup._content.includes(`data-route-id="${selectedRoute.id}"`);

        if (isSelected) {
          layer.setStyle({
            weight: 8,
            opacity: 1.0,
            color: "#f1c40f",
          });
          layer.bringToFront();
        } else {
          // Obtener el tipo de ruta del className
          const className = layer.options.className || "";
          const routeTypeMatch = className.match(/route-(\w+)/);
          const routeType = routeTypeMatch ? routeTypeMatch[1] : "peatonal";
          const style = getRouteStyle(routeType);
          layer.setStyle(style);
        }
      }
    });
  }, [selectedRoute, routeLayers, mapInstance]);

  // RENDERIZAR INFORMACIÓN DE ANÁLISIS TURF
  const renderTurfAnalytics = () => {
    if (routes.length === 0) return null;

    try {
      const totalDistance = routes.reduce((sum, route) => {
        if (route.geometria) {
          const length = SpatialUtils.calculateRouteLength(
            route.geometria.coordinates
          );
          return sum + length;
        }
        return sum;
      }, 0);

      const avgPoints =
        routes.reduce((sum, route) => {
          return (
            sum +
            (route.puntos_ruta?.length ||
              route.geometria?.coordinates.length ||
              0)
          );
        }, 0) / routes.length;
    } catch (error) {
      console.error("Error en analytics Turf:", error);
      return null;
    }
  };

  return (
    <>
      {renderTurfAnalytics()}

      {/* ESTILOS CSS INLINE */}
      <style>
        {`
          .route-popup {
            min-width: 250px;
          }
          
          .route-metrics {
            background: #f8f9fa;
            padding: 8px;
            border-radius: 4px;
            margin: 8px 0;
          }
          
          .metric-item {
            display: flex;
            justify-content: space-between;
            margin: 4px 0;
            font-size: 12px;
          }
          
          .metric-label {
            color: #666;
          }
          
          .metric-value {
            font-weight: bold;
            color: #2c3e50;
          }
          
          .popup-actions {
            display: flex;
            gap: 5px;
            margin-top: 10px;
          }
          
          .popup-btn {
            flex: 1;
            padding: 5px 8px;
            border: none;
            border-radius: 3px;
            cursor: pointer;
            font-size: 11px;
          }
          
          .select-btn { 
            background: #3498db; 
            color: white; 
          }
          
          .zoom-btn { 
            background: #27ae60; 
            color: white; 
          }
          
          .popup-btn:hover {
            opacity: 0.9;
          }
          
          .point-popup {
            text-align: center;
            min-width: 180px;
          }
          
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          
          .turf-analytics-overlay {
            position: absolute;
            top: 10px;
            right: 10px;
            z-index: 1000;
            background: white;
            padding: 10px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            max-width: 250px;
          }
          
          .analytics-stats {
            display: flex;
            flex-direction: column;
            gap: 5px;
          }
          
          .stat {
            display: flex;
            justify-content: space-between;
            font-size: 12px;
          }
          
          .stat-label {
            color: #666;
          }
          
          .stat-value {
            font-weight: bold;
            color: #2c3e50;
          }
        `}
      </style>
    </>
  );
};

export default RouteLayer;
