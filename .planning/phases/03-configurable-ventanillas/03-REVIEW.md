---
phase: 03-configurable-ventanillas
reviewed: 2026-07-07T00:00:00Z
depth: standard
files_reviewed: 6
files_reviewed_list:
  - src/turnero.ts
  - src/turnero.test.ts
  - src/App.tsx
  - src/App.test.tsx
  - src/index.css
  - package.json
findings:
  critical: 1
  warning: 2
  info: 2
  total: 5
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-07-07
**Depth:** standard
**Files Reviewed:** 6
**Status:** issues_found

## Summary

Phase 3 delivers configurable ventanillas (add/remove windows) via a `useReducer`-based state model and a `VentanillaCard` component with a UI-layer removal guard. The reducer logic, counter invariants, and test coverage for the new actions are correct. One architectural requirement from `CLAUDE.md` is missing entirely (localStorage persistence), one component has a latent state-staleness bug that will manifest in Phase 4, and the removal guard has no defense-in-depth at the reducer level.

---

## Critical Issues

### CR-01: State is never persisted to localStorage

**File:** `src/App.tsx:49`

**Issue:** `CLAUDE.md` explicitly states the architecture as "toda la lógica y estado viven en el cliente, usando localStorage para persistencia." The `App` component uses bare `useReducer(queueReducer, initialState)` with no `useEffect` to write state and no localStorage initialization. Every browser refresh or tab close resets the queue and all ventanilla configuration to `initialState`. This is a direct violation of the stated architectural constraint and the project's persistence requirement.

**Fix:** Introduce a `useLocalStorage`-backed initializer and a write effect. A minimal pattern consistent with the project's "hand-written hook (~15-20 lines)" guidance:

```typescript
// src/useLocalStorage.ts
import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, defaultValue: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw !== null ? (JSON.parse(raw) as T) : defaultValue
    } catch {
      return defaultValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // localStorage unavailable (private mode quota) — degrade silently
    }
  }, [key, value])

  return [value, setValue]
}
```

Then in `App.tsx`, replace:
```tsx
const [state, dispatch] = useReducer(queueReducer, initialState)
```
with a reducer that uses persisted initial state, or wrap the reducer output with the hook. A common pattern:
```tsx
const [persistedState, setPersistedState] = useLocalStorage('turnero', initialState)
const [state, dispatch] = useReducer(queueReducer, persistedState)

useEffect(() => {
  setPersistedState(state)
}, [state])
```

---

## Warnings

### WR-01: `showWarning` local state becomes stale when `currentTicket` is cleared externally

**File:** `src/App.tsx:12-44`

**Issue:** `VentanillaCard` holds `showWarning` as independent component state. The warning is set to `true` when `ventanilla.currentTicket !== null` and the user clicks Remove. However, there is no reset path that fires when the parent `ventanilla` prop changes from an active ticket back to `null` (which Phase 4's `CALL_NEXT` / "finish serving" flow will do). After that prop change the component re-renders with `currentTicket === null` but `showWarning` remains `true`, causing the message "No se puede quitar: tiene un turno activo" to be displayed persistently and incorrectly even though there is no active ticket. The remove button would visually say one thing while the underlying state says another.

**Fix:** Derive the warning display from `ventanilla.currentTicket` state directly, or reset local state in an effect:

```tsx
// Option A — derive from prop (eliminates the stale-state class entirely):
{ventanilla.currentTicket !== null && showWarning && (
  <p className="ventanilla-warning">
    No se puede quitar: tiene un turno activo
  </p>
)}

// Option B — reset via useEffect when ticket is cleared:
useEffect(() => {
  if (ventanilla.currentTicket === null) {
    setShowWarning(false)
  }
}, [ventanilla.currentTicket])
```

Option A is preferred — it removes the redundant boolean and keeps the truth source in the prop.

---

### WR-02: REMOVE_WINDOW has no reducer-level guard — active ticket is silently discarded

**File:** `src/turnero.ts:76-82`

**Issue:** The comment explicitly documents this design choice: "Removes unconditionally — the WINDOW-02 guard lives in VentanillaCard (UI layer)." However, this creates a data-loss risk with no defense in depth. Any non-UI dispatch of `REMOVE_WINDOW` — including React DevTools state manipulation, programmatic dispatch from a future feature (e.g., "remove all idle windows"), or a bug that bypasses `VentanillaCard` — will silently drop the `currentTicket` reference on the window. The ticket is not returned to the queue and is not shown anywhere; it disappears permanently. Phase 4 (CALL_NEXT) will make `currentTicket` non-null in normal operation, making this risk concrete rather than theoretical.

**Fix:** Add an early-return guard in the reducer:

```typescript
case 'REMOVE_WINDOW': {
  const target = state.ventanillas.find((v) => v.id === action.id)
  // Guard: refuse to remove a window that is actively serving a ticket.
  // The UI layer (VentanillaCard) enforces the same rule, but the reducer
  // is the authoritative state machine and should not trust call sites.
  if (target?.currentTicket !== null && target?.currentTicket !== undefined) {
    return state // no-op: data-loss prevention
  }
  return {
    ...state,
    ventanillas: state.ventanillas.filter((v) => v.id !== action.id),
  }
}
```

A corresponding test should be added to `turnero.test.ts` verifying that `REMOVE_WINDOW` on a window with an active `currentTicket` is a no-op.

---

## Info

### IN-01: CALL_NEXT action and "Llamar siguiente" button are absent

**File:** `src/turnero.ts:35`, `src/App.tsx`

**Issue:** The `CLAUDE.md` core value is "Que cualquier ventanilla pueda llamar al siguiente turno de la cola compartida." There is no `CALL_NEXT` action in the reducer and no "Llamar siguiente" button in any ventanilla. The code comments mark this as a Phase 4 extension point — noted here as a tracking item, not a defect in Phase 3 scope.

**Fix:** Implement in Phase 4: add `{ type: 'CALL_NEXT'; windowId: number }` to `QueueAction`, handle in `queueReducer` (shift from `queue`, assign to matching ventanilla's `currentTicket`), and add the button to `VentanillaCard`.

---

### IN-02: Remove button touch target is too small for mobile use

**File:** `src/index.css:124-135`

**Issue:** `.ventanilla-remove` is styled with `padding: 0` and `font-size: 18px`. The effective tap target is approximately 18×18px — far below the WCAG 2.5.5 recommended 44×44px minimum. On a touch device this button is very difficult to hit accurately, especially since it is positioned at the card corner near other interactive elements.

**Fix:**

```css
.ventanilla-remove {
  /* existing rules */
  padding: 8px;          /* expands tap target to ~34×34px minimum */
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

_Reviewed: 2026-07-07_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
