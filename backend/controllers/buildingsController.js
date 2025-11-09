// backend/controllers/buildingsController.js
const buildingModel = require("../models/buildingModel");

const buildingsController = {
  async getAllBuildings(req, res) {
    try {
      console.log("Solicitud para obtener todos los edificios CON SALAS...");
      const buildings = await buildingModel.getAll();

      // Verificar que las salas vienen en la respuesta
      let totalSalas = 0;
      buildings.forEach((building) => {
        const salasCount = building.salas ? building.salas.length : 0;
        totalSalas += salasCount;
        console.log(`"${building.nombre}": ${salasCount} salas`);
      });

      console.log(`TOTAL: ${buildings.length} edificios, ${totalSalas} salas`);

      res.json({
        success: true,
        data: buildings,
        count: buildings.length,
        totalSalas: totalSalas,
      });
    } catch (error) {
      console.error("Error obteniendo edificios:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor: " + error.message,
      });
    }
  },

  async createBuilding(req, res) {
    try {
      const { nombre, descripcion, tipo, lat, lng } = req.body;

      console.log("Datos recibidos para crear edificio:", req.body);

      if (!nombre || !lat || !lng) {
        return res.status(400).json({
          success: false,
          message: "Nombre, latitud y longitud son campos requeridos",
        });
      }

      // Crear objeto de ubicación GeoJSON
      const ubicacion = {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)],
      };

      const buildingData = {
        nombre,
        descripcion: descripcion || "",
        tipo: tipo || "Oficina Profesor",
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        ubicacion: ubicacion,
      };

      console.log("Datos a guardar en BD:", buildingData);

      const newBuilding = await buildingModel.create(buildingData);

      res.status(201).json({
        success: true,
        message: "Edificio creado exitosamente",
        data: newBuilding,
      });
    } catch (error) {
      console.error("Error creando edificio:", error);
      res.status(500).json({
        success: false,
        message:
          "Error interno del servidor al crear el edificio: " + error.message,
      });
    }
  },

  async updateBuilding(req, res) {
    try {
      const { id } = req.params;
      const { nombre, descripcion, tipo, lat, lng } = req.body;

      console.log(`Actualizando edificio ID: ${id}`, req.body);

      if (!nombre || !lat || !lng) {
        return res.status(400).json({
          success: false,
          message: "Nombre, latitud y longitud son campos requeridos",
        });
      }

      // Crear objeto de ubicación GeoJSON
      const ubicacion = {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)],
      };

      const buildingData = {
        nombre,
        descripcion: descripcion || "",
        tipo: tipo || "Oficina Profesor",
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        ubicacion: ubicacion,
      };

      const updatedBuilding = await buildingModel.update(id, buildingData);

      if (!updatedBuilding) {
        return res.status(404).json({
          success: false,
          message: "Edificio no encontrado",
        });
      }

      res.json({
        success: true,
        message: "Edificio actualizado exitosamente",
        data: updatedBuilding,
      });
    } catch (error) {
      console.error("Error actualizando edificio:", error);
      res.status(500).json({
        success: false,
        message:
          "Error interno del servidor al actualizar el edificio: " +
          error.message,
      });
    }
  },

  async deleteBuilding(req, res) {
    try {
      const { id } = req.params;

      console.log(`Solicitando ELIMINACIÓN PERMANENTE de edificio ID: ${id}`);

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "ID del edificio es requerido",
        });
      }

      const result = await buildingModel.delete(id);

      res.json({
        success: true,
        message: result.message,
        data: {
          id: result.id,
          nombre: result.nombre,
        },
      });
    } catch (error) {
      console.error("Error eliminando edificio:", error);
      res.status(500).json({
        success: false,
        message:
          "Error interno del servidor al eliminar el edificio: " +
          error.message,
      });
    }
  },

  async syncWithGeoServer(req, res) {
    try {
      const { features } = req.body;

      if (!features || !Array.isArray(features)) {
        return res.status(400).json({
          success: false,
          message: "Se requiere un array de features",
        });
      }

      res.json({
        success: true,
        message: `Sincronización completada. ${features.length} features recibidos.`,
        data: features,
      });
    } catch (error) {
      console.error("Error sincronizando con GeoServer:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor: " + error.message,
      });
    }
  },
};

module.exports = buildingsController;
