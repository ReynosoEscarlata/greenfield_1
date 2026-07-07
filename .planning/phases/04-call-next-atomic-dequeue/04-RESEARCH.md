# Phase 4: Call Next (Atomic Dequeue) - Research

**Researched:** 2026-07-07
**Domain:** React useReducer state transitions, useEffect cleanup, Vitest fake timers
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** "Llamar siguiente" is always enabled — same label in all states, no disabled state, no label variation when the ventanilla is occupied or the queue is empty.
- **D-02:** A ventanilla can call next even when it already has an active ticket (replace-always). The previous currentTicket is silently discarded. No re-insertion into the queue.
- **D-03:** Reducer action is `{ type: 'CALL_NEXT'; windowId: number }`. Pops `state.queue[0]` and sets matching ventanilla's currentTicket. If queue is empty, reducer returns state unchanged (no-op) — the UI layer handles feedback.
- **D-04:** Feedback appears inline inside the VentanillaCard that triggered the call.
- **D-05:** Message text: `"No hay turnos en espera"`.
- **D-06:** Message auto-dismisses after 2 seconds via `setTimeout` cleared in a `useEffect` cleanup.
- **D-07:** "Llamar siguiente" sits at the bottom of VentanillaCard, below the current ticket display, full-width.
- **D-08:** New prop `onCallNext: (id: number) => void` — mirrors `onRemove` signature.
- **D-09:** No special visual treatment on dequeue — queue strip reactively removes chip.
- **D-10 (WR-01 fix):** Add `useEffect` in VentanillaCard that resets `showWarning` to `false` whenever `ventanilla.currentTicket` changes to `null`.
- **D-11 (WR-02 fix):** Add reducer-level guard in `REMOVE_WINDOW` case: return `state` unchanged when target ventanilla has `currentTicket !== null`.
- **D-12:** Unit tests (reducer) AND integration tests (App.test.tsx) required. TDD Red/Green commit pattern.

### Claude's Discretion

- CSS styling for the "Llamar siguiente" button (color, border, sizing beyond full-width) — follow existing button conventions in index.css.
- `useEffect` cleanup pattern for the 2-second auto-dismiss (standard `clearTimeout` on unmount/dependency change).
- Whether to expose VentanillaCard integration tests as a separate describe block or extend the existing one in App.test.tsx.

### Deferred Ideas (OUT OF SCOPE)

- Sound on call — Phase 5 (FEEDBACK-01)
- Transition animation when ticket changes — Phase 6 (FEEDBACK-02)
- localStorage persistence — Phase 8 (PERSIST-01)
- Brief highlight on dequeued chip before removal — deferred to Phase 6
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CALL-01 | User can press "Llamar siguiente" on a ventanilla to atomically take the next ticket from the shared queue, with no possibility of duplicate assignments | Guaranteed by JS event loop serialization (single-threaded); reducer CALL_NEXT case uses array destructuring to dequeue head and update matching ventanilla; atomicity is structural, not engineered |
| CALL-02 | If queue is empty when "Llamar siguiente" is pressed, show a message that no tickets are waiting; button remains enabled | Local boolean state `showEmptyWarning` in VentanillaCard; VentanillaCard needs an `isQueueEmpty` prop to detect empty queue before/during dispatch; `useEffect` with `clearTimeout` cleanup handles the 2-second auto-dismiss |
</phase_requirements>

---

## Summary

Phase 4 completes the Core Value: any ventanilla can press "Llamar siguiente" and reliably take the next ticket. The entire implementation lives in two files (`src/turnero.ts` and `src/App.tsx`) plus test extensions — no new packages, no new files beyond what already exists.

**Atomicity is structurally guaranteed by JavaScript's single-threaded event loop.** A `useReducer` dispatch processes synchronously, and the browser processes only one JS task at a time. Two simultaneous clicks in a single browser tab are impossible at the JS level — the second click handler executes only after the first completes and its reducer call has already mutated `state.queue`. The "atomic dequeue" requirement is met by the existing architecture with no additional engineering.

The non-trivial work in this phase is: (1) the `CALL_NEXT` reducer case and its type extension, (2) the `useEffect` auto-dismiss pattern for the empty-queue warning with correct `clearTimeout` cleanup, (3) the WR-01 useEffect fix to prevent stale `showWarning` state, and (4) the WR-02 reducer guard. All four follow established patterns already present in the codebase.

**Primary recommendation:** Implement in two plans following the Phase 3 TDD Red/Green pattern — Plan 01 extends the reducer and writes all failing tests, Plan 02 extends VentanillaCard UI and makes tests green.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Atomic dequeue (CALL-01) | Browser/Client reducer (`turnero.ts`) | — | Pure synchronous JS; array destructuring in reducer is the single authoritative state mutation |
| Empty-queue detection | Browser/Client component (`VentanillaCard`) | Reducer (no-op guard) | VentanillaCard receives `isQueueEmpty` prop, decides whether to show feedback; reducer independently no-ops on empty queue as a safety net |
| Empty-queue feedback (CALL-02) | Browser/Client component (`VentanillaCard`) | — | Local `showEmptyWarning` state + `useEffect` auto-dismiss; same tier and pattern as existing `showWarning` |
| Queue strip reactive update | Browser/Client (React reconciliation) | — | `state.queue` is the truth source; removing head reactively re-renders the chip list |
| WR-01: stale showWarning reset | Browser/Client component (`VentanillaCard`) | — | `useEffect` watching `ventanilla.currentTicket` prop change; component-local concern |
| WR-02: remove guard defense-in-depth | Browser/Client reducer (`turnero.ts`) | — | Reducer is the authoritative state machine; should not trust call sites |

---

## Standard Stack

### Core (no new packages required)

All required capabilities are already present in the installed stack.

| Library | Installed Version | Purpose in Phase 4 | Why Sufficient |
|---------|------------------|---------------------|----------------|
| React | ^19.2.6 | `useReducer`, `useState`, `useEffect` | `useEffect` cleanup pattern for auto-dismiss is standard React; no extra hook library needed |
| TypeScript | ~6.0.2 | Discriminated union extension, Readonly props | Type extension of `QueueAction` union is a one-liner; existing Ventanilla type already has `currentTicket: Ticket \| null` |
| Vitest | ^4.1.10 | `vi.useFakeTimers`, `vi.advanceTimersByTime` | Built-in fake timer support; no additional adapter needed for setTimeout testing |
| @testing-library/react | ^16.3.2 | `render`, `screen`, `fireEvent`, `act` | `act` from React is needed when advancing fake timers that trigger state updates |

**Installation:** None required. No `npm install` step for this phase. [VERIFIED: package.json in repo]

### Alternatives Considered

| Recommended | Alternative | Why Not Used |
|-------------|-------------|--------------|
| `isQueueEmpty: boolean` prop to VentanillaCard | Callback return value from `onCallNext` | Callbacks in React are fire-and-forget void by convention; returning a boolean from dispatch would require wrapping reducer, adding complexity |
| `useEffect` with dep `[showEmptyWarning]` for auto-dismiss | `useRef` + inline setTimeout in handler | useEffect approach centralizes cleanup; ref approach requires explicit unmount cleanup via second useEffect; dep-array approach is idiomatic and easier to test |
| `[ventanilla.currentTicket]` dep for WR-01 reset (Option B from review) | Derive from prop directly (Option A from review) | D-10 explicitly locks Option B (useEffect reset); planner must not switch to Option A |

---

## Package Legitimacy Audit

No external packages are installed in this phase. This section is not applicable.

**Packages removed due to slopcheck:** none
**Packages flagged as suspicious:** none

---

## Architecture Patterns

### System Architecture Diagram

```
User clicks "Llamar siguiente"
         |
         v
VentanillaCard.handleCallNext()
         |
         +-- isQueueEmpty? YES --> setShowEmptyWarning(true)
         |                              |
         |                         useEffect fires (dep: showEmptyWarning)
         |                              |
         |                         setTimeout(2000ms)
         |                              |
         |                         [2s later] setShowEmptyWarning(false)
         |                              |   clearTimeout called on cleanup
         |
         +-- isQueueEmpty? NO --> onCallNext(ventanilla.id)
                                       |
                                       v
                              App.tsx: dispatch({ type: 'CALL_NEXT', windowId: id })
                                       |
                                       v
                              queueReducer CALL_NEXT case
                                  queue.length === 0? -> return state (no-op)
                                  queue.length > 0?  -> destructure [head, ...rest]
                                                        map ventanillas: match id -> set currentTicket
                                                        return { ...state, queue: rest, ventanillas: updated }
                                       |
                                       v
                              React reconciliation
                              - VentanillaCard re-renders with new ventanilla.currentTicket
                              - queue-strip chip list re-renders without dequeued ticket
                              - WR-01 useEffect fires: currentTicket changed from null -> ticket
                                (showWarning reset does NOT fire because ticket is non-null now;
                                 it fires later when currentTicket goes null)
```

### Recommended Project Structure

No new files required. Phase 4 modifies existing files only:

```
src/
├── turnero.ts        # Add CALL_NEXT to QueueAction union + reducer case + WR-02 guard
├── App.tsx           # Extend VentanillaCard with onCallNext + isQueueEmpty props + useEffects
├── turnero.test.ts   # Add CALL-01/CALL-02/WR-02 unit tests
├── App.test.tsx      # Add CALL-01/CALL-02/WR-01 integration tests
└── index.css         # Add .call-next-button + .empty-queue-warning CSS rules
```

### Pattern 1: CALL_NEXT Reducer Case

**What:** Dequeue head of queue; update matching ventanilla's currentTicket. No-op on empty queue.
**When to use:** Any dispatch of `{ type: 'CALL_NEXT'; windowId: number }`.

```typescript
// src/turnero.ts — extend QueueAction union:
export type QueueAction =
  | { type: 'ADD_TICKET' }
  | { type: 'ADD_WINDOW' }
  | { type: 'REMOVE_WINDOW'; id: number }
  | { type: 'CALL_NEXT'; windowId: number }   // Phase 4 addition

// Reducer case — add after REMOVE_WINDOW:
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

**Critical:** Must spread `...state` first (same as ADD_TICKET fix in Phase 3). `map` returns a new array with structural sharing for unchanged elements — correct immutability. [ASSUMED — training knowledge, pattern matches ADD_TICKET spread fix documented in 03-01-SUMMARY.md]

### Pattern 2: WR-02 Reducer Guard (REMOVE_WINDOW)

**What:** Defense-in-depth guard prevents silent data loss when REMOVE_WINDOW is dispatched programmatically against a ventanilla with an active ticket.
**When to use:** Replace the existing unconditional REMOVE_WINDOW case.

```typescript
case 'REMOVE_WINDOW': {
  const target = state.ventanillas.find((v) => v.id === action.id)
  // Guard: refuse to remove a window that is actively serving a ticket.
  // The UI layer (VentanillaCard) enforces the same rule; the reducer is
  // the authoritative state machine and must not trust call sites.
  if (target !== undefined && target.currentTicket !== null) {
    return state  // no-op: data-loss prevention (WR-02 fix)
  }
  return {
    ...state,
    ventanillas: state.ventanillas.filter((v) => v.id !== action.id),
  }
}
```

**Note:** The condition must handle the case where `target` is `undefined` (id not found) — let removal proceed (filter will remove nothing, which is a safe no-op). [ASSUMED — training knowledge; matches the guard shown in 03-REVIEW.md WR-02]

### Pattern 3: VentanillaCard Extended Props

**What:** Extend Readonly props with `onCallNext` and `isQueueEmpty`. Keep `Readonly<{...}>` wrapper (SonarLint S6759).

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
  const [showWarning, setShowWarning] = useState(false)
  const [showEmptyWarning, setShowEmptyWarning] = useState(false)

  // WR-01 fix: reset removal warning when currentTicket is cleared externally
  useEffect(() => {
    if (ventanilla.currentTicket === null) {
      setShowWarning(false)
    }
  }, [ventanilla.currentTicket])

  // CALL-02: auto-dismiss empty-queue warning after 2 seconds
  useEffect(() => {
    if (!showEmptyWarning) return
    const timer = setTimeout(() => setShowEmptyWarning(false), 2000)
    return () => clearTimeout(timer)
  }, [showEmptyWarning])

  function handleRemove() {
    if (ventanilla.currentTicket !== null) {
      setShowWarning(true)
      return
    }
    setShowWarning(false)
    onRemove(ventanilla.id)
  }

  function handleCallNext() {
    if (isQueueEmpty) {
      setShowEmptyWarning(true)
      return
    }
    onCallNext(ventanilla.id)
  }

  return (
    <div className="ventanilla-card">
      {/* × button — absolute top-right (unchanged) */}
      <button type="button" className="ventanilla-remove" onClick={handleRemove}
        aria-label={`Quitar ventanilla ${ventanilla.number}`}>×</button>
      <h3 className="ventanilla-label">Ventanilla {ventanilla.number}</h3>
      <p className="ventanilla-ticket">
        {ventanilla.currentTicket === null
          ? 'sin turno'
          : `Turno ${ventanilla.currentTicket.number}`}
      </p>
      <button type="button" className="call-next-button" onClick={handleCallNext}>
        Llamar siguiente
      </button>
      {showWarning && (
        <p className="ventanilla-warning">No se puede quitar: tiene un turno activo</p>
      )}
      {showEmptyWarning && (
        <p className="ventanilla-warning">No hay turnos en espera</p>
      )}
    </div>
  )
}
```

[ASSUMED — training knowledge; derived from existing patterns in src/App.tsx]

**Why `isQueueEmpty` prop:** VentanillaCard has no direct access to `state.queue`. The parent (App.tsx) passes `isQueueEmpty={state.queue.length === 0}`. This keeps VentanillaCard pure and directly testable without needing to provide queue state in tests. The prop is computed reactively — React re-renders VentanillaCard when queue becomes empty.

**Why two separate local states:** `showWarning` (removal guard) and `showEmptyWarning` (call feedback) are independent messages with different trigger and dismiss semantics. Merging them into a single state enum is premature complexity for this scope.

### Pattern 4: Vitest Fake Timers for Auto-Dismiss Test

**What:** Test the 2-second auto-dismiss without waiting real time.
**When to use:** App.test.tsx integration test for CALL-02.

```typescript
// App.test.tsx — CALL-02 auto-dismiss test
import { vi } from 'vitest'
import { act } from 'react'

describe('CALL-02: Empty-queue warning auto-dismiss', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows empty-queue warning on click and dismisses after 2 seconds', async () => {
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

    // Advance fake timers — must wrap in act() because the timeout callback
    // calls setShowEmptyWarning(false) which triggers a React state update.
    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(screen.queryByText('No hay turnos en espera')).not.toBeInTheDocument()
  })
})
```

**Critical:** `vi.advanceTimersByTime` MUST be wrapped in `act()` when the timer callback triggers a React state update. Without `act()`, React Testing Library will warn about state updates outside an act boundary, and the assertion may fail or be flaky. [ASSUMED — training knowledge; aligns with React Testing Library documentation patterns]

### Pattern 5: WR-01 Integration Test

**What:** Test that `showWarning` (removal guard) clears when `currentTicket` becomes null via prop change.

```typescript
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
    // Trigger the warning
    fireEvent.click(screen.getByRole('button', { name: 'Quitar ventanilla 1' }))
    expect(screen.getByText('No se puede quitar: tiene un turno activo')).toBeInTheDocument()

    // Simulate CALL_NEXT clearing the ticket from outside (parent re-renders with null)
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

[ASSUMED — training knowledge; `rerender` is the RTL pattern for simulating prop changes]

### Anti-Patterns to Avoid

- **Calling `setTimeout` directly in the click handler without a cleanup effect:** A component that unmounts mid-timeout will try to call `setShowEmptyWarning` on an unmounted component. The `useEffect` approach with `return () => clearTimeout(timer)` is the correct pattern. [ASSUMED]
- **Using `showEmptyWarning` as the dep for the WR-01 useEffect:** The WR-01 useEffect watches `ventanilla.currentTicket`, not `showEmptyWarning`. Conflating the two causes incorrect behavior. [ASSUMED]
- **Returning `undefined` from `CALL_NEXT` when id not found:** If `action.windowId` doesn't match any ventanilla (e.g., component already unmounted), the `.map` returns the same array with no changes — a silent no-op that is safe. No explicit guard needed for the id-not-found case. [ASSUMED]
- **Spreading `action` into the new state:** Only spread `...state`, never `...action`. [ASSUMED]

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Fake timer control in tests | Custom polling / sleep loops | `vi.useFakeTimers()` + `vi.advanceTimersByTime()` | Built into Vitest; polling loops are nondeterministic and slow |
| State update batching across multiple dispatches | Manual queueMicrotask tricks | React 18+ automatic batching (already present) | React 18 batches all dispatches in event handlers by default; no manual work needed |
| Cross-tab "two windows call same ticket" prevention | BroadcastChannel, localStorage locking | Nothing (out of scope per REQUIREMENTS.md) | Multi-tab sync explicitly excluded; single-tab JS is inherently serialized |

**Key insight:** JavaScript's single-threaded event loop makes multi-click race conditions structurally impossible within a single browser tab. The "atomic dequeue" requirement is met for free by the `useReducer` pattern — there is no concurrent state access.

---

## Common Pitfalls

### Pitfall 1: `act()` Missing Around Fake Timer Advancement

**What goes wrong:** Test passes on first run but React warns "Warning: An update to VentanillaCard inside a test was not wrapped in act(...)". In some configurations the assertion after timer advancement fails because the DOM update hasn't flushed.

**Why it happens:** `vi.advanceTimersByTime(2000)` synchronously invokes the `setTimeout` callback, which calls `setShowEmptyWarning(false)`. React schedules a re-render. Without `act()`, the re-render hasn't been flushed to the DOM when the assertion runs.

**How to avoid:** Always wrap `vi.advanceTimersByTime` in `act()` when the timer callback calls a React state setter.

**Warning signs:** Console warnings about updates outside `act()`; `queryByText(...)` still finds the element that should be dismissed.

---

### Pitfall 2: React StrictMode Double-Invoke and Timer Confusion

**What goes wrong:** In development mode (StrictMode), `useEffect` runs twice (mount → unmount → remount). The first timer is cancelled by the cleanup; the second timer starts fresh. The 2-second countdown restarts on the second mount.

**Why it happens:** Vite's `react-ts` template wraps `<App />` in `<React.StrictMode>` in `main.tsx`. StrictMode intentionally double-invokes effects to help surface cleanup bugs.

**How to avoid:** This is expected behavior and correct — the cleanup (`clearTimeout`) is exactly what prevents the double-fire from becoming a bug. Tests run without StrictMode by default in RTL, so this doesn't affect test behavior. Do not remove StrictMode to make tests "pass faster".

**Warning signs:** Warning appears only in dev mode, not in production build or test runs.

---

### Pitfall 3: `isQueueEmpty` Prop Computed Once, Stale During Rapid Clicks

**What goes wrong:** User clicks "Llamar siguiente" rapidly. The first click dispatches CALL_NEXT and React schedules a re-render. The second click fires before the re-render flushes. `isQueueEmpty` is still `false` (based on stale closure). Second click dispatches a second CALL_NEXT.

**Why it happens:** React batches renders within event handlers. In React 18+, all dispatches within a single event handler are batched, BUT each click event is a separate handler. Between two separate click events, a re-render should have occurred.

**Impact:** Not actually a problem in practice because: (a) two separate DOM clicks are separated by a browser render cycle; (b) even if CALL_NEXT is dispatched twice on an empty queue, the reducer no-ops on empty queue. The only failure mode is the empty-queue warning appearing for a moment on the second click while the queue has one item — but this requires superhuman click speed and the reducer still handles it correctly.

**How to avoid:** No special handling needed. The reducer's `queue.length === 0` guard is the ultimate safety net.

---

### Pitfall 4: WR-02 Guard Condition Using `=== undefined` vs Optional Chaining

**What goes wrong:** `target?.currentTicket !== null` evaluates to `true` when `target` is `undefined` (because `undefined !== null` is `true`). This would block removal even when the ventanilla id doesn't exist — a no-op that is harmless but semantically wrong.

**Why it happens:** Optional chaining short-circuits to `undefined`, and `undefined !== null`.

**How to avoid:** Check `target !== undefined` separately before checking `target.currentTicket !== null`. The guard in Pattern 2 above handles this correctly with an explicit `target !== undefined &&` condition.

**Warning signs:** REMOVE_WINDOW on a non-existent id silently returns unchanged state instead of filtering (no-op filter). This is actually harmless — filtering by non-existent id produces the same array — but the intent of the guard should be explicit.

---

### Pitfall 5: Dep Array for WR-01 useEffect

**What goes wrong:** `useEffect(() => { ... }, [])` with empty deps — the effect runs only on mount, never when the prop changes. The stale `showWarning` bug WR-01 was supposed to fix remains.

**Why it happens:** Forgetting to include `ventanilla.currentTicket` in the dependency array.

**How to avoid:** The dep array MUST be `[ventanilla.currentTicket]` (not `[ventanilla]` — that changes reference on every parent render even when ticket doesn't change, causing unnecessary effect runs; not `[]` — that never re-runs).

**Warning signs:** WR-01 integration test fails ("removal warning persists after prop changes to null").

---

## Code Examples

### Existing Pattern: Reducer Spread (must follow exactly)

```typescript
// Source: src/turnero.ts (Phase 3 ADD_TICKET fix, commit 895ef69)
// CRITICAL: spread ...state first so all QueueState fields are preserved.
return {
  ...state,
  queue: [...state.queue, ticket],
  nextNumber: state.nextNumber + 1,
}
```

CALL_NEXT must follow the same `...state` spread discipline. [VERIFIED: src/turnero.ts in repo]

### Existing Pattern: handleRemove guard (WR-01 useEffect mirrors this structure)

```tsx
// Source: src/App.tsx (Phase 3, commit 25db272)
function handleRemove() {
  if (ventanilla.currentTicket !== null) {
    setShowWarning(true)
    return
  }
  setShowWarning(false)
  onRemove(ventanilla.id)
}
```

[VERIFIED: src/App.tsx in repo]

### Existing Pattern: Integration test structure to extend

```typescript
// Source: src/App.test.tsx (Phase 3, commit 127b1d1)
describe('WINDOW-02: Remove with guard', () => {
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
})
```

[VERIFIED: src/App.test.tsx in repo]

---

## State of the Art

| Old Approach | Current Approach | Impact for Phase 4 |
|--------------|------------------|---------------------|
| `act()` from `react-dom/test-utils` | `act()` from `react` (React 18+) | Import `act` from `'react'`, not `'react-dom/test-utils'` — same function, but the package-level import is the modern form and avoids deprecation warnings |
| `waitFor` for timer-based assertions | `act(() => vi.advanceTimersByTime(N))` | Direct advancement is synchronous and simpler; `waitFor` is for truly async operations (network, real timers) |
| `cleanup()` call in afterEach | Auto-cleanup (default in RTL + Vitest) | @testing-library/react auto-registers cleanup via `afterEach` when using Vitest; explicit `cleanup()` is redundant |

**Deprecated/outdated:**
- `ReactDOM.act` (old path): replaced by `act` from `'react'` since React 18.
- `enzyme` / `shallow`: not present in this project; RTL is the installed and correct choice.

---

## Atomicity Analysis: Is There a Real Race Condition?

**Question from research brief:** Is there a real race condition in synchronous JS that the reducer needs to protect against?

**Answer:** No. [ASSUMED — training knowledge on JS event loop; HIGH confidence]

JavaScript is single-threaded. The browser event loop processes tasks (including click handlers) one at a time. A `useReducer` dispatch is synchronous within the current task: `queueReducer(state, action)` executes completely before the next JS task can run. This means:

1. User A clicks "Llamar siguiente" on Ventanilla 1 → dispatch fires → reducer executes → `state.queue` shrinks by 1 → React schedules re-render.
2. User B (same browser, same tab) cannot click until the current task completes. By the time their click handler fires, React has already applied the new state.
3. Even if two click events are in the browser's task queue simultaneously (queued before either fires), they execute sequentially. The second reducer call sees the state AFTER the first reducer call's mutations.

The "atomic" guarantee comes from JavaScript's serialized execution model, not from any locking or CAS mechanism. The reducer does not need to implement any special concurrency protection.

**Multi-tab scenario:** Two browser tabs DO share localStorage, but Phase 4 does not implement localStorage (deferred to Phase 8). Each tab has its own independent `useReducer` state. Cross-tab race conditions are explicitly out of scope per REQUIREMENTS.md.

---

## Open Questions (RESOLVED)

1. **`isQueueEmpty` prop name**
   - RESOLVED: `isQueueEmpty: boolean`, computed in App.tsx as `state.queue.length === 0`. Plans implement this in 04-02 Task 1 Location 2.

2. **CSS class name for "Llamar siguiente" button**
   - RESOLVED: `.call-next-button` (new class). Plans add it to index.css in 04-02 Task 1.

3. **CSS class for `"No hay turnos en espera"` message**
   - RESOLVED: Reuse `.ventanilla-warning` for now — color distinction deferred to Phase 6. Plans implement this in 04-02 Task 1 Location 6.

---

## Environment Availability

No new external dependencies for this phase. All required tools verified present.

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Vitest, Vite dev server | Yes | v22.23.0 | — |
| Vitest | Unit and integration tests | Yes | 4.1.10 | — |
| @testing-library/react | Integration tests | Yes | ^16.3.2 | — |

[VERIFIED: package.json + `node --version` in repo]

---

## Validation Architecture

> `workflow.nyquist_validation: true` in `.planning/config.json` — section is required.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.10 |
| Config file | `vite.config.ts` (vitest config inline — already set up in Phase 2) |
| Quick run command | `npm test` (`vitest run`) |
| Full suite command | `npm test` (runs all test files) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CALL-01 | CALL_NEXT dequeues head and updates currentTicket | unit | `npm test -- src/turnero.test.ts` | ✅ (extend existing) |
| CALL-01 | CALL_NEXT on empty queue is a no-op (state unchanged) | unit | `npm test -- src/turnero.test.ts` | ✅ (extend existing) |
| CALL-01 | CALL_NEXT replaces existing currentTicket (replace-always) | unit | `npm test -- src/turnero.test.ts` | ✅ (extend existing) |
| CALL-01 | Button click dispatches CALL_NEXT and card shows new ticket | integration | `npm test -- src/App.test.tsx` | ✅ (extend existing) |
| CALL-02 | Empty-queue warning appears immediately on click | integration | `npm test -- src/App.test.tsx` | ✅ (extend existing) |
| CALL-02 | Empty-queue warning auto-dismisses after 2 seconds | integration | `npm test -- src/App.test.tsx` | ✅ (extend existing) |
| WR-01 | showWarning clears when ventanilla.currentTicket changes to null | integration | `npm test -- src/App.test.tsx` | ✅ (extend existing) |
| WR-02 | REMOVE_WINDOW is no-op when currentTicket is non-null (reducer) | unit | `npm test -- src/turnero.test.ts` | ✅ (extend existing) |

### Sampling Rate

- **Per task commit:** `npm test`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

None — existing test infrastructure (`vitest run`, `@testing-library/react`, `App.test.tsx`, `turnero.test.ts`) covers all Phase 4 requirements. No new test files, fixtures, or framework installs needed. Red tests are written in Plan 01 as the first task.

---

## Security Domain

> `security_enforcement` not set to false in config — section required.

This phase introduces no network endpoints, user text input, external data sources, or authentication surfaces. The only state changes are in-memory array mutations within a single-browser React reducer.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No users, no auth (project constraint) |
| V3 Session Management | No | No sessions (single-page, no backend) |
| V4 Access Control | No | No roles or permissions |
| V5 Input Validation | No | No user text input in this phase; ticket numbers are auto-generated integers from `nextNumber` counter |
| V6 Cryptography | No | No sensitive data stored or transmitted |

### Known Threat Patterns for React Reducer (client-only)

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| State drift from stale closure | Tampering | `useReducer` + prop-based `isQueueEmpty` ensures component always reads latest state; no stale closure on queue length |
| Accidental ticket loss from REMOVE_WINDOW | Information Disclosure / Data Loss | WR-02 reducer guard (D-11) prevents silent discard of active tickets |
| Timer leak on unmount | Denial of Service (local) | `useEffect` cleanup with `clearTimeout` prevents dangling timers |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `act()` must wrap `vi.advanceTimersByTime()` when the timer callback calls a React state setter | Pattern 4, Pitfall 1 | Tests may pass or fail inconsistently depending on Vitest/RTL version; risk is test flakiness, not production bug |
| A2 | `act` should be imported from `'react'` (not `'react-dom/test-utils'`) in Vitest + RTL 16.x context | State of the Art | Import from wrong package causes deprecation warning; functional import path exists in both locations as of React 18+ |
| A3 | `rerender()` from RTL correctly simulates prop change for WR-01 test | Pattern 5 | If rerender doesn't trigger useEffect, WR-01 test fails; mitigation: RTL rerender is documented as equivalent to parent re-render |
| A4 | `isQueueEmpty: boolean` is the correct additional prop name for VentanillaCard | Architecture Patterns (Pattern 3) | Planner may choose a different name; no functional risk, only naming convention |
| A5 | `useEffect` dep array `[showEmptyWarning]` correctly re-runs the timer effect each time the warning is set to true | Pattern 3 | If dep array is wrong (empty or too broad), timer either never fires or fires too often; unit test will catch this |

---

## Sources

### Primary (HIGH confidence)
- `src/turnero.ts` (repo) — current QueueState, QueueAction union, reducer structure; VERIFIED by direct file read
- `src/App.tsx` (repo) — VentanillaCard component, showWarning pattern, Readonly props; VERIFIED by direct file read
- `src/turnero.test.ts` (repo) — existing test structure, naming conventions; VERIFIED by direct file read
- `src/App.test.tsx` (repo) — existing integration test structure; VERIFIED by direct file read
- `.planning/phases/03-configurable-ventanillas/03-REVIEW.md` (repo) — WR-01 and WR-02 exact fix descriptions; VERIFIED by direct file read
- `.planning/phases/04-call-next-atomic-dequeue/04-CONTEXT.md` (repo) — all locked decisions; VERIFIED by direct file read
- `package.json` (repo) — installed package versions; VERIFIED by direct file read

### Secondary (MEDIUM confidence)
- JavaScript event loop serialization model — well-established platform behavior; the single-threaded nature of JS is specified in the ECMAScript standard [ASSUMED — training knowledge, extremely high confidence]

### Tertiary (LOW confidence — flagged in Assumptions Log)
- `act()` import path from `'react'` vs `'react-dom/test-utils'` — training knowledge, aligns with React 18+ docs direction [ASSUMED — A2]
- `vi.advanceTimersByTime` + `act()` interaction in Vitest 4.x / RTL 16.x — training knowledge [ASSUMED — A1]

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; all verified from package.json
- Architecture patterns: HIGH — derived directly from existing codebase patterns; CALL_NEXT is the natural extension of established reducer pattern
- Atomicity analysis: HIGH — JS event loop is a platform guarantee, not a library feature
- Fake timer test patterns: MEDIUM — training knowledge, not verified against Context7 or Vitest 4.x docs directly
- WR-01/WR-02 fix patterns: HIGH — directly specified in 03-REVIEW.md and locked in CONTEXT.md

**Research date:** 2026-07-07
**Valid until:** 2026-08-07 (stable domain; React 19 + Vitest 4 are not moving fast enough to invalidate within 30 days)
