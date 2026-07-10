---
phase: 2
slug: add-ticket-view-queue
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-22
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (+ @testing-library/react, @testing-library/jest-dom, jsdom) — none installed yet, user confirmed install now rather than defer |
| **Config file** | `vite.config.ts` `test` block, or a separate `vitest.config.ts` — none exists yet, Wave 0 installs |
| **Quick run command** | `npx vitest run src/turnero.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5-10 seconds (single small reducer test file) |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run` (once Wave 0 installs the framework) — before that, `npm run build` (tsc -b + vite build)
- **After every plan wave:** Run `npx vitest run` and `npm run build`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 02-01-W0 | 01 | 0 | — | — | N/A | install | `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom` | ❌ W0 | ⬜ pending |
| 02-01-01 | 01 | 1 | QUEUE-01 | — | N/A | unit | `npx vitest run src/turnero.test.ts` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | QUEUE-02 | — | N/A | unit | `npx vitest run src/turnero.test.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom` — no test framework installed in repo as of Phase 1
- [ ] `vitest.config.ts` (or `test` block in `vite.config.ts`) — none exists
- [ ] `src/turnero.test.ts` stubs — unit tests for QUEUE-01 (counter independence, sequential numbering) and QUEUE-02 (ordered list rendering / empty state)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Visual chip layout (horizontal wrapping row, D-05) | QUEUE-02 | Layout/visual correctness is not meaningfully assertable via unit test without a visual-regression tool, out of scope for this small phase | Run `npm run dev`, click "Agregar turno" several times, confirm chips wrap onto a new line instead of scrolling sideways or stacking vertically |
| "Turno N" label format on screen (D-04) | QUEUE-01 | Cosmetic text rendering — covered indirectly by unit test asserting the rendered string, but final visual confirmation is manual | Same dev server check — confirm chip text reads "Turno 1", "Turno 2", etc. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
