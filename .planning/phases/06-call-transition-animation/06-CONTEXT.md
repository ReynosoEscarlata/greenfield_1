# Phase 6: Call Transition Animation - Context

**Gathered:** 2026-07-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Add a brief yellow flash/highlight animation on the ticket number text inside `VentanillaCard` whenever `currentTicket` changes after a successful call. No new capabilities, no new libraries — purely a CSS `@keyframes` effect on the existing `.ventanilla-ticket` element.

</domain>

<decisions>
## Implementation Decisions

### Animation Style
- **D-01:** Yellow flash / highlight — the ticket number briefly glows yellow/orange then fades back to normal. Classic "something changed here" signal readable from across a room.
- **D-02:** Implemented with CSS `@keyframes` on background-color or color (no animation library). Per CLAUDE.md constraint.

### Scope of Animation
- **D-03:** Animate only the `<p className="ventanilla-ticket">` element — the ticket number text only. Do NOT animate the whole `.ventanilla-card`. Surgical; doesn't affect the remove button, label, or call-next button.

### Trigger Mechanism
- **D-04:** Use the React `key` prop trick: give the `.ventanilla-ticket` element (or a wrapper span inside it) a key derived from `ventanilla.currentTicket?.id`. When the ticket changes, React unmounts and remounts the element, resetting the CSS animation automatically. No extra state, no animationend listener.

### Rapid-Call Behavior
- **D-05:** Restart animation from the beginning on rapid successive calls. The key prop trick makes this automatic — each `currentTicket` change produces a new key, React remounts, animation restarts. No queuing needed.

### No-animation Cases (already decided by ROADMAP)
- **D-06:** No animation on page load / reload, even if `currentTicket` is non-null in persisted state. The key-prop approach naturally handles this: on first mount the element mounts once with no prior key, so no animation fires. (Phase 8 will need to verify this explicitly.)
- **D-07:** No animation when `currentTicket` becomes `null` (window cleared). Only fire the animation when a real ticket number appears.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project scope and requirements
- `.planning/REQUIREMENTS.md` — FEEDBACK-02 requirement definition
- `.planning/ROADMAP.md` §Phase 6 — success criteria and cross-cutting constraints

### Existing source files to read before touching
- `src/App.tsx` — `VentanillaCard` component; the `.ventanilla-ticket` `<p>` element is the animation target (lines 63–68)
- `src/index.css` — all existing CSS classes; new `@keyframes` and animation class go here

### Stack constraints
- `CLAUDE.md` §What NOT to Use — no `framer-motion`, no animation libraries; use CSS transitions/`@keyframes`
- `CLAUDE.md` §Technology Stack — Vite + React 19 + TypeScript; `key` prop remount pattern explicitly endorsed

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `VentanillaCard` in `src/App.tsx` (exported named function, lines 5–82) — animation target; receives `ventanilla` prop with `currentTicket: Ticket | null`
- `src/index.css` `.ventanilla-ticket` class (lines 117–122) — existing selector to extend with animation; currently `font-size: 16px, font-weight: 400, color: #1f2933`

### Established Patterns
- Key prop remount trick: explicitly endorsed in CLAUDE.md §Stack Patterns for "a single 'ticket number changes' effect"
- CSS `@keyframes`: all animation in the app uses plain CSS — no runtime animation state
- `VentanillaCard` already has `useEffect` for WR-01 (currentTicket → null resets warning) — the same prop is the animation trigger but implemented differently (key prop, not effect)

### Integration Points
- `<p className="ventanilla-ticket">` at App.tsx line 63 — wrap content in a `<span key={ventanilla.currentTicket?.id ?? 'empty'}>` or add key directly to the `<p>` to trigger remount on ticket change
- The `@keyframes` rule and `.ventanilla-ticket-flash` animation class go in `index.css`
- No changes needed to `turnero.ts`, `useBeep.ts`, or `setupTests.ts`

</code_context>

<specifics>
## Specific Ideas

- Yellow/orange highlight on the ticket number — consistent with a medical/clinic context where "something just changed" needs to be legible from a distance
- Animation should be short (suggested ~500ms–800ms) — enough to notice, not long enough to be annoying on rapid calls

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 6-call-transition-animation*
*Context gathered: 2026-07-08*
