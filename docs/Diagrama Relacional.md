```Mermaid
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
        text descripcion "TEXT"
        varchar tipo "VARCHAR(50) NOT NULL"
        geometry ubicacion "GEOMETRY(Point,4326)"
        timestamp fecha_creacion "DEFAULT CURRENT_TIMESTAMP"
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

    EDIFICIO ||--o{ SALA : "contiene"
    EDIFICIO ||--o{ PLANO : "tiene"
    RUTA ||--o{ PUNTO_RUTA : "compuesta_por"
    PUNTO_RUTA }o--|| EDIFICIO : "ubicado_en"
    PUNTO_RUTA }o--|| SALA : "referencia"