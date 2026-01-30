# STD-infra - Estandar de Infraestructura

Politica de contenedorizacion y aislamiento del entorno de desarrollo.

---

## Restricciones Globales

1. **Emoticones**: Prohibido en codigo, comentarios, commits, documentacion
2. **Referencias a IA**: Prohibido en archivos guardados (IA, AI, asistente, Copilot, GPT, modelo)

---

## 0. Prerequisitos

**Responsabilidad del usuario:** Tener los contenedores corriendo antes de ejecutar comandos.

| Paso | Comando | Proposito |
| ------ | --------- | ---------- |
| Verificar activos | `podman ps --format "{{.Names}}"` | Lista contenedores corriendo |
| Obtener servicios | `podman compose config --services` | Nombres de servicios disponibles |
| Si no corren | Informar al usuario | No intentar ejecutar en contenedores inexistentes |

**Entender el entorno:**

- `compose.yaml` - Configuracion base
- `compose.dev.yaml` - Overrides de desarrollo
- `compose.prod.yaml` - Overrides de produccion

---

## 1. Contenedorizacion

- Todo el ciclo de vida (build, run, test) ocurre en contenedores
- Orquestador: **Podman** via `podman compose`
- Patron de ejecucion: `podman compose exec {service} {command}`

---

## 2. Host Esteril

| En Host | Permitido |
| --------- | ---------- |
| git, podman, editor | SI |
| Node.js, PHP, npm, Composer, psql | NO |

---

## 3. Integridad

| Aspecto | Regla |
| --------- | ------- |
| Red | Servicios se comunican via red interna del composefile |
| Persistencia | Datos en volumenes gestionados, no filesystem local |
| Reproducibilidad | `podman compose up` levanta entorno identico en cualquier maquina |

---

## 4. Violacion

Infraccion critica:

- Asumir existencia de runtimes en host
- Ejecutar fuera de `podman compose exec`
- Ejecutar comandos sin verificar que contenedores estan activos
