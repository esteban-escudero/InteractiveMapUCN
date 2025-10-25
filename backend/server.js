const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
require('./config/database'); 

const buildingsRoutes = require('./routes/buildings');
const roomsRoutes = require('./routes/rooms'); // ✅ MOVER AQUÍ
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/buildings', buildingsRoutes);
app.use('/api/rooms', roomsRoutes); // ✅ MOVER AQUÍ - ANTES del errorHandler

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend del Mapa Interactivo UCN funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend ejecutándose en http://localhost:${PORT}`);
  console.log(`📊 Health check disponible en http://localhost:${PORT}/api/health`);
});

module.exports = app;