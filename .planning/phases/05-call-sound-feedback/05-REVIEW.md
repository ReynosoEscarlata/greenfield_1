---
phase: 05-call-sound-feedback
reviewed: 2026-07-07T00:00:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - src/useBeep.ts
  - src/setupTests.ts
  - src/App.test.tsx
  - src/App.tsx
findings:
  critical: 0
  warning: 5
  info: 3
  total: 8
status: issues_found
---

# Phase 05: Code Review Report

**Reviewed:** 2026-07-07
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

Reviewed the Phase 5 deliverables for call-sound feedback: `useBeep.ts` (Web Audio API hook), `setupTests.ts` (global test setup), `App.test.tsx` (component tests including FEEDBACK-01 suite), and `App.tsx` (component integration).

The core FEEDBACK-01 feature — beeping on a successful "Llamar siguiente" click and staying silent on empty queue — is correctly implemented and the tests correctly cover it. No blocking correctness bugs or security issues were found. However, there are five warnings across the four files, concentrated in `useBeep.ts` and `setupTests.ts`, that degrade robustness and maintainability.

---

## Warnings

### WR-01: AudioContext suspended state not handled — silent beep failure in production

**File:** `src/useBeep.ts:6-20`

**Issue:** The module-level `audioCtx` singleton is reused across calls without ever checking `audioCtx.state`. On many browsers (Chrome since 2018, all mobile browsers), an `AudioContext` that goes to the background or is interrupted by a phone call transitions to `'suspended'` state. When suspended, `createOscillator()` and `osc.start()` do not throw — they silently execute and produce no sound. The existing `catch` block only catches thrown exceptions; it never catches the suspended-but-silent case. The result is that on mobile or after the user backgrounds and returns to the tab, clicks on "Llamar siguiente" trigger no beep with no error feedback to developers.

The `setupTests.ts` mock exposes `resume: vi.fn()` and `state: 'running'`, which shows the suspended case was anticipated but never handled in production code.

**Fix:**
```ts
export function useBeep() {
  function play(): void {
    try {
      if (!audioCtx) {
        audioCtx = new AudioContext()
      }
      const ctx = audioCtx

      // Resume suspended context (e.g., after tab backgrounded on mobile).
      // resume() is a no-op when state is already 'running'.
      // It returns a Promise; we chain the actual audio work inside it so
      // the oscillator starts after the context is guaranteed running.
      const doPlay = () => {
        const now = ctx.currentTime
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(880, now)
        gain.gain.setValueAtTime(0.3, now)
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now)
        osc.stop(now + 0.2)
      }

      if (ctx.state === 'suspended') {
        ctx.resume().then(doPlay).catch(() => {/* silent */})
      } else {
        doPlay()
      }
    } catch {
      // silent — audio failure must not interrupt call-next flow
    }
  }

  return { play }
}
```

---

### WR-02: `useBeep` has the `use` prefix but contains no React hook calls

**File:** `src/useBeep.ts:3`

**Issue:** The `use` prefix is React's convention for functions that call other hooks (`useState`, `useEffect`, etc.). `useBeep` calls none — it is a plain factory function that returns a `{ play }` object. Naming it with `use` causes two concrete harms:

1. ESLint's `react-hooks/rules-of-hooks` plugin will enforce hook-calling rules on it (e.g., it may not be called inside conditionals or nested functions), even though those restrictions don't apply here.
2. Developers reading `const { play: playBeep } = useBeep()` expect the returned value to be stable across renders (hook contract), but `play` is a brand-new function on every render (see WR-03).

**Fix:** Rename to `createBeep` or `makeBeep` and export a singleton or module-level `play` function directly. Since the `audioCtx` is already a module-level singleton, there is no benefit to instantiating this on a per-component basis:

```ts
// useBeep.ts → beep.ts
let audioCtx: AudioContext | null = null

export function playBeep(): void {
  // ... same implementation
}
```

And in `App.tsx`:
```ts
import { playBeep } from './beep'
// ...
function handleCallNext() {
  if (queueLength === 0) { setShowEmptyWarning(true); return }
  playBeep()
  onCallNext(ventanilla.id)
}
```

---

### WR-03: New `play` function object created on every render

**File:** `src/useBeep.ts:4`, `src/App.tsx:19`

**Issue:** `useBeep()` is called on every render of `VentanillaCard` (App.tsx line 19). Each call creates a new `play` function object (line 4 of `useBeep.ts`). This means `playBeep` is a different reference on every render. This is harmless today since it is not used in `useCallback` or `useMemo` dependencies, but it violates the implicit hook contract (stable references across renders) and creates a latent bug if a future developer adds `playBeep` to a dependency array — the callback would fire on every render.

If `useBeep` is kept as a hook, the fix is to memoize:
```ts
import { useCallback } from 'react'

export function useBeep() {
  const play = useCallback((): void => {
    // ... implementation
  }, []) // no deps — audioCtx is module-level
  return { play }
}
```

Alternatively, adopt the WR-02 fix (plain exported function), which eliminates the issue entirely.

---

### WR-04: `mockAudioContextInstance` spies never reset between tests

**File:** `src/setupTests.ts:19-28`

**Issue:** `mockAudioContextInstance` is created once at module evaluation time and shared across every test file and test case. The spy functions (`createOscillator`, `createGain`, `resume`) accumulate call counts across tests. Currently harmless because `App.test.tsx` mocks `useBeep` entirely and never exercises the real AudioContext path. However, `useBeep.ts` has no direct unit tests — if a `useBeep.test.ts` is added in the future, those tests will observe polluted call counts from previous runs unless cleanup is added.

**Fix:** Add a `beforeEach` reset in `setupTests.ts`:
```ts
beforeEach(() => {
  mockAudioContextInstance.createOscillator.mockClear()
  mockAudioContextInstance.createGain.mockClear()
  mockAudioContextInstance.resume.mockClear()
  ;(global.AudioContext as ReturnType<typeof vi.fn>).mockClear()
})
```

---

### WR-05: "Llamar siguiente" button missing per-window accessible label

**File:** `src/App.tsx:69-71`

**Issue:** When multiple `VentanillaCard` components render, each emits a button with the text "Llamar siguiente" and no `aria-label`. Screen readers will announce multiple identical "Llamar siguiente" buttons in the accessibility tree with no way to distinguish which belongs to which window. The "Quitar ventanilla" button correctly uses `aria-label={`Quitar ventanilla ${ventanilla.number}`}` (line 59); the call-next button should match this pattern.

**Fix:**
```tsx
<button
  type="button"
  className="call-next-button"
  onClick={handleCallNext}
  aria-label={`Llamar siguiente turno — Ventanilla ${ventanilla.number}`}
>
  Llamar siguiente
</button>
```

---

## Info

### IN-01: Silent `catch` provides no dev-mode diagnostic

**File:** `src/useBeep.ts:21-23`

**Issue:** The `catch` block silently swallows all audio exceptions. This is intentional per the comment, but during development there is no way to learn that audio is failing. A development-only `console.error` would surface issues without affecting production behavior.

**Fix:**
```ts
} catch (err) {
  if (import.meta.env.DEV) {
    console.error('[useBeep] Audio playback failed:', err)
  }
}
```

---

### IN-02: `mockPlay` declared before `vi.mock` without `vi.hoisted()`

**File:** `src/App.test.tsx:1-5`

**Issue:** `const mockPlay = vi.fn()` is declared on line 1, then used inside the `vi.mock` factory on lines 3-5. Vitest hoists `vi.mock` calls above imports AND above variable declarations. The factory closure captures `mockPlay` by reference, so the current code works because the inner arrow function `() => ({ play: mockPlay })` only evaluates `mockPlay` when called during rendering (after module initialization). However, this is an order-of-evaluation dependency that is not obvious and that Vitest's own documentation flags as requiring `vi.hoisted()`:

> "Since all calls to vi.mock are hoisted to the top of the file, even above the imports, we can't access variables defined in the module scope directly. But there's a helper function vi.hoisted that you can use for that."

If the factory were refactored to eagerly evaluate `mockPlay` (e.g., `() => ({ useBeep: { play: mockPlay } })`), it would silently break.

**Fix:** Use the documented pattern:
```ts
const { mockPlay } = vi.hoisted(() => ({ mockPlay: vi.fn() }))

vi.mock('./useBeep', () => ({
  useBeep: () => ({ play: mockPlay }),
}))
```

---

### IN-03: `useBeep.ts` has zero direct unit test coverage

**File:** `src/useBeep.ts`

**Issue:** `App.test.tsx` mocks `useBeep` entirely (lines 1-5), so the real implementation in `useBeep.ts` is never executed in any test. The Web Audio API mock in `setupTests.ts` is set up for this purpose but never exercised. This means bugs in `useBeep.ts` (such as WR-01) cannot be caught by the current test suite.

**Fix:** Add `src/useBeep.test.ts` that calls `play()` and asserts the `AudioContext` mock received the expected method calls (`createOscillator`, `connect`, `start`, `stop` with correct timing arguments). The mock infrastructure in `setupTests.ts` already supports this.

---

_Reviewed: 2026-07-07_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
