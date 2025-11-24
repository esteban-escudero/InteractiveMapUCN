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

            // Usar getPrioritizedRoutes para calcular ruta óptima con Dijkstra
            const calculatedRoutes = getPrioritizedRoutes(
                routeOrigin.nombre,
                routeDestination.nombre
            );

            if (calculatedRoutes && calculatedRoutes.length > 0) {
                // Filtrar por tipo de ruta seleccionado
                let optimalRoute = calculatedRoutes.find((r) => r.tipo === routeType);

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
                    segmentos: optimalRoute.segmentos,
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
                        rapida: "#e74c3c",
                        emergencia: "#f39c12",
                        vehicular: "#3498db",
                    };

                    // Dibujar nueva ruta
                    const latLngs = calculatedRouteData.path.map((coord) => [
                        coord[1],
                        coord[0],
                    ]);
                    L.polyline(latLngs, {
                        color: routeColors[optimalRoute.tipo] || "#4a235a",
                        weight: 6,
                        opacity: 0.9,
                        className: "calculated-route",
                        dashArray: "10, 5",
                    }).addTo(mapInstance);

                    // Ajustar vista
                    const bounds = L.latLngBounds(latLngs);
                    mapInstance.fitBounds(bounds, { padding: [50, 50] });
                }

                showUINotification(`Ruta ${optimalRoute.tipo} encontrada.`, "success");

                // Cerrar el panel de rutas automáticamente
                setShowRoutePanel(false);
            } else {
                showUINotification(
                    "No hay rutas disponibles entre estos edificios",
                    "warning"
                );
            }
        } catch (error) {
            console.error("Error calculando ruta:", error);
            showUINotification("Error al calcular ruta", "error");
        }
    }, [
        routeOrigin,
        routeDestination,
        routeType,
        getPrioritizedRoutes,
        showUINotification,
        setCalculatedRoute,
        setShowRoutePanel,
        mapInstance,
    ]);

    // Manejar ubicación actual (GPS)
    const handleMyLocation = useCallback(() => {
        getCurrentPosition();

        if (userPosition && mapInstance) {
            mapInstance.setView(
                [userPosition.latitude, userPosition.longitude],
                18
            );

            L.marker([userPosition.latitude, userPosition.longitude], {
                icon: L.divIcon({
                    className: "user-location-marker",
                    html: '<div class="pulse"></div>',
                    iconSize: [20, 20],
                }),
            }).addTo(mapInstance);

            showUINotification("Ubicación encontrada", "success");
        } else if (geoError) {
            showUINotification("No se pudo obtener tu ubicación", "error");
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
