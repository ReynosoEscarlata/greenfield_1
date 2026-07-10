---
phase: 6
slug: call-transition-animation
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-07-07
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.10 + `@testing-library/react` 16.3.2 |
| **Config file** | `vite.config.ts` (test.environment: 'jsdom', test.setupFiles: './src/setupTests.ts', test.globals: true) |
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

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 06-01-T1 | 06-01 | 1 | FEEDBACK-02 | — | N/A | unit (jsdom) TDD RED | `npm test` (expected NON-ZERO — 3 FEEDBACK-02 failures) | ❌ Wave 1 adds FEEDBACK-02 describe block to App.test.tsx | ⬜ pending |
| 06-02-T1 | 06-02 | 2 | FEEDBACK-02 | — | N/A | source assertion | `grep -c "ticket-flash" src/index.css` (expected ≥ 3) | ❌ Wave 2 adds @keyframes + .ventanilla-ticket-flash to index.css | ⬜ pending |
| 06-02-T2 | 06-02 | 2 | FEEDBACK-02 | — | N/A | unit (jsdom) TDD GREEN | `npm test` (expected exit 0, 26 tests green) | ❌ Wave 2 adds key prop + conditional class to App.tsx | ⬜ pending |
| 06-02-T3 | 06-02 | 2 | FEEDBACK-02 | — | N/A | manual (visual) | Visual inspection in browser | N/A — checkpoint:human-verify | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements.* No new files or packages needed:
- `App.test.tsx` exists — add new describe block only
- `setupTests.ts` requires NO changes for animation tests
- `@testing-library/jest-dom` (toHaveClass) already installed and imported

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Animation actually plays and fades on call | FEEDBACK-02 | jsdom cannot run CSS animations | Press "Llamar siguiente" on any ventanilla with a ticket queued; verify amber flash appears on the ticket number `<p>` and fades within ~600ms |
| Animation restarts on rapid successive calls | FEEDBACK-02 (D-05) | jsdom cannot run CSS animations | Press "Llamar siguiente" twice quickly; verify each call triggers a fresh flash from full amber |
| No animation on page load | FEEDBACK-02 (D-06) | jsdom cannot observe mount-time animation behavior | Reload the page; verify no amber flash appears on any ventanilla |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (no Wave 0 needed — existing infra covers all)
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-07-07
