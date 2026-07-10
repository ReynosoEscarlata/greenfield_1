---
phase: 7
slug: distance-readable-privacy-safe-display
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-08
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.10 |
| **Config file** | `vite.config.ts` (inline test config) |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 7-01-01 | 01 | 1 | PRIVACY-01 | — | VentanillaCard renders only ticket number, no patient identifier | unit | `npm test` | ❌ Wave 0 | ⬜ pending |
| 7-01-02 | 01 | 1 | DISPLAY-01 | — | `.ventanilla-ticket` element present with expected class | structural | `npm test` | ✅ (covered by FEEDBACK-02) | ⬜ pending |
| 7-01-03 | 01 | 1 | DISPLAY-01 | — | Ticket number 48px bold readable at 3m | visual-only | manual `npm run dev` + visual check | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/App.test.tsx` — append `describe('PRIVACY-01: No patient-identifying data rendered', ...)` block with 2 tests:
  1. Active ticket renders only "Turno N" text (no name or identifier)
  2. No-ticket state renders only "sin turno" text

*All other test infrastructure (Vitest, setupTests.ts, AudioContext mock) is already in place.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Ticket numbers legible at 3m in 5 seconds | DISPLAY-01 | jsdom has no layout engine — cannot measure rendered px size | Run `npm run dev`, open in browser at 100% zoom, render 3+ ventanillas, step back ~3 meters and verify ticket numbers are readable |
| Flash animation visually proportionate at 48px | DISPLAY-01 | Visual quality judgment | After font-size change, call a ticket and observe flash animation — confirm `border-radius: 4px` looks proportionate on large text |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
