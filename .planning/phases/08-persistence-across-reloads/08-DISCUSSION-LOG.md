# Phase 8: Persistence Across Reloads - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-09
**Phase:** 8-persistence-across-reloads
**Areas discussed:** Corruption recovery UX, Storage key naming, Validation depth

---

## Corruption recovery UX

| Option | Description | Selected |
|--------|-------------|----------|
| Silent reset | App loads empty state with no message. Clean and minimal — matches the "no backend" spirit of the project. | ✓ |
| Brief notice | Show a temporary message (2–3 seconds): "Estado anterior no disponible — comenzando desde cero." Gives the operator context for why the queue is empty on reload. | |

**User's choice:** Silent reset
**Notes:** No follow-up questions. Kept minimal — consistent with the no-backend, single-screen nature of the project.

---

## Storage key naming

| Option | Description | Selected |
|--------|-------------|----------|
| `"turnero"` (simple) | Clean and readable. If the state shape changes in v2, old data would be loaded and trigger corruption recovery silently. | |
| `"turnero-v1"` (versioned) | A version suffix lets future shape changes bump to v2 and skip old data without relying on corruption recovery. | ✓ |

**User's choice:** `"turnero-v1"` (versioned)
**Notes:** Low cost now, avoids a subtle bug if QueueState is ever extended in v2 phases.

---

## Validation depth

| Option | Description | Selected |
|--------|-------------|----------|
| JSON.parse only | Wrap JSON.parse in try/catch. If it throws (invalid JSON), fall back to initialState. | ✓ |
| Parse + shape check | After parsing, also verify: queue is Array, nextNumber and nextWindowNumber are numbers, ventanillas is Array. | |

**User's choice:** JSON.parse only (try/catch on SyntaxError)
**Notes:** Versioned key (D-02) handles shape mismatches from old app versions — no need to add a structural type guard on top of parse error catching.

---

## Claude's Discretion

None — all three gray areas received explicit user decisions.

## Deferred Ideas

None — discussion stayed within Phase 8 scope.
