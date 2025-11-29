// components/buildings/BuildingList/components/RoomSection.jsx
import React from "react";
import RoomItem from "./RoomItem";

const RoomSection = ({
  building,
  salas,
  deletingRoomId,
  onCreateRooms,
  onEditRoom,
  onDeleteRoom,
}) => {
  return (
    <div className="rooms-section">
      <div className="rooms-header">
        <h4>
          <span className="material-icons">meeting_room</span>
          Salas del Edificio ({salas.length})
        </h4>
        <button
          className="add-room-btn"
          onClick={() => onCreateRooms(building)}>
          <span className="material-icons">add</span>
          Agregar Sala
        </button>
      </div>

      {salas.length === 0 ? (
        <div className="empty-rooms">
          <p>No hay salas registradas en este edificio</p>
          <small>Usa el botón "Agregar Sala" para crear la primera</small>
        </div>
      ) : (
        <div
          className="rooms-list"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1rem",
          }}>
          {salas.map((room) => (
            <RoomItem
              key={room.id}
              room={room}
              isDeleting={deletingRoomId === room.id}
              onEditRoom={onEditRoom}
              onDeleteRoom={onDeleteRoom}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomSection;
