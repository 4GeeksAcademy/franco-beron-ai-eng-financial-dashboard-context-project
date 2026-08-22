# Reglas de Ingenieria del Proyecto

Alcance:

- Estas reglas aplican a todo cambio en backend y frontend.
- Son obligatorias para codigo nuevo o modificado.
- Si existe deuda tecnica previa, no bloquea el PR salvo que el archivo tocado quede peor.

## Flujo operativo obligatorio

Antes de abrir PR, validar en este orden:

1. Levantar proyecto:

- docker compose up --build

2. Verificar servicios:

- curl http://localhost:8000/health
- curl http://localhost:8000/api/metrics | jq 'length'
- curl -o /dev/null -w '%{http_code}\n' http://localhost:5173

3. Ejecutar pruebas:

- docker compose exec -T backend pytest -q
- docker compose exec -T frontend npm run test -- --run

4. Criterio de salida:

- Sin errores de runtime en frontend/backend.
- Todas las pruebas en verde.
- Reglas 1-10 cumplidas para los archivos modificados.

## 1) Contratos tipados en fronteras publicas

Regla:

- Todo endpoint publico debe declarar response_model.
- Todo query/filter debe tiparse y, cuando aplique, incluir restricciones (ge/le/required).

Criterio verificable:

- En diff de backend no se aceptan endpoints sin contrato de salida.

## 2) Datos deterministas para demo y pruebas

Regla:

- Cualquier dataset generado para demo/pruebas debe ser reproducible.
- Las pruebas deben validar forma y orden, no solo status code.

Criterio verificable:

- Si se toca generacion de datos o filtros, se actualiza test de orden/cantidad/valores esperados.

## 3) Logica de negocio en funciones puras reutilizables

Regla:

- Calculos de KPI, agregaciones, filtros y formateos van en helpers puros.
- Handlers y componentes solo orquestan.

Criterio verificable:

- Nuevos calculos no deben quedar incrustados dentro de JSX complejo o endpoints largos.

## 4) Tests obligatorios por cambio de comportamiento

Regla:

- Cambio de comportamiento backend: actualizar/crear pytest en backend/tests.
- Cambio de calculo/formato frontend: actualizar/crear vitest en src/lib.

Criterio verificable:

- Ningun PR de logica se aprueba sin test que falle antes y pase despues.

## 5) UX resiliente en vistas asincronas

Regla:

- Toda vista con fetch debe cubrir loading, empty state y error state.
- Nuevas tarjetas/graficos deben tener fallback visual.

Criterio verificable:

- En revision de UI se puede reproducir cada estado sin romper layout.

## 6) Estrategia de API local consistente

Regla:

- Por defecto usar rutas relativas /api desde frontend.
- VITE_API_BASE_URL se usa solo como override de entorno.

Criterio verificable:

- No hardcodear host/puerto de backend en componentes.

## 7) CORS seguro por entorno

Regla:

- No usar allow_origins global en produccion.
- Definir origenes explicitos por entorno.

Criterio verificable:

- Si se toca configuracion de app, se conserva o mejora control de origenes.

## 8) Evitar efectos globales ocultos

Regla:

- Evitar random.seed global en rutas compartidas.
- Preferir instancias locales de RNG cuando se refactorice generacion.

Criterio verificable:

- Cambios nuevos no deben introducir estado global mutable evitable.

## 9) Coherencia entre periodo mostrado y datos reales

Regla:

- El periodo visible del dashboard debe derivar de datos reales (facets/rango) y no de texto fijo.

Criterio verificable:

- Si se modifica cabecera o filtros temporales, validar que etiqueta y dataset coincidan.

## 10) Limitar crecimiento monolitico

Regla:

- Si un modulo mezcla demasiadas responsabilidades, dividir por dominio.
- Rutas del backend delgadas; calculo fuera de handlers.

Criterio verificable:

- Nuevos endpoints reutilizan servicios/helpers en lugar de copiar logica.

## Matriz de aplicacion rapida por tipo de cambio

- Cambio en endpoint backend: aplicar reglas 1, 2, 3, 4, 7, 8, 10.
- Cambio en filtros/periodo/metricas: aplicar reglas 2, 3, 4, 9.
- Cambio de fetch/UI async: aplicar reglas 5, 6, 9.
- Refactor sin cambios funcionales: mantener reglas 3 y 10 + pruebas en verde.

## Checklist de PR

- Endpoint nuevo o modificado con contratos tipados y restricciones.
- Comportamiento cubierto por tests nuevos/actualizados.
- Estados loading/empty/error verificados en UI asincrona.
- Sin host hardcodeado en frontend, uso correcto de /api.
- Riesgos de CORS/estado global no empeoran.
- Pruebas ejecutadas con comandos de este archivo y resultado en verde.
