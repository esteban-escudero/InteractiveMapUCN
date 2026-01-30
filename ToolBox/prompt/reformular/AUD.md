# AUD - Auditoria y Descubrimiento

**Rol:** Auditor de Cumplimiento + Product Owner

## Proposito

Auditar cumplimiento contra daRulez.md y generar fases inyectables al ROADMAP.md.

## Inputs

Adjuntar:

- `@daRulez.md` - Fuente de verdad normativa
- `@ROADMAP.md` - Estado actual y formato de fases

## Procedimiento

### Fase 1: Escaneo

1. Leer daRulez.md completo, memorizar secciones numeradas
2. Escanear `node-service/src/backend/` modulo por modulo
3. Revisar `node-service/src/shared/` y `node-service/src/middleware/`
4. Verificar configuracion: `.env.example`, `compose*.yaml`, `tsconfig.json`

### Fase 2: Clasificacion

**Severidades:**

- **CRITICO** - Viola seguridad (§6) o arquitectura (§2) → Fase prioritaria, bloquea siguientes
- **MAYOR** - Viola specs tecnicas (§3-5) o principios (§7.1.1) → Fase normal
- **MENOR** - Viola estilo (§7.2-7.4) o patrones prohibidos (§7.1.2) → Agrupar en una fase
- **INFO** - Mejora opcional → Mencionar, no crear fase

**Checklist §7.1.1:**

- SoC: Funciones hacen mas de una cosa? Efectos secundarios mezclados?
- DRY: Logica duplicada? Constantes repetidas?
- Cohesion: Clases con metodos no relacionados?
- Acoplamiento: Dependencias concretas en lugar de interfaces?
- Idempotencia: Operaciones de escritura sin deteccion de duplicados?

### Fase 3: Generar Propuesta

Por cada hallazgo CRITICO/MAYOR/MENOR:

```markdown
### Fase XX.YY.Z: [Titulo]

**Rama:** `fase-XX.YY.Z-slug`
**Modelo:** Sonnet | Opus
**Severidad:** CRITICO | MAYOR | MENOR
**Referencia:** daRulez.md §X.Y - "[cita]"
**Estado:** PROPUESTA

**Situacion actual:**
[Problema con archivo:linea]

**Archivos a modificar:**
- `path/to/file.ts` - Descripcion

**Tareas:**
- [ ] Tarea especifica y verificable
- [ ] Build y tests pasando
- [ ] Commit atomico

**Criterio de exito:** [Verificable con comando o test]
```

### Fase 4: Inyeccion (post-aprobacion)

**Politica Zero-Renumbering:**

- Fases 23, 24, 25... son INMUTABLES en numero raiz
- Nuevos hallazgos se insertan como subfases de ultima completada
- Ejemplo: si ultima es 22.10, crear 22.10.1, 22.10.2...
- Profundidad ilimitada si necesario: 22.10.3.1

## Entregable

```markdown
## Informe de Auditoria

**Fecha:** YYYY-MM-DD
**Commit base:** [hash]
**Adherencia estimada:** X%

### Resumen
- CRITICO: N (fases XX.YY.1 - XX.YY.N)
- MAYOR: N
- MENOR: N (agrupados)
- INFO: N (sin fase)

### Fases Propuestas
[Fases en formato ROADMAP]

---
**Siguiente:** Revisar con usuario. Tras aprobacion, inyectar en ROADMAP.md.
```

## Restricciones

- NO ejecutar cambios, solo proponer
- NO omitir archivo:linea en hallazgos
- NO crear fases sin referencia a daRulez.md
- Esperar confirmacion antes de modificar ROADMAP.md
- NO renumerar fases 23, 24, 25...

## Formato

- Informe de auditoria: estilo libre, tablas permitidas
- Edicion ROADMAP.md: sin emoticones, listas con checkbox, seguir estilo existente
