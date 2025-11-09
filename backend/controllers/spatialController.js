// backend/controllers/spatialController.js
const TurfUtils = require("../utils/turfUtils");
const buildingModel = require("../models/buildingModel");
const routeModel = require("../models/routeModel");

const spatialController = {
  // CALCULAR RUTA ÓPTIMA ENTRE PUNTOS
  async calculateOptimalRoute(req, res) {
    try {
      const {
        origen,
        destino,
        tipo_ruta = "peatonal",
        optimizar = true,
      } = req.body;

      console.log("Calculando ruta óptima con Turf:", {
        origen,
        destino,
        tipo_ruta,
      });

      if (!origen || !destino) {
        return res.status(400).json({
          success: false,
          message: "Origen y destino son requeridos",
        });
      }

      // Validar coordenadas
      if (!origen.lat || !origen.lng || !destino.lat || !destino.lng) {
        return res.status(400).json({
          success: false,
          message: "Coordenadas de origen y destino requeridas",
        });
      }

      // Validar que estén en el campus
      const origenValido = TurfUtils.isValidCampusLocation(
        origen.lat,
        origen.lng
      );
      const destinoValido = TurfUtils.isValidCampusLocation(
        destino.lat,
        destino.lng
      );

      if (!origenValido || !destinoValido) {
        return res.status(400).json({
          success: false,
          message: "El origen o destino están fuera del campus UCN",
        });
      }

      // Calcular distancia directa
      const distanciaDirecta = TurfUtils.calculateDistance(origen, destino);

      // En una implementación real, aquí integrarías con un servicio de routing
      // Por ahora creamos una ruta directa con posible optimización
      let waypoints = [
        { lng: origen.lng, lat: origen.lat, nombre: origen.nombre || "Origen" },
        {
          lng: destino.lng,
          lat: destino.lat,
          nombre: destino.nombre || "Destino",
        },
      ];

      // Optimizar ruta si se solicita y hay waypoints intermedios
      if (optimizar && req.body.waypoints && req.body.waypoints.length > 0) {
        waypoints = [waypoints[0], ...req.body.waypoints, waypoints[1]];
        waypoints = TurfUtils.optimizeRoute(waypoints);
      }

      // Crear geometría LineString
      const coordinates = waypoints.map((wp) => [wp.lng, wp.lat]);

      // Calcular distancia real
      const distanciaReal = TurfUtils.calculateRouteLength(coordinates);
      const tiempoEstimado = Math.round(distanciaReal / 80); // 80m/min caminando

      const rutaCalculada = {
        nombre: `Ruta ${origen.nombre || "Origen"} → ${
          destino.nombre || "Destino"
        }`,
        tipo: tipo_ruta,
        distancia: Math.round(distanciaReal),
        tiempo_estimado: tiempoEstimado,
        geometria: {
          type: "LineString",
          coordinates: coordinates,
        },
        puntos_ruta: waypoints.map((wp, index) => ({
          orden: index + 1,
          tipo_punto:
            index === 0
              ? "inicio"
              : index === waypoints.length - 1
              ? "fin"
              : "intermedio",
          descripcion: wp.nombre || `Punto ${index + 1}`,
          nombre_punto: wp.nombre || `Punto ${index + 1}`,
          coordenadas: {
            type: "Point",
            coordinates: [wp.lng, wp.lat],
          },
        })),
        metricas_turf: {
          distancia_directa: Math.round(distanciaDirecta),
          eficiencia: ((distanciaDirecta / distanciaReal) * 100).toFixed(1),
          puntos_total: waypoints.length,
          optimizada: optimizar,
        },
      };

      console.log("Ruta calculada con Turf:", {
        distancia: rutaCalculada.distancia,
        puntos: rutaCalculada.puntos_ruta.length,
        eficiencia: rutaCalculada.metricas_turf.eficiencia,
      });

      res.json({
        success: true,
        message: "Ruta calculada exitosamente",
        data: rutaCalculada,
      });
    } catch (error) {
      console.error("Error calculando ruta óptima:", error);
      res.status(500).json({
        success: false,
        message: "Error interno calculando ruta: " + error.message,
      });
    }
  },

  // ENCONTRAR EDIFICIOS CERCANOS
  async findNearbyBuildings(req, res) {
    try {
      const { lat, lng, radio = 200, limite = 10 } = req.body;

      console.log("Buscando edificios cercanos:", { lat, lng, radio });

      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          message: "Latitud y longitud son requeridas",
        });
      }

      // Obtener todos los edificios
      const edificios = await buildingModel.getAll();

      // Filtrar y ordenar por distancia
      const edificiosConDistancia = edificios
        .map((edificio) => {
          if (!edificio.ubicacion || edificio.ubicacion.type !== "Point") {
            return null;
          }

          const [edificioLng, edificioLat] = edificio.ubicacion.coordinates;
          const distancia = TurfUtils.calculateDistance(
            { lat: parseFloat(lat), lng: parseFloat(lng) },
            { lat: edificioLat, lng: edificioLng }
          );

          return {
            ...edificio,
            distancia_metros: Math.round(distancia),
          };
        })
        .filter(
          (edificio) => edificio !== null && edificio.distancia_metros <= radio
        )
        .sort((a, b) => a.distancia_metros - b.distancia_metros)
        .slice(0, limite);

      console.log(
        `Encontrados ${edificiosConDistancia.length} edificios dentro de ${radio}m`
      );

      res.json({
        success: true,
        data: edificiosConDistancia,
        count: edificiosConDistancia.length,
        radio_metros: radio,
      });
    } catch (error) {
      console.error("Error buscando edificios cercanos:", error);
      res.status(500).json({
        success: false,
        message: "Error interno buscando edificios: " + error.message,
      });
    }
  },

  // ANALIZAR RUTAS EXISTENTES
  async analyzeRoutes(req, res) {
    try {
      console.log("Analizando rutas con Turf...");

      const rutas = await routeModel.getAll();

      const analisis = rutas.map((ruta) => {
        let metricas = {
          id: ruta.id,
          nombre: ruta.nombre,
          valida: false,
          longitud_calculada: 0,
          puntos_count: 0,
          eficiencia: 0,
          problemas: [],
        };

        if (ruta.geometria && ruta.geometria.coordinates) {
          const coords = ruta.geometria.coordinates;

          // Validar geometría
          metricas.valida = TurfUtils.isValidLineString(coords);
          metricas.longitud_calculada = Math.round(
            TurfUtils.calculateRouteLength(coords)
          );
          metricas.puntos_count = coords.length;

          // Calcular eficiencia (distancia directa vs real)
          if (coords.length >= 2) {
            const inicio = { lng: coords[0][0], lat: coords[0][1] };
            const fin = {
              lng: coords[coords.length - 1][0],
              lat: coords[coords.length - 1][1],
            };
            const distanciaDirecta = TurfUtils.calculateDistance(inicio, fin);

            if (distanciaDirecta > 0) {
              metricas.eficiencia = (
                (distanciaDirecta / metricas.longitud_calculada) *
                100
              ).toFixed(1);
            }
          }

          // Detectar problemas
          if (!metricas.valida) {
            metricas.problemas.push("Geometría inválida");
          }

          if (metricas.puntos_count < 2) {
            metricas.problemas.push("Muy pocos puntos");
          }

          if (parseFloat(metricas.eficiencia) < 50) {
            metricas.problemas.push("Baja eficiencia de ruta");
          }
        } else {
          metricas.problemas.push("Sin geometría");
        }

        return metricas;
      });

      // Estadísticas generales
      const stats = {
        total_rutas: analisis.length,
        rutas_validas: analisis.filter((r) => r.valida).length,
        rutas_invalidas: analisis.filter((r) => !r.valida).length,
        longitud_total: analisis.reduce(
          (sum, r) => sum + r.longitud_calculada,
          0
        ),
        eficiencia_promedio: (
          analisis.reduce((sum, r) => sum + parseFloat(r.eficiencia || 0), 0) /
          analisis.length
        ).toFixed(1),
      };

      console.log("Análisis de rutas completado:", stats);

      res.json({
        success: true,
        data: {
          analisis,
          estadisticas: stats,
        },
      });
    } catch (error) {
      console.error("Error analizando rutas:", error);
      res.status(500).json({
        success: false,
        message: "Error interno analizando rutas: " + error.message,
      });
    }
  },

  // VALIDAR UBICACIÓN MASIVA
  async validateLocations(req, res) {
    try {
      const { locations } = req.body;

      if (!Array.isArray(locations)) {
        return res.status(400).json({
          success: false,
          message: "Se requiere un array de locations",
        });
      }

      const resultados = locations.map((loc) => {
        const valido = TurfUtils.isValidCampusLocation(loc.lat, loc.lng);

        return {
          ...loc,
          valido,
          mensaje: valido ? "Dentro del campus" : "Fuera del campus",
        };
      });

      const estadisticas = {
        total: resultados.length,
        validos: resultados.filter((r) => r.valido).length,
        invalidos: resultados.filter((r) => !r.valido).length,
      };

      res.json({
        success: true,
        data: {
          resultados,
          estadisticas,
        },
      });
    } catch (error) {
      console.error("Error validando ubicaciones:", error);
      res.status(500).json({
        success: false,
        message: "Error interno validando ubicaciones: " + error.message,
      });
    }
  },
};

module.exports = spatialController;
