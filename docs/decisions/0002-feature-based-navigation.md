# ADR 0002: Navegación basada en features

## Contexto

Los accesos del cockpit representan funciones de negocio que en el futuro tendrán subflujos propios. No todas las funciones corresponderán necesariamente a una entidad técnica o a una única operación backend.

## Decisión

Modelar los accesos como `features`, asignar una ruta específica a cada una y describirlas mediante `businessObject`, `businessObjectVersion` y un mapa booleano de `capabilities`.

## Consecuencias

- Cada feature puede evolucionar con subrutas y pantallas propias.
- El frontend no queda acoplado a CDS, RAP, OData ni otra tecnología de integración.
- Las capacidades quedan declaradas sin implementar lógica o botones dinámicos.
- Será necesario mantener alineados el manifest y los metadatos de rutas del modelo.

