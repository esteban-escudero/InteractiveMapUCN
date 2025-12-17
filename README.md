# 🗺️ Mapa Interactivo UCN - Campus Coquimbo

Sistema de mapeo interactivo para la Universidad Católica del Norte (UCN) - Campus Coquimbo, que permite la navegación y búsqueda de ubicaciones dentro del campus universitario mediante Progressive Web App (PWA).

## 📋 Descripción del Proyecto

**InteractiveMapUCN** es una **Progressive Web App (PWA)** de tipo **Sistema de Información Geográfica (SIG/GIS) Web** diseñada para facilitar la orientación y navegación dentro del campus Coquimbo de la UCN. Los usuarios pueden acceder directamente desde su navegador web sin necesidad de instalación de aplicaciones nativas.

### Tipo de Proyecto
- **Categoría**: Sistema de Información Geográfica (SIG/GIS) Web
- **Arquitectura**: Progressive Web App (PWA) Full-Stack
- **Dominio**: Educación Superior / Campus Universitario
- **Campus**: Coquimbo, Chile
- **Acceso**: Navegador Web
- **Complejidad**: Medio-Alto

### Propósito
- Orientación en campus universitario
- Búsqueda de ubicaciones (edificios, salas, servicios)
- Geolocalización en tiempo real
- Cálculo de rutas inteligentes con múltiples tipos (peatonal, accesible, rápida, emergencia, vehicular)
- Navegación asistida desde ubicación actual
- Gestión administrativa de edificios, salas y rutas
- Acceso público sin autenticación para usuarios

## ✨ Características Principales

### Para Usuarios
- 🗺️ **Mapa Interactivo**: Visualización del campus usando Leaflet con capas personalizadas
- 📱 **PWA**: Funciona como app nativa, instalable, con soporte offline
- 🔍 **Búsqueda Inteligente**: Encuentra edificios y salas por nombre con autocompletado
- 📍 **Geolocalización GPS**: Muestra tu ubicación actual en el mapa con marcador animado
- 🧭 **Navegación desde Mi Ubicación**: Calcula rutas desde tu posición actual al destino
- 🛣️ **Cálculo de Rutas Inteligente**: 5 tipos de rutas con algoritmo de Dijkstra
  - **Peatonal**: Ruta estándar para caminar
  - **Accesible**: Adaptada para personas con movilidad reducida
  - **Rápida**: El camino más corto disponible
  - **Emergencia**: Rutas de evacuación
  - **Vehicular**: Para vehículos autorizados
- 🎨 **Colores por Categoría**: Edificios coloreados según su tipo (académico, administrativo, servicios, etc.)
- 🌙 **Modo Oscuro**: Interfaz adaptable para mayor comodidad
- 📱 **Diseño Responsive**: Optimizado para móviles y tablets

### Para Administradores
- 🔐 **Sistema de Autenticación**: Login seguro con JWT
- 🏢 **Gestión de Edificios**: CRUD completo con soporte para polígonos y puntos
- 📊 **Estadísticas**: Visualización rápida del conteo de salas y planos registrados
- 🚪 **Gestión de Salas**: Administración de salas por edificio con diseño de grid 3 columnas
- 🖼️ **Gestión de Imágenes**: Subida y administración de planos por edificio y piso
- 📏 **Análisis de Proximidad**: Herramientas para analizar distancias entre edificios y rutas
- 🗺️ **Análisis Espacial**: Cálculo de rutas óptimas y análisis geoespacial avanzado
- 🛣️ **Gestión de Rutas**: Creación y edición de rutas con múltiples segmentos (polylines)
- 👥 **Gestión de Usuarios**: Administración de cuentas de administradores
- 📊 **Panel de Control**: Vista completa de edificios, rutas y estadísticas
- 🎨 **Material Icons**: Interfaz moderna con iconos de Material Design

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** + **Express**: Framework del servidor
- **PostgreSQL**: Base de datos relacional con soporte PostGIS
- **PostGIS**: Extensión geoespacial para PostgreSQL
- **Turf.js**: Análisis geoespacial avanzado (distancias, rutas, proximidad)
- **JWT**: Autenticación basada en tokens
- **bcryptjs**: Encriptación de contraseñas
- **Multer**: Manejo de carga de archivos (imágenes de planos)
- **PM2**: Process manager para producción

### Frontend
- **React**: Biblioteca de interfaz de usuario
- **PWA**: Service Workers, Web App Manifest
- **Leaflet**: Librería de mapas interactivos
- **Material Icons**: Sistema de iconos de Google
- **CSS**: Estilos personalizados responsive

### Infraestructura
- **Nginx**: Reverse proxy y servidor web
- **Let's Encrypt**: Certificados SSL gratuitos
- **Docker**: Contenedorización (desarrollo)

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│              USUARIOS (Campus UCN Coquimbo)              │
│           📱 Acceden vía navegador web                   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────┐
│          SERVIDOR WEB (Nginx + SSL)                      │
├─────────────────────────────────────────────────────────┤
│  Frontend (PWA)         │      Backend API               │
│  - React Build          │      - Node.js + Express       │
│  - Service Worker       │      - PM2 Process Manager     │
│  - Leaflet Maps         │      - JWT Auth                │
└────────────────────────┬────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────┐
│       BASE DE DATOS (PostgreSQL + PostGIS)               │
│  - Edificios (polígonos/puntos)                          │
│  - Salas                                                 │
│  - Rutas (polylines)                                     │
│  - Usuarios (administradores)                            │
└─────────────────────────────────────────────────────────┘
```

## 📦 Requisitos Previos

### Desarrollo Local
- **Node.js** (v18 o superior)
- **npm** (v9 o superior)
- **PostgreSQL** (v15 o superior) con extensión **PostGIS**
- **Docker** y **Docker Compose** (opcional)

### Producción
- **Ubuntu Server** 22.04 LTS o similar
- **Nginx** (reverse proxy)
- **Node.js** 18+ y **PM2**
- **PostgreSQL** 15+ con **PostGIS**
- **Certbot** (Let's Encrypt SSL)

## 🚀 Instalación y Configuración

### Desarrollo Local

#### 1. Clonar el Repositorio

```bash
git clone https://github.com/esteban-escudero/InteractiveMapUCN.git
cd InteractiveMapUCN
```

#### 2. Configurar la Base de Datos

**Opción A: Usar Docker (Recomendado)**

```bash
docker-compose up -d
```

**Opción B: PostgreSQL Local**

```sql
CREATE DATABASE InteractiveMapDB;
\c InteractiveMapDB
CREATE EXTENSION postgis;
```

#### 3. Configurar el Backend

```bash
cd backend
npm install
```

Copiar el archivo de ejemplo y configurar las variables de entorno:

```bash
cp .env.example .env
# O en Windows CMD: copy .env.example .env
# O en PowerShell: copy .env.example .env
```

Editar el archivo `.env` con tus credenciales de base de datos.

#### 4. Configurar el Frontend

```bash
cd ../frontend
npm install
```

#### 5. Ejecutar en Desarrollo

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm start
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 📁 Estructura del Proyecto

```
InteractiveMapUCN/
├── backend/                    # Servidor Node.js + Express
│   ├── config/                # Configuración de la aplicación y BD
│   ├── controllers/           # Lógica de controladores
│   │   ├── authController.js
│   │   ├── buildingsController.js
│   │   ├── buildingImageController.js
│   │   ├── roomsController.js
│   │   ├── routesController.js
│   │   ├── routeNodesController.js
│   │   ├── proximityController.js
│   │   ├── spatialController.js
│   │   └── usersController.js
│   ├── middleware/            # Middlewares (auth, errores, etc.)
│   ├── models/                # Modelos de datos
│   ├── routes/                # Definición de rutas API
│   ├── services/              # Servicios de negocio
│   │   ├── routeGraphService.js  # Algoritmo de Dijkstra
│   │   └── proximityService.js   # Análisis de proximidad
│   ├── utils/                 # Utilidades y helpers
│   │   └── turfUtils.js       # Utilidades geoespaciales
│   ├── uploads/               # Archivos subidos (imágenes)
│   └── server.js              # Punto de entrada del servidor
├── frontend/                  # Aplicación React (PWA)
│   ├── public/                # Archivos estáticos
│   │   ├── manifest.json      # Web App Manifest
│   │   └── service-worker.js  # Service Worker para PWA
│   └── src/
│       ├── components/        # Componentes React
│       │   ├── admin/         # Panel de administración
│       │   ├── auth/          # Autenticación
│       │   ├── buildings/     # Gestión de edificios
│       │   ├── map/           # Componentes del mapa
│       │   ├── routes/        # Gestión de rutas
│       │   ├── ui/            # Componentes UI (SidePanel, etc.)
│       │   └── user/          # Vista de usuario
│       ├── constants/         # Constantes globales
│       │   ├── constants.ts   # Tipos de edificios, estados, rutas
│       │   └── mapConfig.js   # Configuración del mapa
│       ├── contexts/          # Contextos de React
│       ├── hooks/             # Custom hooks
│       │   ├── buildings/     # Hooks de edificios
│       │   ├── map/           # Hooks del mapa
│       │   └── routes/        # Hooks de rutas
│       ├── services/          # Servicios API
│       │   ├── authService.js
│       │   ├── buildingService.js
│       │   ├── buildingImageService.js
│       │   ├── roomService.js
│       │   ├── routeService.js
│       │   ├── proximityService.js
│       │   └── userService.js
│       └── utils/             # Utilidades
├── database/                  # Scripts de base de datos
├── scripts/                   # Scripts de utilidad
├── docker-compose.yaml        # Configuración de Docker
└── README.md                  # Este archivo
```

## 🔧 Solución de Problemas Comunes

### Error: MODULE_NOT_FOUND en Backend
Si el backend falla al iniciar:
1. Asegúrate de ejecutar `npm install` dentro de la carpeta `backend`.
2. Verifica que el archivo `.env` exista.

### Error: Pantalla en Blanco en Frontend
Si el frontend no carga:
1. Verifica que no haya conflictos de puerto (3000).
2. Revisa la consola del navegador por errores de importación (casing incorrecto).

### Problemas de Visualización (Modo Oscuro)
Si los modales se ven blancos en modo oscuro:
1. Limpia la caché del navegador.
2. Asegúrate de que `info-modal.css` se esté cargando correctamente.

## 🔌 API Endpoints Principales

### Autenticación
- `POST /api/auth/register` - Registrar nuevo administrador
- `POST /api/auth/login` - Iniciar sesión

### Edificios
- `GET /api/buildings` - Obtener todos los edificios
- `GET /api/buildings/:id` - Obtener edificio por ID
- `POST /api/buildings` - Crear nuevo edificio (requiere auth)
- `PUT /api/buildings/:id` - Actualizar edificio (requiere auth)
- `DELETE /api/buildings/:id` - Eliminar edificio (requiere auth)

### Salas
- `GET /api/rooms` - Obtener todas las salas
- `GET /api/rooms/:id` - Obtener sala por ID
- `GET /api/rooms/building/:buildingId` - Obtener salas por edificio
- `POST /api/rooms` - Crear nueva sala (requiere auth)
- `PUT /api/rooms/:id` - Actualizar sala (requiere auth)
- `DELETE /api/rooms/:id` - Eliminar sala (requiere auth)

### Imágenes de Edificios
- `POST /api/building-images/upload` - Subir imagen de plano (requiere auth)
- `GET /api/building-images/building/:buildingId` - Obtener imágenes por edificio
- `GET /api/building-images/building/:buildingId/floor/:floor` - Obtener imágenes por piso
- `DELETE /api/building-images/:imageId` - Eliminar imagen (requiere auth)

### Rutas
- `GET /api/routes` - Obtener todas las rutas
- `GET /api/routes/:id` - Obtener ruta por ID
- `POST /api/routes` - Crear nueva ruta (requiere auth)
- `PUT /api/routes/:id` - Actualizar ruta (requiere auth)
- `DELETE /api/routes/:id` - Eliminar ruta (requiere auth)
- `POST /api/routes/calculate` - Calcular ruta óptima entre dos puntos

### Análisis de Proximidad
- `GET /api/proximity/building/:buildingId/closest-route` - Obtener ruta más cercana a un edificio
- `GET /api/proximity/building/:buildingId/routes-in-radius` - Obtener rutas dentro de un radio
- `GET /api/proximity/route/:routeId/closest-building` - Obtener edificio más cercano a una ruta
- `POST /api/proximity/assign-routes` - Asignar rutas a múltiples edificios
- `GET /api/proximity/connecting/:originId/:destinationId` - Rutas que conectan dos edificios
- `GET /api/proximity/analysis/:buildingId` - Análisis completo de proximidad

### Análisis Espacial
- `POST /api/spatial/calculate-route` - Calcular ruta óptima con algoritmo de Dijkstra
- `POST /api/spatial/nearby-buildings` - Encontrar edificios cercanos a un punto
- `GET /api/spatial/analyze-routes` - Analizar estadísticas de rutas existentes
- `POST /api/spatial/validate-locations` - Validar ubicaciones masivamente

### Usuarios (Administradores)
- `GET /api/users` - Obtener todos los administradores (requiere auth)
- `POST /api/users` - Crear nuevo administrador (requiere auth)
- `PUT /api/users/:id` - Actualizar administrador (requiere auth)
- `DELETE /api/users/:id` - Eliminar administrador (requiere auth)

### Health Check
- `GET /api/health` - Verificar estado del servidor

## 🎨 Características de UI/UX

### Material Icons
- Todos los iconos utilizan Material Icons de Google
- Iconos consistentes en toda la aplicación
- Tamaño optimizado para legibilidad

### Diseño Responsive
- Grid de 3 columnas para lista de salas
- Adaptación automática a diferentes tamaños de pantalla
- Diseño mobile-first

### Colores por Categoría
Los edificios se colorean automáticamente según su tipo:
- 🔵 Académico
- 🟣 Administrativo
- 🟢 Servicios
- 🟡 Biblioteca
- 🔴 Casino/Cafetería
- Y más...

## 📊 Monitoreo

```bash
# Estado del backend
pm2 status
pm2 logs mapa-ucn-api

# Estado de Nginx
sudo systemctl status nginx
sudo tail -f /var/log/nginx/access.log

# Estado de PostgreSQL
sudo systemctl status postgresql
```

## 🤝 Contribuir

Las contribuciones son bienvenidas:

1. Fork del proyecto
2. Crear rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👥 Autores

- **Esteban Escudero** - [esteban-escudero](https://github.com/esteban-escudero)

## 📧 Contacto

Para preguntas o sugerencias:
- Email: soporte.mapa@ucn.cl
- Web: [www.ucn.cl](https://www.ucn.cl)

## 📚 Glosario

Para una definición detallada de los términos técnicos utilizados en este proyecto, consulta nuestro [Glosario Técnico](GLOSSARY.md).


---

**Universidad Católica del Norte - Campus Coquimbo**  
Sistema de Mapa Interactivo PWA  
Última actualización: Diciembre 2025
