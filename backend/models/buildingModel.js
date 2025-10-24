// backend/models/buildingModel.js
const pool = require('../config/database');

const buildingModel = {
  async getAll() {
    try {
      console.log('🔍 Ejecutando consulta de edificios...');
      
      // ✅ CONSULTA CORREGIDA - usar tipo en lugar de activo
      const query = `
        SELECT 
          id_edificio as id,
          nombre,
          descripcion,
          tipo,
          ST_AsGeoJSON(ubicacion) as ubicacion_geojson
        FROM edificio 
        ORDER BY id_edificio
      `;
      
      console.log('📝 Query:', query);
      const result = await pool.query(query);
      console.log('📊 Resultado RAW:', result.rows);
      
      const buildings = result.rows.map(row => {
        return {
          id: row.id,
          nombre: row.nombre,
          descripcion: row.descripcion,
          tipo: row.tipo, // ✅ Usar tipo en lugar de activo
          ubicacion: row.ubicacion_geojson ? JSON.parse(row.ubicacion_geojson) : null  
        };
      });
      
      console.log(`🏢 ${buildings.length} edificios procesados`);
      return buildings;
      
    } catch (error) {
      console.error('❌ Error EN buildingModel.getAll:', error.message);
      return [];
    }
  },

  // ✅ FUNCIÓN MEJORADA: Encontrar primer ID disponible
  async findAvailableId() {
    try {
      console.log('🔍 Buscando ID disponible...');
      
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
      
      console.log(`✅ ID disponible encontrado: ${availableId}`);
      return availableId;
      
    } catch (error) {
      console.error('❌ Error buscando ID disponible:', error.message);
      return await this.getMaxId() + 1;
    }
  },

  // ✅ FUNCIÓN AUXILIAR: Obtener máximo ID
  async getMaxId() {
    try {
      const query = 'SELECT COALESCE(MAX(id_edificio), 0) as max_id FROM edificio';
      const result = await pool.query(query);
      return parseInt(result.rows[0].max_id);
    } catch (error) {
      console.error('❌ Error obteniendo máximo ID:', error.message);
      return 0;
    }
  },

  // ✅ FUNCIÓN CREATE CORREGIDA: Usar tipo en lugar de activo
  async create(buildingData) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      console.log('🏗️ Creando nuevo edificio en la base de datos:', buildingData);
      
      const availableId = await this.findAvailableId();
      console.log(`🆔 Usando ID disponible: ${availableId}`);
      
      // ✅ CONSULTA CORREGIDA - usar tipo en lugar de activo
      const query = `
        INSERT INTO edificio (
          id_edificio,
          nombre, 
          descripcion, 
          tipo,
          ubicacion
        ) VALUES ($1, $2, $3, $4, ST_SetSRID(ST_GeomFromGeoJSON($5), 4326))
        RETURNING 
          id_edificio as id,
          nombre,
          descripcion,
          tipo,
          ST_AsGeoJSON(ubicacion) as ubicacion_geojson
      `;
      
      const values = [
        availableId,
        buildingData.nombre,
        buildingData.descripcion || '',
        buildingData.tipo || 'Oficina Profesor', // ✅ Usar tipo
        JSON.stringify(buildingData.ubicacion)
      ];
      
      console.log('📝 Query de inserción con ID:', availableId);
      console.log('📊 Valores:', values);
      
      const result = await client.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('No se pudo crear el edificio');
      }
      
      await client.query('COMMIT');
      
      const newBuilding = result.rows[0];
      
      console.log('✅ Edificio creado exitosamente con ID:', availableId);
      
      return {
        id: newBuilding.id,
        nombre: newBuilding.nombre,
        descripcion: newBuilding.descripcion,
        tipo: newBuilding.tipo, // ✅ Devolver tipo
        ubicacion: newBuilding.ubicacion_geojson ? JSON.parse(newBuilding.ubicacion_geojson) : null
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error en buildingModel.create:', error.message);
      
      if (error.code === '23505') {
        console.error('❌ ID ya existe, intentando con otro...');
      }
      
      throw error;
    } finally {
      client.release();
    }
  },

  async update(id, buildingData) {
    try {
      console.log('✏️ Actualizando edificio ID:', id);
      
      const buildingId = parseInt(id);
      if (isNaN(buildingId)) {
        throw new Error(`ID inválido: ${id}`);
      }
      
      const { nombre, descripcion, tipo, ubicacion } = buildingData;
      
      // ✅ CONSULTA CORREGIDA - usar tipo en lugar de activo
      const query = `
        UPDATE edificio 
        SET 
          nombre = $1, 
          descripcion = $2, 
          tipo = $3,
          ubicacion = ST_SetSRID(ST_GeomFromGeoJSON($4), 4326)
        WHERE id_edificio = $5 
        RETURNING 
          id_edificio as id,
          nombre,
          descripcion,
          tipo,
          ST_AsGeoJSON(ubicacion) as ubicacion_geojson
      `;
      
      const values = [
        nombre,
        descripcion || '',
        tipo || 'Oficina Profesor', // ✅ Usar tipo
        JSON.stringify(ubicacion),
        buildingId
      ];
      
      console.log('📝 Query de actualización:', query);
      console.log('📊 Valores:', values);
      
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error(`No se encontró el edificio con ID: ${buildingId}`);
      }
      
      const updatedBuilding = result.rows[0];
      
      console.log('✅ Edificio actualizado exitosamente');
      
      return {
        id: updatedBuilding.id,
        nombre: updatedBuilding.nombre,
        descripcion: updatedBuilding.descripcion,
        tipo: updatedBuilding.tipo, // ✅ Devolver tipo
        ubicacion: updatedBuilding.ubicacion_geojson ? JSON.parse(updatedBuilding.ubicacion_geojson) : null
      };
      
    } catch (error) {
      console.error('❌ Error en buildingModel.update:', error.message);
      throw error;
    }
  },

  async delete(id) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      console.log('🗑️ Eliminando edificio ID:', id);
      
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
      
      console.log('✅ Edificio eliminado:', { id: buildingId, nombre: buildingName });
      
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