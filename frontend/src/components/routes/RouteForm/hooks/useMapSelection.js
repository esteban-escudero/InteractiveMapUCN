// components/routes/RouteForm/hooks/useMapSelection.js
import { useState, useEffect, useCallback } from "react";
import { SpatialUtils } from "../../../../utils/spatialUtils";

export const useMapSelection = ({
  mapInstance,
  formData,
  setFormData,
  findNearbyNodes,
  selectedExistingNode,
  setSelectedExistingNode,
  setShowNodesPanel,
}) => {
  const [tempMarkers, setTempMarkers] = useState([]);
  const [tempLine, setTempLine] = useState(null);
  const [selectionActive, setSelectionActive] = useState(false);
  const [mapAvailable, setMapAvailable] = useState(false);
  const [mapClickHandler, setMapClickHandler] = useState(null);

  // Verificar disponibilidad del mapa
  useEffect(() => {
    if (mapInstance && typeof window !== "undefined" && window.L) {
      setMapAvailable(true);
    } else {
      setMapAvailable(false);
    }
  }, [mapInstance]);

  // Manejar tecla ESC
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Escape" && selectionActive) {
        handleFinishSelection();
      }
    };

    if (selectionActive) {
      document.addEventListener("keydown", handleKeyPress);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [selectionActive]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      removeMapClickListener();
      clearTempMarkers();
    };
  }, []);

  const addPointToRoute = useCallback(
    (lat, lng) => {
      if (!mapInstance) return;

      setFormData((prev) => {
        const puntoCount = prev.puntos_ruta.length;
        const nearbyNodes = findNearbyNodes(lat, lng);

        let puntoFinal;
        let markerColor = "#95a5a6";

        // Mostrar panel de selección si hay nodos cercanos
        if (nearbyNodes.length > 0 && !selectedExistingNode) {
          setSelectedExistingNode({
            coordenadas: { lat, lng },
            nearbyNodes: nearbyNodes,
          });
          setShowNodesPanel(true);
          return prev;
        }

        // Usar nodo existente seleccionado
        if (selectedExistingNode && selectedExistingNode.selectedNode) {
          const node = selectedExistingNode.selectedNode;
          puntoFinal = {
            ...node,
            lat: node.coordenadas.lat,
            lng: node.coordenadas.lng,
            nombre: node.nombre,
            tipo_punto: "intermedio",
            es_nodo_existente: true,
            id_punto_existente: node.puntoId,
          };
          markerColor = "#9b59b6";
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
        const marker = createMarker(puntoFinal, markerColor);
        setTempMarkers((prev) => [...prev, marker]);

        // Preparar datos del punto
        const updatedPuntos = [
          ...prev.puntos_ruta,
          createPuntoData(puntoFinal, puntoCount + 1),
        ];

        // Limpiar selección
        setSelectedExistingNode(null);
        setShowNodesPanel(false);

        return {
          ...prev,
          puntos_ruta: updatedPuntos,
        };
      });
    },
    [
      mapInstance,
      findNearbyNodes,
      selectedExistingNode,
      setSelectedExistingNode,
      setShowNodesPanel,
    ]
  );

  const createMarker = (punto, color) => {
    const marker = window.L.marker([punto.lat, punto.lng], {
      icon: window.L.divIcon({
        html: `
          <div style="
            background-color: ${color}; 
            width: 18px; 
            height: 18px; 
            border-radius: 50%; 
            border: 3px solid white; 
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            ${punto.es_nodo_existente ? "animation: pulse 2s infinite;" : ""}
          "></div>
        `,
        iconSize: [24, 24],
        className: `temp-route-point ${
          punto.es_nodo_existente ? "existing-node" : ""
        }`,
      }),
    }).addTo(mapInstance);

    // Popup informativo
    const popupContent = createPopupContent(punto);
    marker.bindPopup(popupContent).openPopup();

    return marker;
  };

  //Mensaje Punto Mapa
  const createPopupContent = (punto) => {
    let content = `
      <div style="text-align: center;">
        <strong>${punto.nombre}</strong><br>
        Lat: ${punto.lat.toFixed(6)}<br>
        Lng: ${punto.lng.toFixed(6)}<br>
        <small>Punto ${formData.puntos_ruta.length + 1}</small>
    `;

    if (punto.es_nodo_existente) {
      content += `
        <br><small style="color: #9b59b6; font-weight: bold;">
          Nodo Existente
        </small>
      `;
    }

    content += `</div>`;
    return content;
  };

  const createPuntoData = (punto, orden) => ({
    orden,
    tipo_punto: punto.tipo_punto,
    descripcion: `${punto.nombre} (${punto.lat.toFixed(4)}, ${punto.lng.toFixed(
      4
    )})`,
    nombre_punto: punto.nombre,
    coordenadas: {
      type: "Point",
      coordinates: [punto.lng, punto.lat],
    },
    es_nodo_existente: punto.es_nodo_existente,
    id_punto_existente: punto.id_punto_existente,
  });

  const handleActivateMapSelection = () => {
    if (!mapAvailable || !mapInstance) return;

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
  };

  const handleDeactivateMapSelection = () => {
    removeMapClickListener();
    setSelectionActive(false);
    if (mapInstance?.getContainer()) {
      mapInstance.getContainer().style.cursor = "";
    }
  };

  const handleFinishSelection = () => {
    if (formData.puntos_ruta.length < 2) {
      handleDeactivateMapSelection();
      return;
    }

    const updatedPuntos = formData.puntos_ruta.map((punto, index) => ({
      ...punto,
      tipo_punto: getTipoPunto(index, formData.puntos_ruta.length),
      descripcion: getDescripcionPunto(
        punto,
        index,
        formData.puntos_ruta.length
      ),
      nombre_punto: getNombrePunto(index, formData.puntos_ruta.length),
    }));

    setFormData((prev) => ({
      ...prev,
      puntos_ruta: updatedPuntos,
    }));

    handleDeactivateMapSelection();
  };

  const getTipoPunto = (index, total) => {
    if (index === 0) return "inicio";
    if (index === total - 1) return "fin";
    return "intermedio";
  };

  const getDescripcionPunto = (punto, index, total) => {
    const tipo = getTipoPunto(index, total);
    const base = `(${punto.coordenadas.coordinates[1].toFixed(
      4
    )}, ${punto.coordenadas.coordinates[0].toFixed(4)})`;

    if (tipo === "inicio") return `Inicio ${base}`;
    if (tipo === "fin") return `Fin ${base}`;
    return `Punto ${index + 1} ${base}`;
  };

  const getNombrePunto = (index, total) => {
    const tipo = getTipoPunto(index, total);
    if (tipo === "inicio") return "Inicio";
    if (tipo === "fin") return "Fin";
    return `Punto ${index + 1}`;
  };

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

  const removeMapClickListener = () => {
    if (mapInstance && mapClickHandler) {
      mapInstance.off("click", mapClickHandler);
      setMapClickHandler(null);
    }
  };

  const updateMarkersWithColors = (puntos) => {
    if (!mapInstance) return;
    clearTempMarkers();

    const newMarkers = puntos.map((punto) => {
      const [lng, lat] = punto.coordenadas.coordinates;
      const color = getMarkerColor(punto);

      const marker = window.L.marker([lat, lng], {
        icon: window.L.divIcon({
          html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
          iconSize: [22, 22],
          className: "route-point-marker",
        }),
      }).addTo(mapInstance);

      marker.bindPopup(createFinalPopupContent(punto, lat, lng));
      return marker;
    });

    setTempMarkers(newMarkers);
  };

  const getMarkerColor = (punto) => {
    if (punto.tipo_punto === "inicio") return "#27ae60";
    if (punto.tipo_punto === "fin") return "#e74c3c";
    if (punto.es_nodo_existente) return "#9b59b6";
    return "#3498db";
  };

  const createFinalPopupContent = (punto, lat, lng) => {
    return `
      <div style="text-align: center;">
        <strong>${punto.nombre_punto}</strong><br>
        Lat: ${lat.toFixed(6)}<br>
        Lng: ${lng.toFixed(6)}<br>
        <small>${punto.tipo_punto}</small>
      </div>
    `;
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

  return {
    tempMarkers,
    tempLine,
    selectionActive,
    mapAvailable,
    handleActivateMapSelection,
    handleDeactivateMapSelection,
    clearTempMarkers,
    removeMapClickListener,
    updateMarkersWithColors,
    drawRouteLine,
    handleFinishSelection,
  };
};
