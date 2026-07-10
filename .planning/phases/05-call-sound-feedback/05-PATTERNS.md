# Phase 5: Call Sound Feedback - Pattern Map

**Mapped:** 2026-07-07
**Files analyzed:** 4 (1 new, 3 modified; 1 read-only)
**Analogs found:** 4 / 4

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/useBeep.ts` | hook/utility | event-driven | `src/turnero.ts` | role-match (module-level state + exported function) |
| `src/App.tsx` (VentanillaCard) | component | request-response | `src/App.tsx` (existing VentanillaCard) | exact (extend in-place) |
| `src/setupTests.ts` | config/test-setup | — | `src/setupTests.ts` (existing file) | exact (extend in-place) |
| `src/App.test.tsx` | test | request-response | `src/App.test.tsx` (existing describe blocks) | exact (add new describe block) |

---

## Pattern Assignments

### `src/useBeep.ts` (hook, event-driven) — NEW FILE

**Analog:** `src/turnero.ts`

The existing `turnero.ts` establishes the project's module pattern for custom logic: module-level state, exported functions/values, TypeScript types at the top, no default exports (uses named exports). `useBeep.ts` follows the same skeleton.

**Module-level state pattern** (`src/turnero.ts` lines 40–45):
```typescript
export const initialState: QueueState = {
  queue: [],
  nextNumber: 1,
  ventanillas: [],
  nextWindowNumber: 1,
}
```
Apply to `useBeep.ts` as: module-level singleton variable (not inside the hook body):
```typescript
let audioCtx: AudioContext | null = null
```

**Named export pattern** (`src/turnero.ts` lines 47, 4):
```typescript
export function queueReducer(state: QueueState, action: QueueAction): QueueState {
// ...
export type Ticket = {
```
Apply to `useBeep.ts` as:
```typescript
export function useBeep() {
  function play() { ... }
  return { play }
}
```

**Silent error handling pattern** — established by D-07 and referenced in CONTEXT.md `Established Patterns` section. No existing analog in codebase (first `try/catch` of this kind), but the pattern is mandated:
```typescript
try {
  // Web Audio API calls
} catch {
  // Silent — audio failure must not interrupt call-next flow
}
```

**Complete implementation to copy** (from RESEARCH.md `Code Examples`, lines 348–384):
```typescript
let audioCtx: AudioContext | null = null

export function useBeep() {
  function play() {
    try {
      if (!audioCtx) {
        audioCtx = new AudioContext()
      }
      const ctx = audioCtx
      const now = ctx.currentTime

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(880, now)

      gain.gain.setValueAtTime(0.3, now)
      // Target MUST be > 0 — exponential ramp is undefined at exactly 0
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.2)
    } catch {
      // Silent — audio failure must not interrupt call-next flow (D-07)
    }
  }

  return { play }
}
```

---

### `src/App.tsx` — VentanillaCard (component, request-response) — MODIFY

**Analog:** `src/App.tsx` (existing VentanillaCard, lines 5–79)

This is an in-place modification. Three surgical changes required.

**Existing `Readonly<{...}>` props pattern** (`src/App.tsx` lines 5–15):
```typescript
export function VentanillaCard({
  ventanilla,
  onRemove,
  onCallNext,
  isQueueEmpty,
}: Readonly<{
  ventanilla: Ventanilla
  onRemove: (id: number) => void
  onCallNext: (id: number) => void
  isQueueEmpty: boolean
}>) {
```
Replace `isQueueEmpty: boolean` with `queueLength: number` — keep the `Readonly<{...}>` wrapper (SonarLint S6759, project convention):
```typescript
export function VentanillaCard({
  ventanilla,
  onRemove,
  onCallNext,
  queueLength,
}: Readonly<{
  ventanilla: Ventanilla
  onRemove: (id: number) => void
  onCallNext: (id: number) => void
  queueLength: number
}>) {
```

**Existing `handleCallNext` click handler** (`src/App.tsx` lines 42–48):
```typescript
function handleCallNext() {
  if (isQueueEmpty) {
    setShowEmptyWarning(true)
    return
  }
  onCallNext(ventanilla.id)
}
```
Replace with (add `useBeep` hook call at component top, and insert `playBeep()` before `onCallNext`):
```typescript
// At top of VentanillaCard body (after existing useState calls):
const { play: playBeep } = useBeep()

// Replace handleCallNext:
function handleCallNext() {
  if (queueLength === 0) {
    setShowEmptyWarning(true)
    return
  }
  playBeep()            // MUST be before onCallNext — keeps call inside user gesture
  onCallNext(ventanilla.id)
}
```

**Existing `useBeep` import pattern** (`src/App.tsx` lines 1–3 — current imports):
```typescript
import { useState, useReducer, useEffect } from 'react'
import { queueReducer, initialState } from './turnero'
import type { Ventanilla } from './turnero'
```
Add one import line below the existing imports:
```typescript
import { useBeep } from './useBeep'
```

**Existing VentanillaCard JSX prop pass-through** (`src/App.tsx` lines 124–130):
```typescript
<VentanillaCard
  key={v.id}
  ventanilla={v}
  onRemove={(id) => dispatch({ type: 'REMOVE_WINDOW', id })}
  onCallNext={(id) => dispatch({ type: 'CALL_NEXT', windowId: id })}
  isQueueEmpty={state.queue.length === 0}
/>
```
Replace `isQueueEmpty={state.queue.length === 0}` with `queueLength={state.queue.length}`:
```typescript
<VentanillaCard
  key={v.id}
  ventanilla={v}
  onRemove={(id) => dispatch({ type: 'REMOVE_WINDOW', id })}
  onCallNext={(id) => dispatch({ type: 'CALL_NEXT', windowId: id })}
  queueLength={state.queue.length}
/>
```

---

### `src/setupTests.ts` (config/test-setup) — MODIFY

**Analog:** `src/setupTests.ts` (current file, line 1):
```typescript
import '@testing-library/jest-dom'
```

This file is run before every test because of `setupFiles: './src/setupTests.ts'` in `vite.config.ts`. The existing single-line pattern simply imports jest-dom matchers globally. The new global `AudioContext` mock is appended after that import.

**Pattern to append** (from RESEARCH.md `Code Examples`, lines 394–419):
```typescript
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

Note: `vi` is available globally in `setupTests.ts` without import because `globals: true` is set in `vite.config.ts`.

---

### `src/App.test.tsx` (test, request-response) — MODIFY

**Analog:** `src/App.test.tsx` (existing describe blocks, lines 1–116)

**Existing test file structure** (`src/App.test.tsx` lines 1–3):
```typescript
import { render, screen, fireEvent, act } from '@testing-library/react'
import { VentanillaCard } from './App'
```
Add module mock at the top (before existing imports) and `mockPlay` variable:
```typescript
const mockPlay = vi.fn()

vi.mock('./useBeep', () => ({
  useBeep: () => ({ play: mockPlay }),
}))
```
Note: `vi.mock` is hoisted by Vitest automatically — it will run before any imports.

**Existing `describe`/`it`/`vi.fn()` pattern** (`src/App.test.tsx` lines 49–63):
```typescript
describe('CALL-01: Llamar siguiente dispatches CALL_NEXT', () => {
  it('calls onCallNext with ventanilla id when queue is not empty', () => {
    const onCallNext = vi.fn()
    render(
      <VentanillaCard
        ventanilla={{ id: 1, number: 1, currentTicket: null }}
        onRemove={() => {}}
        onCallNext={onCallNext}
        isQueueEmpty={false}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /llamar siguiente/i }))
    expect(onCallNext).toHaveBeenCalledWith(1)
  })
})
```
Apply this pattern for the new FEEDBACK-01 describe block. Note: after the prop rename, ALL existing renders must change `isQueueEmpty={false}` → `queueLength={1}` (or any positive number) and `isQueueEmpty={true}` → `queueLength={0}`.

**New describe block to add** (from RESEARCH.md `Code Examples`, lines 503–518):
```typescript
describe('FEEDBACK-01: Beep on successful call', () => {
  beforeEach(() => {
    mockPlay.mockClear()
  })

  it('calls play() when queue has tickets', () => {
    render(
      <VentanillaCard
        ventanilla={{ id: 1, number: 1, currentTicket: null }}
        onRemove={() => {}}
        onCallNext={() => {}}
        queueLength={1}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /llamar siguiente/i }))
    expect(mockPlay).toHaveBeenCalledOnce()
  })

  it('does not call play() when queue is empty', () => {
    render(
      <VentanillaCard
        ventanilla={{ id: 1, number: 1, currentTicket: null }}
        onRemove={() => {}}
        onCallNext={() => {}}
        queueLength={0}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /llamar siguiente/i }))
    expect(mockPlay).not.toHaveBeenCalled()
  })
})
```

**Existing prop updates required in all existing test renders** — every render call that passes `isQueueEmpty` must be updated:

| Current (`src/App.test.tsx` line) | Change from | Change to |
|----------------------------------|-------------|-----------|
| Line 11 | `isQueueEmpty={false}` | `queueLength={1}` |
| Line 24 | `isQueueEmpty={false}` | `queueLength={1}` |
| Line 38 | `isQueueEmpty={false}` | `queueLength={1}` |
| Line 56 | `isQueueEmpty={false}` | `queueLength={1}` |
| Line 79 | `isQueueEmpty={true}` | `queueLength={0}` |
| Line 99 | `isQueueEmpty={false}` | `queueLength={1}` |
| Line 109 | `isQueueEmpty={true}` | `queueLength={0}` |

---

### `src/turnero.test.ts` — READ ONLY

No changes needed. The reducer tests are pure unit tests of `queueReducer` with no dependency on `VentanillaCard` props or `useBeep`. The `CALL_NEXT` reducer already handles the empty-queue case as a no-op (line 87: `if (state.queue.length === 0) return state`).

---

## Shared Patterns

### `Readonly<{...}>` Props (SonarLint S6759)
**Source:** `src/App.tsx` lines 10–15
**Apply to:** VentanillaCard `queueLength` prop addition
```typescript
}: Readonly<{
  ventanilla: Ventanilla
  onRemove: (id: number) => void
  onCallNext: (id: number) => void
  queueLength: number   // new — replaces isQueueEmpty: boolean
}>)
```

### Named Export Pattern
**Source:** `src/turnero.ts` line 47 and `src/App.tsx` line 5
**Apply to:** `src/useBeep.ts`
```typescript
export function useBeep() { ... }   // named export, no default
```

### `vi.fn()` Spy Pattern
**Source:** `src/App.test.tsx` lines 21, 34
**Apply to:** New FEEDBACK-01 describe block in `src/App.test.tsx`
```typescript
const onCallNext = vi.fn()
// ... render ...
expect(onCallNext).toHaveBeenCalledWith(1)
```

### `beforeEach` / `afterEach` Lifecycle in Tests
**Source:** `src/App.test.tsx` lines 67–71
**Apply to:** New FEEDBACK-01 describe block
```typescript
beforeEach(() => {
  mockPlay.mockClear()
})
```

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/useBeep.ts` (Web Audio internals) | hook | event-driven | No existing Web Audio API usage in codebase — first browser audio module. RESEARCH.md patterns are authoritative. |

---

## Critical Ordering Notes

1. `vi.mock('./useBeep', ...)` must appear at the top of `App.test.tsx` (Vitest hoists it before imports automatically).
2. `playBeep()` must be called BEFORE `onCallNext(ventanilla.id)` in `handleCallNext` to remain inside the synchronous user-gesture context (browser autoplay policy).
3. The `audioCtx` module-level variable in `useBeep.ts` is a singleton — tests mock the entire `useBeep` module rather than asserting on `AudioContext` constructor calls, to avoid test-order fragility (RESEARCH.md Pitfall 4).
4. `exponentialRampToValueAtTime` target must be `0.001`, never `0` (RESEARCH.md Pitfall 3).

---

## Metadata

**Analog search scope:** `src/` directory (all `.ts`, `.tsx`, `.test.ts`, `.test.tsx` files)
**Files scanned:** 5 (`App.tsx`, `turnero.ts`, `App.test.tsx`, `turnero.test.ts`, `setupTests.ts`)
**Pattern extraction date:** 2026-07-07
