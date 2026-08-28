# Component Spec (sin implementacion)

Fuente de verdad de API: OpenAPI real en /docs (consultado via GET /openapi.json).
Tipos de referencia: `frontend/specs/api-types.ts` y `frontend/specs/param-types.ts`.

## Verificacion PM vs API

- ✅ Verificado en /docs: existen `GET /api/metrics/facets`, `GET /api/metrics/alerts`, `GET /api/metrics/categories/top`, `GET /api/metrics`.
- ❌ Contradiccion PM vs API: PM define threshold entre 0.01 y 1.0; OpenAPI define solo `minimum: 0`, `default: 0.3`, sin maximo.
- ❌ Contradiccion PM vs API: PM pide "media movil de los 3 periodos anteriores"; API solo expone `baseline_average` sin metadato de ventana.
- ❓ Sin verificar en /docs: semantica exacta de calculo de `baseline_average` (OpenAPI no documenta ventana). Patrón en backend actual usa promedio historico previo, no ventana fija de 3.

## Patrones frontend existentes relevantes

- Fetch actual centralizado en contenedor principal: `frontend/src/App.tsx`.
- Estados async visibles: loading + error + empty en dashboard actual.
- ❓ No hay patrones existentes de tabla ni inputs de fecha en `frontend/src/components`.

## 1) Funcionalidad: filtro de rango de fechas

### Componente

- Nombre: `DateRangeFilterBar`
- Responsabilidad: capturar y validar `start_date`/`end_date` para filtrar datos del dashboard.
- Donde aparece: dashboard principal y pagina comparativa B2B vs B2C.

### Props

- `value: DateRangeFilter`
- `availableRange: Pick<MetricsFacetsResponse, "min_date" | "max_date">`
- `onChange: (next: DateRangeFilter) => void`
- `onValidationChange: (state: DateRangeValidationState) => void`

### Tipos auxiliares (para implementación futura)

- `type DateRangeValidationCode = "none" | "format" | "start_after_end"`
- `interface DateRangeValidationState {`
- `  valid: boolean`
- `  code: DateRangeValidationCode`
- `  message?: string`
- `}`

### Comportamiento

- Ambos inputs son opcionales.
- Formato esperado por contrato: `YYYY-MM-DD`.
- Debe mostrar cerca de inputs el rango disponible real: `min_date` - `max_date`.
- Si ambos campos estan vacios: enviar filtro vacio (sin `start_date` ni `end_date`) y mostrar todos los datos disponibles.
- Si solo existe `start_date`: enviar solo `start_date`.
- Si solo existe `end_date`: enviar solo `end_date`.
- Si `start_date > end_date`: no bloquear UI global, pero marcar estado invalido local y evitar disparar nueva consulta hasta corregir.
- Si formato invalido: marcar estado invalido local y no disparar nueva consulta.
- No aplicar reglas de "clamp" automatico fuera de `min_date`/`max_date` porque OpenAPI no define error/normalizacion para esos casos.

### Casos limite

- `value = {}`: estado valido, filtros apagados.
- Solo un borde temporal presente: estado valido.
- `start_date > end_date`: estado invalido (`code: "start_after_end"`).

## 2) Funcionalidad: tabla de alertas

### Componente

- Nombre: `AlertsTableSection`
- Responsabilidad: renderizar alertas de anomalias y controles de threshold/rango.
- Donde aparece: dashboard principal, debajo de KPIs/charts.

### Props

- `rows: MetricsAlertsResponse`
- `query: AlertsParams`
- `dateRange: DateRangeFilter`
- `loading: boolean`
- `error: string | null`
- `onThresholdChange: (threshold: number | undefined) => void`
- `onDateRangeChange: (next: DateRangeFilter) => void`
- `onRetry: () => void`

### Reglas de renderizado

- Tabla SIEMPRE visible (aunque sin filas).
- Columnas visuales:
- `period` (directo de API)
- `outcome_total` (monto)
- `baseline_average` (mostrar como "baseline promedio")
- `increase_ratio` (convertir a porcentaje en UI: `ratio * 100`)
- Estado normal: renderizar una fila por cada `MetricsAlertEntry`.
- Estado vacio: mantener tabla y mostrar mensaje "No anomalies for current filters" en cuerpo.
- Estado loading: skeleton/placeholder de tabla.
- Estado error: bloque visible de error + accion `onRetry`.

### Reglas de threshold

- Contrato API verificado: `threshold >= 0`, default `0.3`, sin maximo declarado.
- Decision de producto para UI: si PM quiere tope 1.0, tratarlo como validacion de interfaz y NO como restriccion de API.
- Si usuario ingresa threshold invalido (< 0): marcar error de campo y no enviar query.

### Discrepancia PM vs API

- PM pide "media movil de 3 periodos".
- API retorna `baseline_average` sin documentar que sea de 3 periodos.
- Especificacion: mostrar `baseline_average` con etiqueta neutral "baseline average" y agregar nota de producto pendiente.

### Casos limite

- `rows.length === 0`: tabla visible sin ocultarse.
- `increase_ratio` presente pero pequeño (ej. 0.001): mostrar 0.1% tras formato.
- ❓ Si faltara un campo requerido en payload (no esperado por OpenAPI): mostrar "N/A" en celda y registrar warning de parsing.

## 3) Funcionalidad: comparativa B2B vs B2C

### Vista

- Nombre: `BusinessTypeComparisonPage`
- Responsabilidad: comparar top categorias de ingresos entre B2B y B2C con filtro de fechas compartido y grafico unico.
- Donde aparece: nueva ruta/pantalla del frontend (ruta exacta ❓ sin verificar, no definida en repo).

### Estrategia de datos (sin implementar fetch)

- Fuente de categorias disponibles para filtros/listados: `GET /api/metrics/facets`.
- Top por segmento:
- B2B: `GET /api/metrics/categories/top` con `business_type: "B2B"`.
- B2C: `GET /api/metrics/categories/top` con `business_type: "B2C"`.
- Para columna "total de ingresos": usar `operation_type: "income"` (decision de UI coherente con contrato existente).
- Limite por panel: `limit: 5`.

### Componentes de la vista

#### `BusinessTopCategoriesPanel`

- Props:
- `title: "B2B" | "B2C"`
- `rows: TopCategoriesResponse`
- `loading: boolean`
- `error: string | null`
- `onRetry: () => void`
- `maxRows: number` (valor esperado: 5)
- Reglas:
- Mostrar hasta `maxRows` filas.
- Si hay menos de 5 categorias: mostrar solo existentes y completar visualmente con filas vacias de placeholder opcional.
- Si no hay categorias: mantener tabla visible con estado vacio explicito.
- Columnas:
- `category`
- `total_amount` (monto)
- `share_percent` (calculado en UI: `total_amount / suma_total_panel * 100`; si suma_total_panel = 0, mostrar 0%)

#### `BusinessComparisonChart`

- Props:
- `b2bRows: TopCategoriesResponse`
- `b2cRows: TopCategoriesResponse`
- `loading: boolean`
- `error: string | null`
- Reglas:
- Grafico unico debajo de ambas tablas.
- Si un grupo no tiene datos y el otro si, mostrar una serie con valores y la otra en 0 con leyenda activa.
- Si ambos grupos no tienen datos, mostrar estado vacio del grafico (sin ocultar contenedor).

### Comportamiento con filtro de fechas

- El filtro de fechas es compartido entre panel B2B y B2C.
- Si solo `start_date`: aplicar a ambas consultas.
- Si solo `end_date`: aplicar a ambas consultas.
- Si rango invalido: no disparar consultas nuevas para ninguno de los paneles hasta correccion.

### Casos limite

- B2B < 5 y B2C = 5: paneles siguen paralelos; B2B con menos filas reales.
- B2C sin categorias: tabla B2C vacia visible y grafico con serie B2B solamente.
- Ambos sin categorias: ambas tablas vacias visibles + grafico en estado vacio.
