# Tech Stack (verificado)

Fecha de actualizacion: 2026-08-28

## HECHO / VERIFICADO

- Lenguajes:
  - Python en backend.
    - Evidencia: `backend/app/main.py`, `backend/app/routes.py`.
  - TypeScript en frontend.
    - Evidencia: `frontend/src/*.tsx`, `frontend/src/lib/*.ts`.
- Frameworks/librerias:
  - Backend: FastAPI + Pydantic + Uvicorn.
    - Evidencia: `backend/requirements.txt`, `backend/Dockerfile`.
  - Frontend: React 19 + Vite + Tailwind CSS + Recharts.
    - Evidencia: `frontend/package.json`, `frontend/vite.config.ts`, `frontend/src/components/dashboard/*.tsx`, `frontend/src/index.css`.
- Testing/tooling:
  - Backend: pytest.
    - Evidencia: `backend/tests/test_routes.py`, `backend/requirements.txt`.
  - Frontend: vitest + eslint + typescript (`tsc -b` en build).
    - Evidencia: scripts en `frontend/package.json`, config en `frontend/eslint.config.js`, `frontend/tsconfig.app.json`.
- Infraestructura local:
  - Docker Compose con 2 servicios (`frontend`, `backend`) y puertos 5173/8000 (+5678 debug backend).
    - Evidencia: `docker-compose.yml`, `backend/Dockerfile`, `frontend/Dockerfile`.
- Estrategia de conectividad frontend-backend:
  - Proxy de Vite para `/api` a `http://backend:8000` con override opcional `VITE_API_BASE_URL`.
    - Evidencia: `frontend/vite.config.ts`, `frontend/src/App.tsx`, `frontend/.env.example`.

## INCOMPLETO

- Configuracion de CORS por entorno no esta implementada; existe configuracion permisiva unica.
  - Evidencia: `backend/app/main.py` (`allow_origins=["*"]`).

## DESCONOCIDO

- Base de datos: no hay evidencia de DB relacional/no relacional en el repositorio.
- Servicios externos de terceros: no hay evidencia de integraciones externas activas.
