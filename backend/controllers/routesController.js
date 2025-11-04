const routeModel = require("../models/routeModel");

const routesController = {
  async getAllRoutes(req, res) {
    try {
      console.log("📥 Solicitud para obtener todas las rutas...");
      const routes = await routeModel.getAll();

      console.log("📦 Rutas desde modelo:", routes);
      console.log("🔍 Tipo de rutas:", typeof routes);
      console.log("🔍 Es array?", Array.isArray(routes));

      let totalPuntos = 0;
      if (Array.isArray(routes)) {
        routes.forEach((route) => {
          const puntosCount = route.puntos_ruta ? route.puntos_ruta.length : 0;
          totalPuntos += puntosCount;
          console.log(`🛣️ "${route.nombre}": ${puntosCount} puntos`);
        });
      }

      console.log(
        `📊 TOTAL: ${
          Array.isArray(routes) ? routes.length : 0
        } rutas, ${totalPuntos} puntos de ruta`
      );

      res.json({
        success: true,
        data: routes,
        count: Array.isArray(routes) ? routes.length : 0,
        totalPuntos: totalPuntos,
      });
    } catch (error) {
      console.error("❌ Error obteniendo rutas:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor: " + error.message,
      });
    }
  },

  async createRoute(req, res) {
    try {
      const {
        nombre,
        tipo,
        distancia,
        tiempo_estimado,
        geometria,
        puntos_ruta,
      } = req.body;

      console.log("📥 Datos recibidos para crear ruta:", req.body);

      if (!nombre || !geometria) {
        return res.status(400).json({
          success: false,
          message: "Nombre y geometría son campos requeridos",
        });
      }

      // ✅ CORREGIDO: Limpiar datos antes de enviar al modelo
      const cleanPuntosRuta = (puntos_ruta || []).map((punto) => ({
        ...punto,
        id_edificio: punto.id_edificio || null, // Asegurar que sea null si no existe
        id_sala: punto.id_sala || null, // Asegurar que sea null si no existe
      }));

      const routeData = {
        nombre,
        tipo: tipo || "peatonal",
        distancia: distancia || 0,
        tiempo_estimado: tiempo_estimado || 0,
        geometria: geometria,
        puntos_ruta: cleanPuntosRuta,
      };

      console.log("Datos a guardar en BD:", routeData);

      const newRoute = await routeModel.create(routeData);

      res.status(201).json({
        success: true,
        message: "Ruta creada exitosamente",
        data: newRoute,
      });
    } catch (error) {
      console.error("❌ Error creando ruta:", error);
      res.status(500).json({
        success: false,
        message:
          "Error interno del servidor al crear la ruta: " + error.message,
      });
    }
  },

  async updateRoute(req, res) {
    try {
      const { id } = req.params;
      const {
        nombre,
        tipo,
        distancia,
        tiempo_estimado,
        geometria,
        puntos_ruta,
      } = req.body;

      console.log(`✏️ Actualizando ruta ID: ${id}`, req.body);

      if (!nombre || !geometria) {
        return res.status(400).json({
          success: false,
          message: "Nombre y geometría son campos requeridos",
        });
      }

      // ✅ CORREGIDO: Limpiar datos antes de enviar al modelo
      const cleanPuntosRuta = (puntos_ruta || []).map((punto) => ({
        ...punto,
        id_edificio: punto.id_edificio || null,
        id_sala: punto.id_sala || null,
      }));

      const routeData = {
        nombre,
        tipo: tipo || "peatonal",
        distancia: distancia || 0,
        tiempo_estimado: tiempo_estimado || 0,
        geometria: geometria,
        puntos_ruta: cleanPuntosRuta,
      };

      const updatedRoute = await routeModel.update(id, routeData);

      if (!updatedRoute) {
        return res.status(404).json({
          success: false,
          message: "Ruta no encontrada",
        });
      }

      res.json({
        success: true,
        message: "Ruta actualizada exitosamente",
        data: updatedRoute,
      });
    } catch (error) {
      console.error("❌ Error actualizando ruta:", error);
      res.status(500).json({
        success: false,
        message:
          "Error interno del servidor al actualizar la ruta: " + error.message,
      });
    }
  },

  async deleteRoute(req, res) {
    try {
      const { id } = req.params;

      console.log(`🗑️ Solicitando ELIMINACIÓN de ruta ID: ${id}`);

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "ID de la ruta es requerido",
        });
      }

      const result = await routeModel.delete(id);

      res.json({
        success: true,
        message: result.message,
        data: {
          id: result.id,
          nombre: result.nombre,
        },
      });
    } catch (error) {
      console.error("❌ Error eliminando ruta:", error);
      res.status(500).json({
        success: false,
        message:
          "Error interno del servidor al eliminar la ruta: " + error.message,
      });
    }
  },

  async calculateRoute(req, res) {
    try {
      const { origen, destino, tipo_ruta } = req.body;

      console.log("🧮 Calculando ruta desde:", origen, "hasta:", destino);

      if (!origen || !destino) {
        return res.status(400).json({
          success: false,
          message: "Origen y destino son requeridos",
        });
      }

      // Aquí implementarías la lógica de cálculo de ruta
      // Por ahora devolvemos una ruta simulada
      const rutaCalculada = {
        nombre: `Ruta desde ${origen.nombre || "Origen"} hasta ${
          destino.nombre || "Destino"
        }`,
        tipo: tipo_ruta || "peatonal",
        distancia: 150, // metros
        tiempo_estimado: 2, // minutos
        geometria: {
          type: "LineString",
          coordinates: [
            [origen.lng, origen.lat],
            [destino.lng, destino.lat],
          ],
        },
        puntos_ruta: [
          {
            orden: 1,
            tipo_punto: "inicio",
            descripcion: "Punto de inicio",
            coordenadas: {
              type: "Point",
              coordinates: [origen.lng, origen.lat],
            },
          },
          {
            orden: 2,
            tipo_punto: "fin",
            descripcion: "Punto de destino",
            coordenadas: {
              type: "Point",
              coordinates: [destino.lng, destino.lat],
            },
          },
        ],
      };

      res.json({
        success: true,
        message: "Ruta calculada exitosamente",
        data: rutaCalculada,
      });
    } catch (error) {
      console.error("❌ Error calculando ruta:", error);
      res.status(500).json({
        success: false,
        message:
          "Error interno del servidor al calcular la ruta: " + error.message,
      });
    }
  },
};

module.exports = routesController;
