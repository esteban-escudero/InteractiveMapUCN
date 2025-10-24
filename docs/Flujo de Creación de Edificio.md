```Mermaid
sequenceDiagram
    participant U as Usuario
    participant M as Map Component
    participant F as BuildingForm
    participant B as Backend API
    participant DB as PostgreSQL

    U->>M: Clic en mapa
    M->>M: Capturar coordenadas
    M->>F: Abrir formulario
    U->>F: Llenar datos
    F->>F: Validar datos
    F->>B: POST /api/buildings
    B->>DB: INSERT INTO edificio
    DB->>DB: ST_GeomFromGeoJSON
    DB-->>B: ID creado
    B-->>F: 201 Created
    F-->>U: ✅ Edificio creado
    M->>M: Actualizar marcadores