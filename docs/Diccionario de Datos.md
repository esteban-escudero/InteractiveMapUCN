# Diccionario de Datos - Sistema de Navegación Interactiva

## Tabla: ADMINISTRADOR
| Campo | Tipo | Longitud | Nulo | Default | Descripción |
|-------|------|----------|------|---------|-------------|
| id_admin | SERIAL | - | NO | AUTO_INCREMENT | Identificador único del administrador (PK) |
| email | VARCHAR | 255 | NO | - | Correo electrónico único del administrador |
| password_hash | VARCHAR | 255 | NO | - | Hash de la contraseña (bcrypt) |
| nombre | VARCHAR | 100 | NO | - | Nombre completo del administrador |
| activo | BOOLEAN | - | SI | TRUE | Estado del administrador (1=activo, 0=inactivo) |
| fecha_creacion | TIMESTAMP | - | SI | CURRENT_TIMESTAMP | Fecha y hora de creación del registro |

## Tabla: EDIFICIO
| Campo | Tipo | Longitud | Nulo | Default | Descripción |
|-------|------|----------|------|---------|-------------|
| id_edificio | SERIAL | - | NO | AUTO_INCREMENT | Identificador único del edificio (PK) |
| nombre | VARCHAR | 100 | NO | - | Nombre descriptivo del edificio |
| area | DECIMAL | 10,2 | SI | NULL | Área total en metros cuadrados |
| orientacion_grados | INT | - | SI | NULL | Orientación en grados (0=Norte, 90=Este, 180=Sur, 270=Oeste) |
| descripcion | TEXT | - | SI | NULL | Descripción detallada del edificio |
| activo | BOOLEAN | - | SI | TRUE | Estado del edificio (1=activo, 0=inactivo) |
| ubicacion | GEOMETRY | Point,4326 | SI | NULL | Coordenadas geográficas del punto central del edificio (SRID:4326) |
| poligono | GEOMETRY | Polygon,4326 | SI | NULL | Polígono que define la forma completa del edificio (SRID:4326) |

## Tabla: SALA
| Campo | Tipo | Longitud | Nulo | Default | Descripción |
|-------|------|----------|------|---------|-------------|
| id_sala | SERIAL | - | NO | AUTO_INCREMENT | Identificador único de la sala (PK) |
| id_edificio | INT | - | NO | - | Referencia al edificio que contiene la sala (FK) |
| nombre_sala | VARCHAR | 100 | NO | - | Nombre o número de la sala |
| piso | INT | - | NO | - | Número de piso donde se encuentra la sala |
| tipo_sala | VARCHAR | 20 | SI | NULL | Tipo: 'aula', 'laboratorio', 'oficina', 'biblioteca', 'baño', 'cafeteria', 'auditorio', 'otros' |
| accesible_silla_ruedas | BOOLEAN | - | SI | FALSE | Indica si la sala es accesible para sillas de ruedas |
| coordenadas_geo | GEOMETRY | Point,4326 | SI | NULL | Coordenadas precisas dentro del edificio (SRID:4326) |
| poligono_sala | GEOMETRY | Polygon,4326 | SI | NULL | Polígono que define la forma de la sala (SRID:4326) |

## Tabla: RUTA
| Campo | Tipo | Longitud | Nulo | Default | Descripción |
|-------|------|----------|------|---------|-------------|
| id_ruta | SERIAL | - | NO | AUTO_INCREMENT | Identificador único de la ruta (PK) |
| nombre_ruta | VARCHAR | 100 | NO | - | Nombre descriptivo de la ruta |
| tipo_ruta | VARCHAR | 20 | SI | NULL | Tipo: 'peatonal', 'accesible', 'emergencia', 'rapida' |
| distancia_metros | INT | - | SI | NULL | Distancia total de la ruta en metros |
| tiempo_estimado_minutos | INT | - | SI | NULL | Tiempo estimado de recorrido en minutos |
| activa | BOOLEAN | - | SI | TRUE | Estado de la ruta (1=activa, 0=inactiva) |
| geometria_ruta | GEOMETRY | LineString,4326 | SI | NULL | Línea que representa el trazado completo de la ruta (SRID:4326) |

## Tabla: PUNTO_RUTA
| Campo | Tipo | Longitud | Nulo | Default | Descripción |
|-------|------|----------|------|---------|-------------|
| id_punto | SERIAL | - | NO | AUTO_INCREMENT | Identificador único del punto (PK) |
| id_ruta | INT | - | NO | - | Referencia a la ruta a la que pertenece (FK) |
| id_edificio | INT | - | SI | NULL | Referencia al edificio donde se ubica (FK) |
| id_sala | INT | - | SI | NULL | Referencia a la sala específica (FK) |
| orden | INT | - | NO | - | Orden secuencial del punto en la ruta (1, 2, 3, ...) |
| tipo_punto | VARCHAR | 20 | SI | NULL | Tipo: 'inicio', 'fin', 'intermedio', 'referencia' |
| coordenadas_geo | GEOMETRY | Point,4326 | SI | NULL | Coordenadas geográficas exactas del punto (SRID:4326) |
| descripcion | VARCHAR | 255 | SI | NULL | Descripción o notas sobre el punto |

## Tabla: PLANO
| Campo | Tipo | Longitud | Nulo | Default | Descripción |
|-------|------|----------|------|---------|-------------|
| id_plano | SERIAL | - | NO | AUTO_INCREMENT | Identificador único del plano (PK) |
| id_edificio | INT | - | NO | - | Referencia al edificio del plano (FK) |
| piso | INT | - | NO | - | Número de piso que representa el plano |
| imagen_plano | VARCHAR | 255 | NO | - | Ruta del archivo o nombre de la imagen del plano |
| formato_imagen | VARCHAR | 10 | SI | NULL | Formato: 'PNG', 'JPEG', 'SVG', etc. |
| tamaño_bytes | INT | - | SI | NULL | Tamaño del archivo de imagen en bytes |
| fecha_actualizacion | TIMESTAMP | - | SI | CURRENT_TIMESTAMP | Fecha de última actualización del plano |
| bbox | GEOMETRY | Polygon,4326 | SI | NULL | Bounding box geográfico del plano (SRID:4326) |

---

## Dominios y Enumeraciones

### Dominio: TIPO_SALA
- **aula**: Sala destinada a clases
- **laboratorio**: Sala con equipamiento especializado
- **oficina**: Espacio de trabajo administrativo
- **biblioteca**: Sala de estudio y consulta
- **baño**: Servicios sanitarios
- **cafeteria**: Espacio de alimentación
- **auditorio**: Sala para eventos y presentaciones
- **otros**: Otro tipo de sala no categorizado

### Dominio: TIPO_RUTA
- **peatonal**: Ruta para tránsito a pie
- **accesible**: Ruta adaptada para movilidad reducida
- **emergencia**: Ruta de evacuación
- **rapida**: Ruta optimizada para tiempo mínimo

### Dominio: TIPO_PUNTO
- **inicio**: Punto de partida de la ruta
- **fin**: Punto de destino de la ruta
- **intermedio**: Punto intermedio en la ruta
- **referencia**: Punto de referencia sin ser parte esencial

---

## Índices Espaciales

| Tabla | Columna | Tipo | Descripción |
|-------|---------|------|-------------|
| EDIFICIO | ubicacion | GIST | Índice para búsquedas por ubicación |
| EDIFICIO | poligono | GIST | Índice para operaciones con polígonos |
| SALA | coordenadas_geo | GIST | Índice para búsquedas de salas |
| SALA | poligono_sala | GIST | Índice para formas de salas |
| RUTA | geometria_ruta | GIST | Índice para geometrías de rutas |
| PUNTO_RUTA | coordenadas_geo | GIST | Índice para puntos de ruta |
| PLANO | bbox | GIST | Índice para bounding boxes |

---

## Restricciones de Integridad

| Restricción | Tabla | Descripción |
|-------------|-------|-------------|
| PK_ADMINISTRADOR | ADMINISTRADOR | PRIMARY KEY (id_admin) |
| PK_EDIFICIO | EDIFICIO | PRIMARY KEY (id_edificio) |
| PK_SALA | SALA | PRIMARY KEY (id_sala) |
| PK_RUTA | RUTA | PRIMARY KEY (id_ruta) |
| PK_PUNTO_RUTA | PUNTO_RUTA | PRIMARY KEY (id_punto) |
| PK_PLANO | PLANO | PRIMARY KEY (id_plano) |
| FK_SALA_EDIFICIO | SALA | FOREIGN KEY (id_edificio) REFERENCES EDIFICIO ON DELETE CASCADE |
| FK_PLANO_EDIFICIO | PLANO | FOREIGN KEY (id_edificio) REFERENCES EDIFICIO ON DELETE CASCADE |
| FK_PUNTO_RUTA_RUTA | PUNTO_RUTA | FOREIGN KEY (id_ruta) REFERENCES RUTA ON DELETE CASCADE |
| FK_PUNTO_RUTA_EDIFICIO | PUNTO_RUTA | FOREIGN KEY (id_edificio) REFERENCES EDIFICIO ON DELETE SET NULL |
| FK_PUNTO_RUTA_SALA | PUNTO_RUTA | FOREIGN KEY (id_sala) REFERENCES SALA ON DELETE SET NULL |
| UK_ADMINISTRADOR_EMAIL | ADMINISTRADOR | UNIQUE (email) |