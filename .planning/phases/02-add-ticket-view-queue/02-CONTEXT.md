# Phase 2: Add Ticket & View Queue - Context

**Gathered:** 2026-06-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can click "Agregar turno" to add a new ticket to the shared queue, with the ticket number drawn from an independent, ever-incrementing counter, and immediately see the ordered list of waiting tickets update. This is the first true end-to-end vertical slice of the Core Value (QUEUE-01, QUEUE-02). No ventanillas/windows logic, no "llamar siguiente" / call logic, no sound, no animation, no persistence — those are later phases.

</domain>

<decisions>
## Implementation Decisions

### Ticket Number Format
- **D-04:** Tickets display as a labeled string, e.g. "Turno 5" — not a bare number ("5") and not a hash-prefixed form ("#5"). Most explicit for first-time users. This format applies everywhere a ticket number is shown going forward (queue chips now; ventanilla current-ticket display in later phases should follow the same convention unless a future phase explicitly revisits it).

### Queue List Layout
- **D-05:** Waiting tickets render as a horizontal wrapping row of chips/badges inside the existing `.queue-strip` region — each ticket is a small rounded badge, and the row wraps to additional lines as the queue grows (does not scroll sideways, does not become a vertical list). This preserves the "horizontal strip" visual locked in Phase 1 (D-01).

### Empty Queue Messaging
- **D-06:** Reuse the existing placeholder copy "Próximos turnos aparecerán aquí" for the empty-queue state — both on first load (before any ticket has ever been added) and whenever the queue becomes empty again after tickets are added. No separate "no hay turnos en espera" message; one empty-state string covers both cases.

### Add Button Placement
- **D-07:** The "Agregar turno" button is placed above the queue strip (between the `<h1>` page title and the `.queue-strip` section) — reads top-to-bottom as "action, then result."

### Claude's Discretion
- Internal state shape (useState vs useReducer) for the queue array and the independent ticket counter — implementation detail, not discussed with the user. STACK.md recommends colocated `useState`/`useReducer` in the root `App` component or one custom hook; either satisfies D-04/D-05/D-06/D-07 above.
- Exact button styling (color/size) beyond using the existing global stylesheet conventions (`#1f2933` text, `#f1f3f5` secondary background) from Phase 1.
- Whether the chip/badge styling reuses `.ventanillas-grid > *`'s `#f1f3f5` background convention or introduces a new chip style — left to Claude, as long as it stays within the single-global-CSS-file constraint (Phase 1 D-02).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & requirements
- `.planning/PROJECT.md` — Core Value and full Active requirements list
- `.planning/REQUIREMENTS.md` — QUEUE-01 (ticket numbering, independent counter, never resets based on queue length) and QUEUE-02 (ordered list of waiting tickets) are the locked requirements for this phase

### Prior phase decisions (must remain consistent)
- `.planning/phases/01-project-scaffold-visible-shell/01-CONTEXT.md` — D-01 (queue strip is a horizontal region on top), D-02 (single global CSS file), D-03 (title "Turnero")
- `.planning/phases/01-project-scaffold-visible-shell/01-01-SUMMARY.md` — current actual shell implementation (`src/App.tsx`, `src/index.css`) that this phase modifies, not replaces

### Stack & tooling
- `.planning/research/STACK.md` — confirms no new runtime dependencies needed (React 19 + TypeScript + Vite, `useState`/`useReducer` only, no Zustand/Redux)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/App.tsx` — currently a static functional component with no state; this phase adds the queue array, the ticket counter, the "Agregar turno" button, and replaces the queue-strip's placeholder `<p>` with the rendered ticket list (or the same placeholder text when empty, per D-06).
- `src/index.css` — single global stylesheet (Phase 1 D-02); existing `.queue-strip` and `.ventanillas-grid > *` rules establish the `#f1f3f5` secondary-background convention this phase's ticket chips should likely follow.

### Established Patterns
- Color/typography scale from Phase 1: `#1f2933` (primary text), `#f1f3f5` (secondary background), 16px body / 20px section heading / 28px page title.
- No state management library — plain React hooks only, per STACK.md "What NOT to Use."

### Integration Points
- The queue array and ticket counter created in this phase become the shared state that Phase 4 ("Llamar siguiente") reads from and Phase 8 (persistence) will serialize to localStorage — keep the state shape simple and exported/structured so later phases can extend it without a rewrite.

</code_context>

<specifics>
## Specific Ideas

- "Turno 5" labeled format, not "#5" or bare "5".
- Queue chips wrap horizontally within the existing queue-strip, never scroll sideways or stack vertically.
- Button reads top-to-bottom: title → "Agregar turno" button → queue strip → ventanillas grid.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope (ticket add + queue display only; no call logic, sound, animation, or persistence discussed).

</deferred>

---

*Phase: 2-add-ticket-view-queue*
*Context gathered: 2026-06-22*
