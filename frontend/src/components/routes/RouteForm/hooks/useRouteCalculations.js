// components/routes/RouteForm/hooks/useRouteCalculations.js
import { useCallback } from "react";
import { SpatialUtils } from "../../../../utils/spatialUtils";

export const useRouteCalculations = ({
  formData,
  setFormData,
  updateMarkersWithColors,
  drawRouteLine,
  handleDeactivateMapSelection,
}) => {
  const calculateTotalDistance = useCallback((puntos) => {
    if (puntos.length < 2) return 0;

    try {
      const coordinates = puntos.map((p) => p.coordenadas.coordinates);
      const distancia = SpatialUtils.calculateRouteLength(coordinates);
      return Math.round(distancia);
    } catch (error) {
      console.error("Error calculando distancia con Turf:", error);
      return calculateDistanceManual(puntos);
    }
  }, []);

  const calculateDistanceManual = (puntos) => {
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
  };

  const handleFinishWithESC = useCallback(() => {
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

    // Crear geometría y calcular distancia/tiempo
    const coordinates = updatedPuntos.map((p) => p.coordenadas.coordinates);
    const geometria = {
      type: "LineString",
      coordinates: coordinates,
    };

    const distancia = calculateTotalDistance(updatedPuntos);
    const tiempo_estimado = Math.round(distancia / 80);

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
  }, [
    formData.puntos_ruta,
    setFormData,
    calculateTotalDistance,
    updateMarkersWithColors,
    drawRouteLine,
    handleDeactivateMapSelection,
  ]);

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

  return {
    calculateTotalDistance,
    handleFinishWithESC,
  };
};
