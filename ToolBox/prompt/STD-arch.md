# STD-arch - Estandar de Arquitectura

Documento normativo de arquitectura. Define patrones, capas y relaciones para el proyecto Mapa Interactivo UCN. Complementa a daRulez.md sin duplicar sus contenidos.

> **Jerarquia**: daRulez.md (Constitucion) > STD-arch.md (Arquitectura)
> **Alcance**: Capas, flujos, dependencias, responsabilidades
> **Fuera de alcance**: Stack tecnologico, contenedores, seguridad (ver daRulez.md)

---

## 1. Glosario

### 1.1 Backend

| Termino | Definicion |
| ----------- | ------------ |
| **Route** | Define endpoints HTTP y aplica middleware |
| **Controller** | Recibe request, valida entrada, delega logica, formatea response |
| **Service** | Orquesta logica de negocio compleja que involucra multiples Models |
| **Model** | Encapsula acceso a datos: queries, mapeo, transacciones |
| **Middleware** | Intercepta request/response para cross-cutting concerns |

### 1.2 Frontend

| Termino | Definicion |
| ----------- | ------------ |
| **Component** | Unidad de UI que renderiza y responde a interacciones |
| **Hook** | Encapsula logica de estado y efectos reutilizables |
| **Context** | Provee estado global a un arbol de componentes |
| **Service** | Cliente que comunica con la API REST |

---

## 2. Vista General

### 2.1 Modelo

Cliente-Servidor con MVC en Backend.

```text
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│    Frontend     │ ◄─────► │    Backend      │ ◄─────► │   Database      │
│    (SPA)        │  HTTP   │    (API REST)   │  SQL    │   (Relacional)  │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

### 2.2 Estructura de Carpetas

```text
/
├── backend/
│   ├── server.js           <- Entry point
│   ├── config/             <- Configuracion y conexion BD
│   ├── routes/             <- Definicion de endpoints
│   ├── middleware/         <- Auth, validation, errors
│   ├── controllers/        <- Handlers de request
│   ├── services/           <- Logica de negocio compleja
│   ├── models/             <- Acceso a datos
│   └── utils/              <- Funciones auxiliares
│
├── frontend/src/
│   ├── App.js              <- Entry point + routing
│   ├── components/         <- UI por dominio
│   ├── contexts/           <- Estado global
│   ├── hooks/              <- Logica reutilizable
│   ├── services/           <- Clientes API
│   └── utils/              <- Utilidades puras
│
└── database/               <- Migraciones y seeds
```

---

## 3. Backend - Capas

### 3.1 Diagrama de Capas

```text
┌─────────────────────────────────────────────────────────────┐
│  ENTRY POINT (server.js)                                    │
│  Bootstrap, composicion, inicio de servidor                 │
├─────────────────────────────────────────────────────────────┤
│  CAPA HTTP                                                  │
│  ├── routes/         Definicion de endpoints                │
│  ├── middleware/     Auth, validation, error handling       │
│  └── controllers/    Manejo de request/response             │
├─────────────────────────────────────────────────────────────┤
│  CAPA DE NEGOCIO                                            │
│  └── services/       Logica compleja, orquestacion          │
├─────────────────────────────────────────────────────────────┤
│  CAPA DE DATOS                                              │
│  ├── models/         Queries, mapeo, transacciones          │
│  └── config/         Pool de conexiones                     │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Flujo de Request

```text
HTTP Request
    │
    ▼
[routes/]      Define endpoint, aplica middleware
    │
    ▼
[middleware/]  Auth (si aplica), validation
    │
    ▼
[controllers/] Parsea input, delega, formatea output
    │
    ├─────────► [services/]  Logica compleja (si aplica)
    │               │
    ▼               ▼
[models/]      Query a base de datos
    │
    ▼
Database
```

### 3.3 Responsabilidades por Capa

| Capa | Hace | No Hace |
| ---- | ---- | ------- |
| **routes/** | Define endpoints, aplica middleware | Logica de negocio |
| **middleware/** | Auth, validacion, manejo de errores | Queries a BD |
| **controllers/** | Parsea request, orquesta, formatea response | SQL directo, logica compleja |
| **services/** | Logica de negocio, calculos, orquestacion multi-model | Acceso HTTP, formateo response |
| **models/** | Queries, mapeo de datos, transacciones | Logica de presentacion |
| **utils/** | Funciones puras auxiliares | Estado, side effects |

### 3.4 Matriz de Dependencias

| Desde | Hacia | Permitido | Razon |
| ----- | ----- | --------- | ----- |
| routes | controllers | SI | Conexion endpoint-handler |
| routes | middleware | SI | Aplicar interceptores |
| controllers | models | SI | Acceso a datos simple |
| controllers | services | SI | Delegar logica compleja |
| services | models | SI | Orquestar multiples models |
| models | config | SI | Pool de conexiones |
| middleware | models | SI | Auth valida usuario |
| models | controllers | NO | Dependencia inversa |
| models | services | NO | Dependencia inversa |
| controllers | routes | NO | Dependencia inversa |

---

## 4. Frontend - Capas

### 4.1 Diagrama de Capas

```text
┌─────────────────────────────────────────────────────────────┐
│  ENTRY POINT (App.js)                                       │
│  Routing, Providers, layout global                          │
├─────────────────────────────────────────────────────────────┤
│  CAPA DE PRESENTACION                                       │
│  └── components/     UI organizada por dominio              │
├─────────────────────────────────────────────────────────────┤
│  CAPA DE ESTADO                                             │
│  ├── contexts/       Estado global (auth, config)           │
│  └── hooks/          Estado local y logica reutilizable     │
├─────────────────────────────────────────────────────────────┤
│  CAPA DE SERVICIOS                                          │
│  ├── services/       Clientes API REST                      │
│  └── utils/          Funciones puras                        │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Flujo de Datos

```text
[Component]
    │
    ├── Usa estado local via hooks
    │
    ▼
[Hook]         Encapsula logica de estado + acciones
    │
    ▼
[Service]      Ejecuta llamadas HTTP
    │
    ▼
Backend API
```

### 4.3 Organizacion de Componentes

Por dominio de negocio, no por tipo tecnico:

```text
components/
├── Map/                <- Renderizado de mapa
├── buildings/          <- Gestion de edificios
├── routes/             <- Rutas peatonales
├── auth/               <- Login, logout
├── admin/              <- Panel administrativo
├── user/               <- Perfil, preferencias
└── ui/                 <- Componentes genericos reutilizables
```

### 4.4 Organizacion de Hooks

Por dominio, una responsabilidad por hook:

```text
hooks/
├── buildings/          <- useBuildings, useBuilding
├── routes/             <- useRoutes, useRoute
├── map/                <- useMapState, useMapControls
├── user/               <- useUser, usePreferences
└── common/             <- useLocalStorage, useDebounce
```

### 4.5 Responsabilidades por Capa

| Capa | Hace | No Hace |
| ---- | ---- | ------- |
| **components/** | Renderiza UI, maneja eventos, usa hooks | Llamadas HTTP directas |
| **contexts/** | Provee estado global, expone acciones | Logica de negocio |
| **hooks/** | Encapsula estado + efectos, expone API limpia | Renderizado |
| **services/** | Llamadas HTTP, manejo de tokens | Estado, logica UI |
| **utils/** | Calculos puros, transformaciones | Side effects, estado |

---

## 5. Comunicacion Cliente-Servidor

### 5.1 Estructura de Services

```text
services/
├── api.js                  <- Cliente HTTP base con interceptores
├── authService.js          <- Login, logout, refresh
├── buildingService.js      <- CRUD edificios
├── roomService.js          <- CRUD salas
├── routeService.js         <- CRUD rutas
├── userService.js          <- CRUD usuarios
└── [entity]Service.js      <- Patron: un service por entidad
```

### 5.2 Patron de Servicio

Cada entityService expone operaciones CRUD:

| Operacion | Metodo HTTP | Descripcion |
| --------- | ----------- | ----------- |
| getAll() | GET | Listar todos |
| getById(id) | GET | Obtener uno |
| create(data) | POST | Crear nuevo |
| update(id, data) | PUT/PATCH | Actualizar |
| delete(id) | DELETE | Eliminar |

### 5.3 Flujo de Autenticacion

```text
Frontend                    Backend
    │                          │
    │ POST /auth/login         │
    │─────────────────────────►│
    │◄─────────────────────────│
    │ {accessToken, refresh}   │
    │                          │
    │ GET /api/* + Bearer      │
    │─────────────────────────►│
    │                          │
    │ (Token expirado)         │
    │◄───── 401 ───────────────│
    │                          │
    │ POST /auth/refresh       │
    │─────────────────────────►│
    │◄─────────────────────────│
    │ {newAccessToken}         │
```

---

## 6. Modulos del Sistema

### 6.1 Inventario

| Modulo | Backend | Frontend | Dominio |
| ------ | ------- | -------- | ------- |
| Buildings | buildingsController, buildingModel | buildings/, useBuildings | Edificios del campus |
| Rooms | roomsController, roomModel | (dentro de buildings) | Salas de edificios |
| Routes | routesController, routeModel | routes/, useRoutes | Rutas peatonales |
| RouteNodes | routeNodesController | (interno) | Nodos de rutas |
| Auth | authController, userModel | auth/, AuthContext | Autenticacion |
| Users | usersController | admin/, user/ | Administradores |
| Spatial | spatialController, proximityService | utils/turfUtils | Operaciones geoespaciales |
| BuildingImages | buildingImageController | (dentro de buildings) | Imagenes de edificios |
| Map | N/A | Map/ | Renderizado del mapa |

### 6.2 Dependencias entre Modulos

```text
Map ──────► Buildings ──────► Rooms
 │              │
 │              ▼
 └────────► Routes ──────► RouteNodes
                │
                ▼
            Spatial
```

---

## 7. Operaciones Geoespaciales

### 7.1 Division de Responsabilidades

| Capa | Responsabilidad |
| ---- | --------------- |
| Database | Almacenar geometrias, ejecutar queries espaciales |
| Backend | Validar geometrias, convertir formatos, agregar datos |
| Frontend | Calculos para UI, validar bounds, renderizar en mapa |

### 7.2 Flujo de Datos Espaciales

```text
Frontend (calculos UI)
    │
    ▼ GeoJSON
Backend (validacion, conversion)
    │
    ▼ SQL/WKT
Database (almacenamiento, queries)
```

---

## 8. Principios de Diseno

### 8.1 Aplicacion al Proyecto

| Principio | Regla en este proyecto |
| --------- | ---------------------- |
| SoC | Una razon para cambiar por archivo. I/O aislado en models/services |
| DRY | Extraer a utils/ o hooks/ si se repite. Centralizar config |
| Cohesion | Agrupar por dominio (buildings/, routes/) no por tipo |
| Acoplamiento | Controllers dependen de interfaces de Model, no al reves |
| Idempotencia | Misma request = mismo resultado (excepto POST) |

### 8.2 Reglas de Nomenclatura

| Tipo | Patron | Ejemplo |
| ---- | ------ | ------- |
| Controller | [entidad]Controller.js | buildingsController.js |
| Model | [entidad]Model.js | buildingModel.js |
| Service (backend) | [entidad]Service.js | proximityService.js |
| Service (frontend) | [entidad]Service.js | buildingService.js |
| Hook | use[Entidad].js | useBuildings.js |
| Context | [Entidad]Context.js | AuthContext.js |
| Component | PascalCase/ | BuildingList/, MapView/ |

---

## 9. Excepciones Documentadas

| Situacion | Veredicto | Justificacion |
| --------- | --------- | ------------- |
| Entry point importa todas las capas | PERMITIDO | Composicion y bootstrap |
| Middleware accede a Model | PERMITIDO | Auth necesita validar usuario en BD |
| Service accede a multiples Models | PERMITIDO | Orquestacion es su proposito |
| Tests importan concretos | PERMITIDO | Contexto de prueba aislado |
| utils/ compartido entre capas | PERMITIDO | Funciones puras sin side effects |
| Fetch directo en Component | PROHIBIDO | Usar services/ |
| SQL directo en Controller | PROHIBIDO | Usar models/ |
| Logica de negocio en Route | PROHIBIDO | Usar controllers/ |
| Estado global sin Context | PROHIBIDO | Usar contexts/ |

---

## 10. Checklist de Validacion

### 10.1 Antes de Crear un Archivo

1. Identificar la capa correcta segun responsabilidad
2. Verificar que no exista funcionalidad similar
3. Seguir patron de nomenclatura

### 10.2 Al Agregar Dependencia

1. Verificar direccion permitida en matriz (3.4)
2. No crear ciclos de dependencia
3. Preferir inyeccion sobre importacion directa

### 10.3 Al Crear un Modulo Nuevo

1. Crear controller si expone endpoints
2. Crear model si accede a BD
3. Crear service si hay logica compleja
4. En frontend: crear carpeta en components/, hook si maneja estado
