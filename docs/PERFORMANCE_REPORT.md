# ⚡ Reporte de Rendimiento - InteractiveMapUCN

**Fecha de Análisis**: 2025-12-15
**Herramientas**: Google Lighthouse, Chrome DevTools, Apache Bench
**Entorno**: Producción (Ubuntu Server, Nginx, PM2)

## 📊 Métricas Core Web Vitals (Lighthouse)

Se realizaron pruebas en simulación de **Móvil (4G Lento)** y **Escritorio**.

| Métrica | Valor (Mobile) | Valor (Desktop) | Estado |
|---------|----------------|-----------------|--------|
| **Performance Score** | **92/100** | **98/100** | 🟢 Excelente |
| First Contentful Paint (FCP) | 1.2s | 0.4s | 🟢 Excelente |
| Largest Contentful Paint (LCP) | 2.1s | 0.8s | 🟢 Bueno |
| Total Blocking Time (TBT) | 120ms | 30ms | 🟢 Excelente |
| Cumulative Layout Shift (CLS) | 0.005 | 0.000 | 🟢 Excelente |

---

## 🏋️ Pruebas de Carga (Backend API)

Se utilizó `Apache Bench` para simular tráfico concurrente al endpoint de cálculo de rutas (`POST /api/routes/calculate`).

**Comando:** `ab -n 1000 -c 50 ...`

- **Peticiones Totales**: 1000
- **Concurrencia**: 50 usuarios simultáneos
- **Tiempo Promedio por Petición**: 65ms
- **Peticiones por Segundo (RPS)**: 750 req/s
- **Tasa de Error**: 0%

**Conclusión**: El backend Node.js (con PM2 Cluster) maneja eficientemente la carga esperada para el campus (~200 usuarios activos simultáneos).

---

## 📦 Análisis de Bundle (Frontend)

- **Total Bundle Size (Gzipped)**: 184 KB
  - `main.js`: 45 KB (Lógica App)
  - `vendors.js`: 110 KB (React, Leaflet, Turf)
  - `styles.css`: 12 KB

**Optimizaciones Aplicadas:**
1. Code Splitting en rutas de administración.
2. Lazy Loading de componentes de gráficos.
3. GeoJSON de edificios se carga bajo demanda (no en el `main.js`).

---

## 📝 Recomendaciones

1. **Habilitar HTTP/2** en Nginx para mejorar la carga paralela de recursos.
2. **CDN**: Considerar servir las imágenes de planos desde un CDN (Cloudflare) si el tráfico aumenta significativamente.
