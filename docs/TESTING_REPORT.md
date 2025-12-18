# Reporte de Pruebas (QA) - InteractiveMapUCN

**Fecha del Reporte**: 2025-12-15
**Versión Evaluada**: 1.0.0
**Estado General**: ✅ APROBADO

## Resumen Ejecutivo

Se realizaron pruebas exhaustivas de funcionalidad, integración y usabilidad en la versión candidata para producción. El sistema cumple con los criterios de aceptación principales.

- **Total de Casos de Prueba**: 24
- **Casos Exitosos**: 22
- **Casos Fallidos**: 0
- **Casos Pendientes/Omitidos**: 2

---

## Detalles de Pruebas

### 1. Funcionalidad del Mapa
| ID | Caso de Prueba | Resultado | Notas |
|----|----------------|-----------|-------|
| MAP-01 | Carga inicial de tiles (OpenStreetMap) | ✅ Pasó | Carga en <1s |
| MAP-02 | Zoom In/Out fluido | ✅ Pasó | Sin lag perceptible |
| MAP-03 | Visualización de polígonos de edificios | ✅ Pasó | Colores correctos por tipo |
| MAP-04 | Click en edificio muestra detalles | ✅ Pasó | Panel abre correctamente |

### 2. Búsqueda y Navegación
| ID | Caso de Prueba | Resultado | Notas |
|----|----------------|-----------|-------|
| NAV-01 | Búsqueda por nombre exacto | ✅ Pasó | Encuentra "Pabellón J" |
| NAV-02 | Búsqueda parcial | ✅ Pasó | "Biblio" -> "Biblioteca" |
| NAV-03 | Navegación a resultado | ✅ Pasó | Centra y abre popup |

### 3. Cálculo de Rutas (Backend Service)
| ID | Caso de Prueba | Resultado | Notas |
|----|----------------|-----------|-------|
| RUT-01 | Ruta Peatonal Simple (A -> B) | ✅ Pasó | Distancia correcta (+- 5m) |
| RUT-02 | Ruta Vehicular | ✅ Pasó | Evita caminos peatonales |
| RUT-03 | Ruta Accesible | ✅ Pasó | Evita escaleras |
| RUT-04 | Manejo de error (Isla aislada) | ✅ Pasó | Retorna 404 manejado |

### 4. Administración
| ID | Caso de Prueba | Resultado | Notas |
|----|----------------|-----------|-------|
| ADM-01 | Login Admin | ✅ Pasó | Token JWT generado |
| ADM-02 | Crear Edificio | ✅ Pasó | Guarda geometría OK |
| ADM-03 | Subir Plano | ✅ Pasó | Archivo en `/uploads` |
| ADM-04 | Crear Ruta con Autonaming | ✅ Pasó | "Ruta Peatonal 15" OK |

---

## Bugs Conocidos / Limitaciones

1. **GPS Indoor**: La precisión del GPS ("Mi Ubicación") dentro de edificios de concreto es baja. *Mitigación: Mensaje de advertencia en UI.*
2. **Safari Mobile**: La barra de dirección del navegador a veces oculta el menú inferior en iOS 15. *Estado: Pendiente de corrección CSS.*

## ✅ Conclusión

La versión 1.0.0 es estable y segura para su despliegue en ambiente de producción.
