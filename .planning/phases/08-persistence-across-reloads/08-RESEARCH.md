# Phase 8: Persistence Across Reloads - Research

**Researched:** 2026-07-09
**Domain:** React useReducer lazy initializer + localStorage + Vitest/jsdom test patterns
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Silent reset — when localStorage data is missing or fails to parse, fall back to `initialState` with no user-facing notice.
- **D-02:** Use `"turnero-v1"` as the localStorage key.
- **D-03:** JSON.parse try/catch only. If `JSON.parse` throws (SyntaxError), fall back to `initialState`. No structural shape check needed.

### Claude's Discretion
*(None explicitly listed — all major decisions were locked in the discuss phase.)*

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PERSIST-01 | Queue + ventanilla state persists in localStorage; recovers defensively from corrupted/absent data; no beep or flash animation fires on reload | Lazy initializer pattern (hydration), useEffect save pattern (persistence), corruption recovery pattern (D-01/D-03), and test patterns for all three success criteria documented below |
</phase_requirements>

---

## Summary

Phase 8 wires the existing `QueueState` (4 fields: `queue`, `nextNumber`, `ventanillas`, `nextWindowNumber`) to `localStorage` with two mechanisms: a **lazy initializer** as the third argument to `useReducer` (hydrates on mount, reads localStorage once) and a **`useEffect([state])`** (saves on every state change). Both mechanisms live entirely in `src/App.tsx` — no other files need to change.

The locked decisions (D-01 through D-03) constrain the implementation to a minimal `try/catch` around `JSON.parse`. There is no structural validation of the parsed data and no user-facing error message on corruption. The `"turnero-v1"` key supports future clean invalidation by bumping the suffix rather than relying on corruption recovery.

The no-beep regression (ROADMAP criterion 3) is safe by design: `playBeep()` is called only inside `handleCallNext()` in `VentanillaCard`, which runs only from a user click — never from state hydration. The flash class (`ventanilla-ticket-flash`) is and was always applied whenever `currentTicket !== null` (Phase 6 design). On page reload with a persisted non-null ticket the flash animation plays once as the element mounts — this is identical behavior to Phase 6's initial render and is not a new regression. Tests in jsdom can verify no beep fires; they cannot verify CSS animation timing.

**Primary recommendation:** Inline `loadFromStorage()` helper in `App.tsx` (< 10 lines, single call site). Add one `useEffect([state])` in `App()` body. Add a new `describe('PERSIST-01')` block to `App.test.tsx` importing `App` default. No new runtime dependencies.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| State hydration on mount | Browser / Client (React) | — | `useReducer` lazy initializer runs during component initialization; no SSR |
| State persistence on change | Browser / Client (React) | — | `useEffect` runs after every dispatch, writes to browser localStorage |
| Corruption recovery | Browser / Client (logic) | — | `try/catch` in `loadFromStorage()` returns `initialState` on parse failure |
| localStorage I/O | Browser Storage API | — | Native `localStorage.getItem`/`setItem` — no wrapper library per CLAUDE.md |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React `useReducer` (3rd arg) | ^19.2.6 [VERIFIED: official react.dev docs] | Lazy initializer — hydrate state from localStorage on first render without re-running on every render | Official React API; only way to avoid reading localStorage on every render while keeping it as the single source of truth |
| `localStorage` (Web API) | N/A — native browser API | Persist serialized `QueueState` as JSON string | CLAUDE.md explicitly recommends `localStorage.setItem`/`getItem` with `JSON.stringify`/`JSON.parse` over any wrapper library |
| `useEffect` | ^19.2.6 [VERIFIED: official react.dev docs] | Save state to localStorage after every dispatch | Standard React hook for synchronizing state to external storage |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none needed) | — | — | No additional libraries per CLAUDE.md constraint "no new runtime dependencies" |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-written `loadFromStorage()` | `usehooks-ts` `useLocalStorage` | `usehooks-ts` adds a dependency and SSR-safety the project doesn't need; CLAUDE.md §Alternatives Considered explicitly favors the hand-written hook for this scope |
| Native `localStorage` | `localforage` / IndexedDB | `localforage` is for binary/large data beyond the ~5-10MB string limit; this app stores a tiny JSON blob (CLAUDE.md §What NOT to Use) |

**Installation:** No packages to install. Implementation is pure React + Web API.

---

## Package Legitimacy Audit

> Phase 8 installs no new runtime or development packages. All dependencies are already in `package.json`.

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

---

## Architecture Patterns

### System Architecture Diagram

```
Page Load
    │
    ▼
useReducer(queueReducer, undefined, loadFromStorage)
    │                                │
    │              localStorage.getItem('turnero-v1')
    │              JSON.parse(raw)  ─────────► QueueState (success)
    │              catch SyntaxError ─────────► initialState (fallback, D-01/D-03)
    │
    ▼
React renders App with hydrated state
    │
    └──► VentanillaCard (currentTicket read from hydrated state)
              │    No click event fired → playBeep() NOT called (PERSIST-01 SC-3)
              │    Flash class present if currentTicket !== null (Phase 6 behavior, unchanged)
    │
    ▼
useEffect([state]) fires after first render
    │
    └──► localStorage.setItem('turnero-v1', JSON.stringify(state))
              (idempotent on mount — writes back what was just read)
    │
User action (e.g., "Agregar turno")
    │
    ▼
dispatch({ type: 'ADD_TICKET' })
    │
    ▼
queueReducer returns new state object (reference changes)
    │
    ▼
Re-render → useEffect([state]) fires again → localStorage updated ✓
```

### Recommended Project Structure

No new files required. Touch only:
```
src/
├── App.tsx          ← add loadFromStorage() + modify useReducer + add useEffect
├── App.test.tsx     ← add PERSIST-01 describe block (import App default + QueueState type)
└── turnero.ts       ← NO CHANGES
```

If the team prefers to follow the `useBeep.ts` convention (separate file per custom hook/helper), an alternative is:
```
src/
├── useLocalStorage.ts   ← optional: extract loadFromStorage() + saveToStorage() here
├── App.tsx              ← smaller change: import from useLocalStorage.ts
└── App.test.tsx         ← same test additions
```
Either is valid. Inline in `App.tsx` is recommended for this scope (single call site, < 10 lines).

---

### Pattern 1: useReducer Lazy Initializer

**What:** The third argument `init` to `useReducer` is called once on mount with `initialArg` (the second argument) as its only parameter. The return value becomes the initial state.

**When to use:** When computing initial state involves a side effect or expensive operation (e.g., reading localStorage) that should not run on every render.

**Exact syntax change in App.tsx line 92:**

```typescript
// BEFORE (current):
const [state, dispatch] = useReducer(queueReducer, initialState)

// AFTER (Phase 8):
const [state, dispatch] = useReducer(queueReducer, undefined, loadFromStorage)
```

`loadFromStorage` ignores its argument (the `undefined`). Passing `undefined` (not `initialState`) as the second arg signals clearly that the arg is unused.

```typescript
// Source: https://react.dev/reference/react/useReducer#parameters [VERIFIED: official react.dev docs]
// loadFromStorage() — inline in App.tsx (no separate file needed for single call site)
function loadFromStorage(): QueueState {
  try {
    return JSON.parse(localStorage.getItem('turnero-v1') ?? '') as QueueState
  } catch {
    return initialState
  }
}
```

**How `?? ''` handles the "key absent" case:**
- `localStorage.getItem('turnero-v1')` returns `null` when the key doesn't exist
- `null ?? ''` → `''`
- `JSON.parse('')` → throws `SyntaxError` → caught → returns `initialState` ✓

**Known limitation (accepted by D-03):** `JSON.parse('null')` returns JavaScript `null` without throwing. If someone manually sets the storage key to the string `'null'`, `loadFromStorage()` returns `null` (not `QueueState`), and the app would crash on render. This edge case cannot occur from normal app operation. D-03 explicitly accepts this limitation in favor of minimal code.

**React 19 Strict Mode (development only):** The init function is called twice [VERIFIED: official react.dev docs]. Both calls read the same localStorage data (unchanged between calls) and return identical results. Harmless.

---

### Pattern 2: useEffect Save

**What:** A `useEffect` with `[state]` dependency array saves state to localStorage after every dispatch that produces a new state object.

**When to use:** Any time you need to synchronize React state to an external store after every change.

```typescript
// Source: standard React useEffect pattern [ASSUMED: based on training knowledge]
// Add to App() function body, after the useReducer call:
useEffect(() => {
  localStorage.setItem('turnero-v1', JSON.stringify(state))
}, [state])
```

**Why `[state]` is the correct dependency:**
- `queueReducer` always returns a new object reference on any action → `state` reference changes → effect runs ✓
- If state reference doesn't change (e.g., `CALL_NEXT` on empty queue returns same object via `return state`), effect does NOT re-run ✓
- On first render (mount): effect runs once, writes hydrated state back to localStorage (idempotent)

**React 19 Strict Mode:** In development, Strict Mode causes effects to run twice: mount → effect → cleanup (none) → mount → effect. The result is two `localStorage.setItem()` calls on mount with the same data. Both writes are idempotent. [ASSUMED: based on training knowledge — Strict Mode double-invoke behavior. Verified indirectly: existing tests pass under the same Strict Mode conditions used by the project.]

---

### Pattern 3: localStorage in Vitest + jsdom Tests

**What:** jsdom provides a functional `localStorage` implementation globally. Direct `setItem()`/`getItem()` calls work in tests. The storage is shared within a test file and must be cleared between tests.

**Verified behavior:**
- `localStorage.setItem(key, value)` and `localStorage.getItem(key)` work directly in jsdom [VERIFIED: WebSearch — multiple sources confirm direct localStorage calls work in jsdom environment]
- jsdom's localStorage is shared between tests in the same file (not isolated by default)
- Must call `localStorage.clear()` in `beforeEach` to prevent test pollution
- To SPY on localStorage: use `vi.spyOn(Storage.prototype, 'setItem')` (cannot spy on `localStorage` object directly in jsdom) [VERIFIED: WebSearch — consistent across multiple sources]
- Node v22 (project uses v22.23.0) is safe; the Web Storage API conflict issue is with Node v25 [VERIFIED: WebSearch — GitHub issue vitest-dev/vitest#8757]

**Pre-populate pattern (for hydration tests):**
```typescript
beforeEach(() => {
  localStorage.clear()
  mockPlay.mockClear()
})

it('loads persisted state', () => {
  const persisted: QueueState = {
    queue: [{ id: 2, number: 2 }],
    nextNumber: 3,
    ventanillas: [{ id: 1, number: 1, currentTicket: { id: 1, number: 1 } }],
    nextWindowNumber: 2,
  }
  localStorage.setItem('turnero-v1', JSON.stringify(persisted))
  render(<App />)
  expect(screen.getByText('Turno 2')).toBeInTheDocument()
})
```

**Verify-save pattern (for useEffect tests):**
```typescript
it('saves state to localStorage after dispatch', () => {
  render(<App />)
  act(() => {
    fireEvent.click(screen.getByRole('button', { name: /agregar turno/i }))
  })
  const saved = JSON.parse(localStorage.getItem('turnero-v1') ?? 'null')
  expect(saved).not.toBeNull()
  expect(saved.queue).toHaveLength(1)
  expect(saved.nextNumber).toBe(2)
})
```

`act()` wrapping `fireEvent.click` is required when verifying `useEffect` side effects — ensures the effect has flushed before the assertion. [ASSUMED: standard React Testing Library practice for effect testing]

---

### Anti-Patterns to Avoid

- **Anti-pattern: Read localStorage in the component body (not in lazy initializer):**
  ```typescript
  // BAD — runs on every render, causes unnecessary I/O
  const [state, dispatch] = useReducer(queueReducer, JSON.parse(localStorage.getItem('turnero-v1') ?? 'null') || initialState)
  // The expression is evaluated eagerly on every render, not just mount
  ```
  Use the third-arg `init` instead — it runs exactly once.

- **Anti-pattern: Save in useEffect with `[]` (mount only):**
  ```typescript
  // BAD — only saves on mount, not after dispatches
  useEffect(() => { localStorage.setItem(..., JSON.stringify(state)) }, [])
  ```
  Use `[state]` to save after every state change.

- **Anti-pattern: Omit `localStorage.clear()` in test `beforeEach`:**
  If test A writes state to localStorage, test B that renders `<App />` will hydrate from that state instead of starting fresh. Always clear in `beforeEach` for tests that involve `<App />`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Lazy initialization | Manual flag variable (`isInitialized`) tracking first render | `useReducer` 3rd arg `init` | React provides this primitive; flags add state and risk double-init bugs |
| Effect cleanup | Returning a cleanup from the save effect | Nothing (no cleanup needed) | `setItem` is idempotent; cleanup would only be needed if we had a subscription to cancel |
| localStorage unavailability | try/catch around `localStorage.setItem` | Plain call (no guard) | In this browser-only app, localStorage is always available; SSR guard is unnecessary complexity |

**Key insight:** The lazy initializer is the idiomatic React solution for "read from external source only on mount." Using it avoids a class of bugs where initialization logic runs on subsequent renders.

---

## Common Pitfalls

### Pitfall 1: Eager Evaluation of initialState Arg
**What goes wrong:** Writing `useReducer(queueReducer, loadFromStorage())` instead of `useReducer(queueReducer, undefined, loadFromStorage)`. The first form calls `loadFromStorage()` immediately (not lazily) and passes its result as the initial state — which works on first render but also re-runs on every subsequent hot reload or parent re-render.
**Why it happens:** The distinction between "value" and "function reference" in useReducer's argument positions is easy to miss.
**How to avoid:** Pass the function reference (or an arrow function) as the third arg; pass `undefined` as the second arg.
**Warning signs:** ESLint rule `react-hooks/exhaustive-deps` doesn't catch this; only tests that verify no localStorage read on re-render would surface it.

### Pitfall 2: useEffect with `[]` saves only on mount
**What goes wrong:** If `useEffect` is given an empty dependency array `[]`, the save only fires once (on mount) and then never again. Subsequent dispatches update React state but localStorage falls out of sync.
**Why it happens:** Copy-pasting the mount-only useEffect pattern.
**How to avoid:** Use `[state]` as the dependency. The save effect must re-run whenever state changes.
**Warning signs:** Reloading after a dispatch doesn't restore the dispatched change.

### Pitfall 3: Forgetting `localStorage.clear()` between tests
**What goes wrong:** A test that pre-populates localStorage with a certain state leaves that data for the next test. If the next test renders `<App />` (which hydrates on mount), it sees the previous test's data instead of a fresh empty state.
**Why it happens:** jsdom's localStorage is shared across all tests in a file; it is NOT reset between tests automatically.
**How to avoid:** Add `localStorage.clear()` to `beforeEach` in every describe block that touches `<App />` or `localStorage`.
**Warning signs:** Tests pass in isolation but fail when the full suite runs (order-dependent failures).

### Pitfall 4: JSON.parse 'null' string does not throw
**What goes wrong:** `JSON.parse('null')` returns JavaScript `null` without throwing. If the storage key contains the literal string `'null'`, `loadFromStorage()` returns `null`, TypeScript's `as QueueState` cast doesn't prevent the runtime value from being null, and the app crashes when it tries to read `state.queue`.
**Why it happens:** `JSON.parse` handles all valid JSON values, not just objects. `null` is valid JSON.
**How to avoid:** D-03 explicitly accepts this as a known limitation (key versioning prevents it in normal operation). If future requirements demand safety here, add a null guard: `const parsed = JSON.parse(raw); if (!parsed || typeof parsed !== 'object') return initialState`.
**Warning signs:** App crashes on page load after someone manually tampers with localStorage.

### Pitfall 5: Flash class behavior on reload (jsdom cannot verify)
**What goes wrong:** A test tries to assert "no animation on reload" by checking that the `ventanilla-ticket-flash` class is absent when loading a persisted non-null ticket. This assertion FAILS — the class IS present on initial render with a non-null ticket (Phase 6 design, confirmed by existing `FEEDBACK-02` test at App.test.tsx line 157).
**Why it happens:** The CONTEXT.md states "no animation on first mount" which refers to the key-prop remount mechanism (React only unmounts/remounts on key change, not on first render). The CSS `@keyframes` animation itself DOES fire when an element mounts with the animation class. In jsdom, neither the class presence nor CSS animation execution constitutes a problem — jsdom does not execute CSS animations.
**How to avoid:** The correct Phase 8 regression test for criterion 3 checks that `mockPlay` was NOT called on initial render with persisted state. It does NOT assert "no flash class." The flash class being present is Phase 6's existing behavior, not a regression.
**Warning signs:** A test that asserts `not.toHaveClass('ventanilla-ticket-flash')` on a non-null ticket will fail and cause confusion.

---

## Code Examples

### Complete loadFromStorage helper

```typescript
// Source: D-01/D-02/D-03 from 08-CONTEXT.md (all verified against current codebase)
// Place ABOVE the App function in src/App.tsx

function loadFromStorage(): QueueState {
  try {
    return JSON.parse(localStorage.getItem('turnero-v1') ?? '') as QueueState
  } catch {
    return initialState
  }
}
```

### Modified useReducer call (App.tsx line 92)

```typescript
// BEFORE:
const [state, dispatch] = useReducer(queueReducer, initialState)

// AFTER — third argument is the lazy initializer:
const [state, dispatch] = useReducer(queueReducer, undefined, loadFromStorage)
```

### Save effect (add to App() body, after the useReducer line)

```typescript
useEffect(() => {
  localStorage.setItem('turnero-v1', JSON.stringify(state))
}, [state])
```

### PERSIST-01 test block structure (append to App.test.tsx)

New imports needed at top of `App.test.tsx`:
```typescript
import App from './App'
import type { QueueState } from './turnero'
```

New describe block:
```typescript
describe('PERSIST-01: Persistence across reloads', () => {
  beforeEach(() => {
    localStorage.clear()
    mockPlay.mockClear()
  })

  it('SC-1: renders persisted queue and ventanilla state after reload', () => {
    const persisted: QueueState = {
      queue: [{ id: 2, number: 2 }, { id: 3, number: 3 }],
      nextNumber: 4,
      ventanillas: [{ id: 1, number: 1, currentTicket: { id: 1, number: 1 } }],
      nextWindowNumber: 2,
    }
    localStorage.setItem('turnero-v1', JSON.stringify(persisted))
    render(<App />)
    expect(screen.getByText('Turno 2')).toBeInTheDocument()  // queue chip
    expect(screen.getByText('Turno 3')).toBeInTheDocument()  // queue chip
    expect(screen.getByText('Turno 1')).toBeInTheDocument()  // ventanilla current ticket
    expect(screen.getByText('Ventanilla 1')).toBeInTheDocument()
  })

  it('SC-2a: falls back to empty state when localStorage key is absent', () => {
    render(<App />)
    expect(screen.getByText('Próximos turnos aparecerán aquí')).toBeInTheDocument()
    expect(screen.queryByText(/^Turno \d/)).not.toBeInTheDocument()
  })

  it('SC-2b: falls back to empty state on corrupted localStorage data', () => {
    localStorage.setItem('turnero-v1', 'not-valid-json{{{')
    render(<App />)
    expect(screen.getByText('Próximos turnos aparecerán aquí')).toBeInTheDocument()
  })

  it('SC-3: does not call playBeep on initial render with persisted non-null ticket', () => {
    const persisted: QueueState = {
      queue: [],
      nextNumber: 2,
      ventanillas: [{ id: 1, number: 1, currentTicket: { id: 1, number: 1 } }],
      nextWindowNumber: 2,
    }
    localStorage.setItem('turnero-v1', JSON.stringify(persisted))
    render(<App />)
    expect(mockPlay).not.toHaveBeenCalled()
  })

  it('saves updated state to localStorage after dispatch', () => {
    render(<App />)
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /agregar turno/i }))
    })
    const saved = JSON.parse(localStorage.getItem('turnero-v1') ?? 'null') as QueueState | null
    expect(saved).not.toBeNull()
    expect(saved!.queue).toHaveLength(1)
    expect(saved!.nextNumber).toBe(2)
  })
})
```

**Note on `act()` wrapping:** The `act()` wrapper around `fireEvent.click` in the save-verification test ensures `useEffect` has flushed before asserting localStorage. Without it, the assertion runs before React has run the effect.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `useReducer(reducer, expensiveInit())` — eager evaluation | `useReducer(reducer, arg, init)` — lazy via 3rd arg | React 16.8 hooks era | localStorage read only on mount, not every render |
| Storing full serialized DOM or component tree | Store only the minimal state object (`QueueState`) | Always best practice | Small JSON blob, fast serialize/parse |

**Deprecated/outdated:**
- `componentWillMount` for data hydration: replaced by lazy initializer or `useEffect` with `[]`. Not applicable here (function components only).
- Using `window.localStorage` explicitly: unnecessary; `localStorage` global is the same object.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `useEffect([state])` without a cleanup function is called twice in React 19 Strict Mode (mount, no-cleanup, mount again), writing localStorage twice on initial render | Pattern 2: useEffect Save | LOW — idempotent writes; even if behavior differs, the net result is the same localStorage content |
| A2 | `act(() => { fireEvent.click(...) })` wrapper is required to flush `useEffect` before localStorage assertion in Vitest + RTL v16 | Pattern 3: Test Patterns | MEDIUM — if RTL v16 auto-flushes effects after `fireEvent`, the wrapper is redundant but harmless; if it doesn't, the test would be a false negative |
| A3 | Inline `loadFromStorage()` in `App.tsx` is the planner's choice (CONTEXT.md says either inline or separate file is fine) | Pattern 1 | LOW — either approach produces identical behavior |

---

## Open Questions

1. **Placement of loadFromStorage: inline vs separate file**
   - What we know: CONTEXT.md says "a single call site is fine either way"
   - What's unclear: Whether the planner prefers to follow the `useBeep.ts` convention (one hook/helper per file)
   - Recommendation: Inline in App.tsx to minimize file changes. If the team wants consistent convention, create `src/useLocalStorage.ts`.

2. **useEffect initial write behavior**
   - What we know: On first render after reload, useEffect writes hydrated state back to localStorage (idempotent)
   - What's unclear: Whether this initial write is desirable (it could cause a "last accessed" style side effect if storage quota tracking is ever added)
   - Recommendation: Accept as-is; for this scope it's harmless and simplifies the code (no "was this the initial render?" tracking needed).

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `localStorage` (Web API) | `loadFromStorage()`, `useEffect` save | ✓ (jsdom in test; browser in prod) | N/A — native API | — (browser-only app; no SSR) |
| Node.js | Vitest test runner | ✓ | v22.23.0 | — |
| Vitest | Test suite | ✓ | ^4.1.10 | — |
| `@testing-library/react` | Integration tests | ✓ | ^16.3.2 | — |
| jsdom | Test environment | ✓ | ^29.1.1 | — |

**Missing dependencies with no fallback:** none

**Node v22 note:** Node v22 has an experimental Web Storage API, but this project's jsdom test environment (configured in `vite.config.ts`) overrides it with jsdom's own `localStorage` implementation. The Node v25 Web Storage API conflict issue is NOT present on v22. [VERIFIED: WebSearch — vitest-dev/vitest#8757]

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest ^4.1.10 |
| Config file | `vite.config.ts` (test section with `environment: 'jsdom'`, `setupFiles: './src/setupTests.ts'`, `globals: true`) |
| Quick run command | `npm test` (runs `vitest run`) |
| Full suite command | `npm test` (same — full suite is fast: 28 tests in ~3s) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PERSIST-01 SC-1 | Persisted queue + ventanilla state renders correctly after reload | integration | `npm test` | ❌ Wave 0 — add to App.test.tsx |
| PERSIST-01 SC-2a | Missing localStorage key → empty state (no crash) | integration | `npm test` | ❌ Wave 0 — add to App.test.tsx |
| PERSIST-01 SC-2b | Corrupted JSON in localStorage → empty state (no crash) | integration | `npm test` | ❌ Wave 0 — add to App.test.tsx |
| PERSIST-01 SC-3 | `mockPlay` not called on initial render with persisted non-null ticket | integration | `npm test` | ❌ Wave 0 — add to App.test.tsx |
| PERSIST-01 save | `localStorage.setItem` called with updated state after dispatch | integration | `npm test` | ❌ Wave 0 — add to App.test.tsx |

### Sampling Rate
- **Per task commit:** `npm test`
- **Per wave merge:** `npm test` (full suite, all 28 + new tests)
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/App.test.tsx` — append `describe('PERSIST-01: Persistence across reloads', ...)` block with 5 new test cases
- [ ] Add `import App from './App'` and `import type { QueueState } from './turnero'` to top of `App.test.tsx`

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | N/A — no auth in this project |
| V3 Session Management | no | No sessions — client-only SPA |
| V4 Access Control | no | No roles or permissions |
| V5 Input Validation | yes (limited) | `JSON.parse` try/catch on deserialized localStorage data (D-03) |
| V6 Cryptography | no | No secrets stored; data is queue numbers only (PRIVACY-01 guarantees no PII) |

### Known Threat Patterns for localStorage

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS reads localStorage | Information disclosure | Out of scope (no PII stored; ticket numbers are not sensitive) |
| Tampered JSON in localStorage | Tampering | `JSON.parse` try/catch (D-03) → falls back to `initialState`; structural tampering (wrong types) not validated but cannot corrupt server state (there is no server) |
| localStorage quota exceeded | Denial of service | Theoretical only; QueueState JSON is tiny (<1KB even with many tickets/windows). No guard needed. |

**Security summary:** The stored data is exclusively queue numbers (integers) and window state — no PII, no credentials, no tokens. Tampering with localStorage can only affect the tamper's own browser session. The `try/catch` around `JSON.parse` (D-03) prevents invalid JSON from crashing the app. This is adequate for the risk profile of this project.

---

## Sources

### Primary (HIGH confidence)
- [react.dev/reference/react/useReducer#parameters](https://react.dev/reference/react/useReducer#parameters) — `useReducer` third-arg init function behavior, Strict Mode double-invoke behavior [VERIFIED]
- `src/App.tsx` (project codebase) — exact `useReducer` call site (line 92), `VentanillaCard` component and `handleCallNext` function (beep call site) [VERIFIED]
- `src/App.test.tsx` (project codebase) — existing test patterns: `vi.mock('./useBeep')`, `mockPlay`, `fireEvent.click`, `act()` usage [VERIFIED]
- `vite.config.ts` (project codebase) — test environment (`jsdom`), setupFiles, globals [VERIFIED]
- `package.json` (project codebase) — exact installed versions: React 19.2.6, Vitest 4.1.10, RTL 16.3.2, jsdom 29.1.1 [VERIFIED]

### Secondary (MEDIUM confidence)
- [dylanbritz.dev/writing/mocking-local-storage-vitest/](https://dylanbritz.dev/writing/mocking-local-storage-vitest/) — direct `localStorage.setItem/getItem` works in jsdom; spy via `Storage.prototype` [VERIFIED: consistent with multiple WebSearch results]
- [github.com/vitest-dev/vitest/issues/8757](https://github.com/vitest-dev/vitest/issues/8757) — Node v25 Web Storage API conflict; Node v22 is safe [VERIFIED: WebSearch]

### Tertiary (LOW confidence)
- Training knowledge — React 19 Strict Mode double-invoke of `useEffect` writing idempotent data to localStorage is harmless [ASSUMED]
- Training knowledge — `act()` wrapper required around `fireEvent.click` to flush `useEffect` in RTL v16 [ASSUMED]

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new libraries; all patterns are native React + Web API, verified against official React docs
- Architecture: HIGH — two touch points in App.tsx confirmed against actual source files
- Test patterns: MEDIUM — direct localStorage access in jsdom confirmed by multiple WebSearch sources; `act()` requirement is assumed but standard RTL practice
- Pitfalls: HIGH — all pitfalls derived from actual code analysis (loadFromStorage edge case, `?? ''` behavior, jsdom shared storage between tests)

**Research date:** 2026-07-09
**Valid until:** 2026-08-09 (stable; React + Vitest APIs don't change at this granularity)

---

## Project Constraints (from CLAUDE.md)

| Constraint | Directive |
|------------|-----------|
| No new runtime dependencies | Phase 8 must NOT install any npm packages. Hand-written `loadFromStorage()` helper is the required approach. |
| localStorage over wrappers | Use `localStorage.setItem`/`getItem` + `JSON.stringify`/`JSON.parse`. No `localforage`, no `usehooks-ts`. |
| Functional components + hooks only | No class components. `useReducer` lazy initializer + `useEffect` are the correct hooks. |
| Single page/view | No routing introduced. All persistence logic stays within the existing single `App` component. |
| Tech stack: React + TypeScript + Vite | `as QueueState` TypeScript cast on JSON.parse return (required; JSON.parse returns `any`) |
