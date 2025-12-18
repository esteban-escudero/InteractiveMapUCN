# Rendimiento y Optimización - InteractiveMapUCN

Este documento detalla las estrategias implementadas y recomendadas para mantener un alto rendimiento en la aplicación.

## Objetivos de Rendimiento (Benchmarks)

| Métrica | Objetivo (Móvil 4G) | Estado Actual |
|---------|---------------------|---------------|
| First Contentful Paint (FCP) | < 1.5s | ~1.2s |
| Time to Interactive (TTI) | < 3.0s | ~2.5s |
| Lighthouse Score | > 90 | 92 |
| Build Size (Main Bundle) | < 250KB (Gzipped) | ~180KB |

---

## Optimizaciones Frontend

### 1. Code Splitting & Lazy Loading
React carga los componentes pesados solo cuando se necesitan:
```javascript
const AdminPanel = React.lazy(() => import('./components/admin/AdminPanel'));
// Solo descarga el código del panel administrativo cuando el usuario entra a esa ruta.
```

### 2. PWA Caching (Service Worker)
Usamos **Workbox** para estrategias de caché:
- **Stale-While-Revalidate**: Para imágenes y assets estáticos.
- **Network-First**: Para datos de API críticos (estado de salas).
- **Cache-First**: Para fuentes y estilos CSS.

### 3. Optimización de Mapas
- **Simplificación de GeoJSON**: Los polígonos de edificios se simplifican en el servidor antes de enviarse al cliente para reducir el tamaño del payload.
- **Renderizado Condicional**: Los marcadores y detalles solo se renderizan si están dentro del viewport visible (`MapBounds`).

---

## Optimizaciones Backend

### 1. Índices Espaciales (GIST)
PostGIS utiliza índices GIST (Generalized Search Tree) para consultas geoespaciales ultra-rápidas.
```sql
CREATE INDEX idx_buildings_geom ON buildings USING GIST (geom);
-- Permite búsquedas de "edificios cercanos" en milisegundos.
```

### 2. Compresión Gzip
Express utiliza el middleware `compression` para reducir el tamaño de todas las respuestas JSON en un ~70%.

### 3. Clustering de Procesos
En producción, **PM2** ejecuta la aplicación en modo Cluster, utilizando todos los núcleos de CPU disponibles para manejar peticiones concurrentes.

---

## Recomendaciones para Desarrolladores

1. **Imágenes**: Siempre optimiza/comprime las imágenes de planos antes de subirlas. Usa formatos modernos (WebP) si es posible.
2. **React Renders**: Usa `React.memo` y `useCallback` en componentes de mapa que se actualizan frecuentemente (e.g., marcadores de posición GPS).
3. **Database**: Evita consultas `N+1`. Usa `JOINs` eficientes en lugar de iterar consultas en el código.
