// components/routes/RouteForm/RouteFormWithNodes.jsx
import React from "react";
import "./RouteFormWithNodes.css";
import { useRouteForm } from "./hooks/useRouteForm";
import NodeSelectionPanel from "./components/NodeSelectionPanel";
import RouteFormUI from "./components/RouteFormUI";

const RouteFormWithNodes = ({
  onSave,
  onCancel,
  isVisible,
  route = null,
  isEditing = false,
  mapInstance = null,
  existingRoutes = [],
}) => {
  const {
    formData,
    existingNodes,
    selectedExistingNode,
    showNodesPanel,
    selectionActive,
    mapAvailable,
    handleInputChange,
    handleActivateMapSelection,
    handleClearPoints,
    handleRemoveLastPoint,
    handleSubmit,
    handleCancel,
    handleSelectExistingNode,
    handleCancelNodeSelection,
    handleFinishWithESC,
  } = useRouteForm({
    onSave,
    onCancel,
    isVisible,
    route,
    isEditing,
    mapInstance,
    existingRoutes,
  });

  // Mostrar panel de selección de nodos
  if (showNodesPanel && selectedExistingNode) {
    return (
      <NodeSelectionPanel
        selectedExistingNode={selectedExistingNode}
        onSelectNode={handleSelectExistingNode}
        onCancel={handleCancelNodeSelection}
      />
    );
  }

  // Ocultar durante selección activa
  if (selectionActive && !showNodesPanel) return null;

  // Ocultar si no es visible
  if (!isVisible) return null;

  return (
    <RouteFormUI
      formData={formData}
      existingNodes={existingNodes}
      isEditing={isEditing}
      mapAvailable={mapAvailable}
      selectionActive={selectionActive}
      onInputChange={handleInputChange}
      onActivateMapSelection={handleActivateMapSelection}
      onClearPoints={handleClearPoints}
      onRemoveLastPoint={handleRemoveLastPoint}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      onFinishWithESC={handleFinishWithESC}
    />
  );
};

export default RouteFormWithNodes;
