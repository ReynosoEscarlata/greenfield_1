# Phase 3: Configurable Ventanillas - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-06
**Phase:** 3-configurable-ventanillas
**Areas discussed:** Ventanilla card content

---

## Ventanilla Card Content

### What does each ventanilla card show?

| Option | Description | Selected |
|--------|-------------|----------|
| Label + ticket state | "Ventanilla 1" heading + "sin turno" / "Turno 5" below. Clean, minimal — all Phase 3 needs. Call button added in Phase 4. | ✓ |
| Label + ticket + button stub | Same plus a disabled "Llamar siguiente" placeholder button — previews final layout. | |
| Ticket state only | Just "sin turno" / "Turno 5", big and centered. Windows become anonymous. | |

**User's choice:** Label + ticket state (recommended)
**Notes:** No call button in Phase 3 — Phase 4 wires the action.

---

### What label format identifies each ventanilla?

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-number, sequential (never reused) | "Ventanilla 1", "Ventanilla 2", etc. Numbers assigned at creation, never reused even after removal — mirrors ticket counter invariant. | ✓ |
| Auto-number, fill gaps | Removed numbers are reused. Simpler counter, non-sequential after removals. | |
| Fixed display order (renumbers on removal) | Windows labeled by position — removing one renumbers the rest. | |

**User's choice:** Auto-number, sequential (recommended)
**Notes:** Same ever-incrementing invariant as `nextNumber` (QUEUE-01). Stable identity even after removals.

---

### What should the "no ticket yet" empty state say?

| Option | Description | Selected |
|--------|-------------|----------|
| "sin turno" | Short, matches ROADMAP.md success criteria wording literally (SC-4). | ✓ |
| "Esperando..." | Implies the window is waiting/active. Warmer tone, less precise. | |
| "—" (em dash) | Purely visual placeholder. May be unclear to new users. | |

**User's choice:** "sin turno" (recommended)
**Notes:** Canonical empty-state string consistent with spec language.

---

## Claude's Discretion

- **Add/remove control placement** — User did not select this gray area. Claude decided: shared "Agregar ventanilla" button above the grid (consistent with action-before-result pattern D-07); per-card "×" remove button inside each card.
- **Removal warning form** — User did not select this gray area. Claude decided: inline warning text inside the card (not `alert()` / `window.confirm()`), visible without disrupting other cards. Required by WINDOW-02 / SC-3.
- **State shape extension** — Claude extends `src/turnero.ts` with `Window` type, `nextWindowNumber`, and `ADD_WINDOW` / `REMOVE_WINDOW` actions. `Window.currentTicket: Ticket | null` is the Phase 4 extension point.

## Deferred Ideas

None — discussion stayed within phase scope.
