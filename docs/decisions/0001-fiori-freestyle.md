# ADR 0001: Aplicación SAPUI5 Fiori freestyle

## Contexto

La solución necesita un cockpit, navegación interna y futuros flujos operativos con distintos niveles de complejidad. En esta etapa todavía no existe un backend real ni un modelo de servicio definitivo.

## Decisión

Implementar una única aplicación SAPUI5 Fiori freestyle utilizando controles estándar y patrones visuales nativos de SAP Fiori.

## Consecuencias

- Se conserva control explícito sobre navegación, layout y evolución de los flujos.
- Se evita fragmentar prematuramente la solución en varias aplicaciones.
- El equipo deberá mantener manualmente routing, vistas, controladores y bindings.
- Una futura separación en aplicaciones requerirá una nueva decisión arquitectónica.

