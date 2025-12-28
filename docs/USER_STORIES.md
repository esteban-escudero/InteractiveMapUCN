# Historias de Usuario - InteractiveMapUCN

Este documento describe las funcionalidades del sistema desde la perspectiva de los diferentes tipos de usuarios, siguiendo el formato: *"Como [rol], quiero [acción], para [beneficio]"*.

## Roles de Usuario

1. **Visitante/Usuario**: Estudiante, docente o personal que utiliza el mapa para orientarse.
2. **Administrador**: Miembro del equipo técnico o de infraestructura que gestiona el contenido del mapa.
3. **Super-Administrador**: Usuario con permisos extendidos para gestionar el acceso de otros administradores.

---

## 1. Visitante / Usuario Final

| ID | Historia de Usuario | Criterios de Aceptación |
|----|-------------------|-------------------------|
| **HU-01** | Como **Visitante**, quiero **ver un mapa interactivo del campus**, para **poder orientarme espacialmente de manera rápida**. | - El mapa carga en < 2s.<br>- Se muestran edificios cliqueables. |
| **HU-02** | Como **Visitante**, quiero **buscar un edificio o sala por su nombre**, para **encontrar su ubicación exacta sin tener que explorar todo el mapa**. | - Barra de búsqueda funcional.<br>- Autocompletado con sugerencias.<br>- Centrado automático al seleccionar un resultado. |
| **HU-03** | Como **Visitante**, quiero **ver información detallada de un edificio**, para **conocer qué servicios o salas hay en su interior**. | - Panel lateral/inferior con descripción e imagen.<br>- Lista de salas organizada por piso. |
| **HU-04** | Como **Visitante**, quiero **calcular la ruta más corta entre mi ubicación y un destino**, para **llegar lo más rápido posible**. | - Uso de GPS opcional.<br>- Cálculo visual del camino en el mapa (LineString). |
| **HU-05** | Como **Visitante con movilidad reducida**, quiero **seleccionar una ruta accesible**, para **evitar obstáculos como escaleras**. | - Filtro de ruta "Accesible".<br>- El algoritmo prioriza rampas y ascensores. |
| **HU-06** | Como **Usuario móvil**, quiero **instalar la aplicación en mi pantalla de inicio (PWA)**, para **acceder al mapa sin abrir el navegador cada vez**. | - Soporte PWA detectable por el navegador.<br>- Funcionalidad offline básica (mapa base cacheado). |

---

## 2. Administrador

| ID | Historia de Usuario | Criterios de Aceptación |
|----|-------------------|-------------------------|
| **HU-07** | Como **Administrador**, quiero **iniciar sesión en un panel de gestión**, para **modificar los datos del campus de forma segura**. | - Login con email y contraseña segura.<br>- Protección por JWT. |
| **HU-08** | Como **Administrador**, quiero **dibujar polígonos sobre el mapa**, para **representar visualmente edificios nuevos o modificados**. | - Herramienta de dibujo manual.<br>- Persistencia en base de datos PostGIS. |
| **HU-09** | Como **Administrador**, quiero **subir imágenes de planos de piso**, para **que los usuarios puedan ver la distribución interna de cada edificio**. | - Soporte para archivos JPG/PNG.<br>- Vinculación por ID de edificio y número de piso. |
| **HU-10** | Como **Administrador**, quiero **trazar y conectar segmentos de ruta**, para **actualizar la red de navegación del campus**. | - Herramienta para crear nodos y aristas.<br>- Validación de conectividad del grafo. |

---

## 3. Super-Administrador

| ID | Historia de Usuario | Criterios de Aceptación |
|----|-------------------|-------------------------|
| **HU-11** | Como **Super-Admin**, quiero **crear nuevas cuentas de administrador**, para **delegar la gestión de contenidos a otros miembros del equipo**. | - Formulario de creación de usuario.<br>- Asignación de credenciales temporales. |
| **HU-12** | Como **Super-Admin**, quiero **revocar el acceso a administradores existentes**, para **mantener la seguridad del sistema cuando alguien deja el proyecto**. | - Opción de eliminar o desactivar cuentas.<br>- Invalidación inmediata de sesiones activas. |
