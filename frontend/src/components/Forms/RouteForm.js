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
    } else {
      setMapAvailable(false);
    }
  }, [mapInstance]);

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

  // ✅ Agregar event listener para la tecla ESC
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape" && selectionActive) {
        handleDeactivateMapSelection();
      }
    };

    // Agregar event listener cuando la selección está activa
    if (selectionActive) {
      document.addEventListener("keydown", handleKeyPress);

      // Mostrar indicador visual de que ESC funciona
      const indicator = document.createElement("div");
      indicator.className = "esc-indicator";
      indicator.innerHTML = "⏹️ Presiona ESC para detener la selección";
      indicator.style.cssText = `
        position: fixed;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(52, 152, 219, 0.9);
        color: white;
        padding: 10px 20px;
        border-radius: 20px;
        z-index: 10000;
        font-size: 14px;
        font-weight: bold;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        backdrop-filter: blur(10px);
      `;
      document.body.appendChild(indicator);

      // Remover después de 3 segundos
      setTimeout(() => {
        if (document.body.contains(indicator)) {
          document.body.removeChild(indicator);
        }
      }, 3000);
    }

    // Limpiar event listener
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      // Remover indicador si existe
      const existingIndicator = document.querySelector(".esc-indicator");
      if (existingIndicator && document.body.contains(existingIndicator)) {
        document.body.removeChild(existingIndicator);
      }
    };
  }, [selectionActive]);

  // Limpiar marcadores temporales al cerrar
  useEffect(() => {
    if (!isVisible) {
      clearTempMarkers();
      removeMapClickListener();
    }
  }, [isVisible]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  // ✅ Activar selección en el mapa - formulario desaparece
  const handleActivateMapSelection = () => {
    if (!mapAvailable || !mapInstance) {
      return;
    }

    if (!mapInstance.getContainer()) {
      return;
    }

    // Limpiar selección anterior
    clearTempMarkers();
    removeMapClickListener();

    // Cambiar cursor del mapa
    mapInstance.getContainer().style.cursor = "crosshair";
    setSelectionActive(true);

    const handler = (e) => {
      if (!e || !e.latlng) {
        return;
      }

      const { lat, lng } = e.latlng;
      addPointToRoute(lat, lng);
    };

    mapInstance.on("click", handler);
    setMapClickHandler(() => handler);
  };

  // ✅ Desactivar selección en el mapa
  const handleDeactivateMapSelection = () => {
    removeMapClickListener();
    setSelectionActive(false);
    if (mapInstance && mapInstance.getContainer()) {
      mapInstance.getContainer().style.cursor = "";
    }
  };

  // ✅ Agregar punto a la ruta
  const addPointToRoute = (lat, lng) => {
    if (!mapInstance) {
      return;
    }

    const puntoCount = formData.puntos_ruta.length;
    let tipo_punto;

    if (puntoCount === 0) {
      tipo_punto = "inicio";
    } else {
      tipo_punto = "intermedio";
    }

    const newPoint = {
      lat,
      lng,
      nombre: `Punto ${puntoCount + 1}`,
      tipo_punto: tipo_punto,
    };

    try {
      // Crear marcador temporal
      const marker = window.L.marker([lat, lng], {
        icon: window.L.divIcon({
          html: `<div style="background-color: ${
            newPoint.tipo_punto === "inicio"
              ? "#27ae60"
              : newPoint.tipo_punto === "fin"
              ? "#e74c3c"
              : "#3498db"
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
          <small>${newPoint.tipo_punto}</small>
        </div>
      `);

      // Agregar a puntos temporales
      const updatedMarkers = [...tempMarkers, marker];
      setTempMarkers(updatedMarkers);

      // Agregar a puntos de ruta
      const updatedPuntos = [
        ...formData.puntos_ruta,
        {
          orden: puntoCount + 1,
          tipo_punto: newPoint.tipo_punto,
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

      // Actualizar línea temporal
      updateTempLine(updatedPuntos);
    } catch (error) {
      console.error("Error al agregar punto:", error);
    }
  };

  // ✅ Actualizar línea temporal en el mapa
  const updateTempLine = (puntos) => {
    if (!mapInstance) return;

    if (tempLine && mapInstance.hasLayer(tempLine)) {
      mapInstance.removeLayer(tempLine);
    }

    if (puntos.length >= 2) {
      try {
        const coordinates = puntos.map((punto) => {
          const [lng, lat] = punto.coordenadas.coordinates;
          return [lat, lng];
        });

        const line = window.L.polyline(coordinates, {
          color: "#3498db",
          weight: 4,
          opacity: 0.7,
          dashArray: "5, 10",
          className: "temp-route-line",
        }).addTo(mapInstance);

        setTempLine(line);
      } catch (error) {
        console.error("Error al actualizar línea:", error);
      }
    }
  };

  // ✅ Calcular ruta basada en los puntos seleccionados
  const handleCalculateRoute = () => {
    if (formData.puntos_ruta.length < 2) {
      return;
    }

    // Crear geometría LineString
    const coordinates = formData.puntos_ruta.map(
      (punto) => punto.coordenadas.coordinates
    );

    const geometria = {
      type: "LineString",
      coordinates: coordinates,
    };

    // Calcular distancia total (aproximada)
    const distancia = calculateTotalDistance(formData.puntos_ruta);
    const tiempo_estimado = Math.round(distancia / 80);

    setFormData((prev) => ({
      ...prev,
      geometria,
      distancia,
      tiempo_estimado,
    }));

    // Desactivar selección en mapa
    handleDeactivateMapSelection();
  };

  // ✅ Calcular distancia total de la ruta
  const calculateTotalDistance = (puntos) => {
    let totalDistance = 0;

    for (let i = 0; i < puntos.length - 1; i++) {
      const puntoA = puntos[i];
      const puntoB = puntos[i + 1];

      const [lngA, latA] = puntoA.coordenadas.coordinates;
      const [lngB, latB] = puntoB.coordenadas.coordinates;

      totalDistance += calculateDistance(latA, lngA, latB, lngB);
    }

    return Math.round(totalDistance);
  };

  // ✅ Función para calcular distancia entre dos puntos
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // ✅ Limpiar marcadores temporales
  const clearTempMarkers = () => {
    if (!mapInstance) return;

    tempMarkers.forEach((marker) => {
      if (mapInstance.hasLayer(marker)) {
        mapInstance.removeLayer(marker);
      }
    });
    setTempMarkers([]);

    if (tempLine && mapInstance.hasLayer(tempLine)) {
      mapInstance.removeLayer(tempLine);
      setTempLine(null);
    }
  };

  // ✅ Remover listener del mapa
  const removeMapClickListener = () => {
    if (mapInstance) {
      mapInstance.off("click");
      setMapClickHandler(null);

      if (mapInstance.getContainer()) {
        mapInstance.getContainer().style.cursor = "";
      }
    }
    setSelectionActive(false);
  };

  // ✅ Limpiar todos los puntos
  const handleClearPoints = () => {
    clearTempMarkers();
    removeMapClickListener();

    setFormData((prev) => ({
      ...prev,
      puntos_ruta: [],
      geometria: null,
      distancia: 0,
      tiempo_estimado: 0,
    }));
  };

  // ✅ Eliminar último punto
  const handleRemoveLastPoint = () => {
    if (formData.puntos_ruta.length === 0) return;

    // Remover último marcador
    const lastMarker = tempMarkers[tempMarkers.length - 1];
    if (lastMarker && mapInstance && mapInstance.hasLayer(lastMarker)) {
      mapInstance.removeLayer(lastMarker);
    }

    // Actualizar arrays
    const updatedMarkers = tempMarkers.slice(0, -1);
    const updatedPuntos = formData.puntos_ruta.slice(0, -1);

    setTempMarkers(updatedMarkers);
    setFormData((prev) => ({
      ...prev,
      puntos_ruta: updatedPuntos,
    }));

    // Actualizar línea
    updateTempLine(updatedPuntos);

    // Si quedan menos de 2 puntos, limpiar geometría
    if (updatedPuntos.length < 2) {
      setFormData((prev) => ({
        ...prev,
        geometria: null,
        distancia: 0,
        tiempo_estimado: 0,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.nombre || !formData.geometria) {
      return;
    }

    if (formData.puntos_ruta.length < 2) {
      return;
    }

    // Limpiar antes de guardar
    clearTempMarkers();
    removeMapClickListener();

    onSave(formData);
  };

  // ✅ Limpiar todo al cancelar
  const handleCancel = () => {
    clearTempMarkers();
    removeMapClickListener();
    onCancel();
  };

  if (!isVisible) return null;

  // ✅ Si la selección está activa, NO mostrar el formulario
  if (selectionActive) {
    return null;
  }

  return (
    <div className="route-form-overlay">
      <div className="route-form-container">
        <div className="route-form-header">
          <h3>{isEditing ? "✏️ Editar Ruta" : "➕ Crear Ruta"}</h3>
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
              placeholder="Ej: Ruta desde Punto A hasta Punto B"
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
                ⚠️ El mapa no está disponible
              </div>
            )}

            <div className="map-selection-controls">
              <button
                type="button"
                className="select-btn"
                onClick={handleActivateMapSelection}
                disabled={!mapAvailable}>
                🎯{" "}
                {mapAvailable
                  ? "Activar Selección en Mapa"
                  : "Mapa No Disponible"}
              </button>

              <div className="point-actions">
                <button
                  type="button"
                  className="remove-btn"
                  onClick={handleRemoveLastPoint}
                  disabled={formData.puntos_ruta.length === 0 || !mapAvailable}>
                  ↩️ Eliminar Último
                </button>

                <button
                  type="button"
                  className="clear-btn"
                  onClick={handleClearPoints}
                  disabled={formData.puntos_ruta.length === 0 || !mapAvailable}>
                  🗑️ Limpiar Todos
                </button>
              </div>
            </div>

            <div className="points-counter">
              <span>Puntos seleccionados: </span>
              <strong>{formData.puntos_ruta.length}</strong>
            </div>

            {formData.puntos_ruta.length > 0 && (
              <div className="selected-points">
                <h5>Puntos de la Ruta:</h5>
                <div className="points-list">
                  {formData.puntos_ruta.map((punto, index) => (
                    <div key={index} className="point-item">
                      <span className="point-order">{punto.orden}.</span>
                      <span className="point-name">{punto.nombre_punto}</span>
                      <span className="point-coords">
                        ({punto.coordenadas.coordinates[1].toFixed(4)},{" "}
                        {punto.coordenadas.coordinates[0].toFixed(4)})
                      </span>
                      <span className={`point-type ${punto.tipo_punto}`}>
                        {punto.tipo_punto}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
              <h4>📊 Detalles de la Ruta</h4>
              <div className="route-stats">
                <div className="stat-item">
                  <span className="stat-label">Distancia:</span>
                  <span className="stat-value">{formData.distancia}m</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Tiempo:</span>
                  <span className="stat-value">
                    {formData.tiempo_estimado}min
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Puntos:</span>
                  <span className="stat-value">
                    {formData.puntos_ruta.length}
                  </span>
                </div>
              </div>
            </div>
          )}

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
