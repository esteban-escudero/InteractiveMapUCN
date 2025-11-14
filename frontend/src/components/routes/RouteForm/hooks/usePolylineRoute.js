// components/routes/RouteForm/hooks/usePolylineRoute.js
import { useState, useEffect, useCallback, useRef } from "react";
import L from "leaflet";

export const usePolylineRoute = ({
  mapInstance,
  onSave,
  onCancel,
  isVisible,
  route,
  isEditing,
}) => {
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "peatonal",
    distancia: 0,
    tiempo_estimado: 0,
    geometria: null,
    descripcion: "",
    prioridad: "media",
  });

  const [drawingMode, setDrawingMode] = useState(false);
  const [editingMode, setEditingMode] = useState(false);
  const polylineRef = useRef(null);
  const markersRef = useRef([]);
  const mapClickHandlerRef = useRef(null);
  const escHandlerRef = useRef(null);
  const currentPointsRef = useRef([]);
  const ghostMarkerRef = useRef(null); // 🆕 Marcador fantasma

  // ========== FUNCIONES BÁSICAS ==========

  const getRouteColor = (tipo) => {
    const colors = {
      peatonal: "#27ae60",
      accesible: "#3498db",
      emergencia: "#e74c3c",
      rapida: "#f39c12",
      vehicular: "#9b59b6",
    };
    return colors[tipo] || "#95a5a6";
  };

  const generateDefaultName = () => {
    const now = new Date();
    return `Ruta ${formData.tipo} ${now.toLocaleDateString("es-ES")}`;
  };

  // CÁLCULO DE DISTANCIA
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

  // 🆕 CREAR ÍCONO DEL MARCADOR FANTASMA
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

  // 🆕 REMOVER MARCADOR FANTASMA
  const removeGhostMarker = useCallback(() => {
    if (ghostMarkerRef.current && mapInstance) {
      mapInstance.removeLayer(ghostMarkerRef.current);
      ghostMarkerRef.current = null;
    }
  }, [mapInstance]);

  // ========== LIMPIEZA ==========

  const clearMap = useCallback(() => {
    console.log("🗑️ LIMPIANDO TODOS LOS PUNTOS");

    if (!mapInstance) return;

    if (polylineRef.current) {
      polylineRef.current.off("click");
      polylineRef.current.off("mousemove"); // 🆕 Remover evento mousemove
      mapInstance.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    markersRef.current.forEach((marker) => {
      if (mapInstance.hasLayer(marker)) {
        mapInstance.removeLayer(marker);
      }
    });
    markersRef.current = [];

    // 🆕 Limpiar marcador fantasma
    removeGhostMarker();

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

    setFormData({
      nombre: "",
      tipo: "peatonal",
      distancia: 0,
      tiempo_estimado: 0,
      geometria: null,
      descripcion: "",
      prioridad: "media",
    });

    if (mapInstance?.getContainer()) {
      mapInstance.getContainer().style.cursor = "";
    }

    console.log("✅ Mapa limpiado completamente");
  }, [mapInstance, removeGhostMarker]);

  // ========== ACTUALIZACIÓN DE DATOS ==========

  const updateRouteData = useCallback((latLngs) => {
    console.log("📊 Actualizando datos de ruta con puntos:", latLngs.length);

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

  // ========== MARCADORES ==========

  const createMarkerIcon = (index, total) => {
    const isFirst = index === 0;
    const isLast = index === total - 1;
    const color = isFirst ? "#27ae60" : isLast ? "#e74c3c" : "#3498db";
    const label = isFirst ? "S" : isLast ? "E" : index + 1;

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
          cursor: move;
        ">${label}</div>
      `,
      iconSize: [28, 28],
      className: "route-point-marker",
    });
  };

  const createMarkers = useCallback(
    (latLngs) => {
      if (!mapInstance) return;

      // Limpiar markers existentes
      markersRef.current.forEach((marker) => {
        if (mapInstance.hasLayer(marker)) {
          mapInstance.removeLayer(marker);
        }
      });
      markersRef.current = [];

      // Crear nuevos markers
      latLngs.forEach((latLng, index) => {
        const marker = L.marker(latLng, {
          icon: createMarkerIcon(index, latLngs.length),
          draggable: true,
        }).addTo(mapInstance);

        // Evento drag
        marker.on("drag", (e) => {
          const newLatLng = e.target.getLatLng();
          const currentLatLngs = polylineRef.current.getLatLngs();
          const newLatLngs = [...currentLatLngs];
          newLatLngs[index] = newLatLng;

          if (polylineRef.current) {
            polylineRef.current.setLatLngs(newLatLngs);
          }
        });

        // Evento dragend
        marker.on("dragend", (e) => {
          const newLatLng = e.target.getLatLng();
          const currentLatLngs = polylineRef.current.getLatLngs();
          const newLatLngs = [...currentLatLngs];
          newLatLngs[index] = newLatLng;

          updateRouteData(newLatLngs);
          createMarkers(newLatLngs);
        });

        // Evento dblclick para eliminar
        marker.on("dblclick", (e) => {
          L.DomEvent.stopPropagation(e);

          if (latLngs.length <= 2) {
            alert("La ruta debe tener al menos 2 puntos");
            return;
          }

          if (index === 0 || index === latLngs.length - 1) {
            alert("No puedes eliminar el punto de inicio o fin");
            return;
          }

          const currentLatLngs = polylineRef.current.getLatLngs();
          const newLatLngs = currentLatLngs.filter((_, i) => i !== index);
          polylineRef.current.setLatLngs(newLatLngs);

          updateRouteData(newLatLngs);
          createMarkers(newLatLngs);
        });

        markersRef.current.push(marker);
      });
    },
    [mapInstance, updateRouteData]
  );

  // ========== 🆕 FUNCIÓN PARA AGREGAR VÉRTICE EN ARISTA ==========

  const addVertexOnPolyline = useCallback(() => {
    if (!polylineRef.current || !mapInstance) return;

    console.log("🎯 Activando modo: Click en arista para agregar vértice");

    // Remover listener previo si existe
    polylineRef.current.off("click");
    polylineRef.current.off("mousemove"); // 🆕

    // 🆕 EVENTO MOUSEMOVE - Mostrar marcador fantasma
    polylineRef.current.on("mousemove", (e) => {
      L.DomEvent.stopPropagation(e);

      const mouseLatLng = e.latlng;
      const currentLatLngs = polylineRef.current.getLatLngs();

      // Encontrar el segmento más cercano
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

      // Mostrar marcador fantasma en el punto más cercano
      if (closestPoint && minDistance < 0.0005) {
        // Umbral de proximidad
        // Remover marcador anterior
        removeGhostMarker();

        // Crear nuevo marcador fantasma
        const ghostMarker = L.marker(closestPoint, {
          icon: createGhostMarkerIcon(),
          interactive: false,
          zIndexOffset: -1,
        }).addTo(mapInstance);

        ghostMarkerRef.current = ghostMarker;

        // Cambiar cursor
        mapInstance.getContainer().style.cursor = "copy";
      } else {
        removeGhostMarker();
        mapInstance.getContainer().style.cursor = drawingMode
          ? "crosshair"
          : "";
      }
    });

    // 🆕 EVENTO MOUSEOUT - Remover marcador fantasma
    polylineRef.current.on("mouseout", () => {
      removeGhostMarker();
      mapInstance.getContainer().style.cursor = drawingMode ? "crosshair" : "";
    });

    // Hacer la polilínea clickeable
    polylineRef.current.on("click", (e) => {
      L.DomEvent.stopPropagation(e);

      const clickedLatLng = e.latlng;
      const currentLatLngs = polylineRef.current.getLatLngs();

      console.log("📍 Click en arista. Buscando segmento más cercano...");

      // Encontrar el segmento más cercano
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
        console.log(`✅ Insertando vértice en posición ${insertIndex}`);

        // Remover marcador fantasma
        removeGhostMarker();

        // Insertar el nuevo punto
        const newLatLngs = [
          ...currentLatLngs.slice(0, insertIndex),
          clickedLatLng,
          ...currentLatLngs.slice(insertIndex),
        ];

        // Actualizar polyline
        polylineRef.current.setLatLngs(newLatLngs);

        // Recrear markers
        createMarkers(newLatLngs);

        // Actualizar datos
        updateRouteData(newLatLngs);

        // RE-ACTIVAR el click en la polyline después de agregar el vértice
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

  // 🆕 Función auxiliar: obtener el punto más cercano en un segmento
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

  // Función auxiliar: calcular distancia de un punto a un segmento
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

  // ========== FINALIZAR DIBUJO ==========

  const finishDrawing = useCallback(() => {
    console.log("🎯 FINALIZANDO DIBUJO");

    if (!mapInstance) {
      setDrawingMode(false);
      return;
    }

    const latLngs = polylineRef.current ? polylineRef.current.getLatLngs() : [];

    if (latLngs.length < 2) {
      alert("Necesitas al menos 2 puntos para crear una ruta");
      return;
    }

    updateRouteData(latLngs);

    // 🆕 Remover marcador fantasma
    removeGhostMarker();

    if (polylineRef.current) {
      polylineRef.current.setStyle({
        color: getRouteColor(formData.tipo),
        weight: 8,
        opacity: 0.8,
        dashArray: null,
      });

      // ACTIVAR CLICK EN ARISTA
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

    console.log("✅ Modo dibujo finalizado. Click en arista ACTIVADO");
  }, [
    mapInstance,
    formData.tipo,
    updateRouteData,
    addVertexOnPolyline,
    removeGhostMarker,
  ]);

  // ========== ACTIVAR DIBUJO ==========

  const activateDrawing = useCallback(() => {
    console.log("🔥 ACTIVANDO MODO DIBUJO");

    if (!mapInstance) return;

    clearMap();

    setDrawingMode(true);
    setEditingMode(false);

    mapInstance.getContainer().style.cursor = "crosshair";

    const polyline = L.polyline([], {
      color: "#3388ff",
      weight: 6,
      opacity: 0.7,
      dashArray: "10, 10",
      className: "drawing-route",
    }).addTo(mapInstance);

    polylineRef.current = polyline;
    currentPointsRef.current = [];

    // ACTIVAR CLICK EN ARISTA DESDE EL INICIO
    addVertexOnPolyline();

    const clickHandler = (e) => {
      const { lat, lng } = e.latlng;

      if (polylineRef.current) {
        const currentLatLngs = polylineRef.current.getLatLngs();
        const newLatLngs = [...currentLatLngs, [lat, lng]];

        polylineRef.current.setLatLngs(newLatLngs);
        createMarkers(newLatLngs);
        updateRouteData(newLatLngs);

        // RE-ACTIVAR click en arista después de cada punto nuevo
        addVertexOnPolyline();
      }
    };

    mapInstance.on("click", clickHandler);
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

    console.log("✅ Modo dibujo activado - Click en arista HABILITADO");
  }, [
    mapInstance,
    createMarkers,
    updateRouteData,
    clearMap,
    finishDrawing,
    addVertexOnPolyline,
  ]);

  // ========== CARGAR RUTA EXISTENTE ==========

  const loadExistingRoute = useCallback(
    (coordinates) => {
      if (!mapInstance || coordinates.length < 2) return;

      clearMap();

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

      // ACTIVAR CLICK EN ARISTA
      addVertexOnPolyline();

      setEditingMode(true);
      updateRouteData(latLngs);
    },
    [
      mapInstance,
      formData.tipo,
      createMarkers,
      updateRouteData,
      clearMap,
      addVertexOnPolyline,
    ]
  );

  // ========== FUNCIONES AUXILIARES ==========

  const removeLastPoint = useCallback(() => {
    if (!polylineRef.current) return;

    const currentLatLngs = polylineRef.current.getLatLngs();

    if (currentLatLngs.length <= 2) {
      alert("La ruta debe tener al menos 2 puntos");
      return;
    }

    const newLatLngs = currentLatLngs.slice(0, -1);
    polylineRef.current.setLatLngs(newLatLngs);

    createMarkers(newLatLngs);
    updateRouteData(newLatLngs);

    // RE-ACTIVAR click en arista
    addVertexOnPolyline();
  }, [createMarkers, updateRouteData, addVertexOnPolyline]);

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
    const geometriaToKeep = formData.geometria;

    setFormData({
      nombre: "",
      tipo: "peatonal",
      distancia: geometriaToKeep ? formData.distancia : 0,
      tiempo_estimado: geometriaToKeep ? formData.tiempo_estimado : 0,
      geometria: geometriaToKeep,
      descripcion: "",
      prioridad: "media",
    });

    setDrawingMode(false);
    setEditingMode(!!geometriaToKeep);
    currentPointsRef.current = geometriaToKeep ? currentPointsRef.current : [];
  }, [formData.geometria, formData.distancia, formData.tiempo_estimado]);

  const validateRouteData = () => {
    if (!formData.geometria) {
      alert("Debes dibujar una ruta en el mapa primero");
      return false;
    }

    if (formData.geometria.coordinates.length < 2) {
      alert("La ruta debe tener al menos 2 puntos");
      return false;
    }

    if (formData.distancia === 0) {
      alert("La distancia de la ruta no puede ser cero");
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
    resetForm();
  };

  const handleCancel = () => {
    clearMap();
    resetForm();
    onCancel();
  };

  // ========== EFFECTS ==========

  useEffect(() => {
    if (isVisible && route && isEditing) {
      setFormData({
        nombre: route.nombre || "",
        tipo: route.tipo || "peatonal",
        distancia: route.distancia || 0,
        tiempo_estimado: route.tiempo_estimado || 0,
        geometria: route.geometria || null,
        descripcion: route.descripcion || "",
        prioridad: route.prioridad || "media",
      });

      if (route.geometria && route.geometria.coordinates) {
        loadExistingRoute(route.geometria.coordinates);
      }
    } else if (isVisible && !route && !formData.geometria) {
      resetForm();
    }
  }, [isVisible, route, isEditing]);

  useEffect(() => {
    return () => {
      clearMap();
    };
  }, [clearMap]);

  useEffect(() => {
    if (!isVisible) {
      clearMap();
    }
  }, [isVisible, clearMap]);

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
  };
};
