# 💻 Guía de Desarrollo - InteractiveMapUCN

Esta guía detalla cómo configurar un entorno de desarrollo local para contribuir al proyecto.

## 📋 Requisitos Previos

Asegúrate de tener instalado:
- **Node.js**: v18.17.0 o superior (LTS recomendado).
- **npm**: v9.0.0 o superior (incluido con Node).
- **Git**: Para control de versiones.
- **PostgreSQL**: v15 o superior.
- **PostGIS**: Extensión espacial para PostgreSQL.
- **VS Code**: Editor recomendado con extensiones (ESLint, Prettier).

---

## ⚙️ Configuración del Entorno

### 1. Clonar Repositorio
```bash
git clone https://github.com/esteban-escudero/InteractiveMapUCN.git
cd InteractiveMapUCN
```

### 2. Configurar Base de Datos
Tienes dos opciones:

**Opción A: Docker (Recomendado)**
```bash
docker-compose up -d db
```

**Opción B: Local Manual**
```sql
CREATE DATABASE interactive_map_dev;
\c interactive_map_dev
CREATE EXTENSION postgis;
```

### 3. Configurar Backend
```bash
cd backend
npm install
cp .env.example .env
```
Edita `.env` con tus credenciales de base de datos locales.

### 4. Configurar Frontend
```bash
cd ../frontend
npm install
```

---

## ▶️ Ejecutar en Desarrollo

Para trabajar, normalmente necesitarás 2 terminales abiertas:

**Terminal 1: Backend**
```bash
cd backend
npm run dev
# Corre en http://localhost:3001
```

**Terminal 2: Frontend**
```bash
cd frontend
npm start
# Corre en http://localhost:3000
```

---

## 📂 Estructura de Directorios Clave

```
interactive-map-ucn/
├── backend/
│   ├── src/controllers/   # Lógica de endpoints
│   ├── src/models/        # Consultas SQL y modelos DB
│   └── src/services/      # Lógica de negocio (Dijkstra, etc.)
├── frontend/
│   ├── src/components/    # Componentes React
│   ├── src/hooks/         # Custom Hooks
│   └── src/contexts/      # Estado global
└── docs/                  # Documentación
```

## 📏 Estándares de Código (Linting)

El proyecto usa ESLint y Prettier. Antes de hacer commit, corre:

```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```
