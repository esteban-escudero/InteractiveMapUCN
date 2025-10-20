erDiagram
    ADMINISTRADOR {
        SERIAL id_admin PK
        VARCHAR email
        VARCHAR password_hash
        VARCHAR nombre
        BOOLEAN activo
        TIMESTAMP fecha_creacion
    }

    EDIFICIO {
        SERIAL id_edificio PK
        VARCHAR nombre
        DECIMAL area
        INT orientacion_grados
        TEXT descripcion
        BOOLEAN activo
        GEOMETRY ubicacion
        GEOMETRY poligono
    }

    SALA {
        SERIAL id_sala PK
        INT id_edificio FK
        VARCHAR nombre_sala
        INT piso
        VARCHAR tipo_sala
        BOOLEAN accesible_silla_ruedas
        GEOMETRY coordenadas_geo
        GEOMETRY poligono_sala
    }

    RUTA {
        SERIAL id_ruta PK
        VARCHAR nombre_ruta
        VARCHAR tipo_ruta
        INT distancia_metros
        INT tiempo_estimado_minutos
        BOOLEAN activa
        GEOMETRY geometria_ruta
    }

    PUNTO_RUTA {
        SERIAL id_punto PK
        INT id_ruta FK
        INT id_edificio FK
        INT id_sala FK
        INT orden
        VARCHAR tipo_punto
        GEOMETRY coordenadas_geo
        VARCHAR descripcion
    }

    PLANO {
        SERIAL id_plano PK
        INT id_edificio FK
        INT piso
        VARCHAR imagen_plano
        VARCHAR formato_imagen
        INT tamaño_bytes
        TIMESTAMP fecha_actualizacion
        GEOMETRY bbox
    }

    EDIFICIO ||--o{ SALA : "contiene"
    EDIFICIO ||--o{ PLANO : "tiene_planos"
    RUTA ||--o{ PUNTO_RUTA : "compuesta_por"
    PUNTO_RUTA }o--|| EDIFICIO : "ubicado_en"
    PUNTO_RUTA }o--|| SALA : "referencia_sala"