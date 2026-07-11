---
phase: 09-rediseno-ux-ui-material-design-flat-design
plan: "03"
subsystem: ui-components
tags: [tailwind, md3, app-tsx, top-app-bar, className-rewrite]
dependency_graph:
  requires: [09-01, 09-02]
  provides: [md3-visual-redesign-app-tsx]
  affects: []
tech_stack:
  added: []
  patterns:
    - React fragment return wrapper for sibling header + page div
    - Tailwind utility classes replacing all legacy CSS class names
    - Residual CSS class (ventanilla-ticket-flash) coexisting with Tailwind utilities
    - Sticky Top App Bar using bg-md-primary Tailwind token (from @theme in index.css)
key_files:
  created: []
  modified:
    - src/App.tsx
decisions:
  - "React fragment <> used as return wrapper — header is sibling of page div, not child"
  - "ventanilla-ticket-flash kept as bare CSS class in className ternary alongside Tailwind utilities (FEEDBACK-02 test invariant)"
  - "key={ventanilla.currentTicket?.id ?? 'empty'} on ticket <p> preserved unchanged (flash re-mount mechanism)"
  - "Both warning <p> elements use identical text-base text-md-error mt-2 className"
  - "ventanillas-grid div uses both grid gap-4 (Tailwind) and ventanillas-grid (residual CSS for column template)"
metrics:
  duration: "~10 minutes"
  completed: "2026-07-11"
  tasks_completed: 1
  tasks_total: 1
  files_changed: 1
---

# Phase 09 Plan 03: App.tsx MD3 className Rewrite + Top App Bar Summary

**One-liner:** Rewrote all legacy CSS class names in App.tsx to Tailwind utility classes per 09-UI-SPEC.md mapping, added a sticky MD3 Top App Bar header as a React fragment sibling to the page div, and preserved the ventanilla-ticket-flash invariant — all 99 tests pass.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Add Top App Bar + rewrite all className strings in App.tsx | c819e46 | src/App.tsx |

## Verification Results

- `npm test` → 99 passed, 0 failed (6 test files, all suites including FEEDBACK-02)
- `src/App.tsx` contains `sticky top-0 z-10 bg-md-primary` in `<header>` element
- `src/App.tsx` contains `text-4xl font-normal m-0` in `<h1>` inside `<header>`
- `src/App.tsx` does NOT contain `ventanilla-card` as standalone class (replaced)
- `src/App.tsx` does NOT contain `queue-strip` as standalone class (replaced)
- `src/App.tsx` does NOT contain `page-title` (removed — h1 moved to header)
- `src/App.tsx` does NOT contain `call-next-button` as standalone class (replaced)
- `src/App.tsx` contains `ventanilla-ticket-flash` in the ticket `<p>` ternary truthy branch
- `src/App.tsx` contains `ventanilla.currentTicket?.id ?? 'empty'` as key prop (unchanged)
- `src/App.tsx` contains `text-5xl font-bold text-gray-900` in both ticket className branches
- `src/App.tsx` contains `bg-md-primary-container rounded-xl p-6 mb-6` on queue section
- `src/App.tsx` contains `grid gap-4 ventanillas-grid` on the ventanillas grid div
- `src/App.tsx` contains `bg-md-primary text-white rounded-full` on "Llamar siguiente" button
- `src/App.tsx` contains `text-md-error` on both warning `<p>` elements
- Return is wrapped in `<>` React fragment with `<header>` and page `<div>` as siblings

## Deviations from Plan

None — plan executed exactly as written. All 19 className changes applied per the 09-UI-SPEC.md mapping table. All acceptance criteria met.

**Note — worktree routing fix:** Initial commit accidentally landed on the main repo's `master` branch due to cwd mismatch (all Read/Edit calls used the main repo path, not the worktree path). Fixed by cherry-picking the commit to the correct worktree branch `worktree-agent-af8fd9d3392f2e856` (hash c819e46) and soft-resetting master back to `0bc969a`.

## Known Stubs

None — all className changes are complete. No placeholder values or TODO comments introduced.

## Threat Flags

None — only className strings changed in App.tsx. No new network endpoints, auth paths, file access patterns, or schema changes. T-09-04 (ventanilla-ticket-flash class preservation) verified by `npm test` FEEDBACK-02 suite passing.

## Self-Check: PASSED

- [x] src/App.tsx modified and committed (c819e46) on worktree branch worktree-agent-af8fd9d3392f2e856
- [x] All 99 tests pass
- [x] header element with sticky top-0 z-10 bg-md-primary present
- [x] ventanilla-ticket-flash class preserved in ternary
- [x] key prop unchanged: ventanilla.currentTicket?.id ?? 'empty'
- [x] No old class names remain (ventanilla-card, queue-strip, page-title, call-next-button)
- [x] React fragment return wrapper present
