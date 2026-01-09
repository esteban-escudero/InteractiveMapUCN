src
│   App.css                 - Estilos globales del componente raíz
│   App.js                  - Componente principal y configuración de rutas (Router)
│   App.test.js             - Tests básicos del componente App
│   index.css               - Estilos base y reseteo CSS
│   index.js                - Punto de entrada de la aplicación React
│   Simple.test.js          - Pruebas unitarias simples
│
├───assets
│   └───images
│           login-bg.jpg    - Imagen de fondo para la pantalla de login
│
├───components
│   │   index.js            - Exposición centralizada de componentes
│   │
│   ├───admin
│   │   └───UserManagement
│   │           UserManagement.css - Estilos específicos del panel de usuarios
│   │           UserManagement.jsx - Panel CRUD para gestión de usuarios administradores
│   │
│   ├───auth
│   │       LoginForm.css      - Estilos del formulario de inicio de sesión
│   │       LoginForm.jsx      - Formulario de login para administradores
│   │       ProtectedRoute.jsx - Wrapper para proteger rutas que requieren autenticación
│   │
│   ├───buildings
│   │   │   index.js        - Exportaciones del módulo de edificios
│   │   │
│   │   ├───BuildingForm
│   │   │   │   BuildingForm.css - Estilos del formulario de edificios
│   │   │   │   BuildingForm.jsx - Formulario principal para crear/editar edificios
│   │   │   │
│   │   │   ├───components
│   │   │   │       BuildingDetailsSection.jsx - Sub-formulario para datos básicos (nombre, descripción)
│   │   │   │       BuildingFormUI.jsx         - Layout presentacional del formulario
│   │   │   │       CoordinateSection.jsx      - Inputs para coordenadas manuales o captura
│   │   │   │       FloorImageList.jsx         - Lista de imágenes de pisos subidas
│   │   │   │       FloorImageSection.css      - Estilos para la sección de pisos
│   │   │   │       FloorImageSection.jsx      - Gestión de imágenes por piso
│   │   │   │       FloorImageUpload.jsx       - Componente de subida de archivos para planos
│   │   │   │       FormActions.jsx            - Botones de acción (Guardar, Cancelar)
│   │   │   │       TypeStatusSection.css      - Estilos para selectores de tipo/estado
│   │   │   │       TypeStatusSection.jsx      - Selectores para tipo de edificio y estado
│   │   │   │
│   │   │   └───hooks
│   │   │           useBuildingForm.jsx        - Lógica de estado del formulario de edificios
│   │   │           useBuildingValidation.jsx  - Validaciones de campos del edificio
│   │   │           useCoordinateCapture.jsx   - Lógica para capturar coordenadas desde el mapa
│   │   │
│   │   ├───BuildingList
│   │   │   │   BuildingList.css    - Estilos del listado de edificios
│   │   │   │   BuildingList.jsx    - Vista principal del listado de edificios (Admin)
│   │   │   │
│   │   │   ├───components
│   │   │   │       BuildingCard.jsx       - Tarjeta individual de edificio
│   │   │   │       BuildingListFooter.jsx - Paginación o info al pie
│   │   │   │       BuildingListHeader.jsx - Cabecera con título y acciones
│   │   │   │       EmptyState.jsx         - Vista cuando no hay datos
│   │   │   │       RoomItem.jsx           - Item de sala dentro de un edificio
│   │   │   │       RoomSection.jsx        - Sección de salas de un edificio
│   │   │   │       SearchBar.jsx          - Barra de búsqueda de edificios
│   │   │   │
│   │   │   └───hooks
│   │   │           useBuildingList.jsx    - Lógica para obtener y filtrar lista de edificios
│   │   │
│   │   └───RoomManagement
│   │       │   RoomManagement.css - Estilos para gestión de salas
│   │       │   RoomManagement.jsx - Vista principal para administración de salas
│   │       │
│   │       ├───components
│   │       │       BuildingSelection.jsx    - Selector de edificio para gestionar sus salas
│   │       │       RoomActions.jsx          - Botones CRUD para salas
│   │       │       RoomFields.jsx           - Campos del formulario de sala
│   │       │       RoomForm.jsx             - Formulario de creación/edición de sala
│   │       │       RoomList.jsx             - Tabla/Lista de salas del edificio seleccionado
│   │       │       RoomManagementHeader.jsx - Cabecera del gestor de salas
│   │       │
│   │       └───hooks
│   │               useRoomForm.jsx          - Lógica de formulario de salas
│   │               useRoomManagement.jsx    - Lógica general de gestión de salas
│   │
│   ├───Map
│   │   │   index.js - Exportaciones del módulo de mapa
│   │   │
│   │   ├───BuildingRenderer
│   │   │   │   BuildingRenderer.jsx - Componente que dibuja polígonos/marcadores de edificios en el mapa
│   │   │   │
│   │   │   ├───components
│   │   │   │       BuildingMapModal.css - Estilos de modal de información
│   │   │   │       BuildingMapModal.jsx - Modal popup al hacer clic en un edificio
│   │   │   │
│   │   │   ├───hooks
│   │   │   │       useBuildingMarkers.js - Lógica para generar marcadores de mapa
│   │   │   │
│   │   │   └───utils
│   │   │           buildingIcons.js - Definición de iconos Leaflet para edificios
│   │   │           buildingPopup.js - Generador de contenido para popups
│   │   │
│   │   ├───Map
│   │   │   │   Map.css - Estilos del contenedor del mapa
│   │   │   │   Map.jsx - Componente principal del Mapa (Leaflet Wrapper)
│   │   │   │
│   │   │   └───components
│   │   │           index.js          - Exportaciones de componentes de mapa
│   │   │           MapContainer.jsx  - Contenedor layout del mapa
│   │   │           MapForms.jsx      - Renderiza formularios superpuestos (si aplica)
│   │   │           MapLayers.jsx     - Gestión de capas (TileLayers, etc.)
│   │   │           MapLists.jsx      - Listados laterales superpuestos
│   │   │
│   │   ├───MapIndicators
│   │   │       MapIndicators.jsx - Indicadores visuales (brújula, escala, etc.)
│   │   │
│   │   └───RouteLayer
│   │           RouteLayer.css - Estilos para líneas de ruta
│   │           RouteLayer.jsx - Capa que dibuja las rutas calculadas en el mapa
│   │
│   ├───routes
│   │   │   index.js - Exportaciones de rutas
│   │   │
│   │   ├───RouteForm
│   │   │   │   RouteFormPolyline.css - Estilos formulario dibujo de rutas
│   │   │   │   RouteFormPolyline.jsx - Herramienta para dibujar rutas manualmente (Admin)
│   │   │   │
│   │   │   ├───hooks
│   │   │   │       useMapSelection.js     - Selección de puntos en mapa
│   │   │   │       usePolylineRoute.js    - Lógica de dibujo de polilíneas
│   │   │   │       useRouteCalculations.js- Cálculos de distancia/tiempo frontend
│   │   │   │       useRouteForm.js        - Manejo de state del formulario de ruta
│   │   │   │
│   │   │   └───utils
│   │   │           polylineGeometry.js    - Utilidades geométricas
│   │   │           polylineIcons.js       - Iconos para puntos de ruta
│   │   │           polylineValidation.js  - Validación de trazados
│   │   │
│   │   ├───RouteList
│   │   │       RouteList.css - Estilos lista rutas
│   │   │       RouteList.jsx - Listado de rutas existentes (Admin)
│   │   │
│   │   └───RouteNetwork
│   │           RouteNetwork.css - Estilos visualización red completa
│   │           RouteNetwork.jsx - Componente para ver toda la red de rutas
│   │
│   ├───ui
│   │   │   index.js - Exportaciones UI
│   │   │
│   │   ├───ConfirmDialog
│   │   │       ConfirmDialog.css - Estilos dialogo confirmación
│   │   │       ConfirmDialog.jsx - Modal genérico de "Está seguro?"
│   │   │
│   │   ├───Notification
│   │   │       UINotification.css - Estilos notificaciones toast
│   │   │       UINotification.jsx - Componente de notificaciones flotantes
│   │   │
│   │   └───SidePanel
│   │           SidePanel.css - Estilos panel lateral
│   │           SidePanel.jsx - Panel lateral desplegable
│   │
│   └───user
│       │   AboutContent.jsx      - Contenido "Acerca de"
│       │   dark-mode.css         - Variables CSS para modo oscuro
│       │   HelpContent.jsx       - Contenido de ayuda
│       │   index.js              - Exportaciones módulo usuario
│       │   info-modal.css        - Estilos modales informativos
│       │   InfoModal.jsx         - Modal de información general
│       │   mobile-components.css - Estilos específicos móvil
│       │   MobileInfoPanel.jsx   - Panel de información adaptado a móvil
│       │   MobileMapControls.jsx - Controles de mapa flotantes para móvil
│       │   MobileMenu.jsx        - Menú hamburguesa móvil
│       │   MobileRoutePanel.jsx  - Panel de selección de rutas móvil
│       │   MobileSearchBar.jsx   - Barra de búsqueda móvil
│       │   rounded-search.css    - Estilos barra búsqueda redondeada
│       │   route-panel-fix.css   - Parches CSS para panel de ruta
│       │   TermsContent.jsx      - Términos y condiciones
│       │   UserMapView.css       - Estilos vista principal usuario
│       │   UserMapView.jsx       - Vista principal de la App para usuarios finales
│       │
│       └───hooks
│               useUserMapHandlers.js - Manejadores de eventos mapa usuario
│               useUserMapInit.js     - Inicialización mapa usuario
│
├───config
│       app.js  - Constantes de configuración global (API URL, MAP_CONFIG)
│
├───constants
│       constants.ts - Constantes tipadas (si se usa TS) o generales
│       mapConfig.js - Configuración específica de Leaflet (zoom, centro)
│
├───contexts
│       AuthContext.js - Contexto de autenticación y estado de usuario
│
├───hooks
│   │   index.js - Exportaciones de hooks
│   │
│   ├───buildings
│   │       index.js               - Exportaciones hooks edificios
│   │       useBuildingFilters.js  - Filtros para búsqueda de edificios
│   │       useBuildingHandlers.js - Manejadores de eventos edificios
│   │       useBuildings.js        - Hook principal data fetching edificios
│   │       useRoomHandlers.js     - Manejadores de eventos salas
│   │
│   ├───common
│   │       useConfirm.js      - Hook para invocar diálogos de confirmación
│   │       useNotification.js - Hook para disparar notificaciones
│   │       useProximity.js    - Lógica de geolocalización y proximidad
│   │
│   ├───geoserver
│   │       index.js                 - Exportaciones hooks geoserver
│   │       useGeoServer.js          - Cliente principal GeoServer
│   │       useGeoServerAnalytics.js - Hooks de analítica
│   │       useGeoServerData.js      - Fetching de datos WFS/WMS
│   │       useGeoServerMap.js       - Integración mapa Geoserver
│   │
│   ├───map
│   │       useBusinessHandlers.js    - Lógica de negocio mapa
│   │       useCoordinateManagement.js- Gestión de coordenadas
│   │       useInteractionHandlers.js - Interacciones generales usuario-mapa
│   │       useMap.js                 - Instancia y ref del mapa
│   │       useMapActions.js          - Acciones imperativas (flyTo, fitBounds)
│   │       useMapClickHandler.js     - Global click handler
│   │       useMapData.js             - Datos generales del mapa
│   │       useMapEffects.js          - Efectos secundarios al cambiar estado mapa
│   │       useMapManagement.js       - Gestión ciclo de vida mapa
│   │       useMapOperations.js       - Operaciones complejas mapa
│   │       useMapState.js            - Estado global del mapa (Redux/Context slice)
│   │
│   ├───routes
│   │       index.js               - Exportaciones hooks rutas
│   │       useRouteAnalytics.js   - Analítica de rutas
│   │       useRouteCRUD.js        - Operaciones Crear/Leer/Actualizar/Borrar rutas
│   │       useRouteHandlers.js    - Manejo eventos rutas en UI
│   │       useRouteIntelligence.js- Lógica "inteligente" (sugerencias)
│   │       useRouteQueries.js     - Queries específicos base de datos
│   │       useRoutes.js           - Hook principal data fetching rutas
│   │       useRouteUtils.js       - Utilidades para hooks de rutas
│   │
│   └───user
│           useGeolocation.js - Wrapper API Geolocation navegador
│           useTheme.js       - Manejo tema oscuro/claro
│           useURLParams.js   - Lectura parametros URL para navegación
│
├───services
│   │   api.js                  - Configuración cliente Axios base
│   │   authService.js          - API endpoints Autenticación
│   │   buildingImageService.js - API endpoints Imágenes
│   │   buildingService.js      - API endpoints Edificios
│   │   geoServerAPI.js         - API endpoints GeoServer
│   │   proximityService.js     - API endpoints Proximidad
│   │   roomService.js          - API endpoints Salas
│   │   routeService.js         - API endpoints Rutas
│   │   userService.js          - API endpoints Usuarios
│   │
│   └───api
│           index.js - Exportador servicios
│
├───styles
│       globals.css - Estilos CSS globales y variables CSS root
│
└───utils
    │   mapUtils.js     - Utilidades genéricas mapa
    │   spatialUtils.js - Cálculos espaciales (distancia, área)
    │
    ├───buildings
    │       buildingAnalytics.js - Utilidades análisis edificios
    │       buildingQueries.js   - Constructores de queries edificios
    │
    └───routing
            graphAlgorithms.js - Algoritmos de grafos (Dijkstra, A*) client-side
            routeGeometry.js   - Procesamiento geometría rutas