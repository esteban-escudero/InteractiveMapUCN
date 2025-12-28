# 🗺️ Guía de Presentación: InteractiveMapUCN

Esta guía está diseñada para ayudarte a estructurar una presentación profesional de tu proyecto. Puedes usarla para crear diapositivas en PowerPoint, Google Slides, o directamente en herramientas basadas en Markdown como Marp.

---

## 🎨 Estética Recomendada
*   **Colores**: Usa una paleta basada en la identidad de la UCN (Azul marino, Amarillo/Dorado) combinada con tonos modernos de "Geospatial Apps" (Gris oscuro, Verde esmeralda para rutas).
*   **Tipografía**: Sans-serif limpia (Inter, Roboto u Outfit).
*   **Iconografía**: Material Design Icons (para ser consistente con la app).

---

## 📽️ Estructura de Diapositivas

### 1. Portada
*   **Texto Principal**: InteractiveMapUCN: Sistema de Navegación Inteligente y Accesible
*   **Subtítulo**: Solución PWA de Información Geoespacial para el Campus Coquimbo
*   **Presentado por**: [Tu Nombre]
*   **Indicación de Imagen**: Una captura de pantalla de alta calidad del mapa centrado en el campus con el Marcador GPS activo.

### 2. El Problema (Contexto)
*   **Puntos Clave**:
    *   Complejidad del campus universitario (múltiples edificios y niveles).
    *   Dificultad de orientación para nuevos estudiantes y visitantes.
    *   Falta de información sobre rutas accesibles para personas con movilidad reducida.
    *   Necesidad de una herramienta centralizada y accesible desde cualquier dispositivo.
*   **Indicación de Imagen**: Un mapa estático tradicional del campus (si existe uno antiguo) o una foto del campus para contextualizar.

### 3. La Solución: InteractiveMapUCN
*   **Definición**: Una Progressive Web App (PWA) que funciona como un SIG (Sistema de Información Geográfica) móvil.
*   **Propósito**: Facilitar la navegación en tiempo real, búsqueda de salas y gestión administrativa del campus.
*   **Diferenciadores**:
    *   No requiere instalación (Acceso vía URL).
    *   Funciona Offline (Service Workers).
    *   Enfoque en Inclusión (Rutas accesibles).

### 4. Tecnologías (Stack Tecnológico)
*   **Frontend (Cliente)**:
    *   **Lenguajes**: JavaScript (ES6+), CSS3.
    *   **Frameworks/Libs**: React 18, Leaflet (Mapas), Material Icons.
    *   **Análisis Espacial**: Turf.js (Procesamiento en cliente).
*   **Backend (Servidor)**:
    *   **Lenguajes**: JavaScript (ES6+), Node.js (Runtime).
    *   **Frameworks/Libs**: Express, JWT (Seguridad).
    *   **Algoritmos**: Dijkstra (Pathfinding) y Turf.js (Procesamiento en servidor).
*   **Base de Datos**:
    *   **Motor**: PostgreSQL + **PostGIS** (Extensión para datos espaciales).
*   **Infraestructura**: Docker, Nginx, Linux.
*   **Indicación de Imagen**: Un diagrama dividido en dos columnas (Front vs Back) o la arquitectura simplificada de `docs/ARCHITECTURE.md`.

### 5. Características para el Usuario
*   **Mapa Interactivo**: Capas personalizadas de edificios coloreados por categoría (Académico, Administrativo, etc.).
*   **Búsqueda Inteligente**: Buscador con autocompletado para edificios y salas.
*   **Navegación GPS**: Geolocalización en tiempo real con marcador animado.
*   **Cálculo de Rutas**:
    *   🚶 **Peatonal**: El camino más lógico.
    *   ♿ **Accesible**: Evita escaleras y obstáculos (Inclusión).
    *   ⚡ **Rápida/Emergencia**: Optimización de tiempo.
*   **Indicación de Imagen**: Un carrusel de capturas de pantalla de la versión móvil (Phone mockups).

### 6. Panel de Administración (Gestión)
*   **Control Total**: CRUD de edificios, rutas y usuarios.
*   **Gestión de Espacios**: Administración de salas y subida de planos por piso.
*   **Análisis de Proximidad**: Herramientas para detectar rutas cercanas a edificios.
*   **Seguridad**: Acceso protegido por JWT y roles de administrador.
*   **Indicación de Imagen**: Captura de pantalla del Dashboard Administrativo o del formulario de creación de edificios con el editor de polígonos.

### 7. Aspectos Técnicos: ¿Cómo funciona?
*   **Geospatial Mastery**: Uso de `GEOMETRY` en PostGIS para almacenar polígonos (edificios) y líneas (rutas).
*   **Pathfinding Personalizado**: Implementación de Dijkstra en el servidor para garantizar que el cálculo de rutas sea preciso y rápido.
*   **PWA**: Manifest y Service Workers para que la app se sienta "nativa" en Android e iOS.
*   **Indicación de Imagen**: Un fragmento de código (Code Snippet) del servicio de rutas (`routeGraphService.js`) o el diagrama Mermaid de la arquitectura de la base de datos.

### 8. Resultados y Logros
*   **Impacto Estudiantil**: Reducción de tiempos de traslado y desorientación.
*   **Inclusión Real**: Primera herramienta institucional en ofrecer rutas accesibles verificadas.
*   **Calidad de Software**: Cobertura de pruebas (Jest) y documentación técnica exhaustiva.
*   **Indicación de Imagen**: La tabla comparativa "Meta Inicial vs. Resultado Final" que aparece en `docs/Conclusiones.md`.

### 9. Futuro del Proyecto
*   **Escalabilidad**: Expansión a otros campus (Antofagasta).
*   **Participación Ciudadana**: Sistema de reportes para que usuarios informen bloqueos en el campus.
*   **Integración**: Conexión con sistemas de asistencia (QR) e información académica en tiempo real.
*   **Indicación de Imagen**: Una imagen aspiracional o un "Roadmap" visual.

### 10. Conclusión y Preguntas
*   **Cierre**: "InteractiveMapUCN no es solo un mapa, es una infraestructura digital para una universidad más inclusiva y moderna."
*   **Contacto**: Tu correo o GitHub.
*   **Indicación de Imagen**: Código QR que lleve al despliegue de la app o al repositorio.

---

## 💡 Consejos para el Éxito
1.  **Haz una Demo**: Si es posible, muestra la app funcionando en un celular. Ver el marcador GPS moverse es muy impactante.
2.  **Enfatiza la Accesibilidad**: Es el punto más fuerte a nivel social y académico.
3.  **Menciona a PostGIS**: En proyectos universitarios, el uso de extensiones espaciales profesionales suma muchos puntos técnicos.
4.  **Usa los archivos de `docs/`**: Tienes diagramas Mermaid y reportes de performance allí que son "oro" para una presentación técnica.
