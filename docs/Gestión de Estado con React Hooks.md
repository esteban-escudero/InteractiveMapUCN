```Mermaid
graph TB
    subgraph "Estado Global de la Aplicación"
        A[Map Component] --> B[useMap State]
        A --> C[useBuildings State]
        A --> D[useGeoServer State]
        
        B --> E[mapInstance]
        B --> F[isMapReady]
        
        C --> G[buildings]
        C --> H[loading]
        C --> I[error]
        
        D --> J[features]
        D --> K[status]
        
        L[UI Components] --> B
        L --> C
        L --> D
    end