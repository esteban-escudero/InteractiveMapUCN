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
  }
};

module.exports = buildingModel;