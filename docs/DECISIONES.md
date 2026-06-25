# Decisiones iniciales

## Una sola aplicación Fiori

La solución se construirá inicialmente como una única aplicación Fiori freestyle con navegación interna por features. La separación en aplicaciones adicionales solo se evaluará si aparecen límites funcionales, de despliegue o de autorización que lo justifiquen.

## Sin CAP inicialmente

CAP no forma parte de la arquitectura inicial. No se incorporará una capa CAP sin una necesidad concreta de dominio, integración o exposición de servicios que RAP no cubra adecuadamente.

## RAP como backend objetivo

El backend productivo previsto se implementará con RAP y se expondrá al frontend mediante servicios OData. Durante la etapa actual no se crearán ni consumirán endpoints reales.

## Login fuera del alcance inicial

La aplicación no implementará login propio en esta etapa. La arquitectura deberá permitir una integración futura con los mecanismos de identidad, autenticación y autorización definidos para el entorno SAP.

## Impresión inicial desde Fiori/PDF

La primera alternativa de impresión será gestionada desde Fiori mediante documentos o salidas PDF. Integraciones específicas con impresoras, lenguajes de impresión o servicios externos se evaluarán en etapas posteriores.

## Backend real fuera de esta etapa

No se modificará ni simulará un backend productivo durante la construcción del esqueleto frontend. Los datos iniciales se limitarán a metadatos de navegación y configuración mock.

