// components/buildings/RoomManagement/hooks/useRoomManagement.js
import { useState, useEffect } from "react";
import { useRoomForm } from "./useRoomForm";

const TIPOS_SALA = [
  "Sala Normal",
  "Laboratorio",
  "Sala Conferencia",
  "Oficina Administrativa",
  "Oficina Profesor",
  "Sala Estudio",
  "Sala Reuniones",
  "Taller",
  "Auditorio",
  "Cocina",
  "Almacen",
  "Baño",
  "Otro",
];

export const useRoomManagement = ({
  buildings,
  onSaveRooms,
  onUpdateRoom,
  onDeleteRoom,
  onClose,
  existingRooms = [],
  selectedBuilding = null,
}) => {
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [selectedBuildingData, setSelectedBuildingData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const { rooms, addRoom, removeRoom, updateRoom, resetRooms, setRoomsData } =
    useRoomForm();

  // Inicialización
  useEffect(() => {
    if (existingRooms.length > 0) {
      // Modo edición
      setRoomsData(existingRooms);
      setIsEditing(true);
      if (existingRooms[0]?.id_edificio) {
        setSelectedBuildingId(existingRooms[0].id_edificio.toString());
      }
    } else {
      // Modo creación
      resetRooms();
      setIsEditing(false);

      // Detección automática de edificio
      if (selectedBuilding) {
        setSelectedBuildingId(selectedBuilding.id.toString());
        setSelectedBuildingData(selectedBuilding);
      }
    }
  }, [existingRooms, selectedBuilding, resetRooms, setRoomsData]);

  // Actualizar datos del edificio seleccionado
  useEffect(() => {
    if (selectedBuildingId) {
      const building = buildings.find(
        (b) => b.id.toString() === selectedBuildingId
      );
      setSelectedBuildingData(building);
    } else {
      setSelectedBuildingData(null);
    }
  }, [selectedBuildingId, buildings]);

  const getBuildingCoordinates = (building) => {
    if (!building) return { longitud: null, latitud: null };

    return {
      longitud: building.longitud || building.lng || building.x || -58.381592,
      latitud: building.latitud || building.lat || building.y || -34.603722,
    };
  };

  const validateRooms = () => {
    if (!selectedBuildingId || !selectedBuildingData) {
      alert("Selecciona un edificio primero");
      return false;
    }

    const invalidRooms = rooms.filter((room) => !room.nombre_sala.trim());
    if (invalidRooms.length > 0) {
      alert("Todas las salas deben tener un nombre");
      return false;
    }

    const coords = getBuildingCoordinates(selectedBuildingData);
    if (!coords.longitud || !coords.latitud) {
      alert("El edificio seleccionado no tiene coordenadas definidas");
      return false;
    }

    return true;
  };

  const prepareRoomsForSave = () => {
    const coords = getBuildingCoordinates(selectedBuildingData);

    return rooms.map((room) => ({
      ...room,
      id_edificio: parseInt(selectedBuildingId),
      piso: parseInt(room.piso) || 1,
      longitud: coords.longitud,
      latitud: coords.latitud,
    }));
  };

  const handleSave = async () => {
    if (!validateRooms()) return;

    const roomsToSave = prepareRoomsForSave();

    try {
      await onSaveRooms(roomsToSave);
      alert(`${rooms.length} salas creadas exitosamente`);
      onClose();
    } catch (error) {
      alert("Error al guardar las salas: " + error.message);
    }
  };

  const handleUpdate = async () => {
    if (rooms.length === 0) return;

    const room = rooms[0];
    if (!room.nombre_sala.trim()) {
      alert("La sala debe tener un nombre");
      return;
    }

    if (!validateRooms()) return;

    const roomToUpdate = prepareRoomsForSave()[0];

    try {
      await onUpdateRoom(room.id, roomToUpdate);
      alert("Sala actualizada exitosamente");
      onClose();
    } catch (error) {
      alert("Error al actualizar la sala: " + error.message);
    }
  };

  const handleDelete = async () => {
    if (rooms.length === 0 || !rooms[0].id) return;

    const room = rooms[0];
    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar la sala "${room.nombre_sala}"?`
    );

    if (confirmDelete) {
      try {
        await onDeleteRoom(room.id);
        alert("Sala eliminada exitosamente");
        onClose();
      } catch (error) {
        alert("Error al eliminar la sala: " + error.message);
      }
    }
  };

  return {
    selectedBuildingId,
    setSelectedBuildingId,
    selectedBuildingData,
    rooms,
    isEditing,
    TIPOS_SALA,
    addRoom,
    removeRoom,
    updateRoom,
    handleSave,
    handleUpdate,
    handleDelete,
  };
};
