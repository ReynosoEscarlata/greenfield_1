---
phase: 06-call-transition-animation
reviewed: 2026-07-07T00:00:00Z
depth: standard
files_reviewed: 3
files_reviewed_list:
  - src/App.test.tsx
  - src/index.css
  - src/App.tsx
findings:
  critical: 0
  warning: 3
  info: 2
  total: 5
status: issues_found
---

# Phase 6: Code Review Report

**Reviewed:** 2026-07-07
**Depth:** standard
**Files Reviewed:** 3
**Status:** issues_found

## Summary

Phase 6 adds a CSS flash animation to the ticket display in `VentanillaCard` using the `key`-prop remount trick. The implementation is small and follows the UI spec closely. No critical bugs were found.

Three warnings are raised: a latent CSS-behavior misunderstanding in the design spec that will cause spurious animations once localStorage is added (the spec claims first-mount does not fire the animation, but CSS does not agree), missing localStorage persistence that is an explicit CLAUDE.md architectural requirement, and two warning states that are never mutually exclusive. Two info items cover a minor CSS interpolation technicality and a border-radius inconsistency between ticket states.

---

## Warnings

### WR-01: CSS animation fires on first mount — D-06 spec claim is incorrect

**File:** `src/App.tsx:65-70` / `src/index.css:124-136`

**Issue:** The UI spec behavior table (06-UI-SPEC.md, D-06) asserts:

> "page load / reload with ticket — Animation fires: **no** (first mount has no prior key)"

This is factually wrong about how CSS animations work. A `@keyframes` animation fires whenever an element carrying the animation class is **inserted into the DOM**, regardless of whether the insertion is a remount triggered by a key change or the very first mount. There is no "prior key" concept in CSS — only DOM insertion.

The code is currently safe only because `initialState` always starts with `ventanillas: []`, so no `VentanillaCard` containing a non-null `currentTicket` is ever first-mounted. The moment localStorage persistence is added (required per CLAUDE.md), hydrated state will contain ventanillas with existing tickets. Each page load will mount those `<p>` elements with `.ventanilla-ticket-flash` active, firing the amber flash and falsely signaling that tickets were "just called."

The FEEDBACK-02 test at `src/App.test.tsx:157-166` locks in and validates this broken behavior by asserting the flash class is present on any first render with a non-null ticket, without distinguishing initial mount from ticket-change transition.

**Fix:** Track whether the flash should fire via a counter or a boolean derived from the action, not from the presence of `currentTicket`. One clean approach: pass a `flashKey` prop (an ever-incrementing integer, incremented in `CALL_NEXT`) separate from the ticket's `id`. The `<p>` key becomes `flashKey`, and the flash class is applied only when `flashKey > 0` AND `ventanilla.currentTicket !== null`. On first render with hydrated state, `flashKey` remains at its persisted value — no new key change, no remount, no animation.

```tsx
// In App: track flashKey per ventanilla in reducer state
// Pass it down: <VentanillaCard flashKey={v.flashKey} .../>

<p
  key={flashKey}
  className={
    flashKey > 0 && ventanilla.currentTicket !== null
      ? 'ventanilla-ticket ventanilla-ticket-flash'
      : 'ventanilla-ticket'
  }
>
```

Update FEEDBACK-02 tests to render with `flashKey={0}` (initial) and `flashKey={1}` (after a call) to distinguish the two states.

---

### WR-02: No localStorage persistence despite explicit CLAUDE.md architectural requirement

**File:** `src/App.tsx:92`

**Issue:** `useReducer(queueReducer, initialState)` always starts from the hardcoded empty state. All queue data, ventanilla configuration, and current ticket assignments are discarded on every page refresh.

CLAUDE.md states: *"Arquitectura: Sin backend — toda la lógica y estado viven en el cliente, **usando localStorage para persistencia**."* This is listed as an architectural constraint, not a future enhancement. The app currently fails to meet its own stated requirements.

This is not a phase-6 regression — the gap predates this phase. However it is flagged here because: (a) it is a project-level blocker that is still unresolved; and (b) WR-01 above demonstrates that localStorage hydration will introduce the spurious-animation bug unless the flash trigger mechanism is corrected first.

**Fix:** Wrap `useReducer` with a custom `useLocalStorage` hook (~20 lines) that reads the initial state from `localStorage` and persists on every dispatch:

```tsx
// Sketch of useLocalStorage wrapper
function usePersistedReducer() {
  const stored = localStorage.getItem('turnero-state')
  const parsed: QueueState = stored ? JSON.parse(stored) : initialState
  const [state, dispatch] = useReducer(queueReducer, parsed)

  useEffect(() => {
    localStorage.setItem('turnero-state', JSON.stringify(state))
  }, [state])

  return [state, dispatch] as const
}
```

Fix WR-01 before adding localStorage so hydrated ventanillas do not trigger spurious flash animations.

---

### WR-03: `showWarning` and `showEmptyWarning` can coexist, showing two stacked errors

**File:** `src/App.tsx:17-18`, `src/App.tsx:79-86`

**Issue:** Two independent boolean states govern two different warning messages inside the same card. No mutual exclusion guard exists. A user can trigger both simultaneously:

1. Ventanilla has an active ticket + queue is empty.
2. Click "Quitar ventanilla" → `showWarning = true` → "No se puede quitar: tiene un turno activo" appears.
3. Click "Llamar siguiente" → `showEmptyWarning = true` → "No hay turnos en espera" appears.
4. Both messages are now visible in the same card at the same time, stacked vertically.

**Fix:** Replace the two booleans with a single discriminated state:

```tsx
type WarningState = 'none' | 'has-ticket' | 'empty-queue'
const [warning, setWarning] = useState<WarningState>('none')

// In handleRemove:
if (ventanilla.currentTicket !== null) {
  setWarning('has-ticket')
  return
}
setWarning('none')
onRemove(ventanilla.id)

// In handleCallNext:
if (queueLength === 0) {
  setWarning('empty-queue')
  return
}

// In JSX — single conditional render:
{warning === 'has-ticket' && (
  <p className="ventanilla-warning">No se puede quitar: tiene un turno activo</p>
)}
{warning === 'empty-queue' && (
  <p className="ventanilla-warning">No hay turnos en espera</p>
)}
```

The auto-dismiss `useEffect` should target `warning === 'empty-queue'` instead of `showEmptyWarning`. The WR-01 `useEffect` should clear the state by calling `setWarning('none')`.

---

## Info

### IN-01: CSS `transparent` endpoint introduces a black-tinted midpoint

**File:** `src/index.css:129`

**Issue:** `transparent` in CSS equals `rgba(0, 0, 0, 0)`. Interpolating from `#fbbf24` (opaque amber) to `rgba(0,0,0,0)` mixes amber with black at the midpoint, producing a slightly desaturated/dark intermediate frame. On the `#f1f3f5` card background this is almost imperceptible at 600ms, but it is technically incorrect for a pure color fade.

**Fix:** Use a transparent version of the same amber instead:

```css
@keyframes ticket-flash {
  from { background-color: #fbbf24; }
  to   { background-color: rgba(251, 191, 36, 0); }
}
```

This preserves hue through the full animation and fades only the alpha channel.

---

### IN-02: `border-radius: 4px` lives only on `.ventanilla-ticket-flash`, not the base class

**File:** `src/index.css:136`

**Issue:** The rounded corners are defined only in `.ventanilla-ticket-flash`, so the "sin turno" state (`currentTicket === null`) renders with no `border-radius`. If any future focus ring, outline, or background is applied to `.ventanilla-ticket` uniformly (e.g., for keyboard navigation accessibility), the shape will be inconsistent between the two states.

**Fix:** Move `border-radius: 4px` to `.ventanilla-ticket`:

```css
.ventanilla-ticket {
  font-size: 16px;
  font-weight: 400;
  color: #1f2933;
  margin: 0;
  border-radius: 4px;   /* moved here */
}

.ventanilla-ticket-flash {
  animation: ticket-flash 600ms ease-out forwards;
  /* border-radius removed — inherited from base */
}
```

---

_Reviewed: 2026-07-07_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
