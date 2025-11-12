// components/buildings/BuildingList/components/EmptyState.jsx
import React from "react";

const EmptyState = () => {
  return (
    <div className="empty-state">
      <p>
        <span className="material-icons">apartment</span>
        No hay edificios registrados
      </p>
      <small>Crea el primer edificio usando el botón "Agregar Edificio"</small>
    </div>
  );
};

export default EmptyState;
