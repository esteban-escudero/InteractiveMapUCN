import { useState, useCallback } from "react";

export const useMapState = () => {
  // Estado de UI del mapa
  const [showBuildingForm, setShowBuildingForm] = useState(false);
  const [showBuildingList, setShowBuildingList] = useState(false);
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [showRouteList, setShowRouteList] = useState(false);
  const [showRoomManagement, setShowRoomManagement] = useState(false);
  const [showRouteNetwork, setShowRouteNetwork] = useState(false);

  // Estado de edición
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [editingRoute, setEditingRoute] = useState(null);
  const [selectedBuildingForRooms, setSelectedBuildingForRooms] =
    useState(null);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [roomManagementMode, setRoomManagementMode] = useState("create");

  // Filtros
  const [filters, setFilters] = useState({
    origin: "",
    destination: "",
    category: "",
  });

  // Ruta seleccionada
  const [selectedRoute, setSelectedRoute] = useState(null);

  // Handlers para buildings
  const handleAddBuilding = useCallback(() => {
    setEditingBuilding(null);
    setShowBuildingForm(true);
  }, []);

  const handleEditBuilding = useCallback((building) => {
    setEditingBuilding(building);
    setShowBuildingForm(true);
  }, []);

  const handleManageBuildings = useCallback(() => {
    setShowBuildingList(true);
  }, []);

  const handleCloseBuildingList = useCallback(() => {
    setShowBuildingList(false);
  }, []);

  // Handlers para rooms
  const handleOpenEditRoom = useCallback((building, rooms) => {
    setSelectedBuildingForRooms(building);
    setSelectedRooms(rooms || []);
    setRoomManagementMode("edit");
    setShowRoomManagement(true);
  }, []);

  const handleCreateRoomsForBuilding = useCallback((building) => {
    setSelectedBuildingForRooms(building);
    setSelectedRooms([]);
    setRoomManagementMode("create");
    setShowRoomManagement(true);
  }, []);

  const handleCloseRoomManagement = useCallback(() => {
    setShowRoomManagement(false);
    setSelectedBuildingForRooms(null);
    setSelectedRooms([]);
  }, []);

  // Handlers para routes
  const handleAddRoute = useCallback(() => {
    setEditingRoute(null);
    setShowRouteForm(true);
  }, []);

  const handleEditRoute = useCallback((route) => {
    setEditingRoute(route);
    setShowRouteForm(true);
  }, []);

  const handleManageRoutes = useCallback(() => {
    setShowRouteList(true);
  }, []);

  const handleCloseRouteList = useCallback(() => {
    setShowRouteList(false);
  }, []);

  // Handlers para filtros
  const handleFilterChange = useCallback((filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      origin: "",
      destination: "",
      category: "",
    });
    setSelectedRoute(null);
  }, []);

  return {
    // Estado de UI
    showBuildingForm,
    showBuildingList,
    showRouteForm,
    showRouteList,
    showRoomManagement,
    showRouteNetwork,

    // Estado de edición
    editingBuilding,
    editingRoute,
    selectedBuildingForRooms,
    selectedRooms,
    roomManagementMode,

    // Filtros y selección
    filters,
    selectedRoute,

    // Setters
    setShowBuildingForm,
    setShowBuildingList,
    setShowRouteForm,
    setShowRouteList,
    setShowRoomManagement,
    setShowRouteNetwork,
    setEditingBuilding,
    setEditingRoute,
    setSelectedBuildingForRooms,
    setSelectedRooms,
    setRoomManagementMode,
    setFilters,
    setSelectedRoute,

    // Handlers
    handleAddBuilding,
    handleEditBuilding,
    handleManageBuildings,
    handleCloseBuildingList,
    handleOpenEditRoom,
    handleCreateRoomsForBuilding,
    handleCloseRoomManagement,
    handleAddRoute,
    handleEditRoute,
    handleManageRoutes,
    handleCloseRouteList,
    handleFilterChange,
    handleClearFilters,
  };
};
