const pool = require("../config/database");

const roomModel = {
  async createRooms(roomsData) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      console.log("Creando salas en la base de datos:", roomsData);

      const createdRooms = [];

      for (const roomData of roomsData) {
        // ELIMINAR findAvailableId() y dejar que PostgreSQL genere el ID automáticamente
        const query = `
          INSERT INTO sala (
            id_edificio,
            nombre_sala, 
            piso, 
            tipo_sala,
            accesible_silla_ruedas,
            ubicacion
          ) VALUES ($1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($6, $7), 4326))
          RETURNING 
            id_sala as id,
            id_edificio,
            nombre_sala,
            piso,
            tipo_sala,
            accesible_silla_ruedas,
            ST_X(ubicacion) as longitud,
            ST_Y(ubicacion) as latitud
        `;

        const values = [
          roomData.id_edificio,
          roomData.nombre_sala,
          roomData.piso,
          roomData.tipo_sala,
          roomData.accesible_silla_ruedas || false,
          roomData.longitud,
          roomData.latitud,
        ];

        console.log(
          "Insertando sala con ubicación:",
          roomData.longitud,
          roomData.latitud
        );

        const result = await client.query(query, values);
        createdRooms.push(result.rows[0]);
      }

      await client.query("COMMIT");

      console.log(`${createdRooms.length} salas creadas exitosamente`);
      return createdRooms;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error en roomModel.createRooms:", error.message);
      throw error;
    } finally {
      client.release();
    }
  },

  // ELIMINAR la función findAvailableId() completamente

  async getByBuildingId(buildingId) {
    try {
      const query = `
        SELECT 
          id_sala as id,
          id_edificio,
          nombre_sala,
          piso,
          tipo_sala,
          accesible_silla_ruedas,
          ST_X(ubicacion) as longitud,
          ST_Y(ubicacion) as latitud
        FROM sala 
        WHERE id_edificio = $1
        ORDER BY piso, nombre_sala
      `;

      const result = await pool.query(query, [buildingId]);
      return result.rows;
    } catch (error) {
      console.error("Error en roomModel.getByBuildingId:", error.message);
      throw error;
    }
  },

  async update(roomId, roomData) {
    try {
      const query = `
        UPDATE sala 
        SET 
          nombre_sala = $1, 
          piso = $2, 
          tipo_sala = $3,
          accesible_silla_ruedas = $4,
          ubicacion = ST_SetSRID(ST_MakePoint($5, $6), 4326)
        WHERE id_sala = $7 
        RETURNING 
          *,
          ST_X(ubicacion) as longitud,
          ST_Y(ubicacion) as latitud
      `;

      const values = [
        roomData.nombre_sala,
        roomData.piso,
        roomData.tipo_sala,
        roomData.accesible_silla_ruedas,
        roomData.longitud,
        roomData.latitud,
        roomId,
      ];

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error en roomModel.update:", error.message);
      throw error;
    }
  },

  async findNearbyRooms(lng, lat, radiusMeters) {
    try {
      const query = `
        SELECT 
          id_sala as id,
          nombre_sala,
          piso,
          tipo_sala,
          ST_X(ubicacion) as longitud,
          ST_Y(ubicacion) as latitud,
          ST_Distance(
            ubicacion, 
            ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
          ) as distancia_metros
        FROM sala
        WHERE ST_DWithin(
          ubicacion::geography,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          $3
        )
        ORDER BY distancia_metros
      `;

      const result = await pool.query(query, [lng, lat, radiusMeters]);
      return result.rows;
    } catch (error) {
      console.error("Error en roomModel.findNearbyRooms:", error.message);
      throw error;
    }
  },

  async delete(roomId) {
    try {
      const query = `
        DELETE FROM sala 
        WHERE id_sala = $1 
        RETURNING id_sala, nombre_sala
      `;

      const result = await pool.query(query, [roomId]);
      return result.rows[0];
    } catch (error) {
      console.error("Error en roomModel.delete:", error.message);
      throw error;
    }
  },
};

module.exports = roomModel;
