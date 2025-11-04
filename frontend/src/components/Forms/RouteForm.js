import React, { useState, useEffect, useCallback } from "react";
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
        tipo: route.tipo || "peatonal", // ← Ya es válido
        distancia: route.distancia || 0,
        tiempo_estimado: route.tiempo_estimado || 0,
        geometria: route.geometria || null,
        puntos_ruta: route.puntos_ruta || [],
      });
    } else {
      setFormData({
        nombre: "",
        tipo: "peatonal", // ← Valor por defecto válido
        distancia: 0,
        tiempo_estimado: 0,
        geometria: null,
        puntos_ruta: [],
      });
    }
  }, [route, isEditing]);

  // ✅ Tecla ESC para finalizar selección
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape" && selectionActive) {
        handleFinishWithESC();
      }
    };

    if (selectionActive) {
      document.addEventListener("keydown", handleKeyPress);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [selectionActive]);

  // Limpiar al cerrar formulario
  useEffect(() => {
    if (!isVisible) {
      clearTempMarkers();
      removeMapClickListener();
    }
  }, [isVisible]);

  // ✅ Efecto para monitorear el estado del formulario
  useEffect(() => {
    console.log("📊 Estado del formulario:", {
      nombre: formData.nombre || "(vacío)",
      tieneGeometria: !!formData.geometria,
      puntos: formData.puntos_ruta.length,
      puedeGuardar: formData.puntos_ruta.length >= 2 && !!formData.geometria,
    });
  }, [formData.nombre, formData.geometria, formData.puntos_ruta.length]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Agregar punto a la ruta usando el estado previo
  const addPointToRoute = useCallback(
    (lat, lng) => {
      if (!mapInstance) return;

      setFormData((prev) => {
        const puntoCount = prev.puntos_ruta.length;

        const newPoint = {
          lat,
          lng,
          nombre: `Punto ${puntoCount + 1}`,
          tipo_punto: "intermedio",
        };

        // Crear marcador gris
        const marker = window.L.marker([lat, lng], {
          icon: window.L.divIcon({
            html: `<div style="background-color: #95a5a6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
            iconSize: [22, 22],
            className: "temp-route-point",
          }),
        }).addTo(mapInstance);

        marker.bindPopup(`
        <div style="text-align: center;">
          <strong>${newPoint.nombre}</strong><br>
          Lat: ${lat.toFixed(6)}<br>
          Lng: ${lng.toFixed(6)}<br>
          <small>Punto ${puntoCount + 1}</small>
        </div>
      `);

        setTempMarkers((prevMarkers) => [...prevMarkers, marker]);

        const updatedPuntos = [
          ...prev.puntos_ruta,
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

        console.log(
          `✅ Punto ${puntoCount + 1} agregado. Total: ${updatedPuntos.length}`
        );

        return {
          ...prev,
          puntos_ruta: updatedPuntos,
        };
      });
    },
    [mapInstance]
  );

  // ✅ Activar selección de puntos
  const handleActivateMapSelection = () => {
    if (!mapAvailable || !mapInstance) return;

    console.log("🎯 ACTIVANDO SELECCIÓN - Listo para múltiples puntos");
    clearTempMarkers();
    removeMapClickListener();

    mapInstance.getContainer().style.cursor = "crosshair";
    setSelectionActive(true);

    const handler = (e) => {
      if (e?.latlng) {
        addPointToRoute(e.latlng.lat, e.latlng.lng);
      }
    };

    mapInstance.on("click", handler);
    setMapClickHandler(() => handler);

    console.log("✅ Mapa listo para recibir múltiples clics");
  };

  // ✅ Finalizar selección con ESC - VERSIÓN MEJORADA
  // ✅ Finalizar selección con ESC - VERSIÓN MEJORADA
  const handleFinishWithESC = () => {
    console.log("⏹️ FINALIZANDO con ESC. Puntos:", formData.puntos_ruta.length);

    if (formData.puntos_ruta.length < 2) {
      console.log("❌ Se necesitan al menos 2 puntos");
      handleDeactivateMapSelection();
      return;
    }

    const updatedPuntos = formData.puntos_ruta.map((punto, index) => {
      let tipo_punto =
        index === 0
          ? "inicio"
          : index === formData.puntos_ruta.length - 1
          ? "fin"
          : "intermedio";

      return {
        ...punto,
        tipo_punto,
        descripcion: `${
          tipo_punto === "inicio"
            ? "Inicio"
            : tipo_punto === "fin"
            ? "Fin"
            : `Punto ${index + 1}`
        } (${punto.coordenadas.coordinates[1].toFixed(
          4
        )}, ${punto.coordenadas.coordinates[0].toFixed(4)})`,
        nombre_punto:
          tipo_punto === "inicio"
            ? "Inicio"
            : tipo_punto === "fin"
            ? "Fin"
            : `Punto ${index + 1}`,
      };
    });

    // ✅ Crear geometría y calcular distancia/tiempo inmediatamente
    const coordinates = updatedPuntos.map((p) => p.coordenadas.coordinates);
    const geometria = {
      type: "LineString",
      coordinates: coordinates,
    };

    const distancia = calculateTotalDistance(updatedPuntos);
    const tiempo_estimado = Math.round(distancia / 80);

    console.log("✅ Datos calculados en handleFinishWithESC:", {
      distancia,
      tiempo_estimado,
      puntos: updatedPuntos.length,
    });

    setFormData((prev) => ({
      ...prev,
      puntos_ruta: updatedPuntos,
      geometria,
      distancia,
      tiempo_estimado,
    }));

    updateMarkersWithColors(updatedPuntos);
    drawRouteLine(updatedPuntos);
    handleDeactivateMapSelection();
  };

  const updateMarkersWithColors = (puntos) => {
    if (!mapInstance) return;
    clearTempMarkers();

    const newMarkers = puntos.map((punto) => {
      const [lng, lat] = punto.coordenadas.coordinates;

      let color =
        punto.tipo_punto === "inicio"
          ? "#27ae60"
          : punto.tipo_punto === "fin"
          ? "#e74c3c"
          : "#3498db";

      const marker = window.L.marker([lat, lng], {
        icon: window.L.divIcon({
          html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
          iconSize: [22, 22],
          className: "route-point-marker",
        }),
      }).addTo(mapInstance);

      marker.bindPopup(`
        <div style="text-align: center;">
          <strong>${punto.nombre_punto}</strong><br>
          Lat: ${lat.toFixed(6)}<br>
          Lng: ${lng.toFixed(6)}<br>
          <small>${punto.tipo_punto}</small>
        </div>
      `);

      return marker;
    });

    setTempMarkers(newMarkers);
  };

  const drawRouteLine = (puntos) => {
    if (!mapInstance || puntos.length < 2) return;

    if (tempLine && mapInstance.hasLayer(tempLine)) {
      mapInstance.removeLayer(tempLine);
    }

    const coordinates = puntos.map((p) => [
      p.coordenadas.coordinates[1],
      p.coordenadas.coordinates[0],
    ]);

    const line = window.L.polyline(coordinates, {
      color: "#e74c3c",
      weight: 5,
      opacity: 0.8,
    }).addTo(mapInstance);

    setTempLine(line);
  };

  const calculateRouteData = (puntos) => {
    if (puntos.length < 2) {
      console.log("❌ No hay suficientes puntos para calcular ruta");
      return;
    }

    try {
      const coordinates = puntos.map((p) => p.coordenadas.coordinates);
      const geometria = {
        type: "LineString",
        coordinates: coordinates,
      };
      const distancia = calculateTotalDistance(puntos);
      const tiempo_estimado = Math.round(distancia / 80);

      console.log("✅ Ruta calculada:", {
        distancia,
        tiempo_estimado,
        puntos: puntos.length,
      });

      setFormData((prev) => ({
        ...prev,
        geometria,
        distancia,
        tiempo_estimado,
      }));
    } catch (error) {
      console.error("❌ Error al calcular ruta:", error);
    }
  };

  const calculateTotalDistance = (puntos) => {
    if (puntos.length < 2) return 0;

    let total = 0;
    for (let i = 0; i < puntos.length - 1; i++) {
      const [lngA, latA] = puntos[i].coordenadas.coordinates;
      const [lngB, latB] = puntos[i + 1].coordenadas.coordinates;
      total += calculateDistance(latA, lngA, latB, lngB);
    }

    const distanciaRedondeada = Math.round(total);
    console.log(
      `📏 Distancia calculada: ${distanciaRedondeada}m (${puntos.length} puntos)`
    );
    return distanciaRedondeada;
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

  const handleDeactivateMapSelection = () => {
    removeMapClickListener();
    setSelectionActive(false);
    if (mapInstance?.getContainer()) {
      mapInstance.getContainer().style.cursor = "";
    }
  };

  const clearTempMarkers = () => {
    if (!mapInstance) return;
    tempMarkers.forEach(
      (m) => mapInstance.hasLayer(m) && mapInstance.removeLayer(m)
    );
    setTempMarkers([]);
    if (tempLine && mapInstance.hasLayer(tempLine)) {
      mapInstance.removeLayer(tempLine);
      setTempLine(null);
    }
  };

  const removeMapClickListener = () => {
    if (mapInstance) {
      mapInstance.off("click");
      setMapClickHandler(null);
    }
  };

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

  const handleRemoveLastPoint = () => {
    if (formData.puntos_ruta.length === 0) return;

    const updatedMarkers = tempMarkers.slice(0, -1);
    const updatedPuntos = formData.puntos_ruta.slice(0, -1);

    setTempMarkers(updatedMarkers);
    setFormData((prev) => ({
      ...prev,
      puntos_ruta: updatedPuntos,
    }));

    if (updatedPuntos.length < 2) {
      setFormData((prev) => ({
        ...prev,
        geometria: null,
        distancia: 0,
        tiempo_estimado: 0,
      }));
    }
  };

  // ✅ SUBMIT CORREGIDO - Usar solo tipos válidos
  // ✅ SUBMIT CORREGIDO - Incluir distancia y tiempo_estimado
  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.puntos_ruta.length < 2) {
      console.log("❌ Se necesitan al menos 2 puntos para crear una ruta");
      return;
    }

    // ✅ Asegurar que tenemos geometría
    let geometriaParaEnviar = formData.geometria;

    if (!geometriaParaEnviar && formData.puntos_ruta.length >= 2) {
      const coordinates = formData.puntos_ruta.map(
        (p) => p.coordenadas.coordinates
      );
      geometriaParaEnviar = {
        type: "LineString",
        coordinates: coordinates,
      };
      console.log("🔄 Geometría creada automáticamente");
    }

    // ✅ Asegurar que tenemos nombre
    const nombreParaEnviar =
      formData.nombre.trim() ||
      `Ruta ${new Date().toLocaleDateString(
        "es-ES"
      )} ${new Date().toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;

    // ✅ Calcular distancia y tiempo si no existen
    let distanciaParaEnviar = formData.distancia;
    let tiempoParaEnviar = formData.tiempo_estimado;

    if (!distanciaParaEnviar && formData.puntos_ruta.length >= 2) {
      distanciaParaEnviar = calculateTotalDistance(formData.puntos_ruta);
      tiempoParaEnviar = Math.round(distanciaParaEnviar / 80); // 80m/min caminando
      console.log("🔄 Distancia y tiempo calculados automáticamente:", {
        distancia: distanciaParaEnviar,
        tiempo: tiempoParaEnviar,
      });
    }

    console.log("✅ Tipo validado:", formData.tipo);

    // ✅ Preparar datos para enviar - INCLUYENDO DISTANCIA Y TIEMPO
    const datosParaGuardar = {
      ...formData,
      nombre: nombreParaEnviar,
      distancia: distanciaParaEnviar,
      tiempo_estimado: tiempoParaEnviar,
      geometria: geometriaParaEnviar,
      puntos_ruta: formData.puntos_ruta, // ← Asegurar que los puntos también se envíen
    };

    console.log("✅ Enviando al backend:", {
      nombre: datosParaGuardar.nombre,
      tipo: datosParaGuardar.tipo,
      distancia: datosParaGuardar.distancia,
      tiempo_estimado: datosParaGuardar.tiempo_estimado,
      puntos: datosParaGuardar.puntos_ruta.length,
      tieneGeometria: !!datosParaGuardar.geometria,
    });

    // ✅ Validación final antes de enviar
    if (!datosParaGuardar.geometria) {
      console.error("❌ Error crítico: No se pudo crear la geometría");
      return;
    }

    clearTempMarkers();
    removeMapClickListener();
    onSave(datosParaGuardar);
  };

  const handleCancel = () => {
    clearTempMarkers();
    removeMapClickListener();
    onCancel();
  };

  if (!isVisible) return null;
  if (selectionActive) return null;

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
          {/* ✅ NOMBRE OPCIONAL */}
          <div className="form-group">
            <label>Nombre de la Ruta (opcional)</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              placeholder="Dejar vacío para nombre automático"
            />
          </div>

          <div className="form-group">
            <label>Tipo de Ruta</label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleInputChange}>
              <option value="peatonal">Peatonal</option>
              <option value="accesible">Accesible</option>
              <option value="emergencia">Emergencia</option>
              <option value="rapida">Rápida</option>
            </select>
          </div>

          <div className="route-selection-section">
            <h4>🗺️ Seleccionar Puntos en el Mapa</h4>
            {!mapAvailable && (
              <div className="map-unavailable-warning">
                ⚠️ El mapa no está disponible
              </div>
            )}

            <div className="selection-instructions">
              <p>
                1️⃣ <strong>Primero selecciona los puntos en el mapa</strong>
              </p>
              <p>2️⃣ Haz clic en "Activar Selección"</p>
              <p>3️⃣ Haz varios clics en el mapa para agregar puntos</p>
              <p>
                4️⃣ Presiona <strong>ESC</strong> para finalizar
              </p>
              <p>
                5️⃣ <strong>Opcional:</strong> Elige tipo de ruta y pon nombre
              </p>
              <p>6️⃣ Guarda la ruta</p>
            </div>

            <div className="map-selection-controls">
              <button
                type="button"
                className="select-btn"
                onClick={handleActivateMapSelection}
                disabled={!mapAvailable || selectionActive}>
                🎯{" "}
                {selectionActive
                  ? "Seleccionando..."
                  : "Activar Selección en Mapa"}
              </button>

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
              Puntos seleccionados:{" "}
              <strong>{formData.puntos_ruta.length}</strong>
            </div>

            {formData.puntos_ruta.length > 0 && (
              <div className="selected-points">
                <h5>Puntos:</h5>
                {formData.puntos_ruta.map((p, i) => (
                  <div key={i} className="point-item">
                    <span>
                      {i + 1}. {p.nombre_punto}
                    </span>
                    <span>
                      {" "}
                      ({p.coordenadas.coordinates[1].toFixed(4)},{" "}
                      {p.coordenadas.coordinates[0].toFixed(4)})
                    </span>
                    <span> - {p.tipo_punto}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {formData.geometria && (
            <div className="route-details">
              <h4>📊 Detalles</h4>
              <p>Distancia: {formData.distancia} m</p>
              <p>Tiempo estimado: {formData.tiempo_estimado} min</p>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancelar
            </button>
            {/* ✅ BOTÓN SOLO VALIDA PUNTOS */}
            <button
              type="submit"
              className="save-btn"
              disabled={formData.puntos_ruta.length < 2}>
              {isEditing ? "Actualizar" : "Crear"} Ruta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RouteForm;
