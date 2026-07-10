# Phase 3: Configurable Ventanillas - Research

**Researched:** 2026-07-06
**Domain:** React + TypeScript state shape extension — adding configurable call windows to an existing useReducer-based SPA
**Confidence:** HIGH (all findings grounded in existing codebase + locked decisions from CONTEXT.md)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-08:** Each ventanilla card shows two things only: (1) a label heading ("Ventanilla 1") and (2) the current-ticket state below it ("sin turno" when no ticket ever called, "Turno 5" once called). No "Llamar siguiente" button in this phase. Uses existing `.ventanillas-grid > *` card container with `#f1f3f5` background.
- **D-09:** The "no ticket yet" state for a ventanilla displays "sin turno" — matching SC-4 and REQUIREMENTS.md WINDOW-03 spec literally. Covers both first-load and post-removal states.
- **D-10:** Windows use an ever-incrementing counter that never reuses a number, even after removal — same invariant as the ticket counter (`nextNumber`). "Ventanilla 1", "Ventanilla 2", etc. If Ventanilla 1 is removed and a new one added, it becomes "Ventanilla 3".

### Claude's Discretion

- **Add/remove control placement** — "Agregar ventanilla" button above the grid (consistent with D-07 action-before-result pattern). Per-card remove button inside each card (small "×" in card corner). Both in single global CSS file (D-02).
- **Removal warning form** — Inline text warning rendered below the remove button when WINDOW-02 guard triggers. No `alert()` or `window.confirm()`. Warning must be visible without disrupting other cards.
- **State shape extension** — `Ventanilla` type and `ADD_WINDOW` / `REMOVE_WINDOW` actions added to `src/turnero.ts`, extending `QueueState` with a `ventanillas: Ventanilla[]` array and a `nextWindowNumber` counter.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope. No call action, sound, animation, or persistence in this phase.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| WINDOW-01 | User can dynamically add call windows | ADD_WINDOW reducer action + "Agregar ventanilla" button above grid |
| WINDOW-02 | User can remove a window unless it has an active current ticket (app must block/warn) | UI-level guard: check `currentTicket !== null` before dispatching; show inline warning if blocked |
| WINDOW-03 | Each window shows its current ticket or empty state ("sin turno") if none called | `currentTicket: Ticket \| null` in `Ventanilla` type; null → "sin turno", Ticket → "Turno N" |
</phase_requirements>

---

## Summary

Phase 3 extends the existing `useReducer`-based state in `src/turnero.ts` with a `Ventanilla` type, a `ventanillas` array, and a `nextWindowNumber` counter — all following the same ever-incrementing counter pattern already established by `nextNumber` for tickets. The reducer gains `ADD_WINDOW` and `REMOVE_WINDOW` cases. `App.tsx` replaces the placeholder `<section className="ventanillas-grid">` with a real rendered list of ventanilla cards plus an "Agregar ventanilla" button above the grid. Each card renders the window label and its `currentTicket` state. No new runtime dependencies are needed — this is pure TypeScript + React + CSS work.

The one naming pitfall to avoid: the CONTEXT.md notes use "Window" as the type name, but `Window` is a reserved TypeScript global (the browser window object). The type must be named `Ventanilla` (consistent with the architecture research and the domain language throughout the codebase).

The REMOVE guard (WINDOW-02) lives in the UI, not the reducer. The component checks `currentTicket !== null` before dispatching `REMOVE_WINDOW`; if blocked, it shows an inline warning using local `useState`. This keeps the reducer a pure function and avoids the "silently ignored action" anti-pattern.

**Primary recommendation:** Extend `QueueState` in `src/turnero.ts` → update `App.tsx` to render a `VentanillaCard` component for each window → add card-interior and remove-button styles to `src/index.css` → add WINDOW-01/02/03 reducer tests to `src/turnero.test.ts`.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Window state (add/remove, current ticket) | State layer — `src/turnero.ts` reducer | — | Business rule (never-reuse counter, atomic state change) belongs in the reducer, not components |
| WINDOW-02 guard + inline warning | UI layer — `VentanillaCard` component (local `useState`) | — | Warning is a transient UI concern, not a persistent state concern; reducer should not model "warning is showing" |
| Rendering window cards | UI layer — `VentanillaCard` component | `App.tsx` (maps `state.ventanillas`) | Presentational; receives `ventanilla` object as prop, no logic |
| Layout (grid + button above) | CSS — `src/index.css` + `App.tsx` structure | — | D-02 mandates single global CSS file; layout is not stateful |

---

## Standard Stack

### Core (no new packages — all work done in existing stack)

| Library | Version | Purpose | Already in Use |
|---------|---------|---------|---------------|
| React | ^19.2.6 | `useState` for local warning state in `VentanillaCard` | Yes — `package.json` |
| TypeScript | ~6.0.2 | Type-safe `Ventanilla` type, discriminated union action | Yes — `package.json` |
| Vite + Vitest | ^8.0.12 / ^4.1.10 | Build + test runner | Yes — `package.json` |

No new runtime dependencies. No package legitimacy audit required.

---

## Package Legitimacy Audit

No packages to install in this phase. All work is within the existing React + TypeScript + Vite stack.

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

---

## Architecture Patterns

### System Architecture Diagram

```
User clicks "Agregar ventanilla"
        ↓
dispatch({ type: 'ADD_WINDOW' })
        ↓
queueReducer:
  ventanilla = { id: nextWindowNumber, number: nextWindowNumber, currentTicket: null }
  ventanillas = [...state.ventanillas, ventanilla]
  nextWindowNumber = state.nextWindowNumber + 1
        ↓
React re-renders App → maps state.ventanillas → renders VentanillaCard × N
        ↓
Each VentanillaCard:
  currentTicket === null  →  shows "sin turno"
  currentTicket !== null  →  shows "Turno N"    (Phase 4 sets this)

User clicks "×" on a card:
        ↓
VentanillaCard checks: ventanilla.currentTicket !== null?
  YES → setShowWarning(true), no dispatch
  NO  → dispatch({ type: 'REMOVE_WINDOW', id: ventanilla.id })
```

### Recommended Project Structure (Phase 3 changes)

```
src/
├── turnero.ts          # MODIFY: add Ventanilla type, extend QueueState, add ADD_WINDOW / REMOVE_WINDOW
├── turnero.test.ts     # MODIFY: add WINDOW-01/02/03 reducer tests
├── App.tsx             # MODIFY: replace placeholder section with real grid + "Agregar ventanilla" button
├── index.css           # MODIFY: add card-interior styles, remove button styles, warning text styles
└── (no new files needed for this phase scope)
```

### Pattern 1: Type Name — Use `Ventanilla`, Not `Window`

**What:** The CONTEXT.md refers to "Window type" and "windows array" in the technical description, but `Window` is a TypeScript global (the browser `window` object type). Using it as a custom type name causes a shadowing conflict.

**Rule:** Name the type `Ventanilla`, the array key `ventanillas`, and keep `nextWindowNumber` as the counter name. This is already the convention in `ARCHITECTURE.md` and aligns with the domain language throughout the codebase.

```typescript
// src/turnero.ts — CORRECT
export type Ventanilla = {
  id: number            // stable React key + CALL_NEXT reference in Phase 4
  number: number        // display value — "Ventanilla 1", "Ventanilla 2", etc.
  currentTicket: Ticket | null  // null = "sin turno"; Phase 4 sets this via CALL_NEXT
}

export type QueueState = {
  queue: Ticket[]
  nextNumber: number
  ventanillas: Ventanilla[]
  nextWindowNumber: number    // ever-incrementing, never reset after removal (D-10)
}

export const initialState: QueueState = {
  queue: [],
  nextNumber: 1,
  ventanillas: [],
  nextWindowNumber: 1,
}
```

### Pattern 2: ADD_WINDOW Reducer Case

Mirrors the `ADD_TICKET` pattern exactly — independent counter, never derives from array length.

```typescript
// src/turnero.ts
case 'ADD_WINDOW': {
  const ventanilla: Ventanilla = {
    id: state.nextWindowNumber,
    number: state.nextWindowNumber,
    currentTicket: null,
  }
  return {
    ...state,
    ventanillas: [...state.ventanillas, ventanilla],
    nextWindowNumber: state.nextWindowNumber + 1,
  }
}
```

### Pattern 3: REMOVE_WINDOW Reducer Case (guard enforced in UI, not reducer)

The reducer removes unconditionally. The UI guard is described in Pattern 4.

```typescript
// src/turnero.ts
case 'REMOVE_WINDOW': {
  return {
    ...state,
    ventanillas: state.ventanillas.filter((v) => v.id !== action.id),
  }
}

// Action type addition:
export type QueueAction =
  | { type: 'ADD_TICKET' }
  | { type: 'ADD_WINDOW' }
  | { type: 'REMOVE_WINDOW'; id: number }
```

### Pattern 4: WINDOW-02 Guard in VentanillaCard (UI-level, local useState)

The guard is a UI concern — it controls whether a warning message is shown. It does not belong in the reducer (which should be a pure data function).

```typescript
// VentanillaCard inside App.tsx (or extracted as a component)
function VentanillaCard({
  ventanilla,
  onRemove,
}: {
  ventanilla: Ventanilla
  onRemove: (id: number) => void
}) {
  const [showWarning, setShowWarning] = useState(false)

  function handleRemove() {
    if (ventanilla.currentTicket !== null) {
      setShowWarning(true)
      return
    }
    setShowWarning(false)
    onRemove(ventanilla.id)
  }

  return (
    <div className="ventanilla-card">
      <button
        type="button"
        className="ventanilla-remove"
        onClick={handleRemove}
        aria-label={`Quitar ventanilla ${ventanilla.number}`}
      >
        ×
      </button>
      <h3 className="ventanilla-label">Ventanilla {ventanilla.number}</h3>
      <p className="ventanilla-ticket">
        {ventanilla.currentTicket === null
          ? 'sin turno'
          : `Turno ${ventanilla.currentTicket.number}`}
      </p>
      {showWarning && (
        <p className="ventanilla-warning">
          No se puede quitar: tiene un turno activo
        </p>
      )}
    </div>
  )
}
```

### Pattern 5: App.tsx Layout Restructuring

The current placeholder `<section className="ventanillas-grid">` contains an `h2` and a `p` — those become grid items because the section IS the grid. Phase 3 separates the grid from its header + controls.

```tsx
// App.tsx — new structure (replaces the placeholder section)
<section className="ventanillas-section">
  <h2>Ventanillas</h2>
  <button
    type="button"
    className="add-window-button"
    onClick={() => dispatch({ type: 'ADD_WINDOW' })}
  >
    Agregar ventanilla
  </button>
  <div className="ventanillas-grid">
    {state.ventanillas.length === 0 ? (
      <p className="ventanillas-empty">
        Presiona Agregar ventanilla para comenzar
      </p>
    ) : (
      state.ventanillas.map((v) => (
        <VentanillaCard
          key={v.id}
          ventanilla={v}
          onRemove={(id) => dispatch({ type: 'REMOVE_WINDOW', id })}
        />
      ))
    )}
  </div>
</section>
```

**CSS impact:** The existing `.ventanillas-grid h2` selector targets an `h2` inside the grid container. In the new structure, the `h2` is inside `.ventanillas-section`, not `.ventanillas-grid`. The CSS selector must be updated: replace `.ventanillas-grid h2` with `.ventanillas-section h2`. Similarly replace `.ventanillas-grid p` with `.ventanillas-section p` for the empty state.

### Anti-Patterns to Avoid

- **Naming the type `Window`:** Shadows the TypeScript global `Window` type. Use `Ventanilla` instead.
- **Deriving `nextWindowNumber` from `ventanillas.length`:** Violates D-10 (ever-incrementing, never reuses numbers). Must be an independent counter just like `nextNumber`.
- **Putting the WINDOW-02 guard in the reducer as a silent no-op:** The reducer silently ignoring `REMOVE_WINDOW` when `currentTicket !== null` leaves the UI with no way to distinguish "blocked" from "dispatched." Keep the guard in the UI component.
- **Putting `<h2>Ventanillas</h2>` inside `.ventanillas-grid`:** The heading becomes a grid item and the existing CSS selector breaks. Keep the heading in the wrapper section.
- **Using `window.confirm()` or `alert()` for the WINDOW-02 warning:** CONTEXT.md explicitly prohibits this. Use inline rendered text.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| Ever-incrementing counter | Custom ID generation scheme | Same `nextNumber` pattern already in `turnero.ts` — mirror exactly |
| Conditional rendering of "sin turno" vs "Turno N" | Complex conditional logic | `currentTicket === null ? 'sin turno' : \`Turno ${currentTicket.number}\`` — two branches, no abstraction needed |
| Warning dismissal | Timeout-based auto-dismiss | Keep `showWarning` as local `useState`; it auto-dismisses when the card is re-rendered after the ticket is consumed (Phase 4) or the user navigates away |

**Key insight:** All the complexity in this phase is in the state shape extension and CSS restructuring — not in novel algorithms. Follow existing patterns.

---

## Common Pitfalls

### Pitfall 1: `Window` Type Name Conflict
**What goes wrong:** TypeScript shows no error at declaration, but usage like `const w: Window = ...` will conflict with the global `Window` type in files that also reference DOM APIs.
**Why it happens:** TypeScript's lib includes `interface Window` for the browser global object. Declaring `export type Window = ...` in the same scope shadows it.
**How to avoid:** Always use `Ventanilla` as the type name. No renaming needed from prior phases.
**Warning signs:** TypeScript IntelliSense showing `Window` type with unexpected properties like `document`, `navigator`, etc.

### Pitfall 2: Stale CSS Selectors After Grid Restructuring
**What goes wrong:** Heading and paragraph text lose their styles (font-size, color) because `.ventanillas-grid h2` no longer matches after the `h2` moves to `.ventanillas-section`.
**Why it happens:** The existing CSS assumes `h2` and `p` live inside `.ventanillas-grid`. The restructuring moves them to a wrapper element.
**How to avoid:** Update the CSS rule: replace `.ventanillas-grid h2` → `.ventanillas-section h2` and `.ventanillas-grid p` → `.ventanillas-section p`. Check both in `src/index.css`.
**Warning signs:** Section heading renders at browser-default h2 size instead of `20px 600`.

### Pitfall 3: `nextWindowNumber` Derived from `ventanillas.length`
**What goes wrong:** After removing "Ventanilla 2" (leaving only "Ventanilla 1"), adding a new window reuses number 2 instead of assigning 3.
**Why it happens:** Deriving the next number from `ventanillas.length` resets to the current count, violating D-10.
**How to avoid:** `nextWindowNumber` is an independent counter that only ever increments, never decrements — identical to `nextNumber`.
**Warning signs:** After any removal, the next added window gets a number that was previously assigned.

### Pitfall 4: Warning State Persisting Across Card Lifecycle
**What goes wrong:** `showWarning` stays `true` in the removed card's component even after the ticket is consumed in Phase 4, creating stale UI.
**Why it happens:** `showWarning` is local `useState` in the component instance; it doesn't reset when `ventanilla.currentTicket` changes.
**How to avoid:** Not a problem in Phase 3 (Phase 4 doesn't exist yet). But the design is correct: once `currentTicket` becomes `null` (Phase 4 removes it from the window), the condition `ventanilla.currentTicket !== null` is false, so `handleRemove` will dispatch normally on the next click. No special reset needed.
**Warning signs:** N/A in Phase 3 scope.

---

## Code Examples

### Extending `QueueState` and `queueReducer`

```typescript
// src/turnero.ts — full extended file
export type Ticket = {
  id: number
  number: number
}

export type Ventanilla = {
  id: number
  number: number
  currentTicket: Ticket | null
}

export type QueueState = {
  queue: Ticket[]
  nextNumber: number
  ventanillas: Ventanilla[]
  nextWindowNumber: number
}

export type QueueAction =
  | { type: 'ADD_TICKET' }
  | { type: 'ADD_WINDOW' }
  | { type: 'REMOVE_WINDOW'; id: number }

export const initialState: QueueState = {
  queue: [],
  nextNumber: 1,
  ventanillas: [],
  nextWindowNumber: 1,
}

export function queueReducer(state: QueueState, action: QueueAction): QueueState {
  switch (action.type) {
    case 'ADD_TICKET': {
      const ticket: Ticket = {
        id: state.nextNumber,
        number: state.nextNumber,
      }
      return {
        ...state,
        queue: [...state.queue, ticket],
        nextNumber: state.nextNumber + 1,
      }
    }
    case 'ADD_WINDOW': {
      const ventanilla: Ventanilla = {
        id: state.nextWindowNumber,
        number: state.nextWindowNumber,
        currentTicket: null,
      }
      return {
        ...state,
        ventanillas: [...state.ventanillas, ventanilla],
        nextWindowNumber: state.nextWindowNumber + 1,
      }
    }
    case 'REMOVE_WINDOW': {
      return {
        ...state,
        ventanillas: state.ventanillas.filter((v) => v.id !== action.id),
      }
    }
    default:
      return state
  }
}
```

Note: the existing `ADD_TICKET` case must be updated to spread `...state` instead of listing only `queue` and `nextNumber` — otherwise adding a window and then a ticket will silently drop `ventanillas` from state. This is a critical correctness fix in the same task.

### CSS Additions to `src/index.css`

```css
/* Wrapper for the ventanillas area (replaces .ventanillas-grid as the section container) */
.ventanillas-section {
  margin-top: 24px;
}

/* Reuse queue-strip style for consistent section heading */
.ventanillas-section h2 {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.2;
  color: #1f2933;
  margin: 0 0 8px;
}

/* "Agregar ventanilla" button — same style as add-ticket-button (D-07 consistency) */
.add-window-button {
  background: #f1f3f5;
  color: #1f2933;
  border: none;
  border-radius: 6px;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin: 0 0 16px;
}

/* The grid itself — no h2 or p inside, only .ventanilla-card children */
/* (existing .ventanillas-grid rule remains; .ventanillas-grid > * background stays) */

/* Individual card interior */
.ventanilla-card {
  position: relative;    /* for absolutely-positioned remove button */
}

.ventanilla-label {
  font-size: 16px;
  font-weight: 600;
  color: #1f2933;
  margin: 0 0 4px;
}

.ventanilla-ticket {
  font-size: 16px;
  font-weight: 400;
  color: #1f2933;
  margin: 0;
}

/* Remove button — small × in top-right corner of card */
.ventanilla-remove {
  position: absolute;
  top: 8px;
  right: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 18px;
  color: #6b7c93;
  line-height: 1;
  padding: 0;
}

.ventanilla-remove:hover {
  color: #1f2933;
}

/* Inline warning text for WINDOW-02 guard */
.ventanilla-warning {
  font-size: 13px;
  color: #c0392b;
  margin: 6px 0 0;
}

/* Empty grid placeholder */
.ventanillas-empty {
  font-size: 16px;
  font-weight: 400;
  color: #1f2933;
  margin: 0;
  grid-column: 1 / -1;   /* span all columns so it reads as a single line, not a grid cell */
}
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Single-field `ADD_TICKET` return (only listing `queue` and `nextNumber`) | Spread `...state` before new fields | Required change: once `QueueState` has more than 2 fields, the old return style silently drops new fields |
| Placeholder `<section className="ventanillas-grid">` with h2 + p as grid items | Wrapper `.ventanillas-section` containing a heading, button, and a separate `.ventanillas-grid` div | Correct separation of heading/controls from grid layout |

**Critical fix identified:** The existing `ADD_TICKET` reducer case returns `{ queue: [...], nextNumber: ... }` — it does NOT spread `...state`. Once `QueueState` gains `ventanillas` and `nextWindowNumber`, calling `ADD_TICKET` will silently drop those fields. The `ADD_TICKET` case MUST be updated to `{ ...state, queue: [...], nextNumber: ... }` in the same task that extends `QueueState`.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.10 |
| Config file | `vite.config.ts` (`test: { environment: 'jsdom', setupFiles: './src/setupTests.ts', globals: true }`) |
| Quick run command | `npx vitest run src/turnero.test.ts` |
| Full suite command | `npx vitest run` |

Note: `package.json` has no `test` script. Add `"test": "vitest run"` to `scripts` in Wave 0 (or use `npx vitest run` directly).

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| WINDOW-01 | ADD_WINDOW adds a ventanilla with correct number | unit (reducer) | `npx vitest run src/turnero.test.ts` | ✅ (extend existing) |
| WINDOW-01 | nextWindowNumber increments and never reuses after removal | unit (reducer) | `npx vitest run src/turnero.test.ts` | ✅ (extend existing) |
| WINDOW-02 | REMOVE_WINDOW removes a ventanilla when currentTicket is null | unit (reducer) | `npx vitest run src/turnero.test.ts` | ✅ (extend existing) |
| WINDOW-02 | Guard: VentanillaCard shows warning when currentTicket !== null | integration (component) | `npx vitest run src/App.test.tsx` | ❌ Wave 0 |
| WINDOW-03 | Initial currentTicket is null | unit (reducer) | `npx vitest run src/turnero.test.ts` | ✅ (extend existing) |
| WINDOW-03 | Display: null → "sin turno", Ticket → "Turno N" | integration (component) | `npx vitest run src/App.test.tsx` | ❌ Wave 0 |

### Reducer Unit Tests to Add to `src/turnero.test.ts`

```typescript
describe('WINDOW-01: Add windows', () => {
  it('WINDOW-01-A: ADD_WINDOW adds a ventanilla with number 1 to empty state', () => {
    const state = queueReducer(initialState, { type: 'ADD_WINDOW' })
    expect(state.ventanillas).toHaveLength(1)
    expect(state.ventanillas[0].number).toBe(1)
  })

  it('WINDOW-01-B: nextWindowNumber increments with each ADD_WINDOW', () => {
    let state = queueReducer(initialState, { type: 'ADD_WINDOW' })
    state = queueReducer(state, { type: 'ADD_WINDOW' })
    expect(state.ventanillas[0].number).toBe(1)
    expect(state.ventanillas[1].number).toBe(2)
  })

  it('WINDOW-01-C: counter never reuses a number after removal (D-10)', () => {
    let state = queueReducer(initialState, { type: 'ADD_WINDOW' })  // Ventanilla 1
    state = queueReducer(state, { type: 'ADD_WINDOW' })              // Ventanilla 2
    state = queueReducer(state, { type: 'REMOVE_WINDOW', id: 1 })   // remove Ventanilla 1
    state = queueReducer(state, { type: 'ADD_WINDOW' })              // should be Ventanilla 3
    expect(state.ventanillas.map(v => v.number)).toContain(3)
    expect(state.ventanillas.map(v => v.number)).not.toContain(1)
  })
})

describe('WINDOW-02: Remove with guard', () => {
  it('WINDOW-02-A: REMOVE_WINDOW removes the ventanilla when currentTicket is null', () => {
    let state = queueReducer(initialState, { type: 'ADD_WINDOW' })
    state = queueReducer(state, { type: 'REMOVE_WINDOW', id: 1 })
    expect(state.ventanillas).toHaveLength(0)
  })
})

describe('WINDOW-03: Per-window current ticket display', () => {
  it('WINDOW-03-A: new ventanilla has currentTicket = null', () => {
    const state = queueReducer(initialState, { type: 'ADD_WINDOW' })
    expect(state.ventanillas[0].currentTicket).toBeNull()
  })
})
```

### Sampling Rate

- **Per task commit:** `npx vitest run src/turnero.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/App.test.tsx` — covers WINDOW-02 warning behavior and WINDOW-03 display logic (component-level integration tests)
- [ ] Add `"test": "vitest run"` to `package.json` scripts (currently absent)

---

## Environment Availability

Step 2.6: No new external dependencies introduced by Phase 3. All tooling (Node.js, npm, Vite, Vitest) was verified operational in prior phases.

---

## Open Questions

1. **Empty grid placeholder text**
   - What we know: CONTEXT.md specifies "sin turno" as the per-card empty state (D-09) but is silent on the grid-level empty state (zero windows configured).
   - What's unclear: Whether to show the existing placeholder "Las ventanillas configuradas aparecerán aquí" or a new prompt.
   - Recommendation: Use "Presiona Agregar ventanilla para comenzar" — more actionable, consistent with the button label. This is Claude's discretion.

2. **Warning dismissal UX**
   - What we know: `showWarning` is local `useState`; it shows until the user resolves the condition (Phase 4 clears the ticket) or navigates away.
   - What's unclear: Whether the warning should auto-hide after a few seconds.
   - Recommendation: Leave it visible until next interaction with the card (Phase 3 scope only). Auto-dismiss is a Phase 6 (animation/feedback) concern.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The `ADD_TICKET` case must be updated to spread `...state` once `QueueState` gains new fields | State of the Art + Code Examples | If not fixed, calling ADD_TICKET after any window operation silently drops `ventanillas` from state — critical data loss |
| A2 | Naming the type `Ventanilla` (not `Window`) avoids TypeScript global shadowing | Architecture Patterns Pitfall 1 | If TypeScript version or config allows the shadowing without issue, the rename is still the better convention but not strictly required |

---

## Sources

### Primary (HIGH confidence)
- `src/turnero.ts` (codebase read) — exact current state shape and reducer pattern
- `src/App.tsx` (codebase read) — exact current component structure and placeholder to replace
- `src/index.css` (codebase read) — exact current CSS rules, confirmed `.ventanillas-grid h2` selector exists
- `src/turnero.test.ts` (codebase read) — confirmed Vitest globals pattern (`describe`/`it`/`expect`)
- `vite.config.ts` (codebase read) — confirmed Vitest jsdom environment config
- `.planning/phases/03-configurable-ventanillas/03-CONTEXT.md` — locked decisions D-08, D-09, D-10 and discretion areas
- `.planning/research/ARCHITECTURE.md` — confirmed `Ventanilla` naming convention throughout

### Secondary (MEDIUM confidence)
- `.planning/research/STACK.md` — confirmed no new runtime dependencies for this scope
- `.planning/REQUIREMENTS.md` — confirmed WINDOW-01, WINDOW-02, WINDOW-03 requirement text

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; existing stack verified from codebase
- Architecture: HIGH — all patterns extend existing verified code; no novel domain risk
- Pitfalls: HIGH — TypeScript `Window` naming conflict and `ADD_TICKET` spread bug are verified from code inspection, not assumed

**Research date:** 2026-07-06
**Valid until:** 2026-08-06 (stable; no external dependencies to rot)
