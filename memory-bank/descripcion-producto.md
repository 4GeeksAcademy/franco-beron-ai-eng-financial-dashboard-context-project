# Product Overview (verificado)

Fecha de actualizacion: 2026-08-28

## HECHO / VERIFICADO

- Es un dashboard de metricas financieras con frontend React+TypeScript y backend FastAPI.
  - Evidencia: `frontend/src/App.tsx`, `backend/app/main.py`, `README.md`.
- La pantalla principal muestra 4 KPIs: Total Income, Total Outcome, Profit y Profit Margin.
  - Evidencia: `frontend/src/components/dashboard/kpi-row.tsx`.
- La UI incluye 2 graficos: Income vs Outcome y Profit Margin %.
  - Evidencia: `frontend/src/components/dashboard/income-outcome-chart.tsx`, `frontend/src/components/dashboard/profit-percent-chart.tsx`.
- El backend expone endpoints de salud y metricas (base, facets, summary, top categories, comparison, alerts, b2b, b2c).
  - Evidencia: `backend/app/routes.py`.
- La fuente de datos actual del backend es mock y determinista por seed fija en endpoints.
  - Evidencia: `generate_mock_movements(seed=42)` en `backend/app/routes.py`.

## INCOMPLETO

- No se observa persistencia en base de datos; los datos se generan en memoria por request.
  - Evidencia: ausencia de cliente DB y uso de funciones de generacion en `backend/app/routes.py`.
- El periodo visible del dashboard permanece como literal fijo en frontend.
  - Evidencia: `frontend/src/components/dashboard/dashboard-header.tsx`.

## DESCONOCIDO

- No hay evidencia directa en el repositorio de usuarios finales reales, volumen de uso o contexto de negocio productivo.
- No hay evidencia de despliegue productivo o SLA operativos en archivos del repo.
