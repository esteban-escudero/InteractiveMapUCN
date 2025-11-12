// components/buildings/RoomManagement/hooks/useRoomForm.js
import { useState, useCallback } from "react";

export const useRoomForm = (initialRooms = []) => {
  const [rooms, setRooms] = useState(initialRooms);

  const createEmptyRoom = useCallback(
    () => ({
      nombre_sala: "",
      piso: 1,
      tipo_sala: "Sala Normal",
      accesible_silla_ruedas: false,
    }),
    []
  );

  const addRoom = useCallback(() => {
    setRooms((prevRooms) => [...prevRooms, createEmptyRoom()]);
  }, [createEmptyRoom]);

  const removeRoom = useCallback((index) => {
    setRooms((prevRooms) => {
      if (prevRooms.length > 1) {
        return prevRooms.filter((_, i) => i !== index);
      }
      return prevRooms;
    });
  }, []);

  const updateRoom = useCallback((index, field, value) => {
    setRooms((prevRooms) =>
      prevRooms.map((room, i) =>
        i === index ? { ...room, [field]: value } : room
      )
    );
  }, []);

  const resetRooms = useCallback(() => {
    setRooms([createEmptyRoom()]);
  }, [createEmptyRoom]);

  const setRoomsData = useCallback((newRooms) => {
    setRooms(newRooms);
  }, []);

  return {
    rooms,
    addRoom,
    removeRoom,
    updateRoom,
    resetRooms,
    setRoomsData,
    createEmptyRoom,
  };
};
