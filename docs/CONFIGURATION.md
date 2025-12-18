# Guía de Configuración - InteractiveMapUCN

Este documento explica en detalle todas las variables de configuración disponibles para el sistema.

## Archivo `.env`

La aplicación utiliza la librería `dotenv` para cargar variables de entorno desde un archivo `.env` ubicado en la raíz del directorio `backend/`.

> **Nota**: Nunca subas tu archivo `.env` real al control de versiones. Usa `.env.example` como plantilla.

---

## Configuración del Servidor

| Variable | Tipo | Default | Descripción |
|----------|------|---------|-------------|
| `PORT` | Número | `3001` | Puerto donde escuchará el servidor API. |
| `NODE_ENV` | String | `development` | Entorno de ejecución (`development`, `production`, `test`). En producción, optimiza el rendimiento y logs. |

---

## Base de Datos (PostgreSQL)

| Variable | Descripcion |
|----------|-------------|
| `DB_HOST` | Host de la base de datos (ej. `localhost` o IP de Docker). |
| `DB_PORT` | Puerto de conexión (default `5432`). |
| `DB_USER` | Usuario con permisos de lectura/escritura. |
| `DB_PASSWORD` | Contraseña del usuario. |
| `DB_NAME` | Nombre de la base de datos (debe tener extensión PostGIS habilitada). |

---

## Seguridad (JWT)

| Variable | Importancia | Descripción |
|----------|-------------|-------------|
| `JWT_SECRET` | **CRÍTICA** | Clave secreta para firmar los tokens. Si se filtra, cualquiera puede generar tokens de admin. En producción, usa una cadena aleatoria larga (min 32 caracteres). |
| `JWT_EXPIRES_IN` | Media | Tiempo de vida del token (ej. `1h`, `7d`). |

---

## Red y CORS

| Variable | Descripción |
|----------|-------------|
| `CORS_ORIGIN` | URL permitida para hacer peticiones a la API. En desarrollo suele ser `http://localhost:3000`. En producción debe ser tu dominio `https://mapa.ucn.cl`. |

---

## Límites de Archivos

| Variable | Default | Descripción |
|----------|---------|-------------|
| `MAX_FILE_SIZE` | `5242880` | Tamaño máximo en bytes para subida de imágenes (5MB). |

---

## Configuraciones Avanzadas

### PM2 (Producción)
El archivo `ecosystem.config.js` (si existe) controla la configuración del gestor de procesos PM2.
- **instances**: 'max' (usa todos los núcleos).
- **autorestart**: true.
- **watch**: false (en producción).

### Nginx
La configuración del proxy reverso debe definirse en `/etc/nginx/sites-available/`.
- **client_max_body_size**: Debe coincidir o superar `MAX_FILE_SIZE` (ej. `10M`).
