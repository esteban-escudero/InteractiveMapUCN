# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [1.0.0] - 2025-12-15

### Agregado
- **Autenticación**: Sistema completo de login y registro para administradores usando JWT y bcryptjs.
- **Frontend (PWA)**:
  - Mapa interactivo con Leaflet y React.
  - Soporte offline mediante Service Workers.
  - Diseño responsive y modo oscuro.
  - Panel de administración protegido.
  - Visualización de edificios con polígonos coloreados por tipo.
- **Backend (API)**:
  - Endpoints RESTful para gestión de Edificios, Salas y Rutas.
  - Soporte para carga de imágenes de planos (`/building-images`).
  - Servicios de análisis espacial y de proximidad con Turf.js.
  - Algoritmo de Dijkstra para cálculo de rutas óptimas.
- **Base de Datos**:
  - Configuración de PostgreSQL con extensión PostGIS.
  - Modelos de datos geográficos para Edificios y Rutas.

### Seguridad
- Implementación de Middlewares de seguridad (Helmet, CORS).
- Validación de datos de entrada.

### Documentación
- Guía de arquitectura del sistema.
- Documentación detallada de la API.
- Guías de despliegue y contribución.

## [0.1.0] - 2025-10-01

### Agregado
- Estructura inicial del proyecto Monorepo (Frontend + Backend).
- Configuración básica de Docker Compose.
- "Hello World" en endpoints de API.
