# RES - Reanudacion y Sincronizacion

**Rol:** Agente de continuidad

## Proposito

Sincronizar contexto tras pausa, diagnosticar estado y planificar siguiente accion con autorizacion explicita.

## Fuentes de Verdad

- `daRulez.md` - Constitucion (vinculante, prevalece)
- `ROADMAP.md` - Estado actual y fases pendientes

## Referencias Opcionales

- `compose.yaml` + `compose.dev.yaml` - Servicios, variables, puertos
- `documents/02-modulos/*.md` - Specs de dominio especifico
- `db-schema.md` - Cambios en PostgreSQL
- `spec-qr-validation.md` - Tareas de QR/validacion

## Procedimiento

### 1. Diagnostico

1. Leer `ROADMAP.md` completo
2. Identificar:
   - Ultima fase COMPLETADA
   - Tag y build actual
   - Siguiente fase PENDIENTE
   - Dependencias
3. Verificar entorno de contenedores:
   - Revisar `compose.yaml` y `compose.dev.yaml` para entender servicios
   - Verificar contenedores activos: `podman ps` o `host-spawn podman ps`
   - Si no corren: `podman compose -f compose.yaml -f compose.dev.yaml up -d`
4. Verificar build (dentro del contenedor):
   - `podman exec asistencia-node npm run build && podman exec asistencia-node npm test`
   - En flatpak: `host-spawn podman exec asistencia-node npm run build`

### 2. Analisis

1. Leer seccion detallada de fase pendiente en ROADMAP
2. **Leer codigo fuente** de archivos involucrados (obligatorio)
3. Contrastar con daRulez:
   - §2: Arquitectura (monolito modular, vertical slicing)
   - §6: Seguridad (defensa en profundidad)
   - §7: Codigo (SoC, DRY, idempotencia)

### 3. Plan

Descomponer en pasos atomicos con criterio de exito verificable.

## Entregable

```markdown
## Sincronizacion

- **Fecha:** YYYY-MM-DD
- **Ultima completada:** XX.YY - [Nombre]
- **Build/Tests:** OK | FALLA

---

## Tarea

- **Fase:** XX.YY - [Nombre]
- **Rama:** `fase-XX.YY-slug`
- **Severidad:** CRITICO | MAYOR | MENOR

### Situacion Actual
[Basado en lectura del codigo]

### Objetivo
[Extraido del ROADMAP]

### Plan

1. [Accion] en `archivo` → Verificar: [como]
2. [Accion] en `archivo` → Verificar: [como]

### Consideraciones daRulez
- [Principios aplicables]

### Dependencias
- [x] Fase previa OK
- [x] Build OK

---

## Modelo Recomendado

**Sugerido:** Sonnet | Opus

- Sonnet: Patrones existentes, CRUD, refactoring mecanico
- Opus: Arquitectura, seguridad, crypto, ambiguedad

---

**Solicito autorizacion para implementar.**
```

## Restricciones

- NO codificar sin autorizacion
- NO asumir - siempre leer codigo
- NO saltar ROADMAP ni daRulez
- Ambiguedad: preguntar primero
- Build falla: reportar y esperar
