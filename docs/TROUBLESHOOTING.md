# 🔧 Solución de Problemas (Troubleshooting)

Guía para resolver errores comunes durante el desarrollo y despliegue de **InteractiveMapUCN**.

## 🛑 Errores de Inicio (Startup)

### `Error: connect ECONNREFUSED 127.0.0.1:5432`
**Causa**: La aplicación no puede conectarse a la base de datos.
**Solución**:
1. Verifica que PostgreSQL esté corriendo:
   ```bash
   # Windows
   services.msc > PostgreSQL
   # Linux/Mac
   sudo systemctl status postgresql
   ```
2. Revisa credenciales en `.env` (host, puerto, usuario, password).
3. Si usas Docker, asegúrate de que el contenedor db esté arriba (`docker-compose ps`).

### `Error: EADDRINUSE :::3001`
**Causa**: El puerto 3001 ya está ocupado por otro proceso.
**Solución**:
1. Identifica el proceso: `lsof -i :3001` (Linux/Mac) o `netstat -ano | findstr :3001` (Windows).
2. Mata el proceso o cambia el `PORT` en `.env`.

---

## 🗺️ Errores de Mapa y Datos

### El mapa se ve gris/blanco
**Causa**: Problema con los tiles de Leaflet o falta de conexión a internet.
**Solución**:
- Verifica tu conexión. Leaflet necesita descargar los tiles base (OpenStreetMap) al menos una vez para cachearlos.
- Revisa la consola (`F12`) por errores de CSP (Content Security Policy) bloqueando imágenes externas.

### "No route found" (Ruta no encontrada)
**Causa**: Los nodos de origen y destino están desconectados en el grafo.
**Solución**:
- En modo Admin, revisa visualmente si hay rutas que conecten ambas áreas.
- Asegúrate de que las líneas de ruta se "toquen" o crucen. El algoritmo requiere intersección física para crear nodos.

---

## 🐳 Errores de Docker

### `PostGIS extension not found`
**Causa**: Estás usando una imagen de Postgres estándar en lugar de la versión con PostGIS.
**Solución**:
En `docker-compose.yaml`, asegúrate de usar:
`image: postgis/postgis:15-3.3` (o similar) en lugar de `postgres:15`.

### Persistencia de Datos falla
**Causa**: Volumen de Docker mal configurado o eliminado.
**Solución**:
Asegúrate de tener mapeado el volumen en `docker-compose.yaml`:
```yaml
volumes:
  - pgdata:/var/lib/postgresql/data
```

---

## 🔒 Errores de Autenticación

### "Invalid Token" constante
**Causa**: `JWT_SECRET` cambió en el servidor, invalidando tokens antiguos.
**Solución**:
- Haz logout manual y vuelve a loguearte.
- Asegura que `JWT_SECRET` sea consistente en el `.env` entre reinicios.
