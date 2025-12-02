// components/buildings/BuildingList/BuildingList.jsx
import React, { useState } from "react";
import { useBuildingList } from "./hooks/useBuildingList";
import Notification from "../../ui/Notification/UINotification";
import BuildingListHeader from "./components/BuildingListHeader";
import BuildingListFooter from "./components/BuildingListFooter";
import EmptyState from "./components/EmptyState";
import BuildingCard from "./components/BuildingCard";
import SearchBar from "./components/SearchBar";
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
  console.log("BuildingList recibió:", buildings.length, "edificios");

  // Estado para la búsqueda
  const [searchTerm, setSearchTerm] = useState("");

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
    handleEditBuilding,
  } = useBuildingList({
    buildings,
    onDeleteBuilding,
    onEditRoom,
    onEditBuilding,
    onCreateRooms,
    onDeleteRoom,
    onReload,
    onClose,
  });

  // Filtrar edificios basándose en el término de búsqueda
  const filteredBuildings = buildings.filter((building) => {
    const buildingName = building.nombre || building.name || "";
    return buildingName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

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
        <BuildingListHeader onClose={onClose}>
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
          />
        </BuildingListHeader>

        <div className="building-list-content">
          {filteredBuildings.length === 0 ? (
            searchTerm ? (
              <div className="empty-state">
                <span className="material-icons empty-icon">search_off</span>
                <p>No se encontraron edificios que coincidan con "{searchTerm}"</p>
              </div>
            ) : (
              <EmptyState />
            )
          ) : (
            <div className="buildings-grid">
              {filteredBuildings.map((building) => (
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
                  onEditBuilding={handleEditBuilding}
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

        <BuildingListFooter buildingCount={filteredBuildings.length} />
      </div>
    </div>
  );
}

export default BuildingList;
