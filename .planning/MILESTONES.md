# Milestones

## v1.0 MVP (Shipped: 2026-07-15)

**Phases completed:** 9 phases, 17 plans, 18 tasks

**Key accomplishments:**

- Built the full Core Value loop end-to-end: add ticket → shared queue → configurable ventanillas → atomic "Llamar siguiente" dequeue with no duplicate/skipped tickets under simultaneous clicks (Phases 1-4)
- Added audible beep + visual flash feedback on every call, fired synchronously inside the user gesture per browser autoplay policy (Phases 5-6)
- Delivered a distance-readable, privacy-safe waiting-room display — large high-contrast ticket numbers, zero patient-identifying data by design (Phase 7)
- Made queue and ventanilla state survive page reloads with defensive recovery from corrupted/missing localStorage (Phase 8)
- Restyled the entire app to Material Design 3 with Tailwind CSS v4 — sticky Top App Bar, MD3 color tokens, tonal/filled/outlined button hierarchy — with zero functional regressions (Phase 9)
- Shipped all 12 v1 requirements with 39/39 automated tests passing, using TDD RED/GREEN discipline across every feature phase

**Known deferred items at close:** 7 (see STATE.md Deferred Items — all documentation/human-UAT/minor tech-debt gaps, no functional defects; see .planning/milestones/v1.0-MILESTONE-AUDIT.md for full detail)

---
