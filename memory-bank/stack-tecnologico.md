# Stack tecnologico

## Arquitectura general

- Frontend desacoplado de backend.
- Integracion local mediante proxy de Vite hacia la API.
- Orquestacion con Docker Compose.

## Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Recharts para visualizaciones
- Vitest para pruebas unitarias de utilidades

## Backend

- Python
- FastAPI
- Pydantic
- Pytest para pruebas de API y logica
- Uvicorn para ejecucion ASGI
- Debugpy habilitado en contenedor

## Infraestructura y desarrollo

- Docker
- Docker Compose
- Estructura de monorepo con carpetas frontend y backend

## Convenciones tecnicas observadas

- Tipado explicito en contratos de API.
- Uso de funciones helper para calculos de negocio.
- Estados de carga, error y vacio en UI asincrona.
- Pruebas en backend y frontend para logica critica.
