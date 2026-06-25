# ADR 0003: Servicio mock antes de RAP

## Contexto

Se necesita validar navegación, estructura visual y contratos frontend antes de disponer del backend productivo.

## Decisión

Utilizar una capa desacoplada formada por `IDataService`, `MockDataService` y `DataServiceFactory`. La implementación mock proveerá inicialmente solo metadatos de navegación.

## Consecuencias

- El frontend puede avanzar sin inventar endpoints reales.
- Los controladores dependen del contrato y no del archivo JSON.
- Una futura implementación OData podrá seleccionarse desde la fábrica.
- El mock no valida reglas de negocio, autorizaciones ni comportamiento transaccional real.

