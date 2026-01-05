# Mapa Interactivo UCN - Campus Coquimbo

Sistema de mapeo interactivo para la Universidad Católica del Norte (UCN) - Campus Coquimbo, que permite la navegación y búsqueda de ubicaciones dentro del campus universitario mediante Progressive Web App (PWA).

## Descripción del Proyecto

**InteractiveMapUCN** es una **Progressive Web App (PWA)** de tipo **Sistema de Información Geográfica (SIG/GIS) Web** diseñada para facilitar la orientación y navegación dentro del campus Coquimbo de la UCN. Los usuarios podrán acceder directamente desde su navegador web sin necesidad de instalación de aplicaciones nativas.

**Aplicación nativa**: se refiere a una app que está desarrollada específicamente para un sistema operativo o plataforma en particular, usando sus lenguajes y herramientas propias. ¿Qué la hace "nativa"?:
- Se instala directamente en el dispositivo.
- Accede de forma directa al hardware (cámara, GPS, sensores, etc.).
- Tiene mejor rendimiento y una experiencia de usuario más fluida.
- Sigue las guías visuales y de comportamiento del sistema operativo.

### Tipo de Proyecto
- **Categoría**: Sistema de Información Geográfica (SIG/GIS) Web
- **Arquitectura**: Progressive Web App (PWA) Full-Stack 
  - **PWA (Progressive Web App)**: Aplicación web que utiliza tecnologías web modernas para ofrecer una experiencia similar a una aplicación nativa, incluyendo instalación, funcionamiento offline y notificaciones push.
  - **Full-Stack**: Arquitectura que incluye tanto el frontend (interfaz de usuario) como el backend (servidor y base de datos) desarrollados de manera integrada.

### Razones por las que una PWA puede ser la mejor opción para este proyecto:
1. **Acceso Universal**: No requiere descarga desde tiendas de aplicaciones, accesible directamente desde cualquier navegador web
2. **Multiplataforma**: Funciona en iOS, Android, Windows y macOS sin desarrollo separado
3. **Actualización Simplificada**: Las actualizaciones se despliegan en el servidor, los usuarios siempre tienen la versión más reciente
4. **Bajo Costo de Desarrollo**: Un solo código base para todas las plataformas
5. **Soporte Offline**: Capacidad de funcionar con conexión limitada mediante Service Workers
6. **Instalación Directa**: Los usuarios pueden "instalar" la PWA en su pantalla de inicio
7. **Optimización para Campus**: Ideal para entorno educativo con múltiples dispositivos y usuarios temporales
8. **Menor Barrera de Entrada**: Estudiantes y visitantes pueden acceder inmediatamente sin descargas

### Dominio
- **Dominio**: Educación Superior / Campus Universitario
- **Campus**: Coquimbo, Chile
- **Acceso**: Navegador Web
- **Complejidad**: Medio-Alto

### Propósito
- Orientación en campus universitario
- Búsqueda de ubicaciones (edificios, salas, servicios)
- Geolocalización en tiempo real
- Cálculo de rutas inteligentes con dos perfiles (peatonal y accesible)
- Navegación asistida desde ubicación actual
- Gestión administrativa de edificios, salas y rutas
- Acceso público sin autenticación para usuarios

## Características Principales

### Para Usuarios
- **Mapa Interactivo**: Visualización del campus usando Leaflet con capas personalizadas
- **PWA**: Funciona como app nativa, instalable, con soporte offline
- **Búsqueda Inteligente**: Encuentra edificios y salas por nombre con autocompletado
- **Geolocalización GPS**: Muestra tu ubicación actual en el mapa con marcador animado
- **Navegación desde Mi Ubicación**: Calcula rutas desde tu posición actual al destino
- **Cálculo de Rutas Inteligente**: 2 perfiles de rutas con algoritmo de Dijkstra
  - **Peatonal**: Ruta estándar para caminar
  - **Accesible**: Adaptada para personas con movilidad reducida (evita obstáculos/escaleras)
- **Colores por Categoría**: Edificios coloreados según su tipo (académico, administrativo, servicios, etc.)
- **Modo Oscuro**: Interfaz adaptable para mayor comodidad
- **Diseño Responsive**: Optimizado para móviles y tablets

### Para Administradores
- **Sistema de Autenticación**: Login seguro con JWT
- **Gestión de Edificios**: CRUD completo con soporte para polígonos y puntos
- **Estadísticas**: Visualización rápida del conteo de salas y planos registrados
- **Gestión de Salas**: Administración de salas por edificio con diseño de grid 3 columnas
- **Gestión de Imágenes**: Subida y administración de planos por edificio y piso
- **Análisis de Proximidad**: Herramientas para analizar distancias entre edificios y rutas
- **Análisis Espacial**: Cálculo de rutas óptimas y análisis geoespacial avanzado
- **Gestión de Rutas**: Creación y edición de rutas con múltiples segmentos (polylines)
- **Gestión de Usuarios**: Administración de cuentas de administradores
- **Panel de Control**: Vista completa de edificios, rutas y estadísticas
- **Material Icons**: Interfaz moderna con iconos de Material Design

## Stack Tecnológico: Justificación y Alternativas

La elección de cada componente del stack se basó en el equilibrio entre rendimiento, escalabilidad y soporte para datos geoespaciales.

### Backend (Servidor y Datos)

| Tecnología | Justificación Técnica | Alternativas Consideradas | ¿Por qué no la alternativa? |
| :--- | :--- | :--- | :--- |
| **Node.js + Express** | Alto rendimiento en I/O (Input / Output (Entrada / Salida)) asíncrono para geolocalización en tiempo real y consistencia de lenguaje (Full-stack JS). | Python (Django/FastAPI), PHP (Laravel) | Python es excelente pero menos ágil para prototipado rápido en este contexto; PHP tiene menor rendimiento en concurrencia masiva de sockets/geolocalización. |
**Node.js**: Entorno de ejecución para JavaScript del lado del servidor, basado en el motor V8 de Chrome. 
**Express**: Framework minimalista para Node.js que simplifica la creación de APIs y aplicaciones web. |
| **PostgreSQL + PostGIS** | Estándar de la industria para SIG. Soporta tipos de datos espaciales nativos y topología compleja. | MongoDB, MySQL | MongoDB es bueno para documentos pero carece de la precisión y funciones de análisis topológico de PostGIS; MySQL tiene soporte espacial limitado en comparación. |
**PostgreSQL**: Sistema de gestión de bases de datos relacional de código abierto.
**PostGIS**: Extensión espacial que añade soporte para objetos geográficos a PostgreSQL. |
| **Turf.js** | Permite realizar cálculos geométricos (distancias, áreas, buffers) de forma nativa en JS, compartiendo lógica entre Front y Back. | JSTS, GDAL | JSTS es una traducción compleja de Java; GDAL requiere bindings nativos pesados que complican el despliegue en contenedores ligeros. |
**Turf.js**: Librería JavaScript para análisis espacial que funciona tanto en navegador como en Node.js. |
| **JWT (Auth)** | Autenticación stateless ideal para PWAs y escalabilidad sin sesiones en servidor. | Cookies/Sessions, OAuth2 | Las sesiones requieren persistencia en servidor; OAuth2 fue descartado por añadir complejidad innecesaria para un sistema de admin único. |
**JWT (JSON Web Token)**: Token de autenticación estándar que permite transmitir información de forma segura entre cliente y servidor como un objeto JSON codificado. 
**Objeto JSON**: Un objeto JSON es una colección de pares clave:valor que representa datos estructurados de forma legible para humanos y máquinas, encerrado entre llaves {} y usando comas para separar los pares clave-valor, siendo fundamental para el intercambio de datos entre sistemas y aplicaciones web. Es un formato ligero, independiente del lenguaje, que se basa en la sintaxis de los objetos de JavaScript, permitiendo anidar otros objetos o listas (arrays) dentro de él. |

### Frontend (Interfaz y Mapas)

| Tecnología | Justificación Técnica | Alternativas Consideradas | ¿Por qué no la alternativa? |
| :--- | :--- | :--- | :--- |
| **React 18** | Arquitectura basada en componentes que facilita la sincronización del estado del mapa con los paneles de información. | Vue.js, Angular | Vue es similar, pero React ofrece un ecosistema más maduro para librerías de mapas (React-Leaflet); Angular es demasiado pesado para una PWA enfocada en móviles. |
**React 18**: Biblioteca JavaScript para construir interfaces de usuario basada en componentes reutilizables, desarrollada por Facebook. |
| **Leaflet** | Librería ligera (38kb), de código abierto y optimizada para rendimiento móvil. | Google Maps API, OpenLayers | Google Maps es privativo y de pago; OpenLayers tiene una curva de aprendizaje muy pronunciada y un peso excesivo para dispositivos de gama baja. |
**Leaflet**: Librería JavaScript de código abierto para mapas interactivos compatible con móviles. |
| **PWA (Workbox)** | Permite instalación y funcionamiento offline, esencial para navegación en zonas de campus con baja señal. | App Nativa (Swift/Kotlin), Flutter | Una app nativa requiere descarga desde tiendas y mayor costo de desarrollo; la PWA ofrece acceso instantáneo vía URL. |
**Workbox**: Conjunto de librerías y herramientas de Google para facilitar el desarrollo de Service Workers y capacidades offline en PWAs. |

### Infraestructura

| Tecnología | Justificación Técnica | Alternativas Consideradas | ¿Por qué no la alternativa? |
| :--- | :--- | :--- | :--- |
| **Nginx** | Excelente manejando conexiones concurrentes y actuando como terminación SSL/Reverse Proxy. | Apache, Traefik | Apache consume más recursos por conexión; Traefik es potente pero Nginx es el estándar más documentado para este stack. |
**Nginx**: Servidor web de alto rendimiento que también funciona como proxy inverso (recibe las solicitudes del cliente y las redirige a los servidores internos, ocultando la infraestructura real), balanceador de carga (distribuye el tráfico entre varios servidores para mejorar el rendimiento y evitar sobrecargas) y servidor de caché (almacena respuestas frecuentes para reducir el tiempo de respuesta y el consumo de recursos del backend). |
| **Docker** | Garantiza que el sistema funcione igual en desarrollo y producción ("Write once, run anywhere"). | Despliegue Manual, Heroku | El despliegue manual varía entre servidores; Heroku es de pago y limita la configuración de PostGIS a bajo nivel. |
**Docker**: Plataforma de contenedores que permite empaquetar aplicaciones y sus dependencias en unidades estandarizadas para ejecución consistente en cualquier entorno. |

## Arquitectura Detallada

El sistema sigue una arquitectura desacoplada para separar responsabilidades y facilitar el mantenimiento.

::: mermaid
graph TD
     User["Usuario / Admin"] -->|HTTPS| Nginx["Nginx Reverse Proxy"]
    Nginx -->|Static Assets| Frontend["Frontend React PWA"]
    Nginx -->|/api| Backend["Backend Node.js Express"]
    Backend -->|SQL / Geo Queries| DB[("PostgreSQL + PostGIS")]
    Backend -->|Read/Write| FS["File System<br/>(Images)"]
:::

**Explicación del Diagrama de Arquitectura**:

Este diagrama representa la arquitectura desacoplada del sistema Mapa Interactivo UCN:

1. **Usuario/Admin** → **Nginx Reverse Proxy**:
   - Los usuarios y administradores acceden al sistema mediante HTTPS
   - Nginx actúa como puerta de entrada única para todas las solicitudes

2. **Nginx** → **Frontend React PWA**:
   - Las solicitudes para archivos estáticos (HTML, CSS, JS, imágenes) son servidas directamente por el frontend
   - El frontend es una Progressive Web App (PWA) construida con React

3. **Nginx** → **Backend Node.js Express**:
   - Las solicitudes que comienzan con `/api` son redirigidas al backend
   - El backend está construido con Node.js y Express

4. **Backend** → **PostgreSQL + PostGIS**:
   - El backend realiza consultas SQL y consultas geoespaciales a la base de datos
   - PostgreSQL con la extensión PostGIS almacena todos los datos espaciales

5. **Backend** → **File System (Images)**:
   - El backend también maneja la lectura/escritura de archivos de imágenes en el sistema de archivos
   - Esto incluye planos de edificios y otras imágenes estáticas

**Ventajas de esta arquitectura**:
- **Separación clara de responsabilidades**: Cada componente tiene un propósito específico
- **Escalabilidad**: Cada capa puede escalarse independientemente
- **Seguridad**: Nginx actúa como firewall de aplicación
- **Mantenibilidad**: Cambios en un componente no afectan necesariamente a los otros

### Backend: MVC + Capa de Servicios 
**MVC (Modelo-Vista-Controlador)**: Patrón de arquitectura de software que separa la lógica de negocio (Model), la interfaz de usuario (Vista) y el control de flujo (Controlador).

Implementa una división en capas para aislar la lógica de negocio del acceso a datos:
1.  **Routes Layer**: Define los endpoints y aplica middlewares (como validación de JWT).
    **Endpoints**: URLs específicas que responden a solicitudes HTTP en una API.
    **Middlewares**: Funciones intermedias que procesan solicitudes antes de que lleguen al controlador final.
2.  **Controller Layer**: Maneja la comunicación HTTP y formatea las respuestas.
    **Controller**: Componente que recibe solicitudes HTTP, interactúa con los servicios y devuelve respuestas.
3.  **Service Layer**: Contiene la **lógica de negocio pura** y algoritmos complejos (e.g., Dijkstra).
    **Service Layer**: Capa que encapsula la lógica de negocio independiente de la API y la base de datos.
4.  **Data Access Layer (Models)**: Interactúa directamente con PostgreSQL/PostGIS.
    **Models**: Representaciones de las entidades de negocio y su interacción con la base de datos.

### Frontend: Arquitectura Basada en Componentes
Estructurado para una alta interactividad:
*   **Context Providers**: Gestión de estado global (Autenticación, Mapa).
    **Context Providers**: Mecanismo de React para compartir datos entre componentes sin pasar props manualmente.
*   **Custom Hooks**: Encapsulan la lógica de geolocalización y cálculos (`useMap`, `useRoute`).
    **Custom Hooks**: Funciones personalizadas de React que encapsulan y reutilizan lógica de estado y efectos.
*   **PWA Core**: Service Workers para soporte offline y manifiesto para instalación.
    **Service Workers**: Scripts que se ejecutan en segundo plano para manejar solicitudes de red y almacenamiento en caché.
    **Manifiesto**: Archivo JSON que describe la PWA (nombre, iconos, colores, etc.) para instalación.

## Esquema de Base de Datos (PostGIS)

El motor **PostgreSQL + PostGIS** es la pieza central para el manejo de datos espaciales con SRID 4326 (WGS 84).

**SRID 4326**: Identificador del Sistema de Referencia Espacial WGS 84, utilizado por GPS y sistemas de mapeo global.

::: mermaid
erDiagram
    edificio ||--o{ plano : "posee"
    edificio ||--o{ sala : "contiene"
    administrador ||--o{ refresh_tokens : "gestiona"
    ruta {
        GEOMETRY geometria_ruta
        VARCHAR tipo_ruta
    }
    edificio {
        GEOMETRY ubicacion
        VARCHAR tipo
    }
:::

**Explicación del Diagrama ER (Entity-Relationship)**:

Este diagrama representa las principales entidades y sus relaciones en la base de datos:

1. **edificio** (entidad):
   - Contiene los edificios del campus
   - Atributos: `ubicacion` (GEOMETRY - Polygon), `tipo` (VARCHAR - tipo de edificio)
   - Relaciones:
     - `||--o{ plano`: Un edificio puede tener cero o muchos planos
     - `||--o{ sala`: Un edificio contiene cero o muchas salas

2. **plano** (entidad):
   - Almacena los planos/pisos de cada edificio
   - Relación: `edificio ||--o{ plano` (un edificio posee múltiples planos)

3. **sala** (entidad):
   - Representa las salas, oficinas y espacios dentro de los edificios
   - Relación: `edificio ||--o{ sala` (un edificio contiene múltiples salas)

4. **ruta** (entidad):
   - Almacena los segmentos de rutas para navegación
   - Atributos: `geometria_ruta` (GEOMETRY - LineString), `tipo_ruta` (VARCHAR - peatonal/accesible)

5. **administrador** (entidad):
   - Contiene las cuentas de administradores del sistema
   - Relación: `||--o{ refresh_tokens` (un administrador gestiona múltiples refresh tokens)

6. **refresh_tokens** (entidad):
   - Almacena los tokens de refresco para la autenticación JWT
   - Relación: `administrador ||--o{ refresh_tokens` (gestión de tokens por administrador)

### Tablas Principales
| Tabla | Tipo Geometría | Descripción |
| :--- | :--- | :--- |
| `edificio` | `Polygon` | Contornos de estructuras físicas y metadatos. |
**Polygon**: Tipo de dato espacial que representa un área cerrada definida por una serie de puntos. |
| `sala` | `Point` | Ubicación exacta de oficinas, laboratorios y servicios. |
**Point**: Tipo de dato espacial que representa una ubicación específica con coordenadas X e Y (o latitud/longitud). |
| `ruta` | `LineString` | Segmentos de red para navegación peatonal y accesible. |
**LineString**: Tipo de dato espacial que representa una secuencia de puntos conectados formando una línea. |
| `plano` | N/A | Gestión de imágenes por piso/edificio. |

### Funciones Espaciales Clave
*   `ST_Distance`: Cálculo de distancias reales en metros.
**ST_Distance**: Función PostGIS que calcula la distancia más corta entre dos geometrías en unidades de medida específicas.
*   `ST_Contains`: Determinación de puntos dentro de edificios.
**ST_Contains**: Función PostGIS que determina si una geometría contiene completamente a otra.
*   `ST_AsGeoJSON`: Conversión nativa para visualización en Leaflet.
**ST_AsGeoJSON**: Función PostGIS que convierte geometrías al formato GeoJSON para uso en aplicaciones web.

## Resultados e Impacto (Conclusiones)

El proyecto podría significar un impacto tangible en la comunidad universitaria:
-   **Inclusión Real**: Implementación efectiva de rutas para movilidad reducida.
-   **Modernización**: Primer SIG web especializado para el Campus Coquimbo.
-   **Rendimiento**: Tiempos de cálculo de ruta menores a 200ms mediante optimización de grafos.
-   **Disponibilidad**: Acceso público sin autenticación para usuarios.
-   **Flexibilidad**: Interfaz responsive para dispositivos móviles y tablets.
-   **Escalabilidad**: Podría ser implementado en otros campus universitarios.

## Lógica de Navegación Inteligente

El cálculo de rutas es el núcleo tecnológico del proyecto. Se utiliza el algoritmo de Dijkstra sobre un grafo dinámico generado a partir de datos espaciales.
- **Dijkstra**: Algoritmo clásico para encontrar el camino más corto entre nodos en un grafo con pesos no negativos.
- **Grafo**: Estructura de datos compuesta por nodos (vértices) conectados por aristas con pesos asociados. 

::: mermaid
flowchart LR
    A[Inicio] --> B{"Validar Puntos"}
    B -->|Válido| D["Obtener Rutas DB"]
    D --> E["Construir Grafo"]
    E --> F["Filtrar Tipo (Peatonal/Accesible)"]
    F --> G["Ejecutar Dijkstra"]
    G --> H["Generar GeoJSON"]
    H --> I[Fin]
:::

**Explicación del Diagrama de Flujo de Navegación**:

Este diagrama describe el proceso completo para calcular una ruta entre dos puntos:

1. **Inicio**: El proceso comienza cuando un usuario solicita calcular una ruta
   
2. **Validar Puntos**: 
   - Se verifica que ambos puntos (origen y destino) sean válidos
   - Se comprueba que estén dentro del campus
   - Si no son válidos, el proceso termina con un error

3. **Obtener Rutas DB**:
   - Se consulta la base de datos para obtener todos los segmentos de ruta disponibles
   - Esto incluye rutas peatonales y accesibles
   - Se filtran por área geográfica relevante

4. **Construir Grafo**:
   - Los segmentos de ruta se convierten en un grafo matemático
   - Nodos = intersecciones/puntos de conexión
   - Aristas = segmentos de ruta con peso = distancia

5. **Filtrar Tipo**:
   - Según la selección del usuario, se filtra por:
     - **Peatonal**: Todas las rutas disponibles
     - **Accesible**: Solo rutas marcadas como accesibles (sin escaleras, con rampas)

6. **Ejecutar Dijkstra**:
   - Se aplica el algoritmo de Dijkstra al grafo filtrado
   - Encuentra el camino más corto entre origen y destino
   - Considera pesos (distancias) para optimización

7. **Generar GeoJSON**:
   - La ruta calculada se convierte al formato GeoJSON
   - GeoJSON es estándar para representar datos geográficos en la web
   - Incluye geometría LineString y metadatos

8. **Fin**:
   - La ruta se devuelve al frontend para visualización
   - Se muestra en el mapa interactivo de Leaflet

## Seguridad y Flujo de Acceso

El acceso administrativo está protegido mediante un flujo de autenticación robusto basado en JWT y validación de sesiones.

::: mermaid
sequenceDiagram
    participant Admin
    participant Frontend
    participant API (Node.js)
    participant DB (PostGIS)

    Admin->>Frontend: Login Credentials
    Frontend->>API: POST /auth/login
    API->>DB: Verify & Compare Hash
    DB-->>API: Validated
    API-->>Frontend: Set JWT Token
    Frontend->>Admin: Redirect to Dashboard
:::

**Explicación del Diagrama de Secuencia de Autenticación**:

Este diagrama muestra el proceso completo de autenticación de un administrador:

1. **Admin → Frontend**: Login Credentials
   - El administrador ingresa sus credenciales (usuario y contraseña) en la interfaz del frontend

2. **Frontend → API**: POST /auth/login
   - El frontend envía las credenciales al backend mediante una solicitud HTTP POST al endpoint `/auth/login`
   - Las credenciales se envían de forma segura (HTTPS)

3. **API → DB**: Verify & Compare Hash
   - El backend (Node.js + Express) recibe las credenciales
   - Consulta la base de datos para encontrar el usuario
   - Compara el hash de la contraseña proporcionada con el hash almacenado
   - **Hash**: Función criptográfica que transforma datos de entrada en una cadena de longitud fija, ideal para almacenar contraseñas de forma segura.

4. **DB → API**: Validated
   - La base de datos responde indicando si las credenciales son válidas
   - Si son válidas, procede con la generación del token

5. **API → Frontend**: Set JWT Token
   - El backend genera un token JWT (JSON Web Token) firmado
   - El token contiene información del usuario y tiempo de expiración
   - Se envía al frontend en la respuesta HTTP

6. **Frontend → Admin**: Redirect to Dashboard
   - El frontend almacena el token JWT de forma segura (HttpOnly cookie o localStorage)
   - Redirige al administrador al panel de control/dashboard
   - En solicitudes futuras, el token se incluye en el header Authorization

## Flujo de Usuario: Búsqueda de Rutas

Este diagrama ilustra cómo el sistema interactúa con el usuario para proporcionar navegación en tiempo real:

::: mermaid
sequenceDiagram
    autonumber
    actor User as Usuario
    participant Frontend as Frontend (React PWA)
    participant API as Backend (Node.js)
    participant DB as Base de Datos (PostGIS)

    User->>Frontend: Selecciona Origen y Destino
    User->>Frontend: Elige tipo de ruta (Peatonal/Accesible)
    Frontend->>API: POST /api/routes/calculate
    Note over API: Carga todas las rutas de la DB
    API->>DB: query: SELECT * FROM rutas
    DB-->>API: Listado de geometrías (LineStrings)
    
    rect rgba(0, 0, 0, 0)
        Note over API: Procesamiento del Grafo
        API->>API: Construir Grafo desde geometrías
        API->>API: Fusionar nodos cercanos (Intersecciones)
        API->>API: Identificar nodos más cercanos a origen/destino
        API->>API: Ejecutar Algoritmo de Dijkstra
    end

    API-->>Frontend: GeoJSON (Ruta, Distancia, Tiempo)
    Frontend->>Frontend: Renderiza ruta con Leaflet
    Frontend-->>User: Visualiza el camino óptimo en el mapa
:::

**Explicación del Diagrama de Secuencia de Búsqueda de Rutas**:

1. **Selección de Puntos**: El usuario interactúa con el mapa o el buscador para definir dónde empieza y termina su recorrido, indicando además su preferencia de accesibilidad.
2. **Solicitud de Cálculo**: El frontend envía las coordenadas y el perfil elegido al backend mediante un endpoint dedicado.
3. **Obtención de Datos**: El servidor recupera todos los segmentos de ruta almacenados en PostGIS que coinciden con el tipo de navegación solicitado.
4. **Construcción del Grafo**: Las geometrías (LineStrings) se transforman en una estructura de red (grafo). Se realiza un proceso de "fusión" para asegurar que los segmentos que se tocan o están muy cerca (intersecciones) queden conectados correctamente.
5. **Optimización con Dijkstra**: Se identifica el punto de la red más cercano al origen y al destino del usuario, y se aplica el algoritmo para encontrar la ruta con la menor distancia total.
6. **Respuesta y Visualización**: El resultado se envía en formato GeoJSON, que incluye la línea exacta que el usuario debe seguir, junto con la distancia total y el tiempo estimado. El mapa de Leaflet dibuja esta línea automáticamente.

## Glosario de Términos Técnicos

| Término | Descripción |
| :--- | :--- |
| **PWA (Progressive Web App)** | Aplicación web que utiliza tecnologías web modernas para ofrecer una experiencia similar a una aplicación nativa. |
| **SIG/GIS (Sistema de Información Geográfica)** | Sistema para capturar, almacenar, analizar y gestionar datos referenciados geográficamente. |
| **Full-Stack** | Desarrollo que abarca tanto el frontend (cliente) como el backend (servidor) de una aplicación. |
| **JWT (JSON Web Token)** | Estándar abierto para crear tokens de acceso que permiten transmitir información entre partes de forma segura. |
| **Leaflet** | Librería JavaScript de código abierto para mapas interactivos compatibles con dispositivos móviles. |
| **Dijkstra** | Algoritmo para encontrar el camino más corto entre nodos en un grafo con pesos no negativos. |
| **PostGIS** | Extensión espacial para PostgreSQL que añade soporte para objetos geográficos. |
| **GeoJSON** | Formato estándar para representar estructuras geográficas simples usando JSON. |
| **CRUD** | Acrónimo de Create, Read, Update, Delete - operaciones básicas de persistencia de datos. |
| **Responsive Design** | Enfoque de diseño web que hace que las páginas se vean bien en todos los dispositivos. |
| **Service Worker** | Script que se ejecuta en segundo plano en el navegador, permitiendo funcionalidades offline. |
| **Reverse Proxy** | Servidor que actúa como intermediario entre clientes y servidores backend. |
| **SRID 4326** | Sistema de referencia espacial WGS 84, utilizado por GPS y sistemas de mapeo global. |
| **I/O asíncrono** | Modelo de programación que no bloquea la ejecución mientras espera operaciones de entrada/salida. |
| **API (Application Programming Interface)** | Conjunto de reglas y especificaciones que permiten que diferentes aplicaciones se comuniquen entre sí. |
| **Estado (State)** | Datos que determinan la condición o situación actual de una aplicación en un momento dado. |
| **Componente** | Unidad independiente y reutilizable de código que define parte de la interfaz de usuario. |
| **Container (Docker)** | Instancia ejecutable de una imagen de Docker que contiene una aplicación y su entorno de ejecución. |
| **HTTP (Hypertext Transfer Protocol)** | Protocolo de comunicación utilizado para transferir datos en la web. |
| **HTTPS** | Versión segura de HTTP que utiliza cifrado SSL/TLS. |
| **JSON (JavaScript Object Notation)** | Formato ligero de intercambio de datos basado en texto, fácil de leer y escribir para humanos y de parsear y generar para máquinas. |
| **API RESTful** | Arquitectura de software que utiliza HTTP para crear servicios web escalables y mantenibles. |
| **Stateless** | Característica de un sistema donde cada solicitud es independiente y no depende de solicitudes anteriores. |
| **Middleware** | Software que actúa como puente entre diferentes aplicaciones, servicios o componentes. |
| **Endpoint** | Punto final de comunicación en una API, usualmente una URL específica. |
| **Polygon** | En geometría, figura plana cerrada formada por segmentos de línea recta conectados. |
| **Point** | En geometría, ubicación exacta en un espacio definido por coordenadas. |
| **LineString** | En geometría, secuencia de puntos conectados formando una línea. |
| **Grafo** | Estructura de datos que consiste en un conjunto de nodos (vértices) conectados por aristas. |
| **Algoritmo** | Conjunto de instrucciones paso a paso para resolver un problema o realizar una tarea. |
| **Hash** | Función criptográfica que convierte datos de entrada en una cadena de longitud fija. |
| **SSL/TLS** | Protocolos de seguridad que proporcionan comunicaciones seguras en una red. |
| **CDN (Content Delivery Network)** | Red de servidores distribuidos geográficamente que entrega contenido web de forma eficiente. |
| **Firewall** | Sistema de seguridad que controla el tráfico de red entrante y saliente según reglas establecidas. |
| **Rate Limiting** | Técnica para controlar la cantidad de solicitudes que un usuario puede hacer en un período de tiempo. |
| **Lazy Loading** | Técnica de programación que retrasa la carga de objetos o recursos hasta que son necesarios. |
| **Gzip** | Método de compresión de datos que reduce el tamaño de archivos para transferencia más rápida. |
| **Balanceador de Carga** | Dispositivo o software que distribuye el tráfico de red entre múltiples servidores. |
| **Cache** | Almacenamiento temporal de datos para acceso rápido en futuras solicitudes. |
| **Índice Espacial** | Estructura de datos que optimiza las consultas a datos geográficos en una base de datos. |
| **WGS 84** | Sistema geodésico mundial de 1984, estándar utilizado por GPS y sistemas de navegación. |
| **Proxy** | Un proxy (o servidor proxy) es un intermediario entre tu dispositivo e Internet, actuando como una puerta de enlace que intercepta tus solicitudes, las reenvía a su destino y devuelve la respuesta, ofreciendo beneficios como seguridad, privacidad (ocultando tu IP), control de acceso (filtrando contenido), y mejora del rendimiento mediante el caché. Existen proxies directos (protegen al usuario) y proxies inversos (protegen servidores, balanceando carga). |
