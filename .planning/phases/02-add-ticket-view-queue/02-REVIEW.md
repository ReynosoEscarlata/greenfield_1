---
phase: 02-add-ticket-view-queue
reviewed: 2026-07-06T00:00:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - src/turnero.ts
  - src/turnero.test.ts
  - src/setupTests.ts
  - src/App.tsx
  - src/index.css
findings:
  critical: 0
  warning: 2
  info: 1
  total: 3
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-07-06
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

Five files were reviewed: the core reducer (`turnero.ts`), its unit tests, the test setup shim, the root React component (`App.tsx`), and the global stylesheet (`index.css`).

The reducer logic is correct — `nextNumber` is genuinely independent of `queue.length`, the pure-function invariant is maintained, and the tests verify the right behaviour. No bugs exist in the business logic layer.

Two issues require attention before subsequent phases build on this foundation. The first is a CSS structural defect that will compound as ventanilla cards are added in Phase 3/4. The second is missing localStorage persistence, which is an explicit project constraint (CLAUDE.md) and will cause regressions in any manual QA or demo session that involves a page reload.

---

## Warnings

### WR-01: `.ventanillas-grid > *` selector applies card styling to the section heading

**File:** `src/index.css:55-58`

**Issue:** The wildcard child selector `.ventanillas-grid > *` targets every direct child of the section, including the `<h2>` "Ventanillas" heading rendered in `App.tsx:32`. This applies `background: #f1f3f5` and `padding: 16px` to the heading, making it render as a grey card tile rather than a section label. The `<p>` placeholder on `App.tsx:33` receives the same treatment. When real ventanilla card elements are added in a later phase they will be correctly styled, but the heading will remain a misfit grid item with card appearance unless the selector is tightened.

**Fix:** Scope the card style to intentional card elements only. Two clean options:

Option A — add a dedicated card class and target it:
```css
/* index.css */
.ventanilla-card {
  background: #f1f3f5;
  padding: 16px;
}
```
```tsx
// App.tsx — future ventanilla card
<div className="ventanilla-card">…</div>
```

Option B — keep the wildcard but exclude headings with `:not`:
```css
.ventanillas-grid > *:not(h2) {
  background: #f1f3f5;
  padding: 16px;
}
```

Option A is preferable because it makes the intent explicit and does not need to grow an exclusion list as more non-card elements (legends, labels) are added.

---

### WR-02: No localStorage persistence — queue state is lost on page reload

**File:** `src/App.tsx:5`

**Issue:** `useReducer(queueReducer, initialState)` keeps all state in React's in-memory tree. The CLAUDE.md constraint explicitly requires "localStorage para persistencia" as part of the client-only architecture. Any page refresh resets `queue` to `[]` and `nextNumber` to `1`. This is reproducible in the current build and will surface immediately in any manual demo or QA pass.

**Fix:** Replace the bare `useReducer` call with a persistence-aware initialiser. A minimal inline approach:

```tsx
// App.tsx
import { useReducer, useEffect } from 'react'
import { queueReducer, initialState, QueueState } from './turnero'

const STORAGE_KEY = 'turnero-state'

function loadState(): QueueState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState
    return JSON.parse(raw) as QueueState
  } catch {
    return initialState
  }
}

function App() {
  const [state, dispatch] = useReducer(queueReducer, undefined, loadState)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  // …rest of JSX unchanged
}
```

The lazy initialiser form of `useReducer` (`useReducer(reducer, undefined, init)`) is used so `loadState` runs once on mount, not on every render. The `useEffect` writes back on every state change. The `try/catch` in `loadState` guards against corrupted or malformed JSON that would otherwise crash the app silently.

---

## Info

### IN-01: `initialState` is a mutable exported object — shared reference risk in test suites

**File:** `src/turnero.ts:23-26`

**Issue:** `initialState` is exported as a plain `const` object. The reducer never mutates it (all paths use spread), so the current tests are safe. However, as the test suite grows, any helper or test that directly pushes to `initialState.queue` (e.g., to set up a pre-populated scenario without going through `queueReducer`) would silently corrupt the shared reference and cause difficult-to-diagnose cross-test contamination.

**Fix:** Freeze the object at declaration time to make direct mutation a loud runtime error rather than a silent bug:
```ts
export const initialState: QueueState = Object.freeze({
  queue: Object.freeze([]) as Ticket[],
  nextNumber: 1,
}) as QueueState
```

Alternatively, export a factory function:
```ts
export function makeInitialState(): QueueState {
  return { queue: [], nextNumber: 1 }
}
```
and update `App.tsx` and tests to call it. The factory approach avoids `Object.freeze` type-widening awkwardness and is idiomatic when state will eventually be re-initialised (e.g., a "reset queue" feature).

---

_Reviewed: 2026-07-06_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
