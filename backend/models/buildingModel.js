const pool = require("../config/database");

const buildingModel = {
  async getAll() {
    try {
      const query = `
        WITH salas_agregadas AS (
          SELECT 
            id_edificio,
            json_agg(
              json_build_object(
                'id', id_sala,
                'nombre_sala', nombre_sala,
                'piso', piso,
                'tipo_sala', tipo_sala,
                'accesible_silla_ruedas', accesible_silla_ruedas,
                'id_edificio', id_edificio
              ) ORDER BY piso, nombre_sala
            ) as salas_json
          FROM sala 
          GROUP BY id_edificio
        ),
        planos_agregados AS (
          SELECT 
            id_edificio,
            json_agg(
              json_build_object(
                'id', id_plano,
                'floor', piso,
                'piso', CONCAT('Piso ', piso),
                'filename', imagen_plano,
                'filepath', CONCAT('/uploads/buildings/', imagen_plano),
                'format', formato_imagen,
                'sizeBytes', tamaño_bytes,
                'uploadDate', fecha_actualizacion
              ) ORDER BY piso
            ) as planos_json
          FROM plano
          GROUP BY id_edificio
        )
        SELECT 
          e.id_edificio as id,
          e.nombre,
          e.descripcion,
          e.tipo,
          e.estado,
          ST_AsGeoJSON(e.ubicacion) as ubicacion_geojson,
          COALESCE(s.salas_json, '[]'::json) as salas,
          COALESCE(p.planos_json, '[]'::json) as planos
        FROM edificio e
        LEFT JOIN salas_agregadas s ON e.id_edificio = s.id_edificio
        LEFT JOIN planos_agregados p ON e.id_edificio = p.id_edificio
        ORDER BY e.id_edificio
      `;

      const result = await pool.query(query);

      const buildings = result.rows.map((row) => {
        const building = {
          id: row.id,
          nombre: row.nombre,
          descripcion: row.descripcion,
          tipo: row.tipo,
          estado: row.estado,
          ubicacion: row.ubicacion_geojson
            ? JSON.parse(row.ubicacion_geojson)
            : null,
          salas: row.salas || [],
          planos: row.planos || [],
        };

        return building;
      });

      return buildings;
    } catch (error) {
      console.error("CRITICAL ERROR IN buildingModel.getAll:", error);
      console.error("SQL Error Code:", error.code);
      console.error("SQL Error Detail:", error.detail);

      console.log("⚠️ Fallando gracefully al modo sin salas...");
      return await this.getAllWithoutRooms();
    }
  },

  async getAllWithoutRooms() {
    try {
      const query = `
        SELECT 
          id_edificio as id,
          nombre,
          descripcion,
          tipo,
          estado,
          planos,
          ST_AsGeoJSON(ubicacion) as ubicacion_geojson
        FROM edificio 
        ORDER BY id_edificio
      `;

      const result = await pool.query(query);

      const buildings = result.rows.map((row) => ({
        id: row.id,
        nombre: row.nombre,
        descripcion: row.descripcion,
        tipo: row.tipo,
        estado: row.estado,
        ubicacion: row.ubicacion_geojson
          ? JSON.parse(row.ubicacion_geojson)
          : null,
        salas: [],
        planos: row.planos || [],
      }));

      return buildings;
    } catch (error) {
      console.error("Error en fallback real:", error.message);
      return [];
    }
  },

  async findAvailableId() {
    try {


      const query = `
        WITH numbered_ids AS (
          SELECT 
            id_edificio,
            LAG(id_edificio) OVER (ORDER BY id_edificio) as prev_id
          FROM edificio
        )
        SELECT 
          COALESCE(
            (SELECT prev_id + 1 FROM numbered_ids WHERE id_edificio - prev_id > 1 LIMIT 1),
            (SELECT COALESCE(MAX(id_edificio), 0) + 1 FROM edificio)
          ) as available_id
      `;

      const result = await pool.query(query);
      const availableId = parseInt(result.rows[0].available_id);

      console.log(`ID disponible encontrado: ${availableId}`);
      return availableId;
    } catch (error) {
      console.error("Error buscando ID disponible:", error.message);
      return (await this.getMaxId()) + 1;
    }
  },

  // Obtener máximo ID
  async getMaxId() {
    try {
      const query =
        "SELECT COALESCE(MAX(id_edificio), 0) as max_id FROM edificio";
      const result = await pool.query(query);
      return parseInt(result.rows[0].max_id);
    } catch (error) {
      console.error("Error obteniendo máximo ID:", error.message);
      return 0;
    }
  },

  async create(buildingData) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      console.log(
        "🏗️ Creando nuevo edificio en la base de datos:",
        buildingData
      );

      const availableId = await this.findAvailableId();
      console.log(`Usando ID disponible: ${availableId}`);

      const query = `
        INSERT INTO edificio (
          id_edificio,
          nombre, 
          descripcion, 
          tipo,
          estado,
          planos,
          ubicacion
        ) VALUES ($1, $2, $3, $4, $5, $6, ST_SetSRID(ST_GeomFromGeoJSON($7), 4326))
        RETURNING 
          id_edificio as id,
          nombre,
          descripcion,
          tipo,
          estado,
          planos,
          ST_AsGeoJSON(ubicacion) as ubicacion_geojson
      `;

      const values = [
        availableId,
        buildingData.nombre,
        buildingData.descripcion || "",
        buildingData.tipo || "Oficina Profesor",
        buildingData.estado || "activo",
        JSON.stringify(buildingData.planos || []),
        JSON.stringify(buildingData.ubicacion),
      ];

      console.log("Query de inserción con ID:", availableId);

      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        throw new Error("No se pudo crear el edificio");
      }

      await client.query("COMMIT");

      const newBuilding = result.rows[0];

      console.log("Edificio creado exitosamente con ID:", availableId);

      return {
        id: newBuilding.id,
        nombre: newBuilding.nombre,
        descripcion: newBuilding.descripcion,
        tipo: newBuilding.tipo,
        ubicacion: newBuilding.ubicacion_geojson
          ? JSON.parse(newBuilding.ubicacion_geojson)
          : null,
        salas: [],
        planos: newBuilding.planos || [],
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error en buildingModel.create:", error.message);

      if (error.code === "23505") {
        console.error("ID ya existe, intentando con otro...");
      }

      throw error;
    } finally {
      client.release();
    }
  },

  async update(id, buildingData) {
    try {
      console.log("Actualizando edificio ID:", id);

      const buildingId = parseInt(id);
      if (isNaN(buildingId)) {
        throw new Error(`ID inválido: ${id}`);
      }

      const { nombre, descripcion, tipo, ubicacion } = buildingData;

      const query = `
        UPDATE edificio 
        SET 
          nombre = $1, 
          descripcion = $2, 
          tipo = $3,
          planos = $4,
          ubicacion = ST_SetSRID(ST_GeomFromGeoJSON($5), 4326)
        WHERE id_edificio = $6 
        RETURNING 
          id_edificio as id,
          nombre,
          descripcion,
          tipo,
          ST_AsGeoJSON(ubicacion) as ubicacion_geojson
      `;

      const values = [
        nombre,
        descripcion || "",
        tipo || "Oficina Profesor",
        JSON.stringify(buildingData.planos || []),
        JSON.stringify(ubicacion),
        buildingId,
      ];

      console.log("Query de actualización ejecutada");

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        throw new Error(`No se encontró el edificio con ID: ${buildingId}`);
      }

      const updatedBuilding = result.rows[0];

      console.log("Edificio actualizado exitosamente");

      return {
        id: updatedBuilding.id,
        nombre: updatedBuilding.nombre,
        descripcion: updatedBuilding.descripcion,
        tipo: updatedBuilding.tipo,
        ubicacion: updatedBuilding.ubicacion_geojson
          ? JSON.parse(updatedBuilding.ubicacion_geojson)
          : null,
        salas: [], // En update no incluimos salas por simplicidad
        planos: updatedBuilding.planos || [],
      };
    } catch (error) {
      console.error("Error en buildingModel.update:", error.message);
      throw error;
    }
  },

  async delete(id) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      console.log("Eliminando edificio ID:", id);

      const buildingId = parseInt(id);
      if (isNaN(buildingId)) {
        throw new Error(`ID inválido: ${id}`);
      }

      const getQuery = `
        SELECT 
          id_edificio as id,
          nombre
        FROM edificio 
        WHERE id_edificio = $1
      `;

      const getResult = await client.query(getQuery, [buildingId]);

      if (getResult.rows.length === 0) {
        throw new Error(`No se encontró el edificio con ID: ${buildingId}`);
      }

      const buildingName = getResult.rows[0].nombre;

      const deleteQuery = `
        DELETE FROM edificio 
        WHERE id_edificio = $1 
        RETURNING id_edificio as id
      `;

      const deleteResult = await client.query(deleteQuery, [buildingId]);

      await client.query("COMMIT");

      console.log("Edificio eliminado:", {
        id: buildingId,
        nombre: buildingName,
      });

      return {
        id: deleteResult.rows[0].id,
        nombre: buildingName,
        message: `Edificio "${buildingName}" eliminado permanentemente`,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error en buildingModel.delete:", error.message);
      throw error;
    } finally {
      client.release();
    }
  },
};

module.exports = buildingModel;
