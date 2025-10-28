import { useState } from "react";

/**
 * Hook personalizado para gestionar las operaciones de edificios
 */
export const useBuildingManagement = (loadBuildings, deleteBuilding) => {
  const [showBuildingForm, setShowBuildingForm] = useState(false);
  const [showBuildingList, setShowBuildingList] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [capturedCoords, setCapturedCoords] = useState(null);

  const openAddBuilding = () => {
    setEditingBuilding(null);
    setCapturedCoords(null);
    setShowBuildingForm(true);
    console.log("➕ Abriendo formulario para crear edificio");
  };

  const openEditBuilding = (building) => {
    setEditingBuilding(building);
    setShowBuildingForm(true);
    setShowBuildingList(false);
    console.log("✏️ Editando edificio:", building.nombre);
  };

  const openBuildingList = () => {
    setShowBuildingList(true);
    console.log("📋 Abriendo lista de edificios");
  };

  const closeBuildingForm = () => {
    setShowBuildingForm(false);
    setEditingBuilding(null);
    setCapturedCoords(null);
  };

  const closeBuildingList = () => {
    setShowBuildingList(false);
  };

  const handleCoordinatesCaptured = (coords) => {
    setCapturedCoords(coords);
    setEditingBuilding(null);
    setShowBuildingForm(true);
    console.log("📍 Coordenadas capturadas para nuevo edificio:", coords);
  };

  const clearCapturedCoordinates = () => {
    setCapturedCoords(null);
  };

  const saveBuilding = async (buildingData) => {
    try {
      if (editingBuilding) {
        const id =
          editingBuilding.id ||
          editingBuilding._id ||
          editingBuilding.id_edificio;
        await buildingService.updateBuilding(id, buildingData);
        alert("✅ Edificio actualizado");
        console.log("✅ Edificio actualizado:", id);
      } else {
        await buildingService.createBuilding(buildingData);
        alert("✅ Edificio creado");
        console.log("✅ Edificio creado");
      }

      await loadBuildings();
      closeBuildingForm();
    } catch (error) {
      console.error("❌ Error al guardar edificio:", error);
      throw error;
    }
  };

  const handleDeleteBuilding = async (building) => {
    try {
      const id = building.id || building._id || building.id_edificio;
      await deleteBuilding(id);
      console.log("🗑️ Edificio eliminado:", id);
    } catch (error) {
      console.error("❌ Error al eliminar edificio:", error);
      throw error;
    }
  };

  return {
    // State
    showBuildingForm,
    showBuildingList,
    editingBuilding,
    capturedCoords,
    // Actions
    openAddBuilding,
    openEditBuilding,
    openBuildingList,
    closeBuildingForm,
    closeBuildingList,
    handleCoordinatesCaptured,
    clearCapturedCoordinates,
    saveBuilding,
    handleDeleteBuilding,
  };
};
