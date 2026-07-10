---
phase: 8
slug: persistence-across-reloads
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-09
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^4.1.10 |
| **Config file** | `vite.config.ts` (test section: `environment: 'jsdom'`, `setupFiles: './src/setupTests.ts'`, `globals: true`) |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~3 seconds (28 existing + 5 new tests) |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test` (full suite)
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~3 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 8-01-01 | 01 | 1 | PERSIST-01 SC-1 | — | Persisted queue + ventanilla state renders after reload | integration | `npm test` | ❌ W0 | ⬜ pending |
| 8-01-02 | 01 | 1 | PERSIST-01 SC-2a | — | Missing key → empty state (no crash) | integration | `npm test` | ❌ W0 | ⬜ pending |
| 8-01-03 | 01 | 1 | PERSIST-01 SC-2b | — | Corrupted JSON → empty state (no crash) | integration | `npm test` | ❌ W0 | ⬜ pending |
| 8-01-04 | 01 | 1 | PERSIST-01 SC-3 | — | mockPlay NOT called on initial render with persisted non-null ticket | integration | `npm test` | ❌ W0 | ⬜ pending |
| 8-01-05 | 01 | 1 | PERSIST-01 save | — | localStorage updated after dispatch | integration | `npm test` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/App.test.tsx` — append `describe('PERSIST-01: Persistence across reloads', ...)` block (5 new test cases)
- [ ] Add `import App from './App'` and `import type { QueueState } from './turnero'` to top of `App.test.tsx` (if not already present)

*Note: `localStorage.clear()` and `mockPlay.mockClear()` must be added to a `beforeEach` inside the PERSIST-01 describe block to prevent cross-test storage pollution (jsdom localStorage is shared within a file).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Flash animation timing on reload | PERSIST-01 SC-3 (animation) | jsdom does not execute CSS `@keyframes` animations — class presence is verifiable but actual animation playback is not | Load app with persisted non-null ticket, observe that the ticket display does not visually flash on reload (the key-prop trick prevents re-mount animation on initial render) |

*Note: The no-beep regression is fully automated via `mockPlay` spy. Only animation timing requires a manual check.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
