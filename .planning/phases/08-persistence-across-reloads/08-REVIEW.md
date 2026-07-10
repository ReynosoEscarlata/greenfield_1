---
phase: 08-persistence-across-reloads
reviewed: 2026-07-09T00:00:00Z
depth: standard
files_reviewed: 2
files_reviewed_list:
  - src/App.tsx
  - src/App.test.tsx
findings:
  critical: 1
  warning: 2
  info: 1
  total: 4
status: issues_found
---

# Phase 08: Code Review Report

**Reviewed:** 2026-07-09
**Depth:** standard
**Files Reviewed:** 2
**Status:** issues_found

## Summary

Reviewed the persistence implementation added in phase 08: the `loadFromStorage` lazy initializer wired into `useReducer`, the `useEffect` write-back, and the full PERSIST-01 test suite. The core persistence loop (load → render → write on change) is structurally sound and uses the correct `useReducer` third-argument lazy initializer pattern. However, a gap in the error-handling strategy in `loadFromStorage` can produce an unrecoverable crash, and the test mock setup uses a pattern that Vitest's own documentation flags as unreliable.

---

## Critical Issues

### CR-01: `loadFromStorage` silent type-cast lets structurally invalid JSON crash the render

**File:** `src/App.tsx:91-97`

**Issue:** The `try/catch` in `loadFromStorage` only catches `JSON.parse` syntax errors. If `localStorage['turnero-v1']` contains syntactically valid JSON that does not match `QueueState` (e.g., `{}`, `{"queue": null}`, or a value written by a prior app version with a different schema), `JSON.parse` succeeds and the value is returned via an unchecked `as QueueState` cast. TypeScript `as` casts have no runtime effect — they are erased at compile time. The caller (`App`) then holds a `state` object whose `queue` and/or `ventanillas` fields are `undefined`. The very next render accesses `state.queue.length` (line 117) and `state.queue.map(...)` (line 121), throwing an uncaught `TypeError: Cannot read properties of undefined`. React has no error boundary in this codebase, so the result is a fully blank screen with no recovery path short of the user manually clearing DevTools storage.

Scenarios that trigger this today:
- User opens DevTools and sets `localStorage['turnero-v1'] = '{}'`
- A future version of the app adds a required `QueueState` field without migrating old stored values

The existing tests (SC-2a, SC-2b) only cover missing-key and invalid-JSON cases, leaving the valid-but-wrong-shape path untested and unprotected.

**Fix:** Validate the critical fields before trusting the parsed value. The simplest safe pattern:

```typescript
function loadFromStorage(): QueueState {
  try {
    const raw = localStorage.getItem('turnero-v1')
    if (!raw) return initialState
    const parsed = JSON.parse(raw) as QueueState
    // Guard the two fields that are accessed directly in the render path.
    if (!Array.isArray(parsed.queue) || !Array.isArray(parsed.ventanillas)) {
      return initialState
    }
    return parsed
  } catch {
    return initialState
  }
}
```

A matching test should be added to App.test.tsx:

```typescript
it('SC-2c: falls back to empty state on structurally invalid JSON', () => {
  localStorage.setItem('turnero-v1', JSON.stringify({ queue: null, nextNumber: 1 }))
  render(<App />)
  expect(screen.getByText('Próximos turnos aparecerán aquí')).toBeInTheDocument()
})
```

---

## Warnings

### WR-01: `mockPlay` declared outside `vi.hoisted()` — fragile mock wiring

**File:** `src/App.test.tsx:1-5`

**Issue:** Vitest hoists `vi.mock()` calls to the top of the module, above all `import` statements and variable declarations. The `mockPlay` constant is declared with `const` outside `vi.hoisted()`:

```typescript
const mockPlay = vi.fn()          // line 1 — runs AFTER vi.mock hoisting
vi.mock('./useBeep', () => ({     // line 3 — hoisted to top of file
  useBeep: () => ({ play: mockPlay }),
}))
```

The inner `() => ({ play: mockPlay })` is a nested arrow function evaluated lazily (at call time, when the component invokes `useBeep()`). By that point in test execution `mockPlay` has already been assigned, so the tests pass today. However, Vitest's own documentation explicitly states:

> "You cannot use variables inside a factory that are defined outside of it. Vitest will warn you about this. To avoid this, use `vi.hoisted` method."

The pattern is fragile: any refactor that causes the factory to evaluate `mockPlay` eagerly (e.g., moving the property out of the nested function), or a Vitest version change that alters hoisting behaviour, silently returns `{ play: undefined }` from `useBeep()`. The component would then throw when it calls `play()`, and the `mockPlay` assertions would all fail with confusing errors.

**Fix:** Use `vi.hoisted()`, the API designed for exactly this:

```typescript
const mockPlay = vi.hoisted(() => vi.fn())

vi.mock('./useBeep', () => ({
  useBeep: () => ({ play: mockPlay }),
}))
```

---

### WR-02: `?? ''` fallback in `loadFromStorage` silently swallows the absent-key case via a thrown exception

**File:** `src/App.tsx:93`

**Issue:** The missing-key case is handled by coalescing `null` to `''` and relying on `JSON.parse('')` to throw a `SyntaxError`, which the `catch` block intercepts:

```typescript
return JSON.parse(localStorage.getItem('turnero-v1') ?? '') as QueueState
```

This works, but it is non-obvious: the fallback is triggered not by an explicit early return but by a deliberate exception as flow control. A reader (or future editor) who "fixes" the empty-string coalesce to `'{}'` or `'null'` will produce subtly different behaviour — `JSON.parse('{}')` succeeds and returns a wrong-shape object, converting a safe absent-key scenario into the CR-01 crash path.

**Fix:** Make the intent explicit with an early return:

```typescript
function loadFromStorage(): QueueState {
  try {
    const raw = localStorage.getItem('turnero-v1')
    if (!raw) return initialState                     // explicit: key absent
    const parsed = JSON.parse(raw) as QueueState
    if (!Array.isArray(parsed.queue) || !Array.isArray(parsed.ventanillas)) {
      return initialState                              // explicit: wrong shape
    }
    return parsed
  } catch {
    return initialState                                // explicit: bad JSON
  }
}
```

(This also resolves CR-01 in one pass.)

---

## Info

### IN-01: PRIVACY-01 tests are tautological — they always pass regardless of component output

**File:** `src/App.test.tsx:206-232`

**Issue:** Both PRIVACY-01 tests assert that `screen.queryByTestId('patient-name')` returns `null`. The component under test (`VentanillaCard`) never renders any element with `data-testid="patient-name"` under any prop combination, so these assertions can never fail no matter what the component does. They would also pass if the component rendered sensitive patient data under a different test ID or as unlabelled text.

```typescript
// This always passes — the tested element is never rendered by any path in VentanillaCard
expect(screen.queryByTestId('patient-name')).not.toBeInTheDocument()
```

**Fix:** Replace with assertions that actually verify the output is limited to the expected text, e.g.:

```typescript
// Positive: confirm only the ticket number text is present
const ticketEl = screen.getByText('Turno 42')
expect(ticketEl.textContent).toBe('Turno 42')
// Negative: confirm no name-like content appears anywhere in the card
const card = ticketEl.closest('.ventanilla-card')!
expect(card.textContent).not.toMatch(/[A-ZÀ-Ú][a-záéíóú]+\s[A-ZÀ-Ú]/) // surname pattern
```

Alternatively, document the intent of these tests more clearly so it is understood that they are specification anchors, not behavioural proofs.

---

_Reviewed: 2026-07-09_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
