const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const config = require("./config/app");
require("./config/database");

const buildingsRoutes = require("./routes/buildings");
const roomsRoutes = require("./routes/rooms");
const routesRoutes = require("./routes/routes");
const routeNodesRoutes = require("./routes/routeNodes");
const spatialRoutes = require("./routes/spatial");
const proximityRoutes = require("./routes/proximity");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Middlewares
// CORS más permisivo en desarrollo
if (config.server.env === "development") {
  app.use(
    cors({
      origin: true, // Permitir cualquier origen en desarrollo
      credentials: true,
    })
  );
} else {
  app.use(cors({ origin: config.cors.origin }));
}
app.use(bodyParser.json({ limit: config.limits.json }));
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/buildings", buildingsRoutes);
app.use("/api/rooms", roomsRoutes);
app.use("/api/routes", routesRoutes);
app.use("/api/route-nodes", routeNodesRoutes);
app.use("/api/spatial", spatialRoutes);
app.use("/api/proximity", proximityRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend del Mapa Interactivo UCN funcionando correctamente",
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use(errorHandler);

// Iniciar servidor
const PORT = config.server.port;
app.listen(PORT, () => {
  console.log(`Servidor backend ejecutándose en http://localhost:${PORT}`);
  console.log(`Entorno: ${config.server.env}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`API disponible en: http://localhost:${PORT}/api`);
});

module.exports = app;
