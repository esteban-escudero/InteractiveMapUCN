# Historias de Usuario Actualizadas - Mapa Interactivo UCN

## **Rol: Administrador**

### **HU-ADM-01: Gestión de Edificios**
**Como** administrador del sistema  
**Quiero** poder crear, editar y eliminar edificios  
**Para** mantener actualizado el catastro de edificios del campus

**Criterios de aceptación:**
- ✅ Formulario para crear nuevos edificios con: nombre, descripción, tipo y coordenadas
- ✅ Captura de coordenadas mediante clic en el mapa
- ✅ Edición de información existente de edificios
- ✅ Eliminación de edificios con confirmación
- ✅ Validación de datos obligatorios (nombre, tipo, coordenadas)
- ✅ Los cambios deben reflejarse inmediatamente en el mapa

### **HU-ADM-02: Gestión de Tipos de Edificios**
**Como** administrador del sistema  
**Quiero** poder asignar tipos específicos a los edificios  
**Para** categorizar correctamente los espacios del campus

**Criterios de aceptación:**
- ✅ Dropdown con tipos predefinidos: Oficina Profesor, Sala de Clase, Laboratorio, etc.
- ✅ Asignación de tipo al crear o editar edificios
- ✅ Visualización del tipo en los popups del mapa
- ✅ Íconos/colores diferentes por tipo de edificio

### **HU-ADM-03: Sincronización con GeoServer**
**Como** administrador del sistema  
**Quiero** poder sincronizar datos con GeoServer  
**Para** mantener consistencia entre sistemas

**Criterios de aceptación:**
- ✅ Botón para sincronizar datos desde GeoServer
- ✅ Importación de features WFS como edificios
- ✅ Confirmación de sincronización exitosa
- ✅ Manejo de errores en la conexión

### **HU-ADM-04: Autenticación de Administrador**
**Como** administrador del sistema  
**Quiero** poder iniciar sesión en el sistema  
**Para** acceder a las funciones de administración

**Criterios de aceptación:**
- ✅ Formulario de login con email y contraseña
- ✅ Validación de credenciales contra base de datos
- ✅ Redirección al panel de administración
- ✅ Protección de rutas administrativas

### **HU-ADM-05: Panel de Administración**
**Como** administrador del sistema  
**Quiero** tener un panel centralizado de administración  
**Para** gestionar eficientemente todos los elementos del sistema

**Criterios de aceptación:**
- ✅ SidePanel con opciones de administración
- ✅ Estadísticas de edificios cargados
- ✅ Estado de conexión con backend y GeoServer
- ✅ Acceso rápido a funciones principales

---

## **Rol: Usuario Común (Sin Autenticación)**

### **HU-USR-01: Visualización de Mapa Interactivo**
**Como** usuario común  
**Quiero** poder ver todos los edificios en un mapa interactivo  
**Para** ubicarme dentro del campus universitario

**Criterios de aceptación:**
- ✅ Mapa base con vista del campus UCN Coquimbo
- ✅ Marcadores de edificios con información básica
- ✅ Popups al hacer clic en edificios
- ✅ Navegación fluida por el mapa

### **HU-USR-02: Búsqueda y Filtrado de Edificios**
**Como** usuario común  
**Quiero** poder buscar y filtrar edificios por tipo  
**Para** encontrar rápidamente espacios específicos

**Criterios de aceptación:**
- ✅ Búsqueda por nombre de edificio
- ✅ Filtrado por tipo (Oficinas, Salas, Laboratorios, etc.)
- ✅ Resultados en tiempo real
- ✅ Integración con la visualización en mapa

### **HU-USR-03: Información Detallada de Edificios**
**Como** usuario común  
**Quiero** poder ver información detallada de cada edificio  
**Para** conocer las características de los espacios

**Criterios de aceptación:**
- ✅ Popups con: nombre, descripción, tipo, coordenadas
- ✅ Información clara y bien estructurada
- ✅ Indicación visual del tipo de edificio

### **HU-USR-04: Navegación por Categorías**
**Como** usuario común  
**Quiero** poder encontrar edificios por categoría específica  
**Para** ubicar servicios como baños, cafeterías, bibliotecas rápidamente

**Criterios de aceptación:**
- ✅ Acceso rápido a categorías frecuentes (Baños, Cafeterías)
- ✅ Filtrado visual en el mapa por categoría
- ✅ Lista de edificios por tipo seleccionado

### **HU-USR-05: Sistema de Navegación y Rutas** *(Futuro)*
**Como** usuario común  
**Quiero** poder calcular rutas entre puntos  
**Para** moverme eficientemente por el campus

**Criterios de aceptación:**
- ✅ Selección de punto de origen y destino
- ✅ Cálculo de ruta óptima
- ✅ Visualización de ruta en el mapa
- ✅ Indicación de distancia y tiempo estimado

### **HU-USR-06: Planos de Edificios** *(Futuro)*
**Como** usuario común  
**Quiero** poder ver planos internos de los edificios  
**Para** orientarme dentro de las instalaciones

**Criterios de aceptación:**
- ✅ Acceso a planos por edificio
- ✅ Navegación entre diferentes pisos
- ✅ Integración con sistema de salas

---

## **🔄 Historias Implementadas vs. Planificadas**

### **✅ Actualmente Implementadas:**
- HU-ADM-01: Gestión de Edificios
- HU-ADM-02: Gestión de Tipos de Edificios  
- HU-ADM-03: Sincronización con GeoServer
- HU-USR-01: Visualización de Mapa Interactivo
- HU-USR-02: Búsqueda y Filtrado de Edificios
- HU-USR-03: Información Detallada de Edificios

### **🚧 Por Implementar:**
- HU-ADM-04: Autenticación de Administrador
- HU-ADM-05: Panel de Administración
- HU-USR-04: Navegación por Categorías
- HU-USR-05: Sistema de Navegación y Rutas
- HU-USR-06: Planos de Edificios

---

## **📊 Priorización**

### **Alta Prioridad:**
1. HU-USR-04: Navegación por Categorías  
2. HU-ADM-04: Autenticación de Administrador  
3. HU-USR-05: Sistema de Navegación y Rutas

### **Media Prioridad:**
4. HU-ADM-05: Panel de Administración

### **Baja Prioridad:**
5. HU-USR-06: Planos de Edificios
