# 🏗️ Arquitectura del Sistema - InteractiveMapUCN

Este documento describe la arquitectura técnica, las decisiones de diseño y los patrones utilizados en el desarrollo de la aplicación InteractiveMapUCN.

## 🔭 Visión General

InteractiveMapUCN es una **Progressive Web App (PWA)** diseñada como un Sistema de Información Geográfica (SIG/GIS) ligero. La aplicación sigue una arquitectura cliente-servidor desacoplada (Headless), donde el frontend y el backend se comunican exclusivamente a través de una API RESTful.

### Diagrama de Alto Nivel

```mermaid
graph TD
    User[Usuario / Admin] -->|HTTPS| Nginx[Nginx Reverse Proxy]
    Nginx -->|Static Assets| Frontend[Frontend React PWA]
    Nginx -->|/api| Backend[Backend Node.js Express]
    Backend -->|SQL / Geo Queries| DB[(PostgreSQL + PostGIS)]
    Backend -->|Read/Write| FS[File System (Images)]
```

## 🛠️ Stack Tecnológico

### Frontend (Cliente)
- **Framework**: React 18
- **Lenguaje**: JavaScript (ES6+) / TypeScript (parcial)
- **Mapas**: Leaflet + React Leaflet
- **Geospatial**: Turf.js (Análisis cliente)
- **Estilos**: CSS Modules / CSS Variables
- **Iconos**: Material Icons
- **Estado Global**: React Context API
- **Routing**: React Router
- **PWA**: Service Workers, Manifest, Cache API

### Backend (Servidor)
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Seguridad**: Helmet, CCTV, JWT, bcryptjs
- **Geospatial**: Turf.js (Análisis servidor)
- **Uploads**: Multer
- **Procesos**: PM2 (Production Process Manager)

### Persistencia de Datos
- **Base de Datos**: PostgreSQL 15+
- **Extensión Espacial**: PostGIS 3+
- **Tipos de Datos**: 
  - `GEOMETRY(Polygon, 4326)` para Edificios
  - `GEOMETRY(LineString, 4326)` para Rutas
  - `GEOMETRY(Point, 4326)` para Nodos

## 🧩 Patrones de Diseño

### Backend: MVC + Capa de Servicios
El backend implementa una arquitectura en capas para separar responsabilidades y facilitar el mantenimiento.

1. **Routes Layer** (`/routes`): Define los endpoints y delega al controlador.
2. **Controller Layer** (`/controllers`): Maneja la petición HTTP, valida entradas y formatea respuestas. No contiene lógica de negocio compleja.
3. **Service Layer** (`/services`): Contiene la lógica de negocio pura y algoritmos complejos (e.g., Dijkstra, análisis espacial).
4. **Data Access Layer** (`/models`): Interactúa directamente con la base de datos usando `node-postgres`.

**Flujo de Datos:**
`Request` -> `Middleware` -> `Route` -> `Controller` -> `Service` -> `Model` -> `Database`

### Frontend: Component-Based Architecture
El frontend está estructurado en componentes funcionales reutilizables y hooks personalizados.

1. **Context Providers**: Manejan el estado global (AuthContext, MapContext).
2. **Custom Hooks**: Encapsulan lógica de estado y efectos (e.g., `useBuildings`, `useRouteCalculation`).
3. **Smart/Dumb Components**: Separación entre componentes contenedores (lógica) y presentacionales (UI).

## 🗺️ Análisis Geoespacial y Algoritmos

### Cálculo de Rutas (Service Layer)
El sistema implementa un grafo ponderado dinámico para la navegación:
- **Nodos**: Puntos de intersección y destinos finales.
- **Aristas**: Segmentos de ruta (`LineString`).
- **Peso**: Distancia geográfica calculada dinámicamente.
- **Algoritmo**: Dijkstra optimizado para grafos dispersos.

### Análisis de Proximidad
Se utiliza **Turf.js** y **PostGIS** en conjunto para:
- Detectar edificios cercanos a la ubicación del usuario (punto en polígono).
- Calcular distancias geobásicas reales.
- Validar topología de nuevas rutas.

## 🔒 Seguridad y Autenticación

- **Autenticación**: JWT (JSON Web Tokens) con estrategia de Bearer Token.
- **Passwords**: Hashed con `bcryptjs`.
- **Protección**: 
  - Validación de esquemas de entrada.
  - Sanitización de consultas SQL (Parameter Binding).
  - CORS configurado estrictamente.
- **Archivos**: Validación de tipos MIME y sanitización de nombres de archivo en uploads.

## 🚀 Estrategia de Despliegue

La aplicación está contenerizada para desarrollo y utiliza `PM2` + `Nginx` para producción en servidores Linux (Ubuntu).

- **Docker Compose**: Orquesta BD, Backend y Frontend para entorno dev.
- **Nginx**: Maneja SSL (Let's Encrypt), compresión Gzip y sirve el build estático de React.
