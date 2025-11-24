// components/user/UserMapView.jsx
import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./UserMapView.css";
import "./dark-mode.css";
import "./info-modal.css";
import "./rounded-search.css";

// Hooks
import useBuildings from "../../hooks/buildings/useBuildings.js";
import useRoutes from "../../hooks/routes/useRoutes.js";
import { useRouteIntelligence } from "../../hooks/routes/useRouteIntelligence.js";
import { useNotification } from "../../hooks/common/useNotification.js";
import { useURLParams } from "../../hooks/user/useURLParams.js";
import { useGeolocation } from "../../hooks/user/useGeolocation.js";
import { useTheme } from "../../hooks/user/useTheme.js";

// Configuración
import { MAP_CONFIG } from "../../config/app.js";

// Componentes
import { UINotification } from "../ui/index.js";
import BuildingRenderer from "../map/BuildingRenderer/BuildingRenderer";
import RouteLayer from "../map/RouteLayer/RouteLayer";
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

    // Debug: Log routes
    useEffect(() => {
        console.log("📍 UserMapView - Rutas cargadas:", routes?.length || 0);
        if (routes && routes.length > 0) {
            console.log("📍 Primera ruta:", routes[0]);
        }
    }, [routes]);

    // Notificaciones
    const { notification, showUINotification, hideNotification } = useNotification();

    // Geolocalización
    const {
        position: userPosition,
        error: geoError,
        loading: geoLoading,
        getCurrentPosition
    } = useGeolocation();

    // Parámetros de URL (para QR codes)
    const { urlParams, navigateToLocation } = useURLParams();

    // Tema (modo oscuro)
    const { isDarkMode, toggleTheme } = useTheme();

    // Inicializar mapa
    useEffect(() => {
        if (mapRef.current && !mapInitialized) {
            if (!mapRef.current._leaflet_id) {
                try {
                    const map = L.map(mapRef.current, {
                        minZoom: MAP_CONFIG.zoom.min,
                        maxZoom: MAP_CONFIG.zoom.max,
                        zoomControl: false,
                        attributionControl: false,
                        maxBoundsViscosity: 1.0,
                    });

                    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                        minZoom: MAP_CONFIG.zoom.min,
                        maxZoom: MAP_CONFIG.zoom.max,
                    }).addTo(map);

                    const bounds = L.latLngBounds(MAP_CONFIG.bounds);
                    map.fitBounds(bounds, {
                        padding: [20, 20],
                        maxZoom: MAP_CONFIG.zoom.default,
                    });
                    map.setMaxBounds(bounds);

                    setMapInstance(map);
                    setMapInitialized(true);

                    loadBuildings();
                    loadRoutes();

                    console.log("Mapa inicializado con bounds de UCN:", MAP_CONFIG.bounds);
                } catch (error) {
                    console.error("Error inicializando mapa:", error);
                    showUINotification("Error al cargar el mapa", "error");
                }
            }
        }
    }, [mapRef, mapInitialized, loadBuildings, loadRoutes, showUINotification]);

    // Manejar parámetros de URL (QR codes)
    useEffect(() => {
        if (urlParams && buildings.length > 0 && mapInstance) {
            navigateToLocation(urlParams, buildings, mapInstance, setSelectedLocation, setShowInfoPanel);
        }
    }, [urlParams, buildings, mapInstance, navigateToLocation]);

    // Manejar selección de ubicación en el mapa
    const handleLocationSelect = (location) => {
        setSelectedLocation(location);
        setShowInfoPanel(true);

        if (mapInstance && location.ubicacion) {
            const coords = location.ubicacion.coordinates;
            mapInstance.setView([coords[1], coords[0]], 18);
        }
    };

    // Manejar cálculo de ruta
    const handleCalculateRoute = async () => {
        if (!routeOrigin || !routeDestination) {
            showUINotification("Selecciona origen y destino", "warning");
            return;
        }

        try {
            showUINotification(`Calculando ruta ${routeType}...`, "info");

            // Usar getPrioritizedRoutes para calcular ruta óptima con Dijkstra
            const calculatedRoutes = getPrioritizedRoutes(
                routeOrigin.nombre,
                routeDestination.nombre
            );

            if (calculatedRoutes && calculatedRoutes.length > 0) {
                // Filtrar por tipo de ruta seleccionado
                let optimalRoute = calculatedRoutes.find(r => r.tipo === routeType);

                // Si no hay ruta del tipo seleccionado, tomar la más corta disponible
                if (!optimalRoute) {
                    optimalRoute = calculatedRoutes[0];
                    showUINotification(
                        `No hay ruta ${routeType} disponible. Mostrando ruta ${optimalRoute.tipo}`,
                        "warning"
                    );
                }

                const calculatedRouteData = {
                    origin: routeOrigin,
                    destination: routeDestination,
                    distance: `${optimalRoute.distancia || 0}m`,
                    duration: `${optimalRoute.tiempo_estimado || 0} min`,
                    path: optimalRoute.geometria.coordinates,
                    geometria: optimalRoute.geometria,
                    tipo: optimalRoute.tipo,
                    segmentos: optimalRoute.segmentos
                };

                setCalculatedRoute(calculatedRouteData);

                // Dibujar la ruta en el mapa
                if (mapInstance && calculatedRouteData.path.length > 0) {
                    // Limpiar rutas anteriores calculadas
                    mapInstance.eachLayer((layer) => {
                        if (layer instanceof L.Polyline && layer.options.className === 'calculated-route') {
                            mapInstance.removeLayer(layer);
                        }
                    });

                    // Colores según tipo de ruta
                    const routeColors = {
                        peatonal: '#4a235a',
                        accesible: '#2ecc71',
                        rapida: '#e74c3c',
                        emergencia: '#f39c12',
                        vehicular: '#3498db'
                    };

                    // Dibujar nueva ruta
                    const latLngs = calculatedRouteData.path.map(coord => [coord[1], coord[0]]);
                    L.polyline(latLngs, {
                        color: routeColors[optimalRoute.tipo] || '#4a235a',
                        weight: 6,
                        opacity: 0.9,
                        className: 'calculated-route',
                        dashArray: '10, 5'
                    }).addTo(mapInstance);

                    // Ajustar vista
                    const bounds = L.latLngBounds(latLngs);
                    mapInstance.fitBounds(bounds, { padding: [50, 50] });
                }

                showUINotification(
                    `Ruta ${optimalRoute.tipo} encontrada.`,
                    "success"
                );

                // Cerrar el panel de rutas automáticamente
                setShowRoutePanel(false);
            } else {
                showUINotification("No hay rutas disponibles entre estos edificios", "warning");
            }
        } catch (error) {
            console.error("Error calculando ruta:", error);
            showUINotification("Error al calcular ruta", "error");
        }
    };

    // Manejar ubicación actual (GPS)
    const handleMyLocation = () => {
        getCurrentPosition();

        if (userPosition && mapInstance) {
            mapInstance.setView([userPosition.latitude, userPosition.longitude], 18);

            L.marker([userPosition.latitude, userPosition.longitude], {
                icon: L.divIcon({
                    className: 'user-location-marker',
                    html: '<div class="pulse"></div>',
                    iconSize: [20, 20]
                })
            }).addTo(mapInstance);

            showUINotification("Ubicación encontrada", "success");
        } else if (geoError) {
            showUINotification("No se pudo obtener tu ubicación", "error");
        }
    };

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
