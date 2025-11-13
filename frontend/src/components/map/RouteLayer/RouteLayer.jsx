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

  // FUNCIÓN PARA APLICAR ESTILOS CSS DIRECTAMENTE AL ELEMENTO
  const applyCustomStyles = (polyline, route) => {
    setTimeout(() => {
      const pathElement = polyline.getElement();
      if (pathElement) {
        const routeType = route.tipo?.toLowerCase() || "default";
        const hasFilters = originFilter && destinationFilter;

        if (!hasFilters) {
          pathElement.style.stroke = "#9b59b6";
          pathElement.style.strokeWidth = "4px";
          pathElement.style.strokeOpacity = "0.7";
          pathElement.style.strokeDasharray = "none";
        } else {
          const typeColors = {
            peatonal: "#27ae60",
            accesible: "#3498db",
            emergencia: "#e74c3c",
            rapida: "#f39c12",
            vehicular: "#9b59b6",
            default: "#95a5a6",
          };

          const color = typeColors[routeType] || typeColors.default;

          if (route.es_ruta_completa) {
            pathElement.style.stroke = color;
            pathElement.style.strokeWidth = "8px";
            pathElement.style.strokeOpacity = "1";
            pathElement.style.strokeDasharray = "none";
          } else if (route.es_combinada) {
            pathElement.style.stroke = color;
            pathElement.style.strokeWidth = "6px";
            pathElement.style.strokeOpacity = "0.8";
            pathElement.style.strokeDasharray = "10, 5";
          } else if (route.es_segmento) {
            pathElement.style.stroke = color;
            pathElement.style.strokeWidth = "4px";
            pathElement.style.strokeOpacity = "0.6";
            pathElement.style.strokeDasharray = "5, 5";
          } else {
            pathElement.style.stroke = color;
            pathElement.style.strokeWidth = "6px";
            pathElement.style.strokeOpacity = "0.7";
            pathElement.style.strokeDasharray = "none";
          }
        }

        pathElement.classList.add("route-line");
        pathElement.classList.add(`route-${routeType}`);

        if (!hasFilters) {
          pathElement.classList.add("route-no-filter");
        } else {
          if (route.es_ruta_completa) {
            pathElement.classList.add("route-complete");
          } else if (route.es_combinada) {
            pathElement.classList.add("route-combined");
          } else if (route.es_segmento) {
            pathElement.classList.add("route-segment");
          } else {
            pathElement.classList.add("route-normal");
          }
        }
      }
    }, 100);
  };

  // Funcion para asignar colores segun tipo de ruta
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

    let style = {
      ...baseStyle,
      color: baseColor,
    };

    if (route.es_ruta_completa) {
      style.weight = 8;
      style.opacity = 1;
      style.dashArray = null;
      style.className = `route-complete route-${routeType} route-line`;
    } else if (route.es_combinada) {
      style.weight = 6;
      style.opacity = 0.8;
      style.dashArray = "10, 5";
      style.className = `route-combined route-${routeType} route-line`;
    } else if (route.es_segmento) {
      style.weight = 4;
      style.opacity = 0.6;
      style.dashArray = "5, 5";
      style.className = `route-segment route-${routeType} route-line`;
    } else {
      style.weight = 6;
      style.opacity = 0.7;
      style.dashArray = null;
      style.className = `route-normal route-${routeType} route-line`;
    }

    return style;
  };

  // Función para generar contenido del tooltip
  const getTooltipContent = (route) => {
    const hasFilters = originFilter && destinationFilter;

    let content = `
    <div class="route-tooltip">
      <strong>${route.nombre}</strong><br/>
  `;

    content += `
    <span class="route-type ${route.tipo?.toLowerCase() || "default"}">
      Tipo: ${route.tipo || "No especificado"}
    </span><br/>
    `;

    if (route.es_ruta_completa) {
      content += `<span class="route-category complete"> Ruta Completa</span><br/>`;
    } else if (route.es_combinada) {
      content += `<span class="route-category combined"> Ruta Combinada (${route.segmentos_incluidos}/${route.segmentos_totales} segmentos)</span><br/>`;
    } else if (route.es_segmento) {
      content += `<span class="route-category segment"> Segmento ${
        route.segmento_index + 1
      }/${route.segmento_total}</span><br/>`;
    } else {
      content += `<span class="route-category normal"> Ruta Normal</span><br/>`;
    }

    content += `
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
    const hasFilters = originFilter && destinationFilter;

    console.log("RouteLayer Refresh:", {
      totalRoutes: routes?.length || 0,
      mode: hasFilters ? "CON FILTROS - TODAS LAS RUTAS" : "SIN FILTROS",
      origin: originFilter,
      destination: destinationFilter,
      routeTypes: routes ? [...new Set(routes.map((r) => r.tipo))] : [],
    });

    if (!routes || !Array.isArray(routes)) {
      console.warn(
        "La lista de rutas no es un array o está indefinida:",
        routes
      );
      return;
    }

    console.log("Lista Completa de Rutas:");
    routes.forEach((route, index) => {
      if (!route) {
        console.warn(`Ruta en el índice ${index} está indefinida`);
        return;
      }
      console.log(`Ruta ${index}:`, {
        name: route.nombre,
        type: route.tipo,
        es_ruta_completa: route.es_ruta_completa,
        es_segmento: route.es_segmento,
        es_combinada: route.es_combinada,
        prioridad: route.prioridad,
        origen: route.origen,
        destino: route.destino,
        distancia: route.distancia,
        coordinates: route.geometria?.coordinates?.length || 0,
      });
    });

    if (!mapInstance) {
      console.log("Instancia de Mapa no disponible");
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

    if (routes.length === 0) {
      console.log("No routes to display");
      return;
    }

    let completeCount = 0;
    let combinedCount = 0;
    let segmentCount = 0;
    let normalCount = 0;
    let invalidCount = 0;
    let byTypeCount = {};

    routes.forEach((route, index) => {
      if (!route) {
        console.warn(`Ruta en el índice ${index} está indefinida`);
        invalidCount++;
        return;
      }

      console.log(`Revisando ruta ${index}: "${route.nombre}"`, {
        hasGeometry: !!route.geometria,
        hasCoordinates: !!route.geometria?.coordinates,
        coordinatesLength: route.geometria?.coordinates?.length || 0,
        isComplete: route.es_ruta_completa,
        isSegment: route.es_segmento,
        isCombined: route.es_combinada,
      });

      if (!route.geometria || !route.geometria.coordinates) {
        console.warn(
          `Ruta "${route.nombre}" sin geometría o coordenadas:`,
          route
        );
        invalidCount++;
        return;
      }

      const coordinates = route.geometria.coordinates;

      if (!Array.isArray(coordinates) || coordinates.length < 2) {
        console.warn(
          `Ruta "${route.nombre}" tiene coordenadas insuficientes:`,
          coordinates
        );
        invalidCount++;
        return;
      }

      const latLngs = coordinates
        .map((coord, coordIndex) => {
          if (!Array.isArray(coord) || coord.length < 2) {
            console.warn(
              `Coordenada inválida en el índice ${coordIndex} de la ruta "${route.nombre}":`,
              coord
            );
            return null;
          }

          const lng = coord[0];
          const lat = coord[1];

          if (typeof lat !== "number" || typeof lng !== "number") {
            console.warn(
              `Coordenadas inválidas en el índice ${coordIndex} de la ruta "${route.nombre}":`,
              { lat, lng }
            );
            return null;
          }

          return [lat, lng];
        })
        .filter((coord) => coord !== null);

      if (latLngs.length < 2) {
        console.warn(
          `Ruta "${route.nombre}" sin coordenadas válidas después de filtrar`
        );
        invalidCount++;
        return;
      }

      if (route.es_ruta_completa) completeCount++;
      else if (route.es_combinada) combinedCount++;
      else if (route.es_segmento) segmentCount++;
      else normalCount++;

      const routeType = route.tipo || "unknown";
      byTypeCount[routeType] = (byTypeCount[routeType] || 0) + 1;

      console.log(
        `Procesando ruta "${route.nombre}" con ${latLngs.length} puntos válidos`
      );

      const polylineOptions = getRouteStyle(route);
      const polyline = L.polyline(latLngs, polylineOptions);

      applyCustomStyles(polyline, route);

      const tooltipContent = getTooltipContent(route);
      polyline.bindTooltip(tooltipContent, {
        permanent: false,
        direction: "top",
        className: "custom-tooltip",
      });

      polyline.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        console.log("Route clicked:", {
          name: route.nombre,
          type: route.tipo,
          isComplete: route.es_ruta_completa,
          isSegment: route.es_segmento,
          isCombined: route.es_combinada,
          priority: route.prioridad,
        });
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

      if (route.es_ruta_completa && hasFilters) {
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

        const routeInfo = `
          <div class="route-summary">
            <h3>${
              route.tipo
                ? `Ruta ${
                    route.tipo.charAt(0).toUpperCase() + route.tipo.slice(1)
                  }`
                : "Ruta"
            }</h3>
            <p><strong>${route.origen || "Origen"}</strong> → <strong>${
          route.destino || "Destino"
        }</strong></p>
            <hr>
            <p>Distancia total: <strong>${route.distancia || 0}m</strong></p>
            <p>Tiempo estimado: <strong>${
              route.tiempo_estimado || 0
            } min</strong></p>
            <p>Segmentos: <strong>${
              route.segmentos_originales || 1
            }</strong></p>
            <p>Tipo: <strong>${route.tipo || "Completa"}</strong></p>
            <p>Prioridad: <strong>${route.prioridad || "alta"}</strong></p>
          </div>
        `;

        startMarker.bindPopup(routeInfo);
        markersLayerRef.current.addLayer(startMarker);
        markersLayerRef.current.addLayer(endMarker);
      }
    });

    console.log("Resumen de RouteLayer - TODAS LAS RUTAS POSIBLES:", {
      total: routes.length,
      valid: routes.length - invalidCount,
      invalid: invalidCount,
      byCategory: {
        complete: completeCount,
        combined: combinedCount,
        segments: segmentCount,
        normal: normalCount,
      },
      byType: byTypeCount,
      mode: hasFilters
        ? "FILTRADO - MOSTRANDO TODAS LAS OPCIONES"
        : "TODAS LAS RUTAS",
    });
  }, [
    mapInstance,
    routes,
    onRouteClick,
    selectedRoute,
    originFilter,
    destinationFilter,
  ]);

  useEffect(() => {
    return () => {
      console.log("RouteLayer: Limpiando capas");
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
