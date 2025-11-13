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

  // CÁLCULO DE DISTANCIA MEJORADO
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

  // ========== FUNCIONES DE LIMPIEZA ==========

  // EN usePolylineRoute.js - REEMPLAZA la función clearMap
  const clearMap = useCallback(() => {
    console.log("🗑️ LIMPIANDO TODOS LOS PUNTOS");

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
    currentPointsRef.current = [];

    // RESETEAR EL FORM DATA - ESTO ES LO QUE FALTABA
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

    console.log("✅ Todos los puntos eliminados y formulario reseteado");
  }, [mapInstance]);

  // ========== FUNCIONES DE ACTUALIZACIÓN ==========

  const updateRouteData = useCallback((latLngs) => {
    console.log("📍 Actualizando datos de ruta con puntos:", latLngs);

    // ACTUALIZAR LA REFERENCIA DE PUNTOS ACTUALES
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

    // Convertir a formato GeoJSON correcto [lng, lat]
    const coordinates = latLngs.map((latlng) => {
      if (Array.isArray(latlng)) {
        return [latlng[1], latlng[0]]; // [lng, lat]
      } else {
        return [latlng.lng, latlng.lat]; // [lng, lat]
      }
    });

    const distancia = calculateRouteLength(latLngs);
    const tiempo_estimado = Math.max(1, Math.round(distancia / 80));

    const geometria = {
      type: "LineString",
      coordinates: coordinates,
    };

    console.log("📐 Geometría generada:", geometria);
    console.log("📏 Distancia calculada:", distancia, "metros");
    console.log("🔢 Número de puntos guardados:", coordinates.length);

    setFormData((prev) => ({
      ...prev,
      distancia,
      tiempo_estimado,
      geometria,
    }));
  }, []);

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

      // Limpiar markers existentes
      markersRef.current.forEach((marker) => {
        if (mapInstance.hasLayer(marker)) {
          mapInstance.removeLayer(marker);
        }
      });
      markersRef.current = [];

      // Crear nuevos markers - SIEMPRE ARRASTRABLES
      latLngs.forEach((latLng, index) => {
        const marker = L.marker(latLng, {
          icon: createMarkerIcon(index, latLngs.length),
          draggable: true, // ← SIEMPRE ARRASTRABLE
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
          createMarkers(newLatLngs); // ← Recrear markers con nuevas posiciones
        });

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
    [mapInstance, updateRouteData]
  );

  // ========== FUNCIONES DE DIBUJO ==========

  const finishDrawing = useCallback(() => {
    console.log("🎯 FINALIZANDO DIBUJO");

    if (!mapInstance) {
      console.log("❌ Mapa no disponible");
      setDrawingMode(false);
      return;
    }

    const latLngs = polylineRef.current ? polylineRef.current.getLatLngs() : [];
    console.log("📍 Puntos en la ruta al finalizar:", latLngs.length);

    // VERIFICAR QUE LOS PUNTOS SE GUARDEN CORRECTAMENTE
    if (latLngs.length < 2) {
      alert("Necesitas al menos 2 puntos para crear una ruta");
      return;
    }

    // FORZAR ACTUALIZACIÓN FINAL DE LOS DATOS
    updateRouteData(latLngs);

    // Cambiar el estilo de la polyline
    if (polylineRef.current) {
      polylineRef.current.setStyle({
        color: getRouteColor(formData.tipo),
        weight: 8,
        opacity: 0.8,
        dashArray: null,
      });
    }

    // Limpiar eventos
    if (mapClickHandlerRef.current) {
      mapInstance.off("click", mapClickHandlerRef.current);
      mapClickHandlerRef.current = null;
    }

    if (escHandlerRef.current) {
      document.removeEventListener("keydown", escHandlerRef.current);
      escHandlerRef.current = null;
    }

    // Cambiar estados
    setDrawingMode(false);
    setEditingMode(true);
    mapInstance.getContainer().style.cursor = "";

    console.log("✅ Modo dibujo finalizado. Puntos siguen siendo editables");
  }, [mapInstance, formData.tipo, updateRouteData]);

  const activateDrawing = useCallback(() => {
    console.log("🔥 ACTIVANDO MODO DIBUJO");

    if (!mapInstance) {
      console.log("❌ Mapa no disponible");
      return;
    }

    // Limpiar primero
    clearMap();

    // Establecer modo dibujo
    setDrawingMode(true);
    setEditingMode(false);

    // Configurar el mapa
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

    // Handler para clics en el mapa
    const clickHandler = (e) => {
      const { lat, lng } = e.latlng;
      console.log("🖱️ Clic en mapa - Agregando punto:", { lat, lng });

      if (polylineRef.current) {
        const currentLatLngs = polylineRef.current.getLatLngs();
        const newLatLngs = [...currentLatLngs, [lat, lng]];

        // ACTUALIZAR POLYLINE
        polylineRef.current.setLatLngs(newLatLngs);

        // ACTUALIZAR MARKERS - SIEMPRE ARRASTRABLES
        createMarkers(newLatLngs);

        // ACTUALIZAR DATOS DE RUTA INMEDIATAMENTE
        updateRouteData(newLatLngs);

        console.log("✅ Punto agregado. Total:", newLatLngs.length);
      }
    };

    mapInstance.on("click", clickHandler);
    mapClickHandlerRef.current = clickHandler;

    // Handler para tecla ESC
    const escHandler = (e) => {
      if (e.key === "Escape") {
        console.log("⌨️ Tecla ESC presionada - Finalizando dibujo");
        finishDrawing();
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener("keydown", escHandler);
    escHandlerRef.current = escHandler;

    console.log("✅ Modo dibujo completamente activado - Puntos ARRASTRABLES");
  }, [mapInstance, createMarkers, updateRouteData, clearMap, finishDrawing]);

  // ========== FUNCIONES DE RUTA EXISTENTE ==========

  const loadExistingRoute = useCallback(
    (coordinates) => {
      if (!mapInstance || coordinates.length < 2) return;

      clearMap();

      // Convertir de [lng, lat] (GeoJSON) a [lat, lng] (Leaflet)
      const latLngs = coordinates.map((coord) => [coord[1], coord[0]]);

      const polyline = L.polyline(latLngs, {
        color: getRouteColor(formData.tipo),
        weight: 8,
        opacity: 0.8,
        className: "editable-route",
      }).addTo(mapInstance);

      polylineRef.current = polyline;
      currentPointsRef.current = latLngs;

      // CREAR MARKERS - SIEMPRE ARRASTRABLES
      createMarkers(latLngs);

      setEditingMode(true);
      updateRouteData(latLngs);
    },
    [mapInstance, formData.tipo, createMarkers, updateRouteData, clearMap]
  );

  // ========== FUNCIONES AUXILIARES ==========

  const removeLastPoint = useCallback(() => {
    if (!polylineRef.current) return;

    const currentLatLngs = polylineRef.current.getLatLngs();
    console.log(
      "🗑️ Eliminando último punto. Puntos actuales:",
      currentLatLngs.length
    );

    if (currentLatLngs.length <= 2) {
      alert("La ruta debe tener al menos 2 puntos");
      return;
    }

    const newLatLngs = currentLatLngs.slice(0, -1);
    polylineRef.current.setLatLngs(newLatLngs);

    // RECREAR MARKERS - SIEMPRE ARRASTRABLES
    createMarkers(newLatLngs);
    updateRouteData(newLatLngs);

    console.log("✅ Último punto eliminado. Nuevo total:", newLatLngs.length);
  }, [createMarkers, updateRouteData]);

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
    console.log(
      "🔄 Reseteando formulario - PERO MANTENIENDO GEOMETRÍA SI EXISTE"
    );

    // Mantener la geometría si existe, solo resetear otros campos
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

    console.log(
      "✅ Formulario reseteado. Geometría mantenida:",
      !!geometriaToKeep
    );
  }, [formData.geometria, formData.distancia, formData.tiempo_estimado]);

  const validateRouteData = () => {
    console.log("🔍 Validando datos de ruta...");
    console.log("📊 Geometría:", formData.geometria);
    console.log("🔢 Puntos actuales en ref:", currentPointsRef.current.length);

    if (!formData.geometria) {
      console.log("❌ No hay geometría");
      alert("Debes dibujar una ruta en el mapa primero");
      return false;
    }

    if (
      !formData.geometria.coordinates ||
      formData.geometria.coordinates.length < 2
    ) {
      console.log("❌ Menos de 2 puntos en geometría");
      alert("La ruta debe tener al menos 2 puntos");
      return false;
    }

    if (formData.distancia === 0) {
      console.log("❌ Distancia cero");
      alert("La distancia de la ruta no puede ser cero");
      return false;
    }

    console.log(
      "✅ Validación exitosa. Puntos a guardar:",
      formData.geometria.coordinates.length
    );
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("💾 INTENTANDO GUARDAR RUTA...");
    console.log("📊 Estado actual del formulario:", formData);
    console.log(
      "📍 Puntos en polyline:",
      polylineRef.current ? polylineRef.current.getLatLngs().length : 0
    );
    console.log(
      "📍 Puntos en currentPointsRef:",
      currentPointsRef.current.length
    );

    if (!validateRouteData()) {
      return;
    }

    // VERIFICACIÓN FINAL - Asegurar que tenemos los datos correctos
    const finalPoints = polylineRef.current
      ? polylineRef.current.getLatLngs()
      : currentPointsRef.current;
    if (finalPoints.length !== formData.geometria.coordinates.length) {
      console.warn("⚠️ Discrepancia en número de puntos. Recalculando...");
      updateRouteData(finalPoints);
    }

    const routeData = {
      ...formData,
      nombre: formData.nombre.trim() || generateDefaultName(),
      // Asegurar que la geometría esté en formato correcto
      geometria: {
        type: "LineString",
        coordinates: formData.geometria.coordinates,
      },
      // Asegurar que los valores numéricos sean correctos
      distancia: Math.max(1, formData.distancia),
      tiempo_estimado: Math.max(1, formData.tiempo_estimado),
      // Timestamps para tracking
      creado: isEditing && route ? route.creado : new Date().toISOString(),
      actualizado: new Date().toISOString(),
    };

    console.log("✅ DATOS FINALES A GUARDAR:", routeData);
    console.log(
      "🔢 NÚMERO DE PUNTOS EN GEOMETRÍA:",
      routeData.geometria.coordinates.length
    );

    onSave(routeData);
    resetForm();
  };

  const handleCancel = () => {
    console.log("❌ Cancelando formulario");
    clearMap();
    resetForm();
    onCancel();
  };

  // ========== EFFECTS ==========

  useEffect(() => {
    if (isVisible && route && isEditing) {
      console.log("📥 Cargando ruta existente para edición:", route);

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
        console.log(
          "📍 Cargando geometría existente con puntos:",
          route.geometria.coordinates.length
        );
        loadExistingRoute(route.geometria.coordinates);
      }
    } else if (isVisible && !route) {
      // SOLO resetear si es una nueva ruta y no tenemos geometría
      if (!formData.geometria) {
        console.log("🆕 Inicializando formulario para nueva ruta");
        resetForm();
      } else {
        console.log("📊 Manteniendo datos existentes en formulario");
      }
    }
  }, [
    isVisible,
    route,
    isEditing,
    loadExistingRoute,
    resetForm,
    formData.geometria,
  ]);

  useEffect(() => {
    return () => {
      clearMap();
    };
  }, [clearMap]);

  // Cleanup cuando el componente se desmonta o se oculta
  useEffect(() => {
    if (!isVisible) {
      console.log(
        "👋 Ocultando formulario - limpiando mapa pero manteniendo estado"
      );
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
