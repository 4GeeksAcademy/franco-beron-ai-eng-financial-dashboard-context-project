# Progress Log

## 2026-08-28 - feature/agent-skills

### Skills descubiertas

- accessibility: addyosmani/web-quality-skills@accessibility
- vercel-react-best-practices: vercel-labs/agent-skills@vercel-react-best-practices
- performance: addyosmani/web-quality-skills@performance
- temas explorados por busqueda: performance, testing, typescript

### Skills aplicadas

- accessibility
- vercel-react-best-practices
- performance

### Skill adicional elegida y por que

- performance, por impacto real en este repo: Recharts agrega peso al bundle inicial y el dashboard renderiza dos charts en la vista principal.

### Cambios realizados

- frontend/src/App.tsx:
  - Se agrego skip link y destino de foco para navegacion por teclado.
  - Se agrego role=alert y aria-live al mensaje de error.
  - Se cambio estado derivado (metrics, monthlyData) a derivacion con useMemo desde una sola fuente (movements).
  - Se agrego cancelacion de fetch con AbortController.
  - Se aplico carga diferida de charts con React.lazy + Suspense.
- frontend/src/components/dashboard/dashboard-header.tsx:
  - Icono decorativo marcado con aria-hidden y focusable=false.
- frontend/src/components/dashboard/kpi-card.tsx:
  - Iconos decorativos KPI marcados con aria-hidden y focusable=false.
- frontend/src/components/dashboard/income-outcome-chart.tsx:
  - Se agrego figure/figcaption con resumen textual para lectores de pantalla.
- frontend/src/components/dashboard/profit-percent-chart.tsx:
  - Se agrego figure/figcaption con resumen textual para lectores de pantalla.
- frontend/src/index.css:
  - Se agregaron estilos globales de :focus-visible, .skip-link y .sr-only.
- .skills/financial-dashboard-feature-workflow/SKILL.md:
  - Nueva skill interna para cambios de dashboard con contrato API y verificaciones del proyecto.

### Verificaciones ejecutadas

- docker compose run --rm frontend npm run build
- docker compose run --rm frontend npm run lint
- docker compose run --rm frontend npm run test -- --run

### Resultado de build

- Build frontend: OK.
- Lint frontend: OK.
- Tests frontend: OK (5 passed).

### Limitaciones o pendientes

- Reglas especificas de Next.js (next/image, next/font, metadata de app router) no aplican a este repositorio porque el frontend actual usa Vite + React.
