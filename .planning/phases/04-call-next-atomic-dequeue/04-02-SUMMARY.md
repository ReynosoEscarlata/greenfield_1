---
phase: 04-call-next-atomic-dequeue
plan: "02"
subsystem: ui
tags: [react, typescript, vite, vitest, tdd, use-effect]

# Dependency graph
requires:
  - phase: 04-call-next-atomic-dequeue
    plan: "01"
    provides: CALL_NEXT reducer action, WR-02 REMOVE_WINDOW guard, 15 passing unit tests, 6 RED integration tests
provides:
  - VentanillaCard with onCallNext + isQueueEmpty props
  - WR-01 useEffect (dep [ventanilla.currentTicket]) — removal warning auto-reset
  - CALL-02 useEffect (dep [showEmptyWarning]) — empty-queue warning auto-dismiss
  - handleCallNext function with queue-empty guard
  - call-next-button JSX (full-width below ticket display)
  - showEmptyWarning inline warning JSX ("No hay turnos en espera")
  - .call-next-button CSS rule (width: 100%)
  - All 21 tests GREEN (15 unit + 6 integration)
affects: [App.tsx, index.css, Phase 5 sound, Phase 6 animation]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useEffect dep [ventanilla.currentTicket]: prop-change reactive reset of local state (WR-01)"
    - "useEffect dep [showEmptyWarning]: auto-dismiss timer with clearTimeout cleanup (CALL-02)"
    - "Guard-and-early-return handler: handleCallNext mirrors handleRemove pattern"
    - "isQueueEmpty prop: App computes queue.length === 0 and passes down — single source of truth"

key-files:
  created: []
  modified:
    - src/App.tsx
    - src/index.css

key-decisions:
  - "showEmptyWarning state is local to VentanillaCard — feedback is per-card, not global (D-04)"
  - "WR-01 useEffect dep is [ventanilla.currentTicket], not [] or [ventanilla] — precise re-run on prop change only"
  - "CALL-02 clearTimeout returned from useEffect cleanup — prevents dangling timers (T-04-03 mitigation)"
  - ".call-next-button reuses .add-window-button CSS conventions — consistent button styling across app"

requirements-completed: [CALL-01, CALL-02]

# Metrics
duration: 10min
completed: 2026-07-07
---

# Phase 4 Plan 02: Call Next UI Summary

**VentanillaCard extended with full-width "Llamar siguiente" button, inline empty-queue warning with 2-second auto-dismiss, WR-01 prop-change reset, and CALL_NEXT dispatch wiring — all 21 tests GREEN**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-07-07
- **Completed:** 2026-07-07
- **Tasks:** 1 auto + 1 checkpoint
- **Files modified:** 2

## Accomplishments

- Extended VentanillaCard to accept `onCallNext: (id: number) => void` and `isQueueEmpty: boolean` inside the `Readonly<{...}>` wrapper (SonarLint S6759 preserved)
- Added `useEffect([ventanilla.currentTicket])` — resets `showWarning` to false when currentTicket goes null externally (WR-01 fix, T-04-04 mitigation)
- Added `useEffect([showEmptyWarning])` — sets a 2000ms setTimeout when true; returns `() => clearTimeout(timer)` cleanup (T-04-03 mitigation)
- Added `handleCallNext`: calls `setShowEmptyWarning(true)` on empty queue (early return), else calls `onCallNext(ventanilla.id)`
- Added `button.call-next-button` JSX below `p.ventanilla-ticket`, above both warning paragraphs
- Added `showEmptyWarning && p.ventanilla-warning` JSX with text "No hay turnos en espera"
- Updated App JSX VentanillaCard invocation: `onCallNext={(id) => dispatch({ type: 'CALL_NEXT', windowId: id })}` and `isQueueEmpty={state.queue.length === 0}`
- Added `.call-next-button` CSS rule after `.ventanilla-warning`: same conventions as `.add-window-button` with `width: 100%` and `margin: 8px 0 0`
- All 21 tests pass (15 unit in turnero.test.ts + 6 integration in App.test.tsx) — npm test exits 0

## Task Commits

1. **Task 1: Extend VentanillaCard + add CSS** - `1dbf6d6` (feat)

## Files Created/Modified

- `src/App.tsx` — React import + useEffect; extended VentanillaCard props, two new useEffects, handleCallNext handler, button+warning JSX; App dispatch wiring
- `src/index.css` — .call-next-button rule (width: 100%, follows .add-window-button conventions)

## Decisions Made

- `showEmptyWarning` is local VentanillaCard state (not lifted to App) — empty-queue feedback is per-card per D-04; no cross-component coordination needed
- WR-01 useEffect dep array is `[ventanilla.currentTicket]` precisely — not `[]` (never re-runs) and not `[ventanilla]` (reference changes on every parent render, causing infinite loops)
- `clearTimeout` cleanup in CALL-02 useEffect — prevents dangling timers if component unmounts or warning is rapidly re-triggered (T-04-03 mitigation)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes introduced. All changes are pure client-side React component state and CSS. T-04-03 (dangling timer DoS) and T-04-04 (stale warning tampering) both mitigated as planned.

## Known Stubs

None — no placeholder data, hardcoded empty values, or unconnected components.

## User Setup Required (Checkpoint Pending)

Visual verification required before Phase 4 is considered complete. User must:

1. Run `npm run dev` and open http://localhost:5173
2. Test A: Confirm "Llamar siguiente" button appears full-width at bottom of every VentanillaCard
3. Test B: Add tickets, click "Llamar siguiente" — confirm ticket moves from queue to ventanilla display
4. Test C: Click "Llamar siguiente" on empty queue — "No hay turnos en espera" appears and auto-dismisses in 2 seconds
5. Test D: WR-01 regression — removal warning disappears when CALL_NEXT clears the active ticket

## Self-Check: PASSED

- src/App.tsx: FOUND (modified, 49 net insertions)
- src/index.css: FOUND (modified, .call-next-button rule added)
- Commit 1dbf6d6: FOUND
- 21/21 tests passing: CONFIRMED (npm test exits 0)
- grep "call-next-button" src/index.css: CONFIRMED (contains width: 100%)
- grep "onCallNext" src/App.tsx: CONFIRMED (prop declaration + App dispatch wiring)
- grep "isQueueEmpty" src/App.tsx: CONFIRMED (prop destructuring + state.queue.length === 0)
- grep "ventanilla.currentTicket" src/App.tsx (WR-01 dep array): CONFIRMED

---
*Phase: 04-call-next-atomic-dequeue*
*Completed: 2026-07-07*
