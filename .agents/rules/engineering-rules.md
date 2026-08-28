# Reglas de Ingenieria del Proyecto

## Alcance

- Aplica a todo cambio en `backend/` y `frontend/`.
- Estas reglas gobiernan codigo nuevo y modificaciones de comportamiento.
- Si hay deuda previa, el cambio no debe empeorarla en los archivos tocados.

## Regla 1 - Contratos tipados en endpoints FastAPI

- Nombre: Contratos tipados en API
- Alcance: Endpoints en `backend/app/routes.py` y nuevos modulos de rutas.
- Justificacion: El backend actual define `response_model` en todos los endpoints publicos y usa tipos `Literal`/Pydantic para el contrato de datos.
- Instrucciones accionables:
  - Todo endpoint nuevo/modificado debe incluir `response_model`.
  - Todo query param debe tener tipo explicito y usar `Query(...)`.
  - Si aplica, agregar restricciones (`ge`, `le`, requerido con `Query(...)`).
- Evidencia del repositorio:
  - `@router.get(..., response_model=...)` en `backend/app/routes.py`.
  - `limit: int = Query(default=5, ge=1, le=20)` en `backend/app/routes.py`.
- Ejemplo:
  - Correcto: `@router.get("/api/metrics/top", response_model=list[TopCategoryItem])`.
  - Incorrecto: endpoint sin `response_model` y parametros sin `Query`.

## Regla 2 - Datos reproducibles para demo y test

- Nombre: Determinismo de dataset
- Alcance: Generacion y filtrado de datos en backend.
- Justificacion: El backend usa `generate_mock_movements(seed=42)` para respuestas repetibles.
- Instrucciones accionables:
  - Si se cambia la generacion mock, conservar modo determinista para pruebas.
  - Si se altera filtro/orden, actualizar tests de cantidad, orden y/o campos.
- Evidencia del repositorio:
  - `generate_mock_movements(seed=42)` en endpoints de `backend/app/routes.py`.
  - Tests de orden y filtros en `backend/tests/test_routes.py`.
- Ejemplo:
  - Correcto: agregar test que compare salidas con misma seed.

## Regla 3 - Logica de negocio fuera de handlers/UI

- Nombre: Orquestadores delgados
- Alcance: Endpoints backend y componentes frontend.
- Justificacion: El proyecto separa calculos en helpers (`summarize_movements`, `computeKPIs`, `computeMonthlyData`).
- Instrucciones accionables:
  - Nuevos calculos van en funciones reutilizables.
  - Endpoints/componentes deben orquestar, no concentrar toda la logica.
- Evidencia del repositorio:
  - Helpers y endpoints en `backend/app/routes.py`.
  - Utilidades en `frontend/src/lib/financial-utils.ts`.
  - `App.tsx` consume utilidades, no recalcula metricas inline.
- Ejemplo:
  - Correcto: agregar calculo en `frontend/src/lib/financial-utils.ts` y test asociado.

## Regla 4 - Tests obligatorios en cambios de comportamiento

- Nombre: Cobertura de comportamiento
- Alcance: Cambios funcionales en backend y frontend.
- Justificacion: Hay suites activas de pytest y vitest que cubren comportamientos concretos.
- Instrucciones accionables:
  - Cambio de backend: ajustar/crear tests en `backend/tests/`.
  - Cambio de calculo/formato frontend: ajustar/crear tests en `frontend/src/lib/`.
- Evidencia del repositorio:
  - `backend/tests/test_routes.py`.
  - `frontend/src/lib/financial-utils.test.ts`.
- Ejemplo:
  - Correcto: cambio en formula de margen -> actualizar expectativas en `financial-utils.test.ts`.

## Regla 5 - Resiliencia UI para estados asincronos

- Nombre: Loading/empty/error obligatorios
- Alcance: Vistas frontend que dependen de fetch.
- Justificacion: La UI actual ya cubre estos estados en dashboard.
- Instrucciones accionables:
  - Mantener estado `loading` y skeletons.
  - Mantener fallback de estado vacio en graficos.
  - Mantener manejo de error visible cuando falla API.
- Evidencia del repositorio:
  - `loading` y `catch` en `frontend/src/App.tsx`.
  - Skeleton en `frontend/src/components/dashboard/kpi-card.tsx`.
  - Empty state en charts de `frontend/src/components/dashboard/`.
- Ejemplo:
  - Correcto: nuevo grafico incluye skeleton y mensaje de no data.

## Regla 6 - Estrategia de API en frontend

- Nombre: Rutas relativas con override controlado
- Alcance: Llamadas HTTP del frontend.
- Justificacion: El frontend usa `/api` y Vite proxy a `backend:8000`; `VITE_API_BASE_URL` es override opcional.
- Instrucciones accionables:
  - Usar rutas relativas `/api/...` por defecto.
  - Usar `VITE_API_BASE_URL` solo para override de entorno.
  - No hardcodear host/puerto en componentes.
- Evidencia del repositorio:
  - `frontend/src/App.tsx`.
  - `frontend/vite.config.ts`.
  - `frontend/.env.example`.
- Ejemplo:
  - Correcto: `fetch(`${API_BASE_URL}/api/metrics`)`.

## Regla 7 - CORS no mas permisivo que el estado actual

- Nombre: Control de CORS por entorno
- Alcance: Configuracion de FastAPI en `backend/app/main.py`.
- Justificacion: El estado actual usa comodines (`*`), lo cual es riesgo conocido.
- Instrucciones accionables:
  - Si se toca CORS, no ampliar permisos.
  - Preferir origenes explicitos por entorno cuando se introduzca configuracion de despliegue.
- Evidencia del repositorio:
  - `allow_origins=["*"]`, `allow_methods=["*"]`, `allow_headers=["*"]` en `backend/app/main.py`.
- Ejemplo:
  - Correcto: migrar a lista de origenes por variable de entorno.

## Regla 8 - Evitar inconsistencias visibles de periodo

- Nombre: Periodo UI consistente
- Alcance: Header/filtros de tiempo del dashboard.
- Justificacion: Existen dos literales de periodo y el backend genera fechas dinamicas por `date.today()`.
- Instrucciones accionables:
  - Evitar duplicar literales de periodo en varios componentes.
  - Si se modifica el periodo mostrado, derivarlo de filtros/datos activos.
- Evidencia del repositorio:
  - `frontend/src/App.tsx` y `frontend/src/components/dashboard/dashboard-header.tsx`.
  - Logica de fechas en `backend/app/routes.py`.
- Ejemplo:
  - Correcto: centralizar una sola fuente de periodo en frontend.

## Flujo de verificacion recomendado

1. Levantar servicios:
   - `docker compose up --build -d`
2. Smoke checks:
   - `curl http://localhost:8000/health`
   - `curl -o /dev/null -w '%{http_code}\n' http://localhost:5173`
3. Pruebas y calidad:
   - `docker compose run --rm backend pytest -q`
   - `docker compose run --rm frontend npm run test -- --run`
   - `docker compose run --rm frontend npm run lint`
4. Cierre:
   - `docker compose down`
