import React from "react";

const NodeSelectionPanel = ({
  selectedExistingNode,
  onSelectNode,
  onCancel,
}) => {
  if (!selectedExistingNode) return null;

  return (
    <div className="node-selection-overlay">
      <div className="node-selection-panel">
        <div className="node-selection-header">
          <h3>Nodos Existentes Cercanos</h3>
          <button className="close-btn" onClick={onCancel}>
            ×
          </button>
        </div>

        <div className="node-selection-info">
          <p>
            Se detectaron {selectedExistingNode.nearbyNodes.length} nodos
            existentes cerca de esta ubicación.
          </p>
          <p>
            <strong>¿Quieres usar uno de estos nodos existentes?</strong>
          </p>
        </div>

        <div className="existing-nodes-list">
          {selectedExistingNode.nearbyNodes.map((node) => (
            <div
              key={node.id}
              className="existing-node-item"
              onClick={() => onSelectNode(node)}>
              <div className="node-color"></div>
              <div className="node-info">
                <div className="node-name">{node.nombre}</div>
                <div className="node-details">
                  De: {node.routeName} • {node.tipo_punto}
                </div>
                <div className="node-coords">
                  {node.coordenadas.lat.toFixed(6)},{" "}
                  {node.coordenadas.lng.toFixed(6)}
                </div>
              </div>
              <div className="node-action">
                <button className="select-node-btn">Usar este nodo</button>
              </div>
            </div>
          ))}
        </div>

        <div className="node-selection-actions">
          <button className="cancel-node-btn" onClick={onCancel}>
            Crear nuevo punto
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeSelectionPanel;
