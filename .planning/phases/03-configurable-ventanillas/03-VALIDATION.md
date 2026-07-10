---
phase: 3
slug: configurable-ventanillas
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-06
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.10 |
| **Config file** | `vite.config.ts` (`test: { environment: 'jsdom', setupFiles: './src/setupTests.ts', globals: true }`) |
| **Quick run command** | `npx vitest run src/turnero.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/turnero.test.ts`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| Extend QueueState + ADD_TICKET spread fix | 01 | 1 | WINDOW-01 | — | N/A | unit (reducer) | `npx vitest run src/turnero.test.ts` | ✅ | ⬜ pending |
| ADD_WINDOW reducer case | 01 | 1 | WINDOW-01 | — | N/A | unit (reducer) | `npx vitest run src/turnero.test.ts` | ✅ | ⬜ pending |
| REMOVE_WINDOW reducer case | 01 | 1 | WINDOW-02 | — | N/A | unit (reducer) | `npx vitest run src/turnero.test.ts` | ✅ | ⬜ pending |
| VentanillaCard component + WINDOW-02 guard | 01 | 1 | WINDOW-02 | — | N/A | integration (component) | `npx vitest run src/App.test.tsx` | ❌ W0 | ⬜ pending |
| currentTicket display ("sin turno" / "Turno N") | 01 | 1 | WINDOW-03 | — | N/A | integration (component) | `npx vitest run src/App.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/App.test.tsx` — integration tests covering WINDOW-02 warning behavior and WINDOW-03 display logic ("sin turno" / "Turno N")
- [ ] Add `"test": "vitest run"` to `package.json` scripts (currently absent — only `npx vitest run` works)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Grid layout looks correct with 1, 3, and 6+ cards | WINDOW-01 | Visual layout; automated tests can't check grid flow | Add 1, 3, and 6 ventanillas; verify grid reflows correctly |
| Remove × button is visually unobtrusive and positioned in card corner | WINDOW-02 | Visual design | Add a ventanilla; verify × is small and top-right |
| Warning text is visible and does not push other cards | WINDOW-02 | Visual layout | Manually set a ticket on a card (Phase 4 will do this; for now verify the text renders where expected) |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
