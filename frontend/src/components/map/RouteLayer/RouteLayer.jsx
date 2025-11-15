// components/map/RouteLayer/RouteLayer.jsx
import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "./RouteLayer.css";

const RouteLayer = ({
  mapInstance,
  routes,
  onRouteClick,
  originFilter,
  destinationFilter,
  selectedRoute,
  editingRoute, // ⭐ NUEVO: Recibir la ruta que se está editando
}) => {
  const routeLayerRef = useRef(null);
  const markersLayerRef = useRef(null);

  // Función para obtener estilos según tipo de ruta
  const getRouteStyle = (route) => {
    const hasFilters = originFilter && destinationFilter;

    const baseStyle = {
      opacity: 0.9,
      lineCap: "round",
      lineJoin: "round",
      className: "route-line",
    };

    if (!hasFilters) {
      return {
        ...baseStyle,
        color: "#9b59b6",
        weight: 4,
        opacity: 0.7,
        dashArray: null,
        className: "route-no-filter route-line",
      };
    }

    const typeColors = {
      peatonal: "#27ae60",
      accesible: "#3498db",
      emergencia: "#e74c3c",
      rapida: "#f39c12",
      vehicular: "#9b59b6",
      default: "#95a5a6",
    };

    const routeType = route.tipo?.toLowerCase() || "default";
    const baseColor = typeColors[routeType] || typeColors.default;

    return {
      ...baseStyle,
      color: baseColor,
      weight: 6,
      opacity: 0.8,
      dashArray: null,
      className: `route-${routeType} route-line`,
    };
  };

  // Función para generar contenido del tooltip
  const getTooltipContent = (route) => {
    let content = `
      <div class="route-tooltip">
        <strong>${route.nombre}</strong><br/>
        <span class="route-type ${route.tipo?.toLowerCase() || "default"}">
          Tipo: ${route.tipo || "No especificado"}
        </span><br/>
        📏 Distancia: ${route.distancia || 0}m<br/>
        ⏱️ Tiempo: ${route.tiempo_estimado || 0} min
    `;

    if (route.prioridad) {
      content += `<br/>Prioridad: ${route.prioridad.toUpperCase()}`;
    }

    if (route.descripcion) {
      content += `<br/><small>${route.descripcion}</small>`;
    }

    content += `</div>`;
    return content;
  };

  // USEFFECT PRINCIPAL
  useEffect(() => {
    console.log("RouteLayer - Mostrando rutas:", routes?.length || 0);

    // ⭐ Log para debugging
    if (editingRoute) {
      console.log(
        "🔧 Ruta en edición:",
        editingRoute.nombre,
        "ID:",
        editingRoute.id
      );
    }

    if (!routes || !Array.isArray(routes) || !mapInstance) {
      return;
    }

    // Inicializar capas
    if (!routeLayerRef.current) {
      routeLayerRef.current = L.layerGroup().addTo(mapInstance);
    }
    if (!markersLayerRef.current) {
      markersLayerRef.current = L.layerGroup().addTo(mapInstance);
    }

    // Limpiar capas anteriores
    routeLayerRef.current.clearLayers();
    markersLayerRef.current.clearLayers();

    if (routes.length === 0) {
      console.log("No hay rutas para mostrar");
      return;
    }

    // Procesar cada ruta
    routes.forEach((route) => {
      // ⭐ OCULTAR LA RUTA QUE SE ESTÁ EDITANDO
      if (editingRoute && route.id === editingRoute.id) {
        console.log("⏭️ Saltando ruta en edición:", route.nombre);
        return; // Saltar esta ruta
      }

      if (!route || !route.geometria || !route.geometria.coordinates) {
        console.warn("Ruta sin geometría válida:", route);
        return;
      }

      const coordinates = route.geometria.coordinates;

      // Convertir coordenadas [lng, lat] a [lat, lng] para Leaflet
      const latLngs = coordinates.map((coord) => [coord[1], coord[0]]);

      if (latLngs.length < 2) {
        console.warn("Ruta con coordenadas insuficientes:", route.nombre);
        return;
      }

      // Crear polyline
      const polylineOptions = getRouteStyle(route);
      const polyline = L.polyline(latLngs, polylineOptions);

      // Tooltip
      const tooltipContent = getTooltipContent(route);
      polyline.bindTooltip(tooltipContent, {
        permanent: false,
        direction: "top",
        className: "custom-tooltip",
      });

      // Evento click
      polyline.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        console.log("Ruta clickeada:", route.nombre);
        if (onRouteClick) {
          onRouteClick(route);
        }
      });

      // Resaltar ruta seleccionada
      if (selectedRoute && selectedRoute.id === route.id) {
        polyline.setStyle({
          color: "#e67e22",
          weight: polylineOptions.weight + 2,
          opacity: 1,
          className: "route-line route-selected",
        });
      }

      // Agregar al mapa
      routeLayerRef.current.addLayer(polyline);

      // Agregar marcadores de inicio/fin si hay filtros
      if (originFilter && destinationFilter) {
        const startCoords = latLngs[0];
        const startMarker = L.marker(startCoords, {
          icon: L.divIcon({
            html: '<div class="route-marker origin">🚩</div>',
            className: "route-marker-icon",
            iconSize: [30, 30],
          }),
        }).bindTooltip("Inicio", {
          permanent: false,
          direction: "top",
        });

        const endCoords = latLngs[latLngs.length - 1];
        const endMarker = L.marker(endCoords, {
          icon: L.divIcon({
            html: '<div class="route-marker destination">🎯</div>',
            className: "route-marker-icon",
            iconSize: [30, 30],
          }),
        }).bindTooltip("Fin", {
          permanent: false,
          direction: "top",
        });

        markersLayerRef.current.addLayer(startMarker);
        markersLayerRef.current.addLayer(endMarker);
      }
    });

    // ⭐ Contar rutas mostradas excluyendo la que está en edición
    const routesShown = routes.filter(
      (r) => !editingRoute || r.id !== editingRoute.id
    ).length;
    console.log(
      `RouteLayer - ${routesShown} rutas mostradas (${
        editingRoute ? "1 oculta por edición" : "0 ocultas"
      })`
    );
  }, [
    mapInstance,
    routes,
    onRouteClick,
    selectedRoute,
    originFilter,
    destinationFilter,
    editingRoute, // ⭐ AGREGAR DEPENDENCIA
  ]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (routeLayerRef.current && mapInstance) {
        routeLayerRef.current.clearLayers();
        mapInstance.removeLayer(routeLayerRef.current);
      }
      if (markersLayerRef.current && mapInstance) {
        markersLayerRef.current.clearLayers();
        mapInstance.removeLayer(markersLayerRef.current);
      }
    };
  }, [mapInstance]);

  return null;
};

export default RouteLayer;
