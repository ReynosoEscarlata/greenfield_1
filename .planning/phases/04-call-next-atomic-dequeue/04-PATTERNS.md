# Phase 4: Call Next (Atomic Dequeue) - Pattern Map

**Mapped:** 2026-07-07
**Files analyzed:** 5
**Analogs found:** 5 / 5

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/turnero.ts` | reducer / model | CRUD (dequeue) | `src/turnero.ts` REMOVE_WINDOW + ADD_TICKET cases (same file) | exact |
| `src/App.tsx` | component | request-response | `src/App.tsx` VentanillaCard + handleRemove (same file) | exact |
| `src/turnero.test.ts` | test (unit) | CRUD | `src/turnero.test.ts` WINDOW-02-A + QUEUE-01-C describe blocks | exact |
| `src/App.test.tsx` | test (integration) | request-response | `src/App.test.tsx` WINDOW-02 describe block | exact |
| `src/index.css` | style / config | — | `src/index.css` `.add-window-button` + `.ventanilla-warning` rules | exact |

---

## Pattern Assignments

### `src/turnero.ts` — CALL_NEXT case + WR-02 guard

**Analog:** Same file — REMOVE_WINDOW case (lines 76-83) and ADD_TICKET case (lines 49-61).

**Union extension point** (lines 34-38 — insert one line):
```typescript
// Phase 4 extension point: add { type: 'CALL_NEXT'; windowId: number } here.
export type QueueAction =
  | { type: 'ADD_TICKET' }
  | { type: 'ADD_WINDOW' }
  | { type: 'REMOVE_WINDOW'; id: number }
  // ADD HERE:
  | { type: 'CALL_NEXT'; windowId: number }
```

**Spread discipline pattern** (lines 57-61 — must replicate in CALL_NEXT):
```typescript
// CRITICAL: spread ...state first so all QueueState fields are preserved.
return {
  ...state,
  queue: [...state.queue, ticket],
  nextNumber: state.nextNumber + 1,
}
```

**REMOVE_WINDOW case to replace with WR-02 guard** (lines 76-83 — current unconditional code):
```typescript
case 'REMOVE_WINDOW': {
  // Removes unconditionally — the WINDOW-02 guard lives in VentanillaCard (UI layer).
  return {
    ...state,
    ventanillas: state.ventanillas.filter((v) => v.id !== action.id),
  }
}
```
Replace with (WR-02 fix — add `find` + guard before the filter return):
```typescript
case 'REMOVE_WINDOW': {
  const target = state.ventanillas.find((v) => v.id === action.id)
  if (target !== undefined && target.currentTicket !== null) {
    return state  // no-op: data-loss prevention (WR-02 fix)
  }
  return {
    ...state,
    ventanillas: state.ventanillas.filter((v) => v.id !== action.id),
  }
}
```

**CALL_NEXT case to add after REMOVE_WINDOW** (new case — copy spread + map pattern from ADD_WINDOW and ADD_TICKET):
```typescript
case 'CALL_NEXT': {
  if (state.queue.length === 0) return state  // no-op: UI handles feedback
  const [nextTicket, ...remainingQueue] = state.queue
  return {
    ...state,
    queue: remainingQueue,
    ventanillas: state.ventanillas.map((v) =>
      v.id === action.windowId
        ? { ...v, currentTicket: nextTicket }
        : v
    ),
  }
}
```

---

### `src/App.tsx` — VentanillaCard extended props + two useEffects + handleCallNext

**Analog:** Same file — current VentanillaCard function signature (lines 5-11), showWarning state (line 12), handleRemove function (lines 14-21), JSX structure (lines 23-46).

**Current props signature to extend** (lines 5-11):
```tsx
export function VentanillaCard({
  ventanilla,
  onRemove,
}: Readonly<{
  ventanilla: Ventanilla
  onRemove: (id: number) => void
}>) {
```
Extend to (keep `Readonly<{...}>` wrapper — SonarLint S6759):
```tsx
export function VentanillaCard({
  ventanilla,
  onRemove,
  onCallNext,
  isQueueEmpty,
}: Readonly<{
  ventanilla: Ventanilla
  onRemove: (id: number) => void
  onCallNext: (id: number) => void
  isQueueEmpty: boolean
}>) {
```

**Import pattern** (line 1 — add `useEffect`):
```tsx
import { useState, useReducer } from 'react'
// Extend to:
import { useState, useReducer, useEffect } from 'react'
```

**Existing local state pattern to mirror** (line 12):
```tsx
const [showWarning, setShowWarning] = useState(false)
// Add below:
const [showEmptyWarning, setShowEmptyWarning] = useState(false)
```

**WR-01 useEffect — resets showWarning when currentTicket goes null** (new, insert after the two useState lines):
```tsx
// WR-01 fix: reset removal warning when currentTicket is cleared externally
useEffect(() => {
  if (ventanilla.currentTicket === null) {
    setShowWarning(false)
  }
}, [ventanilla.currentTicket])
```
Critical: dep array is `[ventanilla.currentTicket]`, NOT `[]` (empty = never re-runs) and NOT `[ventanilla]` (changes reference every parent render).

**CALL-02 useEffect — auto-dismiss empty-queue warning** (new, insert after WR-01 useEffect):
```tsx
// CALL-02: auto-dismiss empty-queue warning after 2 seconds
useEffect(() => {
  if (!showEmptyWarning) return
  const timer = setTimeout(() => setShowEmptyWarning(false), 2000)
  return () => clearTimeout(timer)
}, [showEmptyWarning])
```

**handleRemove pattern to mirror for handleCallNext** (lines 14-21):
```tsx
function handleRemove() {
  if (ventanilla.currentTicket !== null) {
    setShowWarning(true)
    return
  }
  setShowWarning(false)
  onRemove(ventanilla.id)
}
```
New handleCallNext (same guard-and-early-return pattern):
```tsx
function handleCallNext() {
  if (isQueueEmpty) {
    setShowEmptyWarning(true)
    return
  }
  onCallNext(ventanilla.id)
}
```

**JSX structure to extend** (lines 33-44 — add button below `.ventanilla-ticket` and second warning below first):
```tsx
<p className="ventanilla-ticket">
  {ventanilla.currentTicket === null
    ? 'sin turno'
    : `Turno ${ventanilla.currentTicket.number}`}
</p>
{/* ADD: */}
<button type="button" className="call-next-button" onClick={handleCallNext}>
  Llamar siguiente
</button>
{showWarning && (
  <p className="ventanilla-warning">
    No se puede quitar: tiene un turno activo
  </p>
)}
{/* ADD: */}
{showEmptyWarning && (
  <p className="ventanilla-warning">No hay turnos en espera</p>
)}
```

**VentanillaCard invocation in App JSX to extend** (lines 91-94 — add two new props):
```tsx
<VentanillaCard
  key={v.id}
  ventanilla={v}
  onRemove={(id) => dispatch({ type: 'REMOVE_WINDOW', id })}
  {/* ADD: */}
  onCallNext={(id) => dispatch({ type: 'CALL_NEXT', windowId: id })}
  isQueueEmpty={state.queue.length === 0}
/>
```

---

### `src/turnero.test.ts` — CALL-01/CALL-02/WR-02 unit tests

**Analog:** Same file — WINDOW-02-A describe block (lines 64-70) and QUEUE-01-C test (lines 16-23).

**describe/it/expect pattern to replicate** (lines 64-70):
```typescript
describe('WINDOW-02: Remove with guard', () => {
  it('WINDOW-02-A: REMOVE_WINDOW removes the ventanilla when currentTicket is null', () => {
    let state = queueReducer(initialState, { type: 'ADD_WINDOW' })
    state = queueReducer(state, { type: 'REMOVE_WINDOW', id: 1 })
    expect(state.ventanillas).toHaveLength(0)
  })
})
```

**Sequential dispatch pattern to replicate** (lines 9-13):
```typescript
let state = queueReducer(initialState, { type: 'ADD_TICKET' })
state = queueReducer(state, { type: 'ADD_TICKET' })
state = queueReducer(state, { type: 'ADD_TICKET' })
expect(state.queue.map((t) => t.number)).toEqual([1, 2, 3])
```

**Import line** (line 1 — no change needed):
```typescript
import { queueReducer, initialState } from './turnero'
```

**New describe blocks to add** (append after existing tests):
```typescript
describe('CALL-01: CALL_NEXT reducer', () => {
  it('CALL-01-A: dequeues head ticket and sets it as ventanilla currentTicket', () => {
    let state = queueReducer(initialState, { type: 'ADD_WINDOW' })
    state = queueReducer(state, { type: 'ADD_TICKET' })
    state = queueReducer(state, { type: 'CALL_NEXT', windowId: 1 })
    expect(state.ventanillas[0].currentTicket?.number).toBe(1)
    expect(state.queue).toHaveLength(0)
  })

  it('CALL-01-B: CALL_NEXT on empty queue returns state unchanged (no-op)', () => {
    let state = queueReducer(initialState, { type: 'ADD_WINDOW' })
    const before = state
    state = queueReducer(state, { type: 'CALL_NEXT', windowId: 1 })
    expect(state).toBe(before)  // referential equality — same object returned
  })

  it('CALL-01-C: CALL_NEXT replaces existing currentTicket (replace-always)', () => {
    let state = queueReducer(initialState, { type: 'ADD_WINDOW' })
    state = queueReducer(state, { type: 'ADD_TICKET' })  // ticket 1
    state = queueReducer(state, { type: 'ADD_TICKET' })  // ticket 2
    state = queueReducer(state, { type: 'CALL_NEXT', windowId: 1 })  // assigns ticket 1
    state = queueReducer(state, { type: 'CALL_NEXT', windowId: 1 })  // replaces with ticket 2
    expect(state.ventanillas[0].currentTicket?.number).toBe(2)
  })
})

describe('WR-02: REMOVE_WINDOW reducer guard', () => {
  it('WR-02-A: REMOVE_WINDOW is no-op when ventanilla has active ticket', () => {
    let state = queueReducer(initialState, { type: 'ADD_WINDOW' })
    state = queueReducer(state, { type: 'ADD_TICKET' })
    state = queueReducer(state, { type: 'CALL_NEXT', windowId: 1 })
    const before = state
    state = queueReducer(state, { type: 'REMOVE_WINDOW', id: 1 })
    expect(state).toBe(before)  // referential equality
    expect(state.ventanillas).toHaveLength(1)
  })
})
```

---

### `src/App.test.tsx` — CALL-01/CALL-02/WR-01 integration tests

**Analog:** Same file — WINDOW-02 describe block (lines 16-41), render/fireEvent/expect pattern (lines 17-28).

**Import line to extend** (line 1 — add `vi` and `act`):
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
// Extend to:
import { render, screen, fireEvent, act } from '@testing-library/react'
import { vi } from 'vitest'
import { VentanillaCard } from './App'
```
Note: `vi` is a Vitest global already available without explicit import in Vitest config, but `act` must be imported from `@testing-library/react` (RTL 16.x re-exports it from React).

**Existing render/fireEvent/expect pattern to extend** (lines 17-28):
```typescript
it('shows inline warning and does not call onRemove when active ticket is present', () => {
  const onRemove = vi.fn()
  render(
    <VentanillaCard
      ventanilla={{ id: 1, number: 1, currentTicket: { id: 5, number: 5 } }}
      onRemove={onRemove}
    />
  )
  fireEvent.click(screen.getByRole('button', { name: 'Quitar ventanilla 1' }))
  expect(screen.getByText('No se puede quitar: tiene un turno activo')).toBeInTheDocument()
  expect(onRemove).not.toHaveBeenCalled()
})
```

**New describe blocks to add** (note: VentanillaCard now requires `onCallNext` and `isQueueEmpty` props — existing tests must add them too):
```typescript
describe('CALL-01: Llamar siguiente dispatches CALL_NEXT', () => {
  it('calls onCallNext with ventanilla id when queue is not empty', () => {
    const onCallNext = vi.fn()
    render(
      <VentanillaCard
        ventanilla={{ id: 1, number: 1, currentTicket: null }}
        onRemove={() => {}}
        onCallNext={onCallNext}
        isQueueEmpty={false}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /llamar siguiente/i }))
    expect(onCallNext).toHaveBeenCalledWith(1)
  })
})

describe('CALL-02: Empty-queue warning auto-dismiss', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows empty-queue warning on click and dismisses after 2 seconds', () => {
    render(
      <VentanillaCard
        ventanilla={{ id: 1, number: 1, currentTicket: null }}
        onRemove={() => {}}
        onCallNext={() => {}}
        isQueueEmpty={true}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /llamar siguiente/i }))
    expect(screen.getByText('No hay turnos en espera')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(screen.queryByText('No hay turnos en espera')).not.toBeInTheDocument()
  })
})

describe('WR-01: showWarning resets when currentTicket is cleared externally', () => {
  it('clears the removal warning when ventanilla prop transitions from active ticket to null', () => {
    const { rerender } = render(
      <VentanillaCard
        ventanilla={{ id: 1, number: 1, currentTicket: { id: 5, number: 5 } }}
        onRemove={() => {}}
        onCallNext={() => {}}
        isQueueEmpty={false}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Quitar ventanilla 1' }))
    expect(screen.getByText('No se puede quitar: tiene un turno activo')).toBeInTheDocument()

    rerender(
      <VentanillaCard
        ventanilla={{ id: 1, number: 1, currentTicket: null }}
        onRemove={() => {}}
        onCallNext={() => {}}
        isQueueEmpty={true}
      />
    )
    expect(screen.queryByText('No se puede quitar: tiene un turno activo')).not.toBeInTheDocument()
  })
})
```

**IMPORTANT — existing tests need props updated:** Both existing tests in App.test.tsx pass VentanillaCard without `onCallNext` and `isQueueEmpty`. Once the prop signature adds those as required props, TypeScript will error. Existing test renders must add `onCallNext={() => {}}` and `isQueueEmpty={false}` (or `true` as appropriate).

---

### `src/index.css` — .call-next-button + .empty-queue-warning CSS rules

**Analog:** Same file — `.add-window-button` (lines 94-104) is the closest button analog; `.ventanilla-warning` (lines 141-144) is the warning analog.

**Button template to copy** (lines 94-104):
```css
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
```
New `.call-next-button` (full-width per D-07, same base conventions):
```css
.call-next-button {
  background: #f1f3f5;
  color: #1f2933;
  border: none;
  border-radius: 6px;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin: 8px 0 0;
  width: 100%;
}
```

**Warning template to reuse** (lines 141-144):
```css
.ventanilla-warning {
  font-size: 13px;
  color: #c0392b;
  margin: 6px 0 0;
}
```
The empty-queue message reuses `.ventanilla-warning` class (same red inline warning style). No new CSS class needed for the message itself per RESEARCH.md open question resolution (reuse for now, differentiate in Phase 6).

**Placement:** Append `.call-next-button` rule after `.ventanilla-warning` (line 144), before `.ventanillas-empty`.

---

## Shared Patterns

### Reducer Spread (`...state` first)
**Source:** `src/turnero.ts` lines 57-61
**Apply to:** CALL_NEXT case and updated REMOVE_WINDOW case
```typescript
return {
  ...state,          // always first — preserves all QueueState fields
  queue: ...,        // then override only changed fields
  ventanillas: ...,
}
```

### Discriminated Union Guard (early return state)
**Source:** `src/turnero.ts` REMOVE_WINDOW case (line 76-83) — extend with early-return pattern
**Apply to:** CALL_NEXT (empty queue no-op) and REMOVE_WINDOW (WR-02 no-op)
```typescript
if (<guard condition>) return state  // referential equality — React skips re-render
```

### Local State + Guard + Early Return (component handler)
**Source:** `src/App.tsx` handleRemove lines 14-21
**Apply to:** handleCallNext in VentanillaCard
```tsx
function handleRemove() {
  if (ventanilla.currentTicket !== null) {
    setShowWarning(true)
    return                    // early return on guard
  }
  setShowWarning(false)
  onRemove(ventanilla.id)   // only reached when guard passes
}
```

### useEffect Cleanup (timer auto-dismiss)
**Source:** No existing instance in codebase — new pattern for Phase 4
**Apply to:** CALL-02 showEmptyWarning auto-dismiss in VentanillaCard
```tsx
useEffect(() => {
  if (!showEmptyWarning) return        // skip when false (effect only acts when true)
  const timer = setTimeout(() => setShowEmptyWarning(false), 2000)
  return () => clearTimeout(timer)     // cleanup cancels timer on re-run or unmount
}, [showEmptyWarning])
```

### Readonly Props Typing (SonarLint S6759)
**Source:** `src/App.tsx` lines 6-11
**Apply to:** VentanillaCard expanded props signature
```tsx
}: Readonly<{
  ventanilla: Ventanilla
  onRemove: (id: number) => void
  // extend with new props inside the same Readonly<{...}> wrapper
}>) {
```

### Callback Prop Naming (`on` prefix, id parameter)
**Source:** `src/App.tsx` line 10 — `onRemove: (id: number) => void`
**Apply to:** `onCallNext: (id: number) => void` — mirrors exact signature shape

### vi.fn() + fireEvent + expect (integration test)
**Source:** `src/App.test.tsx` lines 17-28
**Apply to:** All new VentanillaCard integration tests
```typescript
const onCallNext = vi.fn()
render(<VentanillaCard ... onCallNext={onCallNext} isQueueEmpty={false} />)
fireEvent.click(screen.getByRole('button', { name: /llamar siguiente/i }))
expect(onCallNext).toHaveBeenCalledWith(1)
```

### Fake Timers + act() (Vitest integration test)
**Source:** No existing instance — new pattern for Phase 4
**Apply to:** CALL-02 auto-dismiss integration test only
```typescript
beforeEach(() => { vi.useFakeTimers() })
afterEach(() => { vi.useRealTimers() })

act(() => {
  vi.advanceTimersByTime(2000)
})
```
Critical: `vi.advanceTimersByTime` MUST be wrapped in `act()` when the timer callback triggers a React state setter.

---

## No Analog Found

All 5 files have close analogs in the same files being modified. Two patterns are genuinely new to the codebase:

| Pattern | File | Reason |
|---------|------|--------|
| `useEffect` auto-dismiss (timer cleanup) | `src/App.tsx` | No existing timer-based useEffect in codebase; pattern is standard React but has no prior instance to copy line numbers from |
| `vi.useFakeTimers()` + `act()` | `src/App.test.tsx` | No existing fake-timer test in codebase; pattern sourced from RESEARCH.md Pattern 4 |

For these two: use the code excerpts in the Pattern Assignments sections above (derived from RESEARCH.md + React/Vitest standard documentation).

---

## Metadata

**Analog search scope:** `src/` directory (all 5 files are in `src/`)
**Files scanned:** 5 (`turnero.ts`, `App.tsx`, `turnero.test.ts`, `App.test.tsx`, `index.css`)
**Pattern extraction date:** 2026-07-07
