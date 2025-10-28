// components/Forms/BuildingForm.js
import React, { useState, useEffect } from 'react';
import './BuildingForm.css';

const BuildingForm = ({ 
  onSave, 
  onCancel, 
  isVisible = false,
  building = null,       
  isEditing = false,
  capturedCoordinates = null,
  onClearCoordinates = () => {}   
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'Oficina Profesor',
    latitud: '',
    longitud: ''
  });

  const tiposEdificio = [
    { value: 'Oficina Profesor', label: '👨‍🏫 Oficina Profesor' },
    { value: 'Oficina Administracion', label: '📊 Oficina Admin' },
    { value: 'Sala de Clase', label: '📚 Sala de Clase' },
    { value: 'Laboratorio', label: '🔬 Laboratorio' },
    { value: 'Biblioteca', label: '📖 Biblioteca' },
    { value: 'Sala de Estudio', label: '💻 Sala Estudio' },
    { value: 'Baño', label: '🚻 Baño' },
    { value: 'Casino', label: '🍽️ Casino' },
    { value: 'Cafeteria', label: '☕ Cafetería' },
    { value: 'Gimnasio', label: '💪 Gimnasio' },
    { value: 'Estacionamiento', label: '🅿️ Estacionamiento' }
  ];

  // Resetear form cuando se abre/cierra o cambia el edificio
  useEffect(() => {
    if (isVisible) {
      if (isEditing && building) {
        // Modo edición: cargar datos del edificio
        const coords = building.ubicacion?.coordinates || [];
        setFormData({
          nombre: building.nombre || '',
          descripcion: building.descripcion || '',
          tipo: building.tipo || 'Oficina Profesor',
          latitud: coords[1] || building.lat || '',
          longitud: coords[0] || building.lng || ''
        });
      } else {
        setFormData({ 
          nombre: '', 
          descripcion: '', 
          tipo: 'Oficina Profesor',
          latitud: capturedCoordinates ? capturedCoordinates.lat.toString() : '', 
          longitud: capturedCoordinates ? capturedCoordinates.lng.toString() : ''
        });
      }
    }
  }, [isVisible, isEditing, building, capturedCoordinates]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre.trim()) {
      alert('El nombre del edificio es requerido');
      return;
    }
    
    if (!formData.latitud || !formData.longitud) {
      alert('Debes ingresar las coordenadas del edificio');
      return;
    }

    // Validar que las coordenadas sean números
    const lat = parseFloat(formData.latitud);
    const lng = parseFloat(formData.longitud);
    
    if (isNaN(lat) || isNaN(lng)) {
      alert('Las coordenadas deben ser números válidos');
      return;
    }

    const buildingData = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim(),
      tipo: formData.tipo,
      lat: lat,
      lng: lng 
    };

    try {
      await onSave(buildingData);
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar el edificio: ' + error.message);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="building-form-overlay">
      <div className="building-form-container">
        <div className="form-content">
          <div className="form-header">
            <h3>{isEditing ? '✏️ Editar Edificio' : '🏗️ Agregar Nuevo Edificio'}</h3>
            {isEditing && building && (
              <small style={{color: '#7f8c8d', fontSize: '12px'}}>
                Editando: {building.nombre}
              </small>
            )}
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nombre">Nombre del Edificio *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ej: Edificio de Ingeniería"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="descripcion">Descripción</label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Descripción del edificio..."
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="tipo">Tipo de Edificio *</label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleInputChange}
                required
                style={{fontSize: '14px'}}
              >
                {tiposEdificio.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="coordinates-group">
              <div className="form-group">
                <label htmlFor="latitud">Latitud *</label>
                <input
                  type="text"
                  id="latitud"
                  name="latitud"
                  value={formData.latitud}
                  onChange={handleInputChange}
                  placeholder="Ej: -29.953456"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="longitud">Longitud *</label>
                <input
                  type="text"
                  id="longitud"
                  name="longitud"
                  value={formData.longitud}
                  onChange={handleInputChange}
                  placeholder="Ej: -71.340123"
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={onCancel} className="cancel-btn">
                Cancelar
              </button>
              <button 
                type="submit" 
                className="save-btn"
                disabled={!formData.nombre.trim() || !formData.latitud || !formData.longitud}
              >
                {isEditing ? '💾 Actualizar Edificio' : '💾 Guardar Edificio'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BuildingForm;