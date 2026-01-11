// components/user/hooks/useUserMapHandlers.js
import { useCallback, useEffect, useRef } from "react";
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
    buildings,
    urlParams,
    setRouteOrigin,
    setRouteDestination,
}) => {
    // Para evitar múltiples cálculos automáticos
    const hasAutoRouted = useRef(false);
    /**
     * Dibuja el marcador GPS y el círculo de precisión en el mapa
     */
    const renderGPSMarker = useCallback((position, map) => {
        if (!position || !map) return;

        // Limpiar marcadores GPS anteriores
        map.eachLayer((layer) => {
            if (layer.options && layer.options.className === "gps-marker-layer") {
                map.removeLayer(layer);
            }
        });

        // Crear círculo de precisión (más pequeño y con tope)
        L.circle(
            [position.latitude, position.longitude],
            {
                radius: Math.min(position.accuracy || 10, 15),
                color: "#4285F4",
                fillColor: "#4285F4",
                fillOpacity: 0.1,
                weight: 1,
                className: "gps-marker-layer"
            }
        ).addTo(map);

        // Crear marcador de ubicación con animación
        L.marker([position.latitude, position.longitude], {
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
        }).addTo(map);
    }, []);

    /**
     * EFECTO: Seguimiento automático
     * Se activa cada vez que la posición GPS cambia.
     */
    useEffect(() => {
        if (userPosition && mapInstance) {
            // Actualizar marcador visual
            renderGPSMarker(userPosition, mapInstance);

            // Centrar el mapa automáticamente en la nueva posición
            mapInstance.setView(
                [userPosition.latitude, userPosition.longitude],
                mapInstance.getZoom() // Mantiene el zoom actual del usuario
            );
        }
    }, [userPosition, mapInstance, renderGPSMarker]);

    /**
     * EFECTO: Ruta automática desde URL
     * Se activa al cargar si hay un parámetro 'to' en la URL
     */
    useEffect(() => {
        if (urlParams && urlParams.to && buildings && buildings.length > 0 && mapInstance && userPosition && !hasAutoRouted.current) {
            const destination = buildings.find(b =>
                b.id === urlParams.to ||
                b.nombre?.toLowerCase().includes(urlParams.to.toLowerCase()) ||
                b.name?.toLowerCase().includes(urlParams.to.toLowerCase())
            );

            if (destination) {
                console.log("Calculando ruta automática a:", destination.nombre || destination.name);
                hasAutoRouted.current = true;
                setRouteOrigin("gps");
                setRouteDestination(destination);

                // Pequeño delay para asegurar que el estado se actualice o usar los valores directamente
                const triggerAutoRoute = async () => {
                    try {
                        const originCoords = {
                            lat: userPosition.latitude,
                            lng: userPosition.longitude
                        };

                        // Obtener coordenadas del destino con validación
                        let destCoords;
                        if (destination.ubicacion?.coordinates) {
                            destCoords = destination.ubicacion.coordinates;
                        } else if (destination.geometry?.coordinates) {
                            destCoords = destination.geometry.coordinates;
                        } else {
                            throw new Error(`El edificio ${destination.nombre || destination.name} no tiene coordenadas válidas`);
                        }

                        const destinationCoords = { lat: destCoords[1], lng: destCoords[0] };

                        showUINotification(`Calculando ruta automática a ${destination.nombre || destination.name}...`, "info");

                        const { routeService } = await import('../../../services/routeService');
                        const result = await routeService.calculateRoute(
                            originCoords,
                            destinationCoords,
                            routeType
                        );

                        if (result && result.geometry) {
                            const calculatedRouteData = {
                                origin: "gps",
                                destination: destination,
                                distance: `${result.distance} metros`,
                                duration: `${result.estimatedTime} minutos`,
                                path: result.geometry.coordinates,
                                geometria: result.geometry,
                                tipo: result.routeType,
                                routesUsed: result.routesUsed,
                            };
                            setCalculatedRoute([calculatedRouteData]);

                            // Dibujar ruta
                            const latLngs = result.geometry.coordinates.map(c => [c[1], c[0]]);
                            L.polyline(latLngs, {
                                color: "#a431d2ff",
                                weight: 6,
                                opacity: 0.9,
                                className: "calculated-route",
                            }).addTo(mapInstance);

                            mapInstance.setView([originCoords.lat, originCoords.lng], 18);
                            showUINotification(`Ruta a ${destination.nombre || destination.name}: ${result.distance} metros`, "success");
                        } else {
                            showUINotification("No se pudo calcular la ruta", "warning");
                        }
                    } catch (err) {
                        console.error("Error en ruta automática:", err);
                        showUINotification(err.message || "Error al calcular ruta automática", "error");
                    }
                };

                triggerAutoRoute();
            } else {
                console.warn(`No se encontró el edificio: ${urlParams.to}`);
                showUINotification(`No se encontró el edificio "${urlParams.to}"`, "warning");
            }
        }
    }, [urlParams, buildings, mapInstance, userPosition, routeType, setCalculatedRoute, setRouteOrigin, setRouteDestination, showUINotification]);
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
            if (routeOrigin === "gps") {
                if (!userPosition) {
                    showUINotification("Esperando ubicación GPS...", "warning");
                    return;
                }
                originCoords = {
                    lat: userPosition.latitude,
                    lng: userPosition.longitude
                };

                // Asegurar que el marcador se vea al calcular
                renderGPSMarker(userPosition, mapInstance);
            } else {
                const coords = routeOrigin.ubicacion.coordinates;
                originCoords = { lat: coords[1], lng: coords[0] };
            }

            // Obtener coordenadas del destino
            const destCoords = routeDestination.ubicacion.coordinates;
            const destinationCoords = { lat: destCoords[1], lng: destCoords[0] };

            // USAR NUEVO SERVICIO DE BACKEND CON DIJKSTRA
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
                    distance: `${result.distance}metros`,
                    duration: `${result.estimatedTime} minutos`,
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
                        peatonal: "#a431d2ff",
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
                    }).addTo(mapInstance);

                    // Ajustar vista al origen
                    mapInstance.setView([originCoords.lat, originCoords.lng], 18);
                }

                showUINotification(
                    `Ruta ${result.routeType} encontrada: ${result.distance}metros, ${result.estimatedTime} minutos`,
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

            // Priorizar el mensaje específico del backend
            const errorMessage = error.message || "Error al calcular ruta";
            const lowerMessage = errorMessage.toLowerCase();

            if (lowerMessage.includes('no hay ruta') ||
                lowerMessage.includes('no se encontró') ||
                lowerMessage.includes('muy lejos') ||
                lowerMessage.includes('contacte al administrador')) {
                showUINotification(errorMessage, "warning");
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
        renderGPSMarker,
    ]);

    // Manejar ubicación actual (GPS)
    const handleMyLocation = useCallback(() => {
        getCurrentPosition();

        if (userPosition && mapInstance) {
            renderGPSMarker(userPosition, mapInstance);

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
        renderGPSMarker,
    ]);

    return {
        handleLocationSelect,
        handleCalculateRoute,
        handleMyLocation,
    };
};
