# Phase 1: Project Scaffold & Visible Shell - Context

**Gathered:** 2026-06-21
**Status:** Ready for planning

<domain>
## Phase Boundary

A working React + TypeScript + Vite app boots in the browser and renders a static page shell (title/layout placeholders for queue and ventanillas), proving the toolchain and dev loop work before any feature logic (Phase 2+) is added. No queue logic, no window logic, no persistence, no sound/animation in this phase.

</domain>

<decisions>
## Implementation Decisions

### Layout
- **D-01:** Queue placeholder region on top (horizontal strip), ventanillas placeholder below as a grid of cards — one card per window. Matches the typical waiting-room "now serving" board convention.

### Styling
- **D-02:** Single global CSS file (e.g. `index.css`/`App.css`), no CSS Modules, no CSS framework — consistent with research/STACK.md's zero-dependency recommendation and appropriate for a single-page app this small.

### Identity
- **D-03:** Shell already displays the title "Turnero" (or similar clinic-display branding) from Phase 1 — not left generic. No cost to add now, gives later phases real visual context.

### Claude's Discretion
- Exact folder/file structure (flat `src/` vs feature folders) — not discussed, left to Claude during planning/execution.
- Exact wording/styling of the placeholder regions beyond the layout/identity decisions above.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Stack & tooling
- `.planning/research/STACK.md` — confirms React 19 + TypeScript + Vite 7 scaffold, zero extra dependencies, native browser APIs only

### Architecture
- `.planning/research/ARCHITECTURE.md` — component boundaries and build order (reducer/types first, then UI, then persistence, then polish) — informs how the shell's placeholder regions should map to future components

### Pitfalls
- `.planning/research/PITFALLS.md` — scope creep flagged as a critical risk; Phase 1 must stay pure scaffolding, no feature logic

### Project & requirements
- `.planning/PROJECT.md` — Core Value and full Active requirements list
- `.planning/REQUIREMENTS.md` — v1 requirements (none map to Phase 1 directly; Phase 1 is foundational)

</canonical_refs>

<code_context>
## Existing Code Insights

No existing code — this is the first phase of a greenfield project. No reusable assets, established patterns, or integration points yet. This phase establishes the baseline that all later phases build on.

</code_context>

<specifics>
## Specific Ideas

- "Cola arriba, ventanillas abajo en grilla" — queue strip on top, window cards in a grid below, is the explicit visual reference for the shell layout.
- Title text "Turnero" should appear on screen even at this scaffolding stage.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope (pure scaffolding decisions only).

</deferred>

---

*Phase: 1-project-scaffold-visible-shell*
*Context gathered: 2026-06-21*
