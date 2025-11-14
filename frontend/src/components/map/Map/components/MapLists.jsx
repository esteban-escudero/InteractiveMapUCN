/**
 * Componente que agrupa todas las listas del mapa
 */
import React from "react";
import { BuildingList } from "../../../buildings/index.js";
import { RouteList } from "../../../routes/index.js";
import RoomManagement from "../../../buildings/RoomManagement/RoomManagement.jsx";

export const MapLists = ({
  mapState,
  businessHandlers,
  filteredBuildings,
  routes,
  buildings,
  loadBuildings,
  handleRouteClick,
}) => {
  return (
    <>
      {/* Lista de Edificios */}
      {mapState.showBuildingList && (
        <BuildingList
          key={`building-list-${JSON.stringify(
            mapState.filters
          )}-${Date.now()}`}
          buildings={filteredBuildings}
          onEditBuilding={mapState.handleEditBuilding}
          onDeleteBuilding={businessHandlers.handleDeleteBuilding}
          onClose={mapState.handleCloseBuildingList}
          onEditRoom={mapState.handleOpenEditRoom}
          onCreateRooms={mapState.handleCreateRoomsForBuilding}
          onAddRooms={() => mapState.handleCreateRoomsForBuilding(null)}
          onDeleteRoom={businessHandlers.handleDeleteRoom}
          onReload={loadBuildings}
        />
      )}

      {/* Gestión de Salas */}
      {mapState.showRoomManagement && (
        <RoomManagement
          mode={mapState.roomManagementMode}
          buildings={buildings}
          selectedBuilding={mapState.selectedBuildingForRooms}
          onSaveRooms={businessHandlers.handleSaveRooms}
          onUpdateRoom={businessHandlers.handleUpdateRoom}
          onDeleteRoom={businessHandlers.handleDeleteRoom}
          onClose={mapState.handleCloseRoomManagement}
          existingRooms={mapState.selectedRooms}
        />
      )}

      {/* Lista de Rutas */}
      {mapState.showRouteList && (
        <RouteList
          routes={routes}
          onEditRoute={mapState.handleEditRoute}
          onDeleteRoute={businessHandlers.handleDeleteRoute}
          onClose={mapState.handleCloseRouteList}
          onSelectRoute={handleRouteClick}
        />
      )}
    </>
  );
};

