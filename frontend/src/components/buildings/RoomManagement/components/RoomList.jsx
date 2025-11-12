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
    <div className="rooms-list">
      <div className="rooms-header">
        <h4>{isEditing ? "Editando Sala" : "Salas a Agregar"}</h4>
        {!isEditing && (
          <button type="button" onClick={onAddRoom} className="add-room-btn">
            + Agregar Sala
          </button>
        )}
      </div>

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
  );
};

export default RoomList;
