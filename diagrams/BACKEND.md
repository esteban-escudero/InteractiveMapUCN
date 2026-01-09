backend
│   .env                    - Variables de entorno local
│   .env.example            - Plantilla de variables de entorno
│   package.json            - Dependencias y scripts del proyecto Node.js
│   README.md               - Documentación general del backend
│   server.js               - Punto de entrada principal (Express App)
│
├───config
│       database.js         - Configuración del pool de conexión PostgreSQL
│
├───controllers             - Lógica de negocio y manejo de peticiones HTTP
│       authController.js           - Login, registro y validaciónd de usuarios
│       buildingImageController.js  - Subida y gestión de imágenes de planos
│       buildingsController.js      - CRUD de Edificios
│       proximityController.js      - Cálculo de elementos cercanos
│       roomsController.js          - CRUD de Salas
│       routesController.js         - CRUD de Rutas y cálculo de caminos óptimos
│       usersController.js          - Gestión de usuarios (Admin)
│
├───middleware              - Intermediarios de peticiones
│       authMiddleware.js     - Verificación de JWT y roles
│       uploadMiddleware.js   - Configuración de Multer para subida de archivos
│
├───models                  - Capa de acceso a datos (Queries SQL)
│       buildingImageModel.js - Queries para tabla de imágenes
│       buildingModel.js      - Queries para tabla Edificio
│       roomModel.js          - Queries para tabla Sala
│       routeModel.js         - Queries para tabla Ruta y funciones PostGIS
│       userModel.js          - Queries para tabla Usuario
│
├───routes                  - Definición de endpoints API
│       auth.js             - Rutas para autenticación (/api/auth)
│       buildingImages.js   - Rutas para imágenes (/api/building-images)
│       buildings.js        - Rutas para edificios (/api/buildings)
│       index.js            - Enrutador principal que agrupa todo
│       proximity.js        - Rutas de proximidad (/api/proximity)
│       rooms.js            - Rutas para salas (/api/rooms)
│       routes.js           - Rutas para navegación (/api/routes)
│       spatial.js          - Rutas para consultas espaciales directas
│       users.js            - Rutas de gestión de usuarios (/api/users)
│
├───scripts                 - Scripts de utilidad y mantenimiento
│       createAdmin.js      - Script para crear primer usuario admin manualmente
│       check_admin.js      - Verificación de admins existentes
│       verify_production.js- Tests de conexión a producción
│
├───services                - Lógica compleja y servicios compartidos
│       proximityService.js - Lógica de cálculo geoespacial
│       routeGraphService.js- Construcción de grafos y Pathfinding (Dijkstra)
│
├───tests                   - Pruebas automatizadas
│       health.test.js      - Verificación de estado del servidor
│
├───uploads                 - Almacenamiento local de archivos (si no se usa S3/Cloud)
│   └───buildings           - Imágenes de planos de edificios
│
└───utils                   - Funciones auxiliares
        logger.js           - Configuración de logs
        routeNodes.js       - Procesamiento de nodos para grafo
        turfUtils.js        - Wrappers para Turf.js (geometría)
