// backend/models/buildingModel.js
const pool = require('../config/database');

const buildingModel = {
  async getAll() {
    try {
      console.log('🔍 Ejecutando consulta de edificios...');
      
      const query = `
        SELECT 
          id_edificio as id,
          nombre,
          descripcion,
          activo,
          ST_AsGeoJSON(ubicacion) as ubicacion_geojson
        FROM edificio 
        WHERE activo = true
        ORDER BY nombre
      `;
      
      console.log('📝 Query:', query);
      const result = await pool.query(query);
      console.log('📊 Resultado RAW:', result.rows);
      
      const buildings = result.rows.map(row => {
        console.log('🏗️ Procesando fila:', row);
        return {
          id: row.id,
          nombre: row.nombre,
          descripcion: row.descripcion,
          activo: row.activo,
          ubicacion: row.ubicacion_geojson ? JSON.parse(row.ubicacion_geojson) : null  
        };
      });
      
      console.log(`🏢 ${buildings.length} edificios procesados`);
      return buildings;
      
    } catch (error) {
      console.error('❌ Error EN buildingModel.getAll:', error.message);
      console.error('❌ Stack trace:', error.stack);
      return [];
    }
  },

  async update(id, buildingData) {
    try {
      console.log('✏️ Actualizando edificio ID:', id, 'Tipo:', typeof id);
      
      const buildingId = parseInt(id);
      if (isNaN(buildingId)) {
        throw new Error(`ID inválido: ${id}`);
      }
      
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
          id_edificio as id,
          nombre,
          descripcion,
          activo,
          ST_AsGeoJSON(ubicacion) as ubicacion_geojson
      `;
      
      const values = [
        nombre,
        descripcion || '',
        JSON.stringify(ubicacion),
        activo !== false,
        buildingId
      ];
      
      console.log('📝 Query de actualización:', query);
      console.log('📊 Valores:', values);
      
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error(`No se encontró el edificio con ID: ${buildingId}`);
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
      throw error;
    }
  },

  async create(buildingData) {
    try {
      console.log('🏗️ Creando nuevo edificio en la base de datos:', buildingData);
      
      const query = `
        INSERT INTO edificio (
          nombre, 
          descripcion, 
          ubicacion, 
          activo
        ) VALUES ($1, $2, ST_SetSRID(ST_GeomFromGeoJSON($3), 4326), $4)
        RETURNING 
          id_edificio as id,
          nombre,
          descripcion,
          activo,
          ST_AsGeoJSON(ubicacion) as ubicacion_geojson
      `;
      
      const values = [
        buildingData.nombre,
        buildingData.descripcion || '',
        JSON.stringify(buildingData.ubicacion),
        buildingData.activo !== false
      ];
      
      console.log('📝 Query de inserción:', query);
      console.log('📊 Valores:', values);
      
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('No se pudo crear el edificio');
      }
      
      const newBuilding = result.rows[0];
      
      console.log('✅ Edificio creado exitosamente:', newBuilding);
      
      return {
        id: newBuilding.id,
        nombre: newBuilding.nombre,
        descripcion: newBuilding.descripcion,
        activo: newBuilding.activo,
        ubicacion: newBuilding.ubicacion_geojson ? JSON.parse(newBuilding.ubicacion_geojson) : null
      };
      
    } catch (error) {
      console.error('❌ Error en buildingModel.create:', error.message);
      console.error('❌ Stack trace completo:', error.stack);
      console.error('❌ Código de error PostgreSQL:', error.code);
      throw error;
    }
  },

  async findAvailableId() {
    try {
      const query = `
        WITH numbered_gaps AS (
          SELECT 
            id_edificio,
            LAG(id_edificio) OVER (ORDER BY id_edificio) as prev_id
          FROM edificio
        )
        SELECT 
          COALESCE(
            (SELECT prev_id + 1 FROM numbered_gaps WHERE id_edificio - prev_id > 1 LIMIT 1),
            (SELECT COALESCE(MAX(id_edificio), 0) + 1 FROM edificio)
          ) as available_id
      `;
      
      const result = await pool.query(query);
      const availableId = parseInt(result.rows[0].available_id);
      
      console.log(`🔍 ID disponible encontrado: ${availableId}`);
      return availableId;
      
    } catch (error) {
      console.error('Error buscando ID disponible:', error);
      return await this.getMaxId() + 1;
    }
  },

  async getMaxId() {
    try {
      const query = 'SELECT MAX(id_edificio) as max_id FROM edificio';
      const result = await pool.query(query);
      return result.rows[0].max_id || 0;
    } catch (error) {
      console.error('Error obteniendo máximo ID:', error);
      return 0;
    }
  },

  async delete(id) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      console.log('🗑️ Eliminando permanentemente edificio ID:', id);
      
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
      
      await client.query('COMMIT');
      
      console.log('✅ Edificio eliminado permanentemente:', { id: buildingId, nombre: buildingName });
      
      return {
        id: deleteResult.rows[0].id,
        nombre: buildingName,
        message: `Edificio "${buildingName}" eliminado permanentemente`
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error en buildingModel.delete:', error.message);
      throw error;
    } finally {
      client.release();
    }
  }
};

module.exports = buildingModel;
