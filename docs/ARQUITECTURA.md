# Arquitectura

## Aplicación SAPUI5 freestyle

La solución se implementa como una única aplicación SAPUI5 freestyle. Este enfoque permite controlar la navegación, el layout y los futuros flujos operativos sin dividir prematuramente el producto en múltiples aplicaciones.

La interfaz utiliza controles estándar de `sap.m`, `sap.f` y `sap.ui.layout`, con el tema y los patrones visuales nativos de SAP Fiori.

## Capa de servicios desacoplada

Los controladores no acceden directamente a archivos JSON ni deben conocer cómo se obtienen o persisten los datos. El acceso se canaliza mediante:

- `IDataService`: contrato común de acceso a datos y operaciones;
- `MockDataService`: implementación inicial basada en datos locales;
- `DataServiceFactory`: punto central de selección de la implementación.

Los métodos operativos todavía no disponibles fallan de forma controlada con el mensaje `Not implemented yet`.

## Integración futura RAP/OData

El backend objetivo será RAP. La futura implementación de servicio podrá consumir OData y reemplazar a `MockDataService` desde la fábrica, manteniendo estable el contrato utilizado por el frontend.

No se presupone que todos los objetos o capacidades deban resolverse de la misma manera. Una capacidad futura podría corresponder a una entidad, una acción RAP, una operación OData o una integración externa.

## Separación frontend/backend

El frontend es responsable de:

- presentación y navegación;
- estado visual;
- interacción con el usuario;
- consumo del contrato de servicios.

El backend será responsable de:

- reglas de negocio;
- persistencia;
- autorizaciones;
- consistencia transaccional;
- integraciones;
- generación o provisión de datos operativos.

Esta separación evita incluir reglas productivas en controladores SAPUI5 o acoplar la interfaz a estructuras temporales.

## Modelo basado en features

El modelo de navegación utiliza `features` porque cada entrada representa una capacidad funcional visible de la aplicación, no necesariamente una entidad técnica.

Cada feature incluye:

- `route`: ruta específica que identifica su flujo de navegación;
- `businessObject`: nombre conceptual y neutral del objeto de negocio;
- `businessObjectVersion`: versión del contrato conceptual;
- `capabilities`: mapa booleano que declara capacidades posibles sin ejecutarlas;
- metadatos visuales y de orden.

`businessObject` evita asumir si la implementación futura será CDS, RAP, OData u otra integración. `capabilities` permite expresar de forma extensible qué operaciones admite conceptualmente cada feature, sin crear botones ni lógica dinámica en esta etapa.

