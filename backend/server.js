// En tu archivo principal del backend (el que mostraste)
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
require("./config/database");

const buildingsRoutes = require("./routes/buildings");
const roomsRoutes = require("./routes/rooms");
const routesRoutes = require("./routes/routes");
const errorHandler = require("./middleware/errorHandler");

// AGREGAR LAS NUEVAS RUTAS
const routeNodesRoutes = require("./routes/routeNodes");
const spatialRoutes = require("./routes/spatial");

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/buildings", buildingsRoutes);
app.use("/api/rooms", roomsRoutes);
app.use("/api/routes", routesRoutes);

// AGREGAR LAS NUEVAS RUTAS AL BACKEND
app.use("/api/route-nodes", routeNodesRoutes);
app.use("/api/spatial", spatialRoutes);

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
app.listen(PORT, () => {
  console.log(`Servidor backend ejecutándose en http://localhost:${PORT}`);
  console.log(`Health check disponible en http://localhost:${PORT}/api/health`);
  console.log(`Rutas API disponible en http://localhost:${PORT}/api/routes`);
  console.log(
    `Nodos compartidos disponible en http://localhost:${PORT}/api/route-nodes`
  ); // NUEVO
  console.log(
    `Análisis espacial disponible en http://localhost:${PORT}/api/spatial`
  ); // NUEVO
});

module.exports = app;
