# Política de Seguridad

## Versiones Soportadas

Actualmente, damos soporte de seguridad a las siguientes versiones del proyecto:

| Versión | Soportada          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporte de Vulnerabilidades

Nos tomamos la seguridad de este proyecto en serio. Agradecemos tus esfuerzos para divulgar responsablemente tus hallazgos, y trabajaremos para solucionar los problemas rápidamente.

### Cómo reportar un problema

Si crees haber encontrado una vulnerabilidad de seguridad en InteractiveMapUCN, por favor **NO** abras un Issue público en GitHub. En su lugar, envía un reporte por correo electrónico a:

**soporte.mapa@ucn.cl**

En tu reporte, por favor incluye:

1. Tipo de vulnerabilidad (e.g., XSS, SQL Injection, RCE).
2. Pasos completos para reproducir la vulnerabilidad (PoC).
3. Impacto estimado del ataque.

### Proceso de Respuesta

1. Acusaremos recibo de tu reporte dentro de las 48 horas.
2. Realizaremos una evaluación de impacto y te confirmaremos si es una vulnerabilidad válida.
3. Trabajaremos en un parche de seguridad.
4. Publicaremos una nueva versión con el parche.
5. Te daremos crédito en el Changelog (si lo deseas).

## Buenas Prácticas de Seguridad en Desarrollo

Para mantener el proyecto seguro, seguimos estas prácticas:
- Dependencias actualizadas regularmente (`npm audit`).
- Uso de imágenes Docker oficiales y ligeras (Alpine).
- Secretos gestionados exclusivamente vía variables de entorno (`.env`).
- Headers de seguridad HTTP configurados (Helmet).
