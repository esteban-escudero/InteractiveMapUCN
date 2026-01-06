// hooks/user/useURLParams.js
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';

/**
 * Hook para manejar parámetros de URL (para QR codes)
 * Parámetros soportados:
 * - building: ID del edificio
 * - floor: Número de piso
 * - poi: Punto de interés
 * - to: Destino para calcular ruta
 * 
 * Ejemplos:
 * /?building=edificio-a
 * /?building=edificio-a&floor=2
 * /?poi=biblioteca-central
 * /?to=sala-101
 */
export const useURLParams = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { toParam } = useParams();
    const [urlParams, setUrlParams] = useState(null);

    // Extraer parámetros al montar
    useEffect(() => {
        const params = {
            building: searchParams.get('building'),
            floor: searchParams.get('floor'),
            poi: searchParams.get('poi'),
            to: searchParams.get('to') || toParam,
            from: searchParams.get('from')
        };

        // Solo establecer si hay algún parámetro
        if (Object.values(params).some(val => val !== null)) {
            setUrlParams(params);
        }
    }, [searchParams, toParam]);

    /**
     * Navegar a una ubicación basada en parámetros URL
     */
    const navigateToLocation = useCallback((params, buildings, mapInstance, setSelectedLocation, setShowInfoPanel) => {
        if (!params || !buildings || !mapInstance) return;

        let targetBuilding = null;

        // Buscar por building ID
        if (params.building) {
            targetBuilding = buildings.find(b =>
                b.id === params.building ||
                b.nombre?.toLowerCase().includes(params.building.toLowerCase()) ||
                b.name?.toLowerCase().includes(params.building.toLowerCase())
            );
        }

        // Buscar por POI
        if (params.poi && !targetBuilding) {
            targetBuilding = buildings.find(b =>
                b.category === params.poi ||
                b.nombre?.toLowerCase().includes(params.poi.toLowerCase()) ||
                b.name?.toLowerCase().includes(params.poi.toLowerCase())
            );
        }

        // Si encontramos el edificio, navegar a él
        if (targetBuilding) {
            const coords = targetBuilding.coordinates ||
                (targetBuilding.geometry?.coordinates ?
                    [targetBuilding.geometry.coordinates[1], targetBuilding.geometry.coordinates[0]] :
                    null);

            if (coords) {
                mapInstance.setView(coords, 18);
                setSelectedLocation(targetBuilding);
                setShowInfoPanel(true);
            }
        }

        // Si hay parámetro 'to', preparar para calcular ruta
        if (params.to) {
            const destination = buildings.find(b =>
                b.id === params.to ||
                b.nombre?.toLowerCase().includes(params.to.toLowerCase()) ||
                b.name?.toLowerCase().includes(params.to.toLowerCase())
            );

            if (destination) {
                // Aquí se podría activar automáticamente el panel de rutas
                console.log('Destino para ruta:', destination);
            }
        }
    }, []);

    /**
     * Actualizar parámetros de URL
     */
    const updateURLParams = useCallback((newParams) => {
        const current = Object.fromEntries(searchParams);
        const updated = { ...current, ...newParams };

        // Remover parámetros null o undefined
        Object.keys(updated).forEach(key => {
            if (updated[key] === null || updated[key] === undefined) {
                delete updated[key];
            }
        });

        setSearchParams(updated);
    }, [searchParams, setSearchParams]);

    /**
     * Limpiar todos los parámetros
     */
    const clearURLParams = useCallback(() => {
        setSearchParams({});
        setUrlParams(null);
    }, [setSearchParams]);

    /**
     * Generar URL para compartir
     */
    const generateShareURL = useCallback((params) => {
        const baseURL = window.location.origin + window.location.pathname;
        const queryParams = new URLSearchParams(params).toString();
        return queryParams ? `${baseURL}?${queryParams}` : baseURL;
    }, []);

    return {
        urlParams,
        navigateToLocation,
        updateURLParams,
        clearURLParams,
        generateShareURL
    };
};
