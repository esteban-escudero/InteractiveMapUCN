# CTX - Carga de Contexto

**Rol:** Arquitecto de Software

## Proposito

Preparar al agente con contexto, normativas y arquitectura antes de cualquier tarea.

## Inputs

Adjuntar:

- `@daRulez.md` - Constitucion, reglas inviolables
- `@spec-architecture.md` - Dominios y capas
- `@Caracterizacion.md` - Modelo conceptual

Opcionales:

- `@spec-qr-validation.md` - Si involucra attendance/QR
- `@ROADMAP.md` - Si necesita estado del proyecto

## Procedimiento

### Fase 1: Absorcion Normativa

Leer `daRulez.md`, retener:

- **§2 Arquitectura:** Monolito modular, vertical slicing, sin dependencias circulares
- **§3 Tecnologias:** Node.js 20 + Fastify, TypeScript + Vite, PostgreSQL + Valkey, Podman
- **§6 Seguridad:** PHP emite JWT, Node valida; secretos por env vars
- **§7.1.1 Principios:** SoC, DRY, alta cohesion, bajo acoplamiento, idempotencia
- **§7.1.2 Prohibido:** Singleton mutable, god objects, herencia profunda
- **§7.2-7.4 Estilo:** Sin emojis, comentarios en espanol, sin rastro IA

### Fase 2: Absorcion Arquitectonica

Leer `spec-architecture.md` y `Caracterizacion.md`, retener:

**Dominios:**

- `enrollment` - Registro FIDO2, politica 1:1 (PostgreSQL)
- `session` - Login ECDH, session_key (Valkey TTL 2h)
- `attendance` - Validacion QR multi-round (ambos)
- `qr-projection` - WebSocket, pool de QRs (Valkey)
- `restriction` - Bloqueos, stub (-)
- `access` - Gateway lectura, estado agregado (-)

**Invariante:** Politica 1:1 (una cuenta ↔ un dispositivo)

**Estados:** NOT_ENROLLED → ENROLLED_NO_SESSION → READY | BLOCKED

**Flujo cripto:** FIDO2 (enrollment) → ECDH+HKDF (session_key) → AES-GCM (QRs) → TOTP

**Estructura:**

```bash
node-service/src/
├── backend/{access,attendance,auth,enrollment,qr-projection,restriction,session,shared}/
├── frontend/features/
├── middleware/
├── plugins/
└── shared/{config,infrastructure,ports,types}/
```

### Fase 3: Confirmacion

Verificar internamente:

1. Entiendo politica 1:1
2. Se que modulo(s) aplican
3. Conozco capas del modulo
4. Identifico patrones a seguir
5. La tarea no viola daRulez

## Entregable

```markdown
## Contexto Cargado

**Fecha:** YYYY-MM-DD
**Modelo:** [actual]

### Comprension
- **Proyecto:** Monolito modular, addon PHP
- **Dominio(s):** [segun tarea]
- **Capas:** [domain/application/infrastructure/presentation]
- **Patrones:** [Repository, UseCase, etc.]

### Listo Para
[Descripcion breve de la tarea]

---
**Opciones:**
1. Proceder con la tarea
2. Clarificacion sobre [X]
3. Ejecutar auditoria (AUD)
4. Ver estado proyecto (RES)
```

## Restricciones

- NO codificar hasta recibir instrucciones
- NO asumir la tarea
- NO saltar absorcion
- Preguntar si algo es ambiguo respecto a daRulez

## Formato

- Analisis interno: estilo libre
- Edicion archivos proyecto: seguir daRulez §7.3 (sin emojis, tecnico)
