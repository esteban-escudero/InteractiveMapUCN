erDiagram
    ADMINISTRADOR {
        bigint id_admin PK "SERIAL"
        varchar email "VARCHAR(255) NOT NULL UNIQUE"
        varchar password_hash "VARCHAR(255) NOT NULL"
        varchar nombre "VARCHAR(100) NOT NULL"
        boolean activo "DEFAULT TRUE"
        timestamp fecha_creacion "DEFAULT CURRENT_TIMESTAMP"
    }

    EDIFICIO {
        bigint id_edificio PK "SERIAL"
        varchar nombre "VARCHAR(100) NOT NULL"
        decimal area "DECIMAL(10,2)"
        integer orientacion_grados "INT"
        text descripcion "TEXT"
        boolean activo "DEFAULT TRUE"
        geometry ubicacion "GEOMETRY(Point,4326)"
        geometry poligono "GEOMETRY(Polygon,4326)"
    }

    SALA {
        bigint id_sala PK "SERIAL"
        bigint id_edificio FK "REFERENCES EDIFICIO(id_edificio)"
        varchar nombre_sala "VARCHAR(100) NOT NULL"
        integer piso "INT NOT NULL"
        varchar tipo_sala "VARCHAR(20)"
        boolean accesible_silla_ruedas "DEFAULT FALSE"
        geometry coordenadas_geo "GEOMETRY(Point,4326)"
        geometry poligono_sala "GEOMETRY(Polygon,4326)"
    }

    RUTA {
        bigint id_ruta PK "SERIAL"
        varchar nombre_ruta "VARCHAR(100) NOT NULL"
        varchar tipo_ruta "VARCHAR(20)"
        integer distancia_metros "INT"
        integer tiempo_estimado_minutos "INT"
        boolean activa "DEFAULT TRUE"
        geometry geometria_ruta "GEOMETRY(LineString,4326)"
    }

    PUNTO_RUTA {
        bigint id_punto PK "SERIAL"
        bigint id_ruta FK "REFERENCES RUTA(id_ruta)"
        bigint id_edificio FK "REFERENCES EDIFICIO(id_edificio)"
        bigint id_sala FK "REFERENCES SALA(id_sala)"
        integer orden "INT NOT NULL"
        varchar tipo_punto "VARCHAR(20)"
        geometry coordenadas_geo "GEOMETRY(Point,4326)"
        varchar descripcion "VARCHAR(255)"
    }

    PLANO {
        bigint id_plano PK "SERIAL"
        bigint id_edificio FK "REFERENCES EDIFICIO(id_edificio)"
        integer piso "INT NOT NULL"
        varchar imagen_plano "VARCHAR(255) NOT NULL"
        varchar formato_imagen "VARCHAR(10)"
        integer tamaño_bytes "INT"
        timestamp fecha_actualizacion "DEFAULT CURRENT_TIMESTAMP"
        geometry bbox "GEOMETRY(Polygon,4326)"
    }

    EDIFICIO ||--o{ SALA : "Un edificio contiene muchas salas"
    EDIFICIO ||--o{ PLANO : "Un edificio tiene muchos planos"
    RUTA ||--o{ PUNTO_RUTA : "Una ruta está compuesta por muchos puntos"
    PUNTO_RUTA }o--|| EDIFICIO : "Un punto puede estar ubicado en un edificio"
    PUNTO_RUTA }o--|| SALA : "Un punto puede referenciar una sala"