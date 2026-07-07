# Phase 3: Configurable Ventanillas - Context

**Gathered:** 2026-07-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can dynamically add and remove call windows (ventanillas), and each window visibly displays its own current-ticket state — either "sin turno" before any ticket has been called, or "Turno N" after one is called. This extends the vertical slice from "queue only" (Phase 2) to "queue + windows" without yet wiring the call action (Phase 4 handles that). No "Llamar siguiente" button, no sound, no animation, no persistence — those are later phases.

Requirements in scope: WINDOW-01 (add windows), WINDOW-02 (remove with guard), WINDOW-03 (per-window current-ticket display).

</domain>

<decisions>
## Implementation Decisions

### Ventanilla Card Content
- **D-08:** Each ventanilla card shows two things only: (1) a label heading ("Ventanilla 1") and (2) the current-ticket state below it ("sin turno" when no ticket ever called, "Turno 5" once called). No "Llamar siguiente" button in this phase — Phase 4 adds it. This uses the existing `.ventanillas-grid > *` card container with `#f1f3f5` background.

### Empty State Text
- **D-09:** The "no ticket yet" state for a ventanilla displays "sin turno" — matching the ROADMAP.md success criteria wording literally (SC-4) and consistent with the REQUIREMENTS.md WINDOW-03 spec. One string covers both first-load and post-removal states.

### Window Identity / Numbering
- **D-10:** Windows are identified by an ever-incrementing counter that never reuses a number, even after removal — the same invariant as the ticket counter (Phase 2 `nextNumber`). "Ventanilla 1", "Ventanilla 2", etc. If Ventanilla 1 is removed and a new window is added, it becomes "Ventanilla 3" (not "Ventanilla 1" again). This makes identity stable and avoids confusing renumbering of existing windows.

### Claude's Discretion
- **Add/remove control placement** — User did not select this area. Claude decides: a shared "Agregar ventanilla" button above the grid (consistent with D-07 pattern: action above result), and a per-card remove button inside each card (small, unobtrusive — e.g., a "×" in the card corner). Both follow the single-global-CSS-file constraint (D-02).
- **Removal warning form** — User did not select this area. Claude decides: inline text warning rendered below the remove button (or replacing it briefly) when WINDOW-02 guard triggers — no `alert()` or `window.confirm()` (those feel out of place in a modern SPA). The warning must be visible without disrupting other cards.
- **State shape extension** — `Window` type and `ADD_WINDOW` / `REMOVE_WINDOW` actions are added to `src/turnero.ts`, extending `QueueState` with a `windows: Window[]` array and a `nextWindowNumber` counter. This is the Phase 4 extension point (`CALL_NEXT` will mutate `windows[i].currentTicket`).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project & Requirements
- `.planning/PROJECT.md` — Core Value and full Active requirements list
- `.planning/REQUIREMENTS.md` — WINDOW-01 (add windows), WINDOW-02 (remove with guard — must block if active ticket present), WINDOW-03 (per-window current-ticket display) are the locked requirements for this phase

### Prior phase decisions (must remain consistent)
- `.planning/phases/01-project-scaffold-visible-shell/01-CONTEXT.md` — D-01 (queue strip horizontal on top), D-02 (single global CSS file `src/index.css`), D-03 (title "Turnero")
- `.planning/phases/02-add-ticket-view-queue/02-CONTEXT.md` — D-04 ("Turno N" ticket format), D-05 (chip list in queue strip), D-06 (empty queue placeholder text), D-07 ("Agregar turno" button above queue strip — action-before-result pattern)

### Current implementation (what this phase modifies)
- `src/App.tsx` — has placeholder `<section className="ventanillas-grid">` this phase replaces with real rendered windows
- `src/turnero.ts` — `QueueState` and `queueReducer`; this phase extends both with `Window` type, `nextWindowNumber`, and `ADD_WINDOW`/`REMOVE_WINDOW` actions
- `src/index.css` — `.ventanillas-grid` and `.ventanillas-grid > *` rules already exist; this phase adds card-interior styles and remove-button styles

### Stack & tooling
- `.planning/research/STACK.md` — no new runtime dependencies; `useReducer` pattern, single global CSS file

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `.ventanillas-grid` (CSS) — already `display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px` with `#f1f3f5` background on children. Card container is ready; add label + ticket state text inside.
- `src/turnero.ts` — `QueueState`, `QueueAction`, `queueReducer` pattern is the extension point. Add `Window` type + `nextWindowNumber` to state; add `ADD_WINDOW` / `REMOVE_WINDOW` to the action union.
- Color/typography scale: `#1f2933` primary text, `#f1f3f5` secondary background, 16px body / 20px section heading.

### Established Patterns
- Ever-incrementing independent counter never derived from array length — mirror `nextNumber` with `nextWindowNumber`.
- `useReducer` in `App.tsx` via `src/turnero.ts` — all new state and actions go there, not directly in `App.tsx`.
- Single global CSS file (D-02) — all new styles appended to `src/index.css`.

### Integration Points
- `windows: Window[]` in `QueueState` becomes the shared state Phase 4 reads when dequeuing (`CALL_NEXT` sets `window.currentTicket`).
- `Window.currentTicket` type is `Ticket | null` — `null` = "sin turno", a `Ticket` object = active ticket. Phase 4 sets this; Phase 3 only reads/displays it.
- Phase 8 (persistence) will serialize the full `QueueState` including `windows` to localStorage — keep the shape flat and JSON-serializable.

</code_context>

<specifics>
## Specific Ideas

- Card shows "Ventanilla 1" as heading + "sin turno" below (before any call), or "Turno 5" (after Phase 4 sets it). Two lines, no button in Phase 3.
- Window numbering: ever-incrementing, never reused — same mental model as ticket counter.
- "sin turno" is the canonical empty-state string for a ventanilla (SC-4 of ROADMAP.md Phase 3).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope (window add/remove + per-window display only; no call action, sound, animation, or persistence discussed).

</deferred>

---

*Phase: 3-configurable-ventanillas*
*Context gathered: 2026-07-06*
