## **Historias de Usuario - Rol: Administrador**

### **HU-ADM-01: Edición de información de edificios**
**Como** administrador del sistema  
**Quiero** poder editar la información de los edificios (área, ID, nombre, orientación en grados)  
**Para** mantener actualizada la base de datos de ubicaciones

**Criterios de aceptación:**
- Debe permitir modificar nombre, área y orientación en grados
- El ID del edificio debe ser único y validado
- Los cambios deben guardarse con confirmación
- Debe haber validación de datos numéricos para área y orientación

### **HU-ADM-02: Gestión de rutas**
**Como** administrador del sistema  
**Quiero** poder crear, editar y eliminar rutas entre puntos  
**Para** ofrecer navegación precisa a los usuarios

**Criterios de aceptación:**
- Crear nuevas rutas entre puntos
- Modificar rutas existentes
- Eliminar rutas obsoletas
- Definir rutas accesibles para movilidad reducida

### **HU-ADM-03: Gestión de salas**
**Como** administrador del sistema  
**Quiero** poder gestionar las salas de los edificios  
**Para** mantener un inventario actualizado de espacios

**Criterios de aceptación:**
- Agregar nuevas salas con nombre y piso
- Editar información de salas existentes
- Eliminar salas que ya no existan
- Asignar salas a edificios específicos

### **HU-ADM-04: Autenticación de administrador**
**Como** administrador del sistema  
**Quiero** poder iniciar sesión en el sistema  
**Para** acceder a las funciones de administración

**Criterios de aceptación:**
- Formulario de login con usuario y contraseña
- Validación de credenciales
- Redirección al panel de administración
- Protección de rutas administrativas

### **HU-ADM-05: Creación de nuevos edificios**
**Como** administrador del sistema  
**Quiero** poder agregar nuevos edificios al sistema    
**Para** expandir la cobertura de la aplicación cuando haya nuevas construcciones   

**Criterios de aceptación:**

- Formulario para ingresar datos del nuevo edificio (nombre, área, orientación en grados)
- Generación automática de ID único para el edificio
- Validación de que no exista un edificio con el mismo nombre
- Campos obligatorios: nombre y orientación
- Confirmación de creación exitosa
- El nuevo edificio debe aparecer inmediatamente en el listado para los usuarios

---

## **Historias de Usuario - Rol: Usuario Común**

### **HU-USR-01: Navegación entre puntos**
**Como** usuario común  
**Quiero** poder seleccionar origen y destino  
**Para** obtener rutas de navegación dentro del campus

**Criterios de aceptación:**
- Seleccionar punto de origen desde lista/mapa
- Seleccionar punto de destino desde lista/mapa
- Visualizar ruta calculada
- Mostrar tiempo/distancia estimada

### **HU-USR-02: Localización rápida de baños**
**Como** usuario común  
**Quiero** poder ver la ubicación de los baños rápidamente  
**Para** encontrar servicios sanitarios sin complicaciones

**Criterios de aceptación:**
- Botón/opción de "Baños cercanos"
- Mostrar baños en mapa
- Filtrar por baños accesibles si es necesario

### **HU-USR-03: Selección y visualización de edificios**
**Como** usuario común  
**Quiero** poder seleccionar edificios y ver su información  
**Para** conocer detalles específicos de cada edificio

**Criterios de aceptación:**
- Lista de edificios disponibles
- Al hacer click en edificio, mostrar información (nombre, áreas, etc.)
- Integración con mapa interactivo

### **HU-USR-04: Visualización de rutas**
**Como** usuario común  
**Quiero** poder ver rutas normales y para movilidad reducida  
**Para** elegir el camino más adecuado a mis necesidades

**Criterios de aceptación:**
- Toggle para cambiar entre rutas normales y accesibles
- Visualización clara de ambos tipos de rutas
- Indicación de rutas recomendadas para sillas de ruedas

### **HU-USR-05: Búsqueda de salas**
**Como** usuario común  
**Quiero** poder buscar salas por nombre  
**Para** encontrar rápidamente la ubicación de aulas u oficinas

**Criterios de aceptación:**
- Campo de búsqueda por nombre de sala
- Resultados que muestren edificio y piso
- Búsqueda en tiempo real con sugerencias

### **HU-USR-06: Visualización de planos**
**Como** usuario común  
**Quiero** poder ver los planos de los edificios  
**Para** orientarme mejor dentro de las instalaciones

**Criterios de aceptación:**
- Acceso a planos por edificio
- Navegación entre pisos
- Planos interactivos con puntos de interés

---

**Nota:** Las historias del usuario común no incluyen autenticación, ya que según los parámetros no la requieren.