# Etiquetas y Trazabilidad Klonal

## Objetivo

Construir una solución SAP Fiori única para centralizar la gestión de etiquetas y la trazabilidad de los procesos asociados, con una experiencia consistente y una arquitectura preparada para evolucionar hacia servicios RAP/OData.

## Alcance inicial

La primera etapa establece exclusivamente la base frontend:

- aplicación SAPUI5 freestyle;
- cockpit de acceso a las funciones principales;
- navegación interna mediante rutas específicas;
- pantallas genéricas reutilizables;
- datos de navegación provistos por un servicio mock desacoplado;
- preparación para sustituir el mock por servicios reales.

No forman parte de esta etapa la lógica operativa, la impresión productiva, la generación de Datamatrix, la autenticación propia ni la integración con un backend real.

## Módulos funcionales

1. Etiquetas hospitalarias / COMEX.
2. Bultos cuarentena.
3. Bultos aprobados / rechazados.
4. Trazabilidad.
5. Reimpresión.
6. Verificación scanner.
7. Reportes.
8. Configuración.
9. Logs.

## Arquitectura prevista

- Una única aplicación SAPUI5/Fiori freestyle.
- Controles estándar SAPUI5 y estética SAP Fiori nativa.
- Navegación basada en features con rutas específicas.
- Capa de servicios desacoplada mediante `IDataService`, `MockDataService` y `DataServiceFactory`.
- Modelo mock reemplazable sin acoplar los controladores al origen de datos.
- Backend objetivo basado en RAP y expuesto al frontend mediante OData.
- Separación explícita entre responsabilidades de frontend y backend.

## Estado actual

El proyecto dispone de:

- cockpit inicial con nueve features;
- rutas específicas para cada feature;
- pantalla genérica reutilizable para las rutas funcionales;
- modelo mock con metadatos de navegación, objeto de negocio y capacidades;
- capa de servicios mock desacoplada;
- build SAPUI5 validado;
- ausencia deliberada de endpoints y lógica de negocio real.

