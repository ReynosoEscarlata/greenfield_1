---
phase: 08-persistence-across-reloads
plan: "01"
subsystem: testing
tags: [tdd, persistence, localStorage, red-phase]
dependency_graph:
  requires: []
  provides: [PERSIST-01-tests]
  affects: [src/App.test.tsx]
tech_stack:
  added: []
  patterns: [TDD RED phase, jsdom localStorage, QueueState type import]
key_files:
  created: []
  modified:
    - src/App.test.tsx
decisions:
  - "SC-2a, SC-2b, SC-3 pass incidentally in RED phase — acceptable per plan; only SC-1 and save test need to fail to confirm RED state"
  - "act() used synchronously (not async) for fireEvent.click wrap — sufficient since useReducer dispatch is synchronous"
metrics:
  duration: "~5 minutes"
  completed: "2026-07-09"
  tasks_completed: 1
  files_modified: 1
---

# Phase 8 Plan 01: Persistence Across Reloads — TDD RED Summary

**One-liner:** Added 5-test PERSIST-01 describe block to App.test.tsx with SC-1 and save tests failing (RED) while 31 other tests remain green.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add PERSIST-01 test block to App.test.tsx (RED) | 89335e3 | src/App.test.tsx |

## What Was Built

Added the PERSIST-01 test block to `src/App.test.tsx` establishing the RED state for Phase 8 persistence work. The block contains 5 test cases:

- **SC-1** (`renders persisted queue and ventanilla state after reload`) — pre-populates jsdom localStorage with a `QueueState` fixture, renders `<App />`, asserts ticket numbers and ventanilla label are visible. **FAILS** because `App.tsx` ignores localStorage.
- **SC-2a** (`falls back to empty state when localStorage key is absent`) — renders with empty localStorage, asserts fallback empty-queue text appears. Passes incidentally (App uses `initialState`).
- **SC-2b** (`falls back to empty state on corrupted localStorage data`) — pre-populates with invalid JSON, renders App, asserts fallback text. Passes incidentally.
- **SC-3** (`does not call playBeep on initial render with persisted non-null ticket`) — pre-populates with non-null `currentTicket`, renders App, asserts `mockPlay` was not called. Passes incidentally.
- **save** (`saves updated state to localStorage after dispatch`) — renders App, clicks "Agregar turno", asserts `turnero-v1` key exists in localStorage with correct shape. **FAILS** because App has no `useEffect` that writes localStorage.

Two imports were added immediately after the `VentanillaCard` import:
- `import App from './App'` (default export)
- `import type { QueueState } from './turnero'` (for typed test fixtures)

## Test Results (RED State Confirmed)

```
Tests  2 failed | 31 passed (33)
```

- SC-1: FAILED (expected — App.tsx does not hydrate from localStorage)
- save: FAILED (expected — App.tsx has no useEffect to write localStorage)
- 31 tests green: 28 pre-existing + SC-2a + SC-2b + SC-3

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- [x] `src/App.test.tsx` modified with PERSIST-01 describe block (59 insertions)
- [x] `grep -c "PERSIST-01: Persistence across reloads" src/App.test.tsx` returns 1
- [x] Commit `89335e3` exists: `test(08-01): add PERSIST-01 failing test block (RED)`
- [x] SC-1 and save tests fail (RED state confirmed)
- [x] 28 pre-existing tests remain green
- [x] No TypeScript errors emitted by test runner
