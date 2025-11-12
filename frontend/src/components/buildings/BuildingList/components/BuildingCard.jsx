// components/buildings/BuildingList/components/BuildingCard.jsx
import React from "react";
import RoomSection from "./RoomSection";

const BuildingCard = ({
  building,
  isExpanded,
  isDeleting,
  deletingRoomId,
  onEditBuilding,
  onDeleteBuilding,
  onToggleExpansion,
  onCreateRooms,
  onEditRoom,
  onDeleteRoom,
}) => {
  const buildingId = building.id || building._id || building.id_edificio;
  const salas = building.salas || [];

  return (
    <div className={`building-card ${isExpanded ? "expanded" : ""}`}>
      <div className="building-info">
        <div className="building-header">
          <h3>{building.nombre}</h3>
          <button
            className="expand-btn"
            onClick={() => onToggleExpansion(buildingId)}>
            {isExpanded ? "▲" : "▼"}
          </button>
        </div>
        <p className="building-description">{building.descripcion}</p>
        <div className="building-meta">
          <span className="building-type">{building.tipo || "Sin tipo"}</span>
          <span className="rooms-count">
            Salas Registradas: {salas.length} sala
            {salas.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Sección de Salas (expandible) */}
      {isExpanded && (
        <RoomSection
          building={building}
          salas={salas}
          deletingRoomId={deletingRoomId}
          onCreateRooms={onCreateRooms}
          onEditRoom={onEditRoom}
          onDeleteRoom={onDeleteRoom}
        />
      )}

      <div className="building-actions">
        <button
          className="edit-btn"
          onClick={() => onEditBuilding(building)}
          disabled={isDeleting}>
          <span className="material-icons">edit</span>
          Editar
        </button>
        <button
          className="manage-rooms-btn"
          onClick={() => onToggleExpansion(buildingId)}>
          {isExpanded ? "▲ Ocultar" : "▼ Ver"} Salas
        </button>
        <button
          className="delete-btn"
          onClick={() => onDeleteBuilding(building)}
          disabled={isDeleting}>
          {isDeleting ? "Eliminando..." : "Eliminar"}
        </button>
      </div>
    </div>
  );
};

export default BuildingCard;
