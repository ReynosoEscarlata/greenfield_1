---
phase: 1
slug: project-scaffold-visible-shell
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-21
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None installed yet — greenfield project, no test runner exists before scaffolding |
| **Config file** | none — see Wave 0 Requirements |
| **Quick run command** | `npm run build` (`tsc -b && vite build`) |
| **Full suite command** | `npm run build` (same — no unit test suite exists or is in scope for Phase 1) |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build` + manual `npm run dev` visual check
- **Before `/gsd:verify-work`:** `npm run build` must succeed AND a human/visual confirmation that the browser renders the title + two placeholder regions per `01-UI-SPEC.md`
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | (none — foundational) | — | N/A | build | `npm run build` | ✅ N/A — enforced by `tsc -b` inside build script | ⬜ pending |
| 01-01-02 | 01 | 1 | (none — foundational) | — | N/A | smoke (manual visual) | `npm run dev` then visually confirm in browser | ✅ N/A — manual smoke check, no test file needed | ⬜ pending |
| 01-01-03 | 01 | 1 | (none — foundational) | — | N/A | manual/visual review | visual diff against `01-UI-SPEC.md` Layout Contract | ✅ N/A — UI-SPEC.md is the acceptance reference | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements.* No test framework (Vitest) is installed, and none is needed for Phase 1 — there is no business logic to unit test yet (no reducer, no components with conditional behavior). Introducing Vitest in Phase 1 would itself be scope creep relative to PITFALLS.md's Pitfall 7 warning. Vitest should be introduced starting Phase 2, when the queue reducer is added.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Dev server renders a page (not blank/error) | (none — foundational) | No test file is meaningful for a first-paint smoke check on a greenfield scaffold | Run `npm run dev`, open the printed local URL, confirm the browser shows the title "Turnero" and the queue/ventanillas placeholder regions, not a blank screen or error overlay |
| Shell layout matches placeholder contract | (none — foundational) | Visual layout correctness (queue strip on top, ventanillas grid below) is not meaningfully assertable without a visual regression tool, which is out of scope for this phase | Compare rendered page against `01-UI-SPEC.md` Layout Contract by eye |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (none — no test framework needed yet)
- [x] No watch-mode flags
- [x] Feedback latency < 10s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-06-21
