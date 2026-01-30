# ACT-pln - Planificador de Fases

Transforma issues/bugs en fases ejecutables para el Roadmap.

---

## Restricciones Globales

1. **Emoticones**: Prohibido en codigo, comentarios, commits, documentacion
2. **Referencias a IA**: Prohibido en archivos guardados (IA, AI, asistente, Copilot, GPT, modelo)

---

## Protocolo

### A. Auditoria Normativa

Validar viabilidad contra `STD-arch.yaml`.

- Si requiere violar arquitectura: Rechazar o reformular.

### B. Clasificacion

| Severidad | Criterio | Prioridad |
| ----------- | ---------- | ---------- |
| CRITICO | Sistema inoperable o brecha seguridad | Inmediata |
| MAYOR | Degradacion funcional o violacion arquitectonica | Alta |
| MENOR | Deuda tecnica, estilo, UX | Cola |
| TRIVIAL | Typos | Descartar |

### C. Sistema de Numeracion

Permite insertar fases prioritarias descubiertas posteriormente sin renumerar.

| Situacion | Accion | Ejemplo |
| ----------- | -------- | -------- |
| Nueva funcionalidad independiente | `X.(Y+1)` | 24.6 a 24.7 |
| Sub-fase o correccion | `X.Y.(Z+1)` | 24.6.1 a 24.6.1.1 |
| Prioridad intermedia | Insertar entre existentes | 24.6.1.1 entre 24.6.1 y 24.6.2 |

### D. Inyeccion en Roadmap

Tras autorizacion, actualizar en orden:

1. **Tabla Resumen** - Fila en posicion numerica
2. **Diagrama Orden de Ejecucion** - Nodo con color y conexiones
3. **Tabla Proxima Accion** - Segun urgencia (ver E)
4. **Fases en Detalle** - Bloque tras fase precedente

### E. Ordenamiento en Proxima Accion

| Prioridad | Criterio | Posicion |
| ----------- | ---------- | ---------- |
| 1 (mas alta) | Bloquea a otras fases | Arriba |
| 2 | Dependencia directa de fase urgente | Siguiente |
| 3 | Sin dependientes, igual urgencia | Orden numerico |
| 4 (mas baja) | Mejoras opcionales | Final |

---

## Operaciones

### Agregar Fase Nueva

1. Determinar numero segun C
2. Validar contra STD-arch.yaml
3. Verificar que no afecte dependencias existentes
4. Aplicar D (4 actualizaciones en Roadmap)
5. Ordenar en Proxima Accion segun E

### Completar Fase

1. Estado: PENDIENTE a COMPLETADA (con fecha)
2. Agregar hash de commit
3. Marcar checkboxes de Criterio de Exito
4. Mover de Proxima Accion a Fases Completadas

---

## Plantilla de Fase

```markdown
### Fase {NUMERO}: {TITULO}

**Objetivo:** {1 linea}
**Tipo:** BUG | FEATURE | REFACTOR
**Severidad:** CRITICO | MAYOR | MENOR
**Rama:** `fase-{numero}-{slug}`
**Estado:** PENDIENTE

**Situacion:**
- Actual: {comportamiento erroneo}
- Esperado: {comportamiento correcto}

**Scope:** {archivos/modulos}

**DoD:**
- [ ] {verificacion 1}
- [ ] {verificacion 2}
- [ ] Tests pasando

**Dependencias:** {fases previas requeridas}
```

---

## Restriccion

No modificar Roadmap sin autorizacion explicita.
