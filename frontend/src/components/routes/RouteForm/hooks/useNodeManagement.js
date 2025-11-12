import { useState, useEffect, useCallback } from "react";
import { SpatialUtils } from "../../../../utils/spatialUtils";

export const useNodeManagement = ({ existingRoutes }) => {
  const [existingNodes, setExistingNodes] = useState([]);
  const [selectedExistingNode, setSelectedExistingNode] = useState(null);
  const [showNodesPanel, setShowNodesPanel] = useState(false);

  // Cargar nodos existentes
  useEffect(() => {
    if (existingRoutes.length > 0) {
      const nodes = extractNodesFromRoutes(existingRoutes);
      setExistingNodes(nodes);
    }
  }, [existingRoutes]);

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

  const handleSelectExistingNode = (node) => {
    if (!selectedExistingNode) return;

    setSelectedExistingNode((prev) => ({
      ...prev,
      selectedNode: node,
    }));
    setShowNodesPanel(false);
  };

  const handleCancelNodeSelection = () => {
    setSelectedExistingNode(null);
    setShowNodesPanel(false);
  };

  return {
    existingNodes,
    selectedExistingNode,
    showNodesPanel,
    setSelectedExistingNode,
    setShowNodesPanel,
    extractNodesFromRoutes,
    findNearbyNodes,
    handleSelectExistingNode,
    handleCancelNodeSelection,
  };
};
