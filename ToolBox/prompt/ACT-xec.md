# ACT-xec - Contexto de Ejecución Confinada

Fuerza la ejecución de comandos CLI dentro de contenedores Podman.

---

## Restricciones Globales

1. **Emoticones**: Prohibido en codigo, comentarios, commits, documentacion
2. **Referencias a IA**: Prohibido en archivos guardados (IA, AI, asistente, Copilot, GPT, modelo)

---

## Principios

1. **Host Pasivo:** No ejecutar herramientas de desarrollo en el host.
2. **Ejecución Confinada:** Todo ocurre dentro de contenedores.
3. **Corrección Automática:** Reescribir instrucciones que violen estos principios.

---

## Activación

Cuando una instrucción:

- Asume ejecución directa en host
- Ignora el entorno de contenedores
- Desconoce la orquestación de servicios

---

## Reglas

1. Identificar si el comando es herramienta de desarrollo
2. Determinar que pertenece al dominio de contenedores
3. Asignar al servicio correcto (node-service, php-service, etc.)
4. Reescribir como `podman compose exec {servicio} {comando}`

---

## Resultado

Instrucciones emitidas son:

- Confinadas a contenedores
- Compatibles con infraestructura definida
- Independientes del host
