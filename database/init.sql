-- Inicializacion de la base de datos
-- Mapa Interactivo UCN
-- PostgreSQL 15+ con PostGIS

-- Habilitar extension PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Funcion para limpiar tokens expirados
CREATE OR REPLACE FUNCTION delete_expired_tokens() RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  DELETE FROM refresh_tokens WHERE expires_at < NOW();
END;
$$;

-- Tabla de administradores
CREATE TABLE IF NOT EXISTS administrador (
    id_admin SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de edificios
CREATE TABLE IF NOT EXISTS edificio (
    id_edificio SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    ubicacion geometry(Point,4326),
    tipo VARCHAR(50) DEFAULT 'Oficina Profesor' NOT NULL,
    estado VARCHAR(20) DEFAULT 'activo' NOT NULL,
    planos JSONB DEFAULT '[]'::jsonb,
    CONSTRAINT chk_estado_edificio CHECK (estado IN ('activo', 'mantenimiento', 'cerrado', 'construccion')),
    CONSTRAINT chk_tipo_edificio CHECK (tipo IN (
        'Bano', 'Sala de Clase', 'Laboratorio', 'Oficina Administracion',
        'Casino', 'Cafeteria', 'Biblioteca', 'Sala de Estudio',
        'Gimnasio', 'Estacionamiento', 'Oficina Profesor', 'Centro de Salud',
        'Academico', 'Administrativo', 'Investigacion', 'Servicios',
        'Deportivo', 'Cultural', 'Residencial', 'Taller',
        'Auditorio', 'Sala de Conferencias'
    ))
);

-- Tabla de salas
CREATE TABLE IF NOT EXISTS sala (
    id_sala SERIAL PRIMARY KEY,
    id_edificio INTEGER REFERENCES edificio(id_edificio) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    piso INTEGER DEFAULT 1,
    capacidad INTEGER,
    tipo VARCHAR(50),
    estado VARCHAR(20) DEFAULT 'activo',
    equipamiento JSONB DEFAULT '[]'::jsonb,
    ubicacion geometry(Point,4326)
);

-- Tabla de nodos de ruta
CREATE TABLE IF NOT EXISTS nodo_ruta (
    id_nodo SERIAL PRIMARY KEY,
    ubicacion geometry(Point,4326) NOT NULL,
    tipo VARCHAR(50) DEFAULT 'waypoint',
    nombre VARCHAR(100),
    descripcion TEXT,
    accesible BOOLEAN DEFAULT true
);

-- Tabla de segmentos de ruta
CREATE TABLE IF NOT EXISTS segmento_ruta (
    id_segmento SERIAL PRIMARY KEY,
    nodo_origen INTEGER REFERENCES nodo_ruta(id_nodo) ON DELETE CASCADE,
    nodo_destino INTEGER REFERENCES nodo_ruta(id_nodo) ON DELETE CASCADE,
    distancia DECIMAL(10,2),
    tiempo_estimado INTEGER,
    tipo VARCHAR(50) DEFAULT 'camino',
    accesible BOOLEAN DEFAULT true,
    geometria geometry(LineString,4326)
);

-- Tabla de refresh tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    id_admin INTEGER REFERENCES administrador(id_admin) ON DELETE CASCADE,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices espaciales
CREATE INDEX IF NOT EXISTS idx_edificio_ubicacion ON edificio USING GIST(ubicacion);
CREATE INDEX IF NOT EXISTS idx_sala_ubicacion ON sala USING GIST(ubicacion);
CREATE INDEX IF NOT EXISTS idx_nodo_ubicacion ON nodo_ruta USING GIST(ubicacion);
CREATE INDEX IF NOT EXISTS idx_segmento_geometria ON segmento_ruta USING GIST(geometria);

-- Indices de busqueda
CREATE INDEX IF NOT EXISTS idx_edificio_nombre ON edificio(nombre);
CREATE INDEX IF NOT EXISTS idx_sala_nombre ON sala(nombre);
CREATE INDEX IF NOT EXISTS idx_administrador_email ON administrador(email);
