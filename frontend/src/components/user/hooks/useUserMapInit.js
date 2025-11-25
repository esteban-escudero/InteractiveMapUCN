// components/user/hooks/useUserMapInit.js
import { useEffect } from "react";
import L from "leaflet";
import { MAP_CONFIG } from "../../../config/app.js";

/**
 * Hook para inicializar el mapa de usuario
 * @param {object} mapRef - Referencia al contenedor del mapa
 * @param {boolean} mapInitialized - Si el mapa ya fue inicializado
 * @param {function} setMapInstance - Setter para la instancia del mapa
 * @param {function} setMapInitialized - Setter para el estado de inicialización
 * @param {function} loadBuildings - Función para cargar edificios
 * @param {function} loadRoutes - Función para cargar rutas
 * @param {function} showUINotification - Función para mostrar notificaciones
 */
export const useUserMapInit = (
    mapRef,
    mapInitialized,
    setMapInstance,
    setMapInitialized,
    loadBuildings,
    loadRoutes,
    showUINotification
) => {
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
                        scrollWheelZoom: false, // Desactivar zoom con rueda del mouse
                        doubleClickZoom: false, // Desactivar zoom con doble click
                        touchZoom: false, // Desactivar zoom táctil
                        boxZoom: false, // Desactivar zoom con selección de área
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
                } catch (error) {
                    console.error("Error inicializando mapa:", error);
                    showUINotification("Error al cargar el mapa", "error");
                }
            }
        }
    }, [
        mapRef,
        mapInitialized,
        setMapInstance,
        setMapInitialized,
        loadBuildings,
        loadRoutes,
        showUINotification,
    ]);
};
