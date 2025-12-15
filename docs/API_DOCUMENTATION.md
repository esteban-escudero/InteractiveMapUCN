# 🔌 Documentación de API - InteractiveMapUCN

Esta documentación detalla los endpoints disponibles en la API RESTful del proyecto InteractiveMapUCN.

**Base URL**: `/api`

## Autenticación y Autorización

La API utiliza **JWT (JSON Web Tokens)** para proteger rutas administrativas.
Las rutas protegidas requieren el header:
`Authorization: Bearer <token>`

---

## 🔐 Autenticación

### Registrar Administrador
Crea una nueva cuenta de administrador.
- **Endpoint**: `POST /auth/register`
- **Body**:
  ```json
  {
    "username": "admin",
    "password": "securePassword123",
    "email": "admin@ucn.cl"
  }
  ```
- **Respuesta (201)**: `User registered successfully`

### Iniciar Sesión
Obtiene un token JWT válido.
- **Endpoint**: `POST /auth/login`
- **Body**:
  ```json
  {
    "username": "admin",
    "password": "securePassword123"
  }
  ```
- **Respuesta (200)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

---

## 🏢 Edificios (Buildings)

### Obtener Todos los Edificios
- **Endpoint**: `GET /buildings`
- **Respuesta (200)**: Array de objetos edificio con su geometría GeoJSON.

### Obtener Edificio por ID
- **Endpoint**: `GET /buildings/:id`
- **Parámetros**: `id` (Integer)

### Crear Edificio 🔒
- **Endpoint**: `POST /buildings`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "name": "Pabellón J",
    "description": "Aulas de computación",
    "type": "Laboratorio",
    "geometry": { ...GeoJSON Polygon... }
  }
  ```

### Actualizar Edificio 🔒
- **Endpoint**: `PUT /buildings/:id`

### Eliminar Edificio 🔒
- **Endpoint**: `DELETE /buildings/:id`

---

## 🚪 Salas (Rooms)

Gestiona las salas dentro de los edificios.

### Obtener Todas las Salas
- **Endpoint**: `GET /rooms`

### Obtener Sala por ID
- **Endpoint**: `GET /rooms/:id`

### Obtener Salas por Edificio
- **Endpoint**: `GET /rooms/building/:buildingId`

### Crear Sala 🔒
- **Endpoint**: `POST /rooms`
- **Body**:
  ```json
  {
    "name": "J-204",
    "building_id": 1,
    "floor": 2,
    "capacity": 30,
    "type": "Laboratorio"
  }
  ```

---

## 🛣️ Rutas (Routes)

Gestiona los caminos y senderos del campus.

### Obtener Todas las Rutas
- **Endpoint**: `GET /routes`

### Calcular Ruta Óptima
Calcula el camino más corto entre dos puntos usando Dijkstra.
- **Endpoint**: `POST /routes/calculate`
- **Body**:
  ```json
  {
    "startPoint": { "lat": -29.96, "lng": -71.34 },
    "endPoint": { "lat": -29.97, "lng": -71.35 },
    "mode": "walking" // walking, wheelchair
  }
  ```

---

## 🖼️ Imágenes de Edificios (Building Images)

Gestiona los planos e imágenes asociados a cada edificio.

### Subir Imagen 🔒
- **Endpoint**: `POST /building-images/upload`
- **Content-Type**: `multipart/form-data`
- **Body Form Data**:
  - `image`: (File) Archivo de imagen (jpg, png)
  - `buildingId`: (Integer) ID del edificio
  - `floor`: (Integer) Número de piso

### Obtener Imágenes por Edificio
- **Endpoint**: `GET /building-images/building/:buildingId`

### Eliminar Imagen 🔒
- **Endpoint**: `DELETE /building-images/:imageId`

---

## 📏 Análisis de Proximidad

### Ruta Más Cercana a Edificio
Encuentra el punto de acceso más cercano a un edificio.
- **Endpoint**: `GET /proximity/building/:buildingId/closest-route`

### Rutas en Radio
Encuentra rutas dentro de un radio en metros.
- **Endpoint**: `GET /proximity/building/:buildingId/routes-in-radius`
- **Query Params**: `?radius=50` (metros)

### Análisis Completo
Devuelve un resumen de conectividad para un edificio.
- **Endpoint**: `GET /proximity/analysis/:buildingId`
- **Respuesta**:
  ```json
  {
    "buildingId": 1,
    "closestRouteDistance": 12.5,
    "connected": true,
    "accessPoints": 2
  }
  ```

---

## 🌍 Análisis Espacial (Spatial Analysis)

### Validar Ubicaciones
Verifica si coordenadas masivas caen dentro de zonas válidas o edificios.
- **Endpoint**: `POST /spatial/validate-locations`

### Edificios Cercanos
Encuentra edificios cercanos a una coordenada arbitraria.
- **Endpoint**: `POST /spatial/nearby-buildings`
- **Body**:
  ```json
  {
    "lat": -29.9,
    "lng": -71.3,
    "radius": 100
  }
  ```
