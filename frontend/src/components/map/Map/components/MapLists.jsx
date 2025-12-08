/**
 * Componente que agrupa todas las listas del mapa
 */
import React from "react";
import { BuildingList } from "components/buildings/index.js";
import { RouteList } from "components/routes/index.js";
import RoomManagement from "components/buildings/RoomManagement/RoomManagement.jsx";

export const MapLists = ({
  mapState, // ESTADO
  mapManagement, // GESTIÓN
  businessHandlers, // NEGOCIO
  filteredBuildings,
  routes,
  buildings,
  loadBuildings,
  handleRouteClick,
  handleEditRoute,
}) => {
  return (
    <>
      {/* Lista de Edificios */}
      {mapState.showBuildingList && (
        <BuildingList
          buildings={filteredBuildings}
          onEditBuilding={mapManagement.handleEditBuilding}
          onDeleteBuilding={businessHandlers.handleDeleteBuilding}
          onClose={mapManagement.handleCloseBuildingList}
          onEditRoom={mapManagement.handleOpenEditRoom}
          onCreateRooms={mapManagement.handleCreateRoomsForBuilding}
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
          onClose={mapManagement.handleCloseRoomManagement}
          existingRooms={mapState.selectedRooms}
        />
      )}

      {/* Lista de Rutas */}
      {mapState.showRouteList && (
        <RouteList
          routes={routes}
          onEditRoute={mapManagement.handleEditRoute}
          onDeleteRoute={businessHandlers.handleDeleteRoute}
          onClose={mapManagement.handleCloseRouteList}
          onSelectRoute={handleRouteClick}
        />
      )}
    </>
  );
};
