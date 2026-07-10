---
phase: 05-call-sound-feedback
plan: 02
subsystem: audio-feedback
tags: [tdd, green, web-audio, useBeep, VentanillaCard]
dependency_graph:
  requires: [05-01]
  provides: [FEEDBACK-01-green, useBeep-full-impl, playBeep-wired]
  affects: [src/useBeep.ts, src/App.tsx]
tech_stack:
  added: []
  patterns: [lazy-singleton-AudioContext, OscillatorNode-per-call, exponential-gain-decay, synchronous-user-gesture-audio]
key_files:
  created: []
  modified:
    - src/useBeep.ts
    - src/App.tsx
decisions:
  - "playBeep() called before onCallNext() in handleCallNext to stay inside synchronous user-gesture context (D-06)"
  - "exponentialRampToValueAtTime target is 0.001 not 0 — Web Audio exponential ramp is undefined at zero (RESEARCH Pitfall 3)"
  - "OscillatorNode created per call (not reused) — OscillatorNode is one-shot and cannot restart after stop()"
metrics:
  duration_minutes: 5
  completed_date: "2026-07-08"
  tasks_completed: 2
  files_changed: 2
---

# Phase 5 Plan 02: GREEN — Full useBeep Implementation + App.tsx Wiring Summary

**One-liner:** TDD GREEN phase — lazy singleton AudioContext beep (880 Hz / 200ms / exponential decay) implemented in useBeep.ts and wired into VentanillaCard so playBeep() fires synchronously on every successful Llamar siguiente click.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Implement useBeep.ts — lazy singleton beep with decay envelope | e602055 | src/useBeep.ts |
| 2 | Update App.tsx — rename isQueueEmpty prop, import useBeep, add playBeep() to click handler | 594dc39 | src/App.tsx |

## What Was Built

### src/useBeep.ts (full implementation)
Replaced the no-op stub with a complete Web Audio API beep:
- Module-level `let audioCtx: AudioContext | null = null` — lazy singleton, created on first user gesture
- Per-call `OscillatorNode` (sine wave at 880 Hz) + `GainNode` (initial 0.3, decays to 0.001 over 0.2 s)
- `exponentialRampToValueAtTime(0.001, now + 0.2)` — target is 0.001, not 0 (zero is undefined for exponential ramp)
- Audio graph: `osc → gain → ctx.destination`; `osc.start(now)` / `osc.stop(now + 0.2)` for 200 ms tone
- Silent `try/catch` — audio failure does not interrupt the call-next user flow

### src/App.tsx (4 surgical changes)
1. Added `import { useBeep } from './useBeep'` as third import
2. Renamed `isQueueEmpty: boolean` → `queueLength: number` in `VentanillaCard` props type and destructuring
3. Added `const { play: playBeep } = useBeep()` inside `VentanillaCard` body; updated `handleCallNext` guard to `queueLength === 0`; added `playBeep()` call immediately before `onCallNext(ventanilla.id)` (synchronous user-gesture order per D-06)
4. Updated App JSX map to pass `queueLength={state.queue.length}` instead of `isQueueEmpty={state.queue.length === 0}`

## GREEN State Confirmation

```
npm test: 23 passed (23) — all suites including FEEDBACK-01 pass
npx tsc --noEmit: exit 0 — no TypeScript errors
grep "isQueueEmpty" src/App.tsx: 0 matches
grep "isQueueEmpty" src/App.test.tsx: 0 matches
```

## Deviations from Plan

### Pre-existing implementation in working tree

**Found during:** Task 1 start
**Issue:** `src/useBeep.ts` already contained the full implementation in the working tree (uncommitted). The 05-01 SUMMARY described a no-op stub, but the working tree had the full implementation already written.
**Action:** Committed the existing full implementation as Task 1 without modification — it matched the plan spec exactly.
**Files modified:** src/useBeep.ts
**Commit:** e602055

### Partial App.tsx changes in working tree

**Found during:** Task 2 start
**Issue:** `src/App.tsx` had partial GREEN changes uncommitted in the working tree (import added, prop renamed, `useBeep()` call added) but `handleCallNext` still referenced `isQueueEmpty` (undefined variable) and JSX still passed `isQueueEmpty=` prop.
**Action:** Applied the two remaining fixes — guard check and JSX prop — then committed the complete set of Task 2 changes.
**Files modified:** src/App.tsx
**Commit:** 594dc39

## Known Stubs

None — all stubs from 05-01 are resolved. `useBeep.play()` is fully implemented.

## Threat Flags

None — no new network endpoints, auth paths, file access patterns, or schema changes introduced.

## Self-Check

- [x] src/useBeep.ts contains `exponentialRampToValueAtTime(0.001`
- [x] src/useBeep.ts does NOT contain `exponentialRampToValueAtTime(0,`
- [x] src/useBeep.ts contains `if (!audioCtx)` (lazy singleton guard)
- [x] src/useBeep.ts contains `osc.start(now)` and `osc.stop(now + 0.2)`
- [x] src/useBeep.ts contains `try {` and `} catch {`
- [x] src/App.tsx contains `import { useBeep } from './useBeep'`
- [x] src/App.tsx contains `queueLength: number` in VentanillaCard props
- [x] src/App.tsx does NOT contain `isQueueEmpty` anywhere
- [x] src/App.tsx contains `const { play: playBeep } = useBeep()`
- [x] src/App.tsx contains `playBeep()` before `onCallNext(ventanilla.id)` in handleCallNext
- [x] src/App.tsx contains `queueLength={state.queue.length}` in App JSX
- [x] npm test exits 0 — 23/23 tests pass
- [x] npx tsc --noEmit exits 0 — no TypeScript errors
- [x] Commits e602055 and 594dc39 exist

## Self-Check: PASSED
