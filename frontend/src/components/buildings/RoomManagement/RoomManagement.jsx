// components/buildings/RoomManagement/RoomManagement.jsx
import React from "react";
import { useRoomManagement } from "./hooks/useRoomManagement";
import RoomManagementHeader from "./components/RoomManagementHeader";
import BuildingSelection from "./components/BuildingSelection";
import RoomList from "./components/RoomList";
import RoomActions from "./components/RoomActions";
import "./RoomManagement.css";

const RoomManagement = ({
  buildings,
  onSaveRooms,
  onUpdateRoom,
  onDeleteRoom,
  onClose,
  existingRooms = [],
  selectedBuilding = null,
}) => {
  const {
    selectedBuildingId,
    setSelectedBuildingId,
    selectedBuildingData,
    rooms,
    isEditing,
    TIPOS_SALA,
    addRoom,
    removeRoom,
    updateRoom,
    handleSave,
    handleUpdate,
    handleDelete,
  } = useRoomManagement({
    buildings,
    onSaveRooms,
    onUpdateRoom,
    onDeleteRoom,
    onClose,
    existingRooms,
    selectedBuilding,
  });

  return (
    <div className="room-management-overlay">
      <div className="room-management-container">
        <RoomManagementHeader isEditing={isEditing} onClose={onClose} />

        <BuildingSelection
          buildings={buildings}
          selectedBuildingId={selectedBuildingId}
          onBuildingChange={setSelectedBuildingId}
          isEditing={isEditing}
          selectedBuilding={selectedBuilding}
        />

        <RoomList
          rooms={rooms}
          isEditing={isEditing}
          TIPOS_SALA={TIPOS_SALA}
          onAddRoom={addRoom}
          onRemoveRoom={removeRoom}
          onUpdateRoom={updateRoom}
        />

        <RoomActions
          isEditing={isEditing}
          selectedBuildingId={selectedBuildingId}
          rooms={rooms}
          onSave={handleSave}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onClose={onClose}
        />
      </div>
    </div>
  );
};

export default RoomManagement;
