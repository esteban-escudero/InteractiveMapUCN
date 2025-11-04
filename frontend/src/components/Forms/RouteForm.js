import React, { useState, useEffect } from "react";
import "./RouteForm.css";

const RouteForm = ({
  onSave,
  onCancel,
  isVisible,
  route = null,
  isEditing = false,
  mapInstance = null,
}) => {
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "peatonal",
    distancia: 0,
    tiempo_estimado: 0,
    geometria: null,
    puntos_ruta: [],
  });

  const [mapClickHandler, setMapClickHandler] = useState(null);
  const [tempMarkers, setTempMarkers] = useState([]);
  const [tempLine, setTempLine] = useState(null);
  const [selectionActive, setSelectionActive] = useState(false);
  const [mapAvailable, setMapAvailable] = useState(false);

  // ✅ Verificar si el mapa está disponible
  useEffect(() => {
    if (mapInstance && typeof window !== "undefined" && window.L) {
      setMapAvailable(true);
      console.log("✅ Mapa disponible para RouteForm");
    } else {
      setMapAvailable(false);
      console.warn("⚠️ Mapa no disponible para RouteForm");
    }
  }, [mapInstance]);

  // ✅ Cargar datos de ruta en modo edición
  useEffect(() => {
    if (route && isEditing) {
      setFormData({
        nombre: route.nombre || "",
        tipo: route.tipo || "peatonal",
        distancia: route.distancia || 0,
        tiempo_estimado: route.tiempo_estimado || 0,
        geometria: route.geometria || null,
        puntos_ruta: route.puntos_ruta || [],
      });
    } else {
      setFormData({
        nombre: "",
        tipo: "peatonal",
        distancia: 0,
        tiempo_estimado: 0,
        geometria: null,
        puntos_ruta: [],
      });
    }
  }, [route, isEditing]);

  // ✅ Limpiar marcadores al cerrar
  useEffect(() => {
    if (!isVisible) {
      clearTempMarkers();
      removeMapClickListener();
    }
  }, [isVisible]);

  // --- Handlers de formulario ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --- Activar selección en el mapa ---
  const handleActivateMapSelection = () => {
    if (!mapAvailable || !mapInstance) {
      alert(
        "❌ El mapa no está disponible. Espera a que se cargue completamente."
      );
      return;
    }

    if (!mapInstance.getContainer()) {
      alert("❌ El mapa aún no está listo. Intenta de nuevo en unos segundos.");
      return;
    }

    clearTempMarkers();
    removeMapClickListener();

    mapInstance.getContainer().style.cursor = "crosshair";
    setSelectionActive(true);

    const handler = (e) => {
      if (!e || !e.latlng) return;
      const { lat, lng } = e.latlng;
      addPointToRoute(lat, lng);
    };

    mapInstance.on("click", handler);
    setMapClickHandler(() => handler);

    alert(
      "🎯 Modo selección activado: haz clic en el mapa para agregar puntos."
    );
  };

  // --- Desactivar selección ---
  const handleDeactivateMapSelection = () => {
    removeMapClickListener();
    setSelectionActive(false);
    if (mapInstance?.getContainer()) {
      mapInstance.getContainer().style.cursor = "";
    }
    alert("⏹️ Selección desactivada");
  };

  // --- Agregar punto ---
  const addPointToRoute = (lat, lng) => {
    const puntoCount = formData.puntos_ruta.length;
    const tipo_punto = puntoCount === 0 ? "inicio" : "intermedio";

    const newPoint = {
      lat,
      lng,
      nombre: `Punto ${puntoCount + 1}`,
      tipo_punto,
    };

    const marker = window.L.marker([lat, lng], {
      icon: window.L.divIcon({
        html: `<div style="background-color: ${
          tipo_punto === "inicio" ? "#27ae60" : "#3498db"
        }; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [22, 22],
        className: "temp-route-point",
      }),
    }).addTo(mapInstance);

    marker.bindPopup(`
      <div style="text-align: center;">
        <strong>${newPoint.nombre}</strong><br>
        Lat: ${lat.toFixed(6)}<br>
        Lng: ${lng.toFixed(6)}<br>
        <small>${tipo_punto}</small>
      </div>
    `);

    const updatedMarkers = [...tempMarkers, marker];
    setTempMarkers(updatedMarkers);

    const updatedPuntos = [
      ...formData.puntos_ruta,
      {
        orden: puntoCount + 1,
        tipo_punto,
        descripcion: `${newPoint.nombre} (${lat.toFixed(4)}, ${lng.toFixed(
          4
        )})`,
        nombre_punto: newPoint.nombre,
        coordenadas: {
          type: "Point",
          coordinates: [lng, lat],
        },
      },
    ];

    setFormData((prev) => ({
      ...prev,
      puntos_ruta: updatedPuntos,
    }));

    updateTempLine(updatedPuntos);
  };

  // --- Dibujar línea ---
  const updateTempLine = (puntos) => {
    if (tempLine && mapInstance?.hasLayer(tempLine)) {
      mapInstance.removeLayer(tempLine);
    }

    if (puntos.length >= 2) {
      const coordinates = puntos.map((p) => {
        const [lng, lat] = p.coordenadas.coordinates;
        return [lat, lng];
      });

      const line = window.L.polyline(coordinates, {
        color: "#3498db",
        weight: 4,
        opacity: 0.7,
        dashArray: "5, 10",
      }).addTo(mapInstance);

      setTempLine(line);
    }
  };

  // --- Calcular ruta ---
  const handleCalculateRoute = () => {
    if (formData.puntos_ruta.length < 2) {
      alert("Se necesitan al menos 2 puntos para calcular la ruta");
      return;
    }

    const coordinates = formData.puntos_ruta.map(
      (p) => p.coordenadas.coordinates
    );
    const geometria = { type: "LineString", coordinates };

    const distancia = calculateTotalDistance(formData.puntos_ruta);
    const tiempo_estimado = Math.round(distancia / 80); // aprox. caminando

    setFormData((prev) => ({
      ...prev,
      geometria,
      distancia,
      tiempo_estimado,
    }));

    handleDeactivateMapSelection();
    alert("✅ Ruta calculada correctamente");
  };

  const calculateTotalDistance = (puntos) => {
    let total = 0;
    for (let i = 0; i < puntos.length - 1; i++) {
      const [lngA, latA] = puntos[i].coordenadas.coordinates;
      const [lngB, latB] = puntos[i + 1].coordenadas.coordinates;
      total += calculateDistance(latA, lngA, latB, lngB);
    }
    return Math.round(total);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // --- Limpieza ---
  const clearTempMarkers = () => {
    tempMarkers.forEach((m) => {
      if (mapInstance?.hasLayer(m)) mapInstance.removeLayer(m);
    });
    setTempMarkers([]);
    if (tempLine && mapInstance?.hasLayer(tempLine)) {
      mapInstance.removeLayer(tempLine);
      setTempLine(null);
    }
  };

  const removeMapClickListener = () => {
    if (mapInstance && mapClickHandler) {
      mapInstance.off("click", mapClickHandler);
      setMapClickHandler(null);
      if (mapInstance.getContainer())
        mapInstance.getContainer().style.cursor = "";
    }
    setSelectionActive(false);
  };

  const handleClearPoints = () => {
    clearTempMarkers();
    setFormData((prev) => ({
      ...prev,
      puntos_ruta: [],
      geometria: null,
      distancia: 0,
      tiempo_estimado: 0,
    }));
  };

  const handleRemoveLastPoint = () => {
    if (formData.puntos_ruta.length === 0) return;

    const lastMarker = tempMarkers[tempMarkers.length - 1];
    if (lastMarker && mapInstance?.hasLayer(lastMarker)) {
      mapInstance.removeLayer(lastMarker);
    }

    const updatedMarkers = tempMarkers.slice(0, -1);
    const updatedPuntos = formData.puntos_ruta.slice(0, -1);
    setTempMarkers(updatedMarkers);
    setFormData((prev) => ({ ...prev, puntos_ruta: updatedPuntos }));
    updateTempLine(updatedPuntos);
  };

  // --- Guardar y cancelar ---
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.geometria) {
      alert("⚠️ Nombre y ruta calculada son requeridos");
      return;
    }
    clearTempMarkers();
    removeMapClickListener();
    onSave(formData);
  };

  const handleCancel = () => {
    clearTempMarkers();
    removeMapClickListener();
    onCancel();
  };

  if (!isVisible) return null;

  return (
    <div className="route-form-overlay">
      <div className="route-form-container">
        <div className="route-form-header">
          <h3>{isEditing ? "✏️ Editar Ruta" : "➕ Crear Nueva Ruta"}</h3>
          <button className="close-btn" onClick={handleCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="route-form">
          <div className="form-group">
            <label>Nombre de la Ruta *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              placeholder="Ej: Ruta desde A hasta B"
              required
            />
          </div>

          <div className="form-group">
            <label>Tipo de Ruta</label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleInputChange}>
              <option value="peatonal">Peatonal</option>
              <option value="vehicular">Vehicular</option>
              <option value="accesible">Accesible</option>
            </select>
          </div>

          <div className="route-selection-section">
            <h4>🗺️ Seleccionar Puntos en el Mapa</h4>
            {!mapAvailable && (
              <div className="map-unavailable-warning">
                ⚠️ El mapa no está disponible o aún no se ha cargado.
              </div>
            )}

            <div className="map-selection-controls">
              {!selectionActive ? (
                <button
                  type="button"
                  className="select-btn"
                  onClick={handleActivateMapSelection}
                  disabled={!mapAvailable}>
                  🎯 Activar Selección
                </button>
              ) : (
                <button
                  type="button"
                  className="deactivate-btn"
                  onClick={handleDeactivateMapSelection}>
                  ⏹️ Desactivar Selección
                </button>
              )}

              <div className="point-actions">
                <button
                  type="button"
                  className="remove-btn"
                  onClick={handleRemoveLastPoint}
                  disabled={formData.puntos_ruta.length === 0}>
                  ↩️ Eliminar Último
                </button>
                <button
                  type="button"
                  className="clear-btn"
                  onClick={handleClearPoints}
                  disabled={formData.puntos_ruta.length === 0}>
                  🗑️ Limpiar Todos
                </button>
              </div>
            </div>

            <div className="points-counter">
              <span>Puntos seleccionados: </span>
              <strong>{formData.puntos_ruta.length}</strong>
            </div>

            {formData.puntos_ruta.length >= 2 && (
              <div className="route-calculation-section">
                <button
                  type="button"
                  className="calculate-btn"
                  onClick={handleCalculateRoute}>
                  🧮 Calcular Ruta
                </button>
              </div>
            )}

            {formData.geometria && (
              <div className="route-details">
                <h4>📊 Detalles</h4>
                <p>
                  <b>Distancia:</b> {formData.distancia} m
                </p>
                <p>
                  <b>Tiempo estimado:</b> {formData.tiempo_estimado} min
                </p>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleCancel} className="cancel-btn">
              Cancelar
            </button>
            <button
              type="submit"
              className="save-btn"
              disabled={!formData.geometria}>
              {isEditing ? "Actualizar" : "Crear"} Ruta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RouteForm;
