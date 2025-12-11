const pool = require("../config/database");

const buildingImageModel = {
    /**
     * Obtener todas las imágenes de un edificio
     */
    async getByBuildingId(buildingId) {
        try {
            console.log(`[buildingImageModel] Buscando imágenes para edificio ID: ${buildingId}`);

            // Primero verificar si la tabla existe
            const checkTableQuery = `
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'plano'
                );
            `;

            const tableCheck = await pool.query(checkTableQuery);

            if (!tableCheck.rows[0].exists) {
                console.log('[buildingImageModel] Tabla plano no existe, devolviendo array vacío');
                return [];
            }

            const query = `
        SELECT 
          id_plano as id,
          id_edificio,
          piso,
          imagen_plano as filename
        FROM plano
        WHERE id_edificio = $1
        ORDER BY piso ASC
      `;

            const result = await pool.query(query, [buildingId]);

            console.log(`[buildingImageModel] Encontradas ${result.rows.length} imágenes`);

            // Construir filepath para cada imagen
            const images = result.rows.map(row => ({
                id: row.id,
                buildingId: row.id_edificio,
                floor: row.piso,
                filename: row.filename,
                format: row.filename ? row.filename.split('.').pop() : 'jpg',
                sizeBytes: 0,
                uploadDate: new Date(),
                filepath: `/uploads/buildings/${row.filename}`
            }));

            return images;
        } catch (error) {
            console.error("[buildingImageModel] Error en getByBuildingId:");
            console.error("  Mensaje:", error.message);
            console.error("  Stack:", error.stack);
            console.error("  buildingId:", buildingId);

            // Devolver array vacío en lugar de lanzar error
            console.log("[buildingImageModel] Devolviendo array vacío debido al error");
            return [];
        }
    },

    /**
     * Obtener imágenes de un edificio filtradas por piso
     */
    async getByBuildingAndFloor(buildingId, floor) {
        try {
            const query = `
        SELECT 
          id_plano as id,
          id_edificio,
          piso as floor,
          imagen_plano as filename,
          formato_imagen as format,
          tamaño_bytes as size_bytes,
          fecha_actualizacion as upload_date
        FROM plano
        WHERE id_edificio = $1 AND piso = $2
        ORDER BY fecha_actualizacion DESC
      `;

            const result = await pool.query(query, [buildingId, floor]);

            const images = result.rows.map(row => ({
                id: row.id,
                buildingId: row.id_edificio,
                floor: row.floor,
                filename: row.filename,
                format: row.format,
                sizeBytes: row.size_bytes,
                uploadDate: row.upload_date,
                filepath: `/uploads/buildings/${row.filename}`
            }));

            return images;
        } catch (error) {
            console.error("Error en getByBuildingAndFloor:", error);
            throw error;
        }
    },

    /**
     * Crear un nuevo registro de imagen
     */
    async create(imageData) {
        try {
            const { buildingId, floor, filename, format, sizeBytes } = imageData;

            const query = `
          INSERT INTO plano (
            id_edificio,
            piso,
            imagen_plano,
            formato_imagen,
            tamaño_bytes,
            fecha_actualizacion
          ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
          RETURNING 
            id_plano as id,
            id_edificio,
            piso as floor,
            imagen_plano as filename,
            formato_imagen as format,
            tamaño_bytes as size_bytes,
            fecha_actualizacion as upload_date
        `;

            const values = [buildingId, floor, filename, format, sizeBytes];
            const result = await pool.query(query, values);

            const newImage = {
                id: result.rows[0].id,
                buildingId: result.rows[0].id_edificio,
                floor: result.rows[0].floor,
                filename: result.rows[0].filename,
                format: result.rows[0].format,
                sizeBytes: result.rows[0].size_bytes,
                uploadDate: result.rows[0].upload_date,
                filepath: `/uploads/buildings/${result.rows[0].filename}`
            };

            console.log("Imagen registrada en BD:", newImage);
            return newImage;
        } catch (error) {
            console.error("Error en buildingImageModel.create:", error);
            throw error;
        }
    },

    /**
     * Eliminar una imagen por ID
     */
    async delete(imageId) {
        try {
            const query = `
        DELETE FROM plano
        WHERE id_plano = $1
        RETURNING 
          id_plano as id,
          id_edificio,
          piso as floor,
          imagen_plano as filename,
          formato_imagen as format
      `;

            const result = await pool.query(query, [imageId]);

            if (result.rows.length === 0) {
                throw new Error(`No se encontró la imagen con ID: ${imageId}`);
            }

            console.log("Imagen eliminada de BD:", result.rows[0]);
            return result.rows[0];
        } catch (error) {
            console.error("Error en buildingImageModel.delete:", error);
            throw error;
        }
    },

    /**
     * Eliminar todas las imágenes de un edificio
     */
    async deleteByBuildingId(buildingId) {
        try {
            const query = `
        DELETE FROM plano
        WHERE id_edificio = $1
        RETURNING 
          id_plano as id,
          imagen_plano as filename
      `;

            const result = await pool.query(query, [buildingId]);
            console.log(`${result.rows.length} imágenes eliminadas del edificio ${buildingId}`);
            return result.rows;
        } catch (error) {
            console.error("Error en deleteByBuildingId:", error);
            throw error;
        }
    },
};

module.exports = buildingImageModel;

