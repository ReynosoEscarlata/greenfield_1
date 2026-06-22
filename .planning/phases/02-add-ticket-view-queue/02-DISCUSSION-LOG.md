# Phase 2: Add Ticket & View Queue - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-22
**Phase:** 2-add-ticket-view-queue
**Areas discussed:** Ticket number format, Queue list layout, Empty queue messaging, Add button placement

---

## Ticket Number Format

| Option | Description | Selected |
|--------|-------------|----------|
| Plain number ("5") | Just the digits — cleanest, biggest possible font size for distance-readability later (Phase 7) | |
| Prefixed ("#5") | Adds a '#' before the number — slightly more "ticket-like" but a bit more visual noise | |
| Labeled ("Turno 5") | Spanish word label — most explicit for first-time users, takes more horizontal space | ✓ |

**User's choice:** Labeled ("Turno 5")
**Notes:** None — straightforward selection.

---

## Queue List Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Horizontal wrapping row of chips | Each ticket as a small rounded badge/chip in a row that wraps to multiple lines as the queue grows — matches the horizontal strip from Phase 1 | ✓ |
| Horizontal scrolling row | Single line, scrolls sideways instead of wrapping — keeps strip height fixed but requires scroll interaction | |
| Vertical list | Stacked list, one ticket per line — simplest to implement but breaks the "horizontal strip" visual established in Phase 1 | |

**User's choice:** Horizontal wrapping row of chips
**Notes:** Keeps consistency with Phase 1's D-01 (queue strip as horizontal region).

---

## Empty Queue Messaging

| Option | Description | Selected |
|--------|-------------|----------|
| Same placeholder text | Reuse "Próximos turnos aparecerán aquí" for both first-load and genuinely-empty-after-use states — simplest, no extra state to track | ✓ |
| Distinct empty message | Different text like "No hay turnos en espera" specifically for the empty-after-use case, distinct from the initial placeholder | |

**User's choice:** Same placeholder text
**Notes:** Avoids tracking a separate "has the queue ever had a ticket" flag.

---

## Add Button Placement

| Option | Description | Selected |
|--------|-------------|----------|
| Above the queue strip | Sits between the page title and the queue strip — reads top-to-bottom as "action, then result" | ✓ |
| Inside the queue strip | Lives alongside the "Cola" heading inside the queue-strip section itself — keeps the action visually tied to its result | |
| Below the queue strip | Sits between the queue strip and the ventanillas grid — separates "view" (queue above) from "action" (button) from "windows" (below) | |

**User's choice:** Above the queue strip
**Notes:** None — straightforward selection.

---

## Claude's Discretion

- Internal state shape (useState vs useReducer) for the queue array and ticket counter.
- Exact button styling beyond existing global stylesheet color conventions.
- Whether ticket chips reuse the existing `#f1f3f5` background convention or introduce a new chip style.

## Deferred Ideas

None — discussion stayed within phase scope.
