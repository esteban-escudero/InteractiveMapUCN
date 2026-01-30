# Constitucion del Proyecto

## Mapa Interactivo UCN

**Version:** 1.0
**Estado:** Ratificado - Estricto
**Caracter:** Normativo, vinculante y no interpretativo

---

## 0. Autoridad del documento

Este documento es vinculante. Define que esta permitido y que esta prohibido. En caso de conflicto con otra documentacion, prevalece este.

---

## 0.1 Restricciones globales de contenido

**Prohibiciones absolutas en todo el proyecto:**

1. **Emoticones y emojis**: Prohibido en codigo, comentarios, commits, documentacion, configuracion, logs y outputs.

2. **Referencias a inteligencia artificial**: Prohibido mencionar en archivos guardados. Incluye: "IA", "AI", "inteligencia artificial", "asistente", "Copilot", "GPT", "modelo", o variantes.

---

## 1. Identidad del proyecto

### 1.1 Nombre

Mapa Interactivo UCN.

### 1.2 Proposito

Sistema de visualizacion y navegacion del campus universitario: gestion de edificios, salas y rutas peatonales para la comunidad universitaria.

### 1.3 Valores inmutables

1. **Seguridad por diseno**: autenticacion robusta para operaciones administrativas.
2. **Accesibilidad**: interfaz publica sin barreras para usuarios finales.
3. **Simplicidad explicita**: claridad sobre ingenio.
4. **Modularidad estricta**: limites claros, dependencias explicitas.

---

## 2. Arquitectura

### 2.1 Modelo

* Cliente-Servidor con MVC en Backend.
* Microservicios prohibidos.
* Modulos autonomos: desarrollar, probar y modificar sin afectar otros.

### 2.2 Topologia

```text
/
├── backend/                 <- API REST
│   └── Containerfile
├── frontend/                <- SPA
│   └── Containerfile
├── database/                <- Migraciones, seeds, backups
│   ├── migrations/
│   ├── seeds/
│   └── init.sql
├── compose.yaml             <- Base de servicios
├── compose.dev.yaml         <- Override desarrollo
├── compose.prod.yaml        <- Override produccion
└── .env.example
```

### 2.3 Separacion de responsabilidades

| Capa | Responsabilidad |
| -------- | ------------------- |
| Frontend | UI, renderizado de mapas, estado local |
| Backend | API REST, logica de negocio, autenticacion JWT |
| Database | Persistencia, operaciones geoespaciales (PostGIS) |

---

## 3. Stack tecnologico

| Capa | Tecnologia | Version |
| -------- | -------------- | --------- |
| Frontend | React | 18.x |
| Routing | React Router DOM | 7.x |
| Mapas | Leaflet | 1.9.x |
| Geoespacial (client) | Turf.js | 7.x |
| Backend | Node.js + Express | 20 LTS / 4.x |
| Base de datos | PostgreSQL + PostGIS | 15+ / 3.x |
| Autenticacion | JWT | access 15min, refresh 7d |
| Contenedores | Podman | 4.x+ |

No se permiten otras tecnologias sin enmienda formal.

### 3.1 Restricciones

1. Contenedores: `podman compose` exclusivamente.
2. Imagenes OCI. Archivos: `Containerfile`, `compose.yaml`.
3. JavaScript ES6+ con async/await. Sin TypeScript.
4. Multi-stage builds obligatorio en produccion.
5. Usuario no-root en todos los contenedores.

---

## 4. Contenedores

### 4.1 Servicios

| Servicio | Imagen | Puerto |
| ---------- | ------- | -------- |
| frontend | node:20-alpine | 3000 (dev) / 80 (prod) |
| backend | node:20-alpine | 3001 (solo dev) |
| database | postgis/postgis:15-3.3-alpine | 5433 (solo dev) |

### 4.2 Exposicion por entorno

| Entorno | Frontend | Backend | Database |
| ----------- | ---------- | --------- | ---------- |
| Desarrollo | :3000 | :3001 | :5433 |
| Produccion | :80 | interno | interno |

### 4.3 Comandos

```bash
# Desarrollo
podman compose -f compose.yaml -f compose.dev.yaml up -d
podman compose -f compose.yaml -f compose.dev.yaml down

# Produccion
podman compose -f compose.yaml -f compose.prod.yaml up -d --build
```

### 4.4 Labels OCI requeridos

```text
org.opencontainers.image.source
org.opencontainers.image.description
org.opencontainers.image.licenses
```

---

## 5. Datos

### 5.1 Dominios

| Dominio | Tablas |
| --------- | -------- |
| Edificios | edificio, sala, plano |
| Rutas | ruta, nodo_ruta |
| Usuarios | administrador, refresh_tokens |

### 5.2 Reglas

1. Geometrias en formato nativo PostgreSQL, operaciones en PostGIS.
2. Migraciones versionadas en `database/migrations/`.
3. Backups en `database/backups/` (gitignored).

---

## 6. Seguridad

1. JWT: access token (15min), refresh token (7d). Backend emite y valida.
2. Endpoints administrativos requieren autenticacion.
3. Endpoints publicos (edificios, rutas) sin auth.
4. Contenedores sin permisos root.
5. Secretos via variables de entorno, nunca versionados.

### 6.1 Variables requeridas

```text
DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, DATABASE_URL
JWT_SECRET, JWT_REFRESH_SECRET
PORT, NODE_ENV, CORS_ORIGIN
```

---

## 7. Reglas de desarrollo

### 7.1 Arquitectura MVC

1. Un controller por entidad.
2. Un model por tabla.
3. Services para logica multi-model.
4. Middleware para cross-cutting (auth, validation, errors).

### 7.2 Principios de diseno

| Principio | Aplicacion |
| ----------- | ------------ |
| SoC | Una razon para cambiar por unidad. I/O aislado en models/services. |
| DRY | Extraer duplicados. Centralizar config y validaciones. |
| Cohesion | Agrupar por dominio, no por tipo tecnico. |
| Acoplamiento | Depender de abstracciones. Inyectar dependencias. |
| Idempotencia | Mismo resultado en ejecuciones multiples. |

### 7.3 Prohibiciones

* Singleton mutable.
* God objects.
* Callbacks anidados (usar async/await).
* SQL en controllers.
* Fetch directo en componentes.

### 7.4 Estilo

1. Funciones pequenas: una tarea.
2. Nombres descriptivos.
3. Early returns para evitar anidacion.
4. Preferir `const`, evitar mutacion.
5. Comentarios en espanol, concisos, sin documentar lo evidente.

---

## 8. Flujo de trabajo

1. Verificar estado del repositorio antes de trabajar.
2. Rama por tarea.
3. Commits atomicos con mensajes descriptivos.
4. Reconstruir contenedores si cambian dependencias.

---

## 9. Documentacion

| Documento | Contenido |
| ----------- | ----------- |
| daRulez.md | Principios constitutivos (este documento) |
| STD-arch.md | Estandar de arquitectura detallado |
| README.md | Guia operativa |

Nada puede contradecir esta constitucion.

---

## 10. Enmiendas

* Principios arquitectonicos y de seguridad: inmutables.
* Stack tecnologico: requiere justificacion y analisis de impacto.

---

## Ratificacion

Este documento es vinculante para todo el proyecto.

**Ratificado:** 2026-01-30
