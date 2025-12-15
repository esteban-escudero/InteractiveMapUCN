# 🛠️ Manual de Administrador - InteractiveMapUCN

Esta guía está destinada a los administradores encargados de gestionar la información del mapa (edificios, salas, rutas y usuarios).

## 🔐 Acceso al Panel de Administración

Para acceder al gestor de contenidos:
1. Ve a `Menú` > `Iniciar Sesión`.
2. Ingresa tus credenciales de administrador.
3. Serás redirigido al **Dashboard de Administración**.

---

## 🏢 Gestión de Edificios

### Crear Nuevo Edificio
1. En el Dashboard, selecciona **"Edificios"** > **"Nuevo"**.
2. **Dibujar en el mapa**: Usa la herramienta de polígono para marcar el contorno del edificio en el mapa.
   - Haz clic en cada esquina del edificio.
   - Haz clic en el primer punto para cerrar la forma.
3. Completa los datos:
   - Nombre (ej: "Pabellón K").
   - Tipo (Académico, Servicio, etc.).
   - Descripción opcional.
4. Presiona **Guardar**.

### Editar Edificio
1. Busca el edificio en la lista.
2. Presiona el ícono de lápiz (✏️).
3. Modifica los datos o ajusta el polígono en el mapa.
4. Presiona **Actualizar**.

### Subir Planos (Imágenes)
1. Dentro de la edición de un edificio, ve a la sección **"Planos"**.
2. Selecciona el piso correspondiente (1, 2, -1).
3. Sube la imagen del plano (JPG o PNG).
4. La imagen quedará vinculada y visible para los usuarios al consultar ese piso.

---

## 🚪 Gestión de Salas

Puedes agregar salas individualmente a cada edificio:
1. Selecciona un edificio de la lista.
2. Ve a la pestaña **"Salas"**.
3. Presiona **"Agregar Sala"**.
4. Ingresa:
   - Nombre/Número (ej: "K-120").
   - Piso.
   - Tipo (Clase, Laboratorio, Oficina).
5. Guarda los cambios.

---

## 🛣️ Gestión de Rutas

Las rutas permiten que el sistema de navegación funcione.

### Crear Nueva Ruta
1. Selecciona **"Rutas"** en el menú lateral.
2. Presiona **"Nueva Ruta"**.
3. **Dibujar**: Haz clic en el mapa para crear puntos consecutivos.
   - Para terminar una línea, haz doble clic en el último punto.
4. Asigna propiedades:
   - **Tipo**: Peatonal (default) o Accesible (solo si es plano o tiene rampa).
   - **Estado**: Activa o En Mantenimiento.

> **Nota**: Asegúrate de que las nuevas rutas se conecten con las existentes (que los puntos se toquen o crucen) para garantizar la continuidad de la navegación.

---

## 👥 Gestión de Usuarios

Acceso restringido a Super Administradores.

- **Crear Admin**: `Usuarios` > `Nuevo`. Ingresa email y contraseña temporal.
- **Eliminar Admin**: Presiona el ícono de basura (🗑️). Esta acción es irreversible.

---

## ⚠️ Solución de Problemas Comunes

**No puedo dibujar el polígono:**
Asegúrate de no cruzar líneas. Los polígonos deben ser formas simples sin auto-intersecciones.

**Las rutas no calculan bien:**
Verifica que los tramos de ruta estén conectados entre sí. Si hay un espacio entre dos líneas, el algoritmo no encontrará camino.
