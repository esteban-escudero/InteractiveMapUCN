// components/buildings/BuildingList/BuildingList.jsx
import React from "react";
import { useBuildingList } from "./hooks/useBuildingList";
import Notification from "../../ui/Notification/UINotification";
import BuildingListHeader from "./components/BuildingListHeader";
import BuildingListFooter from "./components/BuildingListFooter";
import EmptyState from "./components/EmptyState";
import BuildingCard from "./components/BuildingCard";
import "./BuildingList.css";

function BuildingList({
  buildings,
  onEditBuilding,
  onDeleteBuilding,
  onClose,
  onEditRoom,
  onCreateRooms,
  onDeleteRoom,
  onReload,
}) {
  console.log("🏢 BuildingList recibió:", buildings.length, "edificios");

  const {
    deletingId,
    expandedBuilding,
    deletingRoomId,
    notification,
    hideNotification,
    handleDeleteBuilding,
    toggleBuildingExpansion,
    handleCreateRooms,
    handleEditRoom,
    handleDeleteRoom,
  } = useBuildingList({
    buildings,
    onDeleteBuilding,
    onEditRoom,
    onCreateRooms,
    onDeleteRoom,
    onReload,
    onClose,
  });

  return (
    <div className="building-list-overlay">
      {/* Notificación Global */}
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
          duration={4000}
          position="top-right"
        />
      )}

      <div className="building-list-modal">
        <BuildingListHeader onClose={onClose} />

        <div className="building-list-content">
          {buildings.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="buildings-grid">
              {buildings.map((building) => (
                <BuildingCard
                  key={building.id || building._id || building.id_edificio}
                  building={building}
                  isExpanded={
                    expandedBuilding ===
                    (building.id || building._id || building.id_edificio)
                  }
                  isDeleting={
                    deletingId ===
                    (building.id || building._id || building.id_edificio)
                  }
                  deletingRoomId={deletingRoomId}
                  onEditBuilding={onEditBuilding}
                  onDeleteBuilding={handleDeleteBuilding}
                  onToggleExpansion={toggleBuildingExpansion}
                  onCreateRooms={handleCreateRooms}
                  onEditRoom={handleEditRoom}
                  onDeleteRoom={handleDeleteRoom}
                />
              ))}
            </div>
          )}
        </div>

        <BuildingListFooter buildingCount={buildings.length} />
      </div>
    </div>
  );
}

export default BuildingList;
