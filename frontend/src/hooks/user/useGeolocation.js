// hooks/user/useGeolocation.js
import { useState, useCallback } from 'react';

/**
 * Hook para manejar la geolocalización del usuario
 * @returns {Object} Estado y funciones de geolocalización
 */
export const useGeolocation = () => {
    const [position, setPosition] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Opciones de geolocalización
    const geoOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
    };

    /**
     * Obtener posición actual del usuario
     */
    const getCurrentPosition = useCallback(() => {
        if (!navigator.geolocation) {
            setError('Geolocalización no soportada en este navegador');
            return;
        }

        setLoading(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setPosition({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    accuracy: pos.coords.accuracy,
                    timestamp: pos.timestamp
                });
                setLoading(false);
            },
            (err) => {
                let errorMessage = 'Error al obtener ubicación';

                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        errorMessage = 'Permiso de ubicación denegado';
                        break;
                    case err.POSITION_UNAVAILABLE:
                        errorMessage = 'Ubicación no disponible';
                        break;
                    case err.TIMEOUT:
                        errorMessage = 'Tiempo de espera agotado';
                        break;
                    default:
                        errorMessage = 'Error desconocido';
                }

                setError(errorMessage);
                setLoading(false);
            },
            geoOptions
        );
    }, []);

    /**
     * Observar cambios en la posición (tracking)
     */
    const watchPosition = useCallback(() => {
        if (!navigator.geolocation) {
            setError('Geolocalización no soportada');
            return null;
        }

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                setPosition({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                    accuracy: pos.coords.accuracy,
                    timestamp: pos.timestamp
                });
            },
            (err) => {
                setError(err.message);
            },
            geoOptions
        );

        return watchId;
    }, []);

    /**
     * Detener observación de posición
     */
    const clearWatch = useCallback((watchId) => {
        if (watchId && navigator.geolocation) {
            navigator.geolocation.clearWatch(watchId);
        }
    }, []);

    /**
     * Calcular distancia entre dos puntos (en metros)
     */
    const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
        const R = 6371e3; // Radio de la Tierra en metros
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distancia en metros
    }, []);

    return {
        position,
        error,
        loading,
        getCurrentPosition,
        watchPosition,
        clearWatch,
        calculateDistance
    };
};
