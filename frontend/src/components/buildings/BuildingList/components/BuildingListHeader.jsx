import React from "react";

const BuildingListHeader = ({ onClose, children }) => {
  return (
    <div className="building-list-header">
      <h2>
        <span className="material-icons">apartment</span>
        Gestionar Edificios
      </h2>
      <div></div>
      {children}
      <button className="close-btn" onClick={onClose}>
        <span className="material-icons">close</span>
      </button>
    </div>
  );
};

export default BuildingListHeader;
