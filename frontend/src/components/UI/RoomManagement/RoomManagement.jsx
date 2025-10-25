import React, { useState, useEffect } from 'react';
import './RoomManagement.css';

const RoomManagement = ({ buildings, onSaveRooms, onClose }) => {
    const [selectedBuilding, setSelectedBuilding] = useState('');
    const [rooms, setRooms] = useState([{
        nombre_sala: '',
        piso: 1,
        tipo_sala: 'Sala Normal',
        accesible_silla_ruedas: false
    }]);

    const TIPOS_SALA = [
        'Sala Normal',
        'Laboratorio', 
        'Sala Conferencia',
        'Oficina Administrativa',
        'Oficina Profesor',
        'Sala Estudio',
        'Sala Reuniones',
        'Taller',
        'Auditorio',
        'Cocina',
        'Almacen',
        'Baño',
        'Otro'
    ];

    // Agregar nueva sala al formulario
    const addRoom = () => {
        setRooms([...rooms, {
            nombre_sala: '',
            piso: 1,
            tipo_sala: 'Sala Normal',
            accesible_silla_ruedas: false
        }]);
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

    // Guardar todas las salas
    const handleSave = async () => {
        if (!selectedBuilding) {
            alert('Selecciona un edificio primero');
            return;
        }

        // Validar que todas las salas tengan nombre
        const invalidRooms = rooms.filter(room => !room.nombre_sala.trim());
        if (invalidRooms.length > 0) {
            alert('Todas las salas deben tener un nombre');
            return;
        }

        const roomsToSave = rooms.map(room => ({
            ...room,
            id_edificio: parseInt(selectedBuilding),
            piso: parseInt(room.piso) || 1
        }));

        try {
            await onSaveRooms(roomsToSave);
            alert(`✅ ${rooms.length} salas guardadas exitosamente`);
            onClose();
        } catch (error) {
            alert('❌ Error al guardar las salas: ' + error.message);
        }
    };

    return (
        <div className="room-management-overlay">
            <div className="room-management-container">
                <div className="room-management-header">
                    <h3>🏢 Gestión de Salas</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                {/* Selección de Edificio */}
                <div className="building-selection">
                    <label>Edificio:</label>
                    <select 
                        value={selectedBuilding} 
                        onChange={(e) => setSelectedBuilding(e.target.value)}
                        required
                    >
                        <option value="">Selecciona un edificio</option>
                        {buildings.map(building => (
                            <option key={building.id} value={building.id}>
                                {building.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Lista de Salas */}
                <div className="rooms-list">
                    <div className="rooms-header">
                        <h4>Salas a Agregar</h4>
                        <button type="button" onClick={addRoom} className="add-room-btn">
                            + Agregar Sala
                        </button>
                    </div>

                    {rooms.map((room, index) => (
                        <div key={index} className="room-form">
                            <div className="room-header">
                                <h5>Sala {index + 1}</h5>
                                {rooms.length > 1 && (
                                    <button 
                                        type="button" 
                                        onClick={() => removeRoom(index)}
                                        className="remove-room-btn"
                                    >
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
                                        onChange={(e) => updateRoom(index, 'nombre_sala', e.target.value)}
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
                                        onChange={(e) => updateRoom(index, 'piso', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Tipo de Sala *</label>
                                    <select
                                        value={room.tipo_sala}
                                        onChange={(e) => updateRoom(index, 'tipo_sala', e.target.value)}
                                        required
                                    >
                                        {TIPOS_SALA.map(tipo => (
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
                                            onChange={(e) => updateRoom(index, 'accesible_silla_ruedas', e.target.checked)}
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
                    <button type="button" onClick={onClose} className="cancel-btn">
                        Cancelar
                    </button>
                    <button 
                        type="button" 
                        onClick={handleSave}
                        className="save-btn"
                        disabled={!selectedBuilding || rooms.some(room => !room.nombre_sala.trim())}
                    >
                        💾 Guardar {rooms.length} Salas
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoomManagement;