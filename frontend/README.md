# Frontend - InteractiveMapUCN

Aplicación React con Leaflet para visualización y gestión del mapa interactivo del campus UCN.

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
```

### Configuración

1. Copiar `.env.example` a `.env` (si es necesario)
2. Asegurarse de que el backend esté corriendo

### Ejecución

```bash
# Desarrollo
npm start

# Build para producción
npm run build
```

## 📁 Estructura

```
frontend/src/
├── components/      # Componentes React
│   ├── buildings/   # Componentes de edificios
│   ├── map/         # Componentes del mapa
│   ├── routes/      # Componentes de rutas
│   ├── shared/      # Componentes compartidos
│   └── ui/          # Componentes UI
│
├── hooks/           # Custom hooks
├── services/        # Servicios API
├── config/          # Configuración
├── constants/       # Constantes
└── utils/           # Utilidades
```

## 🗺️ Componentes Principales

- **Map**: Componente principal del mapa
- **BuildingForm**: Formulario de creación/edición de edificios
- **BuildingList**: Lista de edificios
- **RouteForm**: Formulario de creación de rutas
- **RouteNetwork**: Visualización de red de rutas

## 🛠️ Tecnologías

- **React**: Biblioteca UI
- **Leaflet**: Mapas interactivos
- **Turf.js**: Utilidades geoespaciales

## 📝 Variables de Entorno

- `REACT_APP_API_URL`: URL del backend API
- `REACT_APP_GEO_SERVER_URL`: URL de GeoServer
- `REACT_APP_GEO_SERVER_WORKSPACE`: Workspace de GeoServer

## 🧪 Testing

```bash
npm test
```

## 📚 Documentación

Para más información sobre la arquitectura, ver [ARCHITECTURE.md](../ARCHITECTURE.md).

