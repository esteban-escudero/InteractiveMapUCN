# 🏗️ Arquitectura y Tecnologías del Sistema

Este documento define el stack tecnológico del proyecto **InteractiveMapUCN**, describe la arquitectura de los componentes y ofrece un glosario técnico completo.

---

## 1. Stack Tecnológico

El proyecto utiliza una arquitectura **PERN Stack** (PostgreSQL, Express, React, Node.js) potenciada con herramientas geoespaciales.

### 🎨 Frontend (Cliente)
*   **React.js**: Biblioteca principal para la construcción de interfaces de usuario.
*   **Leaflet**: Librería líder para mapas interactivos.
*   **React-Leaflet**: Componentes de React para integrar Leaflet.
*   **CSS Modules**: Estilos encapsulados para modularidad y limpieza.
*   **Axios**: Cliente HTTP para comunicación asíncrona.

### ⚙️ Backend (Servidor)
*   **Node.js**: Entorno de ejecución JavaScript.
*   **Express.js**: Framework para API RESTful.
*   **JWT (JSON Web Tokens)**: Seguridad y autenticación stateless.
*   **Multer**: Gestión de carga de archivos (planos de edificios).

### 🗄️ Persistencia y Geoespacial
*   **PostgreSQL**: Base de datos relacional.
*   **PostGIS**: La joya de la corona. Motor espacial que permite:
    *   Cálculo de intersecciones (`ST_Intersection`).
    *   Búsqueda de cercanía (`ST_DWithin`).
    *   Validación geométrica (`ST_IsValid`).

---

## 2. Diagrama de Arquitectura de Datos

El siguiente diagrama ilustra el flujo de información desde el usuario hasta la base de datos geográfica:

:::mermaid
graph TD
    User((👤 Usuario))
    
    subgraph "💻 Frontend (Client Side)"
        UI[React UI Components]
        Map[Leaflet Map Layer]
        AuthClient[Auth Context Provider]
        Axios[Axios Client]
    end
    
    subgraph "☁️ Backend (Server Side)"
        API[Express Router]
        Middleware[Middleware Security/Uploads]
        Controllers[Business Logic Controllers]
        Services[Spatial Services]
    end
    
    subgraph "💾 Data Layer"
        DB[(PostgreSQL)]
        PostGIS[[Extensions: PostGIS]]
    end

    %% Interactions
    User -->|Clics/Navegación| UI
    UI -->|Renderizado| Map
    UI -->|Credenciales| AuthClient
    
    AuthClient -->|JWT Header| Axios
    UI -->|Data Requests| Axios
    
    Axios -->|HTTP/JSON| API
    
    API --> Middleware
    Middleware --> Controllers
    
    Controllers -->|Complex Logic| Services
    Controllers -->|Transactions| DB
    
    Services -->|Geo Queries| PostGIS
    
    PostGIS -.->|GeoJSON| Services
    DB -.->|Rows| Controllers
    
    Controllers -.->|JSON Response| Axios
:::

---

## 3. Detalles de Interacción Clave

### 📍 Cálculo de Rutas (Core Feature)
1.  **Input**: Usuario selecciona Origen y Destino.
2.  **Request**: `POST /api/routes/calculate` con `{origin: {lat, lng}, destination: {lat, lng}}`.
3.  **Graph Construction**:
    *   El backend recupera la red vial desde **PostGIS**.
    *   Nodes = Intersecciones. Edges = Caminos.
4.  **Algorithm**: Se ejecuta **Dijkstra** para minimizar el costo (distancia).
5.  **Output**: Retorna un GeoJSON `LineString` que el Front dibuja en el mapa.

### 🏢 Gestión de Edificios
1.  **Upload**: Admin sube plano (PNG/JPG).
2.  **Storage**: `Multer` guarda el archivo en disco.
3.  **Reference**: Se guarda la ruta del archivo en la tabla `building_images`.
4.  **Retrieval**: Al consultar un edificio, un `JOIN` SQL trae sus imágenes asociadas.

---

# 📘 Glosario Técnico Completo

Conceptos fundamentales para entender y operar este sistema.

## A
### Algoritmo
Secuencia lógica de pasos. Usamos **Dijkstra** y **Búsqueda en Anchura (BFS)** para grafos.

:::mermaid
graph LR
    A[Inicio] --> B{¿Es Destino?}
    B -- Sí --> C[Terminar]
    B -- No --> D[Visitar Vecinos]
    D --> B
:::

### API (Application Programming Interface)
Contrato de comunicación entre Front y Back.
*   Endpoint: `/api/v1/resource`
*   Verbo: GET, POST, PUT, DELETE

## B
### Backend
El motor del sistema. Procesa reglas de negocio, valida datos y habla con la DB.

## C
### Controlador (Controller)
Orquestador de una petición.
```javascript
// Ejemplo simplificado
const getBuilding = async (req, res) => {
    const data = await BuildingModel.findById(req.params.id);
    res.json(data);
}
```

## D
### Dijkstra
Algoritmo voraz (greedy) para encontrar el camino más corto en un grafo con pesos positivos. Ideal para mapas de navegación estáticos.

## E
### Endpoint
URL específica expuesta por el servidor para realizar una acción concreta.

## F
### Frontend
La cara del sistema. Todo lo que corre en el navegador del usuario (React).

## G
### GeoJSON
Estándar de facto para codificar estructuras de datos geográficos.
```json
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [-70.123, -23.456]
  }
}
```

### Grafo
Estructura matemática de **Nodos** (puntos) y **Aristas** (conexiones) usada para modelar la red de caminos de la universidad.

## H
### Header HTTP
Metadatos enviados en una petición. Clave para la seguridad:
`Authorization: Bearer <token_jwt>`

## J
### JWT (JSON Web Token)
Estándar compacto para transmisión segura de información entre partes. Se usa para verificar que quien hace la petición es quien dice ser (el Admin).

## M
### Middleware
Software que se ubica "en medio". En Express, funciones que se ejecutan antes de llegar al controlador final (ej: verificar que el usuario esté logueado).

### Model (Modelo)
Representación en código de una tabla de la base de datos. Encapsula las queries SQL.

## N
### Nodo
En nuestro grafo de rutas, un punto donde las rutas se conectan, inician o terminan.

## P
### PostGIS
El superhéroe de este proyecto. Convierte a PostgreSQL en una base de datos espacial capaz de entender geometrías, proyecciones y relaciones espaciales.

### Polilínea
Secuencia de líneas conectadas. Así se dibujan las rutas en el mapa.

## R
### React
Librería de JS basada en componentes y estado reactivo.

## S
### Servicio (Service)
Capa de código que contiene la lógica de negocio pura, separada de lo HTTP (Controlador) y de lo SQL (Modelo).

### ST_DWithin
Función mágica de PostGIS: "Select * From places Where ST_DWithin(place_geom, user_geom, 50 meters)".

## 🧠 Diagrama Resumen Conceptual

:::mermaid
flowchart TD
    User([👤 Usuario Final])
    
    subgraph Browser
        ReactApp[⚛️ React SPA]
        Leaflet[🗺️ Mapa Interactivo]
    end
    
    subgraph Server
        Node[🟢 Node.js]
        Express[🚀 Express API]
        Logic[⚙️ Business Logic]
    end
    
    subgraph Persistence
        PG[🐘 PostgreSQL]
        GIS[🌍 PostGIS]
    end

    User ==> ReactApp
    ReactApp <--> Leaflet
    
    ReactApp == HTTP/REST ==> Express
    
    Express --> Logic
    
    Logic <== SQL/GeoQueries ==> GIS
    GIS -.-> PG
:::
