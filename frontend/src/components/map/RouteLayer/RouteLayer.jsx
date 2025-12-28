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
  editingRoute,
}) => {
  const routeLayerRef = useRef(null);
  const markersLayerRef = useRef(null);

  const getRouteStyle = (route) => {
    const hasFilters = originFilter && destinationFilter;

    // Definir colores por tipo de ruta
    const typeColors = {
      peatonal: "#27ae60",
      accesible: "#3498db",
      default: "#95a5a6",
    };

    const routeType = route.tipo?.toLowerCase() || "default";
    const routeColor = typeColors[routeType] || typeColors.default;

    const baseStyle = {
      opacity: 0.9,
      lineCap: "round",
      lineJoin: "round",
      className: "route-line",
    };

    // Ajustar estilo según si hay filtros o no
    if (!hasFilters) {
      return {
        ...baseStyle,
        color: routeColor,
        weight: 4,
        opacity: 0.7,
        dashArray: null,
        className: `route-${routeType} route-line`,
      };
    }

    // Con filtros activos, líneas más gruesas
    return {
      ...baseStyle,
      color: routeColor,
      weight: 6,
      opacity: 0.8,
      dashArray: null,
      className: `route-${routeType} route-line`,
    };
  };

  const getTooltipContent = (route) => {
    let content = `
      <div class="route-tooltip">
        <strong>${route.nombre}</strong><br/>
        <span class="route-type ${route.tipo?.toLowerCase() || "default"}">
          Tipo: ${route.tipo || "No especificado"}
        </span><br/>
        Distancia: ${route.distancia || 0}m<br/>
        Tiempo: ${route.tiempo_estimado || 0} min
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

  useEffect(() => {
    console.log("RouteLayer - Total rutas:", routes?.length || 0);

    if (editingRoute) {
      console.log("Modo edición activo - Ocultando TODAS las rutas");
      console.log("Editando:", editingRoute.nombre, "ID:", editingRoute.id);
    }

    if (!routes || !Array.isArray(routes) || !mapInstance) {
      return;
    }

    if (!routeLayerRef.current) {
      routeLayerRef.current = L.layerGroup().addTo(mapInstance);
    }
    if (!markersLayerRef.current) {
      markersLayerRef.current = L.layerGroup().addTo(mapInstance);
    }

    routeLayerRef.current.clearLayers();
    markersLayerRef.current.clearLayers();

    // SI ESTAMOS EDITANDO, NO MOSTRAR NINGUNA RUTA
    if (editingRoute) {
      console.log("Ocultando todas las rutas durante edición");
      return;
    }

    if (routes.length === 0) {
      console.log("No hay rutas para mostrar");
      return;
    }

    // Procesar cada ruta (solo cuando NO estamos editando)
    routes.forEach((route) => {
      if (!route || !route.geometria || !route.geometria.coordinates) {
        console.warn("Ruta sin geometría válida:", route);
        return;
      }

      const coordinates = route.geometria.coordinates;
      const latLngs = coordinates.map((coord) => [coord[1], coord[0]]);

      if (latLngs.length < 2) {
        console.warn("Ruta con coordenadas insuficientes:", route.nombre);
        return;
      }

      const polylineOptions = getRouteStyle(route);
      const polyline = L.polyline(latLngs, polylineOptions);

      const tooltipContent = getTooltipContent(route);
      polyline.bindTooltip(tooltipContent, {
        permanent: false,
        direction: "top",
        className: "custom-tooltip",
      });

      polyline.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        console.log("Ruta clickeada:", route.nombre);
        if (onRouteClick) {
          onRouteClick(route);
        }
      });

      if (selectedRoute && selectedRoute.id === route.id) {
        polyline.setStyle({
          color: "#e67e22",
          weight: polylineOptions.weight + 2,
          opacity: 1,
          className: "route-line route-selected",
        });
      }

      routeLayerRef.current.addLayer(polyline);

      if (originFilter && destinationFilter) {
        const startCoords = latLngs[0];
        const startMarker = L.marker(startCoords, {
          icon: L.divIcon({
            html: '<div class="route-marker origin"></div>',
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
            html: '<div class="route-marker destination"></div>',
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

    console.log(`${routes.length} rutas mostradas con sus colores`);
  }, [
    mapInstance,
    routes,
    onRouteClick,
    selectedRoute,
    originFilter,
    destinationFilter,
    editingRoute,
  ]);

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
