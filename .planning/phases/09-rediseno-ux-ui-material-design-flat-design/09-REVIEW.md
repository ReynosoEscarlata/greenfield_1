---
phase: 09-rediseno-ux-ui-material-design-flat-design
reviewed: 2026-07-10T00:00:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - index.html
  - package.json
  - src/App.tsx
  - src/index.css
  - vite.config.ts
findings:
  critical: 0
  warning: 3
  info: 1
  total: 4
status: issues_found
---

# Phase 09: Code Review Report

**Reviewed:** 2026-07-10
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

## Summary

Five source files reviewed: the HTML entry point, the package manifest, the main React component (`App.tsx`), the global stylesheet (`index.css`), and the Vite/Vitest config. The implementation is generally sound — the reducer logic is correct, the Tailwind v4 + MD3 token approach is clean, and the animation technique (key-prop remount) is appropriate.

Three defects were found. None is a data-loss or security vulnerability. The most consequential is a missing runtime validation on the `localStorage` deserialization path, which can silently corrupt application state when stored data is from a previous schema version. The other two are an incorrect HTML `lang` attribute (accessibility impact) and a missing `AudioContext.resume()` guard (beep failure on iOS Safari).

No critical issues found.

---

## Warnings

### WR-01: Unsafe `as QueueState` cast — no runtime schema validation on deserialized localStorage data

**File:** `src/App.tsx:91-97`

**Issue:** `loadFromStorage` parses JSON from `localStorage` and casts the result directly to `QueueState` using a TypeScript `as` assertion. TypeScript's `as` is a compile-time fiction — it performs no runtime check. If the persisted blob is missing any field (e.g., `nextWindowNumber`, which was added in a later phase than the initial `queue`/`nextNumber` pair), the field will be `undefined` at runtime. Downstream code that reads `state.nextWindowNumber + 1` will then produce `NaN`, which propagates through every subsequent `ADD_WINDOW` dispatch and permanently corrupts the counter. This is a real risk any time the `QueueState` schema evolves and a user has existing localStorage data.

Current code:
```ts
function loadFromStorage(): QueueState {
  try {
    return JSON.parse(localStorage.getItem('turnero-v1') ?? '') as QueueState
  } catch {
    return initialState
  }
}
```

**Fix:** Merge the parsed value with `initialState` so every field has a safe fallback, and handle the null-key case explicitly rather than relying on `JSON.parse('')` to throw:

```ts
function loadFromStorage(): QueueState {
  try {
    const raw = localStorage.getItem('turnero-v1')
    if (!raw) return initialState
    const parsed = JSON.parse(raw) as Partial<QueueState>
    // Merge with initialState so any missing field (schema migration)
    // falls back to the correct default rather than becoming undefined.
    return { ...initialState, ...parsed }
  } catch {
    return initialState
  }
}
```

---

### WR-02: `index.html` declares `lang="en"` but the entire UI is in Spanish

**File:** `index.html:2`

**Issue:** The `<html lang="en">` attribute tells screen readers, search engines, and browser spell-checkers that the page language is English. The full UI — all button labels, headings, warnings, and ticket text — is in Spanish. Screen readers (NVDA, JAWS, VoiceOver) will apply English phoneme rules when announcing Spanish words, producing garbled or incomprehensible speech for users who rely on assistive technology.

**Fix:**
```html
<html lang="es">
```

---

### WR-03: `AudioContext` is never resumed — beep silently fails on iOS Safari and some Chromium variants

**File:** `src/useBeep.ts:6-20`

**Issue:** The module-level `audioCtx` is lazily created on the first `play()` call (which is inside a click handler — correct). However, several browser implementations (notably iOS Safari and early Chromium builds) start a newly created `AudioContext` in the `"suspended"` state even when created synchronously inside a user gesture. The `osc.start()` / `osc.stop()` calls schedule audio on a suspended context, so the sound is silently dropped without any error. The `try/catch` around the entire block swallows this failure, so no diagnostic is produced and the call-next flow continues without the auditory signal.

Current code (no resume call before scheduling):
```ts
const ctx = audioCtx
const now = ctx.currentTime    // ctx may be suspended — currentTime is 0
const osc = ctx.createOscillator()
// ...
osc.start(now)                 // silently no-ops on suspended context
```

**Fix:** Call `ctx.resume()` before scheduling audio. `resume()` returns a Promise; fire-and-forget is acceptable here since it resolves within the same event-loop tick on most platforms:

```ts
export function useBeep() {
  function play(): void {
    try {
      if (!audioCtx) {
        audioCtx = new AudioContext()
      }
      const ctx = audioCtx
      // Resume suspended context (required on iOS Safari).
      if (ctx.state === 'suspended') {
        ctx.resume()  // fire-and-forget; resolves synchronously on most platforms
      }
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
    } catch {
      // silent — audio failure must not interrupt call-next flow
    }
  }

  return { play }
}
```

---

## Info

### IN-01: `JSON.parse('')` used as a predictable control-flow path (addressed by WR-01 fix)

**File:** `src/App.tsx:93`

**Issue:** When `localStorage.getItem('turnero-v1')` returns `null` (first run), the null-coalescing `?? ''` substitutes an empty string, causing `JSON.parse('')` to throw a `SyntaxError`. The `catch` block then returns `initialState`. This is functionally correct but uses exception handling for a routine, expected case (no prior stored state), making the control flow non-obvious to readers. The fix described in WR-01 (explicit `null` check before parsing) eliminates this pattern.

---

_Reviewed: 2026-07-10_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
