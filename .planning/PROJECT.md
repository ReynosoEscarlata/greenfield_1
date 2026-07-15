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

### Validated (continued)

- [x] Al llamar un turno se reproduce un sonido/beep — Validated in Phase 5: Call Sound Feedback
- [x] Al cambiar el turno actual de una ventanilla se muestra una pequeña animación de transición — Validated in Phase 6: Call Transition Animation
- [x] Los números de turno son legibles a distancia (alto contraste, tipografía grande) y la pantalla nunca muestra datos identificatorios de pacientes — Validated in Phase 7: Distance-Readable & Privacy-Safe Display
- [x] El estado de la cola y las ventanillas persiste en el navegador (localStorage) entre recargas de página, con recuperación defensiva ante datos corruptos/ausentes — Validated in Phase 8: Persistence Across Reloads

### Active

None — all v1 requirements shipped and validated. Phase 9 (Rediseño UX/UI Material Design) added no new requirements; it restyled the existing UI with Tailwind v4 + MD3 tokens without changing functionality (all 33 pre-Phase-9 tests passed unmodified).

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
| Cola única compartida en vez de colas por ventanilla | Simplifica la lógica de "llamar siguiente" y es más realista para una sala de espera con varias ventanillas atendiendo el mismo flujo | ✓ Shipped Phase 4 — CALL_NEXT dequeues atómicamente de una única cola compartida, sin colisiones en clics simultáneos |
| Número de ventanillas configurable dinámicamente | El usuario quiso flexibilidad en vez de un número fijo (2 o 3) | ✓ Shipped Phase 3 — ADD_WINDOW/REMOVE_WINDOW con guard que bloquea remover una ventanilla con turno activo |
| Persistencia con localStorage en vez de solo memoria volátil | El usuario prefirió que la fila sobreviva a un refresh de página | ✓ Shipped Phase 8 — loadFromStorage() + useReducer lazy initializer + useEffect save; recuperación defensiva ante JSON corrupto/ausente |
| Sonido + animación al llamar turno | Mejora la experiencia de uso real de un turnero sin agregar complejidad de backend | ✓ Shipped Phases 5–6 — beep síncrono dentro del click (FEEDBACK-01) + flash visual con key-prop remount (FEEDBACK-02) |
| Rediseño MD3/Tailwind v4 en Phase 9 sin nuevos requirements | Modernizar la UI (Top App Bar, jerarquía de botones, tokens de color) sin tocar lógica ya validada | ✓ Shipped Phase 9 — Tailwind v4 + tokens MD3 vía @theme; 33/39 tests pre-existentes intactos sin modificar archivos de test |

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
*Last updated: 2026-07-15 after Phase 9: Rediseño UX/UI Material Design — milestone v1.0 complete, all 12 v1 requirements shipped and validated, 39/39 tests passing*
