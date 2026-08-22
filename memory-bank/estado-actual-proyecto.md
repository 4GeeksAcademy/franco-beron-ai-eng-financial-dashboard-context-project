# Estado actual del proyecto

Fecha de actualizacion: 2026-08-22
Rama de trabajo: fork-base

## Estado de ejecucion

- Backend levantado en puerto 8000.
- Frontend levantado en puerto 5173.
- Puerto 5678 disponible para debugging del backend.
- Health endpoint operativo con respuesta de estado ok.

## Verificacion funcional reciente

- Conteo de movimientos en API principal: 360 registros.
- Frontend responde con codigo HTTP 200.

## Estado de pruebas

- Backend:
  - 15 pruebas en verde con pytest.
  - 1 warning de deprecacion en fastapi testclient y dependencia de httpx2.
- Frontend:
  - 5 pruebas en verde con vitest.

## Estado de documentacion de agentes

- Existe carpeta .agents.
- Reglas de ingenieria documentadas y refinadas en .agents/rules/engineering-rules.md.
- Se creo este memory-bank para mantener contexto persistente del proyecto.

## Riesgos tecnicos abiertos

- Configuracion CORS actual permisiva para todos los origenes en backend.
- Etiqueta de periodo fija en UI puede desalinearse con el rango real de datos.
- Generacion de datos con siembra global de random, con riesgo de efectos colaterales si escala.

## Siguientes pasos sugeridos

- Separar configuracion de CORS por entorno.
- Derivar periodo mostrado desde datos reales o facets.
- Refactorizar generacion mock para usar RNG local en lugar de estado global.
