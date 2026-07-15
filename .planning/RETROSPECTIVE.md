# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — MVP

**Shipped:** 2026-07-15
**Phases:** 9 | **Plans:** 17 | **Sessions:** several (2026-06-21 → 2026-07-15)

### What Was Built
- Full Core Value loop: add ticket → shared queue → configurable ventanillas → atomic "Llamar siguiente" dequeue, race-free under simultaneous clicks
- Audible beep + visual flash feedback on call, synced inside the user gesture (browser autoplay compliance)
- Distance-readable, privacy-safe waiting-room display (large high-contrast numbers, no patient data)
- localStorage persistence across reloads with defensive recovery from corrupted/missing state
- Full Material Design 3 / Tailwind v4 restyle (Phase 9) with zero functional regressions
- A mid-milestone quick task (CLEAR_TICKET / "eliminar turno") added and integration-verified without reopening the roadmap

### What Worked
- Vertical-slice phasing (each phase = one observable end-to-end capability) kept every phase demoable and requirement-traceable 1:1
- TDD RED/GREEN wave structure (Phases 3-9) caught prop-signature and reducer-shape mismatches before they reached the UI layer
- Deliberately fine-grained phase count (9, not collapsed) gave a full first-time walkthrough of the GSD lifecycle, which was the user's actual stated goal
- Retroactive `/gsd:secure-phase` and `/gsd:validate-phase` runs on Phase 9 closed security and Nyquist gaps same-day, without blocking the rest of the milestone

### What Was Inefficient
- Phase 9 shipped without a goal-backward `VERIFICATION.md`; had to be substituted after the fact with code review + Nyquist + security audits during milestone-audit cleanup — writing it at phase-close would have been cheaper than backfilling three other artifacts to compensate
- One human-UAT item (FEEDBACK-01 audible beep) was never closed out — automated coverage was trusted as a stand-in but a real-browser/audio-hardware check was always going to require an actual human in the loop
- `npm run build` has had a pre-existing `tsc -b` failure (`setupTests.ts` global typing) since Phase 5 that nobody circled back to fix; `vitest run` masked it as "tests pass"

### Patterns Established
- `useReducer` + hand-written `useLocalStorage`-equivalent pattern is sufficient for single-screen apps this size — no state library was ever needed, validating the CLAUDE.md tech-stack guidance
- Beep-before-dispatch ordering (`playBeep()` called before `onCallNext()`) is the reusable pattern for keeping audio inside a synchronous user-gesture context
- `key`-prop remount (fallback to the string `'empty'`, never `null`/`undefined`) is the established idiom for triggering CSS re-flash animations without a library

### Key Lessons
1. Write the phase's `VERIFICATION.md` at phase close, not retroactively — backfilling it after the fact required stitching together review/validation/security artifacts that don't individually answer "did this phase hit its own success criteria."
2. Human-UAT items need an explicit close-out step in the phase checklist, not just an "automated coverage passes" pass-through, or they silently roll forward as milestone-audit tech debt.
3. A build-vs-test-runner mismatch (`tsc -b` fails, `vitest` passes) can hide for many phases if only the test runner is checked in CI/UAT gates — worth adding `npm run build` to the standard phase-close checklist.

### Cost Observations
- Model mix: not tracked this milestone
- Sessions: several across 2026-06-21 → 2026-07-15 (~3.5 weeks elapsed, first full GSD lifecycle run)
- Notable: zero new runtime dependencies added until Phase 9 (Tailwind v4 devDependency only) — matches the CLAUDE.md "what not to use" guidance exactly; no scope crept beyond the original 12 v1 requirements plus one user-requested quick task

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | several | 9 | First full GSD lifecycle walkthrough (questioning → research → requirements → roadmap → planning → execution → audit → close) |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|---------------------|
| v1.0 | 39/39 passing | not formally measured | Tailwind v4 (devDependency, Phase 9 only) |

### Top Lessons (Verified Across Milestones)

1. Vertical-slice phasing plus TDD RED/GREEN waves produced a milestone with 12/12 requirements satisfied and 0 broken integration flows on first audit pass — worth carrying into v1.1 planning as the default phase shape.
