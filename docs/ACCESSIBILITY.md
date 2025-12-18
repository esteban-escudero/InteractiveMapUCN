# Accesibilidad e Inclusión - InteractiveMapUCN

Este documento detalla el cumplimiento de estándares de accesibilidad para garantizar que el aplicativo pueda ser utilizado por el mayor número de personas posible, incluyendo aquellas con discapacidades visuales o motoras.

## Estándar Objetivo: WCAG 2.1 Nivel AA

El proyecto ha sido diseñado siguiendo las pautas de accesibilidad para contenido web (Web Content Accessibility Guidelines).

---

## Características Implementadas

### 1. Navegación por Teclado
- Toda la interfaz (menús, búsqueda, botones) es operable mediante teclado (`Tab`, `Enter`, `Esc`).
- El foco visual (`focus ring`) está claramente definido en todos los elementos interactivos.

### 2. Lectores de Pantalla (Screen Readers)
- **HTML Semántico**: Uso correcto de `<main>`, `<nav>`, `<button>`, `<input>`.
- **Etiquetas ARIA**: 
  - `aria-label` en botones que solo contienen iconos (ej. botón "Cerrar", botones de zoom).
  - `role="alert"` para mensajes de error o confirmación.
- **Texto Alternativo**: Todas las imágenes de edificios tienen atributo `alt` descriptivo.

### 3. Contraste y Color
- **Modo Oscuro/Claro**: Alto contraste verificado (> 4.5:1) para textos sobre fondos.
- **Independencia del Color**: La información no se transmite solo por color. Ej: Las rutas no solo son rojas o verdes, sino que tienen etiquetas textuales y diferentes patrones de línea (sólido vs punteado).

### 4. Rutas Accesibles
Una característica clave del proyecto es el cálculo de **Rutas Accesibles (Silla de Ruedas)**:
- El algoritmo evita escaleras y caminos con pendiente excesiva.
- Prioriza el uso de rampas y ascensores.

---

## Lista de Verificación de Cumplimiento

| Criterio | Descripción | Estado |
|----------|-------------|--------|
| 1.1.1 | Contenido no textual (Alt Text) | ✅ Cumple |
| 1.3.1 | Información y relaciones (Semántica) | ✅ Cumple |
| 1.4.3 | Contraste (Mínimo) | ✅ Cumple |
| 2.1.1 | Teclado (Accesible sin mouse) | ✅ Cumple |
| 2.4.7 | Foco visible | ✅ Cumple |
| 3.3.2 | Etiquetas o instrucciones (Formularios) | ✅ Cumple |

---

## Áreas de Mejora

A pesar del esfuerzo, existen limitaciones conocidas:
1. **Mapas Interactivos**: Los mapas de Leaflet son complejos para navegar solo con lector de pantalla. Se recomienda usar el buscador de texto como alternativa accesible.
2. **Zoom Máximo**: Al hacer zoom > 200% en el navegador, algunos elementos del menú lateral pueden solaparse.
