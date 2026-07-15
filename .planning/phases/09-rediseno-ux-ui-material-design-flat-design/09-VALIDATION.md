---
phase: 9
slug: rediseno-ux-ui-material-design-flat-design
date: 2026-07-10
status: audited
nyquist_compliant: true
wave_0_complete: true
---

# Phase 9 — Validation Strategy

## Overview

Phase 9 adds no new requirements. All v1 requirements are already validated by the existing 33-test suite. Validation strategy: run the full suite as a regression harness after each file change. All 33 tests must pass without modification to test files.

## Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.10 |
| Config file | `vite.config.ts` (embedded `test:` block) |
| Quick run command | `npm test` |
| Full suite command | `npm test` |
| Test setup | `src/setupTests.ts` — mocks AudioContext, imports jest-dom |
| Baseline | 33 tests, 2 files, all passing (verified 2026-07-10) |
| Max runtime | ~3 seconds |

## Phase Requirements → Test Map

| Test Suite | Tests | Behavior Verified | Automated Command | File |
|------------|-------|------------------|-------------------|------|
| FEEDBACK-02 | 3 | `.ventanilla-ticket-flash` class present in DOM when ticket non-null; absent when null | `npm test` | `src/App.test.tsx` |
| WINDOW-03, WINDOW-02 | 3 | Ventanilla display, remove guard | `npm test` | `src/App.test.tsx` |
| CALL-01, CALL-02 | 2 | Call next dispatch, empty queue warning | `npm test` | `src/App.test.tsx` |
| WR-01 | 1 | Warning reset on external state change | `npm test` | `src/App.test.tsx` |
| FEEDBACK-01 | 2 | Beep on successful call | `npm test` | `src/App.test.tsx` |
| PRIVACY-01 | 2 | No patient data in DOM | `npm test` | `src/App.test.tsx` |
| PERSIST-01 | 5 | localStorage persistence | `npm test` | `src/App.test.tsx` |
| Reducer (turnero.test.ts) | 14 | Pure reducer logic | `npm test` | `src/turnero.test.ts` |

## Critical Invariant: FEEDBACK-02

The three FEEDBACK-02 tests (`App.test.tsx`) call `toHaveClass('ventanilla-ticket-flash')` directly on the ticket `<p>` element. These tests verify that `.ventanilla-ticket-flash` is applied as a class name in the DOM — not that animation plays. They will fail if:

- The class is renamed (e.g., to `.ticket-flash`)
- The class is migrated to a Tailwind `@utility` that changes cascade layer
- The conditional className logic in `VentanillaCard` is modified

Plan 09-02 preserves `.ventanilla-ticket-flash` as plain CSS outside any `@layer`. Plan 09-03 preserves the conditional `className` logic unchanged.

## Sampling Rate

| Checkpoint | Command | Expected |
|------------|---------|----------|
| After Wave 1 (09-01: install + config) | `npm test` | 33 passed |
| After Plan 09-02 (index.css replacement) | `npm test` | 33 passed |
| After Plan 09-03 (App.tsx JSX rewrite) | `npm test` | 33 passed |
| Phase gate (before `/gsd:verify-work`) | `npm test` | 33 passed, 0 failed |

## Wave 0 Gaps

None — existing test infrastructure covers all phase requirements. No new test scaffolding needed. Wave 1 work is installation only.

## Validation Audit 2026-07-15

Re-audited against the current codebase (baseline in this doc predates the `260714-sd4` quick task, which added `CLEAR_TICKET`/"Eliminar turno" and is out of Phase 9's scope).

| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Resolved | 0 |
| Escalated | 0 |

**Cross-reference:** All 8 requirement/reducer describe blocks listed in the Phase Requirements → Test Map above (`FEEDBACK-02`, `WINDOW-03`, `WINDOW-02`, `CALL-01`, `CALL-02`, `WR-01`, `FEEDBACK-01`, `PRIVACY-01`, `PERSIST-01`, reducer suite) confirmed still present and passing via `grep -n "describe(" src/App.test.tsx src/turnero.test.ts` and a live `npm test` run.

**Current baseline:** 39 tests, 2 files, all passing (verified 2026-07-15) — up from the 33-test baseline recorded above; the +6 tests are `CLEAR-01`/`CLEAR-02` from the post-Phase-9 quick task, not a Phase 9 deliverable.

**Verdict:** `nyquist_compliant: true`. No new requirements were introduced by Phase 9, and every pre-existing requirement this phase could have regressed (styling/className changes) remains covered by an automated, passing test — most directly the FEEDBACK-02 critical invariant above, which specifically guards against the class-name/cascade-layer risk this phase's Tailwind migration carried.
