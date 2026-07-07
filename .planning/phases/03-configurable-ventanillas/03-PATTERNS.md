# Phase 3: Configurable Ventanillas - Pattern Map

**Mapped:** 2026-07-06
**Files analyzed:** 5 (4 modified, 1 created)
**Analogs found:** 5 / 5

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/turnero.ts` | model/state | CRUD | `src/turnero.ts` (self — extend) | exact |
| `src/App.tsx` | component | event-driven | `src/App.tsx` (self — extend) | exact |
| `src/index.css` | config/styles | N/A | `src/index.css` (self — extend) | exact |
| `src/turnero.test.ts` | test | CRUD | `src/turnero.test.ts` (self — extend) | exact |
| `src/App.test.tsx` | test | event-driven | `src/turnero.test.ts` | role-match |

---

## Pattern Assignments

### `src/turnero.ts` (model/state, CRUD)

**Analog:** `src/turnero.ts` — self-extension. Mirror the `Ticket` / `ADD_TICKET` pattern exactly for `Ventanilla` / `ADD_WINDOW`.

**Current type definitions** (lines 1–16):
```typescript
export type Ticket = {
  id: number
  number: number
}

export type QueueState = {
  queue: Ticket[]
  nextNumber: number
}
```

**Pattern to copy — extend `QueueState` the same way `Ticket` extends to `QueueState`:**
```typescript
// Add after Ticket type:
export type Ventanilla = {
  id: number            // stable React key + Phase 4 CALL_NEXT reference
  number: number        // display value — "Ventanilla 1", "Ventanilla 2", etc.
  currentTicket: Ticket | null  // null = "sin turno"; Phase 4 sets via CALL_NEXT
}

// Replace QueueState with:
export type QueueState = {
  queue: Ticket[]
  nextNumber: number
  ventanillas: Ventanilla[]
  nextWindowNumber: number    // ever-incrementing, never reset after removal (D-10)
}
```

**Current action union** (lines 20–22):
```typescript
export type QueueAction =
  | { type: 'ADD_TICKET' }
```

**Pattern to copy — extend action union:**
```typescript
export type QueueAction =
  | { type: 'ADD_TICKET' }
  | { type: 'ADD_WINDOW' }
  | { type: 'REMOVE_WINDOW'; id: number }
```

**Current `initialState`** (lines 23–26):
```typescript
export const initialState: QueueState = {
  queue: [],
  nextNumber: 1,
}
```

**Pattern to copy — extend initialState:**
```typescript
export const initialState: QueueState = {
  queue: [],
  nextNumber: 1,
  ventanillas: [],
  nextWindowNumber: 1,
}
```

**Current `ADD_TICKET` reducer case** (lines 30–38) — CRITICAL FIX REQUIRED:
```typescript
case 'ADD_TICKET': {
  const ticket: Ticket = {
    id: state.nextNumber,
    number: state.nextNumber,
  }
  return {
    queue: [...state.queue, ticket],   // BUG: does not spread ...state
    nextNumber: state.nextNumber + 1,  // drops ventanillas + nextWindowNumber
  }
}
```

**Fixed pattern — must spread `...state` before listing changed fields:**
```typescript
case 'ADD_TICKET': {
  const ticket: Ticket = {
    id: state.nextNumber,
    number: state.nextNumber,
  }
  return {
    ...state,                          // spread first — preserves all other state fields
    queue: [...state.queue, ticket],
    nextNumber: state.nextNumber + 1,
  }
}
```

**New reducer cases to add — copy counter pattern from `ADD_TICKET`:**
```typescript
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
```

---

### `src/App.tsx` (component, event-driven)

**Analog:** `src/App.tsx` — self-extension. The queue section pattern (button above, conditional empty state, mapped list) is the direct template for the ventanillas section.

**Current imports** (line 1–2):
```typescript
import { useReducer } from 'react'
import { queueReducer, initialState } from './turnero'
```

**Pattern to copy — add `useState` for local warning state in `VentanillaCard`:**
```typescript
import { useReducer, useState } from 'react'
import { queueReducer, initialState } from './turnero'
import type { Ventanilla } from './turnero'
```

**Current queue section pattern** (lines 17–30) — template for ventanillas section:
```tsx
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
```

**Pattern to replace the placeholder `<section className="ventanillas-grid">` (lines 31–34):**
```tsx
// Replace:
<section className="ventanillas-grid">
  <h2>Ventanillas</h2>
  <p>Las ventanillas configuradas aparecerán aquí</p>
</section>

// With:
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

**`VentanillaCard` component — add above `function App()`:**

The WINDOW-02 guard lives here using local `useState` (not in the reducer). Pattern mirrors the "inline conditional" style already in the queue section.

```typescript
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

---

### `src/index.css` (config/styles, N/A)

**Analog:** `src/index.css` — self-extension. All new rules follow the established color/typography scale: `#1f2933` primary text, `#f1f3f5` secondary background, 16px body / 20px section heading.

**Existing combined selector to update** (lines 32–39) — CSS selector must change because `h2` moves out of `.ventanillas-grid`:
```css
/* BEFORE (existing — lines 32–39): */
.queue-strip h2,
.ventanillas-grid h2 {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.2;
  color: #1f2933;
  margin: 0 0 8px;
}

/* AFTER — replace .ventanillas-grid h2 with .ventanillas-section h2: */
.queue-strip h2,
.ventanillas-section h2 {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.2;
  color: #1f2933;
  margin: 0 0 8px;
}
```

**Existing combined `p` selector to update** (lines 41–47):
```css
/* BEFORE (existing — lines 41–47): */
.queue-strip p,
.ventanillas-grid p {
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  margin: 0;
}

/* AFTER — replace .ventanillas-grid p with .ventanillas-section p: */
.queue-strip p,
.ventanillas-section p {
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  margin: 0;
}
```

**Existing button pattern to copy** (lines 60–70) — `add-window-button` copies `add-ticket-button` exactly:
```css
.add-ticket-button {
  background: #f1f3f5;
  color: #1f2933;
  border: none;
  border-radius: 6px;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin: 0 0 24px;
}
```

**New rules to append after existing rules:**
```css
/* Wrapper section for the ventanillas area (heading + button + grid) */
.ventanillas-section {
  margin-top: 24px;
}

/* "Agregar ventanilla" button — mirrors add-ticket-button (D-07 consistency) */
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

/* Individual card — position:relative to anchor the absolute remove button */
.ventanilla-card {
  position: relative;
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

/* Inline warning for WINDOW-02 guard */
.ventanilla-warning {
  font-size: 13px;
  color: #c0392b;
  margin: 6px 0 0;
}

/* Empty grid placeholder — spans all columns */
.ventanillas-empty {
  font-size: 16px;
  font-weight: 400;
  color: #1f2933;
  margin: 0;
  grid-column: 1 / -1;
}
```

---

### `src/turnero.test.ts` (test, CRUD)

**Analog:** `src/turnero.test.ts` — self-extension. Mirror the existing `describe` / `it` / `expect` pattern exactly. Each describe block maps to one requirement ID.

**Current test structure pattern** (lines 1–23) — copy this structure for new window tests:
```typescript
import { queueReducer, initialState } from './turnero'

describe('QUEUE-01: Independent ticket counter', () => {
  it('QUEUE-01-A: first ADD_TICKET dispatch produces a ticket with number 1', () => {
    const state = queueReducer(initialState, { type: 'ADD_TICKET' })
    expect(state.queue[0].number).toBe(1)
  })
  // ...
})
```

**Sequential state chaining pattern** (lines 9–14) — mirror for WINDOW-01-B/C:
```typescript
it('QUEUE-01-B: ...', () => {
  let state = queueReducer(initialState, { type: 'ADD_TICKET' })
  state = queueReducer(state, { type: 'ADD_TICKET' })
  state = queueReducer(state, { type: 'ADD_TICKET' })
  expect(state.queue.map((t) => t.number)).toEqual([1, 2, 3])
})
```

**Manual state override pattern** (lines 16–22) — mirror for counter-independence tests:
```typescript
it('QUEUE-01-C: counter does not reset ...', () => {
  let state = queueReducer(initialState, { type: 'ADD_TICKET' })
  state = { ...state, queue: [] }   // manually zero the array to test counter independence
  state = queueReducer(state, { type: 'ADD_TICKET' })
  expect(state.queue[0].number).toBe(2)
})
```

**New test blocks to append** — follow exact same naming convention (`WINDOW-NN-X`):
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
    let state = queueReducer(initialState, { type: 'ADD_WINDOW' })   // Ventanilla 1
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

---

### `src/App.test.tsx` (test, event-driven) — NEW FILE

**Analog:** `src/turnero.test.ts` — closest existing test. Different role (integration vs unit) but same framework (Vitest globals, `describe`/`it`/`expect`). The component tests require React Testing Library which is not yet in the project.

**No analog in codebase for component integration tests.** Use RESEARCH.md patterns + Vitest jsdom environment already configured in `vite.config.ts`.

**Framework setup — `vite.config.ts` already has:**
```typescript
test: { environment: 'jsdom', setupFiles: './src/setupTests.ts', globals: true }
```

**Required pattern — React Testing Library render + userEvent:**
```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('WINDOW-02: Remove guard warning in UI', () => {
  it('WINDOW-02-B: shows inline warning when removing a ventanilla with active ticket', async () => {
    // ...
  })
})

describe('WINDOW-03: Display sin turno / Turno N', () => {
  it('WINDOW-03-B: shows "sin turno" for new ventanilla', async () => {
    // ...
  })
})
```

**Note:** `@testing-library/react` and `@testing-library/user-event` must be added as devDependencies if not already present. Check `package.json` before creating this file.

---

## Shared Patterns

### Counter Pattern (ever-incrementing, never derived from array length)
**Source:** `src/turnero.ts` lines 30–39 — `ADD_TICKET` case
**Apply to:** `ADD_WINDOW` reducer case in `src/turnero.ts`
```typescript
// CORRECT: independent counter
return {
  ...state,
  ventanillas: [...state.ventanillas, ventanilla],
  nextWindowNumber: state.nextWindowNumber + 1,
}
// WRONG: never do this
return {
  ...state,
  ventanillas: [...state.ventanillas, ventanilla],
  nextWindowNumber: state.ventanillas.length + 1,  // reuses numbers after removal
}
```

### State Spread Pattern
**Source:** `src/turnero.ts` lines 35–38 — CRITICAL: existing `ADD_TICKET` case does NOT spread `...state` (bug)
**Apply to:** ALL reducer cases in `src/turnero.ts` once `QueueState` gains more than 2 fields
**Rule:** Every reducer `return` must start with `...state` before overriding specific fields. Omitting it silently drops new fields.

### Action-Before-Result Layout
**Source:** `src/App.tsx` lines 10–30 — `add-ticket-button` appears before `queue-strip` section
**Apply to:** "Agregar ventanilla" button must appear above the `.ventanillas-grid` div, inside `.ventanillas-section`

### Empty State Conditional
**Source:** `src/App.tsx` lines 19–29 — inline ternary with `length === 0` check
**Apply to:** `state.ventanillas.length === 0` check in the ventanillas grid renders `<p className="ventanillas-empty">`

### Color / Typography Scale
**Source:** `src/index.css` — established values used throughout
**Apply to:** All new CSS rules in `src/index.css`
- Primary text: `#1f2933`
- Secondary background: `#f1f3f5`
- Body font-size: `16px`, font-weight: `400`
- Section heading: `20px`, font-weight: `600`
- Card interior heading: `16px`, font-weight: `600` (one level down from section h2)

### Local `useState` for Transient UI State
**Source:** Pattern established in RESEARCH.md — the WINDOW-02 guard is UI-only, not reducer state
**Apply to:** `showWarning` in `VentanillaCard` component
**Rule:** `useState(false)` in the component; never model warning visibility in the reducer.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/App.test.tsx` | test | event-driven | No component integration tests exist in the codebase yet; closest analog is `src/turnero.test.ts` (unit tests only). React Testing Library pattern must come from RESEARCH.md. |

---

## Critical Fixes Embedded in Phase 3

These are not new features but bugs in existing code that MUST be fixed as part of this phase:

1. **`ADD_TICKET` spread fix** (`src/turnero.ts` line 35–38): Change `return { queue: [...], nextNumber: ... }` to `return { ...state, queue: [...], nextNumber: ... }`. Without this fix, calling `ADD_TICKET` after any `ADD_WINDOW` silently drops `ventanillas` from state.

2. **CSS selector update** (`src/index.css` lines 32–47): Replace `.ventanillas-grid h2` with `.ventanillas-section h2` and `.ventanillas-grid p` with `.ventanillas-section p`. Without this, the section heading loses its `20px 600` style after the DOM restructuring.

---

## Metadata

**Analog search scope:** `src/` directory (all source files)
**Files scanned:** 4 (`src/turnero.ts`, `src/App.tsx`, `src/index.css`, `src/turnero.test.ts`)
**Pattern extraction date:** 2026-07-06
