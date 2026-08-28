# Fase 2 - Hallazgos de ingenieria derivados del codigo

Este documento lista patrones observados en el repositorio y reglas propuestas para cambios futuros.
Cada hallazgo incluye evidencia concreta.

## Architecture

### Hallazgo 1
- Categoria: architecture
- Regla/conclusion: Mantener calculo y transformacion de datos fuera de handlers HTTP cuando se editen endpoints existentes.
- Evidencia: `backend/app/routes.py` contiene funciones puras (`filter_movements`, `summarize_movements`, `build_top_categories`, `calculate_net_value`, `detect_outcome_alerts`) y luego endpoints que las orquestan.
- Archivos/rutas: `backend/app/routes.py`
- Por que importa: Reduce duplicacion y facilita testeo de logica sin capa HTTP.
- Que deberia hacer futuro contribuidor/agente: Si agrega/modifica logica de metricas, implementarla primero como funcion reusable y luego invocarla desde endpoint.

### Hallazgo 2
- Categoria: architecture
- Regla/conclusion: Evitar crecer mas `backend/app/routes.py` como modulo monolitico; nuevos bloques de dominio deberian extraerse por tema.
- Evidencia: `backend/app/routes.py` tiene 391 lineas y combina modelos Pydantic, generacion de datos, utilidades y rutas.
- Archivos/rutas: `backend/app/routes.py`
- Por que importa: Aumenta riesgo de regresiones y hace mas dificil revisar cambios acotados.
- Que deberia hacer futuro contribuidor/agente: Si agrega un nuevo grupo de endpoints, evaluar mover helpers/modelos relacionados a modulo separado en `backend/app/`.

## Backend/API

### Hallazgo 3
- Categoria: backend/api
- Regla/conclusion: Mantener contratos de respuesta tipados con `response_model` en endpoints publicos.
- Evidencia: Los endpoints de metricas usan `response_model` en `@router.get(...)`.
- Archivos/rutas: `backend/app/routes.py`
- Por que importa: Hace consistente el contrato JSON y facilita validacion automatica.
- Que deberia hacer futuro contribuidor/agente: No introducir endpoints sin `response_model` salvo endpoints internos justificados.

### Hallazgo 4
- Categoria: backend/api
- Regla/conclusion: Mantener filtros/parametros usando `Query(...)` tipado y restricciones cuando aplica.
- Evidencia: Parametros opcionales con `Query(default=None)` y limites como `limit: int = Query(default=5, ge=1, le=20)` y `threshold: float = Query(default=0.3, ge=0)`.
- Archivos/rutas: `backend/app/routes.py`
- Por que importa: Evita entradas invalidas y unifica comportamiento de filtros.
- Que deberia hacer futuro contribuidor/agente: Nuevos query params deben declarar tipo y restricciones en la firma del endpoint.

### Hallazgo 5
- Categoria: backend/api
- Regla/conclusion: Los datos mock del backend son deterministas por seed fija en endpoints.
- Evidencia: `generate_mock_movements(seed=42)` se usa en endpoints `/api/metrics*`.
- Archivos/rutas: `backend/app/routes.py`
- Por que importa: Permite resultados reproducibles para demo y tests.
- Que deberia hacer futuro contribuidor/agente: Si modifica generacion/filtros, conservar reproducibilidad o documentar explicitamente el cambio.

### Hallazgo 6 (riesgo)
- Categoria: backend/configuration
- Regla/conclusion: CORS esta abierto globalmente; cambios de entorno deben evitar ampliar aun mas ese alcance.
- Evidencia: `allow_origins=["*"]`, `allow_methods=["*"]`, `allow_headers=["*"]` en middleware CORS.
- Archivos/rutas: `backend/app/main.py`
- Por que importa: En despliegues reales puede exponer origenes no deseados.
- Que deberia hacer futuro contribuidor/agente: Si toca CORS, preferir origenes explicitos por entorno en lugar de comodin global.

## Frontend

### Hallazgo 7
- Categoria: frontend/architecture
- Regla/conclusion: Conservar separacion actual: `App.tsx` como orquestador de fetch/estado y componentes dashboard como presentacionales.
- Evidencia: `frontend/src/App.tsx` hace fetch y maneja `loading/error`; `frontend/src/components/dashboard/*.tsx` renderiza KPIs/charts.
- Archivos/rutas: `frontend/src/App.tsx`, `frontend/src/components/dashboard/`
- Por que importa: Limita acoplamiento entre red, estado y renderizado.
- Que deberia hacer futuro contribuidor/agente: Evitar introducir fetch directo dentro de tarjetas/graficos salvo justificacion fuerte.

### Hallazgo 8
- Categoria: frontend/ux
- Regla/conclusion: Mantener estados asincronos explicitos (loading, empty, error) en vistas que dependen de API.
- Evidencia: `KPICard`, `IncomeOutcomeChart`, `ProfitPercentChart` muestran skeleton/empty; `App.tsx` muestra banner de error.
- Archivos/rutas: `frontend/src/App.tsx`, `frontend/src/components/dashboard/kpi-card.tsx`, `frontend/src/components/dashboard/income-outcome-chart.tsx`, `frontend/src/components/dashboard/profit-percent-chart.tsx`
- Por que importa: Evita pantallas rotas y mejora degradacion ante fallos de red.
- Que deberia hacer futuro contribuidor/agente: Cualquier nuevo widget dependiente de fetch debe implementar al menos loading + empty + error.

### Hallazgo 9
- Categoria: frontend/api
- Regla/conclusion: Respetar estrategia de API relativa (`/api`) con override opcional por `VITE_API_BASE_URL`.
- Evidencia: `const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ""`; fetch a `${API_BASE_URL}/api/metrics`; proxy Vite `/api -> http://backend:8000`.
- Archivos/rutas: `frontend/src/App.tsx`, `frontend/vite.config.ts`, `frontend/.env.example`
- Por que importa: Mantiene compatibilidad entre Codespaces/local con Docker Compose.
- Que deberia hacer futuro contribuidor/agente: No hardcodear `http://localhost:8000` en componentes.

### Hallazgo 10 (riesgo)
- Categoria: frontend/consistency
- Regla/conclusion: El periodo mostrado en UI esta fijo y puede desalinearse de datos reales.
- Evidencia: `DashboardHeader period="2024 - Full Year"` en `App.tsx`; default alternativo `2024 — Full Year` en `dashboard-header.tsx`; backend genera fechas segun `date.today()` y puede cruzar anios.
- Archivos/rutas: `frontend/src/App.tsx`, `frontend/src/components/dashboard/dashboard-header.tsx`, `backend/app/routes.py`
- Por que importa: Puede inducir interpretaciones incorrectas del periodo analizado.
- Que deberia hacer futuro contribuidor/agente: Si toca header/filtros de fecha, derivar etiqueta de periodo desde datos/filtros reales.

### Hallazgo 11 (riesgo)
- Categoria: frontend/code-hygiene
- Regla/conclusion: Existe dataset local no usado que podria desalinearse del backend.
- Evidencia: `frontend/src/lib/mock-data.ts` exporta `mockMovements`; no hay imports de `mock-data` en `frontend/src/**`.
- Archivos/rutas: `frontend/src/lib/mock-data.ts`
- Por que importa: Puede generar confusion sobre fuente de datos vigente.
- Que deberia hacer futuro contribuidor/agente: Si vuelve a usarse, documentar su proposito; si no, evitar basar cambios en ese archivo.

## Testing

### Hallazgo 12
- Categoria: testing
- Regla/conclusion: Los cambios de logica de backend deben venir con pytest de endpoint/comportamiento.
- Evidencia: `backend/tests/test_routes.py` cubre health, filtros, facets, summary, top categories, comparison, alerts, b2b, b2c.
- Archivos/rutas: `backend/tests/test_routes.py`
- Por que importa: Detecta regresiones en contratos y filtros de API.
- Que deberia hacer futuro contribuidor/agente: Si cambia comportamiento de rutas/helpers backend, agregar o ajustar test en `backend/tests/`.

### Hallazgo 13
- Categoria: testing
- Regla/conclusion: Los calculos de frontend se prueban a nivel utilidades puras, no a nivel componentes.
- Evidencia: `frontend/src/lib/financial-utils.test.ts` valida `computeKPIs`, `computeMonthlyData`, `formatCurrency`, `formatPercent`.
- Archivos/rutas: `frontend/src/lib/financial-utils.test.ts`, `frontend/src/lib/financial-utils.ts`
- Por que importa: La logica numerica tiene tests rapidos y deterministas.
- Que deberia hacer futuro contribuidor/agente: Cambios en formulas/formateo deben actualizar estas pruebas.

## Tooling / DX

### Hallazgo 14
- Categoria: tooling
- Regla/conclusion: Docker Compose es el flujo de ejecucion integrado y reproducible del repo.
- Evidencia: `README.md`/`README.es.md` indican `docker compose up --build`; `docker-compose.yml` define ambos servicios con volumenes y puertos.
- Archivos/rutas: `README.md`, `README.es.md`, `docker-compose.yml`
- Por que importa: Evita desalineaciones de runtime entre frontend y backend.
- Que deberia hacer futuro contribuidor/agente: Para validaciones integradas, preferir comandos `docker compose`.

### Hallazgo 15
- Categoria: commits
- Regla/conclusion: El historial usa mensajes de commit orientados a tipo/cambio (`feat`, `docs`, `refactor`).
- Evidencia: `git log --oneline` muestra ejemplos: `feat: use Vite API proxy...`, `docs: ...`, `Refactor list comprehensions...`.
- Archivos/rutas: historial Git
- Por que importa: Facilita rastreo de intencion por commit.
- Que deberia hacer futuro contribuidor/agente: Mantener mensajes de commit claros y enfocados en una sola unidad de cambio.

## Reglas propuestas (priorizadas)

1. Endpoint backend nuevo o modificado: incluir `response_model` y `Query(...)` tipado con restricciones cuando corresponda.
   - Evidencia: `backend/app/routes.py`.

2. Cambio en metricas/filtros backend: conservar determinismo de datos de prueba/demo y actualizar pytest correspondiente.
   - Evidencia: `generate_mock_movements(seed=42)` + `backend/tests/test_routes.py`.

3. Cambio de fetch/UI asincrona frontend: implementar y verificar estados loading + empty + error.
   - Evidencia: `frontend/src/App.tsx` + componentes de dashboard.

4. Cambio de consumo API frontend: usar rutas relativas `/api` y no hardcodear host; `VITE_API_BASE_URL` solo como override.
   - Evidencia: `frontend/src/App.tsx`, `frontend/vite.config.ts`, `frontend/.env.example`.

5. Cambio de calculos/formateo frontend: modificar funciones en `frontend/src/lib/financial-utils.ts` y sus tests en `frontend/src/lib/financial-utils.test.ts`.
   - Evidencia: pruebas existentes sobre utilidades puras.

6. Si se toca CORS o despliegue backend: no ampliar configuracion permisiva actual; preferir origenes explicitos por entorno.
   - Evidencia: `backend/app/main.py`.

7. Evitar ampliar el modulo `backend/app/routes.py` con nuevas responsabilidades no relacionadas; extraer por dominio cuando crezca.
   - Evidencia: archivo actual de 391 lineas con responsabilidades mixtas.

8. Cambios sobre periodo temporal del dashboard: derivar etiqueta de periodo desde datos/filtros reales para evitar desalineacion.
   - Evidencia: `frontend/src/App.tsx`, `frontend/src/components/dashboard/dashboard-header.tsx`, `backend/app/routes.py`.
