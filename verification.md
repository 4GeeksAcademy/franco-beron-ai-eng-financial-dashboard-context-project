# Fase 1 - Handover verificado

## Resumen del proyecto (contrastado con codigo)

Proyecto full-stack de dashboard de metricas financieras.

- Frontend: aplicacion React + TypeScript con Vite que consume `GET /api/metrics` y calcula KPIs/charts en cliente.
- Backend: API FastAPI que expone endpoints de metricas sobre datos mock deterministas (seed fija `42`).
- Infraestructura: `docker compose` orquesta dos servicios (`frontend`, `backend`) con puertos `5173` y `8000`.

Evidencia principal:

- App backend y middleware CORS: `backend/app/main.py`
- Endpoints y modelos: `backend/app/routes.py`
- Arranque backend en contenedor: `backend/Dockerfile`
- Entry point frontend: `frontend/src/main.tsx`
- Fetch a API y estado loading/error: `frontend/src/App.tsx`
- Proxy `/api` a backend en entorno compose: `frontend/vite.config.ts`
- Orquestacion servicios: `docker-compose.yml`

## Estructura y componentes clave verificados

- Entry points:
  - Backend ASGI: `app.main:app` (definido en `backend/Dockerfile`)
  - Frontend browser: `frontend/src/main.tsx`
- Aplicaciones principales:
  - `backend/` (FastAPI)
  - `frontend/` (React + Vite)
- Servicios:
  - `frontend` y `backend` en `docker-compose.yml`
- Scripts:
  - Frontend (`frontend/package.json`): `dev`, `build`, `lint`, `test`, `test:watch`, `test:coverage`
  - Backend: sin script runner en `package` equivalente; se usa `pytest`/`uvicorn` y Dockerfile.
- Configuracion:
  - Vite proxy y alias: `frontend/vite.config.ts`
  - ESLint: `frontend/eslint.config.js`
  - TSConfig: `frontend/tsconfig*.json`
  - CORS backend: `backend/app/main.py`
- Infraestructura:
  - `docker-compose.yml`
  - `frontend/Dockerfile`, `backend/Dockerfile`
- Tests:
  - Backend pytest: `backend/tests/test_routes.py`
  - Frontend vitest: `frontend/src/lib/financial-utils.test.ts`
- Documentacion existente:
  - `README.md`, `README.es.md`
  - Regla previa de agentes: `.agents/rules/engineering-rules.md`
  - Memoria existente: `memory-bank/*.md`
- Dependencias importantes:
  - Backend: `fastapi`, `uvicorn`, `pytest`, `httpx` (`backend/requirements.txt`)
  - Frontend: `react`, `vite`, `typescript`, `recharts`, `vitest`, `eslint` (`frontend/package.json`)

## Rutas/entry points importantes verificadas en codigo

Backend rutas en `backend/app/routes.py`:

- `GET /health`
- `GET /api/metrics`
- `GET /api/metrics/facets`
- `GET /api/metrics/summary`
- `GET /api/metrics/categories/top`
- `GET /api/metrics/comparison`
- `GET /api/metrics/alerts`
- `GET /api/metrics/b2b`
- `GET /api/metrics/b2c`

Frontend consumo principal:

- `fetch("${API_BASE_URL}/api/metrics")` en `frontend/src/App.tsx`

## Como se ejecuta realmente (verificado)

Instalacion local (sin Docker):

- Backend: `pip install -r backend/requirements.txt`
- Frontend: `npm ci` (en este entorno fallo por permisos; ver seccion de fallos)

Ejecucion integrada recomendada:

- `docker compose up --build -d`
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

Validaciones de desarrollo/build/tests:

- Backend tests: `cd backend && pytest -q`
- Frontend tests (via Docker): `docker compose run --rm frontend npm run test -- --run`
- Frontend lint (via Docker): `docker compose run --rm frontend npm run lint`
- Frontend build+typecheck (via Docker): `docker compose run --rm frontend npm run build`

## Registro corto de verificacion

Que verifique:

- Estructura completa de archivos y carpetas.
- Entry points y rutas API en codigo fuente.
- Scripts de frontend y dependencias backend/frontend.
- Flujo de ejecucion con Docker Compose.
- Tests reales backend/frontend, lint y build frontend.

Comandos ejecutados (principales):

- `find . -maxdepth 4 -type f | sort`
- `docker compose config --services`
- `cd backend && pytest -q`
- `cd frontend && npm run test -- --run` (antes de instalar dependencias)
- `cd backend && pip install -r requirements.txt`
- `cd frontend && npm ci`
- `docker compose run --rm frontend npm run test -- --run`
- `docker compose run --rm frontend npm run lint`
- `docker compose run --rm frontend npm run build`
- `docker compose up -d`
- `docker compose ps`
- `curl http://localhost:8000/health`
- `curl 'http://localhost:8000/api/metrics?start_date=2025-03-01&end_date=2025-03-01'`
- `curl -o /dev/null -w '%{http_code}\n' http://localhost:5173`
- `docker compose down`

Que funciono:

- `docker compose config --services` devuelve `backend` y `frontend`.
- Backend tests: `15 passed` (warning de deprecacion de `starlette.testclient`/`httpx`).
- Frontend tests en Docker: `5 passed`.
- Frontend lint en Docker: comando ejecutado sin errores.
- Frontend build en Docker: build OK; advertencia por chunk > 500 kB.
- `GET /health` retorna `{"status":"ok"}`.
- Frontend responde `HTTP 200` en `http://localhost:5173`.

Que fallo:

- `cd backend && pytest -q` inicialmente fallo por `ModuleNotFoundError: fastapi` (antes de instalar deps).
- `cd frontend && npm run test -- --run` inicialmente fallo por `vitest: not found` (deps no instaladas).
- `cd frontend && npm ci` fallo en host por permisos `EACCES` en `frontend/node_modules`.

Gaps / incertidumbres:

- No se ejecuto un flujo de desarrollo interactivo prolongado (`npm run dev` + uso manual de UI), solo smoke checks HTTP y comandos de build/test/lint.
- No hay evidencia en este repo de pipeline CI configurado (no se detectaron workflows en `.github/`).
