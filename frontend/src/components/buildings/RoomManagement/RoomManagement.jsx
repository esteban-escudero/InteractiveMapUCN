// components/buildings/RoomManagement/RoomManagement.jsx
import React from "react";
import { useRoomManagement } from "./hooks/useRoomManagement";
import { useNotification } from "hooks/common/useNotification"; // <- Importar el hook
import RoomManagementHeader from "./components/RoomManagementHeader";
import BuildingSelection from "./components/BuildingSelection";
import RoomList from "./components/RoomList";
import RoomActions from "./components/RoomActions";
import UINotification from "components/ui/Notification/UINotification"; // <- Importar el componente
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
  console.log("📋 RoomManagement recibió:", {
    existingRooms,
    selectedBuilding,
    existingRoomsLength: existingRooms.length,
  });
  // Usar el hook de notificaciones
  const { notification, showUINotification, hideNotification } =
    useNotification();

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
    showNotification: showUINotification, // <- Pasar la función al hook
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

        {/* Componente de notificación */}
        {notification.show && (
          <UINotification
            message={notification.message}
            type={notification.type}
            onClose={hideNotification}
            duration={4000}
            position="top-right"
          />
        )}
      </div>
    </div>
  );
};

export default RoomManagement;
