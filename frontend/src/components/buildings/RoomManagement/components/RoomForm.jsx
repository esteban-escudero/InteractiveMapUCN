// components/buildings/RoomManagement/components/RoomForm.jsx
import React from "react";
import RoomFields from "./RoomFields";

const RoomForm = ({
  room,
  index,
  isEditing,
  TIPOS_SALA,
  roomsCount,
  onRemoveRoom,
  onUpdateRoom,
}) => {
  return (
    <div key={room.id || index} className="room-form">
      <div className="room-header">
        <h5>
          {isEditing ? `Editando: ${room.nombre_sala}` : `Sala ${index + 1}`}
          {room.id && <span className="room-id"> (ID: {room.id})</span>}
        </h5>
        {!isEditing && roomsCount > 1 && (
          <button
            type="button"
            onClick={() => onRemoveRoom(index)}
            className="remove-room-btn">
            ✕
          </button>
        )}
      </div>

      <RoomFields
        room={room}
        index={index}
        TIPOS_SALA={TIPOS_SALA}
        onUpdateRoom={onUpdateRoom}
      />
    </div>
  );
};

export default RoomForm;
