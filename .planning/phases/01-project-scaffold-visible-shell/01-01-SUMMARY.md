---
phase: 01-project-scaffold-visible-shell
plan: 01
subsystem: scaffold
tags: [vite, react, typescript, scaffold]
dependency-graph:
  requires: []
  provides: [project-scaffold, static-shell]
  affects: [all-future-phases]
tech-stack:
  added:
    - "vite ^8.0.16"
    - "react ^19.2.6 / react-dom ^19.2.6"
    - "typescript ~6.0.2"
    - "eslint ^10.3.0 (template default — NOT Oxlint, superseding stale RESEARCH.md assumption)"
  patterns:
    - "Single global CSS file (src/index.css) per D-02 — App.css deleted"
    - "Static placeholder shell with no state/logic per phase boundary"
key-files:
  created:
    - package.json
    - package-lock.json
    - index.html
    - vite.config.ts
    - tsconfig.json
    - tsconfig.app.json
    - tsconfig.node.json
    - eslint.config.js
    - .gitignore
    - README.md
    - src/main.tsx
    - src/App.tsx
    - src/index.css
    - public/favicon.svg
  modified:
    - src/App.tsx (replaced starter demo with static shell)
    - src/index.css (consolidated shell layout styles)
    - index.html (title set to "Turnero")
  deleted:
    - src/App.css (consolidated into index.css per D-02)
    - src/assets/hero.png, src/assets/react.svg, src/assets/vite.svg (unused demo assets)
    - public/icons.svg (unused demo asset)
decisions:
  - "Live create-vite template (verified live, 2026-06-21) ships ESLint ^10.3.0, not Oxlint as RESEARCH.md assumed — followed what's actually on disk per plan's own instruction to verify rather than trust stale research notes."
  - "Live template's default App.tsx ('Get started' landing page with hero.png/icons.svg) differs from RESEARCH.md's described older starter (counter+logo demo) — same outcome: replaced entirely with the static shell per Task 3, so the difference did not affect execution."
metrics:
  duration: "~25 min"
  completed: 2026-06-21
---

# Phase 1 Plan 01: Project Scaffold & Visible Shell Summary

Vite 8 + React 19 + TypeScript scaffold installed in place, default starter replaced with a static "Turnero" shell (title + queue-strip + ventanillas-grid placeholders) styled by a single consolidated `src/index.css`, with `npm run build` passing cleanly (zero TS errors, dist/ emitted) — ready for human visual confirmation at Task 4.

## What Was Built

- **Task 1 (checkpoint:human-action, auto-approved):** Verified `node --version` reports `v22.23.0`, which satisfies Vite 8's engine range `^20.19.0 || >=22.12.0`. No Node switch was needed — approved immediately per orchestrator instruction, with no action taken.
- **Task 2:** Scaffolded the project in place using `npm create vite@latest . -- --template react-ts` (scaffolded into a clean temp directory and copied into the worktree, since the worktree directory's existing `.git`/`.planning`/`CLAUDE.md` files caused `create-vite`'s non-empty-directory prompt to silently cancel in this non-interactive shell — `.git`, `.planning`, and `CLAUDE.md` were preserved throughout). Ran `npm install` (152 packages, 0 vulnerabilities, no EBADENGINE warnings). Verified `npm run dev` boots cleanly on a local port and serves the default scaffold page. Verified `npm run build` (`tsc -b && vite build`) exits 0 with zero TypeScript errors and emits `dist/`.
- **Task 3:** Replaced the default `App.tsx` starter content with the static shell: `<h1 className="page-title">Turnero</h1>`, a `<section className="queue-strip">` with heading "Cola" and body "Próximos turnos aparecerán aquí", and a `<section className="ventanillas-grid">` with heading "Ventanillas" and body "Las ventanillas configuradas aparecerán aquí" — exact copy per UI-SPEC.md Copywriting Contract. No `useState`, no buttons, no event handlers. Consolidated styling into a single `src/index.css` per D-02 (deleted `src/App.css`, removed unused demo assets `hero.png`/`react.svg`/`vite.svg`/`icons.svg`), implementing the Layout Contract: page container max-width 1200px centered with 32px padding, `.page-title` at 28px/600/1.2/#1f2933, `.queue-strip` with #f1f3f5 background and 24px padding/margin, `.ventanillas-grid` as a CSS grid (`repeat(auto-fit, minmax(200px, 1fr))`, 16px gap). Set `index.html`'s `<title>` to "Turnero". `npm run build` and `npm run lint` both pass clean after this change.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking issue] `npm create vite@latest . -- --template react-ts` cancelled silently in the worktree directory**
- **Found during:** Task 2
- **Issue:** Running the scaffold command directly in the worktree (which already contains `.git`, `.planning/`, `CLAUDE.md`) triggered create-vite's "directory not empty" interactive prompt, which cancelled the operation in this non-TTY shell even with `--force` and various stdin-piping approaches.
- **Fix:** Scaffolded into a clean temporary directory (`npm create vite@latest . -- --template react-ts --force` succeeds in an empty dir), then copied the generated scaffold files (`.gitignore`, `eslint.config.js`, `index.html`, `package.json`, `public/`, `README.md`, `src/`, `tsconfig*.json`, `vite.config.ts`) into the worktree, leaving `.git`, `.planning/`, and `CLAUDE.md` untouched.
- **Files modified:** All Task 2 scaffold files (see key-files above).
- **Commit:** 13b4355

**2. [Rule 1 - Bug/correctness] RESEARCH.md's Oxlint assumption did not match the live template**
- **Found during:** Task 2
- **Issue:** RESEARCH.md (and CLAUDE.md's STACK.md excerpt) assumed the live `create-vite` react-ts template ships Oxlint. The actually-scaffolded `package.json` shows `"lint": "eslint ."` with `eslint ^10.3.0`, `typescript-eslint ^8.59.2`, and no `oxlint` dependency at all.
- **Fix:** Followed the plan's own explicit instruction to "verify the scaffold matches RESEARCH.md's expectations rather than trusting stale STACK.md/CLAUDE.md version notes" — kept the scaffold's actual ESLint config as-is, did not install or configure Oxlint, did not modify the lint setup.
- **Files modified:** none (no action needed beyond accepting what was scaffolded).
- **Commit:** 13b4355

None of these deviations affected scope, architecture, or the phase's three success criteria — both are environment/tooling-drift corrections, not feature additions.

## Known Stubs

None. The static shell intentionally renders only hardcoded placeholder copy ("Próximos turnos aparecerán aquí", "Las ventanillas configuradas aparecerán aquí") — this is the explicit, planned output of Phase 1 (pure scaffold, no data wiring), not an unintended stub. Real data wiring begins in Phase 2 (queue) and Phase 3 (ventanillas) per the roadmap.

## Threat Flags

None. This plan introduces no new network endpoints, auth paths, file-access patterns, or schema changes — it is a pure static client-side scaffold matching the plan's own threat model (all dispositions "accept").

## Checkpoint Reached

Task 4 (`checkpoint:human-verify`) requires a human to visually confirm the rendered shell in a browser — this cannot be self-verified by the executor. Execution stops here; see the CHECKPOINT REACHED section returned to the orchestrator for resume details.

## Self-Check: PASSED

- FOUND: package.json — exists at repo root, contains `"vite"` devDependency and `"build": "tsc -b && vite build"` script.
- FOUND: src/App.tsx — contains `Turnero`, `queue-strip`, `ventanillas-grid`, no `useState`/`<button>`.
- FOUND: src/index.css — contains `.page`, `.page-title`, `.queue-strip`, `.ventanillas-grid`, `grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))`, `#1f2933`, `#f1f3f5`.
- FOUND: index.html — contains `<title>Turnero</title>`.
- FOUND: dist/ — emitted by `npm run build` (verified exit 0, zero TS errors).
- FOUND commit 13b4355 — `feat(01-01): scaffold Vite React-TS project`.
- FOUND commit 0423c40 — `feat(01-01): replace starter demo with static shell`.
