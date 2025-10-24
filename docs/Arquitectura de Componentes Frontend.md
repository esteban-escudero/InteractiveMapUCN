```mermaid
graph TD
    A[Map.js] --> B[useMap Hook]
    A --> C[useBuildings Hook]
    A --> D[useGeoServer Hook]
    A --> E[BuildingForm Component]
    A --> F[SidePanel Component]
    A --> G[BuildingList Component]
    
    B --> H[Leaflet Instance]
    B --> I[Map Events]
    
    C --> J[Building Service]
    C --> K[Buildings State]
    
    D --> L[GeoServer API]
    D --> M[WFS Features]
    
    J --> N[API Client]
    N --> O[Backend API]
    
    style A fill:#bbdefb
    style B fill:#c8e6c9
    style C fill:#ffecb3
    style D fill:#f8bbd0