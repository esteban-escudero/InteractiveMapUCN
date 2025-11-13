// components/routes/RouteForm/hooks/usePolylineRoute.js
import { useState, useEffect, useCallback, useRef } from "react";
import L from "leaflet";
import { SpatialUtils } from "../../../../utils/spatialUtils";

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

  // ========== FUNCIONES DE MARKERS ==========

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

      // Limpiar marcadores anteriores
      markersRef.current.forEach((marker) => {
        if (mapInstance.hasLayer(marker)) {
          mapInstance.removeLayer(marker);
        }
      });
      markersRef.current = [];

      // Crear marcadores para cada punto
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

        // Eliminar punto al hacer doble clic (excepto primero y último)
        marker.on("dblclick", (e) => {
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
    [mapInstance]
  );

  // ========== FUNCIONES DE ACTUALIZACIÓN ==========

  const updateRouteData = useCallback((latLngs) => {
    const coordinates = latLngs.map((latlng) => {
      if (Array.isArray(latlng)) {
        return [latlng[1], latlng[0]]; // [lng, lat]
      } else {
        return [latlng.lng, latlng.lat]; // [lng, lat]
      }
    });

    const distancia = Math.round(
      SpatialUtils.calculateRouteLength(coordinates)
    );
    const tiempo_estimado = Math.round(distancia / 80);

    setFormData((prev) => ({
      ...prev,
      distancia,
      tiempo_estimado,
      geometria: {
        type: "LineString",
        coordinates: coordinates,
      },
    }));
  }, []);

  // ========== FUNCIONES DE EDICIÓN ==========

  const makePolylineEditable = useCallback(
    (polyline) => {
      if (!polyline || !mapInstance) return;

      polyline.on("click", (e) => {
        if (drawingMode) return;

        const clickLatLng = e.latlng;
        const currentLatLngs = polyline.getLatLngs();

        // Encontrar segmento más cercano
        let closestSegmentIndex = -1;
        let minDistance = Infinity;

        for (let i = 0; i < currentLatLngs.length - 1; i++) {
          const segmentStart = currentLatLngs[i];
          const segmentEnd = currentLatLngs[i + 1];

          const distance = SpatialUtils.calculateDistanceToLine(
            { lat: clickLatLng.lat, lng: clickLatLng.lng },
            { lat: segmentStart.lat, lng: segmentStart.lng },
            { lat: segmentEnd.lat, lng: segmentEnd.lng }
          );

          if (distance < minDistance) {
            minDistance = distance;
            closestSegmentIndex = i;
          }
        }

        // Insertar punto si está cerca de un segmento
        if (minDistance < 20) {
          const newLatLngs = [...currentLatLngs];
          newLatLngs.splice(closestSegmentIndex + 1, 0, clickLatLng);
          polyline.setLatLngs(newLatLngs);

          createMarkers(newLatLngs);
          updateRouteData(newLatLngs);
        }
      });
    },
    [mapInstance, drawingMode, createMarkers, updateRouteData]
  );

  // ========== FUNCIONES PRINCIPALES ==========

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
      makePolylineEditable(polyline);
      createMarkers(latLngs);
      setEditingMode(true);
      updateRouteData(latLngs);
    },
    [
      mapInstance,
      formData.tipo,
      makePolylineEditable,
      createMarkers,
      updateRouteData,
    ]
  );

  const activateDrawing = useCallback(() => {
    if (!mapInstance) return;

    clearMap();
    setDrawingMode(true);
    mapInstance.getContainer().style.cursor = "crosshair";

    const polyline = L.polyline([], {
      color: "#3388ff",
      weight: 6,
      opacity: 0.7,
      dashArray: "10, 10",
      className: "drawing-route",
    }).addTo(mapInstance);

    polylineRef.current = polyline;

    const clickHandler = (e) => {
      const { lat, lng } = e.latlng;

      if (polylineRef.current) {
        const currentLatLngs = polylineRef.current.getLatLngs();
        const newLatLngs = [...currentLatLngs, [lat, lng]];
        polylineRef.current.setLatLngs(newLatLngs);
        createMarkers(newLatLngs);
        updateRouteData(newLatLngs);
      }
    };

    mapInstance.on("click", clickHandler);
    mapClickHandlerRef.current = clickHandler;

    const escHandler = (e) => {
      if (e.key === "Escape") {
        finishDrawing();
      }
    };

    document.addEventListener("keydown", escHandler);
    escHandlerRef.current = escHandler;
  }, [mapInstance, createMarkers, updateRouteData]);

  const finishDrawing = useCallback(() => {
    if (!mapInstance || !polylineRef.current) {
      setDrawingMode(false);
      return;
    }

    const latLngs = polylineRef.current.getLatLngs();

    if (latLngs.length < 2) {
      alert("Necesitas al menos 2 puntos para crear una ruta");
      return;
    }

    polylineRef.current.setStyle({
      color: getRouteColor(formData.tipo),
      weight: 8,
      opacity: 0.8,
      dashArray: null,
    });

    makePolylineEditable(polylineRef.current);
    setDrawingMode(false);
    setEditingMode(true);
    mapInstance.getContainer().style.cursor = "";

    if (mapClickHandlerRef.current) {
      mapInstance.off("click", mapClickHandlerRef.current);
      mapClickHandlerRef.current = null;
    }

    if (escHandlerRef.current) {
      document.removeEventListener("keydown", escHandlerRef.current);
      escHandlerRef.current = null;
    }
  }, [mapInstance, formData.tipo, makePolylineEditable]);

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
  }, [createMarkers, updateRouteData]);

  const clearMap = useCallback(() => {
    if (!mapInstance) return;

    if (polylineRef.current) {
      mapInstance.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    markersRef.current.forEach((marker) => {
      if (mapInstance.hasLayer(marker)) {
        mapInstance.removeLayer(marker);
      }
    });
    markersRef.current = [];

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

    if (mapInstance?.getContainer()) {
      mapInstance.getContainer().style.cursor = "";
    }
  }, [mapInstance]);

  // ========== MANEJO DEL FORMULARIO ==========

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "tipo" && polylineRef.current) {
      polylineRef.current.setStyle({
        color: getRouteColor(value),
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.geometria) {
      alert("Debes dibujar una ruta en el mapa primero");
      return;
    }

    const routeData = {
      ...formData,
      nombre: formData.nombre.trim() || generateDefaultName(),
    };

    onSave(routeData);
    resetForm();
  };

  const handleCancel = () => {
    clearMap();
    resetForm();
    onCancel();
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      tipo: "peatonal",
      distancia: 0,
      tiempo_estimado: 0,
      geometria: null,
      descripcion: "",
      prioridad: "media",
    });
    setDrawingMode(false);
    setEditingMode(false);
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
    } else if (isVisible) {
      resetForm();
    }
  }, [isVisible, route, isEditing, loadExistingRoute]);

  useEffect(() => {
    return () => {
      clearMap();
    };
  }, [clearMap]);

  return {
    formData,
    setFormData,
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
