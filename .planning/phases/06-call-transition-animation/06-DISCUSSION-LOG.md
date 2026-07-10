# Phase 6: Call Transition Animation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-08
**Phase:** 06-call-transition-animation
**Areas discussed:** Animation feel, Scope, Rapid-call behavior

---

## Animation feel

| Option | Description | Selected |
|--------|-------------|----------|
| Yellow flash / highlight | Number briefly glows yellow or orange then fades to normal. Classic "something changed here" pattern — instantly readable from across a room. | ✓ |
| Slide up | Old number exits upward, new number enters from below. More theatrical, needs overflow:hidden. | |
| Fade in | Opacity 0 → 1. Subtle, unobtrusive. | |
| You decide | Pick whichever fits a clinic waiting-room context best. | |

**User's choice:** Yellow flash / highlight (Recommended)
**Notes:** No additional clarification provided.

---

## Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Only the ticket number text | The `<p className="ventanilla-ticket">` element gets the flash. Surgical, doesn't affect buttons or labels. | ✓ |
| The whole ventanilla card | The `.ventanilla-card` div flashes. More visible from a distance but buttons/labels also flash. | |

**User's choice:** Only the ticket number text (Recommended)
**Notes:** No additional clarification provided.

---

## Rapid-call behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Restart the animation | Each call restarts the flash from the beginning. Automatic with key-prop trick. | ✓ |
| Let it finish first, then replay | Queue animations; each flash plays fully. Requires animationend listener + queue — more complexity. | |

**User's choice:** Restart the animation (Recommended)
**Notes:** No additional clarification provided.

---

## Claude's Discretion

None — user selected an explicit option for every area.

## Deferred Ideas

None — discussion stayed within phase scope.
