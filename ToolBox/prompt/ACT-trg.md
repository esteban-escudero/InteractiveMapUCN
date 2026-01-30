# ACT-trg - Triage: Fase vs Fix

Clasifica la intervención requerida ante un diagnóstico.

---

## Restricciones Globales

1. **Emoticones**: Prohibido en codigo, comentarios, commits, documentacion
2. **Referencias a IA**: Prohibido en archivos guardados (IA, AI, asistente, Copilot, GPT, modelo)

---

## Opciones

| Opción | Criterio | Acción |
| -------- | ---------- | -------- |
| **A: FASE** | Introduce capacidades, modifica arquitectura, altera contratos o persistencia | Insertar en Roadmap con versionado |
| **B: FIX** | Correctivo puro, invisible externamente, reversible (typos, config, consistencia interna) | Rama `fix/`, merge a rama actual, clausura |

---

## Instrucción

Declarar explícitamente **A** o **B** con justificación breve.
