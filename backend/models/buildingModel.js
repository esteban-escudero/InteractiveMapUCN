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

  // ✅ CORREGIDA: Función update para la tabla edificio
  async update(id, buildingData) {
    try {
      console.log('✏️ Actualizando edificio ID:', id, 'Datos:', buildingData);
      
      const { nombre, descripcion, ubicacion, activo } = buildingData;
      
      // ✅ QUERY CORREGIDA - Usar edificio y id_edificio
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
      
      // Parsear GeoJSON
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
      
      // Parsear GeoJSON
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
  }
};

module.exports = buildingModel;