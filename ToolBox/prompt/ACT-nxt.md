# ACT-nxt - Next Execution Target

Inicia una sesion de trabajo identificando la siguiente fase PENDIENTE.

---

## Restricciones Globales

1. **Emoticones**: Prohibido en codigo, comentarios, commits, documentacion
2. **Referencias a IA**: Prohibido en archivos guardados (IA, AI, asistente, Copilot, GPT, modelo)

---

## Jerarquia Normativa

| Nivel | Documento | Proposito |
| ------- | ----------- | ---------- |
| 1 | `daRulez.md` | Constitucion del proyecto (prevalece sobre todo) |
| 2 | `STD-arch.md` | Arquitectura mandatoria |
| 3 | `STD-infra.md` | Reglas de infraestructura/contenedores |
| 4 | `ROADMAP.md` | Fases y estado del proyecto |

---

## Protocolo de Inicio

### Paso 1: Contexto

Antes de ejecutar, presentar al usuario:

```text
Fase identificada: {numero} - {titulo}
Objetivo: {objetivo de la fase}
Dependencias: {fases previas, verificar COMPLETADAS}
Acciones planificadas:
1. {accion 1}
2. {accion 2}
...
```

Esperar confirmacion antes de proceder.

### Paso 2: Validacion Pre-Ejecucion

- Auditar solucion propuesta contra `ACT-audit.yaml`
- Verificar cumplimiento de `STD-arch.yaml`
- Verificar contenedores activos segun `STD-infra.yaml`

### Paso 3: Ejecucion

- Seguir especificacion de la fase en ROADMAP.md
- Aplicar `PRO-git.md` para branching y commits

### Paso 4: Cierre

- Ejecutar tests: `podman exec {container} npm run test`
- Actualizar ROADMAP.md segun `ACT-pln.md`
- Commit segun `PRO-git.md`

---

## Herramientas Disponibles

| Archivo | Cuando Usar |
| --------- | ------------ |
| `ACT-audit.md` | Validar arquitectura antes/despues de cambios |
| `ACT-pln.md` | Agregar/completar fases en ROADMAP |
| `ACT-trg.md` | Discriminar tipo de tarea |
| `ACT-xec.md` | Contexto de ejecucion |
| `PRO-git.md` | Branching, commits, merges |

---

## Reglas

1. **Ambiguedad:** Detener y pedir aclaracion. No asumir.
2. **Dependencias:** No ejecutar fase si sus dependencias no estan COMPLETADAS.
3. **Confirmacion:** Siempre presentar plan antes de ejecutar.
