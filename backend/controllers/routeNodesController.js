// backend/controllers/routeNodesController.js
const RouteNodes = require('../utils/routeNodes');

const routeNodesController = {
  // ✅ OBTENER NODOS COMPARTIDOS
  async getSharedNodes(req, res) {
    try {
      console.log('🔗 Solicitando nodos compartidos entre rutas...');
      
      const sharedNodes = await RouteNodes.getAllSharedNodes();
      
      res.json({
        success: true,
        data: sharedNodes,
        count: sharedNodes.length
      });
      
    } catch (error) {
      console.error('❌ Error obteniendo nodos compartidos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno obteniendo nodos compartidos: ' + error.message
      });
    }
  },

  // ✅ OBTENER RUTAS QUE COMPARTEN UN NODO
  async getRoutesByNode(req, res) {
    try {
      const { nodeId } = req.params;
      
      console.log(`🔄 Obteniendo rutas que comparten nodo: ${nodeId}`);
      
      if (!nodeId) {
        return res.status(400).json({
          success: false,
          message: 'ID del nodo es requerido'
        });
      }
      
      const routes = await RouteNodes.getRoutesSharingNode(nodeId);
      
      res.json({
        success: true,
        data: routes,
        nodeId: nodeId,
        count: routes.length
      });
      
    } catch (error) {
      console.error('❌ Error obteniendo rutas por nodo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno obteniendo rutas: ' + error.message
      });
    }
  },

  // ✅ ENCONTRAR INTERSECCIONES ENTRE DOS RUTAS
  async getRouteIntersections(req, res) {
    try {
      const { route1Id, route2Id } = req.params;
      
      console.log(`🔀 Buscando intersecciones entre rutas ${route1Id} y ${route2Id}`);
      
      if (!route1Id || !route2Id) {
        return res.status(400).json({
          success: false,
          message: 'IDs de ambas rutas son requeridos'
        });
      }
      
      const intersections = await RouteNodes.findRouteIntersections(route1Id, route2Id);
      
      res.json({
        success: true,
        data: intersections,
        route1Id: route1Id,
        route2Id: route2Id,
        count: intersections.length
      });
      
    } catch (error) {
      console.error('❌ Error encontrando intersecciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno encontrando intersecciones: ' + error.message
      });
    }
  },

  // ✅ SUGERIR CONEXIONES PARA UNA RUTA
  async suggestConnections(req, res) {
    try {
      const { routeId } = req.params;
      const { maxDistance = 50 } = req.body;
      
      console.log(`💡 Sugiriendo conexiones para ruta: ${routeId}`);
      
      if (!routeId) {
        return res.status(400).json({
          success: false,
          message: 'ID de la ruta es requerido'
        });
      }
      
      const suggestions = await RouteNodes.suggestRouteConnections(routeId, maxDistance);
      
      res.json({
        success: true,
        data: suggestions,
        routeId: routeId,
        maxDistance: maxDistance,
        count: suggestions.length
      });
      
    } catch (error) {
      console.error('❌ Error sugiriendo conexiones:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno sugiriendo conexiones: ' + error.message
      });
    }
  },

  // ✅ ANALIZAR RED COMPLETA DE RUTAS
  async analyzeNetwork(req, res) {
    try {
      console.log('🌐 Analizando red completa de rutas...');
      
      const analysis = await RouteNodes.analyzeRouteNetwork();
      
      res.json({
        success: true,
        data: analysis
      });
      
    } catch (error) {
      console.error('❌ Error analizando red:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno analizando red: ' + error.message
      });
    }
  },

  // ✅ ENCONTRAR NODOS CERCANOS A UN PUNTO
  async findNearbyNodes(req, res) {
    try {
      const { lat, lng, tolerance = 10 } = req.body;
      
      console.log('📍 Buscando nodos cercanos:', { lat, lng, tolerance });
      
      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          message: 'Latitud y longitud son requeridas'
        });
      }
      
      const nodes = await RouteNodes.findNearbyNodes({ lat: parseFloat(lat), lng: parseFloat(lng) }, tolerance);
      
      res.json({
        success: true,
        data: nodes,
        count: nodes.length,
        tolerance: tolerance
      });
      
    } catch (error) {
      console.error('❌ Error buscando nodos cercanos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno buscando nodos: ' + error.message
      });
    }
  }
};

module.exports = routeNodesController;