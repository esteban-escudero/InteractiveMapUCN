::: mermaid
erDiagram
administrador {
INT id_admin PK
VARCHAR email UK
VARCHAR password_hash
VARCHAR nombre
BOOLEAN activo
TIMESTAMP fecha_creacion
}
edificio {
INT id_edificio PK
VARCHAR nombre
TEXT descripcion
VARCHAR ubicacion
VARCHAR tipo
VARCHAR estado
JSON planos
}

plano {
INT id_plano PK
INT id_edificio FK
INT piso
VARCHAR imagen_plano
VARCHAR formato_imagen
INT tamaño_bytes
TIMESTAMP fecha_actualizacion
}

refresh_tokens {
INT id PK
INT id_admin FK
VARCHAR token UK
TIMESTAMP expires_at
TIMESTAMP created_at
VARCHAR ip_address
TEXT user_agent
}

ruta {
INT id_ruta PK
VARCHAR nombre_ruta
VARCHAR tipo_ruta
INT distancia_metros
INT tiempo_estimado_minutos
BOOLEAN activa
VARCHAR geometria_ruta
}

sala {
INT id_sala PK
INT id_edificio FK
VARCHAR nombre_sala
INT piso
VARCHAR tipo_sala
BOOLEAN accesible_silla_ruedas
VARCHAR ubicacion
}

administrador ||--o{ refresh_tokens : ""
edificio ||--o{ plano : ""
edificio ||--o{ sala : ""

:::
