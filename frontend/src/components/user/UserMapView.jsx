// components/user/UserMapView.jsx - REFACTORIZADO
import React, { useState, useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import "./UserMapView.css";
import "./dark-mode.css";
import "./info-modal.css";
import "./rounded-search.css";

// Hooks externos
import useBuildings from "hooks/buildings/useBuildings.js";
import useRoutes from "hooks/routes/useRoutes.js";
import { useRouteIntelligence } from "hooks/routes/useRouteIntelligence.js";
import { useNotification } from "hooks/common/useNotification.js";
import { useURLParams } from "hooks/user/useURLParams.js";
import { useGeolocation } from "hooks/user/useGeolocation.js";
import { useTheme } from "hooks/user/useTheme.js";

// Hooks personalizados del componente
import { useUserMapInit } from "./hooks/useUserMapInit.js";
import { useUserMapHandlers } from "./hooks/useUserMapHandlers.js";

// Componentes
import { UINotification } from "components/ui/index.js";
import BuildingRenderer from "components/Map/BuildingRenderer/BuildingRenderer";
import RouteLayer from "components/Map/RouteLayer/RouteLayer";
import MobileSearchBar from "./MobileSearchBar";
import MobileInfoPanel from "./MobileInfoPanel";
import MobileRoutePanel from "./MobileRoutePanel";
import MobileMapControls from "./MobileMapControls";
import MobileMenu from "./MobileMenu";

function UserMapView() {
    // Ref del mapa
    const mapRef = useRef(null);
    const [mapInstance, setMapInstance] = useState(null);
    const [mapInitialized, setMapInitialized] = useState(false);

    // Estado de la UI móvil
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [showInfoPanel, setShowInfoPanel] = useState(false);
    const [showRoutePanel, setShowRoutePanel] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [routeOrigin, setRouteOrigin] = useState(null);
    const [routeDestination, setRouteDestination] = useState(null);
    const [calculatedRoute, setCalculatedRoute] = useState(null);
    const [routeType, setRouteType] = useState("peatonal");

    // Datos
    const { buildings, loading: buildingsLoading, loadBuildings } = useBuildings();
    const { routes, loadRoutes } = useRoutes();

    // Inteligencia de rutas (Dijkstra)
    const { getPrioritizedRoutes } = useRouteIntelligence(routes, buildings);

    // Notificaciones
    const { notification, showUINotification, hideNotification } = useNotification();

    // Tema (modo oscuro)
    const { isDarkMode, toggleTheme } = useTheme();

    // Parámetros de URL (para QR codes)
    const { urlParams, navigateToLocation } = useURLParams();

    // Activar seguimiento constante de GPS
    const {
        position: userPosition,
        error: geoError,
        loading: geoLoading,
        getCurrentPosition,
        watchPosition,
        clearWatch
    } = useGeolocation();

    useEffect(() => {
        const watchId = watchPosition();
        return () => {
            if (watchId) clearWatch(watchId);
        };
    }, [watchPosition, clearWatch]);

    // Inicializar mapa (hook personalizado)
    useUserMapInit(
        mapRef,
        mapInitialized,
        setMapInstance,
        setMapInitialized,
        loadBuildings,
        loadRoutes,
        showUINotification
    );

    // Handlers del mapa (hook personalizado)
    const { handleLocationSelect, handleCalculateRoute, handleMyLocation } =
        useUserMapHandlers({
            mapInstance,
            routeOrigin,
            routeDestination,
            routeType,
            getPrioritizedRoutes,
            showUINotification,
            setSelectedLocation,
            setShowInfoPanel,
            setCalculatedRoute,
            setShowRoutePanel,
            userPosition,
            geoError,
            getCurrentPosition,
            buildings,
            urlParams,
            setRouteOrigin,
            setRouteDestination,
        });

    // Manejar parámetros de URL (QR codes)
    useEffect(() => {
        if (urlParams && buildings.length > 0 && mapInstance) {
            navigateToLocation(urlParams, buildings, mapInstance, setSelectedLocation, setShowInfoPanel);
        }
    }, [urlParams, buildings, mapInstance, navigateToLocation]);

    return (
        <div className="user-map-container">
            {/* Barra de búsqueda flotante */}
            <MobileSearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                buildings={buildings}
                onLocationSelect={handleLocationSelect}
                onMenuToggle={() => setShowMenu(!showMenu)}
            />

            {/* Mapa */}
            <div ref={mapRef} className="user-map" />

            {/* Renderizar edificios en el mapa */}
            {mapInstance && buildings.length > 0 && (
                <BuildingRenderer
                    mapInstance={mapInstance}
                    isMapReady={mapInitialized}
                    buildings={buildings}
                    highlightedBuildings={{
                        origin: routeOrigin,
                        destination: routeDestination
                    }}
                    isAdminView={false} // Vista de usuario - solo nombre y descripción
                />
            )}

            {/* Renderizar rutas en el mapa */}
            {mapInstance && routes.length > 0 && (
                <RouteLayer
                    mapInstance={mapInstance}
                    routes={routes}
                    onRouteClick={(route) => {
                        console.log("Ruta seleccionada:", route);
                    }}
                />
            )}

            {/* Controles flotantes del mapa */}
            <MobileMapControls
                onMyLocation={handleMyLocation}
                onRouteToggle={() => setShowRoutePanel(!showRoutePanel)}
                geoLoading={geoLoading}
                mapInstance={mapInstance}
            />

            {/* Panel de información */}
            {showInfoPanel && selectedLocation && (
                <MobileInfoPanel
                    location={selectedLocation}
                    onClose={() => setShowInfoPanel(false)}
                    onSetAsOrigin={() => {
                        setRouteOrigin(selectedLocation);
                        showUINotification("Origen establecido", "success");
                    }}
                    onSetAsDestination={() => {
                        setRouteDestination(selectedLocation);
                        showUINotification("Destino establecido", "success");
                    }}
                    onCalculateRoute={() => {
                        setShowInfoPanel(false);
                        setShowRoutePanel(true);
                    }}
                />
            )}

            {/* Panel de rutas */}
            {showRoutePanel && (
                <MobileRoutePanel
                    origin={routeOrigin}
                    destination={routeDestination}
                    route={calculatedRoute}
                    buildings={buildings}
                    routeType={routeType}
                    onOriginChange={setRouteOrigin}
                    onDestinationChange={setRouteDestination}
                    onRouteTypeChange={setRouteType}
                    onCalculate={handleCalculateRoute}
                    onClose={() => setShowRoutePanel(false)}
                    onGPSRequest={getCurrentPosition}
                />
            )}

            {/* Menú lateral */}
            {showMenu && (
                <MobileMenu
                    onClose={() => setShowMenu(false)}
                    isDarkMode={isDarkMode}
                    onToggleTheme={toggleTheme}
                />
            )}

            {/* Notificaciones */}
            {notification.show && (
                <UINotification
                    message={notification.message}
                    type={notification.type}
                    onClose={hideNotification}
                    duration={3000}
                    position="top-center"
                />
            )}

            {/* Indicador de carga */}
            {buildingsLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner" />
                    <p>Cargando mapa...</p>
                </div>
            )}
        </div>
    );
}

export default UserMapView;
