// backend/models/buildingModel.js
const pool = require('../config/database');

const buildingModel = {
  
  async getAll() {
    try {
      console.log('🔍 Ejecutando consulta de edificios...');

      const query = `
        SELECT 
          id_edificio AS id,
          nombre,
          descripcion,
          activo,
          ST_AsGeoJSON(ubicacion) AS ubicacion_geojson
        FROM edificio
        WHERE activo = true
        ORDER BY nombre
      `;

      console.log('📝 Query:', query);
      const result = await pool.query(query);
      console.log('📊 Resultado RAW:', result.rows);

      const buildings = result.rows.map(row => ({
        id: row.id,
        nombre: row.nombre,
        descripcion: row.descripcion,
        activo: row.activo,
        ubicacion: row.ubicacion_geojson ? JSON.parse(row.ubicacion_geojson) : null
      }));

      console.log(`🏢 ${buildings.length} edificios procesados`);
      return buildings;

    } catch (error) {
      console.error('❌ Error EN buildingModel.getAll:', error.message);
      console.error('❌ Stack trace:', error.stack);
      return [];
    }
  },

  async create(buildingData) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      console.log('🏗️ Creando nuevo edificio en la base de datos:', buildingData);

      // Obtener ID disponible
      const availableId = await this.findAvailableId();

      const query = `
        INSERT INTO edificio (
          id_edificio,
          nombre, 
          descripcion, 
          ubicacion, 
          activo
        ) VALUES ($1, $2, $3, ST_SetSRID(ST_GeomFromGeoJSON($4), 4326), $5)
        RETURNING 
          id_edificio AS id,
          nombre,
          descripcion,
          activo,
          ST_AsGeoJSON(ubicacion) AS ubicacion_geojson
      `;

      const values = [
        availableId,
        buildingData.nombre,
        buildingData.descripcion || '',
        JSON.stringify(buildingData.ubicacion),
        buildingData.activo !== false
      ];

      console.log('📝 Query de inserción con ID:', availableId);
      console.log('📊 Valores:', values);

      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        throw new Error('No se pudo crear el edificio');
      }

      await client.query('COMMIT');

      const newBuilding = result.rows[0];
      console.log('✅ Edificio creado exitosamente con ID:', availableId, newBuilding);

      return {
        id: newBuilding.id,
        nombre: newBuilding.nombre,
        descripcion: newBuilding.descripcion,
        activo: newBuilding.activo,
        ubicacion: newBuilding.ubicacion_geojson ? JSON.parse(newBuilding.ubicacion_geojson) : null
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error en buildingModel.create:', error.message);
      throw error;

    } finally {
      client.release();
    }
  },

  async update(id, buildingData) {
    try {
      console.log('✏️ Actualizando edificio ID:', id, 'Datos:', buildingData);

      const { nombre, descripcion, ubicacion, activo } = buildingData;

      const query = `
        UPDATE edificio
        SET 
          nombre = $1,
          descripcion = $2,
          ubicacion = ST_SetSRID(ST_GeomFromGeoJSON($3), 4326),
          activo = $4
        WHERE id_edificio = $5
        RETURNING 
          id_edificio AS id,
          nombre,
          descripcion,
          activo,
          ST_AsGeoJSON(ubicacion) AS ubicacion_geojson
      `;

      const values = [
        nombre,
        descripcion || '',
        JSON.stringify(ubicacion),
        activo !== false,
        id
      ];

      console.log('📝 Query de actualización:', query);
      console.log('📊 Valores:', values);

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        throw new Error(`No se encontró el edificio con ID: ${id}`);
      }

      const updatedBuilding = result.rows[0];
      console.log('✅ Edificio actualizado exitosamente:', updatedBuilding);

      return {
        id: updatedBuilding.id,
        nombre: updatedBuilding.nombre,
        descripcion: updatedBuilding.descripcion,
        activo: updatedBuilding.activo,
        ubicacion: updatedBuilding.ubicacion_geojson ? JSON.parse(updatedBuilding.ubicacion_geojson) : null
      };

    } catch (error) {
      console.error('❌ Error en buildingModel.update:', error.message);
      console.error('❌ Stack trace completo:', error.stack);
      console.error('❌ Código de error PostgreSQL:', error.code);
      throw error;
    }
  },

  async findAvailableId() {
    try {
      const query = `
        SELECT id_edificio
        FROM edificio
        ORDER BY id_edificio
      `;

      const result = await pool.query(query);
      const existingIds = result.rows.map(row => row.id_edificio);

      if (existingIds.length === 0) return 1;

      let availableId = 1;
      for (const id of existingIds) {
        if (id !== availableId) break;
        availableId++;
      }

      console.log(`🔍 ID disponible encontrado: ${availableId}`);
      return availableId;

    } catch (error) {
      console.error('❌ Error buscando ID disponible:', error);
      return await this.getMaxId() + 1;
    }
  },

  async getMaxId() {
    try {
      const query = 'SELECT MAX(id_edificio) AS max_id FROM edificio';
      const result = await pool.query(query);
      return result.rows[0].max_id || 0;
    } catch (error) {
      console.error('❌ Error obteniendo máximo ID:', error);
      return 0;
    }
  }
};

module.exports = buildingModel;
