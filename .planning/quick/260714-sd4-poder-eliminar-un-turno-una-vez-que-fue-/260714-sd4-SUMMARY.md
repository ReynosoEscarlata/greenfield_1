---
phase: quick-260714-sd4
plan: 01
subsystem: ui
tags: [react, typescript, useReducer, vitest, testing-library]

# Dependency graph
requires:
  - phase: 04-call-next-atomic-dequeue
    provides: queueReducer, CALL_NEXT action, VentanillaCard component
provides:
  - CLEAR_TICKET reducer action (discards a ventanilla's current ticket without returning it to the queue)
  - "Eliminar turno" button in VentanillaCard, conditionally rendered when currentTicket is not null
affects: [phase-09-md3-redesign, future-phases-touching-ventanilla-lifecycle]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Reducer action pattern: spread ...state, map ventanillas array, match by windowId, only mutate the matched entry"

key-files:
  created: []
  modified:
    - src/turnero.ts
    - src/turnero.test.ts
    - src/App.tsx
    - src/App.test.tsx

key-decisions:
  - "CLEAR_TICKET discards the ticket permanently (does not requeue it) per explicit product requirement"
  - "Reused existing md-error Tailwind token for the delete button styling instead of introducing a new color token"

patterns-established:
  - "Ventanilla lifecycle actions (CALL_NEXT, CLEAR_TICKET) both follow the same .map + spread pattern for touching a single ventanilla by id"

requirements-completed: [SD4-CLEAR-TICKET]

# Metrics
duration: 12min
completed: 2026-07-14
---

# Quick Task 260714-sd4: Eliminar turno asignado Summary

**CLEAR_TICKET reducer action plus an "Eliminar turno" button in VentanillaCard that discards (not requeues) the active ticket.**

## Performance

- **Duration:** ~12 min
- **Tasks:** 2 completed
- **Files modified:** 4

## Accomplishments
- Added `CLEAR_TICKET` to the `QueueAction` union and a corresponding reducer case that sets `currentTicket` to `null` for the targeted ventanilla, leaving `state.queue` untouched.
- Added a conditional "Eliminar turno" button to `VentanillaCard`, visible only when `currentTicket !== null`, wired to dispatch `CLEAR_TICKET`.
- Full test suite (39 tests) green, including 4 new CLEAR-01 reducer tests and 2 new CLEAR-02 component tests.

## Task Commits

Each task followed TDD (RED -> GREEN):

1. **Task 1: Agregar acción CLEAR_TICKET al reducer**
   - `dc83693` test(sd4-01): add failing tests for CLEAR_TICKET reducer action (RED)
   - `82fef7d` feat(sd4-01): add CLEAR_TICKET reducer action (GREEN)
2. **Task 2: Botón "Eliminar turno" en VentanillaCard y wiring en App**
   - `169f152` test(sd4-02): add failing test for Eliminar turno button and wire onClearTicket prop (RED)
   - `a8ea83d` feat(sd4-02): add Eliminar turno button to VentanillaCard (GREEN)

_Note: docs/state commits (SUMMARY.md, STATE.md) are added separately by the orchestrator._

## Files Created/Modified
- `src/turnero.ts` - Added `CLEAR_TICKET` to `QueueAction` union; new reducer case sets `currentTicket: null` for the matched ventanilla via `.map`, without touching `state.queue`.
- `src/turnero.test.ts` - New `describe('CLEAR-01: Eliminar turno asignado')` block with 4 tests (sets null, queue length unchanged, no-op when already null, only affects targeted ventanilla).
- `src/App.tsx` - `VentanillaCard` gained `onClearTicket` prop and a conditionally-rendered "Eliminar turno" button (aria-label `Eliminar turno de ventanilla {number}`, styled with existing `md-error` token); `App` wires it to `dispatch({ type: 'CLEAR_TICKET', windowId: id })`.
- `src/App.test.tsx` - All 15 existing `VentanillaCard` render calls updated with the now-required `onClearTicket` prop; new `describe('CLEAR-02: Botón eliminar turno')` block with 2 tests (button fires callback with id when ticket active; button absent when no ticket).

## Decisions Made
- Discarded tickets are never requeued — this matches the explicit plan requirement ("El turno eliminado NO regresa a la cola") and product truth stated in `must_haves`.
- Reused the existing `md-error` Tailwind color token for the new button (outline/error style) rather than introducing a new token, keeping the MD3 palette from Phase 9 consistent.
- The existing WR-01 `useEffect` (resets `showWarning` when `currentTicket` becomes null) required no changes — it already covers the new code path.

## Deviations from Plan

None - plan executed exactly as written. Both tasks followed the TDD RED/GREEN cycle exactly as specified, with no architectural changes, no missing critical functionality, and no blocking issues beyond one out-of-scope, pre-existing build error (see below).

## Issues Encountered

- `npm run build` (`tsc -b`) fails with `src/setupTests.ts(28,1): error TS2304: Cannot find name 'global'`. This is a **pre-existing** issue from an earlier phase (commit `acd489d`, Phase 5 useBeep AudioContext mock), unrelated to `src/turnero.ts` / `src/App.tsx` changes made in this task. `npm test` (the full Vitest suite, 39/39 tests) passes cleanly — only the TypeScript project-build step is affected. Logged to `.planning/quick/260714-sd4-poder-eliminar-un-turno-una-vez-que-fue-/deferred-items.md` per the scope-boundary rule (out-of-scope file, not touched here).

## Next Phase Readiness
- `CLEAR_TICKET` action and "Eliminar turno" button are fully wired, tested, and persisted via the existing localStorage effect (no changes needed there — `App`'s `useEffect` re-serializes `state` on every dispatch, CLEAR_TICKET included).
- Pre-existing `tsc -b` failure in `src/setupTests.ts` remains open — recommend a small follow-up quick task to fix the `global` -> `globalThis` (or tsconfig `types: ["node"]`) issue so `npm run build` succeeds end-to-end.

---
*Quick task: 260714-sd4*
*Completed: 2026-07-14*

## Self-Check: PASSED

All 4 task commits verified present in git log (dc83693, 82fef7d, 169f152, a8ea83d). All modified files (src/turnero.ts, src/App.tsx) and this SUMMARY.md confirmed present on disk.
