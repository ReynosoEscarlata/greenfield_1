---
phase: 06-call-transition-animation
plan: 02
subsystem: ui-animation
tags: [css-animation, react, keyframes, tdd-green, feedback-02]

# Dependency graph
requires:
  - phase: 06-01
    provides: FEEDBACK-02 failing tests (RED state)
provides:
  - CSS @keyframes ticket-flash + .ventanilla-ticket-flash modifier class
  - VentanillaCard <p> key prop + conditional flash className (GREEN state)
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "CSS @keyframes background-color animation with forwards fill-mode"
    - "React key prop on non-list element to force remount and restart CSS animation"
    - "Conditional className ternary: base-class + modifier vs base-class only"

key-files:
  created: []
  modified:
    - src/index.css
    - src/App.tsx

key-decisions:
  - "@keyframes ticket-flash uses background-color #fbbf24 -> transparent per UI-SPEC; IDE hints about Paint/Composite are expected and non-blocking"
  - "key={ventanilla.currentTicket?.id ?? 'empty'} uses fallback string 'empty' (not null/undefined) to give React a valid number|string key"
  - "Flash class applied only when currentTicket !== null (D-07: no flash on null state)"

# Metrics
duration: 12min
completed: 2026-07-07
---

# Phase 06 Plan 02: Call Transition Animation (GREEN) Summary

**CSS @keyframes ticket-flash (600ms ease-out, #fbbf24 amber to transparent) added to src/index.css; VentanillaCard <p> updated with key prop + conditional flash className; all 26 tests pass including 3 FEEDBACK-02 tests now GREEN — pending visual checkpoint**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-07-07T22:20:00Z
- **Completed:** 2026-07-07T22:29:00Z
- **Tasks:** 2 of 3 completed (Task 3 is visual checkpoint — awaiting human verify)
- **Files modified:** 2

## Accomplishments

- Added `@keyframes ticket-flash` rule (from: #fbbf24, to: transparent) and `.ventanilla-ticket-flash` modifier class (animation + border-radius: 4px) to src/index.css between .ventanilla-ticket and .ventanilla-remove blocks
- Updated `<p className="ventanilla-ticket">` in VentanillaCard (src/App.tsx) with:
  - `key={ventanilla.currentTicket?.id ?? 'empty'}` for React remount-on-change
  - Conditional className: `'ventanilla-ticket ventanilla-ticket-flash'` when non-null, `'ventanilla-ticket'` when null
- All 26 tests pass (npm test exits 0): 23 prior tests green + 3 FEEDBACK-02 tests now GREEN

## Task Commits

Each task was committed atomically:

1. **Task 1: @keyframes and .ventanilla-ticket-flash in index.css** - `7a9841e` (feat)
2. **Task 2: key prop + conditional className on VentanillaCard <p>** - `670e046` (feat)

## Files Created/Modified

- `src/index.css` — 14 lines inserted: @keyframes ticket-flash rule (8 lines) + .ventanilla-ticket-flash class (4 lines) + blank line separators
- `src/App.tsx` — 8 lines changed: `<p className="ventanilla-ticket">` (1 line) replaced with multi-line version adding key prop + className ternary expression (9 lines)

## Decisions Made

- IDE performance hints (Hint severity) about `background-color` triggering Paint/Composite inside @keyframes are expected and intentional — the UI-SPEC explicitly specifies `background-color` animation; using `opacity` instead would require a different visual approach and is out of scope.
- `?? 'empty'` fallback is mandatory (not `?? null` or `?? undefined`) — React silently falls back to index reconciliation for null/undefined keys.

## Deviations from Plan

None — plan executed exactly as written. Both source changes matched the verbatim patterns in 06-PATTERNS.md and 06-UI-SPEC.md.

## Checkpoint Status

Task 3 is a `checkpoint:human-verify` — visual confirmation is required before this plan is marked fully complete. The CSS and JSX implementation are complete; tests pass. The checkpoint verifies:
1. Amber flash appears on "Llamar siguiente" click (~600ms)
2. Flash scope is limited to the ticket `<p>` only (not card/label/buttons)
3. Rapid successive calls restart the flash from full amber
4. No flash on page load (all ventanillas start as 'sin turno')

## Known Stubs

None — no placeholder data or hardcoded empty values introduced.

## Threat Flags

None — no new network endpoints, auth paths, file access patterns, or schema changes. CSS class names and keyframe names are static strings with no injection vector.

## Self-Check

- [x] src/index.css modified at correct insertion point (between .ventanilla-ticket and .ventanilla-remove)
- [x] grep -c "ticket-flash" src/index.css = 3 (selector, @keyframes name, animation shorthand)
- [x] src/App.tsx contains key={ventanilla.currentTicket?.id ?? 'empty'}
- [x] src/App.tsx contains 'ventanilla-ticket ventanilla-ticket-flash'
- [x] npm test exits 0 with 26 tests passing
- [x] Commits 7a9841e and 670e046 exist

## Self-Check: PASSED
