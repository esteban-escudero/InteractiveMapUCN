// components/buildings/RoomManagement/components/BuildingSelection.jsx
import React from "react";

const BuildingSelection = ({
  buildings,
  selectedBuildingId,
  onBuildingChange,
  isEditing,
  selectedBuilding,
}) => {
  return (
    <div className="building-selection">
      <label>Edificio:</label>
      <select
        value={selectedBuildingId}
        onChange={(e) => onBuildingChange(e.target.value)}
        required
        disabled={isEditing || (selectedBuilding && !isEditing)}>
        <option value="">Selecciona un edificio</option>
        {buildings.map((building) => (
          <option key={building.id} value={building.id}>
            {building.nombre}
          </option>
        ))}
      </select>
    </div>
  );
};

export default BuildingSelection;
