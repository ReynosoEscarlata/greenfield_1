# Phase 5: Call Sound Feedback - Research

**Researched:** 2026-07-07
**Domain:** Web Audio API — synthetic oscillator beep, AudioContext lifecycle, Vitest/jsdom mock patterns
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Use Web Audio API with a synthetic oscillator — no audio files, no assets in `/public`.
- **D-02:** Beep characteristics: 880 Hz (A5), 200 ms duration, exponential decay envelope. Gain starts at ~0.3 and decays to ~0.001 at the end (clean cutoff, no audio click).
- **D-03:** Beep plays ONLY when `queueLength > 0`. If queue is empty on click, no beep — warning message handles that feedback.
- **D-04:** Beep logic lives in a custom hook `useBeep` in `src/useBeep.ts`, exposing a `play()` function. VentanillaCard calls it from its click handler.
- **D-05:** VentanillaCard receives a new `queueLength: number` prop (passed as `queueLength={state.queue.length}` from App). The existing `isQueueEmpty: boolean` prop is replaced by this.
- **D-06:** In the click handler: `if (queueLength > 0) playBeep(); onCallNext(ventanilla.id)` — playBeep is called BEFORE onCallNext to stay within the synchronous user gesture context.
- **D-07:** `useBeep` wraps AudioContext construction and playback in a silent `try/catch`. If the browser blocks AudioContext, the call-next flow continues without visible error.
- **D-08:** Global `AudioContext` mock added to `src/setupTests.ts` (not a per-test-file mock). Tests in `App.test.tsx` verify beep fires when `queueLength > 0` and does NOT fire when queue is empty.

### Claude's Discretion

- Internal organization of `useBeep.ts`: whether to use `useCallback`, whether to keep a singleton AudioContext across calls or create a new one per beep.
- CSS/styling: none needed for this phase.
- Exact `vi.fn()` names for the AudioContext mock methods in `setupTests.ts`.

### Deferred Ideas (OUT OF SCOPE)

- Visual transition animation when ticket changes (FEEDBACK-02) → Phase 6
- Persistence in localStorage (PERSIST-01) → Phase 8
- User-configurable beep frequency/volume → completely out of project scope
- Multiple tones for different call types → not required

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FEEDBACK-01 | When a ticket is called, an audible beep/sound plays, triggered synchronously within the click (not on page reload or post-effects) | Web Audio API OscillatorNode + GainNode created and started inside the click handler satisfies the "synchronous within user gesture" requirement. The beep is synthesized on demand — no audio file needed. The `useEffect`-free design naturally avoids beep-on-hydration. |

</phase_requirements>

---

## Summary

Phase 5 adds a synthetic beep using the native Web Audio API — specifically an `OscillatorNode` at 880 Hz connected through a `GainNode` with an exponential decay envelope. No external packages are required. The beep is created and started directly inside the `VentanillaCard` click handler (via the `play()` function from `useBeep`), which satisfies browser autoplay policy without needing `AudioContext.resume()`. Since the beep is not triggered by any `useEffect` or state initialization path, page-load and reload scenarios naturally produce no sound.

The primary technical challenge in this phase is the Vitest/jsdom test environment: jsdom does not implement `AudioContext` at all. The solution is a manual global mock in `src/setupTests.ts`, providing stub implementations of `createOscillator()`, `createGain()`, `destination`, and `currentTime`. Tests verify call/no-call behavior by asserting on the mock's invocation count, not on actual audio output.

The one architectural decision left to Claude's discretion (`singleton vs. new-per-call AudioContext`) has a clear MDN-recommended answer: a lazy singleton is preferred for performance. This document recommends it.

**Primary recommendation:** Implement `useBeep` as a lazy singleton — create `AudioContext` on first call and capture it in a module-level `ref`, reuse it on subsequent calls. Create a new `OscillatorNode` and `GainNode` per beep (source nodes are one-shot and lightweight). Wrap everything in `try/catch`. Mock `AudioContext` globally in `setupTests.ts` using `vi.fn().mockImplementation(...)`.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Sound synthesis | Browser (Web Audio API) | — | Entirely client-side native API; no backend, no assets |
| Beep trigger decision (queueLength > 0) | Component (VentanillaCard) | — | Click handler has access to queueLength prop at call time |
| AudioContext lifecycle management | Custom Hook (useBeep) | — | Encapsulates browser API and lazy-init in one place |
| AudioContext mock in tests | Test Setup (setupTests.ts) | — | Global mock needed once for all test files |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Web Audio API (native) | Baseline — all major browsers since 2015 | Synthetic oscillator beep | Built into every modern browser; no install, no bundle size impact. OscillatorNode + GainNode cover this use case completely. [CITED: developer.mozilla.org/en-US/docs/Web/API/OscillatorNode] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| None | — | — | No additional runtime packages needed for this phase |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Web Audio API (native) | `use-sound` + Howler.js | Only justified when you need audio sprites, volume control across many overlapping sounds, or playback rate. A single beep on click does not justify the ~10 kB bundle cost. [CITED: CLAUDE.md "What NOT to Use"] |
| Web Audio API (native) | `<audio src="beep.mp3">` | Works, but requires shipping an audio asset in `/public`, which D-01 explicitly forbids. |
| Web Audio API (native) | `HTMLAudioElement` + beep data URI | Adds file-generation complexity for zero benefit; synthesizing with OscillatorNode is simpler and avoids all asset management. |

**Installation:** No packages to install for this phase. The Web Audio API is native.

---

## Package Legitimacy Audit

No external packages are introduced in this phase. The Web Audio API is a native browser API.

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

---

## Architecture Patterns

### System Architecture Diagram

```
User Click → VentanillaCard.handleCallNext()
                │
                ├─ queueLength === 0?
                │      YES → setShowEmptyWarning(true), return (no beep, no dispatch)
                │
                └─ queueLength > 0 → playBeep()  ← useBeep.play()
                                         │
                                         └─ AudioContext (lazy singleton)
                                               ├─ createOscillator() → type='sine', freq=880Hz
                                               ├─ createGain()       → initial gain=0.3
                                               │     └─ exponentialRampToValueAtTime(0.001, now+0.2s)
                                               ├─ osc.connect(gain) → gain.connect(destination)
                                               ├─ osc.start(now)
                                               └─ osc.stop(now + 0.2s)
                                         │
                                   onCallNext(ventanilla.id) → dispatch CALL_NEXT
```

### Recommended Project Structure

```
src/
├── useBeep.ts          # NEW — custom hook exposing play()
├── App.tsx             # MODIFIED — VentanillaCard gets queueLength prop, calls useBeep
├── setupTests.ts       # MODIFIED — global AudioContext mock added
├── App.test.tsx        # MODIFIED — tests for FEEDBACK-01 added
├── turnero.ts          # UNCHANGED
└── turnero.test.ts     # UNCHANGED
```

### Pattern 1: Lazy Singleton AudioContext with Per-Call OscillatorNode

**What:** Create `AudioContext` exactly once (lazy, on first beep call), store in a module-level variable, reuse the context on every subsequent call. Create a fresh `OscillatorNode` and `GainNode` each time — they are one-shot objects and cannot be restarted after `.stop()`.

**When to use:** Any scenario where you play the same kind of short sound repeatedly. Singleton context avoids the per-call cost of acquiring a low-latency audio thread.

**Why MDN recommends it:** "AudioContext and OfflineAudioContext should be considered expensive objects. Creating these objects may involve creating a high-priority thread, or using a low-latency system audio stream, both having an impact on energy consumption. It is usually not necessary to create more than one AudioContext in a document." [CITED: developer.mozilla.org/en-US/docs/Web/API/AudioContext]

**Example:**
```typescript
// Source: MDN Web Audio API best practices + Web Audio API OscillatorNode docs
// [CITED: developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices]
// [CITED: developer.mozilla.org/en-US/docs/Web/API/OscillatorNode]

let audioCtx: AudioContext | null = null

export function useBeep() {
  function play() {
    try {
      if (!audioCtx) {
        audioCtx = new AudioContext()
      }
      const ctx = audioCtx
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, ctx.currentTime)

      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      // IMPORTANT: exponentialRampToValueAtTime cannot target 0 — use small positive value
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.2)
    } catch {
      // Silent: audio failure never interrupts the call-next flow
    }
  }

  return { play }
}
```

**Note on `useCallback`:** For this hook, `play` does not depend on React state or props — it reads from a module-level variable. Wrapping in `useCallback` provides no memoization benefit and is not necessary. Leave it as a plain function.

### Pattern 2: AudioContext Created Inside User Gesture — No `resume()` Needed

**What:** When `AudioContext` is constructed for the first time inside a synchronous click handler, browsers start it in the `running` state immediately. No `ctx.resume()` call is required.

**When the problem occurs:** If `AudioContext` is created at module load time (e.g., at the top of a file or in a `useEffect` on mount), the context starts `suspended` because no user gesture has occurred yet. Subsequent `.start()` calls may be silently ignored.

**The lazy singleton pattern avoids this entirely:** The context is only created on the first click, which is always inside a user gesture. [CITED: developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay]

**Defensive `resume()` pattern (optional, for robustness):**
```typescript
// If adding extra safety for edge cases where context may have been suspended
// externally (e.g., browser tab backgrounding), you can add:
if (audioCtx.state === 'suspended') {
  void audioCtx.resume()
}
```
For this project's usage pattern (user always clicks the button), the defensive check is optional.

### Pattern 3: AudioContext Global Mock in Vitest + jsdom

**What:** jsdom does not implement `AudioContext`. Any code that calls `new AudioContext()` in the test environment will throw `ReferenceError: AudioContext is not defined` unless mocked globally. [CITED: github.com/jsdom/jsdom/issues/2900]

**Where to add it:** `src/setupTests.ts` — runs before every test file due to `setupFiles: './src/setupTests.ts'` in `vite.config.ts`.

**Mock structure needed:**

The mock must implement the subset of the API that `useBeep.play()` exercises:
- `AudioContext` constructor (callable with `new`)
- `ctx.createOscillator()` → returns an object with: `type`, `frequency.setValueAtTime`, `connect`, `start`, `stop`
- `ctx.createGain()` → returns an object with: `gain.setValueAtTime`, `gain.exponentialRampToValueAtTime`, `connect`
- `ctx.destination` → any object (used only as a connect target)
- `ctx.currentTime` → `0` (number)

**Example mock:**
```typescript
// Source: Vitest mocking globals pattern
// [CITED: vitest.dev/guide/mocking/globals]
// [CITED: github.com/jsdom/jsdom/issues/2900]

const mockOscillator = {
  type: 'sine',
  frequency: { setValueAtTime: vi.fn() },
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
}

const mockGain = {
  gain: {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  },
  connect: vi.fn(),
}

const mockAudioContext = {
  createOscillator: vi.fn(() => ({ ...mockOscillator })),
  createGain: vi.fn(() => ({ ...mockGain })),
  destination: {},
  currentTime: 0,
  state: 'running',
}

global.AudioContext = vi.fn(() => mockAudioContext) as unknown as typeof AudioContext
```

**Test assertion approach:** Tests verify `AudioContext` constructor was called (beep triggered) or was NOT called (no beep). They do NOT test actual audio output — that is not testable in jsdom.

**Reset pattern between tests:** Because the AudioContext is a module-level singleton in `useBeep.ts`, tests that check "was AudioContext called?" should either reset `vi.fn()` call counts with `vi.clearAllMocks()` in `beforeEach`, or check mock call counts relative to a baseline.

**Important gotcha with singleton in tests:** The module-level `audioCtx` variable persists between tests if the same module instance is shared. To guarantee the mock constructor is called in the "first beep" test, the test either needs module isolation (`vi.resetModules()`) or the test must reset the singleton. The simplest approach is to make `useBeep` testable by exporting a reset function (or just avoid testing "AudioContext was instantiated" — test "play() was called" via a spy on `useBeep` itself).

**Recommended test approach for `App.test.tsx`:**
- Spy on the `useBeep` module's `play` function, or
- Mock `useBeep` entirely: `vi.mock('./useBeep', () => ({ useBeep: () => ({ play: vi.fn() }) }))`
- Test that `play()` is called when queueLength > 0 and not called when queue is empty
- This decouples App integration tests from AudioContext internals entirely

### Anti-Patterns to Avoid

- **Creating `AudioContext` at module load time:** Results in `suspended` state; audio may not play.
- **Calling `AudioContext.resume()` in a `useEffect`:** `useEffect` is not a user gesture; the resume call inside an effect is still outside the gesture context from the browser's perspective.
- **Calling `playBeep()` inside `useEffect` triggered by state change:** This would fire on hydration/page load whenever the state shape matches a "ticket was called" condition — violates success criterion #2.
- **Using `exponentialRampToValueAtTime(0, ...)` with target=0:** The exponential ramp math requires a positive non-zero target. Use `0.001` as the floor. [CITED: developer.mozilla.org/en-US/docs/Web/API/AudioParam/exponentialRampToValueAtTime]
- **Restarting an OscillatorNode:** `OscillatorNode.start()` can only be called once. After `.stop()`, the node is dead. Always create a new `OscillatorNode` per beep.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Audio synthesis | Custom audio buffer math, PCM encoding | `OscillatorNode` + `GainNode` | Web Audio API handles sample-rate math, platform audio routing, and the gain envelope calculation — ~5 lines vs ~100 lines of DSP code |
| Test environment audio | A "real" audio implementation for tests | `vi.fn()` mock in `setupTests.ts` | Testing audio output is impossible in jsdom; what matters is that the beep *function* is called at the right moment, not actual sound |

**Key insight:** Web Audio API's `OscillatorNode` is the standard platform primitive for synthetic tones. It handles the DSP correctly without any library. The only "custom" code needed is the gain envelope (3 lines), which is well-documented.

---

## Common Pitfalls

### Pitfall 1: AudioContext Created Outside User Gesture — Starts Suspended

**What goes wrong:** `new AudioContext()` called at module top-level, in `useState` initializer, or in a `useEffect` on mount. The context starts in `suspended` state. Subsequent `.start()` calls queue up but produce no audio output.

**Why it happens:** Browser autoplay policy requires user interaction before audio context can run. "Suspended" means the internal clock is frozen; nodes connected and started will not produce output. [CITED: developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay]

**How to avoid:** Lazy singleton — only call `new AudioContext()` on the first actual `play()` invocation, which is always triggered by the user click.

**Warning signs:** Beep code runs without errors but user hears nothing; `audioCtx.state === 'suspended'` in devtools.

### Pitfall 2: Playing Beep in `useEffect` Instead of Click Handler

**What goes wrong:** A `useEffect` watching `ventanilla.currentTicket` plays the beep whenever the ticket changes — including on page load, hydration, or localStorage restoration in Phase 8.

**Why it happens:** `useEffect` reacts to state, not to user intent. State can change from non-click sources.

**How to avoid:** Call `playBeep()` only inside `handleCallNext()`, before `onCallNext()`. Never use `useEffect` for sound triggered by user click.

**Warning signs:** Beep fires on page refresh — success criterion #2 violated.

### Pitfall 3: `exponentialRampToValueAtTime` to Zero Throws/Breaks

**What goes wrong:** `gain.gain.exponentialRampToValueAtTime(0, ctx.currentTime + 0.2)` — using exactly `0` as the target value. The W3C spec notes this as undefined behavior (exponential math diverges at zero); some browsers throw, others clip silently.

**Why it happens:** Exponential curves approach zero asymptotically but never reach it — the math is undefined at exactly zero. [CITED: developer.mozilla.org/en-US/docs/Web/API/AudioParam/exponentialRampToValueAtTime]

**How to avoid:** Use `0.001` (or `0.0001`) as the floor value, as specified in D-02: "decay to ~0.001".

**Warning signs:** AudioContext throws in the browser console; the gain node produces a click or pop at cutoff.

### Pitfall 4: AudioContext Singleton Persists Across Test Files in Vitest

**What goes wrong:** Module-level `audioCtx` variable survives between tests. A test that expects `AudioContext` constructor to be called once may find it already set from a previous test run in the same module instance.

**Why it happens:** Vitest shares module instances within a test file by default. If `useBeep.ts` is imported in multiple tests in the same file, the singleton from the first test persists.

**How to avoid:** Either mock the entire `useBeep` module in `App.test.tsx` (simplest approach), or call `vi.resetModules()` before importing `useBeep` in tests that need a fresh singleton.

**Warning signs:** Test for "AudioContext constructor called" fails intermittently depending on test order.

### Pitfall 5: Forgetting `isQueueEmpty` → `queueLength` Prop Rename in Existing Tests

**What goes wrong:** After replacing `isQueueEmpty: boolean` with `queueLength: number` in VentanillaCard, existing tests in `App.test.tsx` still pass `isQueueEmpty={false}` — TypeScript catches this at compile time, but it's a common oversight if tests are run without type-checking.

**How to avoid:** Update all VentanillaCard renders in `App.test.tsx` to use `queueLength={0}` or `queueLength={1}` as appropriate. Run `tsc --noEmit` as part of the test suite to catch type errors before runtime.

---

## Code Examples

Verified patterns from official sources:

### Complete Beep Implementation (useBeep.ts)

```typescript
// Source: MDN OscillatorNode + MDN AudioParam.exponentialRampToValueAtTime
// [CITED: developer.mozilla.org/en-US/docs/Web/API/OscillatorNode]
// [CITED: developer.mozilla.org/en-US/docs/Web/API/AudioParam/exponentialRampToValueAtTime]

let audioCtx: AudioContext | null = null

export function useBeep() {
  function play() {
    try {
      if (!audioCtx) {
        audioCtx = new AudioContext()  // lazy singleton — created in user gesture context
      }
      const ctx = audioCtx
      const now = ctx.currentTime

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      // Configure tone: 880 Hz sine wave
      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, now)

      // Exponential decay envelope: 0.3 → 0.001 over 200ms
      // NOTE: target MUST be > 0 for exponentialRampToValueAtTime
      gain.gain.setValueAtTime(0.3, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)

      // Connect graph: oscillator → gain → speakers
      osc.connect(gain)
      gain.connect(ctx.destination)

      // Fire and forget — OscillatorNode is one-shot, cannot be restarted
      osc.start(now)
      osc.stop(now + 0.2)
    } catch {
      // Silent — audio failure must not interrupt call-next flow (D-07)
    }
  }

  return { play }
}
```

### AudioContext Mock in setupTests.ts

```typescript
// Source: Vitest mocking globals pattern
// [CITED: vitest.dev/guide/mocking/globals]
import '@testing-library/jest-dom'

const createMockOscillator = () => ({
  type: 'sine' as OscillatorType,
  frequency: { setValueAtTime: vi.fn() },
  connect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
})

const createMockGain = () => ({
  gain: {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  },
  connect: vi.fn(),
})

const mockAudioContextInstance = {
  createOscillator: vi.fn(createMockOscillator),
  createGain: vi.fn(createMockGain),
  destination: {},
  currentTime: 0,
  state: 'running',
  resume: vi.fn(),
}

global.AudioContext = vi.fn(() => mockAudioContextInstance) as unknown as typeof AudioContext
```

### VentanillaCard Prop Change (App.tsx diff summary)

```typescript
// BEFORE:
export function VentanillaCard({
  ventanilla,
  onRemove,
  onCallNext,
  isQueueEmpty,        // boolean
}: Readonly<{
  ...
  isQueueEmpty: boolean
}>)

// AFTER:
export function VentanillaCard({
  ventanilla,
  onRemove,
  onCallNext,
  queueLength,         // number — replaces isQueueEmpty
}: Readonly<{
  ...
  queueLength: number
}>)

// BEFORE (click handler):
function handleCallNext() {
  if (isQueueEmpty) {
    setShowEmptyWarning(true)
    return
  }
  onCallNext(ventanilla.id)
}

// AFTER (click handler):
function handleCallNext() {
  if (queueLength === 0) {
    setShowEmptyWarning(true)
    return
  }
  playBeep()           // MUST be before onCallNext for user gesture sync
  onCallNext(ventanilla.id)
}
```

### App.tsx Prop Pass-through Change

```typescript
// BEFORE:
<VentanillaCard
  key={v.id}
  ventanilla={v}
  onRemove={(id) => dispatch({ type: 'REMOVE_WINDOW', id })}
  onCallNext={(id) => dispatch({ type: 'CALL_NEXT', windowId: id })}
  isQueueEmpty={state.queue.length === 0}
/>

// AFTER:
<VentanillaCard
  key={v.id}
  ventanilla={v}
  onRemove={(id) => dispatch({ type: 'REMOVE_WINDOW', id })}
  onCallNext={(id) => dispatch({ type: 'CALL_NEXT', windowId: id })}
  queueLength={state.queue.length}      // replaces isQueueEmpty
/>
```

### Mocking useBeep in App.test.tsx (Recommended Approach)

```typescript
// Source: Vitest module mocking pattern
// [CITED: vitest.dev/guide/mocking]
// Place at top of App.test.tsx, before any imports of components that use useBeep

const mockPlay = vi.fn()

vi.mock('./useBeep', () => ({
  useBeep: () => ({ play: mockPlay }),
}))

// In tests:
describe('FEEDBACK-01: Beep on successful call', () => {
  beforeEach(() => {
    mockPlay.mockClear()
  })

  it('calls play() when queue has tickets', () => {
    // setup state with tickets, render, click "Llamar siguiente"
    // expect(mockPlay).toHaveBeenCalledOnce()
  })

  it('does not call play() when queue is empty', () => {
    // setup state with empty queue, render, click "Llamar siguiente"
    // expect(mockPlay).not.toHaveBeenCalled()
  })
})
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `new Audio('/beep.mp3')` + audio file in `/public` | `OscillatorNode` synthesis via Web Audio API | Web Audio API widely supported since 2015 | No assets to ship; synthesized tones are instant with no network request |
| Multiple `AudioContext` per interaction | Single lazy singleton `AudioContext`, new source nodes per playback | Always MDN-recommended; became explicitly documented c. 2018 | Reduced overhead, no audio thread proliferation |
| `exponentialRampToValueAtTime(0, ...)` | `exponentialRampToValueAtTime(0.001, ...)` | Always required by spec; a common beginner mistake | Avoids undefined behavior / browser-specific bugs at gain=0 |

**Deprecated/outdated:**
- Creating `AudioContext` at module initialization time: Results in suspended context before first user interaction — now avoided via lazy singleton pattern.
- Using `webkitAudioContext` prefix: Webkit prefix is no longer needed in any browser that needs to be supported (2026 baseline is `AudioContext`). [ASSUMED — based on MDN compatibility tables]

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `useCallback` provides no benefit for the `play` function since it reads module-level state, not React props/state | Architecture Patterns — Pattern 1 | Low: if wrong, adding `useCallback` later is trivial and has no correctness impact |
| A2 | 880 Hz for 200ms at gain 0.3 is perceptually appropriate (not too shrill, not inaudible) | Summary / Code Examples | Low: values come from CONTEXT.md user decisions; if wrong, they are single constants to change |
| A3 | `webkitAudioContext` prefix no longer needed in 2026 | State of the Art | Very low: if wrong, adding `window.webkitAudioContext || AudioContext` is a 1-line fix |

**All critical implementation claims are verified or cited.**

---

## Open Questions (RESOLVED)

1. **useBeep singleton reset between tests**
   - What we know: Module-level `audioCtx` variable persists across tests within the same module instance in Vitest
   - What's unclear: Whether the recommended `vi.mock('./useBeep', ...)` approach (which bypasses the actual singleton entirely) fully covers D-08's intent, or whether tests should verify the actual AudioContext mock was invoked
   - Recommendation: Planner should specify mocking `useBeep` at the module level in `App.test.tsx` for integration tests (tests verify `play()` called), while trusting the `setupTests.ts` AudioContext mock to cover any unit test of `useBeep` itself
   - **RESOLVED:** `vi.mock('./useBeep', () => ({ useBeep: () => ({ play: mockPlay }) }))` is used in `App.test.tsx` — integration tests verify `play()` call count without touching the module-level `audioCtx` singleton. The `setupTests.ts` AudioContext mock covers any future unit tests of `useBeep` directly. Both approaches are in place; D-08's intent (verify beep fires when `queueLength > 0`, does not fire when queue is empty) is fully covered by 05-01 Task 2.

---

## Environment Availability

This phase uses only native browser APIs and Vitest's mocking primitives. No external dependencies to verify.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Web Audio API | useBeep.ts | ✓ (runtime browser) | Baseline — all modern browsers | try/catch silent fail (D-07) |
| jsdom (test env) | Vitest test runner | ✓ | 29.1.1 (from package.json) | — |
| Vitest `vi.fn()` | AudioContext mock | ✓ | 4.1.10 (from package.json) | — |

**Missing dependencies with no fallback:** None.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.10 + @testing-library/react 16.3.2 |
| Config file | `vite.config.ts` (test block with `environment: 'jsdom'`, `setupFiles: './src/setupTests.ts'`, `globals: true`) |
| Quick run command | `npm test` (`vitest run`) |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FEEDBACK-01 | Beep plays when queueLength > 0 on click | integration | `npm test` | ❌ Wave 0 — add to `App.test.tsx` |
| FEEDBACK-01 | Beep does NOT play when queue is empty | integration | `npm test` | ❌ Wave 0 — add to `App.test.tsx` |
| FEEDBACK-01 | Beep does NOT play on page load / hydration | manual-only | — | Manual: reload page, verify no sound |
| FEEDBACK-01 | TypeScript compiles cleanly after prop change | type check | `npx tsc --noEmit` | ✅ (existing TS setup) |

### Sampling Rate

- **Per task commit:** `npm test`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/useBeep.ts` — new file, must exist before Red tests can import it (even as an empty export)
- [ ] `src/App.test.tsx` — new `describe('FEEDBACK-01: ...')` block with 2 tests
- [ ] `src/setupTests.ts` — add `global.AudioContext = vi.fn(...)` mock

---

## Security Domain

This phase introduces no authentication, network requests, user data handling, or cryptography. ASVS categories V2–V6 do not apply. The Web Audio API operates entirely client-side with synthesized output — there is no data input to validate and no sensitive output to protect.

---

## Sources

### Primary (HIGH confidence)

- [MDN: OscillatorNode](https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode) — frequency, type, start/stop, one-shot nature
- [MDN: Web Audio API Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices) — one AudioContext per page, AudioParam scheduling
- [MDN: AudioParam.exponentialRampToValueAtTime](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/exponentialRampToValueAtTime) — cannot target 0; use small positive value
- [MDN: Autoplay guide for media and Web Audio APIs](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay) — AudioContext suspended outside user gesture
- [Vitest: Mocking Globals](https://vitest.dev/guide/mocking/globals) — `vi.stubGlobal` / `global.X = vi.fn()` pattern

### Secondary (MEDIUM confidence)

- [jsdom GitHub Issue #2900](https://github.com/jsdom/jsdom/issues/2900) — confirms jsdom does not implement Web Audio API; manual mock required
- [MDN: AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext) — singleton recommendation, state management
- [Chrome Developers: Autoplay Policy](https://developer.chrome.com/blog/autoplay) — browser behavior detail for suspended contexts

### Tertiary (LOW confidence)

- WebSearch results confirming singleton pattern preference and exponential ramp zero-floor issue — corroborated by MDN sources above

---

## Metadata

**Confidence breakdown:**

- Standard stack (Web Audio API): HIGH — MDN is authoritative; API is stable baseline since 2015
- Architecture (singleton, one-shot OscillatorNode): HIGH — MDN explicitly recommends one context per page; one-shot source node behavior is spec-defined
- Test mock pattern (jsdom + vi.fn): HIGH — confirmed via jsdom issue and Vitest docs
- Pitfalls (suspended context, ramp-to-zero, one-shot oscillator): HIGH — all traced to spec or MDN

**Research date:** 2026-07-07
**Valid until:** 2026-10-07 (Web Audio API is stable; Vitest API stable within major version)
