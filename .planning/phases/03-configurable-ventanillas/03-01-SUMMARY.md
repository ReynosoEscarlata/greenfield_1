---
phase: 03-configurable-ventanillas
plan: "01"
subsystem: state
tags: [reducer, types, tdd, vitest]
dependency_graph:
  requires: []
  provides: [Ventanilla type, QueueState extended, ADD_WINDOW, REMOVE_WINDOW, ADD_TICKET spread fix, App.test.tsx scaffold]
  affects: [src/turnero.ts, src/turnero.test.ts, src/App.test.tsx, package.json]
tech_stack:
  added: []
  patterns: [TDD Red-Green, discriminated union action, ever-incrementing counter]
key_files:
  created:
    - src/App.test.tsx
  modified:
    - src/turnero.ts
    - src/turnero.test.ts
    - package.json
decisions:
  - "ADD_TICKET case now spreads ...state to preserve ventanillas and nextWindowNumber on every dispatch (T-03-01 mitigation)"
  - "REMOVE_WINDOW is unconditional in reducer; WINDOW-02 guard lives in UI component (VentanillaCard)"
  - "Ventanilla named Ventanilla (not Window) to avoid TypeScript global shadowing"
  - "nextWindowNumber is independent counter per D-10 — never derived from ventanillas.length"
metrics:
  duration: "2 min"
  completed: "2026-07-07T17:45:21Z"
  tasks_completed: 2
  files_modified: 4
---

# Phase 3 Plan 01: State Extension and Test Scaffold Summary

**One-liner:** Ventanilla type with ADD_WINDOW/REMOVE_WINDOW reducer cases and ADD_TICKET spread bug fix, backed by 11 passing unit tests and a 3-test Red scaffold for Plan 02's VentanillaCard UI.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Wave 0 — Test infrastructure (App.test.tsx + test script) | 127b1d1 | src/App.test.tsx, package.json |
| 2 | State extension — Ventanilla type + reducer cases + unit tests | b24b945 (RED), 895ef69 (GREEN) | src/turnero.ts, src/turnero.test.ts |

## What Was Built

### src/turnero.ts (modified)

- Added `Ventanilla` type: `{ id: number; number: number; currentTicket: Ticket | null }`
- Extended `QueueState` with `ventanillas: Ventanilla[]` and `nextWindowNumber: number`
- Extended `QueueAction` union with `ADD_WINDOW` and `REMOVE_WINDOW: { id: number }` variants
- Extended `initialState` with `ventanillas: []` and `nextWindowNumber: 1`
- Fixed `ADD_TICKET` case: added `...state` spread so all QueueState fields are preserved atomically (T-03-01 mitigation — critical correctness fix)
- Added `ADD_WINDOW` case: creates ventanilla with `id/number = nextWindowNumber`, `currentTicket: null`, increments counter
- Added `REMOVE_WINDOW` case: filters `ventanillas` by `v.id !== action.id` unconditionally

### src/turnero.test.ts (modified)

Appended 6 new test cases in 3 describe blocks below existing QUEUE-01/02 tests:
- `WINDOW-01-A`: ADD_WINDOW creates ventanilla with number 1
- `WINDOW-01-B`: two ADD_WINDOWs produce numbers [1, 2]
- `WINDOW-01-C`: counter never reuses after removal (D-10 invariant)
- `WINDOW-02-A`: REMOVE_WINDOW removes ventanilla when called
- `WINDOW-03-A`: new ventanilla has currentTicket null
- Regression: ADD_WINDOW then ADD_TICKET preserves ventanillas (spread fix verified)

All 11 tests pass (QUEUE-01/02 + WINDOW-01/02/03).

### src/App.test.tsx (created)

3 integration test cases targeting `VentanillaCard` (named export from `./App`):
- WINDOW-03 display: `{ currentTicket: null }` renders "sin turno"
- WINDOW-02 guard: `{ currentTicket: { id: 5, number: 5 } }` click shows warning, no `onRemove` call
- WINDOW-01/02 removal: `{ currentTicket: null }` click calls `onRemove(id)`

Tests are intentionally Red (3/3 failing) — `VentanillaCard` not yet exported from `App.tsx`. Plan 02 makes them Green.

### package.json (modified)

Added `"test": "vitest run"` to scripts alongside existing dev/build/lint/preview.

## TDD Gate Compliance

- RED gate: commit `b24b945` — `test(03-01): add failing WINDOW-01/02/03 reducer tests (Red phase)`
- GREEN gate: commit `895ef69` — `feat(03-01): extend turnero.ts with Ventanilla type and window reducer cases`

Both gates present in correct order. All 6 new tests transitioned from fail to pass.

## Verification Results

```
npx vitest run src/turnero.test.ts  →  11 passed (expected: all pass)
npx vitest run src/App.test.tsx     →  3 failed  (expected: Red until Plan 02)
```

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — this plan is infrastructure only (types, reducer, test scaffold). The App.test.tsx tests are intentionally Red by design (Plan 01 deliverable), not stubs in the sense of wired-but-empty data. Plan 02 will export `VentanillaCard` from `App.tsx` and make all 3 integration tests Green.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes. All changes are pure TypeScript/React in-memory state. The ADD_TICKET spread fix explicitly mitigates T-03-01 (state field dropping). No new threat surface introduced.

## Self-Check

- [x] src/App.test.tsx exists
- [x] src/turnero.ts modified with Ventanilla type
- [x] src/turnero.test.ts extended with WINDOW-01/02/03 tests
- [x] package.json has "test" script
- [x] Commit 127b1d1 exists (Task 1)
- [x] Commit b24b945 exists (RED phase)
- [x] Commit 895ef69 exists (GREEN phase)
- [x] 11 unit tests pass
- [x] App.test.tsx is Red (expected)
