import React, { useState, useEffect } from "react";
import "./RouteForm.css";

const RouteForm = ({
  onSave,
  onCancel,
  isVisible,
  route = null,
  isEditing = false,
  buildings = [],
}) => {
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "peatonal",
    distancia: 0,
    tiempo_estimado: 0,
    geometria: null,
    puntos_ruta: [],
  });

  const [selectedOrigen, setSelectedOrigen] = useState(null);
  const [selectedDestino, setSelectedDestino] = useState(null);

  useEffect(() => {
    if (route && isEditing) {
      setFormData({
        nombre: route.nombre || "",
        tipo: route.tipo || "peatonal",
        distancia: route.distancia || 0,
        tiempo_estimado: route.tiempo_estimado || 0,
        geometria: route.geometria || null,
        puntos_ruta: route.puntos_ruta || [],
      });
    } else {
      setFormData({
        nombre: "",
        tipo: "peatonal",
        distancia: 0,
        tiempo_estimado: 0,
        geometria: null,
        puntos_ruta: [],
      });
    }
  }, [route, isEditing]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleOrigenChange = (e) => {
    const buildingId = e.target.value;
    const building = buildings.find((b) => b.id == buildingId);
    setSelectedOrigen(building);
  };

  const handleDestinoChange = (e) => {
    const buildingId = e.target.value;
    const building = buildings.find((b) => b.id == buildingId);
    setSelectedDestino(building);
  };

  const handleCalculateRoute = () => {
    if (!selectedOrigen || !selectedDestino) {
      alert("Por favor selecciona origen y destino");
      return;
    }

    // Crear geometría simple de línea recta (esto se mejoraría con un algoritmo de routing)
    const geometria = {
      type: "LineString",
      coordinates: [
        [
          selectedOrigen.ubicacion.coordinates[0],
          selectedOrigen.ubicacion.coordinates[1],
        ],
        [
          selectedDestino.ubicacion.coordinates[0],
          selectedDestino.ubicacion.coordinates[1],
        ],
      ],
    };

    // Calcular distancia aproximada (en metros)
    const lat1 = selectedOrigen.ubicacion.coordinates[1];
    const lon1 = selectedOrigen.ubicacion.coordinates[0];
    const lat2 = selectedDestino.ubicacion.coordinates[1];
    const lon2 = selectedDestino.ubicacion.coordinates[0];

    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distancia = Math.round(R * c);
    const tiempo_estimado = Math.round(distancia / 80); // Asumiendo 1.3 m/s (caminata)

    setFormData((prev) => ({
      ...prev,
      geometria,
      distancia,
      tiempo_estimado,
      puntos_ruta: [
        {
          orden: 1,
          tipo_punto: "inicio",
          descripcion: `Inicio: ${selectedOrigen.nombre}`,
          id_edificio: selectedOrigen.id,
          coordenadas: selectedOrigen.ubicacion,
        },
        {
          orden: 2,
          tipo_punto: "fin",
          descripcion: `Destino: ${selectedDestino.nombre}`,
          id_edificio: selectedDestino.id,
          coordenadas: selectedDestino.ubicacion,
        },
      ],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.nombre || !formData.geometria) {
      alert("Nombre y ruta calculada son requeridos");
      return;
    }

    onSave(formData);
  };

  if (!isVisible) return null;

  return (
    <div className="route-form-overlay">
      <div className="route-form-container">
        <div className="route-form-header">
          <h3>{isEditing ? "✏️ Editar Ruta" : "➕ Crear Nueva Ruta"}</h3>
          <button className="close-btn" onClick={onCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="route-form">
          <div className="form-group">
            <label>Nombre de la Ruta *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              placeholder="Ej: Ruta Biblioteca - Cafetería"
              required
            />
          </div>

          <div className="form-group">
            <label>Tipo de Ruta</label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleInputChange}>
              <option value="peatonal">Peatonal</option>
              <option value="vehicular">Vehicular</option>
              <option value="accesible">Accesible</option>
            </select>
          </div>

          <div className="route-calculation-section">
            <h4>🗺️ Calcular Ruta</h4>

            <div className="building-selection">
              <div className="form-group">
                <label>Origen</label>
                <select
                  onChange={handleOrigenChange}
                  value={selectedOrigen?.id || ""}>
                  <option value="">Seleccionar origen</option>
                  {buildings.map((building) => (
                    <option key={building.id} value={building.id}>
                      {building.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Destino</label>
                <select
                  onChange={handleDestinoChange}
                  value={selectedDestino?.id || ""}>
                  <option value="">Seleccionar destino</option>
                  {buildings.map((building) => (
                    <option key={building.id} value={building.id}>
                      {building.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              className="calculate-btn"
              onClick={handleCalculateRoute}
              disabled={!selectedOrigen || !selectedDestino}>
              🧮 Calcular Ruta
            </button>
          </div>

          {formData.geometria && (
            <div className="route-details">
              <h4>📊 Detalles de la Ruta</h4>

              <div className="route-stats">
                <div className="form-group">
                  <label>Distancia (metros)</label>
                  <input
                    type="number"
                    name="distancia"
                    value={formData.distancia}
                    onChange={handleNumberChange}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Tiempo Estimado (minutos)</label>
                  <input
                    type="number"
                    name="tiempo_estimado"
                    value={formData.tiempo_estimado}
                    onChange={handleNumberChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="route-points">
                <h5>Puntos de la Ruta:</h5>
                {formData.puntos_ruta.map((punto, index) => (
                  <div key={index} className="route-point">
                    <span className="point-order">{punto.orden}.</span>
                    <span className="point-desc">{punto.descripcion}</span>
                    <span className="point-type">({punto.tipo_punto})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="cancel-btn">
              Cancelar
            </button>
            <button
              type="submit"
              className="save-btn"
              disabled={!formData.geometria}>
              {isEditing ? "Actualizar" : "Crear"} Ruta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RouteForm;
