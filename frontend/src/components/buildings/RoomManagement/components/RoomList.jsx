// components/buildings/RoomManagement/components/RoomList.jsx
import React from "react";
import RoomForm from "./RoomForm";

const RoomList = ({
  rooms,
  isEditing,
  TIPOS_SALA,
  onAddRoom,
  onRemoveRoom,
  onUpdateRoom,
}) => {
  return (
    <div className="rooms-grid-container">
      <div className="rooms-grid-header">
        <h4 className="rooms-grid-title">
          <span className="material-icons">meeting_room</span>
          {isEditing ? "Editando Sala" : "Salas a Agregar"}
        </h4>
        {!isEditing && (
          <button type="button" onClick={onAddRoom} className="add-room-btn">
            <span className="material-icons">add</span>
            Agregar Sala
          </button>
        )}
      </div>

      <div className="rooms-grid">
        {rooms.map((room, index) => (
          <RoomForm
            key={room.id || index}
            room={room}
            index={index}
            isEditing={isEditing}
            TIPOS_SALA={TIPOS_SALA}
            roomsCount={rooms.length}
            onRemoveRoom={onRemoveRoom}
            onUpdateRoom={onUpdateRoom}
          />
        ))}
      </div>
    </div>
  );
};

export default RoomList;
