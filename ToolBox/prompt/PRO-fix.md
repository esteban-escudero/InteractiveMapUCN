# PRO-fix - Protocolo de Correcciones Mínimas

Gestión de ajustes correctivos durante ejecución de una fase, sin crear nueva fase.

---

## Restricciones de Contenido

1. **Emoticones**: Prohibido en codigo, comentarios, commits, documentacion
2. **Referencias a IA**: Prohibido en archivos guardados (IA, AI, asistente, Copilot, GPT, modelo)

---

## Aplica a

- Configuración
- Sintaxis
- Estado inconsistente
- Anomalías internas

---

## Protocolo

1. **Aislar:** Crear rama `fix/{descripcion}` desde rama actual
2. **Resolver:** Implementar corrección atómica
3. **Validar:** Verificar en aislamiento
4. **Converger:** Merge a rama de trabajo original
5. **Clausurar:** Eliminar rama temporal

---

## Restricción

Solo para cambios que preserven invariancia del sistema.

Si modifica funcionalidad, arquitectura o contratos → Escalar a fase formal (`ACT-pln`).
