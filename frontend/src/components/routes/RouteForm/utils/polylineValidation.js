// components/routes/RouteForm/utils/polylineValidation.js

/**
 * Valida los datos de una ruta antes de guardar
 * @param {object} routeData - Datos de la ruta
 * @param {Array} points - Puntos de la ruta
 * @returns {object} {isValid, errors}
 */
export const validateRouteData = (routeData, points) => {
    const errors = [];

    // Validar nombre
    if (!routeData.nombre || routeData.nombre.trim() === "") {
        errors.push("El nombre de la ruta es obligatorio");
    }

    // Validar tipo
    if (!routeData.tipo) {
        errors.push("Debe seleccionar un tipo de ruta");
    }

    // Validar puntos
    if (!points || points.length < 2) {
        errors.push("La ruta debe tener al menos 2 puntos");
    }

    // Validar longitud
    if (routeData.distancia && routeData.distancia < 1) {
        errors.push("La ruta debe tener una longitud válida");
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};
