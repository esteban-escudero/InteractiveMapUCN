/**
 * Componente que agrupa todas las capas del mapa - MEJORADO
 * Ahora maneja edificios destacados y rutas calculadas
 */
import React from "react";
import RouteLayer from "components/map/RouteLayer/RouteLayer.jsx";
import BuildingRenderer from "components/map/BuildingRenderer/BuildingRenderer.jsx";
import RouteNetwork from "components/routes/RouteNetwork/RouteNetwork.jsx";

export const MapLayers = ({
  mapInstance,
  isMapReady,
  filteredBuildings,
  highlightedBuildings, // ← NUEVO: edificios destacados
  prioritizedRoutes,
  mapState,
  routes,
  handleRouteClick,
  interactionHandlers,
}) => {
  return (
    <>
      {/* Capa de Edificios - Ahora con resaltado */}
      <BuildingRenderer
        mapInstance={mapInstance}
        isMapReady={isMapReady}
        buildings={filteredBuildings} // Solo filtrados por categoría
        highlightedBuildings={highlightedBuildings} // Origen y destino destacados
        onBuildingClick={interactionHandlers.handleBuildingClickWithProximity}
        isAdminView={true} // Vista de administrador - muestra todos los datos
      />

      {/* Capa de Rutas - Muestra rutas calculadas o todas */}
      <RouteLayer
        mapInstance={mapInstance}
        routes={prioritizedRoutes} // Rutas priorizadas o todas
        onRouteClick={handleRouteClick}
        originFilter={mapState.filters.origin}
        destinationFilter={mapState.filters.destination}
        selectedRoute={mapState.selectedRoute}
        editingRoute={mapState.editingRoute}
      />

      {/* Red de Rutas (opcional) */}
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
