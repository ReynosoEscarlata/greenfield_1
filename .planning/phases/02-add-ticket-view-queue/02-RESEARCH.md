# Phase 2: Add Ticket & View Queue - Research

**Researched:** 2026-06-22
**Domain:** React 19 + TypeScript client-only state management (queue array + independent counter)
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**D-04 — Ticket Number Format:** Tickets display as a labeled string, e.g. "Turno 5" — not a bare number ("5") and not a hash-prefixed form ("#5"). Most explicit for first-time users. This format applies everywhere a ticket number is shown going forward (queue chips now; ventanilla current-ticket display in later phases should follow the same convention unless a future phase explicitly revisits it).

**D-05 — Queue List Layout:** Waiting tickets render as a horizontal wrapping row of chips/badges inside the existing `.queue-strip` region — each ticket is a small rounded badge, and the row wraps to additional lines as the queue grows (does not scroll sideways, does not become a vertical list). This preserves the "horizontal strip" visual locked in Phase 1 (D-01).

**D-06 — Empty Queue Messaging:** Reuse the existing placeholder copy "Próximos turnos aparecerán aquí" for the empty-queue state — both on first load (before any ticket has ever been added) and whenever the queue becomes empty again after tickets are added. No separate "no hay turnos en espera" message; one empty-state string covers both cases.

**D-07 — Add Button Placement:** The "Agregar turno" button is placed above the queue strip (between the `<h1>` page title and the `.queue-strip` section) — reads top-to-bottom as "action, then result."

### Claude's Discretion

- Internal state shape (useState vs useReducer) for the queue array and the independent ticket counter — implementation detail, not discussed with the user. STACK.md recommends colocated `useState`/`useReducer` in the root `App` component or one custom hook; either satisfies D-04/D-05/D-06/D-07 above.
- Exact button styling (color/size) beyond using the existing global stylesheet conventions (`#1f2933` text, `#f1f3f5` secondary background) from Phase 1.
- Whether the chip/badge styling reuses `.ventanillas-grid > *`'s `#f1f3f5` background convention or introduces a new chip style — left to Claude, as long as it stays within the single-global-CSS-file constraint (Phase 1 D-02).

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope (ticket add + queue display only; no call logic, sound, animation, or persistence discussed).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| QUEUE-01 | Usuario puede agregar un nuevo turno a la cola con un botón "Agregar turno" (numeración automática incremental, basada en un contador independiente, no en la longitud de la cola) | See "Standard Stack," "Don't Hand-Roll," and "Pitfall 1" — `nextNumber` reducer field, never derived from `queue.length`, incremented exactly once per `ADD_TICKET` dispatch |
| QUEUE-02 | Usuario puede ver la lista ordenada de turnos en espera (los próximos a ser llamados) | See "Pattern 2 (Conditional Render)" and "Code Examples" — `state.queue.map(...)` preserves insertion order; empty-state branch satisfies D-06 |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Tech stack:** React + TypeScript + Vite only — no new runtime dependencies for this phase (confirmed: zero packages needed).
- **No backend:** All state lives in the client; this phase introduces no persistence yet (Phase 8 owns localStorage).
- **Single page/view:** No routing — this phase only extends the existing `App.tsx` tree, adds no new routes/views.
- **No auth:** Not applicable to this phase's scope.
- **No state management library:** Explicitly forbidden (Redux, Zustand, Jotai, Recoil) — use `useState`/`useReducer` only, per STACK.md "What NOT to Use."
- **Single global CSS file (`src/index.css`):** Phase 1 D-02 — all new styles (button, chips) must be appended to this file, no CSS modules, no styled-components, no Tailwind.
- **GSD workflow enforcement:** File edits for this phase must happen through `/gsd-execute-phase`, not ad-hoc direct edits.

## Summary

Phase 2 is the first vertical slice of real logic: a single `useReducer` hook in `App.tsx` (or a small `useTurnero` custom hook) holding `{ queue: Ticket[], nextNumber: number }`, driven by one action (`ADD_TICKET`). No new dependencies are needed — React 19.2.7 (already installed) and TypeScript 6.0.3 are sufficient. The critical correctness requirement (QUEUE-01: counter "never resets based on queue length after removals") rules out deriving ticket numbers from `queue.length` or `queue[queue.length-1].number + 1` — the counter must be its own piece of state, incremented exactly once per `ADD_TICKET` action, decoupled from queue size.

`useReducer` is recommended over plain `useState` specifically because this phase's state has two fields that must update atomically in lockstep (the queue array gets a new ticket AND the counter advances, in the same action) — a `useReducer` with a typed discriminated-union action makes that atomicity explicit and sets up the exact shape STACK.md anticipates for Phase 4's `CALL_NEXT` action. This also sidesteps a real pitfall: React 19 still double-invokes state initializer functions in development under `<StrictMode>`, so the counter must live in reducer state (not a module-level `let` or a ref mutated during render) to guarantee one call = one increment, with no double-counting artifacts during development.

**Primary recommendation:** Add a `useReducer<QueueState, QueueAction>` hook (colocated in `App.tsx` or extracted to `src/useTurnero.ts`) with state `{ queue: Ticket[]; nextNumber: number }`, a single `ADD_TICKET` action, and a `Ticket = { id: number; number: number }` type (numeric `id`/`number` are the same value here, but keep `number` semantically separate from `id` so Phase 4's removal logic can use `id` for keys without coupling to the display number).

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Ticket counter (independent, ever-incrementing) | Browser / Client (React reducer state) | — | No backend exists; state lives entirely in the `App` component tree per CLAUDE.md constraints |
| Queue array (ordered waiting tickets) | Browser / Client (React reducer state) | — | Same reducer as counter — single source of truth, updated atomically per action |
| "Agregar turno" button / dispatch | Browser / Client (event handler) | — | Synchronous `dispatch` call inside the click handler; no async/network boundary |
| Queue list rendering (chips) | Browser / Client (React render) | — | Pure derived UI from `state.queue`; no separate data-fetch needed |
| CSS chip styling | Browser / Client (CSS) | — | Single global stylesheet per Phase 1 D-02; no CSS-in-JS or modules |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `react` | `19.2.7` [VERIFIED: npm registry] | UI rendering, hooks (`useReducer`) | Already installed (package.json); no change needed |
| `typescript` | `6.0.3` [VERIFIED: npm registry] | Discriminated-union action types for the reducer | Already installed; matches Phase 1 scaffold |

No new packages are required for this phase. **Installation:** none — zero `npm install` commands needed.

### Supporting

None. This phase touches no dependency beyond what Phase 1 scaffolded.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `useReducer` with `{queue, nextNumber}` state | Two separate `useState` calls (`queue`, `nextNumber`) | Two `useState` calls can be updated independently, which risks them drifting out of sync if a future edit updates one without the other (e.g., Phase 4 removing from `queue` without touching `nextNumber` is fine, but a bug that updates `nextNumber` without pushing to `queue` would silently skip a ticket number with no array entry). `useReducer` forces both fields to change together inside one action handler, by construction. |
| Numeric `id`/`number` split on `Ticket` | Single field doing double duty as both id and display number | Keeping them conceptually separate (even though they hold the same value in v1) avoids a refactor in Phase 4/8 if a future requirement ever needs a ticket's array key to diverge from its displayed number (e.g., a future recall feature, v2/OPS-01, deferred but documented in REQUIREMENTS.md). Low cost now, removes a future migration. |

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Atomic counter+array update | Manual two-step `setState` calls in sequence | Single `dispatch({ type: 'ADD_TICKET' })` handled by one reducer case | React batches state updates from one event handler regardless, but a reducer makes the "these two fields change together" invariant explicit in code, not just in batching behavior — easier to verify and extend in Phase 4 |
| Deriving ticket number from array state | `queue.length + 1` or `queue[queue.length - 1]?.number + 1` | Independent `nextNumber` counter field in reducer state | Explicitly forbidden by QUEUE-01: "no basado en la longitud de la cola" — must survive removals (Phase 4) without reusing or skipping numbers incorrectly |

**Key insight:** This phase has no genuinely complex sub-problem that calls for a library — the entire "don't hand-roll" risk here is conceptual (deriving the counter from the wrong source), not a missing dependency.

## Architecture Patterns

### System Architecture Diagram

```
[User click: "Agregar turno"]
        |
        v
[onClick handler in App.tsx]
        |
        v
[dispatch({ type: 'ADD_TICKET' })]
        |
        v
[reducer(state, action)]
   - reads state.nextNumber
   - creates { id: nextNumber, number: nextNumber }
   - appends to state.queue
   - increments state.nextNumber
        |
        v
[new state returned] -> [React re-renders App]
        |
        v
[queue-strip section maps state.queue -> chip elements]
   (or renders placeholder text if state.queue.length === 0)
```

This is a single-direction, synchronous flow with no async boundary, no network, no persistence (Phase 8 adds localStorage later) — entirely contained within one component's render cycle.

### Recommended Project Structure

```
src/
├── App.tsx           # root component: holds useReducer, renders button + queue chips + ventanillas placeholder
├── turnero.ts         # (optional) Ticket type, QueueState type, QueueAction union, reducer function — extracted for testability and reuse by Phase 4/8
├── index.css          # single global stylesheet (Phase 1 D-02) — add .ticket-chip rule here
└── main.tsx           # unchanged entry point
```

Whether the reducer lives inline in `App.tsx` or is extracted to `turnero.ts` is Claude's discretion per CONTEXT.md — extraction is recommended only if it measurably improves clarity; for a single action type, inlining in `App.tsx` is equally acceptable and keeps the phase's diff small.

### Pattern 1: Discriminated-Union Reducer for Queue State

**What:** Model state as `{ queue: Ticket[]; nextNumber: number }`, actions as a tagged union (starting with one variant, extended in later phases).
**When to use:** Whenever two or more state fields must change together as a single, atomic, named operation — exactly this phase's "append to queue AND advance counter."
**Example:**
```typescript
// Source: pattern verified via React docs (react.dev/reference/react/useReducer)
// and TypeScript discriminated union conventions (react.dev/learn/typescript)

type Ticket = {
  id: number;
  number: number;
};

type QueueState = {
  queue: Ticket[];
  nextNumber: number;
};

type QueueAction =
  | { type: 'ADD_TICKET' };
  // Phase 4 will extend this union with { type: 'CALL_NEXT'; windowId: string }

const initialState: QueueState = {
  queue: [],
  nextNumber: 1,
};

function queueReducer(state: QueueState, action: QueueAction): QueueState {
  switch (action.type) {
    case 'ADD_TICKET': {
      const ticket: Ticket = { id: state.nextNumber, number: state.nextNumber };
      return {
        queue: [...state.queue, ticket],
        nextNumber: state.nextNumber + 1,
      };
    }
    default:
      return state;
  }
}

// In App.tsx:
// const [state, dispatch] = useReducer(queueReducer, initialState);
// <button onClick={() => dispatch({ type: 'ADD_TICKET' })}>Agregar turno</button>
```

### Pattern 2: Conditional Render — List vs. Empty State

**What:** Render the placeholder text when `queue.length === 0`, otherwise map tickets to chip elements — both states live in the same `.queue-strip` section, swapping content based on array length.
**When to use:** Any place an empty-collection state needs distinct messaging (here, reusing the exact same string per D-06, on first load AND after the queue empties again).
**Example:**
```typescript
// Source: standard React conditional rendering pattern (react.dev/learn/conditional-rendering)
<section className="queue-strip">
  <h2>Cola</h2>
  {state.queue.length === 0 ? (
    <p>Próximos turnos aparecerán aquí</p>
  ) : (
    <ul className="ticket-list">
      {state.queue.map((ticket) => (
        <li key={ticket.id} className="ticket-chip">
          Turno {ticket.number}
        </li>
      ))}
    </ul>
  )}
</section>
```
Using `<ul>`/`<li>` (rather than a flat `<div>` of `<span>`s) is semantically appropriate for an ordered list of items and costs nothing — style `.ticket-list` as `display: flex; flex-wrap: wrap;` to satisfy D-05's "horizontal wrapping row of chips" requirement without `display: grid` (grid would force column alignment; flex-wrap lets chip widths vary naturally with "Turno N" text length).

### Anti-Patterns to Avoid

- **Deriving `nextNumber` from `queue.length`:** Breaks immediately once Phase 4 removes tickets from the queue — explicitly the bug QUEUE-01 is written to prevent. The counter must only ever increase, regardless of queue size.
- **Storing the counter as a module-level `let` variable outside the component:** Survives React's intentional double-invocation behavior unpredictably and breaks Fast Refresh/HMR (the module-level variable persists across hot reloads in unexpected ways, and resets to its initial value on a full page reload before Phase 8 adds persistence — acceptable for now, but a module-level mutable counter outside React state is invisible to React's render cycle, makes testing harder, and provides no way for Phase 8 to serialize it to localStorage). Keep it in reducer state.
- **Two independent `useState` calls for `queue` and `nextNumber`:** Risks the two falling out of sync across future edits (see Alternatives Considered above). Use one `useReducer` covering both fields.
- **`key={index}` on rendered ticket chips:** Using the array index as the React `key` instead of the ticket's stable `id` causes incorrect DOM reuse once Phase 4 removes tickets from the middle/front of the array (remaining tickets' indices shift, but their `key`s should not). Use `ticket.id`.

## Common Pitfalls

### Pitfall 1: Counter Resets or Skips After Removal (violates QUEUE-01)

**What goes wrong:** A future edit (Phase 4) accidentally derives the "next number" display or the counter from `queue.length` instead of the independent `nextNumber` field, causing ticket numbers to repeat or jump unexpectedly once tickets are removed from the front of the queue.
**Why it happens:** It's tempting to think "next number = how many tickets exist so far," which is true only if tickets are never removed — but Phase 4 removes the front of the queue on every "Llamar siguiente" call.
**How to avoid:** Keep `nextNumber` as its own reducer state field from Phase 2 onward; never compute it from `queue.length` anywhere in the codebase, including future phases.
**Warning signs:** Any code that reads `state.queue.length` to decide the next ticket number, or that resets `nextNumber` to `1` anywhere other than the reducer's `initialState`.

### Pitfall 2: StrictMode Double-Invocation of State Initializers

**What goes wrong:** In React 19 development mode under `<StrictMode>`, functions passed as the second argument to `useReducer` (an initializer function, if used) or as `useState` initializers are called twice; if a developer puts a side effect (e.g., `console.log`, a counter increment, a `Math.random()` call) inside an initializer function, it appears to run twice in dev but once in production — confusing during debugging. [CITED: react.dev/reference/react/StrictMode, github.com/facebook/react/issues/20090]
**Why it happens:** React intentionally double-invokes certain render-phase functions in development to surface impure code — this is a diagnostic feature, not a bug.
**How to avoid:** This phase's `initialState` is a plain object literal (not a lazy-initializer function), so this pitfall does not directly apply yet — but if a future phase switches to `useReducer(reducer, initialArg, init)` for lazy initialization (e.g., reading from localStorage in Phase 8), the `init` function must be pure (no side effects, no counters) to avoid surprises under StrictMode.
**Warning signs:** Console logs or counters that appear to fire twice on mount in dev but once in a production build — this is StrictMode working as intended, not a logic bug, and should not be "fixed" by moving state out of React.

### Pitfall 3: Button Disabled or Missing Feedback on Rapid Clicks

**What goes wrong:** Although not a requirement for this phase (no debounce/rate-limiting is in scope), rapid clicking of "Agregar turno" could visually create many chips at once with no transition, looking like a jump rather than incremental additions — purely cosmetic, deferred to Phase 6 (FEEDBACK-02 animation).
**Why it happens:** This phase intentionally has no animation; rapid additions are visually abrupt by design.
**How to avoid:** No action needed in Phase 2 — explicitly out of scope per phase boundary ("no animation" listed in CONTEXT.md). Do not add animation code in this phase; it would duplicate work Phase 6 owns.
**Warning signs:** N/A — only relevant if Phase 2 work accidentally creeps into Phase 6 scope.

## Code Examples

### Full Reducer + Component Skeleton

```typescript
// Source: composed from react.dev/reference/react/useReducer +
// react.dev/learn/typescript discriminated union guidance, applied to this project's CONTEXT.md decisions (D-04..D-07)

import { useReducer } from 'react';

type Ticket = {
  id: number;
  number: number;
};

type QueueState = {
  queue: Ticket[];
  nextNumber: number;
};

type QueueAction = { type: 'ADD_TICKET' };

const initialState: QueueState = { queue: [], nextNumber: 1 };

function queueReducer(state: QueueState, action: QueueAction): QueueState {
  switch (action.type) {
    case 'ADD_TICKET': {
      const ticket: Ticket = { id: state.nextNumber, number: state.nextNumber };
      return { queue: [...state.queue, ticket], nextNumber: state.nextNumber + 1 };
    }
    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(queueReducer, initialState);

  return (
    <div className="page">
      <h1 className="page-title">Turnero</h1>
      <button
        type="button"
        className="add-ticket-button"
        onClick={() => dispatch({ type: 'ADD_TICKET' })}
      >
        Agregar turno
      </button>
      <section className="queue-strip">
        <h2>Cola</h2>
        {state.queue.length === 0 ? (
          <p>Próximos turnos aparecerán aquí</p>
        ) : (
          <ul className="ticket-list">
            {state.queue.map((ticket) => (
              <li key={ticket.id} className="ticket-chip">
                Turno {ticket.number}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="ventanillas-grid">
        <h2>Ventanillas</h2>
        <p>Las ventanillas configuradas aparecerán aquí</p>
      </section>
    </div>
  );
}

export default App;
```

### CSS Additions (append to existing `src/index.css`, do not create a new file — Phase 1 D-02)

```css
/* Source: extends Phase 1 conventions (#1f2933 text, #f1f3f5 secondary bg) */
.add-ticket-button {
  font-size: 16px;
  font-weight: 600;
  color: #1f2933;
  background: #f1f3f5;
  border: none;
  border-radius: 6px;
  padding: 12px 20px;
  margin: 0 0 24px;
  cursor: pointer;
}

.ticket-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.ticket-chip {
  background: #ffffff;
  color: #1f2933;
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 16px;
  font-weight: 500;
}
```
Chip background uses `#ffffff` (not `.queue-strip`'s own `#f1f3f5`) so chips are visually distinct from the `.queue-strip` container background they sit inside — CONTEXT.md leaves exact chip styling to Claude's discretion (see decisions section), this is one reasonable choice within the existing palette. The planner/implementer may also choose to reuse `#f1f3f5` directly for chips if a flatter look is preferred; either satisfies D-05.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| Class component `this.state` + `this.setState` | Function component + `useReducer`/`useState` | React 16.8 (2019) | Not directly relevant here since project starts on React 19 with hooks already standard — included for completeness, no migration needed |

No other state-of-the-art shifts apply — `useReducer` with discriminated unions has been the stable, recommended TypeScript pattern for multi-field atomic state since hooks were introduced, and remains current in React 19.2 docs. [CITED: react.dev/reference/react/useReducer, accessed 2026-06-22]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Extracting the reducer to a separate `src/turnero.ts` file vs. inlining in `App.tsx` is purely Claude's discretion with no functional difference | Recommended Project Structure | Low — either structure satisfies all locked decisions (D-04 through D-07) and QUEUE-01/02; this is a code-organization preference, not a correctness concern |
| A2 | `#ffffff` chip background (distinct from `.queue-strip`'s `#f1f3f5`) is an acceptable default styling choice | Code Examples (CSS) | Low — CONTEXT.md explicitly leaves exact chip styling to Claude's discretion; any choice within the existing palette is valid, this is just one option |

**If this table is empty:** N/A — two low-risk discretionary items logged above; both are explicitly delegated to Claude's discretion in CONTEXT.md, not decisions requiring user confirmation.

## Open Questions

1. **Should `Ticket.id` and `Ticket.number` really be two fields when they hold the same value in v1?**
   - What we know: QUEUE-01/QUEUE-02 only require a displayed number and an ordered list; nothing in v1 requires `id` to diverge from `number`.
   - What's unclear: Whether the added field is worth the minor verbosity for a feature (OPS-01 recall) that is explicitly deferred to v2 and may never ship.
   - Recommendation: Keep both fields — the cost is negligible (one extra property) and it removes any future ambiguity about whether `key={ticket.number}` is safe to reuse after a hypothetical future renumbering feature. Low-stakes either way; planner may collapse to a single field if preferring minimalism.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None installed — no `vitest`/`jest`/test config detected in repo |
| Config file | none — see Wave 0 |
| Quick run command | n/a until Wave 0 installs a framework |
| Full suite command | n/a until Wave 0 installs a framework |

No test framework exists in this project as of Phase 2 research (confirmed via filesystem search — no `*.test.*`, `*.spec.*`, or `vitest.config.*` files, and no test-related devDependencies in `package.json`). CLAUDE.md's Recommended Stack table does not mention a test runner; STACK.md is silent on testing. This is a real gap, not an oversight to paper over.

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| QUEUE-01 | Clicking "Agregar turno" N times produces tickets numbered 1..N in order, counter independent of array length | unit (reducer logic) | `npx vitest run src/turnero.test.ts` (proposed) | ❌ Wave 0 |
| QUEUE-01 | Counter does not reset/collide after a hypothetical removal (forward-looking guard for Phase 4 regression) | unit (reducer logic, dispatch ADD_TICKET after simulated removal) | `npx vitest run src/turnero.test.ts` (proposed) | ❌ Wave 0 |
| QUEUE-02 | Queue renders all waiting tickets in order; empty state shows placeholder text | component/manual | `npx vitest run src/App.test.tsx` (proposed) or manual browser check | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** manual `npm run dev` browser check (click button N times, confirm sequential "Turno N" chips appear) — no automated quick-run exists yet
- **Per wave merge:** `npm run build` (typecheck via `tsc -b` + production build) as a baseline smoke test
- **Phase gate:** Full suite green before `/gsd:verify-work` — currently no full suite exists; manual verification substitutes until a framework is installed

### Wave 0 Gaps

- [ ] Test framework install: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom` — none of these are currently installed; this is a meaningful Wave 0 task, not a one-liner, since it requires Vite config changes (`vite.config.ts` test block or separate `vitest.config.ts`)
- [ ] `vitest.config.ts` or `vite.config.ts` `test` block — none exists
- [ ] `src/turnero.test.ts` — unit tests for the reducer (counter independence, sequential numbering)
- [ ] `src/setupTests.ts` (if using `@testing-library/jest-dom` matchers) — none exists

**Recommendation:** Given this is explicitly "a learning exercise to practice the full GSD phase lifecycle" (per CLAUDE.md) and no test framework was scaffolded in Phase 1, the planner should decide explicitly whether Phase 2 is the right place to introduce a test framework (real but front-loaded cost) or whether manual browser verification is acceptable for this phase, deferring automated testing to a later phase or never at all if out of scope. This is a planning decision, not something this research should silently assume — flagging here rather than picking a default.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Explicitly out of scope per CLAUDE.md/REQUIREMENTS.md — no auth in this app |
| V3 Session Management | No | No sessions; no backend |
| V4 Access Control | No | No roles/permissions; any user can operate any control (intentional, per PROJECT.md) |
| V5 Input Validation | No | "Agregar turno" takes no user-supplied data — it's a parameterless button click; there is no free-text or numeric input to validate in this phase |
| V6 Cryptography | No | No secrets, no crypto in this phase |

No ASVS category meaningfully applies to Phase 2 — the feature involves no user input, no authentication boundary, and no data leaving the browser tab. This is a deliberately low-risk client-only UI phase.

### Known Threat Patterns for this stack

None identified as applicable. The only "input" in this phase is a button click with no parameters; there's no injectable surface (no string concatenation into HTML, no `dangerouslySetInnerHTML`, no user-typed text rendered anywhere). PRIVACY-01 (no patient names/identifying data shown) is satisfied by construction — tickets only ever display the integer-derived "Turno N" string, never any user-entered text, since this phase introduces no text input fields at all.

## Sources

### Primary (HIGH confidence)
- react.dev/reference/react/useReducer — useReducer hook reference, discriminated union action pattern
- react.dev/reference/react/StrictMode — double-invocation behavior for state initializers in development
- react.dev/learn/typescript — TypeScript + React hooks typing conventions
- react.dev/learn/conditional-rendering — empty-state vs. list conditional rendering pattern
- npm registry (`npm view react version`, `npm view typescript version`) — confirmed installed versions match `package.json` (react 19.2.7, typescript 6.0.3)

### Secondary (MEDIUM confidence)
- WebSearch cross-referencing dev.to, benmvp.com, tasoskakour.com, freecodecamp.org — convergent consensus on useReducer + discriminated union TypeScript pattern, all consistent with react.dev's own guidance
- github.com/facebook/react/issues/20090, /issues/15074 — community-documented StrictMode double-invocation behavior, consistent with official react.dev StrictMode docs

### Tertiary (LOW confidence)
- None used as load-bearing claims in this document

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zero new dependencies, both `react` and `typescript` versions confirmed live against npm registry and matched against the actual `package.json` in this repo
- Architecture: HIGH — `useReducer` + discriminated union is official, current React guidance (react.dev), directly verified against this phase's specific atomicity requirement (QUEUE-01)
- Pitfalls: HIGH for the counter-derivation pitfall (directly required by QUEUE-01's explicit wording); MEDIUM for StrictMode double-invocation (well-documented but not yet directly triggered by this phase's code, since `initialState` is a plain object, not a lazy initializer)
- Testing: LOW/flagged — no test framework exists in the repo; this is an open gap surfaced for the planner to decide on, not resolved by this research

**Research date:** 2026-06-22
**Valid until:** 30 days (stable domain — React 19 hooks API and TypeScript discriminated unions are not fast-moving; re-verify if React or TypeScript majors bump before planning resumes)
