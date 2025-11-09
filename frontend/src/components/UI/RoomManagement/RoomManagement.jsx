import React, { useState, useEffect } from "react";
import "./RoomManagement.css";

const RoomManagement = ({
  buildings,
  onSaveRooms,
  onUpdateRoom,
  onDeleteRoom,
  onClose,
  existingRooms = [],
  selectedBuilding = null, // NUEVO PROP: edificio seleccionado automáticamente
}) => {
  const [selectedBuildingId, setSelectedBuildingId] = useState("");
  const [selectedBuildingData, setSelectedBuildingData] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);

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

  // INICIALIZACIÓN MEJORADA - Detecta automáticamente el edificio
  useEffect(() => {
    if (existingRooms.length > 0) {
      // Modo edición: cargar salas existentes
      setRooms(existingRooms);
      setIsEditing(true);
      if (existingRooms[0]?.id_edificio) {
        setSelectedBuildingId(existingRooms[0].id_edificio.toString());
      }
    } else {
      // Modo creación: sala vacía
      setRooms([
        {
          nombre_sala: "",
          piso: 1,
          tipo_sala: "Sala Normal",
          accesible_silla_ruedas: false,
        },
      ]);
      setIsEditing(false);

      // DETECCIÓN AUTOMÁTICA: Si viene un edificio seleccionado, usarlo
      if (selectedBuilding) {
        console.log("Edificio detectado automáticamente:", selectedBuilding);
        setSelectedBuildingId(selectedBuilding.id.toString());
        setSelectedBuildingData(selectedBuilding);
      }
    }
  }, [existingRooms, selectedBuilding]); // Agregar selectedBuilding como dependencia

  // Cuando se selecciona un edificio, obtener sus datos completos
  useEffect(() => {
    if (selectedBuildingId) {
      const building = buildings.find(
        (b) => b.id.toString() === selectedBuildingId
      );
      setSelectedBuildingData(building);
      console.log("Edificio seleccionado:", building);
    } else {
      setSelectedBuildingData(null);
    }
  }, [selectedBuildingId, buildings]);

  // Agregar nueva sala al formulario
  const addRoom = () => {
    setRooms([
      ...rooms,
      {
        nombre_sala: "",
        piso: 1,
        tipo_sala: "Sala Normal",
        accesible_silla_ruedas: false,
      },
    ]);
  };

  // Remover sala del formulario
  const removeRoom = (index) => {
    if (rooms.length > 1) {
      const updatedRooms = rooms.filter((_, i) => i !== index);
      setRooms(updatedRooms);
    }
  };

  // Actualizar datos de una sala específica
  const updateRoom = (index, field, value) => {
    const updatedRooms = rooms.map((room, i) =>
      i === index ? { ...room, [field]: value } : room
    );
    setRooms(updatedRooms);
  };

  // Obtener coordenadas del edificio
  const getBuildingCoordinates = (building) => {
    if (!building) return { longitud: null, latitud: null };

    return {
      longitud: building.longitud || building.lng || building.x || -58.381592,
      latitud: building.latitud || building.lat || building.y || -34.603722,
    };
  };

  // Guardar todas las salas (crear nuevas)
  const handleSave = async () => {
    if (!selectedBuildingId || !selectedBuildingData) {
      alert("Selecciona un edificio primero");
      return;
    }

    // Validar que todas las salas tengan nombre
    const invalidRooms = rooms.filter((room) => !room.nombre_sala.trim());
    if (invalidRooms.length > 0) {
      alert("Todas las salas deben tener un nombre");
      return;
    }

    // Obtener coordenadas del edificio
    const coords = getBuildingCoordinates(selectedBuildingData);

    if (!coords.longitud || !coords.latitud) {
      alert("El edificio seleccionado no tiene coordenadas definidas");
      return;
    }

    console.log("Usando coordenadas del edificio:", coords);

    const roomsToSave = rooms.map((room) => ({
      ...room,
      id_edificio: parseInt(selectedBuildingId),
      piso: parseInt(room.piso) || 1,
      longitud: coords.longitud,
      latitud: coords.latitud,
    }));

    console.log("Enviando salas con coordenadas:", roomsToSave);

    try {
      await onSaveRooms(roomsToSave);
      alert(`${rooms.length} salas creadas exitosamente`);
      onClose();
    } catch (error) {
      alert("Error al guardar las salas: " + error.message);
    }
  };

  // Actualizar una sala existente
  const handleUpdate = async () => {
    if (rooms.length === 0) return;

    const room = rooms[0]; // En edición solo trabajamos con una sala
    if (!room.nombre_sala.trim()) {
      alert("La sala debe tener un nombre");
      return;
    }

    // Obtener coordenadas del edificio
    const coords = getBuildingCoordinates(selectedBuildingData);

    if (!coords.longitud || !coords.latitud) {
      alert("El edificio seleccionado no tiene coordenadas definidas");
      return;
    }

    const roomToUpdate = {
      ...room,
      id_edificio: parseInt(selectedBuildingId),
      piso: parseInt(room.piso) || 1,
      longitud: coords.longitud,
      latitud: coords.latitud,
    };

    try {
      await onUpdateRoom(room.id, roomToUpdate);
      alert("Sala actualizada exitosamente");
      onClose();
    } catch (error) {
      alert("Error al actualizar la sala: " + error.message);
    }
  };

  // Eliminar una sala
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

  return (
    <div className="room-management-overlay">
      <div className="room-management-container">
        <div className="room-management-header">
          <h3>{isEditing ? "Editar Sala" : "Gestión de Salas"}</h3>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Selección de Edificio - MEJORADA */}
        <div className="building-selection">
          <label>Edificio:</label>
          <select
            value={selectedBuildingId}
            onChange={(e) => setSelectedBuildingId(e.target.value)}
            required
            disabled={isEditing || (selectedBuilding && !isEditing)} // Deshabilitar si ya viene seleccionado
          >
            <option value="">Selecciona un edificio</option>
            {buildings.map((building) => (
              <option key={building.id} value={building.id}>
                {building.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Lista de Salas */}
        <div className="rooms-list">
          <div className="rooms-header">
            <h4>{isEditing ? "Editando Sala" : "Salas a Agregar"}</h4>
            {!isEditing && (
              <button type="button" onClick={addRoom} className="add-room-btn">
                + Agregar Sala
              </button>
            )}
          </div>

          {rooms.map((room, index) => (
            <div key={room.id || index} className="room-form">
              <div className="room-header">
                <h5>
                  {isEditing
                    ? `Editando: ${room.nombre_sala}`
                    : `Sala ${index + 1}`}
                  {room.id && <span className="room-id"> (ID: {room.id})</span>}
                </h5>
                {!isEditing && rooms.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRoom(index)}
                    className="remove-room-btn">
                    ✕
                  </button>
                )}
              </div>

              <div className="room-fields">
                <div className="form-group">
                  <label>Nombre de la Sala *</label>
                  <input
                    type="text"
                    value={room.nombre_sala}
                    onChange={(e) =>
                      updateRoom(index, "nombre_sala", e.target.value)
                    }
                    placeholder="Ej: Aula 101, Laboratorio Física"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Piso *</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={room.piso}
                    onChange={(e) => updateRoom(index, "piso", e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tipo de Sala *</label>
                  <select
                    value={room.tipo_sala}
                    onChange={(e) =>
                      updateRoom(index, "tipo_sala", e.target.value)
                    }
                    required>
                    {TIPOS_SALA.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={room.accesible_silla_ruedas}
                      onChange={(e) =>
                        updateRoom(
                          index,
                          "accesible_silla_ruedas",
                          e.target.checked
                        )
                      }
                    />
                    Accesible para silla de ruedas
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Acciones */}
        <div className="room-actions">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleDelete}
                className="delete-btn">
                Eliminar
              </button>
              <div className="edit-actions">
                <button type="button" onClick={onClose} className="cancel-btn">
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleUpdate}
                  className="save-btn"
                  disabled={
                    !selectedBuildingId || !rooms[0]?.nombre_sala.trim()
                  }>
                  💾 Actualizar
                </button>
              </div>
            </>
          ) : (
            <>
              <button type="button" onClick={onClose} className="cancel-btn">
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="save-btn"
                disabled={
                  !selectedBuildingId ||
                  rooms.some((room) => !room.nombre_sala.trim())
                }>
                💾 Guardar {rooms.length} Salas
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomManagement;
