# Phase 4: Call Next (Atomic Dequeue) - Context

**Gathered:** 2026-07-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Add a "Llamar siguiente" button to each VentanillaCard that atomically dequeues the head of the shared queue and sets it as that ventanilla's currentTicket. Deliver CALL-01 (atomic dequeue, no duplicate assignments) and CALL-02 (empty-queue inline feedback). Also fix two Phase 3 code-review findings that become load-bearing once currentTicket is non-null during normal operation (WR-01, WR-02).

Sound (Phase 5), animation (Phase 6), and localStorage persistence (Phase 8) are explicitly out of scope for this phase.

</domain>

<decisions>
## Implementation Decisions

### Calling Behavior (CALL-01)
- **D-01:** "Llamar siguiente" is always enabled — same label in all states, no disabled state, no label variation when the ventanilla is occupied or the queue is empty.
- **D-02:** A ventanilla can call next even when it already has an active ticket (replace-always). The previous currentTicket is silently discarded (customer was served). No re-insertion into the queue.
- **D-03:** The reducer action is `{ type: 'CALL_NEXT'; windowId: number }` added to the QueueAction discriminated union. It pops `state.queue[0]` and sets the matching ventanilla's currentTicket to it. If queue is empty, reducer returns state unchanged (no-op) — the UI layer handles the feedback message.

### Empty-Queue Feedback (CALL-02)
- **D-04:** Feedback appears inline inside the VentanillaCard that triggered the call — consistent with the existing showWarning pattern.
- **D-05:** Message text: `"No hay turnos en espera"`.
- **D-06:** Message auto-dismisses after **2 seconds** via `setTimeout` cleared in a `useEffect` cleanup. Unlike showWarning (which persists until the next interaction), this message disappears automatically.

### Button Placement & Card Layout
- **D-07:** "Llamar siguiente" sits at the bottom of VentanillaCard, below the current ticket display, full-width. Card reads top-to-bottom: remove button (×, absolute top-right) → heading (Ventanilla N) → current ticket ("sin turno" / "Turno N") → "Llamar siguiente" button (full-width) → inline warning (below button, only when shown).

### VentanillaCard API
- **D-08:** New prop `onCallNext: (id: number) => void` — mirrors the `onRemove: (id: number) => void` signature established in Phase 3. VentanillaCard passes `ventanilla.id` to the callback.

### Queue Strip Update
- **D-09:** No special visual treatment on dequeue — the queue strip reactively removes the chip when the reducer updates state.queue. Animation is deferred to Phase 6.

### Code Review Carry-ins (WR-01, WR-02)
- **D-10 (WR-01 fix):** Add a `useEffect` in VentanillaCard that resets `showWarning` to `false` whenever `ventanilla.currentTicket` changes to `null`. Prevents stale "No se puede quitar: tiene un turno activo" warning after CALL_NEXT clears a ticket via external state change.
- **D-11 (WR-02 fix):** Add a reducer-level guard in the `REMOVE_WINDOW` case: return `state` unchanged (no-op) when the target ventanilla has `currentTicket !== null`. The UI guard in VentanillaCard remains the primary path; the reducer becomes a safety net preventing data loss via programmatic dispatch.

### Test Coverage
- **D-12:** Both unit tests (reducer) and integration tests (App.test.tsx component-level) are required. Reducer unit tests cover: CALL_NEXT dequeues head and updates currentTicket, CALL_NEXT on empty queue is a no-op (state unchanged), CALL_NEXT replaces existing currentTicket. App.test.tsx integration tests cover: button click dispatches CALL_NEXT and updates displayed ticket, empty-queue message appears on click and auto-dismisses.

### Claude's Discretion
- CSS styling for the "Llamar siguiente" button (color, border, sizing beyond full-width) — follow existing button conventions in index.css.
- `useEffect` cleanup pattern for the 2-second auto-dismiss (standard `clearTimeout` on unmount/dependency change).
- Whether to expose `VentanillaCard` integration tests as a separate describe block or extend the existing one in App.test.tsx.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project scope and requirements
- `.planning/REQUIREMENTS.md` — CALL-01 and CALL-02 requirement text (phase 4 scope)
- `.planning/PROJECT.md` — Core Value statement; Out of Scope list (no backend, no cross-tab sync)
- `.planning/ROADMAP.md` — Phase 4 success criteria and dependency on Phase 3

### Prior phase state (patterns to reuse and extend)
- `.planning/phases/03-configurable-ventanillas/03-01-SUMMARY.md` — Ventanilla type, QueueState shape, ADD_WINDOW/REMOVE_WINDOW patterns, TDD Red/Green commits
- `.planning/phases/03-configurable-ventanillas/03-02-SUMMARY.md` — VentanillaCard props API (onRemove pattern), showWarning pattern, Readonly<{}> props typing
- `.planning/phases/03-configurable-ventanillas/03-REVIEW.md` — WR-01 and WR-02 findings (the two carry-ins fixed in this phase)

### Live source files (executor MUST read before modifying)
- `src/turnero.ts` — current QueueState, QueueAction union (Phase 4 extension point comment), initialState
- `src/App.tsx` — current VentanillaCard component (onRemove pattern, showWarning, Readonly props)
- `src/turnero.test.ts` — existing unit test structure (describe/it/expect pattern, test naming)
- `src/App.test.tsx` — existing integration test structure (render, screen, fireEvent pattern)
- `src/index.css` — existing button/card/warning CSS rules to extend

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `VentanillaCard` (src/App.tsx) — extend with `onCallNext` prop alongside existing `onRemove`. Already has `showWarning` local state pattern to reuse for empty-queue message.
- `src/turnero.ts` `QueueAction` union — has explicit comment "Phase 4 extension point: add `{ type: 'CALL_NEXT'; windowId: number }` here."
- `src/turnero.ts` `Ventanilla.currentTicket: Ticket | null` — the field is already defined and ready to be set by CALL_NEXT.

### Established Patterns
- **Reducer action pattern:** Discriminated union case with `...state` spread — follow exactly.
- **UI guard in component, not reducer (primary path):** VentanillaCard handles the empty-queue case with local state; D-11 adds a reducer safety net for WR-02.
- **Readonly<{}> props:** VentanillaCard props are typed `Readonly<{...}>` (SonarLint S6759) — maintain for the expanded props.
- **TDD Red/Green:** Red phase (failing tests) committed before implementation, Green phase after.
- **Named export for testability:** `export function VentanillaCard` — already exported, no change needed.

### Integration Points
- `App.tsx` `dispatch` — add `onCallNext={(id) => dispatch({ type: 'CALL_NEXT', windowId: id })}` to VentanillaCard invocation.
- `state.ventanillas` — CALL_NEXT maps over this array to find and update the matching ventanilla's currentTicket.
- `state.queue` — CALL_NEXT pops `queue[0]`; the queue strip reactively re-renders from the updated array.

</code_context>

<specifics>
## Specific Ideas

- Empty-queue warning text is exactly `"No hay turnos en espera"` — same tone and style as the existing `"No se puede quitar: tiene un turno activo"` warning.
- Auto-dismiss timeout is exactly **2 seconds** (2000ms).
- The `CALL_NEXT` reducer case must use `...state` spread (same as ADD_TICKET fix from Phase 3) to preserve all QueueState fields.

</specifics>

<deferred>
## Deferred Ideas

- Sound on call — Phase 5 (FEEDBACK-01)
- Transition animation when ticket changes — Phase 6 (FEEDBACK-02)
- localStorage persistence — Phase 8 (PERSIST-01)
- Brief highlight on dequeued chip before removal — deferred to Phase 6 (animation phase)

</deferred>

---

*Phase: 4-call-next-atomic-dequeue*
*Context gathered: 2026-07-07*
