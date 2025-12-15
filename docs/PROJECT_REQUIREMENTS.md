# 📝 Requerimientos del Proyecto - InteractiveMapUCN

Este documento detalla los requerimientos funcionales y no funcionales que definieron el alcance del desarrollo de `InteractiveMapUCN`.

## 1. Requerimientos Funcionales (RF)

### Gestión de Usuarios
- **RF-01**: El sistema debe permitir el inicio de sesión de administradores (Admin) mediante credenciales seguras.
- **RF-02**: Solo los Super-Admin pueden crear o eliminar otros administradores.

### Mapa y Visualización
- **RF-03**: El sistema debe mostrar un mapa interactivo del Campus Coquimbo UCN.
- **RF-04**: Los edificios deben estar representados por polígonos cliqueables.
- **RF-05**: Al seleccionar un edificio, se debe desplegar un panel con información, imagen y lista de servicios/salas.

### Búsqueda
- **RF-06**: El sistema debe permitir buscar edificios y salas por nombre o categoría.

### Navegación y Rutas
- **RF-07**: El sistema debe calcular la ruta más corta entre dos puntos dentro del campus.
- **RF-08**: El sistema debe soportar diferentes modos de ruta (Peatonal, Accesible, Vehicular).
- **RF-09**: El sistema debe poder utilizar la ubicación GPS del dispositivo del usuario como punto de origen.

### Gestión de Contenidos (Admin)
- **RF-10**: El administrador debe poder dibujar y editar la geometría (polígonos) de los edificios.
- **RF-11**: El administrador debe poder crear y conectar segmentos de ruta (grafo) visualmente.
- **RF-12**: El administrador debe poder subir imágenes de planos de piso.

---

## 2. Requerimientos No Funcionales (RNF)

### Rendimiento
- **RNF-01**: El mapa debe cargar inicialmente en menos de 2 segundos en redes 4G.
- **RNF-02**: Las búsquedas deben devolver resultados en menos de 200ms.

### Seguridad
- **RNF-03**: Todas las comunicaciones deben estar encriptadas (HTTPS).
- **RNF-04**: Las contraseñas deben almacenarse como hash (no texto plano).
- **RNF-05**: El acceso a la API administrativa debe estar protegido por Tokens (JWT).

### Compatibilidad
- **RNF-06**: La aplicación debe ser una Progressive Web App (PWA) instalable.
- **RNF-07**: Debe ser compatible con los navegadores modernos principales (Chrome, Safari, Firefox).

### Disponibilidad
- **RNF-08**: El sistema debe ser capaz de funcionar en modo "Offline" (sin internet) con funcionalidades limitadas una vez cargado el mapa base.
