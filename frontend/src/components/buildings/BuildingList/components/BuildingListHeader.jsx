import React from "react";

const BuildingListHeader = ({ onClose }) => {
  return (
    <div className="building-list-header">
      <h2>
        <span className="material-icons">apartment</span>
        Gestionar Edificios
      </h2>
      <button className="close-btn" onClick={onClose}>
        <span className="material-icons">close</span>
      </button>
    </div>
  );
};

export default BuildingListHeader;
