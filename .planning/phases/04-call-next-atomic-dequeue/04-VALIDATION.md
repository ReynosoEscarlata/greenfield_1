---
phase: 4
slug: call-next-atomic-dequeue
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-07
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.10 |
| **Config file** | `vite.config.ts` (vitest config inline — already set up in Phase 2) |
| **Quick run command** | `npm test` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test`
- **After every plan wave:** Run `npm test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 4-01-01 | 01 | 1 | CALL-01 | — | CALL_NEXT dequeues head and sets currentTicket (unit test) | unit | `npm test -- src/turnero.test.ts` | ✅ extend | ⬜ pending |
| 4-01-02 | 01 | 1 | CALL-01 | — | CALL_NEXT on empty queue returns state unchanged (no-op) | unit | `npm test -- src/turnero.test.ts` | ✅ extend | ⬜ pending |
| 4-01-03 | 01 | 1 | CALL-01 | — | CALL_NEXT replaces existing currentTicket (replace-always) | unit | `npm test -- src/turnero.test.ts` | ✅ extend | ⬜ pending |
| 4-01-04 | 01 | 1 | CALL-02 | — | WR-02: REMOVE_WINDOW is no-op when currentTicket non-null (reducer) | unit | `npm test -- src/turnero.test.ts` | ✅ extend | ⬜ pending |
| 4-01-05 | 01 | 1 | CALL-01 | — | Button click dispatches CALL_NEXT; card shows new ticket | integration | `npm test -- src/App.test.tsx` | ✅ extend | ⬜ pending |
| 4-01-06 | 01 | 1 | CALL-02 | — | Empty-queue warning appears immediately on click | integration | `npm test -- src/App.test.tsx` | ✅ extend | ⬜ pending |
| 4-01-07 | 01 | 1 | CALL-02 | — | Empty-queue warning auto-dismisses after 2 seconds (fake timers + act) | integration | `npm test -- src/App.test.tsx` | ✅ extend | ⬜ pending |
| 4-01-08 | 01 | 1 | CALL-01 | T-WR-01 | WR-01: showWarning clears when ventanilla.currentTicket changes to null | integration | `npm test -- src/App.test.tsx` | ✅ extend | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements.*

`src/turnero.test.ts` and `src/App.test.tsx` both exist and are loaded by Vitest. No new test files, fixtures, or framework installs are required. The Red (failing) tests are written as the first task in Plan 01.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| "Llamar siguiente" button is full-width at bottom of card | CALL-01 / D-07 | CSS layout — hard to assert dimensions in JSDOM | Visually inspect in browser: button spans full card width, sits below ticket display |
| Empty-queue warning renders inline inside the calling card only | CALL-02 / D-04 | Cross-component isolation — JSDOM doesn't test visual containment | Open app, add 0 tickets, click "Llamar siguiente" on one card — warning appears only in that card, not others |
| Button remains usable after empty-queue warning and dismiss | CALL-02 | Behavioral sequence — clicks after timer expiry | Click on empty queue → wait 2 seconds → click again → second warning appears |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
