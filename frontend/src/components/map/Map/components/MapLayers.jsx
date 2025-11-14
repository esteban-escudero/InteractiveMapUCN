/**
 * Componente que agrupa todas las capas del mapa
 */
import React from "react";
import RouteLayer from "../../RouteLayer/RouteLayer.jsx";
import BuildingRenderer from "../../BuildingRenderer/BuildingRenderer.jsx";
import RouteNetwork from "../../../routes/RouteNetwork/RouteNetwork.jsx";

export const MapLayers = ({
  mapInstance,
  isMapReady,
  filteredBuildings,
  prioritizedRoutes,
  mapState,
  routes,
  handleRouteClick,
  interactionHandlers,
}) => {
  return (
    <>
      {/* Capa de Edificios */}
      <BuildingRenderer
        mapInstance={mapInstance}
        isMapReady={isMapReady}
        buildings={filteredBuildings}
        onBuildingClick={interactionHandlers.handleBuildingClickWithProximity}
      />

      {/* Capa de Rutas */}
      <RouteLayer
        mapInstance={mapInstance}
        routes={prioritizedRoutes}
        onRouteClick={handleRouteClick}
        originFilter={mapState.filters.origin}
        destinationFilter={mapState.filters.destination}
        selectedRoute={mapState.selectedRoute}
      />

      {/* Red de Rutas */}
      {mapState.showRouteNetwork && (
        <RouteNetwork
          mapInstance={mapInstance}
          onNodeClick={(node) => {
            if (mapInstance) {
              mapInstance.setView(
                [node.coordenadas.lat, node.coordenadas.lng],
                18
              );
            }
          }}
          onRouteClick={(routeInfo) => {
            const fullRoute = routes.find((r) => r.id === routeInfo.routeId);
            if (fullRoute) {
              mapState.setSelectedRoute(fullRoute);
              handleRouteClick(fullRoute);
            }
          }}
        />
      )}
    </>
  );
};

