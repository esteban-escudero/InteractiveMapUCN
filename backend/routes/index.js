/**
 * Archivo centralizado de rutas
 * Exporta todas las rutas de la API para facilitar su gestión
 */

const buildingsRoutes = require('./buildings');
const roomsRoutes = require('./rooms');
const routesRoutes = require('./routes');
const routeNodesRoutes = require('./routeNodes');
const spatialRoutes = require('./spatial');
const proximityRoutes = require('./proximity');

module.exports = {
  buildings: buildingsRoutes,
  rooms: roomsRoutes,
  routes: routesRoutes,
  routeNodes: routeNodesRoutes,
  spatial: spatialRoutes,
  proximity: proximityRoutes,
};

