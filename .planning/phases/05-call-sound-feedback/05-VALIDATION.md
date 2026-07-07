---
phase: 5
slug: call-sound-feedback
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-07
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.10 + @testing-library/react 16.3.2 |
| **Config file** | `vite.config.ts` (test block: `environment: 'jsdom'`, `setupFiles: './src/setupTests.ts'`, `globals: true`) |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------------|-----------|-------------------|-------------|--------|
| 05-01-T1 | 05-01 | 1 | FEEDBACK-01 | AudioContext mock prevents real audio in tests | setup | `npx tsc --noEmit` | ❌ W0 | ⬜ pending |
| 05-01-T2 | 05-01 | 1 | FEEDBACK-01 | Tests exist that verify beep fires / does not fire | red | `npm test` (expect non-zero / TypeScript errors) | ❌ W0 | ⬜ pending |
| 05-02-T1 | 05-02 | 2 | FEEDBACK-01 | `play()` uses try/catch — audio failure never interrupts call-next | unit | `npm test` | ❌ W0 | ⬜ pending |
| 05-02-T2 | 05-02 | 2 | FEEDBACK-01 | `playBeep()` called before `onCallNext()` in click handler (user gesture sync) | integration | `npm test` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/useBeep.ts` — stub with empty `play()` export (must exist before Red tests can import it)
- [ ] `src/setupTests.ts` — add `global.AudioContext = vi.fn().mockImplementation(...)` after `import '@testing-library/jest-dom'`
- [ ] `src/App.test.tsx` — add `vi.mock('./useBeep', ...)` + new `describe('FEEDBACK-01: ...')` block with 2 tests

*All three are created/modified in 05-01 (Wave 1). Wave 0 infrastructure ships as part of the TDD RED phase.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Beep does NOT play on page load or reload | FEEDBACK-01 SC2 | jsdom cannot verify actual audio output or distinguish load-time vs click-time; `useEffect`-free design is the guarantee | 1. `npm run dev` 2. Load/reload the page 3. Verify no sound plays on load. 4. Click "Llamar siguiente" with tickets in queue → verify beep is heard |
| Beep is audible and perceptibly pleasant at 880 Hz / 200ms / gain 0.3 | FEEDBACK-01 SC1 | Subjective audio quality cannot be verified by test assertions | Run `npm run dev`, add a ticket, click "Llamar siguiente" — a brief, clean beep should sound |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags (`npm test` uses `vitest run`, not `vitest watch`)
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
