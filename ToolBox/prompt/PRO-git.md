# PRO-git - Protocolo de Control de Versiones

Política de aislamiento y trazabilidad del código.

---

## RESTRICCIONES DE CONTENIDO

### Prohibiciones en Commits y Mensajes

1. **Emoticones**: Prohibido en mensajes de commit, comentarios, codigo
2. **Referencias a IA**: Prohibido mencionar en commits (IA, AI, asistente, Copilot, GPT)

---

## Versionado

Analizar última fase del Roadmap (`X.Y` o `X.Y.Z`):

| Caso | Versión |
| ------ | --------- |
| Nueva funcionalidad independiente | `X.(Y+1)` |
| Sub-fase o derivada | `X.Y.(Z+1)` |

---

## Flujo de Trabajo

1. **Crear rama** antes de cualquier modificación: `fase-{version}-{slug}`
2. **Base:** Último estado estable (rama de fase anterior)
3. **Aislar:** Toda modificación ocurre en la rama

---

## Prohibiciones

| Acción | Permitido |
| -------- | ----------- |
| Commit directo a main/master/develop | NO |
| Romper linealidad del historial | NO |
| Modificar sin rama activa | NO |
