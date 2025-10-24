# Documentación Técnica Completa - Mapa Interactivo UCN

## **ARQUITECTURA DEL SISTEMA**

### **1. VISIÓN GENERAL DE LA ARQUITECTURA**

El sistema del Mapa Interactivo UCN sigue una arquitectura de tres capas bien definida que separa claramente las responsabilidades entre el frontend, backend y la base de datos. Esta separación permite un mantenimiento más sencillo, escalabilidad y la capacidad de desarrollar cada componente de manera independiente.

**Capa de Presentación (Frontend):**
Desarrollada completamente en React.js, esta capa se encarga de toda la interacción con el usuario final. Utiliza Leaflet como biblioteca de mapas principal, proporcionando una experiencia de mapa interactivo y responsiva. Los componentes React están estructurados de manera modular, permitiendo reutilización y facilitando las pruebas.

**Capa de Aplicación (Backend):**
Implementada en Node.js con el framework Express, esta capa actúa como intermediario entre el frontend y la base de datos. Expone una API RESTful que permite operaciones CRUD sobre los datos geoespaciales. El backend también maneja la lógica de negocio, validaciones y la integración con servicios externos como GeoServer.

**Capa de Datos (Base de Datos):**
Utiliza PostgreSQL con la extensión PostGIS, especializada en el manejo de datos geoespaciales. Esta configuración permite almacenar, consultar y analizar datos geográficos de manera eficiente, soportando tipos de geometría como puntos, líneas y polígonos en el sistema de coordenadas WGS84.

### **2. INFRAESTRUCTURA DE COMUNICACIONES**

**Comunicación Frontend-Backend:**
La comunicación entre el frontend React y el backend Express se realiza mediante peticiones HTTP/REST utilizando JSON como formato de intercambio de datos. El frontend utiliza la biblioteca Axios para manejar las peticiones asíncronas, proporcionando interceptores para el manejo global de errores y timeouts.

El backend está configurado con CORS (Cross-Origin Resource Sharing) para permitir peticiones desde el dominio del frontend. Cada endpoint de la API sigue las convenciones REST estándar, devolviendo códigos de estado HTTP apropiados y respuestas consistentes en formato JSON.

**Conexión a Base de Datos:**
El backend establece conexión con PostgreSQL mediante un pool de conexiones administrado por el driver `pg` de Node.js. Este pool mantiene un conjunto de conexiones reutilizables, mejorando el rendimiento al evitar la sobrecarga de establecer nuevas conexiones para cada petición.

La configuración de la base de datos se maneja mediante variables de entorno, permitiendo diferentes configuraciones para desarrollo, testing y producción. Las consultas utilizan parámetros preparados para prevenir ataques de inyección SQL y mejorar la seguridad.

**Integración con GeoServer:**
El sistema se integra con GeoServer mediante el protocolo WFS (Web Feature Service) para obtener datos geoespaciales en formato GeoJSON. Esta integración permite sincronizar datos entre sistemas y mantener actualizada la información de edificios y otras entidades geoespaciales.

### **3. COMPONENTES PRINCIPALES DEL FRONTEND**

**Sistema de Componentes React:**
La aplicación frontend está estructurada en componentes React funcionales que utilizan hooks para el manejo de estado y efectos secundarios. La arquitectura de componentes sigue el principio de responsabilidad única, donde cada componente tiene una función específica y bien definida.

**Map Component:**
Es el componente central y más complejo de la aplicación. Se encarga de inicializar y gestionar el mapa Leaflet, manejar interacciones del usuario, y coordinar la visualización de todos los elementos geoespaciales. Utiliza el hook useMap para abstraer la lógica específica del mapa.

**SidePanel Component:**
Proporciona una interfaz de control lateral que muestra el estado del sistema, estadísticas y botones de acción. Este componente muestra información en tiempo real sobre el número de edificios cargados, el estado de conexión con el backend y GeoServer, y proporciona acceso rápido a las funcionalidades principales.

**BuildingForm Component:**
Componente modal que gestiona la entrada de datos para la creación y edición de edificios. Incluye validaciones de formulario, manejo de estados de carga, y una interfaz de usuario intuitiva para la selección de tipos de edificio.

### **4. SISTEMA DE HOOKS PERSONALIZADOS**

**useMap Hook:**
Este hook encapsula toda la lógica relacionada con la inicialización y gestión del mapa Leaflet. Maneja el ciclo de vida del mapa, incluyendo su creación, configuración de capas base, establecimiento de límites de navegación, y limpieza de recursos cuando el componente se desmonta.

**useBuildings Hook:**
Gestiona el estado global de los edificios en la aplicación. Se encarga de cargar los datos iniciales desde el backend, manejar operaciones CRUD, y mantener la sincronización entre el estado local y la base de datos. Implementa estados de carga, error y éxito para proporcionar feedback al usuario.

**useGeoServer Hook:**
Especializado en la comunicación con GeoServer, este hook maneja la recuperación de datos WFS, el procesamiento de respuestas GeoJSON, y la transformación de features en el formato esperado por la aplicación. Incluye manejo de errores para fallos de conexión y timeouts.

### **5. ARQUITECTURA DE LA BASE DE DATOS**

**Diseño del Esquema:**
La base de datos está diseñada específicamente para manejar datos geoespaciales educativos. El esquema principal gira alrededor de la tabla 'edificio', que almacena la información fundamental de cada estructura en el campus, incluyendo su ubicación geográfica, tipo, y metadatos descriptivos.

**Tabla Edificio:**
Contiene los campos esenciales para representar cada edificio: identificador único, nombre, descripción textual, tipo categórico, geometría de punto para la ubicación, y timestamp de creación. La geometría se almacena utilizando el tipo GEOMETRY de PostGIS con SRID 4326.

**Extensión PostGIS:**
La utilización de PostGIS permite realizar consultas espaciales complejas directamente en la base de datos. Esto incluye cálculos de distancia, operaciones de intersección, transformaciones de coordenadas, y consultas basadas en relaciones espaciales.

### **6. API REST DEL BACKEND**

**Estructura de Endpoints:**
La API sigue las mejores prácticas REST, con endpoints bien definidos para cada recurso. Los endpoints principales incluyen operaciones para listar, crear, actualizar y eliminar edificios, así como endpoints auxiliares para salud del sistema y sincronización.

**Controladores:**
Los controladores en el backend implementan la lógica de aplicación para cada endpoint. Se encargan de validar los datos de entrada, orquestar las operaciones con los modelos, formatear las respuestas, y manejar los errores de manera consistente.

**Modelos:**
Los modelos abstraen el acceso a la base de datos, proporcionando métodos para realizar operaciones CRUD y consultas específicas. Utilizan el pool de conexiones para ejecutar consultas SQL parametrizadas y transforman los resultados en objetos JavaScript.

### **7. SISTEMA DE TIPOS Y CATEGORÍAS**

**Taxonomía de Edificios:**
El sistema implementa una taxonomía bien definida de tipos de edificios que refleja la diversidad de espacios en un campus universitario. Cada tipo tiene propiedades visuales específicas, incluyendo color de marcador y iconografía, que facilitan la identificación rápida en el mapa.

**Gestión de Categorías:**
Las categorías están hardcodeadas en el frontend pero diseñadas para ser extensibles. Cada categoría incluye metadatos para representación visual y agrupación lógica. El sistema permite filtrar y buscar edificios basándose en estas categorías.

### **8. MANEJO DE ESTADO Y FLUJO DE DATOS**

**Estado de la Aplicación:**
El estado se gestiona mediante el sistema de estados de React, con un enfoque en la elevación de estado cuando múltiples componentes necesitan acceder a los mismos datos. Los hooks personalizados proporcionan una abstracción para manejar estados complejos y efectos secundarios.

**Flujo de Datos Unidireccional:**
La aplicación sigue el patrón de flujo de datos unidireccional característico de React. Los datos fluyen desde los componentes padres hacia los hijos a través de props, y los cambios de estado se manejan mediante funciones callback.

**Sincronización en Tiempo Real:**
Cuando se realizan operaciones que modifican datos, el sistema asegura que todos los componentes interesados se actualicen inmediatamente. Esto incluye la actualización del mapa, listas de edificios, y contadores en el SidePanel.

### **9. SISTEMA DE ERRORES Y LOGGING**

**Manejo de Errores en Frontend:**
El frontend implementa un sistema comprehensivo de manejo de errores que captura excepciones, errores de red, y respuestas HTTP no exitosas. Los errores se presentan al usuario de manera amigable mientras se registran detalles técnicos en la consola.

**Logging Estructurado en Backend:**
El backend utiliza logging estructurado con diferentes niveles de severidad. Los logs incluyen información contextual como timestamps, IDs de transacción, y detalles específicos de cada operación, facilitando el debugging y monitoreo.

**Manejo de Estados de Carga:**
La aplicación proporciona feedback visual durante las operaciones asíncronas mediante estados de carga, esqueletos de carga, y indicadores de progreso. Esto mejora la experiencia de usuario al establecer expectativas claras sobre el tiempo de respuesta.

### **10. SEGURIDAD Y VALIDACIONES**

**Validación de Datos:**
Tanto el frontend como el backend implementan validaciones de datos. El frontend realiza validaciones iniciales para proporcionar feedback inmediato, mientras que el backend realiza validaciones exhaustivas para garantizar la integridad de los datos.

**Seguridad en Consultas:**
Todas las consultas a la base de datos utilizan parámetros preparados para prevenir inyección SQL. Las conexiones utilizan SSL cuando está disponible, y las credenciales se manejan mediante variables de entorno.

**Protección de Recursos:**
El backend configura cabeceras de seguridad HTTP apropiadas, incluyendo políticas CORS específicas, protección contra clickjacking, y cabeceras de tipo de contenido estrictas.

### **11. RENDIMIENTO Y OPTIMIZACIONES**

**Optimizaciones de Frontend:**
La aplicación implementa varias técnicas de optimización, incluyendo lazy loading de componentes, memoización de componentes React, y optimización de rerenders. El mapa Leaflet se configura con opciones de rendimiento apropiadas para el uso esperado.

**Optimizaciones de Backend:**
El backend utiliza compresión de respuestas, caching de cabeceras, y pooling de conexiones a base de datos. Las consultas frecuentes pueden ser optimizadas con índices apropiados en la base de datos.

**Manejo de Recursos:**
La aplicación implementa una gestión cuidadosa de recursos, incluyendo la limpieza de event listeners, cancelación de peticiones pendientes, y liberación de recursos del mapa cuando los componentes se desmontan.

### **12. INTEGRACIÓN CONTINUA Y DESPLIEGUE**

**Variables de Entorno:**
La aplicación utiliza variables de entorno para toda la configuración sensible, permitiendo diferentes configuraciones por ambiente sin modificar el código fuente.

**Scripts de Construcción:**
El frontend utiliza Create React App con scripts optimizados para producción, incluyendo minificación, tree shaking, y división de código. El backend utiliza scripts personalizados para transpilación y empaquetado.

**Consideraciones de Despliegue:**
La aplicación está diseñada para ser desplegada en ambientes containerizados, con consideraciones para escalado horizontal, balanceo de carga, y monitoreo de salud.

Esta arquitectura proporciona una base sólida para el Mapa Interactivo UCN, permitiendo funcionalidades ricas, buen rendimiento, y facilitando el mantenimiento y extensión futura del sistema.