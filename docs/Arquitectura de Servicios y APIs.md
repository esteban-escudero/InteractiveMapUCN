```Mermaid
graph LR
    subgraph "Capa de Servicios"
        A[Building Service] --> B[HTTP Client]
        C[GeoServer API] --> D[WFS Client]
        
        B --> E[REST API]
        D --> F[WFS Endpoint]
        
        G[React Hooks] --> A
        G --> C
        
        E --> H[Express Routes]
        F --> I[GeoServer]
        
        H --> J[Controllers]
        J --> K[Models]
        K --> L[PostgreSQL]
    end