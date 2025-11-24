# 🗺️ Mapa Interactivo UCN

Sistema de mapeo interactivo para la Universidad Católica del Norte (UCN) que permite la navegación y búsqueda de ubicaciones dentro del campus universitario mediante Progressive Web App (PWA).

## 📋 Descripción del Proyecto

**InteractiveMapUCN** es una **Progressive Web App (PWA)** de tipo **Sistema de Información Geográfica (SIG/GIS) Web** diseñada para facilitar la orientación y navegación dentro del campus de la UCN. Los usuarios acceden escaneando códigos QR distribuidos por el campus, sin necesidad de instalación de aplicaciones nativas.

### Tipo de Proyecto
- **Categoría**: Sistema de Información Geográfica (SIG/GIS) Web
- **Arquitectura**: Progressive Web App (PWA) Full-Stack
- **Dominio**: Educación Superior / Campus Universitario
- **Acceso**: Vía QR Code → Navegador Web
- **Complejidad**: Medio-Alto

### Propósito
- Orientación en campus universitario
- Búsqueda de ubicaciones (edificios, salas, servicios)
- Geolocalización en tiempo real
- Navegación asistida con cálculo de rutas desde ubicación actual
- Localización de servicios cercanos
- Acceso instantáneo sin instalación

## ✨ Características Principales

- 🗺️ **Mapa Interactivo**: Visualización del campus usando Leaflet con capas personalizadas
- 📱 **PWA**: Funciona como app nativa, instalable, con soporte offline
- 📲 **Acceso vía QR**: Escaneo de códigos QR para acceso instantáneo
- 🔍 **Búsqueda de Ubicaciones**: Encuentra edificios, salas y puntos de interés
- � **Geolocalización GPS**: Muestra tu ubicación actual en el mapa con marcador animado
- 🧭 **Navegación desde Mi Ubicación**: Calcula rutas desde tu posición actual al destino
- �🛣️ **Cálculo de Rutas Inteligente**: Generación de rutas óptimas con algoritmo de Dijkstra
- 🎯 **Servicios de Proximidad**: Encuentra servicios cercanos a una ubicación
- 🔐 **Sistema de Autenticación**: Login y registro de usuarios (panel admin)
- 🏢 **Gestión de Edificios y Salas**: CRUD completo de edificios y salas
- 📊 **API RESTful**: Backend robusto con endpoints documentados
- 🌐 **Acceso Público**: Vista de usuario sin autenticación requerida

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** + **Express**: Framework del servidor
- **PostgreSQL**: Base de datos relacional con soporte PostGIS
- **PostGIS**: Extensión geoespacial para PostgreSQL
- **JWT**: Autenticación basada en tokens
- **Turf.js**: Análisis geoespacial y cálculo de rutas
- **bcryptjs**: Encriptación de contraseñas
- **PM2**: Process manager para producción

### Frontend
- **React**: Biblioteca de interfaz de usuario
- **PWA**: Service Workers, Web App Manifest
- **Leaflet**: Librería de mapas interactivos
- **Turf.js**: Procesamiento de datos geoespaciales
- **CSS**: Estilos personalizados responsive

### Infraestructura
- **Nginx**: Reverse proxy y servidor web
- **Let's Encrypt**: Certificados SSL gratuitos
- **Docker**: Contenedorización (desarrollo)
- **Servidor UCN**: Infraestructura universitaria (producción)

## 🏗️ Arquitectura de Deployment

### Producción (Infraestructura UCN)

```
┌─────────────────────────────────────────────────────────┐
│              USUARIOS (Campus UCN)                       │
│       📱 Escanean QR → Acceden vía navegador            │
└────────────────────────┬────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────┐
│              DNS UCN: mapa.ucn.cl                        │
│            (Gestionado por TI UCN)                       │
└────────────────────────┬────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────┐
│          SERVIDOR WEB UCN (Nginx)                        │
│              SSL: Let's Encrypt                          │
├─────────────────────────────────────────────────────────┤
│  Frontend (PWA)         │      Backend API               │
│  - React Build          │      - Node.js + Express       │
│  - Service Worker       │      - PM2 Process Manager     │
│  - /var/www/mapa       │      - Puerto: 5000            │
└────────────────────────┬────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────┐
│       SERVIDOR BD UCN (PostgreSQL + PostGIS)             │
│              Puerto: 5432                                │
└─────────────────────────────────────────────────────────┘
```

### Sistema de QR Codes

```
QR General (entrada principal):
https://mapa.ucn.cl/

QR por Edificio:
https://mapa.ucn.cl/map?building=edificio-a

QR por Piso:
https://mapa.ucn.cl/map?building=edificio-a&floor=2

QR para Servicios:
https://mapa.ucn.cl/map?poi=biblioteca-central

QR para Rutas:
https://mapa.ucn.cl/route?to=sala-101
```

## 📦 Requisitos Previos

### Desarrollo Local
- **Node.js** (v14 o superior)
- **npm** (v6 o superior)
- **PostgreSQL** (v12 o superior) con extensión **PostGIS**
- **Docker** y **Docker Compose** (opcional)

### Producción (Servidor UCN)
- **Ubuntu Server** 22.04 LTS o similar
- **Nginx** (reverse proxy)
- **Node.js** 18+ y **PM2**
- **PostgreSQL** 15+ con **PostGIS**
- **Certbot** (Let's Encrypt SSL)
- **Acceso SSH** al servidor
- **Subdominio**: mapa.ucn.cl

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

Crear archivo `.env`:

```env
# Servidor
PORT=5000
NODE_ENV=development

# Base de Datos
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=admin
DB_NAME=InteractiveMapDB

# JWT
JWT_SECRET=tu_clave_secreta_aqui
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Límites
JSON_LIMIT=10mb
```

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

### Deployment en Producción (Servidor UCN)

#### 1. Requisitos del Servidor

**Solicitar a TI UCN**:
- Servidor/VM Ubuntu Server
- Acceso a PostgreSQL con PostGIS
- Subdominio: mapa.ucn.cl
- Acceso SSH
- Puertos 80/443 abiertos

#### 2. Configuración del Servidor

```bash
# Instalar dependencias
sudo apt update
sudo apt install -y nginx nodejs npm postgresql-client git

# Instalar PM2
sudo npm install -g pm2

# Instalar Certbot (SSL)
sudo apt install -y certbot python3-certbot-nginx
```

#### 3. Clonar y Configurar

```bash
# Clonar repositorio
cd /var/www
sudo git clone https://github.com/esteban-escudero/InteractiveMapUCN.git mapa-ucn
cd mapa-ucn

# Backend
cd backend
npm install
# Crear .env con configuración de producción

# Frontend
cd ../frontend
npm install
npm run build
```

#### 4. Configurar PM2

```bash
cd /var/www/mapa-ucn/backend
pm2 start server.js --name "mapa-ucn-api"
pm2 startup
pm2 save
```

#### 5. Configurar Nginx

Crear `/etc/nginx/sites-available/mapa.ucn.cl`:

```nginx
server {
    listen 80;
    server_name mapa.ucn.cl;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mapa.ucn.cl;

    ssl_certificate /etc/letsencrypt/live/mapa.ucn.cl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mapa.ucn.cl/privkey.pem;

    # Frontend
    location / {
        root /var/www/mapa-ucn/frontend/build;
        try_files $uri $uri/ /index.html;
        add_header Service-Worker-Allowed /;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Activar sitio
sudo ln -s /etc/nginx/sites-available/mapa.ucn.cl /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Obtener certificado SSL
sudo certbot --nginx -d mapa.ucn.cl
```

#### 6. Configurar Base de Datos

```sql
-- En servidor PostgreSQL UCN
CREATE DATABASE InteractiveMapDB;
\c InteractiveMapDB
CREATE EXTENSION postgis;
CREATE USER mapa_ucn_user WITH PASSWORD 'contraseña_segura';
GRANT ALL PRIVILEGES ON DATABASE InteractiveMapDB TO mapa_ucn_user;
```

## 📁 Estructura del Proyecto

```
InteractiveMapUCN/
├── backend/                 # Servidor Node.js + Express
│   ├── config/             # Configuración de la aplicación y BD
│   ├── controllers/        # Lógica de controladores
│   ├── middleware/         # Middlewares (auth, errores, etc.)
│   ├── models/             # Modelos de datos
│   ├── routes/             # Definición de rutas API
│   ├── services/           # Servicios de negocio
│   ├── utils/              # Utilidades y helpers
│   └── server.js           # Punto de entrada del servidor
├── frontend/               # Aplicación React (PWA)
│   ├── public/             # Archivos estáticos
│   │   └── manifest.json   # Web App Manifest
│   └── src/
│       ├── components/     # Componentes React
│       ├── contexts/       # Contextos de React
│       ├── hooks/          # Custom hooks
│       ├── services/       # Servicios API
│       └── utils/          # Utilidades
├── database/               # Scripts de base de datos
├── scripts/                # Scripts de utilidad
├── docker-compose.yaml     # Configuración de Docker
└── README.md              # Este archivo
```

## 🔌 API Endpoints Principales

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
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

### Rutas
- `GET /api/routes` - Obtener todas las rutas
- `POST /api/routes/calculate` - Calcular ruta entre dos puntos

### Proximidad
- `POST /api/proximity/nearby` - Encontrar servicios cercanos

### Espacial
- `POST /api/spatial/point-in-polygon` - Verificar si un punto está dentro de un polígono

### Health Check
- `GET /api/health` - Verificar estado del servidor

## 🔄 Workflow de Deployment

```bash
# 1. Desarrollo local
git add .
git commit -m "Nueva feature"
git push origin main

# 2. En servidor UCN
cd /var/www/mapa-ucn
git pull origin main

# 3. Actualizar backend
cd backend
npm install
pm2 restart mapa-ucn-api

# 4. Actualizar frontend
cd ../frontend
npm install
npm run build
sudo systemctl reload nginx
```

## 📊 Monitoreo

```bash
# Estado del backend
pm2 status
pm2 logs mapa-ucn-api

# Estado de Nginx
sudo systemctl status nginx
sudo tail -f /var/log/nginx/mapa-ucn-access.log

# Estado de PostgreSQL
sudo systemctl status postgresql
```

## 🧪 Testing

```bash
# Backend
cd backend
npm test

# Frontend
cd frontend
npm test
```

## 💰 Costos

**Producción**: **$0** (infraestructura UCN)
- Servidor UCN (proporcionado por TI)
- PostgreSQL UCN (proporcionado por TI)
- Dominio mapa.ucn.cl (institucional)
- SSL Let's Encrypt (gratuito)

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

Para preguntas o sugerencias, por favor abre un issue en el repositorio.

---

**Universidad Católica del Norte** - Sistema de Mapa Interactivo PWA
