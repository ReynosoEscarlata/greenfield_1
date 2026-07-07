---
phase: 05-call-sound-feedback
plan: 01
subsystem: test-infrastructure
tags: [tdd, red, web-audio, vitest, mocking]
dependency_graph:
  requires: []
  provides: [useBeep-stub, AudioContext-mock, FEEDBACK-01-tests]
  affects: [src/App.test.tsx, src/setupTests.ts, src/useBeep.ts]
tech_stack:
  added: []
  patterns: [vi.mock-module-factory, global-AudioContext-mock, beforeEach-mockClear]
key_files:
  created:
    - src/useBeep.ts
  modified:
    - src/setupTests.ts
    - src/App.test.tsx
decisions:
  - "useBeep stub uses void audioCtx idiom to satisfy TS no-unused-vars without a linter disable comment"
  - "All 7 isQueueEmpty prop references replaced in tests before component is updated — RED state is prop-type mismatch + missing hook"
metrics:
  duration_minutes: 5
  completed_date: "2026-07-07"
  tasks_completed: 2
  files_changed: 3
---

# Phase 5 Plan 01: RED — useBeep Stub + AudioContext Mock + Failing FEEDBACK-01 Tests Summary

**One-liner:** TDD RED phase — minimal useBeep stub, full AudioContext mock, and two failing FEEDBACK-01 tests establish the contract for beep-on-call behavior.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create useBeep stub + extend setupTests with AudioContext mock | acd489d | src/useBeep.ts, src/setupTests.ts |
| 2 (RED) | Update App.test.tsx — add vi.mock, rename props, add FEEDBACK-01 describe block | a78def4 | src/App.test.tsx |

## What Was Built

### src/useBeep.ts (new)
Minimal named-export stub. Contains module-level `let audioCtx: AudioContext | null = null` and exports `function useBeep()` returning `{ play }` where `play` is a no-op. Purpose: satisfy `vi.mock('./useBeep')` module resolution without any real AudioContext usage. Real implementation comes in Plan 05-02.

### src/setupTests.ts (extended)
Appended global `AudioContext` mock covering all methods `useBeep.play()` will exercise: `createMockOscillator` (type, frequency.setValueAtTime, connect, start, stop), `createMockGain` (gain.setValueAtTime, gain.exponentialRampToValueAtTime, connect), `mockAudioContextInstance` with `createOscillator`, `createGain`, `destination`, `currentTime`, `state`, `resume`. Assigned to `global.AudioContext`.

### src/App.test.tsx (modified)
- `const mockPlay = vi.fn()` and `vi.mock('./useBeep', ...)` prepended before imports (Vitest auto-hoists vi.mock)
- All 7 `isQueueEmpty` prop occurrences replaced: `isQueueEmpty={false}` → `queueLength={1}`, `isQueueEmpty={true}` → `queueLength={0}`
- New `describe('FEEDBACK-01: Beep on successful call')` block with `beforeEach(mockPlay.mockClear)` and two tests: play called when queueLength={1}, play not called when queueLength={0}

## RED State Confirmation

`npm test` exits non-zero with 2 failures:
1. CALL-02 auto-dismiss test: `VentanillaCard` still receives `queueLength={0}` but the component checks `isQueueEmpty` (prop type mismatch — TypeScript actually accepts numeric prop in JS runtime but behavior diverges)
2. FEEDBACK-01 "calls play()": `mockPlay` never called because component has not been updated to call `useBeep().play()`

This is the intended RED state — tests define the contract, implementation follows in Plan 05-02.

## Deviations from Plan

None — plan executed exactly as written.

The only minor implementation note: `src/useBeep.ts` uses `void audioCtx` inside the stub `play()` body to reference the module-level variable without triggering TypeScript "declared but never read" errors, without needing an eslint-disable comment. This is idiomatic TypeScript and does not affect stub behavior.

## Known Stubs

| File | Location | Description | Resolves in |
|------|----------|-------------|-------------|
| src/useBeep.ts | play() body | No-op stub — real Web Audio API implementation pending | Plan 05-02 |

## Self-Check

- [x] src/useBeep.ts exists with named export useBeep
- [x] src/setupTests.ts contains `global.AudioContext = vi.fn`
- [x] src/App.test.tsx has 0 occurrences of `isQueueEmpty`
- [x] src/App.test.tsx has `vi.mock('./useBeep'`
- [x] src/App.test.tsx has `describe('FEEDBACK-01:`
- [x] npm test exits non-zero (RED confirmed)
- [x] Commits acd489d and a78def4 exist

## Self-Check: PASSED
