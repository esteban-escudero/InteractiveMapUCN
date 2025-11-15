import React from "react";
import { BuildingForm } from "../../../buildings/index.js";
import { RouteFormPolyline } from "../../../routes/index.js";

export const MapForms = ({
  mapState,
  businessHandlers,
  coordinateManagement,
  mapInstance,
  isRouteDrawingActive,
  setIsRouteDrawingActive,
  showUINotification, // ⭐ AGREGAR AQUÍ
}) => {
  return (
    <>
      {/* Formulario de Edificio */}
      <BuildingForm
        onSave={businessHandlers.handleSaveBuilding}
        onCancel={() => {
          mapState.setShowBuildingForm(false);
          mapState.setEditingBuilding(null);
          coordinateManagement.clearCapturedCoords();
        }}
        isVisible={mapState.showBuildingForm}
        building={mapState.editingBuilding}
        isEditing={!!mapState.editingBuilding}
        capturedCoordinates={coordinateManagement.capturedCoords}
        onClearCoordinates={coordinateManagement.clearCapturedCoords}
        onToggleCoordinateDetection={
          coordinateManagement.toggleCoordinateDetection
        }
      />

      {/* Formulario de Ruta */}
      <RouteFormPolyline
        onSave={businessHandlers.handleSaveRoute}
        onCancel={() => {
          mapState.setShowRouteForm(false);
          mapState.setEditingRoute(null);
        }}
        isVisible={mapState.showRouteForm}
        route={mapState.editingRoute}
        isEditing={!!mapState.editingRoute}
        mapInstance={mapInstance}
        showUINotification={showUINotification} // ⭐ PASAR AQUÍ
        onSelectionStart={() => {
          console.log(
            "🟡 Iniciando selección - DESACTIVANDO useMapClickHandler"
          );
          setIsRouteDrawingActive(true);
        }}
        onSelectionEnd={() => {
          console.log(
            "🟢 Finalizando selección - REACTIVANDO useMapClickHandler"
          );
          setIsRouteDrawingActive(false);
        }}
      />
    </>
  );
};
