---
name: financial-dashboard-feature-workflow
description: Implementa cambios de frontend del dashboard financiero respetando contratos API reales, estados UI obligatorios y reglas de verificacion del proyecto.
owner: project-internal
version: 1.0.0
---

# Financial Dashboard Feature Workflow

## Objetivo

Aplicar cambios en el dashboard sin romper el comportamiento existente, usando contratos reales del backend y convenciones del repositorio.

## Cuando usarla

- Cuando se agregan o modifican componentes en frontend/src/components/dashboard.
- Cuando se consumen endpoints en frontend/src/App.tsx o nuevos modulos de datos.
- Cuando hay que validar cambios con build/lint/tests siguiendo comandos documentados del repo.

## Inputs

- Cambio funcional solicitado.
- Archivos objetivo del frontend.
- Contratos en frontend/specs/api-types.ts y frontend/specs/param-types.ts.
- Reglas de proyecto en .agents/rules/engineering-rules.md.

## Instrucciones

1. Confirmar contrato de datos antes de tocar UI:

- Validar tipos y payloads contra frontend/specs/api-types.ts.
- No inventar campos no existentes en API.

2. Mantener arquitectura actual de logica:

- Mantener calculos de negocio en utilidades de frontend/src/lib/financial-utils.ts.
- Evitar mover logica pesada dentro de componentes de presentacion.

3. Preservar estados asincronos obligatorios:

- Loading visible con skeleton.
- Empty state visible en charts.
- Error visible cuando falla fetch.

4. Aplicar cambios de accesibilidad en componentes dashboard:

- Iconos decorativos con aria-hidden.
- Contenido principal alcanzable por teclado.
- Alternativa textual para visualizaciones cuando aplique.

5. Verificar con comandos del proyecto:

- Build frontend: docker compose run --rm frontend npm run build
- Lint frontend: docker compose run --rm frontend npm run lint
- Test frontend: docker compose run --rm frontend npm run test -- --run

6. Revisar salida final:

- Ejecutar git status, git diff y git diff --stat.
- Confirmar que no hay cambios no relacionados.

## Output esperado

- Cambios acotados a archivos necesarios.
- Build/lint/tests frontend en verde.
- Resumen de que regla/skill justifico cada cambio.

## Criterios de aceptacion

- No se reescribe el dashboard desde cero.
- Se respetan contratos API y convenciones existentes.
- Estados loading/empty/error siguen funcionando.
- No hay errores nuevos en build, lint o tests del frontend.
