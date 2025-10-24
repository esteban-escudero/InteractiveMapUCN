```Mermaid
sequenceDiagram
    participant App as Aplicación
    participant Hook as useGeoServer
    participant GS as GeoServer
    participant API as Backend API
    participant DB as Base de Datos

    App->>Hook: loadWFSData()
    Hook->>GS: WFS GetFeature Request
    GS-->>Hook: GeoJSON Features
    Hook->>Hook: processGeoJSONData()
    Hook->>App: Actualizar estado features
    
    App->>API: syncWithGeoServer(features)
    API->>DB: INSERT/UPDATE edificios
    DB-->>API: Resultado operación
    API-->>App: ✅ Sincronización completada
    App->>App: Recargar edificios