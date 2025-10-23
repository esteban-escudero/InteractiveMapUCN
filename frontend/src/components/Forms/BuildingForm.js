import React, { useState, useEffect } from 'react';
import './BuildingForm.css';

const BuildingForm = ({ 
  onSave, 
  onCancel, 
  isVisible = false 
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    latitud: '',
    longitud: '',
    activo: true
  });

  // Resetear form cuando se abre/cierra
  useEffect(() => {
    if (isVisible) {
      setFormData({ 
        nombre: '', 
        descripcion: '', 
        latitud: '', 
        longitud: '', 
        activo: true 
      });
    }
  }, [isVisible]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

    // ✅ CORREGIDO: Eliminar 'poligono' - solo enviar 'ubicacion'
    const buildingData = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim(),
      activo: formData.activo,
      ubicacion: {
        type: 'Point',
        coordinates: [lng, lat] // GeoJSON usa [longitud, latitud]
      }
      // ❌ ELIMINADO: poligono - no existe en la base de datos
    };

    try {
      await onSave(buildingData);
      onCancel();
    } catch (error) {
      console.error('Error al guardar:', error);
      alert('Error al guardar el edificio: ' + error.message);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="building-form-overlay">
      <div className="building-form-container">
        <div className="form-header">
          <h3>🏗️ Agregar Nuevo Edificio</h3>
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

          <div className="coordinates-help">
            <p><strong>💡 Consejo:</strong> Puedes obtener las coordenadas haciendo click derecho en Google Maps y seleccionando "¿Qué hay aquí?"</p>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="activo"
                checked={formData.activo}
                onChange={handleInputChange}
              />
              Edificio activo
            </label>
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
              💾 Guardar Edificio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BuildingForm;