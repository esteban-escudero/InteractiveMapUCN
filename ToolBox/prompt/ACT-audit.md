# ACT-audit - Auditoría Arquitectónica

Analiza imports y dependencias del código contra `STD-arch.yaml`.

---

## Restricciones Globales

1. **Emoticones**: Prohibido en codigo, comentarios, commits, documentacion
2. **Referencias a IA**: Prohibido en archivos guardados (IA, AI, asistente, Copilot, GPT, modelo)

---

## Escaneos

| # | Nombre | Buscar | Severidad | Mensaje |
| --- | -------- | -------- | ----------- | -------- |
| 1 | Vertical | domain/ o application/ → infrastructure/ o presentation/ | CRÍTICA | Núcleo depende de detalles. Aplique Inversión de Dependencias. |
| 2 | Horizontal | presentation/ → infrastructure/ | CRÍTICA | Bypass de Application. Orqueste mediante UseCase. |
| 3 | Salto | presentation/ manipula entidades sin pasar por application/ | MAYOR | Lógica de negocio en controlador. Mueva a UseCase. |
| 4 | Cross-Module | moduleA/* → moduleB/domain/ o moduleB/infrastructure/ | CRÍTICA | Acoplamiento cross-module. Extraiga a shared/ports/. |
| 5 | Duplicación | Interfaz en shared/ports/ Y en module/domain/ports/ | MAYOR | Duplicación. Mantenga fuente única. |
| 6 | Container | *.container.ts con constructor importando concretos | MENOR | DI incompleta. Concretos solo en factory. |

---

## Excepciones

| Patrón | Permitido | Razón |
| -------- | ----------- | ------- |
| *.container.ts → concretos | Sí | Composition Root |
| módulo → shared/ports/ | Sí | Shared Kernel |
| módulo → shared/infrastructure/ | Sí | Adaptadores genéricos |
| *.test.ts → concretos | Sí | Contexto de prueba |

---

## Salida

Si hay violaciones, bloquear y emitir:

```text
| Archivo | Violación | Línea/Import | Solución |
```
