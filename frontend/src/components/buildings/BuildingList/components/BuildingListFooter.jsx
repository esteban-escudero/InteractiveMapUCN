// components/buildings/BuildingList/components/BuildingListFooter.jsx
import React from "react";

const BuildingListFooter = ({ buildingCount }) => {
  return (
    <div className="building-list-footer">
      <p>Total: {buildingCount} edificio(s)</p>
      <small style={{ color: "#e74c3c", marginTop: "5px" }}>
        La eliminación es permanente e irreversible
      </small>
    </div>
  );
};

export default BuildingListFooter;
