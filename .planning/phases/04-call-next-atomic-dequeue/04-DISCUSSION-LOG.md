# Phase 4: Call Next (Atomic Dequeue) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-07
**Phase:** 4-call-next-atomic-dequeue
**Areas discussed:** Calling while occupied, Empty-queue feedback, Code review carry-ins, Button label & visual state, VentanillaCard API, Ticket display on call, Button placement in card, Empty-queue message text, Test coverage for CALL_NEXT

---

## Calling behavior when ventanilla is occupied

| Option | Description | Selected |
|--------|-------------|----------|
| Replace — always allowed | Calling next replaces the current ticket. Most realistic clinic workflow. | ✓ |
| Block — must remove ticket first | Can't call next while occupied. Adds friction but prevents accidental skips. | |
| You decide | Let the planner choose the most ergonomic option | |

**User's choice:** Replace — always allowed
**Notes:** Follow-up confirmed the displaced ticket is silently discarded (customer was served), not re-inserted into the queue.

---

## Displaced ticket fate

| Option | Description | Selected |
|--------|-------------|----------|
| Silently discard it | The old ticket is simply gone — customer was served. No re-insertion. | ✓ |
| Return it to the queue front | Re-insert at head of queue, as if not yet called. | |

**User's choice:** Silently discard it

---

## Empty-queue feedback placement (CALL-02)

| Option | Description | Selected |
|--------|-------------|----------|
| Inline in the ventanilla card | Warning inside the pressed card — same pattern as showWarning. | ✓ |
| Page-level banner or toast | Message at top/bottom of page — new UI pattern. | |
| You decide | Let the planner choose based on existing patterns | |

**User's choice:** Inline in the ventanilla card

---

## Empty-queue message duration

| Option | Description | Selected |
|--------|-------------|----------|
| Show until next interaction | Stays until user presses button again or adds a ticket. | |
| Auto-dismiss after ~2 seconds | Disappears automatically via setTimeout. | ✓ |
| You decide | Let the planner choose | |

**User's choice:** Initially entered "Desaparece tras 2 minutos" — clarified and confirmed as 2 segundos (2 seconds).

---

## WR-01: showWarning stale state fix

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — fix in Phase 4 | Add useEffect to reset showWarning when currentTicket becomes null. | ✓ |
| No — defer to a cleanup phase | Leave for now — rare interaction. | |

**User's choice:** Yes — fix in Phase 4

---

## WR-02: REMOVE_WINDOW reducer guard

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — add reducer guard in Phase 4 | Return state unchanged when target has currentTicket !== null. Safety net. | ✓ |
| No — keep UI-only guard | Trust the UI layer. Phase 3 accepted tradeoff T-03-02. | |

**User's choice:** Yes — add reducer guard in Phase 4

---

## Button label & visual state

| Option | Description | Selected |
|--------|-------------|----------|
| Always same label, always enabled | "Llamar siguiente" in all states. Simple, consistent. | ✓ |
| Change label when occupied | "Llamar siguiente" / "Siguiente turno" depending on state. | |
| You decide | Let the planner choose | |

**User's choice:** Always same label, always enabled

---

## VentanillaCard API — onCallNext signature

| Option | Description | Selected |
|--------|-------------|----------|
| (id: number) => void | Mirrors onRemove pattern from Phase 3. Consistent API. | ✓ |
| () => void | Card already knows its own id. Simpler but diverges from onRemove. | |

**User's choice:** (id: number) => void

---

## Queue strip update on call

| Option | Description | Selected |
|--------|-------------|----------|
| Just reactively remove the chip | Automatic — queue strip re-renders from updated state.queue. | ✓ |
| Brief highlight before removal | Flash the chip briefly. Better UX but complex; Phase 6 adds animation. | |

**User's choice:** Just reactively remove the chip

---

## Button placement in VentanillaCard

| Option | Description | Selected |
|--------|-------------|----------|
| Below ticket display, full-width | Primary action at bottom of card. Clear visual hierarchy. | ✓ |
| Below ticket display, not full-width | Same position but compact inline button. | |
| You decide | Let the planner choose based on existing card CSS | |

**User's choice:** Below the ticket display, full-width

---

## Empty-queue message text

| Option | Description | Selected |
|--------|-------------|----------|
| "No hay turnos en espera" | Clear, direct. Same tone as existing warnings. | ✓ |
| "La cola está vacía" | Slightly more conversational. | |
| Other | User-provided text | |

**User's choice:** "No hay turnos en espera"

---

## Test coverage for CALL_NEXT

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — both unit + integration | Reducer unit tests + App.test.tsx integration tests. TDD pattern. | ✓ |
| Reducer unit tests only | Skip App.test.tsx. Test UI manually. | |

**User's choice:** Yes — both unit + integration

---

## Claude's Discretion

- CSS styling for "Llamar siguiente" button (color, border, sizing beyond full-width)
- `useEffect` cleanup pattern for the 2-second auto-dismiss
- Whether to extend the existing describe block in App.test.tsx or add a new one

## Deferred Ideas

- Sound on call — Phase 5 (FEEDBACK-01)
- Transition animation when ticket changes — Phase 6 (FEEDBACK-02)
- localStorage persistence — Phase 8 (PERSIST-01)
- Brief highlight on dequeued chip before removal — Phase 6 (animation phase)
