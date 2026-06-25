# ADR 0004: Login como integración futura

## Contexto

La solución requerirá identidad y autorizaciones, pero el entorno definitivo y el mecanismo corporativo de autenticación todavía no forman parte del alcance inicial.

## Decisión

No implementar un login propio en esta etapa. Preparar la arquitectura para integrarse posteriormente con los mecanismos de autenticación y autorización provistos por el entorno SAP.

## Consecuencias

- Se evita almacenar credenciales o construir autenticación temporal en el frontend.
- La navegación inicial no representa controles de autorización productivos.
- La definición futura deberá contemplar identidad, roles, catálogos y restricciones backend.
- Las autorizaciones reales deberán aplicarse en el backend además de reflejarse en la interfaz.

