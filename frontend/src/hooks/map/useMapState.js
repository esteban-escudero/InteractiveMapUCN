// useMapState.js - DEJAR SOLO ESTADO, SIN HANDLERS
import { useState } from "react";

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
    routeType: "",
  });

  // Ruta seleccionada
  const [selectedRoute, setSelectedRoute] = useState(null);

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
  };
};
