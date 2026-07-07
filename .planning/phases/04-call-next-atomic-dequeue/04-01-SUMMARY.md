---
phase: 04-call-next-atomic-dequeue
plan: "01"
subsystem: testing
tags: [react, typescript, vitest, reducer, tdd]

# Dependency graph
requires:
  - phase: 03-configure-windows
    provides: queueReducer, QueueAction union, turnero.ts and test infrastructure
provides:
  - CALL_NEXT discriminated union member in QueueAction
  - CALL_NEXT reducer case (dequeues queue head, sets ventanilla currentTicket)
  - WR-02 REMOVE_WINDOW guard (no-op when ventanilla has active ticket)
  - 15 passing unit tests in turnero.test.ts (TDD Green gate)
  - 3 new integration tests in App.test.tsx (RED by design — held for Plan 02)
affects: [04-02-call-next-ui, any future plan touching queueReducer or VentanillaCard]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Discriminated union guard: early return state for referential equality no-ops"
    - "WR-02 guard uses explicit target !== undefined check before currentTicket !== null (no optional chaining)"
    - "TDD Red/Green commit sequence: test commit then feat commit"
    - "Sequential dispatch pattern: let state = queueReducer(state, action) repeated for multi-step unit tests"

key-files:
  created: []
  modified:
    - src/turnero.ts
    - src/turnero.test.ts
    - src/App.test.tsx

key-decisions:
  - "WR-02 guard moved to reducer layer (not just UI) — prevents data-loss via any dispatch path, not only from VentanillaCard clicks"
  - "Explicit target !== undefined guard before currentTicket check — avoids false positive from optional chaining on undefined"
  - "CALL_NEXT on empty queue returns state (same reference) — React skips re-render"

patterns-established:
  - "Reducer guard: find target first, then check property — never use optional chaining for identity guards"
  - "Spread ...state first in every reducer return — preserves all QueueState fields"

requirements-completed: [CALL-01]

# Metrics
duration: 15min
completed: 2026-07-07
---

# Phase 4 Plan 01: Call Next Reducer Summary

**CALL_NEXT discriminated union member and WR-02 REMOVE_WINDOW guard added to queueReducer, with 15 passing unit tests and 3 RED integration tests establishing the TDD contract for Plan 02**

## Performance

- **Duration:** ~15 min
- **Started:** 2026-07-07T15:34:00Z
- **Completed:** 2026-07-07T15:38:00Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Extended QueueAction union with `{ type: 'CALL_NEXT'; windowId: number }` — TypeScript now accepts CALL_NEXT dispatches
- Implemented CALL_NEXT reducer case: dequeues queue[0] and assigns it to the matching ventanilla's currentTicket (empty-queue guard returns state reference unchanged)
- Replaced unconditional REMOVE_WINDOW with WR-02 guard: find + explicit undefined check before currentTicket null check — prevents silent ticket loss via any dispatch path (T-04-01 mitigation)
- 15 unit tests pass (11 existing + 4 new: CALL-01-A/B/C and WR-02-A)
- 3 integration tests added to App.test.tsx remain RED by design (VentanillaCard not yet extended — Plan 02 scope)

## Task Commits

1. **Task 1: Write RED tests (turnero.test.ts + App.test.tsx)** - `e3f35dd` (test)
2. **Task 2: Implement reducer — CALL_NEXT case + WR-02 guard** - `dff5bb9` (feat)

## Files Created/Modified

- `src/turnero.ts` — CALL_NEXT union member, CALL_NEXT case, WR-02 REMOVE_WINDOW guard
- `src/turnero.test.ts` — Two new describe blocks: CALL-01 (3 cases) and WR-02 (1 case)
- `src/App.test.tsx` — act import, 3 existing render calls updated with new props, 3 new describe blocks (CALL-01, CALL-02, WR-01)

## Decisions Made

- WR-02 guard placed in reducer (not left in UI layer) — correctness requirement per STRIDE T-04-01: UI guard alone can be bypassed; reducer is the authoritative state machine
- `target !== undefined && target.currentTicket !== null` — explicit two-part guard avoids optional chaining false positive (undefined?.property evaluates to undefined which is !== null, blocking legitimate removals)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 02 can proceed immediately: turnero.ts exposes a stable, tested CALL_NEXT action with 15 passing unit tests as its foundation
- VentanillaCard needs `onCallNext` + `isQueueEmpty` props wired in App.tsx (Plan 02 scope)
- 3 integration tests in App.test.tsx are RED — they go GREEN in Plan 02 when VentanillaCard UI is extended

## TDD Gate Compliance

- RED gate: `e3f35dd` — test(04-01): 4 new failing tests committed before implementation
- GREEN gate: `dff5bb9` — feat(04-01): implementation making 15/15 unit tests pass

## Self-Check: PASSED

- src/turnero.ts: FOUND
- src/turnero.test.ts: FOUND
- src/App.test.tsx: FOUND
- Commit e3f35dd: FOUND
- Commit dff5bb9: FOUND
- 15/15 unit tests passing: CONFIRMED

---
*Phase: 04-call-next-atomic-dequeue*
*Completed: 2026-07-07*
