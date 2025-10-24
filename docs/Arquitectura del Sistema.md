```mermaid
graph TB
    subgraph "Frontend - React.js"
        A[App Component]
        B[Map Component]
        C[BuildingForm]
        D[SidePanel]
        E[useBuildings Hook]
        F[useMap Hook]
        G[useGeoServer Hook]
    end

    subgraph "Backend - Node.js/Express"
        H[Express Server]
        I[Buildings Controller]
        J[Building Model]
        K[Routes]
    end

    subgraph "Base de Datos"
        L[PostgreSQL]
        M[PostGIS Extension]
    end

    subgraph "Servicios Externos"
        N[GeoServer WFS]
        O[Leaflet Maps]
    end

    A --> B
    B --> E
    B --> F
    B --> G
    E --> I
    F --> O
    G --> N
    I --> J
    J --> L
    L --> M
    
    style A fill:#e1f5fe
    style H fill:#f3e5f5
    style L fill:#e8f5e8
    style N fill:#fff3e0
