# Guía de Contribución - InteractiveMapUCN

¡Gracias por tu interés en contribuir a InteractiveMapUCN!

Este documento establece las pautas para contribuir al proyecto, asegurar la calidad del código y mantener un flujo de trabajo ordenado.

## Flujo de Trabajo (Git Flow)

Este proyecto utiliza una variante simplificada de Git Flow.

- **`main`**: Rama de producción. Código estable y desplegable.
- **`develop`**: Rama principal de desarrollo. Todas las features se integran aquí.
- **`feature/nombre-feature`**: Ramas para nuevas funcionalidades.
- **`fix/nombre-bug`**: Ramas para corrección de errores.

### Pasos para Contribuir

1. **Fork** el repositorio.
2. Clona tu fork localmente.
3. Crea una rama para tu tarea: `git checkout -b feature/mi-nueva-feature`.
4. Realiza tus cambios y commits.
5. Push a tu fork: `git push origin feature/mi-nueva-feature`.
6. Abre un **Pull Request** hacia la rama `main` (o `develop` si existe) del repositorio original.

---

##  Estándares de Código

### General
- Usa inglés para variables, funciones y comentarios de código.
- Usa español para textos visibles al usuario (UI), documentación y logs.

### JavaScript / React
- Preferimos **Componentes Funcionales** y **Hooks**.
- Usa `const` y `let`, evita `var`.
- Nombres de componentes en `PascalCase` (e.g., `MapViewer.js`).
- Nombres de funciones y variables en `camelCase` (e.g., `calculateRoute`).

### Backend (Node.js)
- Estructura asíncrona con `async/await`.
- Manejo de errores siempre con bloques `try/catch` en controladores.
- Responses estandarizados: `{ success: true, data: ... }` o `{ success: false, message: ... }`.

### Commits
Usa [Conventional Commits](https://www.conventionalcommits.org/):
- `feat: agregar nuevo filtro de búsqueda`
- `fix: corregir error en cálculo de ruta`
- `docs: actualizar readme`
- `style: formatear código con prettier`
- `refactor: optimizar servicio de proximidad`

---

## Pruebas (Testing)

Asegúrate de que tu código no rompa funcionalidades existentes.

- Si agregas una nueva funcionalidad crítica, considera agregar tests (si el proyecto tiene suite de tests configurada).
- Verifica manualmente en navegador (Desktop y Mobile simulado).

## Reporte de Bugs

Al crear un Issue para reportar un bug, por favor incluye:
1. Pasos para reproducir.
2. Comportamiento esperado.
3. Comportamiento actual.
4. Screenshots o logs si aplica.
5. Navegador y dispositivo usado.

## Licencia

Al contribuir, aceptas que tu código se licencie bajo la misma licencia del proyecto (MIT).
