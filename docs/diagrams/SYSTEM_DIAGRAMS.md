# 📊 Diagramas del Sistema

Este documento contiene la representación visual de la arquitectura, flujos de datos y estructura de base de datos.

## 🏗️ Arquitectura General

```mermaid
graph TD
    Client[Usuario Web / PWA]
    LB[Nginx Proxy / Load Balancer]
    API[Backend API (Node.js)]
    DB[(PostgreSQL + PostGIS)]
    Cache[Memory Cache]
    FS[File System (Imágenes)]

    Client -->|HTTPS / JSON| LB
    LB -->|Static Files| Client
    LB -->|/api Request| API
    API -->|SQL Queries| DB
    API -->|Read/Write| FS
    API -->|Internal| Cache
```

## 🔄 Flujo de Autenticación (JWT)

```mermaid
sequenceDiagram
    participant U as Usuario (Admin)
    participant F as Frontend
    participant B as Backend
    participant D as Base de Datos

    U->>F: Ingresa Credenciales
    F->>B: POST /api/auth/login
    B->>D: Buscar Usuario
    D-->>B: Hash Password
    B->>B: Comparar Hash (bcrypt)
    alt Credenciales Válidas
        B->>B: Generar JWT
        B-->>F: Retornar Token
        F->>F: Guardar Token (LocalStorage)
        F-->>U: Redirigir a Dashboard
    else Inválidas
        B-->>F: Error 401
        F-->>U: Mostrar Mensaje Error
    end
```

## 🛣️ Flujo de Cálculo de Ruta

```mermaid
flowchart LR
    A[Inicio] --> B{Validar Datos}
    B -->|Inválido| C[Error 400]
    B -->|Válido| D[Obtener Todas las Rutas]
    D --> E[Construir Grafo en Memoria]
    E --> F[Filtrar por Tipo (Peatonal/Accesible)]
    F --> G[Encontrar Nodos más Cercanos (Start/End)]
    G --> H[Ejecutar Dijkstra]
    H --> I{¿Camino Encontrado?}
    I -->|No| J[Error 404]
    I -->|Si| K[Combinar Geometría (LineString)]
    K --> L[Retornar GeoJSON + Meta]
```

## 🗄️ Modelo Relacional (ER)

```mermaid
erDiagram
    USERS ||--|{ BUILDINGS : manages
    BUILDINGS ||--o{ ROOMS : contains
    BUILDINGS ||--o{ BUILDING_IMAGES : has
    ROUTES }|--|{ BUILDINGS : connects_to

    USERS {
        int id PK
        string username
        string password
    }

    BUILDINGS {
        int id PK
        string name
        geometry polygon
    }

    ROOMS {
        int id PK
        string name
        string type
        int floor
    }

    ROUTES {
        int id PK
        string name
        string type
        geometry line_string
    }
```
