# Mapa Interactivo UCN - Campus Coquimbo

Sistema de mapeo interactivo para la Universidad Católica del Norte (UCN) - Campus Coquimbo, que permite la navegación y búsqueda de ubicaciones dentro del campus universitario mediante Progressive Web App (PWA).

## Descripción del Proyecto

**InteractiveMapUCN** es una **Progressive Web App (PWA)** de tipo **Sistema de Información Geográfica (SIG/GIS) Web** diseñada para facilitar la orientación y navegación dentro del campus Coquimbo de la UCN. Los usuarios pueden acceder directamente desde su navegador web sin necesidad de instalación de aplicaciones nativas.

### Tipo de Proyecto
- **Categoría**: Sistema de Información Geográfica (SIG/GIS) Web
- **Arquitectura**: Progressive Web App (PWA) Full-Stack
- **Dominio**: Educación Superior / Campus Universitario
- **Campus**: Coquimbo, Chile
- **Acceso**: Navegador Web
- **Complejidad**: Medio-Alto

### Propósito
- Orientación en campus universitario
- Búsqueda de ubicaciones (edificios, salas, servicios)
- Geolocalización en tiempo real
- Cálculo de rutas inteligentes con múltiples tipos (peatonal, accesible, rápida, emergencia, vehicular)
- Navegación asistida desde ubicación actual
- Gestión administrativa de edificios, salas y rutas
- Acceso público sin autenticación para usuarios

## Características Principales

### Para Usuarios
- **Mapa Interactivo**: Visualización del campus usando Leaflet con capas personalizadas
- **PWA**: Funciona como app nativa, instalable, con soporte offline
- **Búsqueda Inteligente**: Encuentra edificios y salas por nombre con autocompletado
- **Geolocalización GPS**: Muestra tu ubicación actual en el mapa con marcador animado
-  **Navegación desde Mi Ubicación**: Calcula rutas desde tu posición actual al destino
- **Cálculo de Rutas Inteligente**: 2 perfiles de rutas con algoritmo de Dijkstra
  - **Peatonal**: Ruta estándar para caminar
  - **Accesible**: Adaptada para personas con movilidad reducida (evita obstáculos/escaleras)
- **Colores por Categoría**: Edificios coloreados según su tipo (académico, administrativo, servicios, etc.)
- **Modo Oscuro**: Interfaz adaptable para mayor comodidad
- **Diseño Responsive**: Optimizado para móviles y tablets

### Para Administradores
- **Sistema de Autenticación**: Login seguro con JWT
- **Gestión de Edificios**: CRUD completo con soporte para polígonos y puntos
- **Estadísticas**: Visualización rápida del conteo de salas y planos registrados
- **Gestión de Salas**: Administración de salas por edificio con diseño de grid 3 columnas
- **Gestión de Imágenes**: Subida y administración de planos por edificio y piso
- **Análisis de Proximidad**: Herramientas para analizar distancias entre edificios y rutas
- **Análisis Espacial**: Cálculo de rutas óptimas y análisis 🏢geoespacial avanzado
- **Gestión de Rutas**: Creación y edición de rutas con múltiples segmentos (polylines)
- **Gestión de Usuarios**: Administración de cuentas de administradores
- **Panel de Control**: Vista completa de edificios, rutas y estadísticas
- **Material Icons**: Interfaz moderna con iconos de Material Design

## Stack Tecnológico: Justificación y Alternativas

La elección de cada componente del stack se basó en el equilibrio entre rendimiento, escalabilidad y soporte para datos geoespaciales.

### Backend (Servidor y Datos)

| Tecnología | Justificación Técnica | Alternativas Consideradas | ¿Por qué no la alternativa? |
| :--- | :--- | :--- | :--- |
| **Node.js + Express** | Alto rendimiento en I/O asíncrono para geolocalización en tiempo real y consistencia de lenguaje (Full-stack JS). | Python (Django/FastAPI), PHP (Laravel) | Python es excelente pero menos ágil para prototipado rápido en este contexto; PHP tiene menor rendimiento en concurrencia masiva de sockets/geolocalización. |
| **PostgreSQL + PostGIS** | Estándar de la industria para SIG. Soporta tipos de datos espaciales nativos y topología compleja. | MongoDB, MySQL | MongoDB es bueno para documentos pero carece de la precisión y funciones de análisis topológico de PostGIS; MySQL tiene soporte espacial limitado en comparación. |
| **Turf.js** | Permite realizar cálculos geométricos (distancias, áreas, buffers) de forma nativa en JS, compartiendo lógica entre Front y Back. | JSTS, GDAL | JSTS es una traducción compleja de Java; GDAL requiere bindings nativos pesados que complican el despliegue en contenedores ligeros. |
| **JWT (Auth)** | Autenticación stateless ideal para PWAs y escalabilidad sin sesiones en servidor. | Cookies/Sessions, OAuth2 | Las sesiones requieren persistencia en servidor; OAuth2 fue descartado por añadir complejidad innecesaria para un sistema de admin único. |

### Frontend (Interfaz y Mapas)

| Tecnología | Justificación Técnica | Alternativas Consideradas | ¿Por qué no la alternativa? |
| :--- | :--- | :--- | :--- |
| **React 18** | Arquitectura basada en componentes que facilita la sincronización del estado del mapa con los paneles de información. | Vue.js, Angular | Vue es similar, pero React ofrece un ecosistema más maduro para librerías de mapas (React-Leaflet); Angular es demasiado pesado para una PWA enfocada en móviles. |
| **Leaflet** | Librería ligera (38kb), de código abierto y optimizada para rendimiento móvil. | Google Maps API, OpenLayers | Google Maps es privativo y de pago; OpenLayers tiene una curva de aprendizaje muy pronunciada y un peso excesivo para dispositivos de gama baja. |
| **PWA (Workbox)** | Permite instalación y funcionamiento offline, esencial para navegación en zonas de campus con baja señal. | App Nativa (Swift/Kotlin), Flutter | Una app nativa requiere descarga desde tiendas y mayor costo de desarrollo; la PWA ofrece acceso instantáneo vía URL. |

### Infraestructura

| Tecnología | Justificación Técnica | Alternativas Consideradas | ¿Por qué no la alternativa? |
| :--- | :--- | :--- | :--- |
| **Nginx** | Excelente manejando conexiones concurrentes y actuando como terminación SSL/Reverse Proxy. | Apache, Traefik | Apache consume más recursos por conexión; Traefik es potente pero Nginx es el estándar más documentado para este stack. |
| **Docker** | Garantiza que el sistema funcione igual en desarrollo y producción ("Write once, run anywhere"). | Despliegue Manual, Heroku | El despliegue manual varía entre servidores; Heroku es de pago y limita la configuración de PostGIS a bajo nivel. |

## 🏗️ Arquitectura Detallada

El sistema sigue una arquitectura desacoplada para separar responsabilidades y facilitar el mantenimiento.

::: mermaid
graph TD
    User["Usuario / Admin"] -->|HTTPS| Nginx["Nginx Reverse Proxy"]
    Nginx -->|Static Assets| Frontend["Frontend React PWA"]
    Nginx -->|/api| Backend["Backend Node.js Express"]
    Backend -->|SQL / Geo Queries| DB[("PostgreSQL + PostGIS")]
    Backend -->|Read/Write| FS["File System<br/>(Images)"]
:::

### Backend: MVC + Capa de Servicios
Implementa una división en capas para aislar la lógica de negocio del acceso a datos:
1.  **Routes Layer**: Define los endpoints y aplica middlewares (como validación de JWT).
2.  **Controller Layer**: Maneja la comunicación HTTP y formatea las respuestas.
3.  **Service Layer**: Contiene la **lógica de negocio pura** y algoritmos complejos (e.g., Dijkstra).
4.  **Data Access Layer (Models)**: Interactúa directamente con PostgreSQL/PostGIS.

### Frontend: Arquitectura Basada en Componentes
Estructurado para una alta interactividad:
*   **Context Providers**: Gestión de estado global (Autenticación, Mapa).
*   **Custom Hooks**: Encapsulan la lógica de geolocalización y cálculos (`useMap`, `useRoute`).
*   **PWA Core**: Service Workers para soporte offline y manifiesto para instalación.

## Esquema de Base de Datos (PostGIS)

El motor **PostgreSQL + PostGIS** es la pieza central para el manejo de datos espaciales con SRID 4326 (WGS 84).

::: mermaid
erDiagram
    edificio ||--o{ plano : "posee"
    edificio ||--o{ sala : "contiene"
    administrador ||--o{ refresh_tokens : "gestiona"
    ruta {
        GEOMETRY geometria_ruta
        VARCHAR tipo_ruta
    }
    edificio {
        GEOMETRY ubicacion
        VARCHAR tipo
    }
:::

### Tablas Principales
| Tabla | Tipo Geometría | Descripción |
| :--- | :--- | :--- |
| `edificio` | `Polygon` | Contornos de estructuras físicas y metadatos. |
| `sala` | `Point` | Ubicación exacta de oficinas, laboratorios y servicios. |
| `ruta` | `LineString` | Segmentos de red para navegación peatonal y accesible. |
| `plano` | N/A | Gestión de imágenes por piso/edificio. |

### Funciones Espaciales Clave
*   `ST_Distance`: Cálculo de distancias reales en metros.
*   `ST_Contains`: Determinación de puntos dentro de edificios.
*   `ST_AsGeoJSON`: Conversión nativa para visualización en Leaflet.

##  Resultados e Impacto (Conclusiones)

El proyecto ha logrado un impacto tangible en la comunidad universitaria:
-   **Inclusión Real**: Implementación efectiva de rutas para movilidad reducida.
-   **Modernización**: Primer SIG web especializado para el Campus Coquimbo.
-   **Rendimiento**: Tiempos de cálculo de ruta menores a 200ms mediante optimización de grafos.

##  Lógica de Navegación Inteligente

El cálculo de rutas es el núcleo tecnológico del proyecto. Se utiliza el algoritmo de Dijkstra sobre un grafo dinámico generado a partir de datos espaciales.

::: mermaid
flowchart LR
    A[Inicio] --> B{"Validar Puntos"}
    B -->|Válido| D["Obtener Rutas DB"]
    D --> E["Construir Grafo"]
    E --> F["Filtrar Tipo (Peatonal/Accesible)"]
    F --> G["Ejecutar Dijkstra"]
    G --> H["Generar GeoJSON"]
    H --> I[Fin]
:::

## Seguridad y Flujo de Acceso

El acceso administrativo está protegido mediante un flujo de autenticación robusto basado en JWT y validación de sesiones.

::: mermaid
sequenceDiagram
    participant Admin
    participant Frontend
    participant API (Node.js)
    participant DB (PostGIS)

    Admin->>Frontend: Login Credentials
    Frontend->>API: POST /auth/login
    API->>DB: Verify & Compare Hash
    DB-->>API: Validated
    API-->>Frontend: Set JWT Token
    Frontend->>Admin: Redirect to Dashboard
:::

## Calidad y Testing

La estabilidad del sistema se garantiza mediante una estrategia de validación en tres niveles:
1.  **Infraestructura**: Pruebas unitarias e integración con **Jest**.
2.  **Análisis Estático**: Uso de linting (ESLint) para estandarización de código.
3.  **Validación QA**: Checklist de smoke tests para mapa, búsqueda y rutas.

Para más detalle, consulta la **[Guía de Pruebas](docs/TESTING.md)**.

## Estrategia de Despliegue

La aplicación está diseñada para ser agnóstica al entorno, permitiendo despliegues rápidos mediante contenedores:
*   **Contenedores**: Orquestación completa con `Docker Compose`.
*   **Nativo (Production)**: Stack basado en `Nginx` (Proxy/SSL), `PM2` (Runtime) y `Ubuntu Server`.
*   **Seguridad**: Certificados SSL automáticos con `Let's Encrypt`.

Consulta la **[Guía de Despliegue](docs/DEPLOYMENT.md)** para pasos detallados.

## Requisitos Previos

### Desarrollo Local
- **Node.js** (v18 o superior)
- **npm** (v9 o superior)
- **PostgreSQL** (v15 o superior) con extensión **PostGIS**
- **Docker** y **Docker Compose** (opcional para DB)

### Producción
- **Ubuntu Server** 22.04 LTS o similar
- **Nginx** (reverse proxy)
- **Node.js** 18+ y **pm2**
- **PostgreSQL** 15+ con **PostGIS**
- **Certbot** (Let's Encrypt SSL)

## 🏗️ Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone https://github.com/esteban-escudero/InteractiveMapUCN.git
cd InteractiveMapUCN
```

### 2. Configurar Base de Datos
**Opción A (Docker):** `docker-compose up -d`
**Opción B (Manual):** Crear DB y ejecutar `CREATE EXTENSION postgis;`

### 3. Configurar Backend
```bash
cd backend
npm install
cp .env.example .env # Configura tus credenciales aquí
npm run dev
```

### 4. Configurar Frontend
```bash
cd ../frontend
npm install
npm start
```

##Estructura del Proyecto

```
InteractiveMapUCN/
├── backend/                # API REST (Node/Express)
│   ├── controllers/        # Lógica de endpoints
│   ├── models/             # Esquemas de PostGIS
│   ├── services/           # Algoritmo de Dijkstra
│   └── routes/             # Definición de rutas
├── frontend/               # Cliente React (PWA)
│   ├── src/components/     # UI y Mapas (Leaflet)
│   └── public/             # Manifest y Service Workers
├── database/               # Scripts SQL
└── docs/                   # Documentación técnica detallada
```

##  API Endpoints Principales

### Autenticación
- `POST /api/auth/login` - Inicio de sesión admin

### Geo-Servicios
- `GET /api/buildings` - Listado de edificios (GeoJSON)
- `POST /api/routes/calculate` - Pathfinding Dijkstra entre coordenadas
- `GET /api/proximity/analysis/:id` - Análisis de cercanía PostGIS

## Licencia y Autores

- **Licencia**: MIT
- **Autor**: [Esteban Escudero](https://github.com/esteban-escudero)
- **Contacto**: soporte.mapa@ucn.cl

---
**Universidad Católica del Norte - Campus Coquimbo**  
Sistema de Mapa Interactivo PWA | Diciembre 2025
