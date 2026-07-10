---
phase: 04-call-next-atomic-dequeue
reviewed: 2026-07-07T00:00:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - src/turnero.ts
  - src/turnero.test.ts
  - src/App.tsx
  - src/App.test.tsx
  - src/index.css
findings:
  critical: 1
  warning: 3
  info: 2
  total: 6
status: issues_found
---

# Phase 04: Code Review Report

**Reviewed:** 2026-07-07
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

Reviewed the five files introduced/modified in the `04-call-next-atomic-dequeue` phase. The reducer logic for `ADD_TICKET`, `ADD_WINDOW`, `REMOVE_WINDOW`, and `CALL_NEXT` is structurally sound and correctly handles the primary happy-path flows tested by the test suite. The React component wiring (dispatch callbacks, `isQueueEmpty` guard, auto-dismiss timer) is also correct.

One data-loss defect was found in the `CALL_NEXT` reducer: a ticket is silently destroyed whenever `windowId` does not match any existing ventanilla. Three additional warnings cover a spurious re-render in `REMOVE_WINDOW`, absent `disabled` attributes on action buttons, and missing localStorage persistence (an explicit architecture requirement in CLAUDE.md). Two info items cover minor test-naming duplication and a remove-button accessibility gap.

---

## Critical Issues

### CR-01: `CALL_NEXT` silently destroys a ticket when `windowId` does not match any ventanilla

**File:** `src/turnero.ts:86-98`

**Issue:** The reducer unconditionally dequeues the head ticket before it checks whether `action.windowId` resolves to a ventanilla. The `.map()` call leaves every ventanilla unchanged when no `v.id === action.windowId` match is found, while `queue: remainingQueue` still removes the ticket from the queue. The ticket is no longer in the queue and was never assigned to any window — it is permanently gone with no error, no return of `state`, and no TypeScript-visible signal.

Although the current UI always derives the `windowId` from an existing ventanilla's `.id`, the reducer is an exported public function. A stale dispatch (e.g., after a future optimistic update, a test with a typo'd id, or a direct reducer call) would trigger silent data loss.

```ts
// Current — ticket is lost if windowId is invalid
case 'CALL_NEXT': {
  if (state.queue.length === 0) return state
  const [nextTicket, ...remainingQueue] = state.queue
  return {
    ...state,
    queue: remainingQueue,        // ← removed unconditionally
    ventanillas: state.ventanillas.map((v) =>
      v.id === action.windowId
        ? { ...v, currentTicket: nextTicket }
        : v                       // ← no match → ticket is gone
    ),
  }
}
```

**Fix:** Guard against an unresolvable `windowId` before dequeuing. Return `state` unchanged (same pattern already used for empty-queue).

```ts
case 'CALL_NEXT': {
  if (state.queue.length === 0) return state
  const windowExists = state.ventanillas.some((v) => v.id === action.windowId)
  if (!windowExists) return state            // guard: unknown windowId → no-op
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

A companion test should be added to `turnero.test.ts`:

```ts
it('CALL-01-D: CALL_NEXT with invalid windowId is a no-op and does not dequeue', () => {
  let state = queueReducer(initialState, { type: 'ADD_TICKET' })
  const before = state
  state = queueReducer(state, { type: 'CALL_NEXT', windowId: 999 })
  expect(state).toBe(before)
  expect(state.queue).toHaveLength(1)
})
```

---

## Warnings

### WR-01: `REMOVE_WINDOW` with a non-existent `id` allocates a new state object unnecessarily

**File:** `src/turnero.ts:76-84`

**Issue:** When `action.id` does not match any ventanilla, `state.ventanillas.find()` returns `undefined`. The guard condition `target !== undefined && target.currentTicket !== null` evaluates to `false`, so execution falls through to the `filter`. The filter produces a new array with the same elements (nothing to remove), and the spread returns a new `QueueState` object. React sees a reference change, triggers a re-render, and every `VentanillaCard` re-evaluates — all for a no-op dispatch.

```ts
// Current — falls through to filter even when id is not found
case 'REMOVE_WINDOW': {
  const target = state.ventanillas.find((v) => v.id === action.id)
  if (target !== undefined && target.currentTicket !== null) {
    return state
  }
  return {
    ...state,
    ventanillas: state.ventanillas.filter((v) => v.id !== action.id),
  }
}
```

**Fix:** Return `state` immediately when `target` is `undefined`.

```ts
case 'REMOVE_WINDOW': {
  const target = state.ventanillas.find((v) => v.id === action.id)
  if (target === undefined) return state                        // unknown id → no-op
  if (target.currentTicket !== null) return state              // active ticket guard
  return {
    ...state,
    ventanillas: state.ventanillas.filter((v) => v.id !== action.id),
  }
}
```

---

### WR-02: Action buttons lack `disabled` attribute — accessibility and interaction contract gap

**File:** `src/App.tsx:66` (Llamar siguiente), `src/App.tsx:52-59` (remove button implied)

**Issue:** The "Llamar siguiente" button has no `disabled` prop when `isQueueEmpty` is `true`. A user receives no visual affordance that the button is inoperable until after they click it and a warning appears. Screen readers and keyboard users cannot determine the button's state from the HTML alone (`aria-disabled` or `disabled` is absent). The same pattern applies to the remove button (×) when `currentTicket !== null`.

```tsx
{/* Current — no disabled attribute */}
<button type="button" className="call-next-button" onClick={handleCallNext}>
  Llamar siguiente
</button>
```

**Fix:** Add `disabled` when the action cannot proceed, and add a CSS rule for the disabled visual state.

```tsx
<button
  type="button"
  className="call-next-button"
  onClick={handleCallNext}
  disabled={isQueueEmpty}
>
  Llamar siguiente
</button>
```

```css
/* index.css — add visual feedback */
.call-next-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
```

When `disabled` is set, `onClick` is not invoked by the browser, so the `handleCallNext` empty-queue branch becomes a dead code path and can be simplified or removed.

---

### WR-03: `localStorage` persistence not implemented despite being an explicit architecture requirement

**File:** `src/App.tsx:82`

**Issue:** CLAUDE.md specifies "toda la lógica y estado viven en el cliente, usando localStorage para persistencia." The `useReducer` is initialized from the bare `initialState` constant with no hydration from `localStorage`, and there is no `useEffect` that writes state changes back. A page refresh or tab close destroys the entire queue, all ventanilla assignments, and the ticket counter — including tickets that are currently waiting and have been physically handed to patients.

```tsx
// Current — state is ephemeral; lost on refresh
const [state, dispatch] = useReducer(queueReducer, initialState)
```

**Fix:** Wrap initialization and persistence in a custom hook (as recommended in CLAUDE.md). Minimal implementation:

```ts
// src/useLocalStorage.ts
import { useReducer, useEffect } from 'react'
import { queueReducer, initialState, QueueState, QueueAction } from './turnero'

const STORAGE_KEY = 'turnero-state'

function loadState(): QueueState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as QueueState) : initialState
  } catch {
    return initialState
  }
}

export function useTurnero(): [QueueState, React.Dispatch<QueueAction>] {
  const [state, dispatch] = useReducer(queueReducer, undefined, loadState)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])
  return [state, dispatch]
}
```

Then in `App.tsx` replace `useReducer(queueReducer, initialState)` with `useTurnero()`.

---

## Info

### IN-01: Duplicate describe-block name `WINDOW-03` across test files causes misleading reporter output

**File:** `src/turnero.test.ts:72`, `src/App.test.tsx:4`

**Issue:** Both files declare `describe('WINDOW-03: Per-window current ticket display', ...)`. Test runners (Vitest, Jest) do not namespace by file in default summary output, so both suites appear under the same label. If one fails, the reporter makes it ambiguous which file is at fault.

**Fix:** Rename the `App.test.tsx` describe block to distinguish the layer under test:

```ts
// App.test.tsx
describe('WINDOW-03-UI: VentanillaCard renders "sin turno" when currentTicket is null', () => {
```

---

### IN-02: No test exercises `CALL_NEXT` with an invalid `windowId`

**File:** `src/turnero.test.ts` (missing test)

**Issue:** The data-loss path identified in CR-01 has zero test coverage. All `CALL_NEXT` tests use `windowId: 1`, which always resolves. Even after the guard fix in CR-01 is applied, the absence of a test means this invariant is unverified and could regress silently.

**Fix:** Add the test shown in CR-01's fix suggestion (CALL-01-D) to the `CALL-01` describe block in `src/turnero.test.ts`.

---

_Reviewed: 2026-07-07_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
