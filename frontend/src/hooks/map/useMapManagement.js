// useMapManagement.js - MANEJAR TODA LA LÓGICA
import { useCallback } from "react";

export const useMapManagement = (mapState) => {
  // Handlers para buildings
  const handleAddBuilding = useCallback(() => {
    mapState.setEditingBuilding(null);
    mapState.setShowBuildingForm(true);
  }, [mapState]);

  const handleEditBuilding = useCallback(
    (building) => {
      mapState.setEditingBuilding(building);
      mapState.setShowBuildingForm(true);
    },
    [mapState]
  );

  const handleManageBuildings = useCallback(() => {
    mapState.setShowBuildingList(true);
  }, [mapState]);

  const handleCloseBuildingList = useCallback(() => {
    mapState.setShowBuildingList(false);
  }, [mapState]);

  // Handlers para rooms - CORREGIDO
  const handleOpenEditRoom = useCallback(
    (room) => {
      console.log("🔄 handleOpenEditRoom ejecutándose con:", room);

      // Para editar una sala, necesitamos el edificio padre
      // Asumimos que la sala tiene id_edificio
      const buildingForRoom = {
        id: room.id_edificio,
      };

      mapState.setSelectedBuildingForRooms(buildingForRoom);
      mapState.setSelectedRooms([room]);
      mapState.setRoomManagementMode("edit");
      mapState.setShowRoomManagement(true);
      mapState.setShowBuildingList(false);
    },
    [mapState]
  );

  const handleCreateRoomsForBuilding = useCallback(
    (building) => {
      mapState.setSelectedBuildingForRooms(building);
      mapState.setSelectedRooms([]);
      mapState.setRoomManagementMode("create");
      mapState.setShowRoomManagement(true);
    },
    [mapState]
  );

  const handleCloseRoomManagement = useCallback(() => {
    mapState.setShowRoomManagement(false);
    mapState.setSelectedBuildingForRooms(null);
    mapState.setSelectedRooms([]);
    // Abrir BuildingList después de cerrar RoomManagement
    mapState.setShowBuildingList(true);
  }, [mapState]);

  // Handlers para routes
  const handleAddRoute = useCallback(() => {
    mapState.setEditingRoute(null);
    mapState.setShowRouteForm(true);
  }, [mapState]);

  const handleEditRoute = useCallback(
    (route) => {
      mapState.setEditingRoute(route);
      mapState.setShowRouteForm(true);
    },
    [mapState]
  );

  const handleManageRoutes = useCallback(() => {
    mapState.setShowRouteList(true);
  }, [mapState]);

  const handleCloseRouteList = useCallback(() => {
    mapState.setShowRouteList(false);
  }, [mapState]);

  // Handlers para filtros
  const handleFilterChange = useCallback(
    (filterType, value) => {
      console.log(`🔄 Cambiando filtro ${filterType}:`, value);
      mapState.setFilters((prev) => ({
        ...prev,
        [filterType]: value,
      }));
    },
    [mapState]
  );

  const handleClearFilters = useCallback(() => {
    console.log("🔄 Limpiando todos los filtros");
    mapState.setFilters({
      origin: "",
      destination: "",
      category: "",
      routeType: "", // ← AÑADIDO
    });
    mapState.setSelectedRoute(null);
  }, [mapState]);

  return {
    // Handlers de Buildings
    handleAddBuilding,
    handleEditBuilding,
    handleManageBuildings,
    handleCloseBuildingList,

    // Handlers de Rooms
    handleOpenEditRoom,
    handleCreateRoomsForBuilding,
    handleCloseRoomManagement,

    // Handlers de Routes
    handleAddRoute,
    handleEditRoute,
    handleManageRoutes,
    handleCloseRouteList,

    // Handlers de Filtros
    handleFilterChange,
    handleClearFilters,
  };
};
