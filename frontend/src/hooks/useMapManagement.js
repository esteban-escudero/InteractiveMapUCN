import { useState, useCallback } from "react";

export const useMapManagement = () => {
  const [showBuildingForm, setShowBuildingForm] = useState(false);
  const [showBuildingList, setShowBuildingList] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState(null);

  const [showRoomManagement, setShowRoomManagement] = useState(false);
  const [roomManagementMode, setRoomManagementMode] = useState("create");
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectedBuildingForRooms, setSelectedBuildingForRooms] =
    useState(null);

  const [showRouteForm, setShowRouteForm] = useState(false);
  const [showRouteList, setShowRouteList] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showRouteNetwork, setShowRouteNetwork] = useState(false);

  const [filters, setFilters] = useState({
    origin: "",
    destination: "",
    category: "",
  });

  // Funciones para edificios
  const handleAddBuilding = useCallback(() => {
    setEditingBuilding(null);
    setShowBuildingForm(true);
  }, []);

  const handleManageBuildings = useCallback(() => {
    setShowBuildingList(true);
    setShowRoomManagement(false);
    setShowRouteList(false);
  }, []);

  const handleEditBuilding = useCallback((building) => {
    setEditingBuilding(building);
    setShowBuildingForm(true);
    setShowBuildingList(false);
  }, []);

  const handleCloseBuildingList = useCallback(() => {
    setShowBuildingList(false);
  }, []);

  // Funciones para salas
  const handleCreateRoomsForBuilding = useCallback((building) => {
    setSelectedBuildingForRooms(building);
    setRoomManagementMode("create");
    setSelectedRooms([]);
    setShowRoomManagement(true);
    setShowBuildingList(false);
  }, []);

  const handleOpenEditRoom = useCallback((room) => {
    setRoomManagementMode("edit");
    setSelectedRooms([room]);
    setShowRoomManagement(true);
    setShowBuildingList(false);
  }, []);

  const handleCloseRoomManagement = useCallback(() => {
    setShowRoomManagement(false);
    setSelectedBuildingForRooms(null);
    setSelectedRooms([]);
  }, []);

  // Funciones para rutas
  const handleAddRoute = useCallback(() => {
    setEditingRoute(null);
    setShowRouteForm(true);
    setShowRouteList(false);
  }, []);

  const handleManageRoutes = useCallback(() => {
    setShowRouteList(true);
    setShowBuildingList(false);
    setShowRoomManagement(false);
  }, []);

  const handleEditRoute = useCallback((route) => {
    setEditingRoute(route);
    setShowRouteForm(true);
    setShowRouteList(false);
  }, []);

  const handleCloseRouteList = useCallback(() => {
    setShowRouteList(false);
  }, []);

  // Funciones para filtros
  const handleFilterChange = useCallback((filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ origin: "", destination: "", category: "" });
  }, []);

  // Resetear todas las vistas
  const resetViews = useCallback(() => {
    setShowBuildingForm(false);
    setShowBuildingList(false);
    setShowRoomManagement(false);
    setShowRouteForm(false);
    setShowRouteList(false);
    setShowRouteNetwork(false);
    setEditingBuilding(null);
    setEditingRoute(null);
    setSelectedRoute(null);
  }, []);

  // En useMapManagement.js, agregar:
  const handleClearRouteFilters = useCallback(() => {
    setFilters((prev) => ({ ...prev, origin: "", destination: "" }));
  }, []);

  return {
    // Estados
    showBuildingForm,
    showBuildingList,
    editingBuilding,
    showRoomManagement,
    roomManagementMode,
    selectedRooms,
    selectedBuildingForRooms,
    showRouteForm,
    showRouteList,
    editingRoute,
    selectedRoute,
    showRouteNetwork,
    filters,

    // Setters
    setShowBuildingForm,
    setShowBuildingList,
    setEditingBuilding,
    setShowRoomManagement,
    setRoomManagementMode,
    setSelectedRooms,
    setSelectedBuildingForRooms,
    setShowRouteForm,
    setShowRouteList,
    setEditingRoute,
    setSelectedRoute,
    setShowRouteNetwork,
    setFilters,

    // Funciones
    handleAddBuilding,
    handleManageBuildings,
    handleEditBuilding,
    handleCloseBuildingList,
    handleCreateRoomsForBuilding,
    handleOpenEditRoom,
    handleCloseRoomManagement,
    handleAddRoute,
    handleManageRoutes,
    handleEditRoute,
    handleCloseRouteList,
    handleFilterChange,
    handleClearFilters,
    resetViews,
  };
};
