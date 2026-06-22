# Phase 1: Project Scaffold & Visible Shell - Research

**Researched:** 2026-06-21
**Domain:** Vite + React + TypeScript project scaffolding (zero-dependency static shell)
**Confidence:** HIGH

## Summary

Phase 1 is pure scaffolding: run `npm create vite@latest`, select the React + TypeScript template, install, and verify the dev server boots and the production build/typecheck succeeds. No state, no logic, no extra packages — just a static page shell with a title and two placeholder regions (queue strip on top, ventanillas grid below), styled with one global CSS file.

The one finding that changes the plan materially: the live `create-vite` template (verified against the npm registry and the official `vitejs/vite` GitHub template directory in this session) currently scaffolds **Vite 8** and **Oxlint** (not ESLint), which differs from `.planning/research/STACK.md`'s assumption of "Vite ^7.x" and "ESLint 9 flat config." Vite 8 raises the Node.js engine floor to `^20.19.0 || >=22.12.0` — and this machine's installed Node (`v21.7.3`) falls in the unsupported gap between those ranges. This must be resolved (Node upgrade/downgrade, or `nvm` switch) before `npm create vite@latest` or `npm install` will reliably work, and the planner should add an explicit Node-version-check step as the first task of Phase 1.

**Primary recommendation:** Verify/fix the local Node version first (target Node 22.12+ LTS or Node 20.19+), then scaffold with `npm create vite@latest turnero -- --template react-ts`, run `npm install`, verify `npm run dev` renders in browser and `npm run build` (which runs `tsc -b && vite build`) completes with zero errors, then replace the default starter markup in `App.tsx` with the static shell (title + two placeholder regions) using only the scaffolded global CSS file — no new dependencies.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Dev server / HMR | Build tool (Vite, local) | — | Vite owns the dev loop entirely; no server-side rendering tier exists in this client-only app |
| Page shell rendering (title, placeholder regions) | Browser / Client | — | All rendering is client-side React; there is no SSR or backend tier per CLAUDE.md constraints |
| TypeScript type-checking | Build tool (`tsc -b`, local) | — | Runs as part of `npm run build`; not a runtime/browser concern |
| Static layout / CSS | Browser / Client | — | Plain global CSS file served by Vite; no CDN/build-time CSS pipeline needed beyond Vite's default asset handling |
| Persistence, queue logic, ventanilla logic | N/A (out of scope this phase) | — | Explicitly deferred to Phase 2+ per CONTEXT.md phase boundary |

## Standard Stack

### Core

| Library | Version (verified via npm registry, 2026-06-21) | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `vite` | `^8.0.16` [VERIFIED: npm registry] | Build tool / dev server | Scaffolded automatically by `create-vite`; current major as of this session — supersedes STACK.md's "Vite ^7.x" assumption |
| `react` | `^19.2.7` [VERIFIED: npm registry] | UI rendering | Matches STACK.md's prior finding; confirmed still current |
| `react-dom` | `^19.2.7` [VERIFIED: npm registry] | DOM renderer for React | Paired 1:1 with `react` version in the scaffolded template |
| `typescript` | `~6.0.2` [VERIFIED: npm registry] | Type safety | Template pins `~6.0.2`, not `^5.7+` as STACK.md assumed — TypeScript crossed into a new major (6.x) since that research was written |
| `@vitejs/plugin-react` | `^6.0.2` [VERIFIED: npm registry] | Enables React Fast Refresh + JSX transform in Vite via Oxc | Official Vite React plugin, included by the template by default |

### Supporting (scaffold devDependencies — already included by `create-vite`, no extra install needed)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@types/react` | `^19.2.17` [VERIFIED: npm registry] | TS types for React 19.2.x | Always paired with the matching React major/minor |
| `@types/react-dom` | `^19.2.3` [VERIFIED: npm registry] | TS types for react-dom | Always paired with the matching react-dom version |
| `@types/node` | `^24.13.2` [VERIFIED: npm registry] | Node types for `vite.config.ts` | Needed because `vite.config.ts` runs under Node, not the browser |
| `oxlint` | `^1.69.0` [VERIFIED: npm registry] | Linting | **Replaces ESLint** in the current template default — see State of the Art section |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `react-ts` template (Oxlint default) | `react-ts` + manually add ESLint 9 flat config | Only if the team specifically wants ESLint's broader plugin ecosystem (e.g., `eslint-plugin-jsx-a11y`); adds setup work with zero payoff for a one-page scaffold. Not recommended — stay on the template default. |
| `@vitejs/plugin-react` (Oxc-based, default) | `@vitejs/plugin-react-swc` | SWC-based variant exists for projects needing Babel-plugin compatibility or slightly different transform behavior; default Oxc-based plugin is faster and is what `create-vite` selects automatically — no reason to switch for this project. |

**Installation:**
```bash
npm create vite@latest turnero -- --template react-ts
cd turnero
npm install
```

No additional `npm install` commands are needed for Phase 1 — the scaffold is complete after the above. CLAUDE.md explicitly forbids adding runtime dependencies beyond what the template provides.

**Version verification:** Confirmed live against the npm registry on 2026-06-21:
```bash
npm view vite version          # 8.0.16
npm view react version         # 19.2.7
npm view create-vite version   # 9.0.7
npm view typescript version    # 6.0.3 (registry "latest" tag; template itself pins ~6.0.2)
```
These are materially newer than `.planning/research/STACK.md`'s assumptions ("Vite ^7.x", "TypeScript ^5.7+") — that file is now ~stale relative to the live registry as of this research session. The planner should treat Vite 8 / TS 6 / Oxlint as the actual scaffolding outcome, not Vite 7 / ESLint.

## Package Legitimacy Audit

This phase installs **zero new third-party packages** beyond what `npm create vite@latest -- --template react-ts` scaffolds automatically (the official, first-party Vite tooling). There is no user-chosen package selection to slopcheck — the entire dependency set is pinned by Vite's own official template and resolved by `npm install` against the npm registry.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| `vite` | npm | 6+ yrs | very high (>20M/wk) | github.com/vitejs/vite | not run (official, first-party tool) | Approved — official Vite project output |
| `react` / `react-dom` | npm | 10+ yrs | very high (>25M/wk) | github.com/facebook/react | not run | Approved — official React |
| `typescript` | npm | 10+ yrs | very high | github.com/microsoft/TypeScript | not run | Approved — official Microsoft package |
| `@vitejs/plugin-react` | npm | 5+ yrs | high | github.com/vitejs/vite-plugin-react | not run | Approved — official Vite org plugin |
| `oxlint` | npm | ~2 yrs (newer, but official Oxc-project tool, now Vite's default lint choice) | growing, now default in `create-vite` | github.com/oxc-project/oxc | not run | Approved — adopted as the official template default; flagged for awareness only, not risk |

**Packages removed due to slopcheck [SLOP] verdict:** none — no new packages introduced.
**Packages flagged as suspicious [SUS]:** none.

*slopcheck was not run because this phase introduces no externally-selected packages — every dependency listed above is what the official `create-vite` template installs by default, verified directly against the npm registry and the official `vitejs/vite` GitHub repository in this session, not sourced from search/training-data guesses.*

## Architecture Patterns

### System Architecture Diagram

```
npm create vite@latest (CLI, one-time)
        │
        ▼
 Scaffolded project files (template-react-ts)
        │
        ▼
   npm install ──► node_modules (react, vite, typescript, oxlint, ...)
        │
        ▼
┌───────────────────────────────────────────────┐
│  npm run dev  →  Vite dev server (HMR)         │
│      reads: index.html → src/main.tsx          │
│      renders: src/App.tsx into <div id="root">│
└───────────────────────────────────────────────┘
        │
        ▼
   Browser shows static shell:
     <h1>Turnero</h1>
     <section> Cola placeholder </section>
     <section> Ventanillas grid placeholder </section>

┌───────────────────────────────────────────────┐
│  npm run build  →  tsc -b (typecheck only,     │
│      no emit per tsconfig) && vite build       │
│      (Rolldown/Oxc bundling) → dist/           │
└───────────────────────────────────────────────┘
```

A reader can trace the primary use case end-to-end: scaffold → install → `npm run dev` → browser shows the static shell; separately, `npm run build` proves the TypeScript+bundling pipeline is clean before any feature logic exists.

### Recommended Project Structure (as produced by the scaffold, then lightly edited)

```
turnero/                     (or project root, if scaffolded in place)
├── public/
│   └── vite.svg              # default favicon asset — keep or replace, not load-bearing
├── src/
│   ├── assets/
│   │   └── react.svg         # default demo asset — safe to delete once App.tsx no longer references it
│   ├── App.tsx                # EDIT: replace default counter demo with static shell markup
│   ├── App.css                # EDIT: replace default demo styles with shell layout CSS (or rename/consolidate per D-02)
│   ├── index.css              # global resets/base styles — D-02 says ONE global CSS file; consider merging App.css into index.css here
│   ├── main.tsx                # entry point — untouched, mounts <App /> into #root
│   └── vite-env.d.ts          # Vite/TS ambient types — untouched
├── index.html                  # EDIT: <title> tag — set to "Turnero" or similar for browser tab title
├── package.json                # untouched except possibly removing unused default scripts/comments
├── tsconfig.json                # untouched — references tsconfig.app.json + tsconfig.node.json
├── tsconfig.app.json            # untouched — app-side strict TS config
├── tsconfig.node.json           # untouched — config-side TS config (for vite.config.ts)
├── vite.config.ts               # untouched — default React plugin wiring is sufficient
├── _oxlintrc.json → .oxlintrc.json   # NOTE: scaffold ships this as `_oxlintrc.json`; some create-vite versions rename leading-underscore files on init — verify after scaffold whether it lands as `.oxlintrc.json` or stays prefixed
└── .gitignore                   # from `_gitignore` template file, renamed automatically by create-vite
```

**D-02 implication for structure:** CONTEXT.md locks "single global CSS file (e.g. `index.css`/`App.css`), no CSS Modules." The scaffold technically produces *two* CSS files (`index.css` + `App.css`). The planner should decide explicitly: either (a) keep both but treat them as one global stylesheet conceptually (no scoping, both apply globally — which is how Vite serves them, since neither uses CSS Modules naming), or (b) consolidate into a single file and delete the other. Either satisfies D-02's intent ("no CSS Modules, no framework"); (b) is cleaner and removes ambiguity for Phase 2+ contributors.

### Pattern 1: `npm create vite@latest` non-interactive scaffolding

**What:** Run the scaffold command with explicit flags so it never blocks on interactive prompts (important for any automation/CI use, and for predictable execution in a GSD task).

**When to use:** Always, when scaffolding via script/agent rather than a human at an interactive terminal.

**Example:**
```bash
# Source: verified via npm registry (create-vite@9.0.7) + official vitejs/vite GitHub template directory, 2026-06-21
npm create vite@latest turnero -- --template react-ts
```
If running inside an existing empty directory (rather than creating a new subfolder), use `.` as the target and confirm overwrite behavior:
```bash
npm create vite@latest . -- --template react-ts
```
**Note:** `npm create vite@latest` itself may still prompt to confirm package installation of `create-vite` on first run in some npm versions; passing `--yes`/`-y` to the outer `npm create` invocation (not the vite args) can suppress that confirmation: `npm create vite@latest -y turnero -- --template react-ts` — verify behavior with the installed npm version (`10.5.0` locally) since prompt behavior has varied across npm releases. [ASSUMED — not independently verified in this session against npm 10.5.0's exact prompt behavior]

### Pattern 2: Build = typecheck + bundle, verified as two separable signals

**What:** The scaffolded `"build": "tsc -b && vite build"` script means a failing TypeScript type error blocks the build *before* Vite/Rolldown even runs. This is the project's only "test" surface in Phase 1 (no unit tests exist yet).

**When to use:** Always run `npm run build` (not just `npm run dev`) before considering Phase 1 done — `npm run dev` does not type-check by default (Vite's dev server transpiles but doesn't block on TS errors), so a broken type can pass `dev` silently and only surface in `build`.

**Example verification sequence:**
```bash
# Source: scaffolded package.json scripts, verified via WebFetch against raw template package.json, 2026-06-21
npm run dev      # confirms: browser renders, no blank screen, no console error overlay
# (Ctrl+C to stop dev server)
npm run build    # confirms: tsc -b reports zero type errors AND vite build completes, emits dist/
npm run preview  # optional: serves the dist/ build locally to sanity-check the production bundle renders identically
```

### Pattern 3: Static shell layout using only scaffolded CSS (no new deps)

**What:** Implement the queue-strip-on-top + ventanillas-grid-below layout (D-01, UI-SPEC.md Layout Contract) using plain CSS Grid/Flexbox in the existing global CSS file(s) — no Tailwind, no CSS-in-JS, no component library, per CLAUDE.md.

**When to use:** This phase, exclusively. All later phases (2+) will fill these regions with real data but should not need to change the *layout* CSS established here.

**Example:**
```tsx
// Source: derived from UI-SPEC.md Layout Contract section — App.tsx static shell
function App() {
  return (
    <div className="page">
      <h1 className="page-title">Turnero</h1>
      <section className="queue-strip">
        <h2>Cola</h2>
        <p>Próximos turnos aparecerán aquí</p>
      </section>
      <section className="ventanillas-grid">
        <h2>Ventanillas</h2>
        <p>Las ventanillas configuradas aparecerán aquí</p>
      </section>
    </div>
  );
}
export default App;
```
```css
/* Source: derived from UI-SPEC.md Spacing Scale + Layout Contract */
.page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px; /* xl */
}
.page-title {
  font-size: 28px;     /* Display */
  font-weight: 600;
  line-height: 1.2;
  color: #1F2933;       /* Accent */
}
.queue-strip {
  background: #F1F3F5;  /* Secondary */
  padding: 24px;         /* lg */
  margin-bottom: 24px;   /* lg, gap between queue strip and grid */
}
.ventanillas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;             /* md */
}
.ventanillas-grid > * {
  background: #F1F3F5;
  padding: 16px;          /* md */
}
```
Note: the UI-SPEC's "ventanillas grid" region is itself a placeholder paragraph in Phase 1 (no real cards exist yet — those arrive Phase 3). The `grid-template-columns` rule can be applied to the section wrapper now so Phase 3 only needs to add card children, not redefine the grid.

### Anti-Patterns to Avoid

- **Installing ESLint manually because STACK.md/CLAUDE.md mention it:** The current live template default is Oxlint, not ESLint. Manually replacing it with ESLint reintroduces setup work the template no longer does automatically and contradicts the "zero extra dependencies" constraint without a real benefit at this project's scale. Use the scaffolded Oxlint config as-is.
- **Adding any state/logic in Phase 1:** PITFALLS.md (Pitfall 7) flags scope creep as the dominant risk for this project. Phase 1's CONTEXT.md is explicit: no queue logic, no window logic, no persistence, no sound/animation. Resist the temptation to "just add a `useState` counter" or wire up the placeholder buttons early — those belong to Phase 2+.
- **Skipping `npm run build` and only checking `npm run dev`:** Dev mode does not enforce TypeScript correctness; only `tsc -b` (invoked by `npm run build`) does. The phase's success criteria explicitly require "TypeScript-checked and builds without errors" — verify via `build`, not just `dev`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Project scaffolding (bundler config, TS config, entry files) | Hand-written `vite.config.ts`, `tsconfig.json`, `index.html`, manual `package.json` from scratch | `npm create vite@latest -- --template react-ts` | The official template already encodes correct TS project-references setup (`tsconfig.json` → `tsconfig.app.json` + `tsconfig.node.json`), correct Vite+React plugin wiring, and correct npm scripts. Hand-rolling risks subtle TS config mistakes (e.g., wrong `moduleResolution`) that the template gets right by default. |
| Linting setup | Manually configuring ESLint 9 flat config from scratch | Scaffolded `oxlint` config (`_oxlintrc.json` → renamed on init) | Oxlint ships pre-configured and works immediately with zero setup; this matches CLAUDE.md's "keep default config; don't add extra plugins for a project this size." |

**Key insight:** Phase 1's only real work is *running* the official scaffold tool correctly and verifying its output — not building any part of the toolchain by hand. The risk in this phase is entirely procedural (Node version mismatch, wrong template flag, skipping the build verification step), not architectural.

## Common Pitfalls

### Pitfall 1: Local Node version (`v21.7.3`) does not satisfy Vite 8's engine requirement

**What goes wrong:** `npm create vite@latest` or the subsequent `npm install`/`npm run dev`/`npm run build` may fail outright, or — more insidiously — partially work with warnings that get ignored, leading to flaky behavior later (e.g., Rolldown/Oxc native binary mismatches).

**Why it happens:** Vite 8's `package.json` `engines` field (verified via `npm view vite engines` in this session) specifies `{ node: '^20.19.0 || >=22.12.0' }`. Node `v21.7.3` (the version installed on this machine, confirmed via `node --version`) falls in neither range — Node 21 was always an odd-numbered, non-LTS release line and is now explicitly excluded. This is **not** a hypothetical risk; it is the actual installed Node version on the target machine for this project, verified in this research session.

**How to avoid:**
- Before scaffolding, run `node --version` and confirm it satisfies `^20.19.0 || >=22.12.0`.
- If not (as is currently the case on this machine), install/switch to a satisfying Node version first — e.g., via `nvm`/`nvm-windows`/`fnm`, or a direct Node.js installer for a 22.x LTS release — as an explicit first task in the Phase 1 plan, before any `npm create`/`npm install` step.
- Do not proceed with scaffolding on an unsupported Node version even if early commands appear to succeed — failures may surface intermittently (native binary resolution, postinstall scripts) rather than immediately.

**Warning signs:** `npm install` warnings about unsupported engine versions; `EBADENGINE` warnings; native module resolution errors mentioning Rolldown/Oxc binaries; dev server failing to start with cryptic native-addon errors.

**Phase to address:** This phase, as task zero — before any scaffold command runs.

### Pitfall 2: Assuming the template still defaults to ESLint (per STACK.md/CLAUDE.md's existing research)

**What goes wrong:** A plan that includes a task like "configure ESLint flat config" wastes effort or produces a redundant/conflicting setup, since the scaffold already ships a working Oxlint config (`lint` script wired to `oxlint`, not `eslint`).

**Why it happens:** `.planning/research/STACK.md` and `CLAUDE.md` were researched/written referencing "ESLint 9 flat config" as the template default — true at some earlier point but superseded by the live template (verified directly against the npm registry and GitHub template source in this session: `"lint": "oxlint"`, devDependency `oxlint@^1.69.0`, no `eslint` package in the scaffolded `package.json` at all).

**How to avoid:** Plan Phase 1 around whatever linter the scaffold actually produces (Oxlint) rather than the linter named in earlier project research. Do not add an `eslint` install step unless the user explicitly asks for ESLint instead of the template default — and if so, treat it as a deliberate deviation, not a "fix."

**Warning signs:** A task or plan step referencing `.eslintrc` or `eslint.config.js` that doesn't match what's actually in the freshly scaffolded `package.json`/file tree.

**Phase to address:** This phase — verify actual scaffolded files immediately after running `npm create vite@latest`, rather than trusting prior research's assumption.

### Pitfall 3: Two CSS files (`App.css` + `index.css`) ambiguity vs. D-02's "single global CSS file" decision

**What goes wrong:** The scaffold produces both `src/index.css` and `src/App.css`. If left untouched, the project technically has two CSS files from the start, which could be read as contradicting D-02 ("single global CSS file... no CSS Modules") even though neither file uses CSS Modules scoping (both are genuinely global).

**Why it happens:** The default template splits "page-level reset/base styles" (`index.css`) from "App component demo styles" (`App.css`) as a stylistic convention, not a technical requirement — Vite serves both as plain global stylesheets either way.

**How to avoid:** During Phase 1 execution, explicitly consolidate into one file (delete `App.css`, move its (replaced) rules into `index.css`, update the `import './App.css'` line in `App.tsx` accordingly) to make D-02 compliance unambiguous, rather than leaving two files and arguing post-hoc that they "count as one conceptually."

**Warning signs:** A plan-checker or later contributor flags "this project has 2 CSS files, contradicting D-02" during review.

**Phase to address:** This phase, during the shell-styling task.

### Pitfall 4: Confusing "dev server runs" with "build succeeds" as the success bar

**What goes wrong:** Treating `npm run dev` rendering correctly as sufficient proof of "TypeScript-checked and builds without errors" (success criterion #2). Vite's dev server uses on-the-fly transpilation and does **not** run full `tsc` type-checking by default — a type error can exist and still let `npm run dev` show a working page.

**Why it happens:** Vite intentionally decouples fast dev transpilation from full type-checking for speed; type safety is enforced at build time via the `tsc -b &&` prefix in the `build` script, not in `dev`.

**How to avoid:** Explicitly run `npm run build` (which invokes `tsc -b` first) as a separate verification step in the plan, not just `npm run dev`. Treat both as required, independent checks: dev confirms visual/runtime correctness, build confirms type correctness and bundling correctness.

**Warning signs:** A plan or verification step that only mentions "run `npm run dev` and confirm it loads" without a separate `npm run build` check.

**Phase to address:** This phase — both should be explicit verification steps for the phase's success criteria.

## Code Examples

### Verify Node version before scaffolding
```bash
# Source: verified via `npm view vite engines` against the live npm registry, 2026-06-21
node --version
# Required: ^20.19.0 || >=22.12.0 (Vite 8's engines field)
# This machine reported v21.7.3, which does NOT satisfy either range — must switch Node version first.
```

### Scaffold, install, verify dev + build
```bash
# Source: official create-vite usage (verified create-vite@9.0.7 via npm registry) +
# scaffolded package.json scripts (verified via WebFetch of raw GitHub template package.json)
npm create vite@latest turnero -- --template react-ts
cd turnero
npm install
npm run dev      # opens dev server (default http://localhost:5173) — confirm browser shows rendered page, no error overlay
npm run build    # runs `tsc -b && vite build` — confirm zero TypeScript errors and dist/ is produced
```

### Minimal static shell satisfying D-01/D-02/D-03 and UI-SPEC.md
```tsx
// src/App.tsx — Source: derived from 01-UI-SPEC.md Layout Contract + Copywriting Contract
import './index.css';

function App() {
  return (
    <div className="page">
      <h1 className="page-title">Turnero</h1>
      <section className="queue-strip">
        <h2>Cola</h2>
        <p>Próximos turnos aparecerán aquí</p>
      </section>
      <section className="ventanillas-grid">
        <h2>Ventanillas</h2>
        <p>Las ventanillas configuradas aparecerán aquí</p>
      </section>
    </div>
  );
}

export default App;
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| `create-vite` react-ts template ships ESLint 9 flat config (per STACK.md/CLAUDE.md prior research) | `create-vite` react-ts template ships Oxlint (`oxlint@^1.69.0`), no ESLint package at all | Confirmed in this session against the live npm registry and GitHub template source (2026-06-21); exact version/date of the template's switch to Oxlint not independently dated in this session | Plans referencing "ESLint flat config setup" for Phase 1 should be revised to reference Oxlint instead, or explicitly note a deliberate deviation if the user wants ESLint |
| Vite 7.x assumed as current major (STACK.md) | Vite 8.0.16 is current on the npm registry | Confirmed in this session (2026-06-21) | Node engine floor is stricter (`^20.19.0 \|\| >=22.12.0`); Rolldown/Oxc now power bundling/transforms by default instead of esbuild/Rollup — irrelevant to this phase's static-shell scope, but relevant if later phases hit transform-specific edge cases |
| esbuild + Rollup as Vite's internal toolchain | Rolldown (Rust-based bundler) + Oxc (Rust-based transformer) | Vite 8 major release | No code-level impact for a plain React+TS static shell; flagged only so the planner doesn't mis-attribute a build issue to "esbuild" when it's actually Rolldown/Oxc in current Vite |

**Deprecated/outdated:**
- ESLint as the *default* linter choice for new `create-vite` react-ts projects — not deprecated as a tool in general, but no longer what the scaffold installs automatically.
- Treating "Vite 7" as current — superseded by Vite 8 on the registry as of this research date.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `npm create vite@latest -y turnero -- --template react-ts` suppresses the outer `npm create` install-confirmation prompt with npm 10.5.0 | Architecture Patterns, Pattern 1 | Low — if wrong, the scaffold command may pause for an interactive `y/N` confirmation; easily recovered by answering the prompt manually or re-running with correct flag syntax. Does not affect the resulting project files. |
| A2 | `_oxlintrc.json` (and `_gitignore`) are auto-renamed to `.oxlintrc.json`/`.gitignore` by `create-vite` during scaffolding (standard create-vite behavior for underscore-prefixed template files) | Architecture Patterns, Recommended Project Structure | Low — if the rename doesn't happen as expected, the planner/executor should manually verify and rename these files after scaffolding; does not block the dev/build verification success criteria. |

## Open Questions

1. **Exact date Oxlint became the react-ts template default**
   - What we know: Verified live (2026-06-21) that the current template uses Oxlint, not ESLint.
   - What's unclear: When this changed relative to `.planning/research/STACK.md`'s creation date (also 2026-06-21) — possibly STACK.md's author used slightly stale training knowledge rather than live-verifying the template at research time.
   - Recommendation: Not blocking — the planner should simply trust this session's live verification (npm registry + GitHub template fetch) over STACK.md's "ESLint 9 flat config" claim for Phase 1 planning purposes.

2. **Whether the target machine's Node version will actually be changed before execution, or whether a different/portable Node needs to be used**
   - What we know: Installed Node is `v21.7.3`; Vite 8 requires `^20.19.0 || >=22.12.0`.
   - What's unclear: Whether the user/executor will upgrade global Node, use `nvm`, or take another path — this research cannot decide that, only flag it.
   - Recommendation: Planner should add an explicit, gating task: "Verify/upgrade Node to a version satisfying `^20.19.0 || >=22.12.0` before scaffolding" as the literal first task of Phase 1's plan.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | `npm create vite@latest`, all npm scripts | ✗ (wrong range) | v21.7.3 installed; Vite 8 requires `^20.19.0 \|\| >=22.12.0` | Install/switch to Node 22.12+ (or 20.19+) via nvm-windows, fnm, or direct installer before scaffolding |
| npm | package management, running scripts | ✓ | 10.5.0 | — |
| Git | version control (repo not yet a git repo per env info, but `.git` dir exists in working dir per `ls`) | ✓ (`.git` present) | not version-checked this session | — |

**Missing dependencies with no fallback:**
- None — Node version mismatch has a clear fallback (upgrade/switch Node), it is not a hard blocker with no resolution path.

**Missing dependencies with fallback:**
- Node.js version — fallback is upgrading/switching to a Vite-8-compatible version (Node 22.12+ LTS recommended) before running any scaffold or npm command for this phase.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None installed yet — greenfield project, no test runner exists before scaffolding |
| Config file | none — see Wave 0 |
| Quick run command | `npm run build` (the closest available fast-feedback check this phase: `tsc -b && vite build`) |
| Full suite command | `npm run build` (same — no unit test suite exists or is in scope for Phase 1) |

### Phase Requirements → Test Map

Phase 1 carries no v1 requirement IDs (confirmed in REQUIREMENTS.md traceability table — all 12 v1 requirements map to Phases 2-8). Its three success criteria are verified via build/runtime checks, not unit tests:

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| (none — foundational) | Dev server renders a page (not blank/error) | smoke (manual visual check) | `npm run dev` then visually confirm in browser | ✅ N/A — no test file needed, this is a manual/visual smoke check |
| (none — foundational) | Project type-checks and builds without errors | build verification | `npm run build` | ✅ N/A — enforced by `tsc -b` step inside the build script itself, no separate test file needed |
| (none — foundational) | Shell has placeholder regions for queue + ventanillas | manual/visual review against UI-SPEC.md | visual diff against `01-UI-SPEC.md` Layout Contract | ✅ N/A — UI-SPEC.md itself is the acceptance reference |

### Sampling Rate
- **Per task commit:** `npm run build` (cheap, catches TS errors immediately; takes seconds for a project this small)
- **Per wave merge:** `npm run build` + manual `npm run dev` visual check
- **Phase gate:** Both `npm run build` succeeds AND a human/visual confirmation that the browser renders the title + two placeholder regions per UI-SPEC.md, before `/gsd:verify-work`

### Wave 0 Gaps
- No test framework (Vitest) is installed, and **none is needed for Phase 1** — there is no business logic to unit test yet (no reducer, no components with conditional behavior). Introducing Vitest in Phase 1 would itself be scope creep relative to PITFALLS.md's Pitfall 7 warning.
- Recommendation for future phases: when Phase 2 introduces the queue reducer (real logic worth unit testing per ARCHITECTURE.md's emphasis on testing the reducer in isolation), that is the appropriate point to install Vitest (`npm install -D vitest`) — not before. Flag this as a Wave 0 gap for **Phase 2's** research, not Phase 1's.

*(Phase 1 gaps: "None — this phase has no business logic requiring automated test coverage; verification is via `npm run build` and a manual visual check against 01-UI-SPEC.md.")*

## Project Constraints (from CLAUDE.md)

These directives from `./CLAUDE.md` apply directly to this phase and must not be contradicted by the plan:

- **Tech stack is locked:** React + TypeScript + Vite — no substituting another framework/bundler.
- **No backend, no auth:** Phase 1 must not introduce any server process, API route, or auth scaffolding.
- **Single page/view:** Do not add React Router or any multi-view scaffolding in Phase 1 (or ever, per current scope).
- **No new runtime dependencies beyond the scaffold:** Do not `npm install` any UI library, animation library, sound library, or state-management library in this phase. Only what `create-vite --template react-ts` installs by default is permitted.
- **No CSS framework:** Use plain CSS only (matches D-02 and UI-SPEC.md's Design System table — "none — plain global CSS, no component/UI library").
- **GSD workflow enforcement:** Per CLAUDE.md's "GSD Workflow Enforcement" section, all file-changing work in this phase must happen through the GSD execute-phase flow, not ad hoc direct edits.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01 (Layout):** Queue placeholder region on top (horizontal strip), ventanillas placeholder below as a grid of cards — one card per window. Matches the typical waiting-room "now serving" board convention.
- **D-02 (Styling):** Single global CSS file (e.g. `index.css`/`App.css`), no CSS Modules, no CSS framework — consistent with research/STACK.md's zero-dependency recommendation and appropriate for a single-page app this small.
- **D-03 (Identity):** Shell already displays the title "Turnero" (or similar clinic-display branding) from Phase 1 — not left generic. No cost to add now, gives later phases real visual context.

### Claude's Discretion

- Exact folder/file structure (flat `src/` vs feature folders) — not discussed, left to Claude during planning/execution.
- Exact wording/styling of the placeholder regions beyond the layout/identity decisions above.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope (pure scaffolding decisions only).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| (none) | Phase 1 carries no v1 requirement IDs — REQUIREMENTS.md traceability table confirms all 12 v1 requirements (QUEUE-01/02, WINDOW-01/02/03, CALL-01/02, FEEDBACK-01/02, DISPLAY-01, PERSIST-01, PRIVACY-01) map to Phases 2-8. Phase 1 is foundational scaffolding only. | This research's scaffolding/build/shell-layout findings exist to de-risk Phase 1's three success criteria (dev server renders, build is type-clean, placeholder shell matches UI-SPEC.md), not to satisfy any specific functional requirement. |
</phase_requirements>

## Sources

### Primary (HIGH confidence)
- `npm view vite version` / `engines` — live npm registry query, 2026-06-21: confirms Vite `8.0.16`, `engines: { node: '^20.19.0 || >=22.12.0' }`
- `npm view react version` — live npm registry query, 2026-06-21: confirms React `19.2.7`
- `npm view create-vite version` — live npm registry query, 2026-06-21: confirms `create-vite@9.0.7`
- `npm view typescript version` — live npm registry query, 2026-06-21: confirms TypeScript `6.0.3` (latest tag)
- `npm view @vitejs/plugin-react / oxlint / @types/react / @types/react-dom / @types/node version` — live npm registry queries, 2026-06-21
- [GitHub — vitejs/vite template-react-ts directory](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) — official template source, fetched 2026-06-21: confirms file list (`tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`, `_oxlintrc.json`, `_gitignore`, `index.html`, `package.json`, `public/`, `src/`)
- Raw `package.json` of the official template (fetched via raw.githubusercontent.com, 2026-06-21) — confirms exact scripts (`dev`/`build`/`lint`/`preview`) and dependency/devDependency version ranges
- [Vite Migration Guide](https://vite.dev/guide/migration) — official docs, fetched 2026-06-21: confirms Vite 8 breaking changes (Oxc transform, Rolldown bundling, browser target bumps)
- Local environment probe (`node --version`, `npm --version`) — confirms installed Node `v21.7.3`, npm `10.5.0`

### Secondary (MEDIUM confidence)
- WebSearch, multiple sources — confirms Oxlint is now the default linter in `create-vite` react-ts template, replacing ESLint (corroborated by the primary-source `package.json` fetch above, which shows no `eslint` devDependency at all)
- WebSearch, multiple sources (Nandann Creative Agency, DEV Community, Vitest docs) — confirms Vitest is the de facto standard test framework pairing for Vite+React projects, but is NOT installed by the default scaffold; relevant for flagging Wave 0 gaps as "intentionally none for Phase 1"

### Tertiary (LOW confidence)
- Assumption about `npm create vite@latest -y` flag suppressing outer prompt with npm 10.5.0 specifically — not independently tested in this session (see Assumptions Log A1)
- Assumption about `_oxlintrc.json` auto-rename behavior during scaffolding — inferred from `_gitignore`'s well-documented rename pattern, not independently re-verified for `_oxlintrc.json` specifically in this session (see Assumptions Log A2)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — every version verified directly against the live npm registry and the official GitHub template source/package.json in this session, not from training data or stale prior research
- Architecture: HIGH — Phase 1's architecture is trivial (static shell, no logic) and fully determined by the official scaffold + UI-SPEC.md's already-approved layout contract
- Pitfalls: HIGH for the Node-version and linter-drift findings (directly verified against this machine and the live registry); MEDIUM for the npm-prompt-flag assumption (flagged in Assumptions Log)

**Research date:** 2026-06-21
**Valid until:** 7 days (fast-moving area — Vite/npm registry versions and template defaults can shift; re-verify exact versions if execution is delayed more than a week from this research date)
