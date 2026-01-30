# STD-arch - Estándar de Arquitectura y Diseño

Define la topología del Monolito Modular bajo el patrón Ports & Adapters (Hexagonal) con principios de Clean Architecture.

---

## RESTRICCIONES GLOBALES

### Prohibiciones Absolutas

1. **Emoticones**: Prohibido en TODO el proyecto (codigo, comentarios, commits, documentacion)
2. **Referencias a IA**: Prohibido mencionar en archivos guardados (IA, AI, asistente, Copilot, GPT, modelo)

---

## 0. Fundamentos

### 0.1 Valores Arquitectónicos

| Valor | Implicación |
| ------- | ------------- |
| Seguridad por diseño | El modelo de seguridad no se debilita por conveniencia |
| Simplicidad explícita | Claridad sobre ingenio |
| Modularidad estricta | Límites claros, dependencias explícitas |

### 0.2 Modelo de Arquitectura

- **Monolito Modular**: único modelo permitido
- Cada módulo es autónomo: desarrollar, probar, modificar sin afectar otros
- Microservicios: fuera de alcance

### 0.3 Vertical Slicing

**Prohibido:**

- Capas técnicas transversales compartidas (excepto Shared Kernel)
- Importar desde capas internas de otro módulo (solo desde su API pública)
- Dependencias circulares entre módulos

**Obligatorio:**

- Cada módulo expone interfaz pública mínima
- Dependencias entre módulos fluyen en una sola dirección

### 0.4 Secuencia de Inicialización

| Fase | Responsabilidad |
| ------ | ----------------- |
| Bootstrap | Configuración, variables de entorno, logging básico |
| Composition | Instanciar concretos, conectar dependencias (Composition Root) |
| Start | Abrir puertos, escuchar requests |

Composition Root orquesta: Driven Adapters → Use Cases → Driving Adapters.

### 0.5 Principios de Diseño

| Principio | Regla |
| ----------- | ------- |
| SoC | Una razón para cambiar. Efectos secundarios aislados en Infrastructure |
| DRY | Extraer duplicados. Centralizar config. Composición > duplicación |
| Cohesión Alta | Elementos semánticamente relacionados. Agrupar por dominio |
| Acoplamiento Bajo | Depender de abstracciones. Inyectar dependencias |
| Idempotencia | Mismo resultado en múltiples ejecuciones |

---

## 1. Definiciones Fundamentales

| Término | Definición |
| --------- | ------------ |
| **Puerto (Port)** | Interfaz que define un contrato. El núcleo la declara. |
| **Adaptador (Adapter)** | Implementación concreta de un puerto. Vive en la periferia. |
| **Driving (Primario)** | Dirección de entrada. El exterior invoca al núcleo. |
| **Driven (Secundario)** | Dirección de salida. El núcleo requiere del exterior. |
| **Composition Root** | Único punto donde se instancian y conectan dependencias concretas. |

---

## 2. Jerarquía de Capas

```text
┌─────────────────────────────────────────────────────────────┐
│                    COMPOSITION ROOT                         │
│              (Conoce todo, conecta todo)                    │
├─────────────────────────────────────────────────────────────┤
│  NIVEL 2 - PERIFERIA                                        │
│  ├── /presentation   (Driving Adapters: Controllers, CLI)  │
│  └── /infrastructure (Driven Adapters: Repos, APIs)        │
├─────────────────────────────────────────────────────────────┤
│  NIVEL 1 - ORQUESTACIÓN                                     │
│  └── /application    (Use Cases, Application Services)     │
├─────────────────────────────────────────────────────────────┤
│  NIVEL 0 - NÚCLEO                                           │
│  └── /domain         (Entities, Value Objects, Ports)      │
└─────────────────────────────────────────────────────────────┘
```

**Propiedades por Nivel:**

| Nivel | Capa | Conoce | No Conoce |
| ------- | ------ | -------- | ----------- |
| 0 | Domain | Sí mismo | Nada externo |
| 1 | Application | Domain, Puertos | Adaptadores, Frameworks |
| 2 | Presentation | Application | Infrastructure directa |
| 2 | Infrastructure | Domain (implementa puertos) | Application, Presentation |
| — | Composition Root | **Todo** | — |

---

## 3. Regla de Dependencia

> Las dependencias **siempre** apuntan hacia el núcleo. Nunca al revés.

```text
    Exterior ────────────────► Interior
    (Adapters)                 (Domain)
    
    Concreto ────────────────► Abstracto
    (Implementations)          (Interfaces)
```

---

## 4. Matriz de Interacción

| Desde | Hacia | Veredicto | Razón |
| ------- | ------- | ----------- | ------- |
| Presentation | Application | PERMITIDO | Orquestación |
| Application | Domain | PERMITIDO | Uso de entidades y puertos |
| Infrastructure | Domain | PERMITIDO | Implementa puertos |
| Presentation | Infrastructure | PROHIBIDO | Bypass horizontal |
| Domain | Application | PROHIBIDO | Contaminación ascendente |
| Domain | Infrastructure | PROHIBIDO | Núcleo conoce detalles |
| Application | Infrastructure | PROHIBIDO | Acoplamiento a concretos |

---

## 5. Ubicación de Interfaces (Puertos)

### Principio

> **La interfaz pertenece a quien la NECESITA, no a quien la IMPLEMENTA.**

### Reglas de Ubicación

| Tipo de Puerto | ¿Quién lo define? | Ubicación |
| ---------------- | ------------------- | ----------- |
| Driven Port (interno) | El módulo que lo necesita | `modulo/domain/ports/` |
| Driving Port | El módulo que lo expone | `modulo/application/` |
| Cross-Module | Ver §6 | Depende de estrategia |

---

## 6. Comunicación entre Módulos

Cada módulo es un hexágono independiente. La comunicación requiere estrategia explícita.

### Estrategias Permitidas

| Estrategia | Cuándo Usar | Trade-off |
| ------------ | ------------- | ----------- |
| **Via Application** | Operaciones simples | Verboso si hay muchas |
| **Shared Kernel** | Tipos/interfaces usados por 2+ módulos | Acoplamiento compartido |
| **Anti-Corruption Layer** | Máximo desacoplamiento | Más código de traducción |
| **Eventos de Dominio** | Comunicación asíncrona | Eventual consistency |

### Criterio de Decisión para Shared

1. **¿Cuántos módulos consumen la interfaz?**
   - 1 módulo → Vive en ese módulo
   - 2+ módulos → Candidata a `shared/`

2. **¿Necesitan exactamente lo mismo?**
   - Sí → `shared/ports/`
   - No → Cada módulo define su propia interfaz (ACL)

3. **¿Quién controla la evolución?**
   - Un módulo → Vive ahí, otros usan ACL
   - Decisión compartida → `shared/`

---

## 7. Inyección de Dependencias

### Regla

> Un componente **recibe** sus dependencias; nunca las **crea**.

### Formas Permitidas

| Método | Uso |
| -------- | ----- |
| Constructor Injection | Dependencias obligatorias (preferido) |
| Setter Injection | Dependencias opcionales |

### Anti-Patrón

```typescript
// PROHIBIDO: Conoce el concreto
class UseCase {
  private repo = new PostgresRepository();
}

// CORRECTO: Solo conoce la interfaz
class UseCase {
  constructor(private repo: IRepository) {}
}
```

---

## 8. Composition Root

### Definición

Único lugar donde se permite:

- Importar implementaciones concretas
- Instanciarlas
- Inyectarlas en constructores

### Ubicación

```bash
modulo/
├── domain/
├── application/
├── infrastructure/
├── presentation/
└── modulo.container.ts   ← Composition Root
```

### Estructura del Container

```typescript
class ModuleContainer {
  // Constructor recibe INTERFACES (para testing/DI externa)
  constructor(
    private readonly externalDep: IExternalService
  ) {}
  
  // Factory instancia CONCRETOS (única ubicación permitida)
  static create(): ModuleContainer {
    const concrete = new ConcreteImplementation();
    return new ModuleContainer(concrete);
  }
}
```

---

## 9. Shared Kernel

### Estructura Permitida

```bash
shared/
├── ports/          ← Interfaces cross-module
├── types/          ← Value Objects compartidos
└── infrastructure/ ← Adaptadores genéricos (logger, http)
```

### Reglas

1. `shared/ports/` contiene **interfaces**, no implementaciones
2. `shared/infrastructure/` contiene adaptadores **genéricos** (no de negocio)
3. Si una interfaz está en `shared/ports/`, **NO** debe duplicarse en `modulo/domain/ports/`
4. Preferir **re-export** sobre **duplicación**

---

## 10. Resumen de Prohibiciones

| Acción | Veredicto |
| -------- | ----------- |
| Domain importa de Infrastructure | PROHIBIDO |
| Application importa concretos | PROHIBIDO |
| Presentation llama a Infrastructure | PROHIBIDO |
| Módulo A importa `moduloB/domain/` | PROHIBIDO |
| Módulo A importa `moduloB/infrastructure/` | PROHIBIDO |
| Interfaz duplicada en shared/ y domain/ports/ | PROHIBIDO |

---

## 11. Excepciones Documentadas

| Situación | Permitido | Razón |
| ----------- | ----------- | ------- |
| `*.container.ts` importa concretos | SI | Es el Composition Root |
| Módulo importa de `shared/ports/` | SI | Shared Kernel definido |
| Módulo importa de `shared/infrastructure/` | SI | Adaptadores genéricos |
| Test importa concretos | SI | Contexto de prueba |
