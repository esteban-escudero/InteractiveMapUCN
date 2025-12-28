const routeModel = require('../models/routeModel');

/**
 * Servicio para construcción de grafo de rutas y pathfinding
 */
class RouteGraphService {
    /**
     * Calcular distancia entre dos puntos (Haversine)
     * @param {Object} point1 - {lat, lng}
     * @param {Object} point2 - {lat, lng}
     * @returns {number} Distancia en metros
     */
    calculateDistance(point1, point2) {
        const R = 6371000; // Radio de la Tierra en metros
        const lat1 = point1.lat * Math.PI / 180;
        const lat2 = point2.lat * Math.PI / 180;
        const deltaLat = (point2.lat - point1.lat) * Math.PI / 180;
        const deltaLng = (point2.lng - point1.lng) * Math.PI / 180;

        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Fusionar nodos cercanos (dentro del threshold)
     * @param {Array} nodes - Array de nodos {id, lat, lng}
     * @param {number} threshold - Distancia en metros
     * @returns {Array} Nodos fusionados
     */
    mergeCloseNodes(nodes, threshold = 5) {
        const merged = [];
        const processed = new Set();

        nodes.forEach((node, index) => {
            if (processed.has(index)) return;

            const cluster = [node];
            processed.add(index);

            // Buscar nodos cercanos
            for (let i = index + 1; i < nodes.length; i++) {
                if (processed.has(i)) continue;

                const distance = this.calculateDistance(node, nodes[i]);
                if (distance <= threshold) {
                    cluster.push(nodes[i]);
                    processed.add(i);
                }
            }

            // Crear nodo fusionado (promedio de coordenadas)
            const avgLat = cluster.reduce((sum, n) => sum + n.lat, 0) / cluster.length;
            const avgLng = cluster.reduce((sum, n) => sum + n.lng, 0) / cluster.length;

            merged.push({
                id: merged.length,
                lat: avgLat,
                lng: avgLng,
                originalIds: cluster.map(n => n.id)
            });
        });

        return merged;
    }

    /**
     * Construir grafo SOLO de rutas del tipo especificado
     * @param {Array} routes - Array de rutas
     * @param {string} routeType - Tipo de ruta (peatonal, accesible, etc.)
     * @returns {Object} {nodes, edges}
     */
    buildRouteGraph(routes, routeType) {
        console.log(`Construyendo grafo para tipo: ${routeType}`);

        // FILTRAR por tipo de ruta
        const filteredRoutes = routes.filter(r => r.tipo === routeType);
        console.log(`   Rutas filtradas: ${filteredRoutes.length} de ${routes.length}`);

        if (filteredRoutes.length === 0) {
            return { nodes: [], edges: [] };
        }

        const nodes = [];
        const edges = [];
        let nodeId = 0;

        // Extraer puntos de todas las rutas del mismo tipo
        filteredRoutes.forEach(route => {
            const coords = route.geometria.coordinates;

            for (let i = 0; i < coords.length - 1; i++) {
                const from = {
                    id: nodeId++,
                    lat: coords[i][1],
                    lng: coords[i][0],
                    routeId: route.id
                };
                const to = {
                    id: nodeId++,
                    lat: coords[i + 1][1],
                    lng: coords[i + 1][0],
                    routeId: route.id
                };

                nodes.push(from, to);

                const distance = this.calculateDistance(from, to);
                edges.push({
                    from: from.id,
                    to: to.id,
                    routeId: route.id,
                    distance,
                    type: route.tipo
                });
            }
        });

        console.log(`   Nodos antes de fusionar: ${nodes.length}`);

        // Identificar intersecciones (puntos a menos de 5m)
        const mergedNodes = this.mergeCloseNodes(nodes, 5);

        console.log(`   Nodos después de fusionar: ${mergedNodes.length}`);
        console.log(`   Aristas: ${edges.length}`);

        // Actualizar referencias de aristas a nodos fusionados
        const nodeMapping = this.createNodeMapping(nodes, mergedNodes);
        const updatedEdges = edges.map(edge => ({
            ...edge,
            from: nodeMapping[edge.from],
            to: nodeMapping[edge.to]
        }));

        return { nodes: mergedNodes, edges: updatedEdges };
    }

    /**
     * Crear mapeo de IDs originales a IDs fusionados
     */
    createNodeMapping(originalNodes, mergedNodes) {
        const mapping = {};

        mergedNodes.forEach(merged => {
            merged.originalIds.forEach(originalId => {
                mapping[originalId] = merged.id;
            });
        });

        return mapping;
    }

    /**
     * Encontrar nodo más cercano a un punto
     * @param {Array} nodes - Array de nodos
     * @param {Object} point - {lat, lng}
     * @returns {number} ID del nodo más cercano
     */
    findClosestNode(nodes, point) {
        let minDistance = Infinity;
        let closestNodeId = null;

        nodes.forEach(node => {
            const distance = this.calculateDistance(node, point);
            if (distance < minDistance) {
                minDistance = distance;
                closestNodeId = node.id;
            }
        });

        return closestNodeId;
    }

    /**
     * Algoritmo de Dijkstra para encontrar camino más corto
     * @param {Object} graph - {nodes, edges}
     * @param {number} startNodeId - ID del nodo inicial
     * @param {number} endNodeId - ID del nodo final
     * @returns {Array} Camino como array de IDs de nodos
     */
    dijkstra(graph, startNodeId, endNodeId) {
        const distances = {};
        const previous = {};
        const unvisited = new Set();

        // Inicializar todas las distancias como infinito
        graph.nodes.forEach(node => {
            distances[node.id] = Infinity;
            unvisited.add(node.id);
        });
        distances[startNodeId] = 0;

        while (unvisited.size > 0) {
            // Nodo no visitado con MENOR DISTANCIA
            const current = this.getMinDistanceNode(unvisited, distances);

            if (current === null || current === endNodeId) break;
            if (distances[current] === Infinity) break;

            unvisited.delete(current);

            // Actualizar distancias de vecinos
            const neighbors = this.getNeighbors(graph, current);
            neighbors.forEach(neighbor => {
                const edge = this.getEdge(graph, current, neighbor.id);
                if (!edge) return;

                const alt = distances[current] + edge.distance; //Sumar DISTANCIA

                if (alt < distances[neighbor.id]) {
                    distances[neighbor.id] = alt;
                    previous[neighbor.id] = current;
                }
            });
        }

        // Reconstruir camino más corto
        return this.reconstructPath(previous, startNodeId, endNodeId);
    }

    /**
     * Obtener nodo no visitado con menor distancia
     */
    getMinDistanceNode(unvisited, distances) {
        let minDistance = Infinity;
        let minNode = null;

        unvisited.forEach(nodeId => {
            if (distances[nodeId] < minDistance) {
                minDistance = distances[nodeId];
                minNode = nodeId;
            }
        });

        return minNode;
    }

    /**
     * Obtener vecinos de un nodo
     */
    getNeighbors(graph, nodeId) {
        const neighbors = [];

        graph.edges.forEach(edge => {
            if (edge.from === nodeId) {
                const neighborNode = graph.nodes.find(n => n.id === edge.to);
                if (neighborNode) neighbors.push(neighborNode);
            }
            // Grafo bidireccional
            if (edge.to === nodeId) {
                const neighborNode = graph.nodes.find(n => n.id === edge.from);
                if (neighborNode) neighbors.push(neighborNode);
            }
        });

        return neighbors;
    }

    /**
     * Obtener arista entre dos nodos
     */
    getEdge(graph, fromId, toId) {
        return graph.edges.find(e =>
            (e.from === fromId && e.to === toId) ||
            (e.to === fromId && e.from === toId)
        );
    }

    /**
     * Reconstruir camino desde el mapeo de nodos previos
     */
    reconstructPath(previous, startNodeId, endNodeId) {
        const path = [];
        let current = endNodeId;

        while (current !== undefined) {
            path.unshift(current);
            if (current === startNodeId) break;
            current = previous[current];
        }

        // Si no llegamos al inicio, no hay camino
        if (path[0] !== startNodeId) {
            return null;
        }

        return path;
    }

    /**
     * Combinar camino en geometría LineString
     */
    combinePath(path, graph) {
        if (!path || path.length === 0) return null;

        const coordinates = path.map(nodeId => {
            const node = graph.nodes.find(n => n.id === nodeId);
            return [node.lng, node.lat];
        });

        return {
            type: 'LineString',
            coordinates
        };
    }

    /**
     * Calcular distancia total del camino
     */
    calculateTotalDistance(path, graph) {
        let total = 0;

        for (let i = 0; i < path.length - 1; i++) {
            const edge = this.getEdge(graph, path[i], path[i + 1]);
            if (edge) total += edge.distance;
        }

        return Math.round(total);
    }

    /**
     * Obtener IDs únicos de rutas usadas
     */
    getUniqueRouteIds(path, graph) {
        const routeIds = new Set();

        for (let i = 0; i < path.length - 1; i++) {
            const edge = this.getEdge(graph, path[i], path[i + 1]);
            if (edge) routeIds.add(edge.routeId);
        }

        return Array.from(routeIds);
    }

    /**
     * Encontrar ruta óptima (más corta) entre origen y destino
     * @param {Object} origin - {lat, lng}
     * @param {Object} destination - {lat, lng}
     * @param {string} routeType - Tipo de ruta
     * @returns {Object} {geometry, distance, estimatedTime, routeType, routesUsed}
     */
    async findOptimalRoute(origin, destination, routeType) {
        console.log(`\nBuscando ruta óptima:`);
        console.log(`   Origen: ${origin.lat}, ${origin.lng}`);
        console.log(`   Destino: ${destination.lat}, ${destination.lng}`);
        console.log(`   Tipo: ${routeType}`);

        // 1. Obtener todas las rutas
        const routes = await routeModel.getAll();

        // 2. Construir grafo SOLO con rutas de ese tipo
        const graph = this.buildRouteGraph(routes, routeType);

        if (graph.nodes.length === 0) {
            throw new Error(`No hay rutas del tipo "${routeType}" disponibles`);
        }

        // 3. Encontrar nodos más cercanos
        const startNode = this.findClosestNode(graph.nodes, origin);
        const endNode = this.findClosestNode(graph.nodes, destination);

        console.log(`   Nodo inicio: ${startNode}`);
        console.log(`   Nodo fin: ${endNode}`);

        // 4. Dijkstra para encontrar camino MÁS CORTO
        const path = this.dijkstra(graph, startNode, endNode);

        if (!path) {
            throw new Error('No se encontró un camino entre origen y destino');
        }

        console.log(`   Camino encontrado: ${path.length} nodos`);

        // 5. Combinar segmentos en LineString
        const geometry = this.combinePath(path, graph);
        const distance = this.calculateTotalDistance(path, graph);
        const estimatedTime = Math.max(1, Math.round(distance / 80)); // 80m/min
        const routesUsed = this.getUniqueRouteIds(path, graph);

        console.log(`   Distancia total: ${distance}m`);
        console.log(`   Tiempo estimado: ${estimatedTime} min`);
        console.log(`   Rutas usadas: ${routesUsed.join(', ')}`);

        return {
            geometry,
            distance,
            estimatedTime,
            routeType,
            routesUsed
        };
    }
}

module.exports = new RouteGraphService();
