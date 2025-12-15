# 🚀 Guía de Despliegue - InteractiveMapUCN

Esta guía detalla los pasos para desplegar la aplicación en un entorno de producción (Linux/Ubuntu).

## 📋 Requisitos Previos

- Servidor VPS (Ubuntu 20.04/22.04 LTS recomendado)
- Dominio configurado apuntando a la IP del servidor
- Docker y Docker Compose (Opción A)
- Node.js 18+, PostgreSQL 15+, Nginx, PM2 (Opción B)

---

## 🏗️ Opción A: Despliegue con Docker (Recomendado)

Esta es la forma más sencilla de levantar todo el stack.

### 1. Clonar y Configurar
```bash
git clone https://github.com/esteban-escudero/InteractiveMapUCN.git
cd InteractiveMapUCN
cp backend/.env.example backend/.env
# Editar variables en .env
nano backend/.env
```

### 2. Construir y Levantar Contenedores
```bash
docker-compose up -d --build
```
Esto levantará:
- Contenedor de Base de Datos (PostGIS)
- Contenedor Backend API
- Contenedor Frontend (Servidor de desarrollo o build estático según configuración)

### 3. Verificar Estado
```bash
docker-compose ps
```

---

## 🛠️ Opción B: Despliegue Manual (Native)

Para mayor control y rendimiento en servidores dedicados.

### 1. Base de Datos (PostgreSQL + PostGIS)

Instalar PostgreSQL y la extensión PostGIS:
```bash
sudo apt update
sudo apt install postgresql-15 postgresql-15-postgis-3
```

Crear base de datos y usuario:
```bash
sudo -u postgres psql
postgres=# CREATE DATABASE interactive_map;
postgres=# CREATE USER admin WITH ENCRYPTED PASSWORD 'mypassword';
postgres=# GRANT ALL PRIVILEGES ON DATABASE interactive_map TO admin;
postgres=# \c interactive_map
postgres=# CREATE EXTENSION postgis;
postgres=# \q
```

### 2. Backend (Node.js + PM2)

Instalar Node.js y PM2:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

Configurar API:
```bash
cd InteractiveMapUCN/backend
npm install --production
cp .env.example .env
# Configurar DB_HOST, DB_USER, etc.
```

Iniciar con PM2:
```bash
pm2 start server.js --name "map-api"
pm2 save
pm2 startup
```

### 3. Frontend (React Build + Nginx)

Construir la aplicación:
```bash
cd ../frontend
npm install
# Asegurar que REACT_APP_API_URL apunte a tu dominio de producción en .env
npm run build
```

Mover build a directorio web:
```bash
sudo mkdir -p /var/www/interactive-map
sudo cp -r build/* /var/www/interactive-map/
```

### 4. Configuración de Nginx (Reverse Proxy)

Crear configuración de sitio:
`sudo nano /etc/nginx/sites-available/interactive-map`

```nginx
server {
    listen 80;
    server_name mapa.tudominio.cl;

    root /var/www/interactive-map;
    index index.html;

    # Frontend (SPA Support)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API Proxy
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Activar sitio y reiniciar Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/interactive-map /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 5. SSL (HTTPS)

Usar Certbot para certificados gratuitos:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d mapa.tudominio.cl
```

## 🔄 Procedimiento de Actualización

Para actualizar el código en producción:

```bash
# Bajar cambios
git pull origin main

# Backend
cd backend
npm install
pm2 restart map-api

# Frontend
cd ../frontend
npm install
npm run build
sudo cp -r build/* /var/www/interactive-map/
```
