-- Crear tabla para almacenar imágenes de edificios por piso
CREATE TABLE IF NOT EXISTS imagenes_edificio (
    id_imagen SERIAL PRIMARY KEY,
    id_edificio INTEGER NOT NULL,
    numero_piso INTEGER NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key a la tabla edificio
    CONSTRAINT fk_edificio
        FOREIGN KEY (id_edificio)
        REFERENCES edificio(id_edificio)
        ON DELETE CASCADE,
    
    -- Índice para búsquedas rápidas por edificio
    CONSTRAINT idx_edificio_piso
        UNIQUE (id_edificio, numero_piso, nombre_archivo)
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_imagenes_edificio 
    ON imagenes_edificio(id_edificio);

CREATE INDEX IF NOT EXISTS idx_imagenes_piso 
    ON imagenes_edificio(id_edificio, numero_piso);

-- Comentarios para documentación
COMMENT ON TABLE imagenes_edificio IS 'Almacena imágenes asociadas a edificios, organizadas por número de piso';
COMMENT ON COLUMN imagenes_edificio.id_imagen IS 'Identificador único de la imagen';
COMMENT ON COLUMN imagenes_edificio.id_edificio IS 'Referencia al edificio';
COMMENT ON COLUMN imagenes_edificio.numero_piso IS 'Número de piso al que pertenece la imagen';
COMMENT ON COLUMN imagenes_edificio.nombre_archivo IS 'Nombre del archivo de imagen';
COMMENT ON COLUMN imagenes_edificio.ruta_archivo IS 'Ruta relativa del archivo en el servidor';
COMMENT ON COLUMN imagenes_edificio.fecha_subida IS 'Fecha y hora de carga de la imagen';
