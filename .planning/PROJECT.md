# Turnero de Sala de Espera

## What This Is

Una mini-app de turnero para la sala de espera de una clínica: una sola pantalla muestra el turno actual de cada ventanilla y los próximos en la cola compartida. Un botón "Agregar turno" suma turnos a la fila, y cada ventanilla tiene su propio botón "Llamar siguiente" para tomar el próximo turno disponible. Sin backend, sin autenticación — pensada como ejercicio para recorrer el ciclo de vida completo de GSD por primera vez.

## Core Value

Que cualquier ventanilla pueda llamar al siguiente turno de la cola compartida y la pantalla refleje correctamente, en todo momento, cuál es el turno actual de cada ventanilla y cuáles son los próximos en espera.

## Requirements

### Validated

- [x] Usuario puede agregar un nuevo turno a la cola con un botón "Agregar turno" (numeración automática incremental) — Validated in Phase 2: Add Ticket / View Queue
- [x] Usuario puede ver la cola de turnos en espera (los próximos, en orden) — Validated in Phase 2: Add Ticket / View Queue
- [x] Usuario puede configurar dinámicamente la cantidad de ventanillas (agregar/quitar ventanillas) — Validated in Phase 3: Configurable Ventanillas
- [x] Cada ventanilla muestra su turno actual (o "sin turno" si nunca llamó ninguno) — Validated in Phase 3: Configurable Ventanillas
- [x] Usuario puede presionar "Llamar siguiente" en una ventanilla para tomar el próximo turno de la cola compartida — Validated in Phase 4: Call Next (Atomic Dequeue)

### Active
- [ ] Al llamar un turno se reproduce un sonido/beep
- [ ] Al cambiar el turno actual de una ventanilla se muestra una pequeña animación de transición
- [ ] El estado de la cola y las ventanillas persiste en el navegador (localStorage) entre recargas de página

### Out of Scope

- Backend / API — la app es 100% cliente, sin servidor; explícitamente fuera de alcance para mantener el ejercicio simple
- Autenticación / roles de usuario — no hay usuarios ni permisos, cualquiera que abra la página puede operar cualquier ventanilla
- Colas separadas por ventanilla — se eligió una única cola compartida en vez de colas independientes por ventanilla, para simplificar la lógica
- Múltiples pantallas/vistas — todo vive en una sola página (vista única para sala de espera y operador)
- Persistencia en servidor / multi-dispositivo / sincronización en tiempo real entre pestañas — el localStorage es por navegador, no hay sincronización entre dispositivos

## Context

- Proyecto greenfield, sin código previo.
- El objetivo principal declarado por el usuario no es la app en sí, sino practicar el ciclo de vida completo de GSD (questioning → research → requirements → roadmap → planning → execution) por primera vez. Esto sugiere mantener el scope deliberadamente chico y no expandirlo más allá de lo definido aquí.
- Stack sugerido por el usuario: React + TypeScript con Vite, estado en memoria (con persistencia en localStorage según lo definido en Requirements).

## Constraints

- **Tech stack**: React + TypeScript + Vite — elegido por el usuario, stack moderno estándar para SPA simples
- **Arquitectura**: Sin backend — toda la lógica y estado viven en el cliente, usando localStorage para persistencia
- **Alcance**: Una sola página/vista — evitar routing o vistas múltiples
- **Auth**: Ninguna — no hay necesidad de usuarios ni permisos para este ejercicio

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Cola única compartida en vez de colas por ventanilla | Simplifica la lógica de "llamar siguiente" y es más realista para una sala de espera con varias ventanillas atendiendo el mismo flujo | — Pending |
| Número de ventanillas configurable dinámicamente | El usuario quiso flexibilidad en vez de un número fijo (2 o 3) | — Pending |
| Persistencia con localStorage en vez de solo memoria volátil | El usuario prefirió que la fila sobreviva a un refresh de página | — Pending |
| Sonido + animación al llamar turno | Mejora la experiencia de uso real de un turnero sin agregar complejidad de backend | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-07 after Phase 4: Call Next (Atomic Dequeue) — Core Value delivered, 21/21 tests GREEN*
