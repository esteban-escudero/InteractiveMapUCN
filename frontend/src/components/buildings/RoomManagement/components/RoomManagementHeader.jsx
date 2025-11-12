// components/buildings/RoomManagement/components/RoomManagementHeader.jsx
import React from "react";

const RoomManagementHeader = ({ isEditing, onClose }) => {
  return (
    <div className="room-management-header">
      <h3>{isEditing ? "Editar Sala" : "Gestión de Salas"}</h3>
      <button className="close-btn" onClick={onClose}>
        ×
      </button>
    </div>
  );
};

export default RoomManagementHeader;
