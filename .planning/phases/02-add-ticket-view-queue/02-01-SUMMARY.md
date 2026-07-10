---
phase: 02-add-ticket-view-queue
plan: 01
subsystem: ui
tags: [react, typescript, vitest, testing-library, useReducer]

# Dependency graph
requires:
  - phase: 01-project-scaffold-visible-shell
    provides: Static App.tsx shell, src/index.css with base styles, Vite+React+TS scaffold
provides:
  - queueReducer with ADD_TICKET action and nextNumber independent counter (src/turnero.ts)
  - Five passing unit tests covering QUEUE-01 and QUEUE-02 (src/turnero.test.ts)
  - Live App.tsx with useReducer, Agregar turno button, and conditional queue chip render
  - CSS rules for .add-ticket-button, .ticket-list, .ticket-chip
  - vitest 4.1.10 + @testing-library/react + jest-dom + jsdom devDependencies
affects:
  - phase: 03-configure-windows (reads App.tsx structure, ventanillas-grid region)
  - phase: 04-call-next (extends QueueAction with CALL_NEXT, reads queueReducer from turnero.ts)
  - phase: 08-persistence (serializes QueueState shape to localStorage)

# Tech tracking
tech-stack:
  added:
    - vitest 4.1.10 (test framework)
    - "@testing-library/react (component testing)"
    - "@testing-library/jest-dom (custom DOM matchers)"
    - jsdom (headless browser environment for tests)
  patterns:
    - useReducer with discriminated union QueueAction (not useState for multi-field state)
    - Reducer extracted to separate testable module (src/turnero.ts), not inlined in App.tsx
    - nextNumber as independent state field — NEVER derived from queue.length
    - key={ticket.id} (stable id key), never key={index}

key-files:
  created:
    - src/turnero.ts
    - src/turnero.test.ts
    - src/setupTests.ts
  modified:
    - src/App.tsx
    - src/index.css
    - vite.config.ts
    - tsconfig.app.json
    - package.json

key-decisions:
  - "State shape: Ticket { id, number } — id is stable React key, number is display value; both equal today, diverge in OPS-01 recall feature"
  - "Counter invariant: nextNumber is its own state field, never derives from queue.length — foundational QUEUE-01 constraint Phase 4 depends on"
  - "Reducer extracted to src/turnero.ts for testability and Phase 4/8 reuse (not inlined in App.tsx)"
  - "CSS values (UI-SPEC overrides RESEARCH.md): button padding 12px 16px, chip padding 8px 16px, chip font-weight 400"
  - "Chip background #ffffff (not #f1f3f5) to visually distinguish chips from the .queue-strip #f1f3f5 container"

patterns-established:
  - "Reducer module pattern: typed state + discriminated union action + switch with default case in separate file"
  - "TDD RED/GREEN: test file committed first with failing import, then implementation committed to GREEN"
  - "vitest globals: true with tsconfig.app.json types vitest/globals for zero-import test syntax"

requirements-completed: [QUEUE-01, QUEUE-02]

# Metrics
duration: 10min
completed: 2026-07-07
---

# Phase 2 Plan 01: Add Ticket & View Queue Summary

**useReducer-backed queue with independent nextNumber counter, five passing vitest unit tests, and live Agregar turno button rendering Turno N chips horizontally in the queue strip**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-07-07T02:30:00Z
- **Completed:** 2026-07-07T02:39:39Z
- **Tasks:** 5 (W0-01 checkpoint + W0-02 + W0-03 + W0-04 + W1-01 + W1-02 + W1-03)
- **Files modified:** 8

## Accomplishments

- vitest 4.1.10 + testing-library test stack installed and configured with jsdom environment
- Five unit tests RED then GREEN: QUEUE-01-A/B/C (counter independence) and QUEUE-02-A/B (ordered list + empty state)
- src/turnero.ts: Ticket type, QueueState, QueueAction union, initialState, queueReducer — the shared state module Phase 4 and Phase 8 will extend
- App.tsx replaced static shell with live useReducer-driven component: Agregar turno button, conditional chip render
- CSS: .add-ticket-button (semibold, gray bg), .ticket-list (flex-wrap), .ticket-chip (white rounded pill) — UI-SPEC values used

## Task Commits

Each task was committed atomically:

1. **W0-02: Install devDependencies** - `4395726` (chore)
2. **W0-03: Configure vitest + setupTests.ts** - `af1c204` (chore)
3. **W0-04: Failing unit tests (RED)** - `cf7d9c0` (test)
4. **W1-01: src/turnero.ts + TypeScript fix (GREEN)** - `ea86463` (feat)
5. **W1-02: App.tsx with useReducer + button** - `264bf50` (feat)
6. **W1-03: CSS rules appended** - `753283d` (feat)

## Files Created/Modified

- `src/turnero.ts` — Ticket, QueueState, QueueAction, initialState, queueReducer (all named exports)
- `src/turnero.test.ts` — Five unit tests for QUEUE-01 and QUEUE-02 (all passing GREEN)
- `src/setupTests.ts` — @testing-library/jest-dom import for vitest setup
- `src/App.tsx` — useReducer hook, Agregar turno button, conditional queue chip render
- `src/index.css` — Three new rule blocks appended (.add-ticket-button, .ticket-list, .ticket-chip)
- `vite.config.ts` — test block added (jsdom environment, globals, setupFiles); triple-slash updated to vitest/config
- `tsconfig.app.json` — Added vitest/globals to types array
- `package.json` — Four new devDependencies (vitest, @testing-library/react, jest-dom, jsdom)

## Decisions Made

- **Reducer extracted to src/turnero.ts** — not inlined in App.tsx — so it can be unit-tested without rendering React and extended cleanly by Phase 4 (CALL_NEXT) and Phase 8 (localStorage serialization).
- **nextNumber as independent state field** — this is the QUEUE-01 invariant. Counter must never be derived from `queue.length` or `queue[queue.length-1]?.number + 1` because Phase 4 will remove tickets from the front of the queue; if nextNumber derived from queue.length it would reset after each call.
- **Ticket id === ticket.number in v1** — kept as two separate fields because id is the stable React reconciliation key and number is the display label; they diverge if OPS-01 (deferred recall feature) ever renumbers displayed tickets.
- **CSS values from UI-SPEC override RESEARCH.md examples** — button padding 12px 16px, chip padding 8px 16px, chip font-weight 400 (2-weight contract: 400/600 only).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] TypeScript could not find vitest globals in test files**
- **Found during:** W1-01 verification (`npm run build`)
- **Issue:** `tsconfig.app.json` had `"types": ["vite/client"]` only. Test files use `describe`/`it`/`expect` as globals (enabled by `globals: true` in vitest config) but TypeScript didn't know the types, producing TS2593/TS2304 errors on every test global.
- **Fix:** Added `"vitest/globals"` to the types array in `tsconfig.app.json`.
- **Files modified:** `tsconfig.app.json`
- **Verification:** `npm run build` exits 0 after fix.
- **Committed in:** `ea86463` (W1-01 task commit)

**2. [Rule 1 - Bug] vite.config.ts `test` block not recognized by TypeScript**
- **Found during:** W1-01 verification (`npm run build`)
- **Issue:** Triple-slash directive was `/// <reference types="vitest" />`. The correct directive for adding the `test` property to `defineConfig` is `/// <reference types="vitest/config" />` — without `/config` the `test` block type augmentation is not applied, producing TS2769 on the `test:` property.
- **Fix:** Changed `/// <reference types="vitest" />` to `/// <reference types="vitest/config" />` in `vite.config.ts`.
- **Files modified:** `vite.config.ts`
- **Verification:** `npm run build` exits 0 after fix.
- **Committed in:** `ea86463` (W1-01 task commit)

---

**Total deviations:** 2 auto-fixed (both Rule 1 — TypeScript type config bugs)
**Impact on plan:** Both fixes necessary for `npm run build` to pass. No scope creep; both are standard vitest setup patterns that the plan's action didn't specify precisely enough.

## Issues Encountered

None beyond the two TypeScript config bugs auto-fixed above.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- **Phase 3 (configure windows):** App.tsx ventanillas-grid section placeholder is unchanged and ready for Phase 3 to fill in.
- **Phase 4 (call next):** `src/turnero.ts` has a comment marking the QueueAction extension point for `{ type: 'CALL_NEXT'; windowId: string }`. The `nextNumber` counter independence invariant is established and tested.
- **Phase 8 (persistence):** QueueState is a plain serializable object `{ queue: Ticket[], nextNumber: number }` — no functions or circular refs; straightforward to `JSON.stringify` into localStorage.

---
*Phase: 02-add-ticket-view-queue*
*Completed: 2026-07-07*
