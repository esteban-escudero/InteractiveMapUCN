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
        ORDER BY id_edificio  -- ✅ Ordenar por ID
      `;
      
      console.log('📝 Query:', query);
      const result = await pool.query(query);
      console.log('📊 Resultado RAW:', result.rows);
      
      const buildings = result.rows.map(row => {
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
      return [];
    }
  },

  // ✅ FUNCIÓN MEJORADA: Encontrar primer ID disponible
  async findAvailableId() {
    try {
      console.log('🔍 Buscando ID disponible...');
      
      // Consulta optimizada para encontrar el primer hueco
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
      // Fallback: usar máximo + 1
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

  // ✅ FUNCIÓN CREATE MEJORADA: Usar ID disponible
  async create(buildingData) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      console.log('🏗️ Creando nuevo edificio en la base de datos:', buildingData);
      
      // ✅ OBTENER ID DISPONIBLE AUTOMÁTICAMENTE
      const availableId = await this.findAvailableId();
      console.log(`🆔 Usando ID disponible: ${availableId}`);
      
      const query = `
        INSERT INTO edificio (
          id_edificio,  -- ✅ ESPECIFICAR EL ID
          nombre, 
          descripcion, 
          ubicacion, 
          activo
        ) VALUES ($1, $2, $3, ST_SetSRID(ST_GeomFromGeoJSON($4), 4326), $5)
        RETURNING 
          id_edificio as id,
          nombre,
          descripcion,
          activo,
          ST_AsGeoJSON(ubicacion) as ubicacion_geojson
      `;
      
      const values = [
        availableId,  // ✅ USAR EL ID DISPONIBLE
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
      
      console.log('✅ Edificio creado exitosamente con ID:', availableId);
      
      // Parsear GeoJSON
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
      
      // ✅ ERROR ESPECÍFICO para ID duplicado (por si acaso)
      if (error.code === '23505') { // Violación de unique constraint
        console.error('❌ ID ya existe, intentando con otro...');
        // Podríamos reintentar con otro ID aquí
      }
      
      throw error;
    } finally {
      client.release();
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
  },

  // ✅ FUNCIÓN DE DEBUG: Ver lógica de IDs
  async debugIdLogic() {
    try {
      console.log('🐛 DEBUG: Analizando lógica de IDs...');
      
      // Obtener todos los IDs existentes
      const idsQuery = 'SELECT id_edificio FROM edificio ORDER BY id_edificio';
      const idsResult = await pool.query(idsQuery);
      const existingIds = idsResult.rows.map(row => row.id_edificio);
      
      console.log('📋 IDs existentes:', existingIds);
      
      // Calcular ID disponible
      const availableId = await this.findAvailableId();
      const maxId = await this.getMaxId();
      
      console.log('🔢 Estadísticas de IDs:', {
        existentes: existingIds.length,
        disponibles: availableId,
        máximo: maxId,
        huecos: existingIds.filter((id, index) => index > 0 && id !== existingIds[index - 1] + 1)
      });
      
      return {
        existingIds,
        availableId,
        maxId
      };
      
    } catch (error) {
      console.error('❌ Error en debug:', error.message);
      throw error;
    }
  }
};

module.exports = buildingModel;