const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const config = require("./config/app");
require("./config/database");

// Rutas existentes
const buildingsRoutes = require("./routes/buildings");
const roomsRoutes = require("./routes/rooms");
const routesRoutes = require("./routes/routes");
const routeNodesRoutes = require("./routes/routeNodes");
const spatialRoutes = require("./routes/spatial");
const proximityRoutes = require("./routes/proximity");

// Ruta de autenticación
const authRoutes = require("./routes/auth");

// Ruta de gestión de usuarios
const usersRoutes = require("./routes/users");

// Ruta de imágenes de edificios
const buildingImagesRoutes = require("./routes/buildingImages");

const errorHandler = require("./middleware/errorHandler");

const app = express();

// Middlewares
if (config.server.env === "development") {
  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
} else {
  const whitelist = config.cors.origin ? config.cors.origin.split(',') : [];
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || whitelist.includes(origin) || whitelist.includes('*')) {
        callback(null, true);
      } else {
        callback(null, false); // No permitimos pero no arrojamos error para no romper el flujo
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
}
app.use(bodyParser.json({ limit: config.limits.json }));
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos (imágenes subidas)
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/buildings", buildingsRoutes);
app.use("/api/rooms", roomsRoutes);
app.use("/api/routes", routesRoutes);
app.use("/api/route-nodes", routeNodesRoutes);
app.use("/api/spatial", spatialRoutes);
app.use("/api/proximity", proximityRoutes);

// NUEVA: Ruta de autenticación
app.use("/api/auth", authRoutes);

// NUEVA: Ruta de gestión de usuarios
app.use("/api/users", usersRoutes);

// NUEVA: Ruta de imágenes de edificios
app.use("/api/building-images", buildingImagesRoutes);

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
// Iniciar servidor solo si no estamos en modo de pruebas
if (require.main === module) {
  const PORT = config.server.port;
  app.listen(PORT, () => {
    console.log(`Servidor backend ejecutándose en http://localhost:${PORT}`);
    console.log(`Entorno: ${config.server.env}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    console.log(`API disponible en: http://localhost:${PORT}/api`);
    console.log(`Auth endpoints: http://localhost:${PORT}/api/auth`);
  });
}

module.exports = app;
