import React, { useState, useEffect, useCallback } from "react";
import "./RouteFormWithNodes.css";
import { SpatialUtils } from "../../utils/spatialUtils";

const RouteFormWithNodes = ({
  onSave,
  onCancel,
  isVisible,
  route = null,
  isEditing = false,
  mapInstance = null,
  existingRoutes = [],
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

  // Estados para nodos existentes
  const [existingNodes, setExistingNodes] = useState([]);
  const [selectedExistingNode, setSelectedExistingNode] = useState(null);
  const [showNodesPanel, setShowNodesPanel] = useState(false);

  // FUNCIÓN handleInputChange AGREGADA
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Verificar si el mapa está disponible
  useEffect(() => {
    if (mapInstance && typeof window !== "undefined" && window.L) {
      setMapAvailable(true);
    } else {
      setMapAvailable(false);
    }
  }, [mapInstance]);

  // Cargar nodos existentes de las rutas
  useEffect(() => {
    if (existingRoutes.length > 0) {
      const nodes = extractNodesFromRoutes(existingRoutes);
      setExistingNodes(nodes);
      console.log(`${nodes.length} nodos existentes detectados`);
    }
  }, [existingRoutes]);

  // Extraer nodos de rutas existentes
  const extractNodesFromRoutes = (routes) => {
    const allPoints = [];

    routes.forEach((route) => {
      if (route.puntos_ruta && Array.isArray(route.puntos_ruta)) {
        route.puntos_ruta.forEach((punto) => {
          if (punto.coordenadas && punto.coordenadas.coordinates) {
            const [lng, lat] = punto.coordenadas.coordinates;
            allPoints.push({
              id: `route-${route.id}-point-${punto.orden}`,
              routeId: route.id,
              routeName: route.nombre,
              puntoId: punto.id,
              orden: punto.orden,
              tipo_punto: punto.tipo_punto,
              coordenadas: { lng, lat },
              nombre: punto.nombre_punto || `Punto ${punto.orden}`,
              es_inicio: punto.tipo_punto === "inicio",
              es_fin: punto.tipo_punto === "fin",
            });
          }
        });
      }
    });

    return allPoints;
  };

  // Buscar nodos cercanos al punto actual
  const findNearbyNodes = useCallback(
    (lat, lng, toleranceMeters = 15) => {
      if (existingNodes.length === 0) return [];

      const nearby = existingNodes.filter((node) => {
        const distance = SpatialUtils.calculateDistance(
          { lat, lng },
          { lat: node.coordenadas.lat, lng: node.coordenadas.lng }
        );
        return distance <= toleranceMeters;
      });

      return nearby.sort((a, b) => {
        const distA = SpatialUtils.calculateDistance(
          { lat, lng },
          { lat: a.coordenadas.lat, lng: a.coordenadas.lng }
        );
        const distB = SpatialUtils.calculateDistance(
          { lat, lng },
          { lat: b.coordenadas.lat, lng: b.coordenadas.lng }
        );
        return distA - distB;
      });
    },
    [existingNodes]
  );

  useEffect(() => {
    if (isVisible) {
      if (route && isEditing) {
        setFormData({
          nombre: route.nombre || "",
          tipo: route.tipo || "peatonal",
          distancia: route.distancia || 0,
          tiempo_estimado: route.tiempo_estimado || 0,
          geometria: route.geometria || null,
          puntos_ruta: route.puntos_ruta || [],
        });
        console.log(" Cargando ruta existente para edición");
      } else {
        setFormData({
          nombre: "",
          tipo: "peatonal",
          distancia: 0,
          tiempo_estimado: 0,
          geometria: null,
          puntos_ruta: [], // ← VACÍO
        });
        clearTempMarkers();
        removeMapClickListener();
        setSelectedExistingNode(null);
        setShowNodesPanel(false);
        console.log("Formulario reiniciado - lista de puntos vacía");
      }
    }
  }, [isVisible, route, isEditing]);

  // Tecla ESC para finalizar selección
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
      setSelectedExistingNode(null);
      setShowNodesPanel(false);
    }
  }, [isVisible]);

  useEffect(() => {
    if (formData.puntos_ruta.length >= 2) {
      const distancia = calculateTotalDistance(formData.puntos_ruta);
      const tiempo_estimado = Math.round(distancia / 80);

      setFormData((prev) => ({
        ...prev,
        distancia,
        tiempo_estimado,
      }));

      console.log("Distancia actualizada automáticamente:", distancia + "m");
    } else if (formData.puntos_ruta.length < 2) {
      // Resetear si hay menos de 2 puntos
      setFormData((prev) => ({
        ...prev,
        distancia: 0,
        tiempo_estimado: 0,
      }));
    }
  }, [formData.puntos_ruta]);

  // Agregar punto con detección de nodos existentes
  const addPointToRoute = useCallback(
    (lat, lng) => {
      if (!mapInstance) return;

      setFormData((prev) => {
        const puntoCount = prev.puntos_ruta.length;

        // Buscar nodos existentes cercanos
        const nearbyNodes = findNearbyNodes(lat, lng);

        let puntoFinal;
        let markerColor = "#95a5a6"; // Color por defecto (gris)

        if (nearbyNodes.length > 0 && !selectedExistingNode) {
          // Mostrar panel de selección de nodos
          setSelectedExistingNode({
            coordenadas: { lat, lng },
            nearbyNodes: nearbyNodes,
          });
          setShowNodesPanel(true);

          // No agregar el punto todavía, esperar selección
          return prev;
        }

        if (selectedExistingNode && selectedExistingNode.selectedNode) {
          // Usar nodo existente seleccionado
          puntoFinal = {
            ...selectedExistingNode.selectedNode,
            lat: selectedExistingNode.selectedNode.coordenadas.lat,
            lng: selectedExistingNode.selectedNode.coordenadas.lng,
            nombre: selectedExistingNode.selectedNode.nombre,
            tipo_punto: "intermedio",
            es_nodo_existente: true,
            id_punto_existente: selectedExistingNode.selectedNode.puntoId,
          };
          markerColor = "#9b59b6"; // Púrpura para nodos existentes
        } else {
          // Crear nuevo punto
          puntoFinal = {
            lat,
            lng,
            nombre: `Punto ${puntoCount + 1}`,
            tipo_punto: "intermedio",
            es_nodo_existente: false,
          };
        }

        // Crear marcador
        const marker = window.L.marker([puntoFinal.lat, puntoFinal.lng], {
          icon: window.L.divIcon({
            html: `
              <div style="
                background-color: ${markerColor}; 
                width: 18px; 
                height: 18px; 
                border-radius: 50%; 
                border: 3px solid white; 
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                ${
                  puntoFinal.es_nodo_existente
                    ? "animation: pulse 2s infinite;"
                    : ""
                }
              "></div>
            `,
            iconSize: [24, 24],
            className: `temp-route-point ${
              puntoFinal.es_nodo_existente ? "existing-node" : ""
            }`,
          }),
        }).addTo(mapInstance);

        // Popup informativo
        let popupContent = `
          <div style="text-align: center;">
            <strong>${puntoFinal.nombre}</strong><br>
            Lat: ${puntoFinal.lat.toFixed(6)}<br>
            Lng: ${puntoFinal.lng.toFixed(6)}<br>
            <small>Punto ${puntoCount + 1}</small>
        `;

        if (puntoFinal.es_nodo_existente) {
          popupContent += `
            <br><small style="color: #9b59b6; font-weight: bold;">
              Nodo Existente
            </small>
          `;
        }

        popupContent += `</div>`;

        marker.bindPopup(popupContent).openPopup();
        setTempMarkers((prevMarkers) => [...prevMarkers, marker]);

        // Preparar datos para la ruta
        const updatedPuntos = [
          ...prev.puntos_ruta,
          {
            orden: puntoCount + 1,
            tipo_punto: puntoFinal.tipo_punto,
            descripcion: `${puntoFinal.nombre} (${puntoFinal.lat.toFixed(
              4
            )}, ${puntoFinal.lng.toFixed(4)})`,
            nombre_punto: puntoFinal.nombre,
            coordenadas: {
              type: "Point",
              coordinates: [puntoFinal.lng, puntoFinal.lat],
            },
            es_nodo_existente: puntoFinal.es_nodo_existente,
            id_punto_existente: puntoFinal.id_punto_existente,
          },
        ];

        console.log(
          `Punto ${puntoCount + 1} agregado. ${
            puntoFinal.es_nodo_existente ? "Nodo existente" : "Nuevo punto"
          }. Total: ${updatedPuntos.length}`
        );

        // Limpiar selección de nodo existente
        setSelectedExistingNode(null);
        setShowNodesPanel(false);

        return {
          ...prev,
          puntos_ruta: updatedPuntos,
        };
      });
    },
    [mapInstance, findNearbyNodes, selectedExistingNode]
  );

  // Seleccionar nodo existente
  const handleSelectExistingNode = (node) => {
    if (!selectedExistingNode) return;

    setSelectedExistingNode((prev) => ({
      ...prev,
      selectedNode: node,
    }));

    // Cerrar panel y agregar el punto con el nodo seleccionado
    setShowNodesPanel(false);

    // Agregar el punto usando las coordenadas del nodo existente
    setTimeout(() => {
      addPointToRoute(node.coordenadas.lat, node.coordenadas.lng);
    }, 100);
  };

  // Cancelar selección de nodo existente
  const handleCancelNodeSelection = () => {
    setSelectedExistingNode(null);
    setShowNodesPanel(false);

    // Si hay coordenadas temporales, agregar como punto nuevo
    if (selectedExistingNode?.coordenadas) {
      addPointToRoute(
        selectedExistingNode.coordenadas.lat,
        selectedExistingNode.coordenadas.lng
      );
    }
  };

  // Activar selección en mapa
  const handleActivateMapSelection = () => {
    if (!mapAvailable || !mapInstance) return;

    console.log("ACTIVANDO SELECCIÓN - Con detección de nodos existentes");
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

    console.log("Mapa listo para recibir clics con detección de nodos");
  };

  // Calcular distancia total
  const calculateTotalDistance = (puntos) => {
    if (puntos.length < 2) return 0;
    try {
      const coordinates = puntos.map((p) => p.coordenadas.coordinates);
      const distancia = SpatialUtils.calculateRouteLength(coordinates);
      const distanciaRedondeada = Math.round(distancia);
      console.log(`📏 Distancia calculada con Turf: ${distanciaRedondeada}m`);
      return distanciaRedondeada;
    } catch (error) {
      console.error("Error calculando distancia con Turf:", error);
      let total = 0;
      for (let i = 0; i < puntos.length - 1; i++) {
        const [lngA, latA] = puntos[i].coordenadas.coordinates;
        const [lngB, latB] = puntos[i + 1].coordenadas.coordinates;
        total += SpatialUtils.calculateDistance(
          { lat: latA, lng: lngA },
          { lat: latB, lng: lngB }
        );
      }
      return Math.round(total);
    }
  };

  // Finalizar con ESC
  const handleFinishWithESC = () => {
    console.log("⏹️ FINALIZANDO con ESC. Puntos:", formData.puntos_ruta.length);

    if (formData.puntos_ruta.length < 2) {
      console.log("Se necesitan al menos 2 puntos");
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

    // Crear geometría y calcular distancia/tiempo con Turf
    const coordinates = updatedPuntos.map((p) => p.coordenadas.coordinates);
    const geometria = {
      type: "LineString",
      coordinates: coordinates,
    };

    const distancia = calculateTotalDistance(updatedPuntos);
    const tiempo_estimado = Math.round(distancia / 80);

    console.log("Datos calculados con Turf:", {
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
          : punto.es_nodo_existente
          ? "#9b59b6"
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
          <small>${punto.tipo_punto} ${
        punto.es_nodo_existente ? "" : ""
      }</small>
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.puntos_ruta.length < 2) {
      console.log("Se necesitan al menos 2 puntos para crear una ruta");
      alert("Se necesitan al menos 2 puntos para crear una ruta");
      return;
    }

    const coordinates = formData.puntos_ruta.map(
      (p) => p.coordenadas.coordinates
    );
    if (!SpatialUtils.isValidLineString(coordinates)) {
      alert("La geometría de la ruta no es válida");
      return;
    }

    let geometriaParaEnviar = formData.geometria;
    if (!geometriaParaEnviar && formData.puntos_ruta.length >= 2) {
      geometriaParaEnviar = {
        type: "LineString",
        coordinates: coordinates,
      };
    }

    const nombreParaEnviar =
      formData.nombre.trim() ||
      `Ruta ${new Date().toLocaleDateString(
        "es-ES"
      )} ${new Date().toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;

    let distanciaParaEnviar = formData.distancia;
    let tiempoParaEnviar = formData.tiempo_estimado;

    if (!distanciaParaEnviar && formData.puntos_ruta.length >= 2) {
      distanciaParaEnviar = calculateTotalDistance(formData.puntos_ruta);
      tiempoParaEnviar = Math.round(distanciaParaEnviar / 80);
    }

    const datosParaGuardar = {
      ...formData,
      nombre: nombreParaEnviar,
      distancia: distanciaParaEnviar,
      tiempo_estimado: tiempoParaEnviar,
      geometria: geometriaParaEnviar,
      puntos_ruta: formData.puntos_ruta,
    };

    console.log("Enviando al backend:", {
      nombre: datosParaGuardar.nombre,
      tipo: datosParaGuardar.tipo,
      distancia: datosParaGuardar.distancia,
      puntos: datosParaGuardar.puntos_ruta.length,
    });

    clearTempMarkers();
    removeMapClickListener();
    onSave(datosParaGuardar);
  };

  const handleCancel = () => {
    clearTempMarkers();
    removeMapClickListener();
    setSelectedExistingNode(null);
    setShowNodesPanel(false);

    // OPCIONAL: Resetear el estado aquí también
    if (!isEditing) {
      setFormData({
        nombre: "",
        tipo: "peatonal",
        distancia: 0,
        tiempo_estimado: 0,
        geometria: null,
        puntos_ruta: [], // ← LIMPIAR PUNTOS
      });
    }

    onCancel();
  };

  if (!isVisible) return null;
  if (selectionActive && !showNodesPanel) return null;

  // Panel de selección de nodos existentes
  if (showNodesPanel && selectedExistingNode) {
    return (
      <div className="node-selection-overlay">
        <div className="node-selection-panel">
          <div className="node-selection-header">
            <h3>Nodos Existentes Cercanos</h3>
            <button className="close-btn" onClick={handleCancelNodeSelection}>
              ×
            </button>
          </div>

          <div className="node-selection-info">
            <p>
              Se detectaron {selectedExistingNode.nearbyNodes.length} nodos
              existentes cerca de esta ubicación.
            </p>
            <p>
              <strong>¿Quieres usar uno de estos nodos existentes?</strong>
            </p>
          </div>

          <div className="existing-nodes-list">
            {selectedExistingNode.nearbyNodes.map((node, index) => (
              <div
                key={node.id}
                className="existing-node-item"
                onClick={() => handleSelectExistingNode(node)}>
                <div className="node-color"></div>
                <div className="node-info">
                  <div className="node-name">{node.nombre}</div>
                  <div className="node-details">
                    De: {node.routeName} • {node.tipo_punto}
                  </div>
                  <div className="node-coords">
                    {node.coordenadas.lat.toFixed(6)},{" "}
                    {node.coordenadas.lng.toFixed(6)}
                  </div>
                </div>
                <div className="node-action">
                  <button className="select-node-btn">Usar este nodo</button>
                </div>
              </div>
            ))}
          </div>

          <div className="node-selection-actions">
            <button
              className="cancel-node-btn"
              onClick={handleCancelNodeSelection}>
              Crear nuevo punto
            </button>
          </div>
        </div>

        <style>
          {`
            .node-selection-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0,0,0,0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 10000;
            }
            
            .node-selection-panel {
              background: white;
              border-radius: 10px;
              padding: 20px;
              max-width: 500px;
              max-height: 80vh;
              overflow-y: auto;
              box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            }
            
            .node-selection-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 15px;
              border-bottom: 1px solid #eee;
              padding-bottom: 10px;
            }
            
            .node-selection-header h3 {
              margin: 0;
              color: #2c3e50;
            }
            
            .node-selection-info {
              margin-bottom: 15px;
              padding: 10px;
              background: #f8f9fa;
              border-radius: 5px;
            }
            
            .existing-nodes-list {
              max-height: 300px;
              overflow-y: auto;
              margin-bottom: 15px;
            }
            
            .existing-node-item {
              display: flex;
              align-items: center;
              padding: 10px;
              border: 1px solid #e0e0e0;
              border-radius: 5px;
              margin-bottom: 8px;
              cursor: pointer;
              transition: all 0.2s;
            }
            
            .existing-node-item:hover {
              background: #f0f0f0;
              border-color: #9b59b6;
            }
            
            .node-color {
              font-size: 20px;
              margin-right: 10px;
            }
            
            .node-info {
              flex: 1;
            }
            
            .node-name {
              font-weight: bold;
              color: #2c3e50;
            }
            
            .node-details {
              font-size: 12px;
              color: #7f8c8d;
            }
            
            .node-coords {
              font-size: 11px;
              color: #95a5a6;
              font-family: monospace;
            }
            
            .select-node-btn {
              background: #9b59b6;
              color: white;
              border: none;
              padding: 6px 12px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 12px;
            }
            
            .node-selection-actions {
              text-align: center;
            }
            
            .cancel-node-btn {
              background: #95a5a6;
              color: white;
              border: none;
              padding: 8px 16px;
              border-radius: 4px;
              cursor: pointer;
            }
            
            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.1); }
              100% { transform: scale(1); }
            }
          `}
        </style>
      </div>
    );
  }

  // Interfaz principal del formulario
  return (
    <div className="route-form-overlay">
      <div className="route-form-container">
        <div className="route-form-header">
          <h3>
            <span className="material-icons">
              {isEditing ? "edit_road" : "add_road"}
            </span>
            {isEditing ? "Editar Ruta" : "Crear Ruta"}
          </h3>
          <button className="close-btn" onClick={handleCancel}>
            <span className="material-icons">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="route-form">
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
              <option value="accesible">Accesible</option>
              <option value="emergencia">Emergencia</option>
              <option value="peatonal">Peatonal</option>
              <option value="rapida">Rápida</option>
              <option value="vehicular">Vehicular</option>
            </select>
          </div>

          <div className="route-selection-section">
            <h4>
              <span className="material-icons">map</span>
              Seleccionar Puntos en el Mapa
            </h4>

            {existingNodes.length > 0 && (
              <div className="nodes-info">
                <p style={{ color: "#9b59b6", fontWeight: "bold" }}>
                  <span className="material-icons">account_tree</span>
                  {existingNodes.length} nodos existentes detectados
                </p>
                <p style={{ fontSize: "12px", color: "#7f8c8d" }}>
                  Al hacer clic cerca de un nodo existente, podrás reutilizarlo
                </p>
              </div>
            )}

            {!mapAvailable && (
              <div className="map-unavailable-warning">
                El mapa no está disponible
              </div>
            )}

            <div className="selection-instructions">
              <p>
                <span className="material-icons">looks_one</span>
                <strong>Primero selecciona los puntos en el mapa</strong>
              </p>
              <p>
                <span className="material-icons">looks_two</span>
                Haz clic en "Activar Selección"
              </p>
              <p>
                <span className="material-icons">looks_3</span>
                Haz varios clics en el mapa para agregar puntos
              </p>
              <p>
                <span className="material-icons">looks_4</span>
                Presiona <strong>ESC</strong> para finalizar
              </p>
              <p style={{ color: "#9b59b6", fontWeight: "bold" }}>
                <span className="material-icons">new_releases</span>
                <strong>NUEVO:</strong> Detección automática de nodos existentes
              </p>
            </div>

            <div className="map-selection-controls">
              <button
                type="button"
                className="select-btn"
                onClick={handleActivateMapSelection}
                disabled={!mapAvailable || selectionActive}>
                <span className="material-icons">
                  {selectionActive ? "location_searching" : "my_location"}
                </span>
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
                  <span className="material-icons">undo</span>
                  Eliminar Último
                </button>

                <button
                  type="button"
                  className="clear-btn"
                  onClick={handleClearPoints}
                  disabled={formData.puntos_ruta.length === 0}>
                  <span className="material-icons">clear_all</span>
                  Limpiar Todos
                </button>
              </div>
            </div>

            <div className="points-counter">
              <span className="material-icons">location_on</span>
              Puntos seleccionados:{" "}
              <strong>{formData.puntos_ruta.length}</strong>
              {formData.puntos_ruta.length >= 2 && (
                <span style={{ color: "#27ae60", marginLeft: "10px" }}>
                  <span className="material-icons">straighten</span>
                  {formData.distancia}m calculados
                </span>
              )}
            </div>

            {formData.puntos_ruta.length > 0 && (
              <div className="selected-points">
                <h5>Puntos:</h5>
                {formData.puntos_ruta.map((p, i) => (
                  <div key={i} className="point-item">
                    <span>
                      <span className="material-icons">location_on</span>
                      {i + 1}. {p.nombre_punto}
                    </span>
                    <span>
                      ({p.coordenadas.coordinates[1].toFixed(4)},{" "}
                      {p.coordenadas.coordinates[0].toFixed(4)})
                    </span>
                    <span> - {p.tipo_punto}</span>
                    {p.es_nodo_existente && (
                      <span style={{ color: "#9b59b6" }}>
                        <span className="material-icons">account_tree</span>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {formData.geometria && (
            <div className="route-details">
              <h4>
                <span className="material-icons">analytics</span>
                Detalles de Ruta (Turf.js)
              </h4>
              <div className="route-stats">
                <div className="stat-item">
                  <span className="stat-label">Distancia:</span>
                  <span className="stat-value">{formData.distancia} m</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Tiempo estimado:</span>
                  <span className="stat-value">
                    {formData.tiempo_estimado} min
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
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancelar
            </button>
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

export default RouteFormWithNodes;
