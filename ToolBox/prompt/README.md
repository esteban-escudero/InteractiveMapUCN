# Nomenclatura de Prompts

## Resumen

| Prefijo | Tipo | Proposito |
| --------- | ------ | ---------- |
| `STD-` | Standard | Reglas pasivas (leer y obedecer) |
| `PRO-` | Protocol | Flujos de trabajo (seguir pasos) |
| `ACT-` | Action | Disparadores ejecutables (iniciar tarea) |

---

## Formatos: MD y YAML

Cada documento existe en dos formatos:

| Formato | Publico | Caracteristicas |
| --------- | --------- | ----------------- |
| `.md` | Humanos | Prosa, tablas, ejemplos narrativos |
| `.yaml` | Automatizacion | Estructurado, parseable, validable |

**Contenido identico**: Mismas reglas, mismas restricciones, mismos valores, mismas excepciones. Si el YAML dice `emoticons: prohibited_everywhere`, el MD dice "Emoticones: Prohibido en codigo, comentarios, commits, documentacion".

**Forma distinta**: El YAML usa claves y estructuras anidadas; el MD usa encabezados, listas y tablas.

**Regla de sincronizacion**: Al modificar uno, actualizar el otro. Son espejos.

---

## Inventario Completo

### Grupo `ACT-` (Acciones / Prompts)

*Archivos para iniciar una tarea especifica.*

| Archivo | Descriptor | Proposito |
| --------- | ------------ | ---------- |
| `ACT-nxt.md` | Next Execution Target | Iniciar sesion, siguiente fase pendiente |
| `ACT-pln.md` | Planner | Agregar/completar fases en ROADMAP |
| `ACT-xec.md` | Execution Context | Contexto de ejecucion |
| `ACT-trg.md` | Triage | Discriminar tipo de tarea |
| `ACT-audit.md` | Audit | Validar arquitectura |

### Grupo `STD-` (Estandares / Normativa)

*Reglas duras e inmutables.*

| Archivo | Descriptor | Proposito |
| --------- | ------------ | ---------- |
| `STD-arch.md` | Architecture | Arquitectura mandatoria (Ports & Adapters) |
| `STD-infra.md` | Infrastructure | Contenedores y aislamiento |

### Grupo `PRO-` (Protocolos / Procedimientos)

*Guias de procesos paso a paso.*

| Archivo | Descriptor | Proposito |
| --------- | ------------ | ---------- |
| `PRO-git.md` | Git Workflow | Branching, commits, merges |
| `PRO-fix.md` | Fix Protocol | Hotfixes y correcciones urgentes |

---

## Jerarquia Normativa

```text
daRulez.md          <- Constitucion (nivel 1, prevalece)
  |
  +-- STD-arch.md   <- Arquitectura mandatoria (nivel 2)
  +-- STD-infra.md  <- Infraestructura (nivel 3)
  |
  +-- ROADMAP.md    <- Fases del proyecto (nivel 4)
```

---

## Restricciones Globales

### Prohibiciones Absolutas

1. **Emoticones**: Prohibido en TODO el proyecto
   - Codigo, comentarios, mensajes de commit, documentacion
   - Archivos de configuracion, logs, outputs
   - Sin excepciones

2. **Referencias a IA**: Prohibido mencionar en archivos guardados
   - No: "IA", "AI", "inteligencia artificial", "asistente", "Copilot", "GPT", "modelo"
   - Aplica a: codigo, comentarios, commits, documentacion, configuracion
   - Sin excepciones

---

## Uso

| Necesitas... | Usa |
| -------------- | ----- |
| Iniciar sesion de trabajo | `ACT-nxt.md` |
| Agregar fase al roadmap | `ACT-pln.md` |
| Validar cambios arquitectonicos | `ACT-audit.md` |
| Saber como hacer commits | `PRO-git.md` |
| Aplicar hotfix urgente | `PRO-fix.md` |
| Entender arquitectura | `STD-arch.md` |
| Ejecutar en contenedores | `STD-infra.md` |
