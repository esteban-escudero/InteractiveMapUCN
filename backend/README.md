# Backend - InteractiveMapUCN

API REST desarrollada con Express.js y PostgreSQL para gestionar edificios, salas y rutas del campus UCN.

## Inicio Rápido

### Instalación

```bash
npm install
```

### Configuración

1. Copiar `.env.example` a `.env`
2. Configurar las variables de entorno necesarias
3. Asegurarse de que PostgreSQL esté corriendo

### Ejecución

```bash
# Desarrollo (con nodemon)
npm run dev

# Producción
npm start
```

## Estructura

```
backend/
├── config/          # Configuración
│   ├── app.js       # Configuración centralizada
│   └── database.js  # Conexión a PostgreSQL
│
├── controllers/     # Controladores HTTP
├── models/          # Modelos de datos
├── routes/          # Rutas API
├── middleware/      # Middlewares
├── services/        # Lógica de negocio
└── utils/           # Utilidades
```

## Endpoints

Ver [README.md](../README.md) para la lista completa de endpoints.

## Tecnologías

- **Express.js**: Framework web
- **PostgreSQL**: Base de datos relacional
- **PostGIS**: Extensión geoespacial
- **Turf.js**: Análisis geoespacial
- **pg**: Cliente PostgreSQL

## Variables de Entorno

Ver `.env.example` para la lista completa de variables.

## Testing

```bash
npm test
```

## Documentación

Para más información sobre la arquitectura, ver [ARCHITECTURE.md](../ARCHITECTURE.md).

