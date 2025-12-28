// utils/routing/graphAlgorithms.js

/**
 * Implementación del algoritmo de Dijkstra para encontrar el camino más corto
 * @param {object} graph - Grafo de edificios con conexiones
 * @param {string} start - Nombre del edificio de inicio
 * @param {string} end - Nombre del edificio de destino
 * @returns {object|null} {path, totalDistance, isValid} o null si no hay camino
 */
export const findShortestPath = (graph, start, end) => {
    if (!graph[start] || !graph[end]) {
        console.log(`No hay datos para ${start} o ${end}`);
        return null;
    }

    const distances = {};
    const previous = {};
    const unvisited = new Set();

    // Inicializar
    Object.keys(graph).forEach((building) => {
        distances[building] = Infinity;
        previous[building] = null;
        unvisited.add(building);
    });

    distances[start] = 0;

    // Dijkstra
    while (unvisited.size > 0) {
        let current = null;
        for (const building of unvisited) {
            if (current === null || distances[building] < distances[current]) {
                current = building;
            }
        }

        if (current === null || distances[current] === Infinity) break;
        if (current === end) break;

        unvisited.delete(current);

        for (const neighbor in graph[current].connections) {
            if (!unvisited.has(neighbor)) continue;

            const alt =
                distances[current] + graph[current].connections[neighbor].distance;

            if (alt < distances[neighbor]) {
                distances[neighbor] = alt;
                previous[neighbor] = {
                    from: current,
                    connection: graph[current].connections[neighbor],
                };
            }
        }
    }

    // Reconstruir camino
    const path = [];
    let current = end;

    while (previous[current]) {
        path.unshift(previous[current].connection);
        current = previous[current].from;
    }

    return {
        path,
        totalDistance: distances[end],
        isValid: path.length > 0 && distances[end] < Infinity,
    };
};
