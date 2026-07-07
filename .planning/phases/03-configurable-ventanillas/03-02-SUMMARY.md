---
phase: 03-configurable-ventanillas
plan: "02"
subsystem: ui
tags: [react, typescript, css, vitest, ventanilla-card]

dependency_graph:
  requires:
    - phase: 03-01
      provides: Ventanilla type, ADD_WINDOW/REMOVE_WINDOW reducer cases, App.test.tsx Red scaffold
  provides:
    - VentanillaCard named export from App.tsx with WINDOW-02 removal guard
    - Restructured ventanillas-section with Agregar ventanilla button and grid layout
    - Migrated CSS selectors (.ventanillas-section replacing stale .ventanillas-grid in combined rules)
    - Full card/button/warning/empty-state CSS classes
  affects: [04-call-next, phase-3-checkpoint]

tech-stack:
  added: []
  patterns:
    - "Local state guard pattern: VentanillaCard owns showWarning state, checks currentTicket before dispatching REMOVE_WINDOW"
    - "Stable React key pattern: v.id (ever-incrementing) used as key, not array index (T-03-05 mitigation)"
    - "Named export for testability: VentanillaCard exported separately from default App for direct unit testing"

key-files:
  created: []
  modified:
    - src/App.tsx
    - src/index.css

key-decisions:
  - "VentanillaCard props typed as Readonly<{...}> to satisfy SonarLint S6759 and enforce immutability contract"
  - "showWarning resets to false on successful removal (setShowWarning(false) before onRemove call) to prevent stale warning if component is reused"
  - ".ventanillas-grid rule retained unchanged — applies to inner div, not the outer section wrapper"

patterns-established:
  - "UI removal guard pattern: local boolean state + early return, guard lives in component not reducer"
  - "Readonly props destructuring for function components"

requirements-completed:
  - WINDOW-01
  - WINDOW-02
  - WINDOW-03

duration: 5min
completed: "2026-07-07"
---

# Phase 3 Plan 02: VentanillaCard UI Layer Summary

**VentanillaCard component with WINDOW-02 removal guard, responsive ventanillas grid, and migrated CSS — all 14 tests green.**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-07-07T11:48:00Z
- **Completed:** 2026-07-07T11:49:00Z
- **Tasks:** 2 (+ checkpoint pending human verification)
- **Files modified:** 2

## Accomplishments

- Exported `VentanillaCard` named component from `App.tsx` — makes the 3 Red integration tests from Plan 01 go Green
- WINDOW-02 guard implemented: local `showWarning` state blocks removal and shows inline warning when `currentTicket !== null`
- Restructured App JSX: ventanillas-section wraps "Agregar ventanilla" button + ventanillas-grid with stable v.id React keys
- Migrated stale `.ventanillas-grid h2` and `.ventanillas-grid p` CSS selectors to `.ventanillas-section` counterparts
- Appended 9 new CSS rules: card layout, remove button (absolute-positioned top-right), warning (red #c0392b), empty state

## Task Commits

Each task was committed atomically:

1. **Task 1: App.tsx — VentanillaCard component + restructured ventanillas section** - `25db272` (feat)
2. **Task 2: index.css — migrate stale selectors + add card/button/warning styles** - `2298783` (feat)

## Files Created/Modified

- `src/App.tsx` — VentanillaCard named export, Readonly props, showWarning guard, ventanillas-section JSX restructure, ventanillas-empty fallback
- `src/index.css` — migrated h2/p combined selectors, appended .ventanillas-section, .add-window-button, .ventanilla-card, .ventanilla-label, .ventanilla-ticket, .ventanilla-remove, .ventanilla-remove:hover, .ventanilla-warning, .ventanillas-empty

## Decisions Made

- `VentanillaCard` props typed as `Readonly<{...}>` to satisfy SonarLint rule S6759 (immutability signal for function component props)
- `showWarning` resets to `false` before calling `onRemove` to prevent stale warning state on component reuse
- `.ventanillas-grid` and `.ventanillas-grid > *` CSS rules left unchanged — they correctly target the inner div wrapper, not the outer section

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added Readonly wrapper to VentanillaCard props**
- **Found during:** Task 1 (VentanillaCard implementation)
- **Issue:** IDE (SonarLint S6759) flagged the component props as missing read-only annotation — props should be treated as immutable in function components
- **Fix:** Wrapped prop type with `Readonly<{...}>` per TypeScript best practice
- **Files modified:** src/App.tsx
- **Verification:** Diagnostic cleared; all tests still pass; tsc --noEmit clean
- **Committed in:** 25db272 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical — read-only annotation)
**Impact on plan:** Minimal correctness improvement; no scope change.

## Issues Encountered

None — implementation matched plan spec exactly. SonarLint warning caught and fixed inline.

## Known Stubs

None — VentanillaCard renders real state from the reducer. `currentTicket` is always `null` until Phase 4 (CALL_NEXT), which is intentional per plan scope (WINDOW-03 spec: "shows 'sin turno' initially; shows 'Turno N' after CALL_NEXT in Phase 4").

## Threat Surface Scan

No new network endpoints, auth paths, file access, or schema changes. VentanillaCard is client-side only. T-03-05 mitigation applied: `v.id` used as React key (stable, ever-incrementing) to prevent stale `showWarning` state on wrong card after removal.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All 14 tests pass (QUEUE-01/02 + WINDOW-01/02/03 reducer + WINDOW-02/03 integration)
- TypeScript build clean
- Awaiting visual checkpoint approval (checkpoint task returned to orchestrator)
- Phase 4 (CALL_NEXT) can import `Ventanilla` type and extend `QueueAction` union with `{ type: 'CALL_NEXT'; windowId: number }` — types are in place

## Self-Check: PASSED

- [x] src/App.tsx contains `export function VentanillaCard`
- [x] src/App.tsx contains `className="ventanillas-section"`
- [x] src/App.tsx contains `dispatch({ type: 'ADD_WINDOW' })`
- [x] src/App.tsx conditionally renders `p.ventanilla-warning` when `showWarning` is true
- [x] src/index.css contains `.ventanillas-section h2` (not `.ventanillas-grid h2`)
- [x] src/index.css contains `.ventanillas-section p` (not the old combined form)
- [x] src/index.css contains `.ventanilla-card`, `.ventanilla-remove`, `.ventanilla-warning`, `.ventanillas-empty`, `.add-window-button`
- [x] Commit 25db272 exists (Task 1)
- [x] Commit 2298783 exists (Task 2)
- [x] 14 tests pass (npx vitest run)

---
*Phase: 03-configurable-ventanillas*
*Completed: 2026-07-07*
