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
        const searchTerm = (params.to || params.building || params.poi || "").toLowerCase().trim();

        if (!searchTerm) return;

        // Función de normalización para búsqueda flexible
        const normalize = (str) => str.toLowerCase().replace(/[\s-]/g, '');
        const normalizedSearch = normalize(searchTerm);

        // 1. Intentar encontrar por edificio (ID o nombre)
        targetBuilding = buildings.find(b => {
            const id = b.id ? normalize(String(b.id)) : "";
            const nombre = b.nombre ? normalize(b.nombre) : "";
            const name = b.name ? normalize(b.name) : "";

            return id === normalizedSearch ||
                nombre.includes(normalizedSearch) ||
                (name && name.includes(normalizedSearch));
        });

        // 2. Si no es un edificio, buscar en las salas de todos los edificios
        if (!targetBuilding) {
            for (const b of buildings) {
                if (b.salas && Array.isArray(b.salas)) {
                    const foundSala = b.salas.find(s => {
                        const nombreSala = s.nombre_sala ? normalize(s.nombre_sala) : "";
                        // Búsqueda exacta o contenida para salas
                        return nombreSala === normalizedSearch || nombreSala.includes(normalizedSearch);
                    });

                    if (foundSala) {
                        targetBuilding = b;
                        console.log(`Sala "${foundSala.nombre_sala}" encontrada en edificio "${b.nombre}"`);
                        break;
                    }
                }
            }
        }

        // Si encontramos el edificio (directamente o por una de sus salas), navegar a él
        if (targetBuilding) {
            const coords = targetBuilding.coordinates ||
                (targetBuilding.geometry?.coordinates ?
                    [targetBuilding.geometry.coordinates[1], targetBuilding.geometry.coordinates[0]] :
                    null);

            if (coords) {
                mapInstance.setView(coords, 19); // Un poco más de zoom para salas
                setSelectedLocation(targetBuilding);
                setShowInfoPanel(true);
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
