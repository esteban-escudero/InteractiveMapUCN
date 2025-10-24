```Mermaid
graph TD
    A[interactive-map-ucn] --> B[frontend/]
    A --> C[backend/]
    
    B --> D[src/]
    B --> E[public/]
    
    D --> F[components/]
    D --> G[hooks/]
    D --> H[services/]
    D --> I[constants/]
    
    F --> J[Map/]
    F --> K[Forms/]
    F --> L[UI/]
    
    G --> M[useMap.js]
    G --> N[useBuildings.js]
    G --> O[useGeoServer.js]
    
    H --> P[buildingService.js]
    H --> Q[geoServerAPI.js]
    
    C --> R[controllers/]
    C --> S[models/]
    C --> T[routes/]
    C --> U[config/]
    
    R --> V[buildingsController.js]
    S --> W[buildingModel.js]
    T --> X[buildings.js]
    U --> Y[database.js]