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
      {/* Eliminamos el header externo ya que RoomFields tiene su propio header interno */}
      <RoomFields
        room={room}
        index={index}
        TIPOS_SALA={TIPOS_SALA}
        onUpdateRoom={onUpdateRoom}
        isEditing={isEditing}
        roomsCount={roomsCount}
        onRemoveRoom={onRemoveRoom}
      />
    </div>
  );
};

export default RoomForm;
