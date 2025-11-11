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
}) => {
  const routeLayerRef = useRef(null);
  const markersLayerRef = useRef(null);

  // FUNCIÓN PARA ASIGNAR COLORES SEGÚN TIPO DE RUTA
  const getRouteStyle = (route) => {
    const hasFilters = originFilter && destinationFilter;

    const baseStyle = {
      weight: 6,
      opacity: 0.9,
      lineCap: "round",
      lineJoin: "round",
      className: "route-line", // Clase base siempre aplicada
    };

    // SIN FILTROS: todas en morado
    if (!hasFilters) {
      return {
        ...baseStyle,
        color: "#9b59b6",
        weight: 4,
        opacity: 0.7,
        dashArray: null,
        className: "route-no-filter route-line", // Múltiples clases
      };
    }

    // CON FILTROS: colores por tipo
    const typeColors = {
      peatonal: "#27ae60",
      accesible: "#3498db",
      emergencia: "#e74c3c",
      rapida: "#f39c12",
      vehicular: "#9b59b6",
      default: "#95a5a6",
    };

    const routeType = route.tipo?.toLowerCase() || "default";
    const color = typeColors[routeType] || typeColors.default;

    // DEBUG DE COLORES
    console.log(`🎨 Applying color for ${route.nombre}:`, {
      type: routeType,
      color: color,
      isComplete: route.es_ruta_completa,
      hasFilters: hasFilters,
    });

    // DIFERENCIAR POR GROSOR Y CLASE
    if (route.es_ruta_completa) {
      return {
        ...baseStyle,
        color: color, // Color inline como fallback
        weight: 8, // Más grueso para rutas prioritarias
        opacity: 0.9,
        dashArray: null,
        className: `route-priority route-${routeType} route-line`, // Múltiples clases
      };
    }

    // Rutas normales (segmentos)
    return {
      ...baseStyle,
      color: color, // Color inline como fallback
      weight: 4,
      opacity: 0.7,
      dashArray: null,
      className: `route-normal route-${routeType} route-line`, // Múltiples clases
    };
  };

  // FUNCIÓN PARA TOOLTIP INFORMATIVO
  const getTooltipContent = (route) => {
    const hasFilters = originFilter && destinationFilter;
    const isPriorityRoute = route.es_ruta_completa === true;

    let content = `
      <div class="route-tooltip">
        <strong>${route.nombre}</strong><br/>
    `;

    // Mostrar tipo solo cuando hay filtros
    if (hasFilters) {
      content += `
        <span class="route-type ${route.tipo?.toLowerCase() || "default"}">
          Tipo: ${route.tipo || "No especificado"}
        </span><br/>
      `;
    } else {
      content += `<span class="route-type no-filter">Modo: Todas las rutas</span><br/>`;
    }

    content += `
        Distancia: ${route.distancia || 0}m<br/>
        Tiempo: ${route.tiempo_estimado || 0} min
    `;

    // Solo mostrar "Ruta más corta" si realmente es prioritaria Y hay filtros
    if (isPriorityRoute && hasFilters) {
      content += `<br/><em class="priority-label">★ Ruta más corta</em>`;
    } else if (route.es_segmento && hasFilters) {
      content += `<br/><em class="segment-label">● Segmento ${
        route.segment_index + 1
      }/${route.total_segments || 1}</em>`;
    }

    if (route.descripcion) {
      content += `<br/><small>${route.descripcion}</small>`;
    }

    content += `</div>`;
    return content;
  };

  // ========== USEFFECT PRINCIPAL - AQUÍ COMIENZA ==========
  useEffect(() => {
    const hasFilters = originFilter && destinationFilter;

    console.log("🎯🔄 RouteLayer Refresh:", {
      totalRoutes: routes?.length || 0,
      mode: hasFilters ? "CON FILTROS" : "SIN FILTROS",
      origin: originFilter,
      destination: destinationFilter,
      routeTypes: routes ? [...new Set(routes.map((r) => r.tipo))] : [],
      priorityRoutes: routes
        ? routes.filter((r) => r.es_ruta_completa).length
        : 0,
      segments: routes ? routes.filter((r) => r.es_segmento).length : 0,
    });

    // VERIFICACIÓN DE SEGURIDAD - AÑADIR ESTA PARTE
    if (!routes || !Array.isArray(routes)) {
      console.warn("❌ Routes is not an array or is undefined:", routes);
      return;
    }

    // DEBUG DETALLADO DE TODAS LAS RUTAS
    console.log("📋 LISTA COMPLETA DE RUTAS:");
    routes.forEach((route, index) => {
      if (!route) {
        console.warn(`❌ Route at index ${index} is undefined`);
        return;
      }
      console.log(`Route ${index}:`, {
        name: route.nombre,
        type: route.tipo,
        es_ruta_completa: route.es_ruta_completa,
        es_segmento: route.es_segmento,
        origen: route.origen,
        destino: route.destino,
        distancia: route.distancia,
        coordinates: route.geometria?.coordinates?.length || 0,
        hasGeometry: !!route.geometria,
        hasCoordinates: !!route.geometria?.coordinates,
      });
    });

    if (!mapInstance) {
      console.log("Map instance not available");
      return;
    }

    // Crear capas si no existen
    if (!routeLayerRef.current) {
      routeLayerRef.current = L.layerGroup().addTo(mapInstance);
    }
    if (!markersLayerRef.current) {
      markersLayerRef.current = L.layerGroup().addTo(mapInstance);
    }

    // Limpiar capas anteriores
    routeLayerRef.current.clearLayers();
    markersLayerRef.current.clearLayers();

    // Si no hay rutas, salir
    if (routes.length === 0) {
      console.log("No routes to display");
      return;
    }

    // CONTADORES PARA DEBUG
    let priorityCount = 0;
    let segmentCount = 0;
    let normalCount = 0;
    let invalidCount = 0;

    routes.forEach((route, index) => {
      // VERIFICACIÓN COMPLETA DE LA RUTA - AÑADIR ESTAS VERIFICACIONES
      if (!route) {
        console.warn(`❌ Route at index ${index} is undefined`);
        invalidCount++;
        return;
      }

      console.log(`🔍 Checking route ${index}: "${route.nombre}"`, {
        hasGeometry: !!route.geometria,
        hasCoordinates: !!route.geometria?.coordinates,
        coordinatesLength: route.geometria?.coordinates?.length || 0,
        isComplete: route.es_ruta_completa,
        isSegment: route.es_segmento,
      });

      if (!route.geometria || !route.geometria.coordinates) {
        console.warn(
          `❌ Route "${route.nombre}" has no geometry or coordinates:`,
          route
        );
        invalidCount++;
        return;
      }

      const coordinates = route.geometria.coordinates;

      // VALIDAR COORDENADAS
      if (!Array.isArray(coordinates) || coordinates.length < 2) {
        console.warn(
          `❌ Route "${route.nombre}" has insufficient coordinates:`,
          coordinates
        );
        invalidCount++;
        return;
      }

      // CONVERTIR COORDENADAS A FORMATO [lat, lng] PARA LEAFLET
      const latLngs = coordinates
        .map((coord, coordIndex) => {
          if (!Array.isArray(coord) || coord.length < 2) {
            console.warn(
              `❌ Invalid coordinate at index ${coordIndex} in route "${route.nombre}":`,
              coord
            );
            return null;
          }

          const lng = coord[0];
          const lat = coord[1];

          if (typeof lat !== "number" || typeof lng !== "number") {
            console.warn(
              `❌ Invalid coordinate values at index ${coordIndex} in route "${route.nombre}":`,
              { lat, lng }
            );
            return null;
          }

          return [lat, lng];
        })
        .filter((coord) => coord !== null);

      if (latLngs.length < 2) {
        console.warn(
          `❌ Route "${route.nombre}" has no valid coordinates after filtering`
        );
        invalidCount++;
        return;
      }

      // CONTAR TIPOS DE RUTAS
      if (route.es_ruta_completa) priorityCount++;
      else if (route.es_segmento) segmentCount++;
      else normalCount++;

      console.log(
        `✅ Processing route "${route.nombre}" with ${latLngs.length} valid points`
      );

      // OBTENER ESTILO
      const polylineOptions = getRouteStyle(route);
      const polyline = L.polyline(latLngs, polylineOptions);

      // DEBUG DE ESTILOS APLICADOS
      console.log(`🌈 Route "${route.nombre}" styles:`, {
        className: polylineOptions.className,
        color: polylineOptions.color,
        weight: polylineOptions.weight,
        type: route.tipo,
        isComplete: route.es_ruta_completa,
      });

      // TOOLTIP INFORMATIVO
      const tooltipContent = getTooltipContent(route);
      polyline.bindTooltip(tooltipContent, {
        permanent: false,
        direction: "top",
        className: "custom-tooltip",
      });

      // EVENTO CLICK
      polyline.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        console.log("Route clicked:", {
          name: route.nombre,
          type: route.tipo,
          isPriority: route.es_ruta_completa,
          isSegment: route.es_segmento,
        });
        if (onRouteClick) {
          onRouteClick(route);
        }
      });

      // RESALTAR SI ESTÁ SELECCIONADO
      if (selectedRoute && selectedRoute.id === route.id) {
        polyline.setStyle({
          color: "#e67e22", // NARANJA intenso para rutas seleccionadas
          weight: polylineOptions.weight + 2,
          opacity: 1,
        });
      }

      // AGREGAR A LA CAPA
      routeLayerRef.current.addLayer(polyline);

      // AGREGAR MARCADORES SOLO PARA RUTAS COMPLETAS PRIORITARIAS (con filtros)
      if (route.es_ruta_completa && hasFilters) {
        // Marcador de inicio
        const startCoords = latLngs[0];
        const startMarker = L.marker(startCoords, {
          icon: L.divIcon({
            html: '<div class="route-marker origin">🏁</div>',
            className: "route-marker-icon",
            iconSize: [30, 30],
          }),
        }).bindTooltip(`Origen: ${route.origen || "Inicio"}`, {
          permanent: false,
          direction: "top",
        });

        // Marcador de fin
        const endCoords = latLngs[latLngs.length - 1];
        const endMarker = L.marker(endCoords, {
          icon: L.divIcon({
            html: '<div class="route-marker destination">🎯</div>',
            className: "route-marker-icon",
            iconSize: [30, 30],
          }),
        }).bindTooltip(`Destino: ${route.destino || "Fin"}`, {
          permanent: false,
          direction: "top",
        });

        markersLayerRef.current.addLayer(startMarker);
        markersLayerRef.current.addLayer(endMarker);

        // POPUP INFORMATIVO PARA LA RUTA COMPLETA
        const routeInfo = `
          <div class="route-summary">
            <h3>🚗 Ruta Más Corta</h3>
            <p><strong>${route.origen || "Origen"}</strong> → <strong>${
          route.destino || "Destino"
        }</strong></p>
            <hr>
            <p>📏 Distancia total: <strong>${route.distancia || 0}m</strong></p>
            <p>⏱️ Tiempo estimado: <strong>${
              route.tiempo_estimado || 0
            } min</strong></p>
            <p>🔗 Segmentos: <strong>${
              route.segmentos_originales || 1
            }</strong></p>
            <p>🎨 Tipo: <strong>${route.tipo || "Prioritaria"}</strong></p>
          </div>
        `;

        startMarker.bindPopup(routeInfo);
      }
    });

    // DEBUG FINAL
    console.log("📊 RouteLayer Summary:", {
      total: routes.length,
      valid: routes.length - invalidCount,
      invalid: invalidCount,
      priority: priorityCount,
      segments: segmentCount,
      normal: normalCount,
      mode: hasFilters ? "FILTERED" : "ALL",
    });

    // AJUSTAR VISTA DEL MAPA PARA MOSTRAR TODAS LAS RUTAS
    if (routeLayerRef.current.getLayers().length > 0) {
      const group = new L.featureGroup(routeLayerRef.current.getLayers());
      mapInstance.fitBounds(group.getBounds(), { padding: [20, 20] });
      console.log(
        `✅ Map bounds adjusted to show ${
          routeLayerRef.current.getLayers().length
        } routes`
      );
    } else {
      console.warn("⚠️ No valid routes were added to the map");
    }
  }, [
    mapInstance,
    routes,
    onRouteClick,
    selectedRoute,
    originFilter,
    destinationFilter,
  ]);

  // CLEANUP
  useEffect(() => {
    return () => {
      console.log("RouteLayer: Cleaning up layers");
      if (routeLayerRef.current) {
        routeLayerRef.current.clearLayers();
        if (mapInstance) {
          mapInstance.removeLayer(routeLayerRef.current);
        }
      }
      if (markersLayerRef.current) {
        markersLayerRef.current.clearLayers();
        if (mapInstance) {
          mapInstance.removeLayer(markersLayerRef.current);
        }
      }
    };
  }, [mapInstance]);

  return null;
};

export default RouteLayer;
