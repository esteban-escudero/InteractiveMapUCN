// components/user/hooks/useUserMapHandlers.js
import { useCallback } from "react";
import L from "leaflet";

/**
 * Hook que proporciona handlers para el mapa de usuario
 * @param {object} params - Parámetros del hook
 * @returns {object} Handlers del mapa
 */
export const useUserMapHandlers = ({
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
}) => {
    // Manejar selección de ubicación en el mapa
    const handleLocationSelect = useCallback(
        (location) => {
            setSelectedLocation(location);
            setShowInfoPanel(true);

            if (mapInstance && location.ubicacion) {
                const coords = location.ubicacion.coordinates;
                mapInstance.setView([coords[1], coords[0]], 18);
            }
        },
        [mapInstance, setSelectedLocation, setShowInfoPanel]
    );

    // Manejar cálculo de ruta
    const handleCalculateRoute = useCallback(async () => {
        if (!routeOrigin || !routeDestination) {
            showUINotification("Selecciona origen y destino", "warning");
            return;
        }

        try {
            showUINotification(`Calculando ruta ${routeType}...`, "info");

            // Obtener coordenadas del origen
            let originCoords;
            if (routeOrigin === 'gps') {
                if (!userPosition) {
                    showUINotification("Esperando ubicación GPS...", "warning");
                    return;
                }
                originCoords = {
                    lat: userPosition.latitude,
                    lng: userPosition.longitude
                };
            } else {
                const coords = routeOrigin.ubicacion.coordinates;
                originCoords = { lat: coords[1], lng: coords[0] };
            }

            // Obtener coordenadas del destino
            const destCoords = routeDestination.ubicacion.coordinates;
            const destinationCoords = { lat: destCoords[1], lng: destCoords[0] };

            // 🔥 USAR NUEVO SERVICIO DE BACKEND CON DIJKSTRA
            const { routeService } = await import('../../../services/routeService');
            const result = await routeService.calculateRoute(
                originCoords,
                destinationCoords,
                routeType
            );

            if (result && result.geometry) {
                const calculatedRouteData = {
                    origin: routeOrigin,
                    destination: routeDestination,
                    distance: `${result.distance}m`,
                    duration: `${result.estimatedTime} min`,
                    path: result.geometry.coordinates,
                    geometria: result.geometry,
                    tipo: result.routeType,
                    routesUsed: result.routesUsed,
                };

                setCalculatedRoute(calculatedRouteData);

                // Dibujar la ruta en el mapa
                if (mapInstance && calculatedRouteData.path.length > 0) {
                    // Limpiar rutas anteriores calculadas
                    mapInstance.eachLayer((layer) => {
                        if (
                            layer instanceof L.Polyline &&
                            layer.options.className === "calculated-route"
                        ) {
                            mapInstance.removeLayer(layer);
                        }
                    });

                    // Colores según tipo de ruta
                    const routeColors = {
                        peatonal: "#4a235a",
                        accesible: "#2ecc71",
                    };

                    // Dibujar nueva ruta
                    const latLngs = calculatedRouteData.path.map((coord) => [
                        coord[1],
                        coord[0],
                    ]);
                    L.polyline(latLngs, {
                        color: routeColors[result.routeType] || "#4a235a",
                        weight: 6,
                        opacity: 0.9,
                        className: "calculated-route",
                        dashArray: "10, 5",
                    }).addTo(mapInstance);

                    // Ajustar vista
                    const bounds = L.latLngBounds(latLngs);
                    mapInstance.fitBounds(bounds, { padding: [50, 50] });
                }

                showUINotification(
                    `Ruta ${result.routeType} encontrada: ${result.distance}m, ${result.estimatedTime} min`,
                    "success"
                );

                // Cerrar el panel de rutas automáticamente
                setShowRoutePanel(false);
            } else {
                showUINotification(
                    "No se encontró una ruta disponible",
                    "warning"
                );
            }
        } catch (error) {
            console.error("Error calculando ruta:", error);

            // Manejar errores específicos
            if (error.message && error.message.includes('No hay rutas')) {
                showUINotification(
                    `No hay rutas ${routeType} disponibles en el sistema`,
                    "warning"
                );
            } else if (error.message && error.message.includes('No se encontró un camino')) {
                showUINotification(
                    "No existe un camino entre origen y destino",
                    "warning"
                );
            } else {
                showUINotification("Error al calcular ruta", "error");
            }
        }
    }, [
        routeOrigin,
        routeDestination,
        routeType,
        userPosition,
        showUINotification,
        setCalculatedRoute,
        setShowRoutePanel,
        mapInstance,
    ]);

    // Manejar ubicación actual (GPS)
    const handleMyLocation = useCallback(() => {
        getCurrentPosition();

        if (userPosition && mapInstance) {
            // Limpiar marcadores GPS anteriores
            mapInstance.eachLayer((layer) => {
                if (layer.options && layer.options.className === "gps-marker-layer") {
                    mapInstance.removeLayer(layer);
                }
            });

            // Crear círculo de precisión
            L.circle(
                [userPosition.latitude, userPosition.longitude],
                {
                    radius: userPosition.accuracy || 50,
                    color: "#4285F4",
                    fillColor: "#4285F4",
                    fillOpacity: 0.1,
                    weight: 1,
                    className: "gps-marker-layer"
                }
            ).addTo(mapInstance);

            // Crear marcador de ubicación con animación
            L.marker([userPosition.latitude, userPosition.longitude], {
                icon: L.divIcon({
                    className: "user-location-marker",
                    html: `
                        <div class="gps-marker">
                            <div class="gps-dot"></div>
                            <div class="gps-pulse"></div>
                        </div>
                    `,
                    iconSize: [40, 40],
                }),
                className: "gps-marker-layer"
            }).addTo(mapInstance);

            // Centrar mapa en ubicación
            mapInstance.setView(
                [userPosition.latitude, userPosition.longitude],
                18
            );

            showUINotification("Ubicación encontrada", "success");
        } else if (geoError) {
            showUINotification(geoError, "error");
        }
    }, [
        getCurrentPosition,
        userPosition,
        mapInstance,
        geoError,
        showUINotification,
    ]);

    return {
        handleLocationSelect,
        handleCalculateRoute,
        handleMyLocation,
    };
};
