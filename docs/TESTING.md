# Guía de Pruebas (Testing) - InteractiveMapUCN

Este documento describe la estrategia de pruebas para asegurar la calidad y estabilidad de la aplicación.

## Estrategia de Pruebas

Actualmente, el proyecto se enfoca en tres niveles de validación:

1. **Pruebas Unitarias** (Pendiente de implementación completa)
2. **Pruebas de Integración** (API Testing)
3. **Pruebas Manuales / E2E** (Verificación funcional)

---

## Herramientas

- **Jest**: Framework de testing para JavaScript (Frontend/Backend).
- **Postman**: Para pruebas manuales de endpoints de API.
- **ESLint**: Análisis estático de código para prevenir errores comunes.

---

## Cómo Ejecutar Pruebas

### Backend (API)

Aunque la cobertura automatizada está en desarrollo, se recomienda validar los endpoints clave manualmente.

**Health Check:**
```bash
curl http://localhost:3001/api/health
# Respuesta esperada: {"status":"ok", ...}
```

**Flujo Crítico de Login:**
1. Intentar login con credenciales incorrectas (esperar 401).
2. Intentar login con credenciales válidas (esperar 200 + Token).

### Frontend (UI)

**Smoke Test Manual:**
1. Cargar la página de inicio.
2. Verificar que el mapa carga (Leaflet tiles visibles).
3. Hacer clic en un edificio y verificar que abre el panel lateral.
4. Usar el buscador y seleccionar un resultado.

---

## Lista de Verificación (QA)

Antes de hacer un Pull Request, verifica lo siguiente:

### Funcionalidad
- [ ] El mapa carga correctamente y centra en el campus.
- [ ] El buscador autocompleta y navega al resultado.
- [ ] El cálculo de rutas dibuja una línea válida entre A y B.
- [ ] El modo administrador permite login/logout.

### Responsive
- [ ] Se ve bien en Desktop (1920x1080).
- [ ] Se ve bien en Mobile (375x667 - iPhone SE).

### Rendimiento
- [ ] La carga inicial es menor a 3 segundos.
- [ ] No hay errores en la consola del navegador (`F12`).

---

## Futuras Mejoras (Roadmap)

- Implementar **Cypress** para pruebas E2E automatizadas.
- Configurar **Jest + Supertest** para cobertura de API.
- Añadir validación automática en CI/CD (GitHub Actions).
