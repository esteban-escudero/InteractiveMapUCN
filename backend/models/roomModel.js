const pool = require("../config/database");

const roomModel = {
  async findAvailableId() {
    try {
      console.log("Buscando ID disponible para sala...");

      const query = `
        WITH sequence_gaps AS (
          SELECT 
            COALESCE(LAG(id_sala) OVER (ORDER BY id_sala), 0) + 1 as gap_start,
            id_sala as gap_end
          FROM sala
          WHERE id_sala > 0
        ),
        available_gaps AS (
          SELECT gap_start
          FROM sequence_gaps
          WHERE gap_start < gap_end
          ORDER BY gap_start
          LIMIT 1
        )
        SELECT 
          COALESCE(
            (SELECT gap_start FROM available_gaps),
            (SELECT COALESCE(MAX(id_sala), 0) + 1 FROM sala)
          ) as available_id
      `;

      const result = await pool.query(query);
      const availableId = parseInt(result.rows[0].available_id);

      console.log(`ID disponible encontrado: ${availableId}`);
      return availableId;
    } catch (error) {
      console.error("Error buscando ID disponible:", error.message);
      const maxResult = await pool.query(
        "SELECT COALESCE(MAX(id_sala), 0) as max_id FROM sala"
      );
      return parseInt(maxResult.rows[0].max_id) + 1;
    }
  },

  async createRooms(roomsData) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      console.log("Creando salas en la base de datos:", roomsData);

      const createdRooms = [];

      for (const roomData of roomsData) {
        const availableId = await this.findAvailableId();
        console.log(`Usando ID disponible: ${availableId}`);

        const query = `
          INSERT INTO sala (
            id_sala,
            id_edificio,
            nombre_sala, 
            piso, 
            tipo_sala,
            accesible_silla_ruedas,
            ubicacion  -- NUEVO NOMBRE: ubicacion (tipo geometry)
          ) VALUES ($1, $2, $3, $4, $5, $6, ST_SetSRID(ST_MakePoint($7, $8), 4326))
          RETURNING 
            id_sala as id,
            id_edificio,
            nombre_sala,
            piso,
            tipo_sala,
            accesible_silla_ruedas,
            ST_X(ubicacion) as longitud,  -- Usar ST_X con geometry
            ST_Y(ubicacion) as latitud    -- Usar ST_Y con geometry
        `;

        const values = [
          availableId,
          roomData.id_edificio,
          roomData.nombre_sala,
          roomData.piso,
          roomData.tipo_sala,
          roomData.accesible_silla_ruedas || false,
          roomData.longitud,
          roomData.latitud,
        ];

        console.log(
          "Insertando sala con ID:",
          availableId,
          "y ubicación:",
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

  // FUNCIONES ESPACIALES AVANZADAS (ahora que tenemos geometry)
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
