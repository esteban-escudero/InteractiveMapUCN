// components/routes/RouteForm/hooks/usePolylineRoute.js
import { useState, useEffect, useCallback, useRef } from "react";
import { SpatialUtils } from "utils/spatialUtils";
import L from "leaflet";

export const usePolylineRoute = ({
  mapInstance,
  onSave,
  onCancel,
  isVisible,
  route,
  isEditing,
  showUINotification,
}) => {
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "peatonal",
    distancia: 0,
    tiempo_estimado: 0,
    geometria: null,
    descripcion: "",
    prioridad: "media",
    activo: true,
  });

  const [drawingMode, setDrawingMode] = useState(false);
  const [editingMode, setEditingMode] = useState(false);
  const polylineRef = useRef(null);
  const markersRef = useRef([]);
  const mapClickHandlerRef = useRef(null);
  const escHandlerRef = useRef(null);
  const currentPointsRef = useRef([]);
  const ghostMarkerRef = useRef(null);
  // ESTADOS PARA SNAPPING
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [snapThreshold, setSnapThreshold] = useState(15); // metros
  const [minPointDistance, setMinPointDistance] = useState(5); // metros mínimos entre puntos
  const [snappedPreview, setSnappedPreview] = useState(null);
  const [showSnapIndicators, setShowSnapIndicators] = useState(true);
  const snappedMarkerRef = useRef(null);

  const getRouteColor = (tipo) => {
    const colors = {
      peatonal: "#27ae60",
      accesible: "#3498db",
    };
    return colors[tipo] || "#95a5a6";
  };

  const generateDefaultName = () => {
    const now = new Date();
    return `Ruta ${formData.tipo} ${now.toLocaleDateString("es-ES")}`;
  };

  // 🆕 ====== FUNCIONES DE SNAPPING ======

  // Crear icono de preview de snap
  const createSnapPreviewIcon = (snapType) => {
    const color = snapType === "node" ? "#27ae60" : "#3498db";
    const icon = snapType === "node" ? "" : "";

    return L.divIcon({
      html: `
      <div style="
        background: ${color};
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: 4px solid white;
        box-shadow: 0 0 20px ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        animation: pulse-snap 1s infinite;
      ">${icon}</div>
      <style>
        @keyframes pulse-snap {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 0 20px ${color};
          }
          50% { 
            transform: scale(1.15);
            box-shadow: 0 0 30px ${color};
          }
        }
      </style>
    `,
      iconSize: [26, 26],
      className: "snap-preview-marker",
    });
  };

  // Buscar punto de snap (nodos + segmentos)
  const findSnapPoint = useCallback(
    (clickPoint, existingPoints) => {
      if (!snapEnabled || !existingPoints || existingPoints.length === 0) {
        return null;
      }

      // 1. Intentar snap a nodos existentes (prioridad)
      const nodeSnap = SpatialUtils.snapToNearestNode(
        clickPoint,
        existingPoints,
        snapThreshold
      );

      if (nodeSnap) {
        console.log(`Snap a nodo: ${Math.round(nodeSnap.snapDistance)}m`);
        return nodeSnap;
      }

      // 2. Si no hay nodo cercano, intentar snap a segmento
      const segmentSnap = SpatialUtils.snapToNearestSegment(
        clickPoint,
        existingPoints,
        snapThreshold
      );

      if (segmentSnap) {
        console.log(
          `Snap a segmento: ${Math.round(segmentSnap.snapDistance)}m`
        );
        return segmentSnap;
      }

      return null;
    },
    [snapEnabled, snapThreshold]
  );

  // Actualizar preview visual de snap
  const updateSnapPreview = useCallback(
    (snapPoint) => {
      if (!mapInstance) return;

      // Limpiar preview anterior
      if (snappedMarkerRef.current) {
        mapInstance.removeLayer(snappedMarkerRef.current);
        snappedMarkerRef.current = null;
      }

      // Crear nuevo preview si hay snap
      if (snapPoint && showSnapIndicators) {
        const marker = L.marker([snapPoint.lat, snapPoint.lng], {
          icon: createSnapPreviewIcon(snapPoint.snapType),
          interactive: false,
          zIndexOffset: 2000,
        }).addTo(mapInstance);

        const snapTypeText =
          snapPoint.snapType === "node" ? "Nodo existente" : "Punto en línea";

        marker.bindTooltip(
          `<div style="text-align: center; padding: 5px;">
        <strong>🧲 ${snapTypeText}</strong><br/>
        <small>Distancia: ${Math.round(snapPoint.snapDistance)}m</small><br/>
        <small style="color: #27ae60;">Click para conectar</small>
      </div>`,
          {
            permanent: false,
            direction: "top",
            className: "snap-tooltip",
          }
        );

        snappedMarkerRef.current = marker;
        setSnappedPreview(snapPoint);

        // Cambiar cursor
        mapInstance.getContainer().style.cursor = "copy";
      } else {
        setSnappedPreview(null);
        if (drawingMode) {
          mapInstance.getContainer().style.cursor = "crosshair";
        }
      }
    },
    [mapInstance, showSnapIndicators, drawingMode]
  );

  // Validar distancia mínima
  const validateMinimumDistance = useCallback(
    (newPoint, existingPoints) => {
      if (!minPointDistance || minPointDistance <= 0) return true;

      return SpatialUtils.isMinimumDistanceValid(
        newPoint,
        existingPoints,
        minPointDistance
      );
    },
    [minPointDistance]
  );

  // 🆕 Handler de movimiento del mouse para preview
  const handleMouseMove = useCallback(
    (e) => {
      if (!drawingMode || !snapEnabled || !showSnapIndicators) return;

      const clickPoint = { lat: e.latlng.lat, lng: e.latlng.lng };
      const existingLatLngs = polylineRef.current
        ? polylineRef.current.getLatLngs()
        : [];
      const existingPoints = existingLatLngs.map((ll) => ({
        lat: ll.lat,
        lng: ll.lng,
      }));

      const snapPoint = findSnapPoint(clickPoint, existingPoints);
      updateSnapPreview(snapPoint);
    },
    [
      drawingMode,
      snapEnabled,
      showSnapIndicators,
      findSnapPoint,
      updateSnapPreview,
    ]
  );

  const calculateRouteLength = (latLngs) => {
    if (latLngs.length < 2) return 0;

    let totalDistance = 0;

    for (let i = 1; i < latLngs.length; i++) {
      const prev = latLngs[i - 1];
      const curr = latLngs[i];

      const prevLat = Array.isArray(prev) ? prev[0] : prev.lat;
      const prevLng = Array.isArray(prev) ? prev[1] : prev.lng;
      const currLat = Array.isArray(curr) ? curr[0] : curr.lat;
      const currLng = Array.isArray(curr) ? curr[1] : curr.lng;

      const R = 6371000;
      const dLat = ((currLat - prevLat) * Math.PI) / 180;
      const dLng = ((currLng - prevLng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((prevLat * Math.PI) / 180) *
        Math.cos((currLat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      totalDistance += distance;
    }

    return Math.round(totalDistance);
  };

  const createGhostMarkerIcon = () => {
    return L.divIcon({
      html: `
        <div style="
          background: rgba(52, 152, 219, 0.4);
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 2px dashed #3498db;
          box-shadow: 0 0 10px rgba(52, 152, 219, 0.6);
          animation: pulse-ghost 1.5s infinite;
        "></div>
        <style>
          @keyframes pulse-ghost {
            0%, 100% { 
              transform: scale(1);
              opacity: 0.6;
            }
            50% { 
              transform: scale(1.2);
              opacity: 0.8;
            }
          }
        </style>
      `,
      iconSize: [18, 18],
      className: "ghost-marker",
    });
  };

  const removeGhostMarker = useCallback(() => {
    if (ghostMarkerRef.current && mapInstance) {
      mapInstance.removeLayer(ghostMarkerRef.current);
      ghostMarkerRef.current = null;
    }
  }, [mapInstance]);

  const clearMap = useCallback(() => {
    console.log("LIMPIANDO MAPA");

    if (!mapInstance) return;

    if (polylineRef.current) {
      polylineRef.current.off("click");
      polylineRef.current.off("mousemove");
      mapInstance.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    markersRef.current.forEach((marker) => {
      if (mapInstance.hasLayer(marker)) {
        mapInstance.removeLayer(marker);
      }
    });
    markersRef.current = [];

    removeGhostMarker();

    // 🆕 Limpiar preview de snap
    updateSnapPreview(null);
    if (mapInstance) {
      mapInstance.off("mousemove", handleMouseMove);
    }

    if (mapClickHandlerRef.current) {
      mapInstance.off("click", mapClickHandlerRef.current);
      mapClickHandlerRef.current = null;
    }

    if (escHandlerRef.current) {
      document.removeEventListener("keydown", escHandlerRef.current);
      escHandlerRef.current = null;
    }

    setDrawingMode(false);
    setEditingMode(false);
    currentPointsRef.current = [];

    if (mapInstance?.getContainer()) {
      mapInstance.getContainer().style.cursor = "";
      mapInstance.getContainer().classList.remove("route-drawing-mode");
    }

    console.log("Mapa limpiado");
  }, [mapInstance, removeGhostMarker]);

  const updateRouteData = useCallback((latLngs) => {
    console.log("Actualizando datos con", latLngs.length, "puntos");

    currentPointsRef.current = latLngs;

    if (latLngs.length < 2) {
      setFormData((prev) => ({
        ...prev,
        distancia: 0,
        tiempo_estimado: 0,
        geometria: null,
      }));
      return;
    }

    const coordinates = latLngs.map((latlng) => {
      if (Array.isArray(latlng)) {
        return [latlng[1], latlng[0]];
      } else {
        return [latlng.lng, latlng.lat];
      }
    });

    const distancia = calculateRouteLength(latLngs);
    const tiempo_estimado = Math.max(1, Math.round(distancia / 80));

    const geometria = {
      type: "LineString",
      coordinates: coordinates,
    };

    setFormData((prev) => ({
      ...prev,
      distancia,
      tiempo_estimado,
      geometria,
    }));
  }, []);

  const createMarkerIcon = (index, total) => {
    const isFirst = index === 0;
    const isLast = index === total - 1;
    const color = isFirst ? "#27ae60" : isLast ? "#e74c3c" : "#3498db";
    const label = isFirst ? "I" : isLast ? "F" : index + 1;

    return L.divIcon({
      html: `
        <div style="
          background: ${color};
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 10px;
          font-weight: bold;
          cursor: crosshair;
        ">${label}</div>
      `,
      iconSize: [28, 28],
      className: "route-point-marker",
    });
  };

  const createMarkers = useCallback(
    (latLngs) => {
      if (!mapInstance) return;

      markersRef.current.forEach((marker) => {
        if (mapInstance.hasLayer(marker)) {
          mapInstance.removeLayer(marker);
        }
      });
      markersRef.current = [];

      latLngs.forEach((latLng, index) => {
        const marker = L.marker(latLng, {
          icon: createMarkerIcon(index, latLngs.length),
          draggable: true,
        }).addTo(mapInstance);

        marker.on("drag", (e) => {
          const newLatLng = e.target.getLatLng();
          const currentLatLngs = polylineRef.current.getLatLngs();
          const newLatLngs = [...currentLatLngs];
          newLatLngs[index] = newLatLng;

          if (polylineRef.current) {
            polylineRef.current.setLatLngs(newLatLngs);
          }
        });

        marker.on("dragend", (e) => {
          const newLatLng = e.target.getLatLng();
          const currentLatLngs = polylineRef.current.getLatLngs();
          const newLatLngs = [...currentLatLngs];
          newLatLngs[index] = newLatLng;

          updateRouteData(newLatLngs);
          createMarkers(newLatLngs);
        });

        marker.on("dblclick", (e) => {
          L.DomEvent.stopPropagation(e);

          console.log(`Doble click en punto ${index + 1}`);

          const currentLatLngs = polylineRef.current.getLatLngs();

          if (currentLatLngs.length <= 2) {
            if (showUINotification) {
              showUINotification(
                "La ruta debe tener al menos 2 puntos. No puedes eliminar más puntos.",
                "warning"
              );
            }
            return;
          }

          if (index === 0) {
            if (showUINotification) {
              showUINotification(
                "No puedes eliminar el punto inicial. Arrástalo para cambiar su posición.",
                "warning"
              );
            }
            return;
          }

          if (index === currentLatLngs.length - 1) {
            if (showUINotification) {
              showUINotification(
                "No puedes eliminar el punto final. Arrástalo para cambiar su posición.",
                "warning"
              );
            }
            return;
          }

          const newLatLngs = currentLatLngs.filter((_, i) => i !== index);

          polylineRef.current.setLatLngs(newLatLngs);
          updateRouteData(newLatLngs);
          createMarkers(newLatLngs);

          if (showUINotification) {
            showUINotification(
              `Punto eliminado correctamente. Quedan ${newLatLngs.length} puntos`,
              "success"
            );
          }

          console.log(`Punto eliminado. Quedan ${newLatLngs.length} puntos`);
        });

        marker.bindTooltip(
          `<div style="text-align: center;">
            <strong>${index === 0
            ? "Punto Inicial"
            : index === latLngs.length - 1
              ? "Punto Final"
              : `Punto ${index + 1}`
          }</strong><br/>
            <small>Arrastra para mover</small><br/>
            <small>${index === 0
            ? '<span style="color: #e74c3c;">No se puede eliminar punto inicial</span>'
            : index === latLngs.length - 1
              ? '<span style="color: #e74c3c;">No se puede eliminar punto final</span>'
              : "Doble click para eliminar"
          }</small>
          </div>`,
          {
            permanent: false,
            direction: "top",
            className: "custom-tooltip",
            offset: [0, -15],
          }
        );

        markersRef.current.push(marker);
      });

      console.log(`${latLngs.length} marcadores creados`);
    },
    [mapInstance, updateRouteData, showUINotification]
  );

  const addVertexOnPolyline = useCallback(() => {
    if (!polylineRef.current || !mapInstance) return;

    console.log("Activando click en arista");

    polylineRef.current.off("click");
    polylineRef.current.off("mousemove");

    polylineRef.current.on("mousemove", (e) => {
      L.DomEvent.stopPropagation(e);

      const mouseLatLng = e.latlng;
      const currentLatLngs = polylineRef.current.getLatLngs();

      let minDistance = Infinity;
      let closestPoint = null;

      for (let i = 0; i < currentLatLngs.length - 1; i++) {
        const start = currentLatLngs[i];
        const end = currentLatLngs[i + 1];

        const distance = getDistanceToSegment(mouseLatLng, start, end);

        if (distance < minDistance) {
          minDistance = distance;
          closestPoint = getClosestPointOnSegment(mouseLatLng, start, end);
        }
      }

      if (closestPoint && minDistance < 0.0005) {
        removeGhostMarker();

        const ghostMarker = L.marker(closestPoint, {
          icon: createGhostMarkerIcon(),
          interactive: false,
          zIndexOffset: -1,
        }).addTo(mapInstance);

        ghostMarkerRef.current = ghostMarker;
        mapInstance.getContainer().style.cursor = "copy";
      } else {
        removeGhostMarker();
        mapInstance.getContainer().style.cursor = drawingMode
          ? "crosshair"
          : "";
      }
    });

    polylineRef.current.on("mouseout", () => {
      removeGhostMarker();
      mapInstance.getContainer().style.cursor = drawingMode ? "crosshair" : "";
    });

    polylineRef.current.on("click", (e) => {
      L.DomEvent.stopPropagation(e);

      const clickedLatLng = e.latlng;
      const currentLatLngs = polylineRef.current.getLatLngs();

      let minDistance = Infinity;
      let insertIndex = -1;

      for (let i = 0; i < currentLatLngs.length - 1; i++) {
        const start = currentLatLngs[i];
        const end = currentLatLngs[i + 1];

        const distance = getDistanceToSegment(clickedLatLng, start, end);

        if (distance < minDistance) {
          minDistance = distance;
          insertIndex = i + 1;
        }
      }

      if (insertIndex !== -1) {
        console.log(`Insertando vértice en posición ${insertIndex}`);

        removeGhostMarker();

        const newLatLngs = [
          ...currentLatLngs.slice(0, insertIndex),
          clickedLatLng,
          ...currentLatLngs.slice(insertIndex),
        ];

        polylineRef.current.setLatLngs(newLatLngs);
        createMarkers(newLatLngs);
        updateRouteData(newLatLngs);
        addVertexOnPolyline();
      }
    });
  }, [
    mapInstance,
    createMarkers,
    updateRouteData,
    drawingMode,
    removeGhostMarker,
  ]);

  const getClosestPointOnSegment = (point, lineStart, lineEnd) => {
    const x = point.lat;
    const y = point.lng;
    const x1 = lineStart.lat;
    const y1 = lineStart.lng;
    const x2 = lineEnd.lat;
    const y2 = lineEnd.lng;

    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) param = dot / lenSq;

    let lat, lng;

    if (param < 0) {
      lat = x1;
      lng = y1;
    } else if (param > 1) {
      lat = x2;
      lng = y2;
    } else {
      lat = x1 + param * C;
      lng = y1 + param * D;
    }

    return L.latLng(lat, lng);
  };

  const getDistanceToSegment = (point, lineStart, lineEnd) => {
    const x = point.lat;
    const y = point.lng;
    const x1 = lineStart.lat;
    const y1 = lineStart.lng;
    const x2 = lineEnd.lat;
    const y2 = lineEnd.lng;

    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;

    return Math.sqrt(dx * dx + dy * dy);
  };

  const finishDrawing = useCallback(() => {
    console.log("FINALIZANDO DIBUJO");

    if (!mapInstance) {
      setDrawingMode(false);
      return;
    }

    const latLngs = polylineRef.current ? polylineRef.current.getLatLngs() : [];

    if (latLngs.length < 2) {
      if (showUINotification) {
        showUINotification(
          "Necesitas al menos 2 puntos para crear una ruta",
          "warning"
        );
      }
      return;
    }

    updateRouteData(latLngs);
    removeGhostMarker();

    if (polylineRef.current) {
      polylineRef.current.setStyle({
        color: getRouteColor(formData.tipo),
        weight: 8,
        opacity: 0.8,
        dashArray: null,
      });

      addVertexOnPolyline();
    }

    if (mapClickHandlerRef.current) {
      mapInstance.off("click", mapClickHandlerRef.current);
      mapClickHandlerRef.current = null;
    }

    if (escHandlerRef.current) {
      document.removeEventListener("keydown", escHandlerRef.current);
      escHandlerRef.current = null;
    }

    setDrawingMode(false);
    setEditingMode(true);
    mapInstance.getContainer().style.cursor = "";
    mapInstance.getContainer().classList.remove("route-drawing-mode");

    console.log("Modo dibujo finalizado");
  }, [
    mapInstance,
    formData.tipo,
    updateRouteData,
    addVertexOnPolyline,
    removeGhostMarker,
    showUINotification,
  ]);

  const activateDrawing = useCallback(() => {
    console.log("🔥 ACTIVANDO MODO DIBUJO");

    if (!mapInstance) return;

    const existingLatLngs = polylineRef.current
      ? polylineRef.current.getLatLngs()
      : [];
    const hasExistingPoints = existingLatLngs.length > 0;

    if (hasExistingPoints) {
      console.log(
        "Modo edición: Conservando",
        existingLatLngs.length,
        "puntos existentes"
      );

      if (polylineRef.current) {
        polylineRef.current.setStyle({
          color: "#3388ff",
          weight: 6,
          opacity: 0.7,
          dashArray: "10, 10",
        });
      }
    } else {
      console.log("🆕 Modo creación: Iniciando desde cero");
      clearMap();

      const polyline = L.polyline([], {
        color: "#3388ff",
        weight: 6,
        opacity: 0.7,
        dashArray: "10, 10",
        className: "drawing-route",
      }).addTo(mapInstance);

      polylineRef.current = polyline;
      currentPointsRef.current = [];
    }

    setDrawingMode(true);
    // 🆕 Limpiar preview al finalizar
    updateSnapPreview(null);
    if (mapInstance) {
      mapInstance.off("mousemove", handleMouseMove);
    }
    setEditingMode(false);

    mapInstance.getContainer().style.cursor = "crosshair";
    mapInstance.getContainer().classList.add("route-drawing-mode"); // ⭐ AGREGADO

    addVertexOnPolyline();

    const clickHandler = (e) => {
      const { lat, lng } = e.latlng;
      const clickPoint = { lat, lng };

      // 🆕 OBTENER PUNTOS EXISTENTES
      const existingLatLngs = polylineRef.current
        ? polylineRef.current.getLatLngs()
        : [];
      const existingPoints = existingLatLngs.map((ll) => ({
        lat: ll.lat,
        lng: ll.lng,
      }));

      // 🆕 BUSCAR PUNTO DE SNAP
      const snapPoint = findSnapPoint(clickPoint, existingPoints);
      const candidatePoint = snapPoint || clickPoint;

      // 🆕 VALIDAR DISTANCIA MÍNIMA (solo si no es snap a nodo existente)
      if (snapPoint?.snapType !== "node") {
        const isValidDistance = validateMinimumDistance(
          candidatePoint,
          existingPoints
        );

        if (!isValidDistance) {
          if (showUINotification) {
            showUINotification(
              `Punto demasiado cercano. Mínimo: ${minPointDistance}m`,
              "warning"
            );
          }
          console.warn(`Punto rechazado: distancia mínima no cumplida`);
          return;
        }
      }

      // 🆕 USAR COORDENADAS FINALES
      const finalPoint = [candidatePoint.lat, candidatePoint.lng];

      // Log informativo
      if (snapPoint) {
        const snapIcon = snapPoint.snapType === "node" ? "" : "";
        console.log(
          `${snapIcon} SNAP ${snapPoint.snapType}: ${Math.round(
            snapPoint.snapDistance
          )}m`
        );

        if (showUINotification) {
          showUINotification(
            `Snap aplicado: ${Math.round(snapPoint.snapDistance)}m`,
            "info"
          );
        }
      } else {
        console.log("Click sin snap");
      }

      if (polylineRef.current) {
        const currentLatLngs = polylineRef.current.getLatLngs();
        const newLatLngs = [...currentLatLngs, finalPoint];

        polylineRef.current.setLatLngs(newLatLngs);
        createMarkers(newLatLngs);
        updateRouteData(newLatLngs);

        // Limpiar preview después de agregar punto
        updateSnapPreview(null);

        addVertexOnPolyline();
      }
    };

    mapInstance.on("click", clickHandler);
    mapInstance.on("mousemove", handleMouseMove);
    mapClickHandlerRef.current = clickHandler;

    const escHandler = (e) => {
      if (e.key === "Escape") {
        finishDrawing();
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener("keydown", escHandler);
    escHandlerRef.current = escHandler;

    console.log("Modo dibujo activado");
  }, [
    mapInstance,
    createMarkers,
    updateRouteData,
    clearMap,
    finishDrawing,
    addVertexOnPolyline,
  ]);

  const loadExistingRoute = useCallback(
    (coordinates) => {
      console.log("Cargando ruta existente:", coordinates.length, "puntos");

      if (!mapInstance || coordinates.length < 2) return;

      if (polylineRef.current) {
        mapInstance.removeLayer(polylineRef.current);
      }

      const latLngs = coordinates.map((coord) => [coord[1], coord[0]]);

      const polyline = L.polyline(latLngs, {
        color: getRouteColor(formData.tipo),
        weight: 8,
        opacity: 0.8,
        className: "editable-route",
      }).addTo(mapInstance);

      polylineRef.current = polyline;
      currentPointsRef.current = latLngs;

      createMarkers(latLngs);
      addVertexOnPolyline();

      setEditingMode(true);
      updateRouteData(latLngs);

      // ⭐ AGREGADO - Mantener cursor cruz en edición
      if (mapInstance?.getContainer()) {
        mapInstance.getContainer().classList.add("route-drawing-mode");
      }

      console.log("Ruta cargada exitosamente");
    },
    [
      mapInstance,
      formData.tipo,
      createMarkers,
      updateRouteData,
      addVertexOnPolyline,
    ]
  );

  const removeLastPoint = useCallback(() => {
    if (!polylineRef.current) return;

    const currentLatLngs = polylineRef.current.getLatLngs();

    if (currentLatLngs.length <= 2) {
      if (showUINotification) {
        showUINotification("La ruta debe tener al menos 2 puntos", "warning");
      }
      return;
    }

    const newLatLngs = currentLatLngs.slice(0, -1);
    polylineRef.current.setLatLngs(newLatLngs);

    createMarkers(newLatLngs);
    updateRouteData(newLatLngs);
    addVertexOnPolyline();

    if (showUINotification) {
      showUINotification(
        `Último punto eliminado. Quedan ${newLatLngs.length} puntos`,
        "success"
      );
    }
  }, [createMarkers, updateRouteData, addVertexOnPolyline, showUINotification]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "tipo" && polylineRef.current) {
      polylineRef.current.setStyle({
        color: getRouteColor(value),
      });
    }
  };

  const resetForm = useCallback(() => {
    setFormData({
      nombre: "",
      tipo: "peatonal",
      distancia: 0,
      tiempo_estimado: 0,
      geometria: null,
      descripcion: "",
      prioridad: "media",
      activo: true,
    });

    setDrawingMode(false);
    setEditingMode(false);
    currentPointsRef.current = [];
  }, []);

  const validateRouteData = () => {
    if (!formData.geometria) {
      if (showUINotification) {
        showUINotification(
          "Debes dibujar una ruta en el mapa primero",
          "warning"
        );
      }
      return false;
    }

    if (formData.geometria.coordinates.length < 2) {
      if (showUINotification) {
        showUINotification("La ruta debe tener al menos 2 puntos", "warning");
      }
      return false;
    }

    if (formData.distancia === 0) {
      if (showUINotification) {
        showUINotification(
          "La distancia de la ruta no puede ser cero",
          "warning"
        );
      }
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateRouteData()) return;

    const routeData = {
      ...formData,
      nombre: formData.nombre.trim() || generateDefaultName(),
      geometria: {
        type: "LineString",
        coordinates: formData.geometria.coordinates,
      },
      distancia: Math.max(1, formData.distancia),
      tiempo_estimado: Math.max(1, formData.tiempo_estimado),
      creado: isEditing && route ? route.creado : new Date().toISOString(),
      actualizado: new Date().toISOString(),
    };

    onSave(routeData);
    clearMap();
    resetForm();
  };

  const handleCancel = () => {
    clearMap();
    resetForm();
    onCancel();
  };

  useEffect(() => {
    if (isVisible && route && isEditing) {
      console.log("MODO EDICIÓN:", route.nombre);

      setFormData({
        nombre: route.nombre || "",
        tipo: route.tipo || "peatonal",
        distancia: route.distancia || 0,
        tiempo_estimado: route.tiempo_estimado || 0,
        geometria: route.geometria || null,
        descripcion: route.descripcion || "",
        prioridad: route.prioridad || "media",
        activo: route.activo !== undefined ? route.activo : true,
      });

      if (route.geometria?.coordinates?.length >= 2) {
        console.log(
          "Cargando geometría:",
          route.geometria.coordinates.length,
          "puntos"
        );
        setTimeout(() => {
          loadExistingRoute(route.geometria.coordinates);
        }, 100);
      }
    } else if (isVisible && !route) {
      console.log("🆕 MODO CREACIÓN");
      resetForm();
    }
  }, [isVisible, route, isEditing]);

  useEffect(() => {
    return () => {
      clearMap();
    };
  }, []);

  useEffect(() => {
    if (!isVisible) {
      clearMap();
    }
  }, [isVisible]);

  return {
    formData,
    drawingMode,
    editingMode,
    activateDrawing,
    finishDrawing,
    clearMap,
    removeLastPoint,
    handleInputChange,
    handleSubmit,
    handleCancel,
    polylineRef,
    snapEnabled,
    setSnapEnabled,
    snapThreshold,
    setSnapThreshold,
    minPointDistance,
    setMinPointDistance,
    showSnapIndicators,
    setShowSnapIndicators,
    snappedPreview,
  };
};
