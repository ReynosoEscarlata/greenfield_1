# Project Research Summary

**Project:** Turnero de Sala de Espera
**Domain:** Client-only React SPA / clinic waiting-room queue display
**Researched:** 2026-06-21
**Confidence:** HIGH

## Executive Summary

This is a small, client-only React + TypeScript + Vite clinic waiting-room queue display ("turnero") with a shared ticket queue, a configurable number of call windows ("ventanillas"), sound + animation feedback on call, and localStorage persistence — no backend, no auth. Research confirms the scope already defined in PROJECT.md is correctly sized for this exercise: no new features need to be added, and every "Out of Scope" boundary (no backend, no auth, single shared queue instead of per-window queues, single page, no cross-device sync) correctly avoids over-engineering traps common in this domain.

The recommended approach is a zero-dependency stack: React 19 + TypeScript + Vite for scaffolding, a single `useReducer` lifted into `App` for state (no Context/Redux/Zustand needed at this scale), native `HTMLAudioElement` for the call sound, plain CSS transitions/`@keyframes` for the call animation, and raw `localStorage` with lazy hydration for persistence. This is a single-tier architecture: one pure reducer, a thin persistence adapter wrapping it, and a shallow presentational component tree.

The two biggest technical risks are (1) non-atomic "call next" logic causing race conditions on rapid/concurrent clicks across windows, and (2) unversioned or uncaught localStorage parsing causing hydration bugs or a "beep on reload" glitch. The biggest project-level risk is scope creep away from the stated true goal — finishing the GSD lifecycle end-to-end — so the roadmap should map tightly to PROJECT.md's Active requirements rather than adding "nice to have" queue-product features.

## Key Findings

### Recommended Stack

React 19.x + TypeScript + Vite 7 (scaffolded via `npm create vite@latest -- --template react-ts`, Node 20.19+/22.12+) is the current standard for a no-backend SPA. No additional state, persistence, sound, or animation libraries are needed — native browser APIs and React built-ins cover all requirements at this scale.

**Core technologies:**
- React 19 + TypeScript + Vite — standard 2026 SPA scaffold, zero backend needed
- `useReducer` (built-in) — single source of truth for queue + ventanilla state; pure and unit-testable
- Native `HTMLAudioElement` (`new Audio().play()`) — call sound; libraries like `use-sound`/`howler.js` are unnecessary for a single one-off beep
- Plain CSS `transition`/`@keyframes` — call animation; Framer Motion/Motion is overkill for this scope
- Raw `localStorage` with lazy `useReducer` initializer — persistence; no need for `usehooks-ts` given explicit no-cross-tab-sync, no-SSR constraints

### Expected Features

Current PROJECT.md scope is well-calibrated — every Active requirement is genuine table stakes, every Out of Scope item correctly avoids a known anti-feature/over-engineering trap for this category of app.

**Must have (table stakes):**
- Add ticket to shared queue (auto-incrementing number)
- View upcoming queue order
- Configurable number of windows ("ventanillas")
- Each window shows its current ticket (or empty state)
- "Call next" per window, pulling from the shared queue
- Numeric-only tickets (no patient names) — privacy-aligned pattern, should be stated explicitly so it's never "improved" by adding names
- Distance-readable, high-contrast display styling — not a new feature, but an explicit acceptance criterion every healthcare-display source stresses ("legible from across a room")

**Should have (polish within current scope, not true differentiators since this is an exercise, not a market product):**
- Sound on call
- Transition animation on call change
- localStorage persistence across reloads

**Defer (v2+, explicitly out of scope):**
- Recall / "call again" — adds state complexity, not requested
- Undo last call — adds state complexity, not requested
- Cross-tab/cross-device sync — explicitly out of scope per PROJECT.md

### Architecture Approach

Single-tier architecture: one pure `useReducer` instance lifted into `App`, state passed via props/callbacks to a shallow tree of presentational children (no Context API needed — the tree is shallow enough that prop-drilling isn't painful). The reducer stays pure (no Audio/DOM access) so sound and animation are driven by `useEffect`s reacting to state *changes*, not embedded in reducer logic — this also prevents a "beep on reload" bug where rehydrating from localStorage would otherwise replay a sound.

**Major components:**
1. **Reducer + types** — pure queue/ventanilla state machine (add ticket, call next, add/remove window), independently unit-testable
2. **Persistence hook** — wraps the reducer with lazy localStorage hydration on mount + `useEffect` write-on-change, with versioned schema and try/catch parsing
3. **Presentational UI tree** — App + direct children (add-ticket control, queue list, ventanilla panels, window config), consuming reducer output via props
4. **Sound/animation layer** — `useEffect`s watching state changes, native `Audio.play()` triggered synchronously inside click handlers, CSS class/key-based transitions scoped per-ventanilla

### Critical Pitfalls

1. **Race condition on rapid "Llamar siguiente" clicks** — if queue dequeue is implemented as separate read-then-write `useState` calls instead of one atomic `useReducer` action, concurrent clicks across windows can hand out duplicate or skipped tickets. Avoid by making "call next" a single atomic reducer action.
2. **localStorage hydration bugs** — missing schema versioning or unguarded `JSON.parse` on corrupted/missing data causes crashes or stale state on load. Avoid with lazy `useReducer` initializer + versioned schema + try/catch fallback to default state.
3. **Audio autoplay blocked** — sound must be triggered synchronously inside the click handler, never inside an effect reacting to state change and never on page load/hydration, or browsers will silently block it (verified against MDN/Chrome autoplay policy docs).
4. **Scope creep toward "real" queue-product features** — cross-tab sync, recall/undo, multi-device support all sound natural given "multiple ventanillas" but are explicitly out of scope; the roadmap should map 1:1 to PROJECT.md's Active requirements list.
5. **Undefined "next ticket number" source of truth** — numbering must come from an independent persisted counter, not derived from current queue/history length, or numbers can collide after tickets are called and removed from the visible queue.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Core Queue & Ventanilla Logic
**Rationale:** Solves the highest-severity pitfall (atomic call-next, correct ticket numbering) in isolation, unit-testable before any browser API or UI layers on top
**Delivers:** Pure reducer + types for queue state, ticket numbering, and configurable ventanillas (add/remove window, call next)
**Addresses:** Add ticket, view queue, configurable windows, call next, per-window current ticket
**Avoids:** Race conditions on concurrent calls; ticket numbering collisions

### Phase 2: UI Composition
**Rationale:** Wires the proven reducer to a shallow React component tree once core logic is verified
**Delivers:** App + direct children (add-ticket control, queue list, ventanilla panels, window config UI), distance-readable/high-contrast styling
**Uses:** React + TypeScript + Vite, `useReducer`
**Implements:** Presentational UI tree component from ARCHITECTURE.md

### Phase 3: Persistence (localStorage)
**Rationale:** Adds versioned, validated, lazy-init localStorage hydration once state shape is finalized from Phases 1–2, avoiding schema churn
**Delivers:** Persistence hook wrapping the reducer, with schema versioning and defensive parsing

### Phase 4: Sound & Animation Feedback
**Rationale:** Last-mile polish, deliberately isolated from the pure reducer to avoid coupling side effects into core logic
**Delivers:** Native `Audio` call sound triggered synchronously on click, CSS transition/animation on ventanilla ticket change

### Phase Ordering Rationale

- Core queue/reducer logic comes first because it's the Core Value (correct, race-free "call next" behavior) and is independently testable without any browser API
- Persistence comes after UI so the persisted state shape is stable before being versioned
- Sound/animation comes last because both are explicitly decoupled side effects layered onto state changes, not part of core logic — building them earlier risks coupling bugs (e.g., beep-on-reload)
- This order directly avoids the top pitfalls: race conditions (Phase 1), localStorage hydration bugs (Phase 3), and audio autoplay/animation flicker (Phase 4)

### Research Flags

Phases likely needing deeper research during planning:
- None strongly required — all phases rely on standard, well-documented React/browser patterns (HIGH/MEDIUM-HIGH confidence across all four research dimensions)

Phases with standard patterns (skip research-phase):
- **Phase 1:** `useReducer` pattern is official React documentation, no further research needed
- **Phase 2:** Component composition is standard React practice
- **Phase 3:** Lazy-init + `useEffect` persistence is a well-documented, widely-used pattern
- **Phase 4:** Audio autoplay policy and CSS animation triggers are verified against MDN/Chrome official docs

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH-MEDIUM | WebSearch-verified against official react.dev/vite.dev references; exact patch versions will drift by execution time, recommend re-running scaffold command rather than pinning versions now |
| Features | HIGH | Verified across commercial queue products, OSS implementations, and healthcare-display guidance |
| Architecture | HIGH | Component boundaries and state shape directly derived from PROJECT.md requirements + official React docs patterns |
| Pitfalls | HIGH | State race conditions and localStorage pitfalls verified against React official docs and standard JS platform behavior; audio autoplay policy verified directly against MDN/Chrome docs |

**Overall confidence:** HIGH

### Gaps to Address

- **Window removal semantics:** Behavior when removing a ventanilla that currently has an active ticket (discard ticket from view vs. return to queue vs. block removal) is not specified in PROJECT.md — resolve during requirements/roadmap definition. Simplest option per research: removal just discards the window's current ticket from view.
- **Ticket numbering source of truth:** Must be an independent persisted counter, not derived from queue/history length — resolve explicitly in Phase 1 data model design.
- **Empty-queue "call next" UX:** Not specified — needs a requirements decision (disable button vs. "no hay turnos" message vs. no-op). Cheap to add, should be folded into the "call next" requirement rather than left undefined.
- **Distance-readable styling:** Should be captured as an explicit acceptance criterion in Phase 2, not assumed as generic web styling.

## Sources

### Primary (HIGH confidence)
- react.dev official docs — `useReducer` pattern, functional state updaters
- vite.dev official docs — scaffold command, Node engine requirements
- MDN Web Docs — `HTMLAudioElement`, localStorage API
- Chrome for Developers — autoplay policy documentation

### Secondary (MEDIUM confidence)
- Multiple independent blog/community sources — native-API-over-library consensus for sound/animation/persistence at this scale
- react-transition-group issue discussions — animation/React reconciliation pitfalls

### Tertiary (LOW confidence)
- None flagged — all findings corroborated by at least one official or multiple independent sources

---
*Research completed: 2026-06-21*
*Ready for roadmap: yes*
