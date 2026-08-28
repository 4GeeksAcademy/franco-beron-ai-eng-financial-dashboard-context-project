# Frontend Data Contract Spec

Objetivo: permitir que otro agente implemente frontend sin ambiguedades, usando solo contrato real de API verificado en /docs.

Artefactos relacionados:

- `frontend/specs/api-types.ts`
- `frontend/specs/param-types.ts`
- `frontend/specs/components.md`

Fuente de verificacion:

- OpenAPI obtenido desde `GET /openapi.json` del backend en ejecucion.
- Patrones frontend existentes en `frontend/src/App.tsx` y `frontend/src/components/dashboard/*`.

## Matriz de verificacion PM vs API

- ✅ Verificado en /docs:
- `GET /api/metrics/facets`
- `GET /api/metrics/alerts`
- `GET /api/metrics/categories/top`
- `GET /api/metrics` (endpoint existente para filtro de fechas)
- ❌ Contradice /docs:
- PM sugiere threshold 0.01..1.0; OpenAPI define `minimum: 0`, `default: 0.3`, sin maximo.
- PM menciona media movil de 3 periodos; API solo entrega `baseline_average` sin metadato de ventana.
- ❓ No verificable todavia:
- Definicion formal en docs del algoritmo exacto de `baseline_average`.
- Ruta frontend exacta para nueva pagina comparativa B2B/B2C.

## Funcionalidad 1: Filtro de rango de fechas

### 1. Endpoint(s)

- `GET /api/metrics`.
- Endpoint de soporte para mostrar rango disponible: `GET /api/metrics/facets`.

### 2. Request/query params

Para `GET /api/metrics`:

- `start_date`
- tipo: `string` (formato date en OpenAPI)
- requerido: no
- formato: `YYYY-MM-DD`
- significado: limite inferior inclusivo
- `end_date`
- tipo: `string` (formato date)
- requerido: no
- formato: `YYYY-MM-DD`
- significado: limite superior inclusivo
- `category`
- tipo: enum `"suppliers" | "sales" | "operational" | "administrative" | "others"`
- requerido: no
- `operation_type`
- tipo: enum `"income" | "outcome"`
- requerido: no

Para `GET /api/metrics/facets`:

- sin query params.

### 3. Response

- Para `GET /api/metrics`: `MetricsResponse` (`FinancialMovement[]`).
- Campos por item:
- `create_date: string` (date)
- `amount: number`
- `operation_type: "income" | "outcome"`
- `category: Category`
- `business_type: "B2B" | "B2C"`
- Para `GET /api/metrics/facets`: `MetricsFacetsResponse`.
- Campos:
- `operation_types: OperationType[]`
- `business_types: BusinessType[]`
- `categories: Category[]`
- `min_date: string` (date)
- `max_date: string` (date)

### 4. Reglas de UI

- Si `start_date` y `end_date` vacios: no enviar ambos params y mostrar dataset completo.
- Si solo uno esta presente: enviar solo el presente.
- El rango disponible visible al usuario se toma de `min_date`/`max_date` de facets.
- Si `start_date > end_date`: tratar como validacion UI (sin asumir error backend) y bloquear nueva ejecucion hasta correccion.
- Si formato invalido: mostrar error de campo y no ejecutar query.

### 5. Casos limite

- Caso 1: filtro vacio `{}` -> mostrar todos los movimientos.
- Caso 2: solo `start_date` -> filtrar desde ese dia inclusive.
- Caso 3: solo `end_date` -> filtrar hasta ese dia inclusive.
- Caso 4: `start_date > end_date` -> invalidacion UI local.

## Funcionalidad 2: Tabla de alertas

### 1. Endpoint(s)

- `GET /api/metrics/alerts`.

### 2. Request/query params

- `threshold`
- tipo: `number`
- requerido: no
- default: `0.3`
- rango permitido por OpenAPI: `>= 0`
- nota: OpenAPI no define maximo.
- `group_by`
- tipo: enum `"day" | "week" | "month"`
- requerido: no
- default: `"month"`
- `start_date`
- tipo: `string` (date)
- requerido: no
- formato: `YYYY-MM-DD`
- `end_date`
- tipo: `string` (date)
- requerido: no
- formato: `YYYY-MM-DD`
- `business_type`
- tipo: enum `"B2B" | "B2C"`
- requerido: no

### 3. Response

- Tipo: `MetricsAlertsResponse` (`MetricsAlertEntry[]`).
- Campos por fila:
- `period: string`
- `outcome_total: number`
- `baseline_average: number`
- `increase_ratio: number` (ratio, no porcentaje)
- Nullabilidad: en OpenAPI los cuatro campos son requeridos.

### 4. Reglas de UI

- Tabla visible siempre, incluso sin resultados.
- Columnas requeridas por PM se mapean asi:
- periodo -> `period`
- outcome registrado -> `outcome_total`
- media movil 3 periodos anteriores -> ❌ no existe campo equivalente directo en API; usar `baseline_average` con etiqueta neutral y registrar discrepancia
- incremento porcentual -> `increase_ratio * 100` para formato visual
- Validacion de threshold:
- contrato API: `>= 0`
- regla de producto 0.01..1.0, si se adopta, debe tratarse como validacion de UI (no como restriccion backend)

### 5. Casos limite

- Caso 1: `rows.length === 0` -> mostrar estado vacio dentro de tabla, no ocultar tabla.
- Caso 2: threshold negativo -> bloquear envio y mostrar error de input.
- Caso 3: threshold en default (0.3) -> consulta valida.
- Caso 4: `start_date > end_date` -> invalidacion UI previa al request.

## Funcionalidad 3: Comparativa B2B vs B2C

### 1. Endpoint(s)

- `GET /api/metrics/categories/top` (llamado una vez para B2B y otra para B2C).
- `GET /api/metrics/facets` para rango de fechas/categorias disponibles.

### 2. Request/query params

Para cada llamada a `GET /api/metrics/categories/top`:

- `operation_type`
- tipo: enum `"income" | "outcome"`
- requerido: no
- default OpenAPI: `"outcome"`
- Para "total de ingresos" del PM, usar `"income"` como decision de UI.
- `limit`
- tipo: `integer`
- requerido: no
- default: `5`
- restricciones OpenAPI: `1..20`
- `start_date`
- tipo: `string` (date)
- requerido: no
- `end_date`
- tipo: `string` (date)
- requerido: no
- `business_type`
- tipo: enum `"B2B" | "B2C"`
- requerido: no
- valor requerido por flujo UI: fijo por panel (`"B2B"` en panel B2B, `"B2C"` en panel B2C)

### 3. Response

- Tipo: `TopCategoriesResponse` (`TopCategoryEntry[]`).
- Campos por fila:
- `category: Category`
- `operation_type: OperationType`
- `total_amount: number`
- Campo de porcentaje por grupo:
- ❌ no lo entrega la API.
- decision UI: derivar `share_percent = total_amount / sum(total_amount panel) * 100`.

### 4. Reglas de UI

- Vista paralela con dos tablas: una para B2B y otra para B2C.
- Cada tabla muestra top 5 (`limit=5`).
- Si hay menos de 5 filas, mostrar solo disponibles y mantener estructura visible.
- Si un panel queda sin datos, mostrar estado vacio en ese panel sin ocultarlo.
- Grafico unico debajo:
- si un grupo no tiene datos, renderizar la otra serie y serie vacia en 0 para el grupo faltante
- si ambos grupos no tienen datos, estado vacio del grafico
- Filtro de fechas compartido entre ambos paneles.

### 5. Casos limite

- Caso 1: B2B devuelve 3 filas y B2C devuelve 5 -> mantener ambas tablas con sus conteos reales.
- Caso 2: B2C devuelve 0 filas -> tabla B2C vacia visible + grafico comparativo con datos de B2B.
- Caso 3: ambos paneles 0 filas -> ambas tablas vacias visibles + grafico en empty state.
- Caso 4: solo `start_date` o solo `end_date` -> aplicar a ambos requests.

## Checklist de implementacion para otro agente

- Usar exclusivamente tipos de `frontend/specs/api-types.ts` y `frontend/specs/param-types.ts`.
- No renombrar campos de API.
- Tratar discrepancias PM/API como reglas de UI documentadas, nunca como suposicion de backend.
- Mantener patron existente de estados loading/error/empty.
- No crear reglas de validacion de API que no esten en OpenAPI.
