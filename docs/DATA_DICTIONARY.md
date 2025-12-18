# Diccionario de Datos

Este documento describe la estructura de la base de datos basada en el diagrama Entidad-Relación (`MERDB.md`).

## Tablas

### 1. administrador
Almacena la información de los administradores del sistema.

| Columna | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id_admin` | INT | PK | Identificador único del administrador. |
| `email` | VARCHAR | UK | Correo electrónico único del administrador. |
| `password_hash` | VARCHAR | | Hash de la contraseña para autenticación segura. |
| `nombre` | VARCHAR | | Nombre completo del administrador. |
| `activo` | BOOLEAN | | Indica si la cuenta del administrador está activa. |
| `fecha_creacion` | TIMESTAMP | | Fecha y hora en que se creó el registro. |

### 2. edificio
Contiene la información de los edificios registrados en el mapa.

| Columna | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id_edificio` | INT | PK | Identificador único del edificio. |
| `nombre` | VARCHAR | | Nombre común o formal del edificio. |
| `descripcion` | TEXT | | Descripción detallada del edificio y sus funciones. |
| `ubicacion` | VARCHAR | | Coordenadas o referencia de ubicación del edificio. |
| `tipo` | VARCHAR | | Clasificación del edificio (ej. Administrativo, Docente). |
| `estado` | VARCHAR | | Estado operativo del edificio (ej. Abierto, En Mantenimiento). |
| `planos` | JSON | | Metadatos o estructura JSON asociada a los planos. |

### 3. plano
Almacena los planos asociados a cada piso de un edificio.

| Columna | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id_plano` | INT | PK | Identificador único del plano. |
| `id_edificio` | INT | FK | ID del edificio al que pertenece el plano. |
| `piso` | INT | | Número del piso representado en el plano. |
| `imagen_plano` | VARCHAR | | Ruta o URL de la imagen del plano. |
| `formato_imagen` | VARCHAR | | Formato del archivo de imagen (ej. PNG, SVG). |
| `tamaño_bytes` | INT | | Tamaño del archivo de imagen en bytes. |
| `fecha_actualizacion` | TIMESTAMP | | Fecha de la última modificación del plano. |

### 4. refresh_tokens
Gestiona los tokens de refresco para la autenticación de sesión.

| Columna | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | INT | PK | Identificador único del registro de token. |
| `id_admin` | INT | FK | ID del administrador propietario del token. |
| `token` | VARCHAR | UK | Cadena única del token de refresco. |
| `expires_at` | TIMESTAMP | | Fecha y hora de expiración del token. |
| `created_at` | TIMESTAMP | | Fecha y hora de creación del token. |
| `ip_address` | VARCHAR | | Dirección IP desde la que se solicitó el token. |
| `user_agent` | TEXT | | Agente de usuario del dispositivo cliente. |

### 5. ruta
Define las rutas disponibles en el sistema de mapas.

| Columna | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id_ruta` | INT | PK | Identificador único de la ruta. |
| `nombre_ruta` | VARCHAR | | Nombre descriptivo de la ruta. |
| `tipo_ruta` | VARCHAR | | Tipo de ruta (ej. Peatonal, Evacuación). |
| `distancia_metros` | INT | | Distancia total de la ruta en metros. |
| `tiempo_estimado_minutos` | INT | | Tiempo estimado para recorrer la ruta. |
| `activa` | BOOLEAN | | Indica si la ruta está habilitada para su uso. |
| `geometria_ruta` | VARCHAR | | Datos geométricos/espaciales de la ruta. |

### 6. sala
Información sobre las salas, oficinas o espacios dentro de los edificios.

| Columna | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id_sala` | INT | PK | Identificador único de la sala. |
| `id_edificio` | INT | FK | ID del edificio donde se ubica la sala. |
| `nombre_sala` | VARCHAR | | Nombre o código identificador de la sala. |
| `piso` | INT | | Número de piso donde se encuentra la sala. |
| `tipo_sala` | VARCHAR | | Uso de la sala (ej. Aula, Laboratorio, Oficina). |
| `accesible_silla_ruedas` | BOOLEAN | | Indica si es accesible para sillas de ruedas. |
| `ubicacion` | VARCHAR | | Detalles específicos de la ubicación dentro del piso. |

## Relaciones

| Entidad Origen | Cardinalidad | Entidad Destino | Descripción |
| :--- | :--- | :--- | :--- |
| `administrador` | 1 a N | `refresh_tokens` | Un administrador puede tener múltiples tokens de refresco activos. |
| `edificio` | 1 a N | `plano` | Un edificio tiene asociados varios planos (generalmente uno por piso). |
| `edificio` | 1 a N | `sala` | Un edificio contiene múltiples salas. |
