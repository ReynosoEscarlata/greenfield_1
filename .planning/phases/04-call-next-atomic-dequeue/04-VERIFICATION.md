---
phase: 04-call-next-atomic-dequeue
verified: 2026-07-07T17:05:00Z
status: human_needed
score: 14/14 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Test A — Button visibility (D-07, D-01): Add 2 ventanillas; confirm both cards show a full-width 'Llamar siguiente' button below the ticket display, present regardless of ticket state"
    expected: "Button is visible, full-width, at the bottom of every VentanillaCard at all times"
    why_human: "Visual layout and button styling cannot be confirmed by grep or test output; requires browser rendering"
  - test: "Test B — Successful call flow (CALL-01): Add 2 tickets; call Ventanilla 1 then Ventanilla 2; verify ticket numbers move from queue to ventanilla display sequentially; then verify replace-always by calling Ventanilla 1 again after adding a 3rd ticket"
    expected: "Each ventanilla shows its called ticket number; queue chip disappears on each call; previous ticket on a ventanilla is silently replaced (D-02)"
    why_human: "End-to-end user flow through the live browser; automated tests cover the reducer and click-handler but not the full rendered DOM update chain visible to a user"
  - test: "Test C — Empty-queue warning (CALL-02): With an empty queue, click 'Llamar siguiente' on any ventanilla; wait 2 seconds; click again"
    expected: "'No hay turnos en espera' appears inline inside only the clicked card, auto-dismisses after 2 seconds, button remains usable afterward"
    why_human: "Visual placement of warning inside the specific card and the perceived timing of the auto-dismiss require a human observer; automated test covers the timer logic but not the visual isolation per-card"
  - test: "Test D — WR-01 stale warning regression: Add a ventanilla + ticket; call next (assigns ticket); click x (removal warning appears); add another ticket; call next again; verify the removal warning disappears"
    expected: "Removal warning 'No se puede quitar: tiene un turno activo' disappears when CALL_NEXT clears the active ticket from outside the component"
    why_human: "Requires observing the DOM state transitions across multiple sequential interactions in the browser; automated WR-01 test covers rerender logic but not the full visual flow"
---

# Phase 4: Call Next (Atomic Dequeue) — Verification Report

**Phase Goal:** Users can press "Llamar siguiente" on any ventanilla and reliably take the next ticket from the shared queue with no possibility of duplicate or skipped tickets across simultaneous clicks, completing the Core Value end-to-end.
**Verified:** 2026-07-07T17:05:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

All automated truths are VERIFIED. Human-only items are listed in the Human Verification section.

| #  | Truth | Status | Evidence |
|----|-------|--------|---------|
| 1  | ROADMAP SC-1: Ventanilla's current ticket updates to head of queue; that ticket simultaneously removed from queue | VERIFIED | `queueReducer` CALL_NEXT case (turnero.ts:86-98) dequeues `state.queue[0]` into matching ventanilla and returns `remainingQueue`; CALL-01-A unit test + CALL-01 integration test both pass |
| 2  | ROADMAP SC-2: Rapid simultaneous clicks on two ventanillas never assign the same ticket to both | VERIFIED (architecture) | JavaScript is single-threaded; `useReducer` dispatches are processed synchronously and serially by React's scheduler — two dispatches arriving in the same frame will each see the state produced by the previous one; no shared mutable reference exists between dispatches |
| 3  | ROADMAP SC-3: Empty-queue press shows "no waiting tickets" message; button remains usable | VERIFIED | `handleCallNext` guard (`if (isQueueEmpty) { setShowEmptyWarning(true); return }`) in App.tsx:42-45; CALL-02 integration test passes with fake timers |
| 4  | CALL_NEXT is a member of QueueAction union with shape `{ type: 'CALL_NEXT'; windowId: number }` | VERIFIED | `turnero.ts:38`: `\| { type: 'CALL_NEXT'; windowId: number }` — fourth union member |
| 5  | CALL_NEXT reducer case dequeues `state.queue[0]` and assigns it to the matching ventanilla's `currentTicket` | VERIFIED | `turnero.ts:86-98`: early return on empty queue, then `[nextTicket, ...remainingQueue] = state.queue`, map sets `currentTicket: nextTicket` for matching `v.id === action.windowId` |
| 6  | CALL_NEXT on empty queue returns state unchanged (referential equality) | VERIFIED | `turnero.ts:87`: `if (state.queue.length === 0) return state`; CALL-01-B test asserts `expect(state).toBe(before)` — passes |
| 7  | REMOVE_WINDOW on ventanilla with non-null currentTicket returns state unchanged (WR-02 guard) | VERIFIED | `turnero.ts:77-79`: `const target = find(v.id === action.id); if (target !== undefined && target.currentTicket !== null) return state`; WR-02-A test passes |
| 8  | All 15 unit tests pass (11 existing + 4 new CALL-01/WR-02) | VERIFIED | Live `npm test` run: `15 passed` in `src/turnero.test.ts` |
| 9  | Every VentanillaCard renders a "Llamar siguiente" button below the current-ticket display, full-width | VERIFIED (code) | `App.tsx:66`: `<button type="button" className="call-next-button" onClick={handleCallNext}>Llamar siguiente</button>` below `p.ventanilla-ticket`; `index.css:147`: `.call-next-button { ... width: 100%; margin: 8px 0 0; }` |
| 10 | Clicking "Llamar siguiente" on non-empty queue calls `onCallNext(ventanilla.id)` | VERIFIED | `App.tsx:46-47`: `else { onCallNext(ventanilla.id) }`; App dispatch at line 128: `onCallNext={(id) => dispatch({ type: 'CALL_NEXT', windowId: id })}`; CALL-01 integration test passes |
| 11 | Clicking "Llamar siguiente" on empty queue shows "No hay turnos en espera" inline | VERIFIED | `App.tsx:74-76`: `{showEmptyWarning && <p className="ventanilla-warning">No hay turnos en espera</p>}`; CALL-02 integration test confirms text present after click |
| 12 | Empty-queue message auto-dismisses after 2 seconds via `useEffect` + `clearTimeout` | VERIFIED | `App.tsx:27-31`: `useEffect(() => { if (!showEmptyWarning) return; const timer = setTimeout(() => setShowEmptyWarning(false), 2000); return () => clearTimeout(timer) }, [showEmptyWarning])`; CALL-02 test with `vi.advanceTimersByTime(2000)` passes |
| 13 | `showWarning` resets to false when `ventanilla.currentTicket` changes to null externally (WR-01) | VERIFIED | `App.tsx:20-24`: `useEffect(() => { if (ventanilla.currentTicket === null) { setShowWarning(false) } }, [ventanilla.currentTicket])`; WR-01 integration test passes |
| 14 | All 21 tests pass (15 unit + 6 integration) | VERIFIED | Live `npm test` run: `21 passed (21)`, exit code 0 |

**Score:** 14/14 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/turnero.ts` | CALL_NEXT union member + reducer case + WR-02 REMOVE_WINDOW guard | VERIFIED | 102 lines; QueueAction has 4 members; CALL_NEXT case at lines 86-98; WR-02 guard at lines 77-79 |
| `src/turnero.test.ts` | 15 unit tests incl. CALL-01 (3 cases) + WR-02 (1 case) | VERIFIED | 122 lines; two new describe blocks (`CALL-01: CALL_NEXT reducer` and `WR-02: REMOVE_WINDOW reducer guard`); all 15 tests green |
| `src/App.test.tsx` | 6 integration tests (3 existing updated + 3 new); `act` imported | VERIFIED | 117 lines; `act` on line 1; all existing VentanillaCard renders include `onCallNext={() => {}}` and `isQueueEmpty={false}`; 3 new describe blocks (CALL-01, CALL-02, WR-01) all pass |
| `src/App.tsx` | VentanillaCard with `onCallNext` + `isQueueEmpty` props, WR-01 useEffect, CALL-02 useEffect, `handleCallNext`, button + warning JSX; App dispatch wiring | VERIFIED | 140 lines; both props in `Readonly<{...}>` at lines 12-14; both useEffects at lines 20-31; `handleCallNext` at lines 42-48; button at line 66; warning at lines 74-76; App dispatch at lines 128-129 |
| `src/index.css` | `.call-next-button` CSS rule with `width: 100%` | VERIFIED | Rule at line 147; includes `width: 100%` and `margin: 8px 0 0`; follows `.add-window-button` conventions |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `src/turnero.test.ts` | `src/turnero.ts` | `queueReducer(state, { type: 'CALL_NEXT', windowId: 1 })` | WIRED | 3 test cases in CALL-01 describe block use this dispatch pattern; 15/15 pass |
| `src/App.test.tsx` | `src/App.tsx` VentanillaCard | Props `onCallNext` and `isQueueEmpty` | WIRED | All 5 render calls include both props; CALL-01, CALL-02, WR-01 integration tests pass |
| `VentanillaCard handleCallNext` | `App` dispatch | `onCallNext prop → dispatch({ type: 'CALL_NEXT', windowId: id })` | WIRED | `App.tsx:128`: `onCallNext={(id) => dispatch({ type: 'CALL_NEXT', windowId: id })}` |
| `VentanillaCard` | `App` state | `isQueueEmpty={state.queue.length === 0}` | WIRED | `App.tsx:129`: `isQueueEmpty={state.queue.length === 0}` — single source of truth |
| `WR-01 useEffect` | `ventanilla.currentTicket` prop | Dep array `[ventanilla.currentTicket]` | WIRED | `App.tsx:24`: dependency array is `[ventanilla.currentTicket]` — not `[]` or `[ventanilla]` |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `VentanillaCard` (App.tsx) | `ventanilla.currentTicket` | `state.ventanillas` from `useReducer(queueReducer, initialState)` at App level | Yes — reducer computes from dispatched actions; no hardcoded values | FLOWING |
| `VentanillaCard` (App.tsx) | `isQueueEmpty` | `state.queue.length === 0` computed inline at App render | Yes — derived from live reducer state | FLOWING |
| `VentanillaCard` (App.tsx) | `showEmptyWarning` | Local `useState(false)` set by `handleCallNext` when `isQueueEmpty` | Yes — driven by real `isQueueEmpty` prop; cleared by real setTimeout | FLOWING |

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All 21 tests pass | `npm test` (live run) | `21 passed (21)`, exit code 0 | PASS |
| CALL_NEXT union member exists | `grep "CALL_NEXT" src/turnero.ts` | Line 38: `\| { type: 'CALL_NEXT'; windowId: number }` | PASS |
| WR-02 guard uses explicit undefined check | `grep "target !== undefined" src/turnero.ts` | Line 78: `if (target !== undefined && target.currentTicket !== null)` | PASS |
| `isQueueEmpty` wired to `state.queue.length` | `grep "isQueueEmpty" src/App.tsx` | Line 129: `isQueueEmpty={state.queue.length === 0}` | PASS |
| `.call-next-button` CSS has `width: 100%` | `grep "width: 100%" src/index.css` | Line 157: `width: 100%;` inside `.call-next-button` rule | PASS |

---

### Probe Execution

Step 7c: SKIPPED — no `scripts/*/tests/probe-*.sh` files found in repository; phase is a React UI/reducer phase with no CLI or migration probes declared.

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| CALL-01 | 04-01-PLAN.md, 04-02-PLAN.md | Usuario puede presionar "Llamar siguiente" en una ventanilla para tomar de forma atómica el próximo turno de la cola compartida | SATISFIED | CALL_NEXT reducer (turnero.ts:86-98); handleCallNext dispatch wiring (App.tsx:42-48, 128); 4 unit tests + 1 integration test green |
| CALL-02 | 04-02-PLAN.md | Si la cola está vacía al presionar "Llamar siguiente", se muestra un mensaje indicando que no hay turnos en espera (el botón permanece habilitado) | SATISFIED | `handleCallNext` guard + `setShowEmptyWarning(true)` + `showEmptyWarning && p.ventanilla-warning` (App.tsx:42-45, 74-76); CALL-02 integration test green |

No orphaned requirements found: REQUIREMENTS.md maps CALL-01 and CALL-02 to Phase 4; both appear in plan frontmatter and are fully implemented.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | — | — | No TBD/FIXME/XXX/TODO/HACK/PLACEHOLDER markers found in any of the 5 modified files |

No stub indicators detected. No hardcoded empty data flowing to render. No unconnected props. No return-null or return-[] from non-test code.

---

### Human Verification Required

The following items cannot be confirmed programmatically. The SUMMARY.md documents that the visual checkpoint was approved by the user on 2026-07-07, but per adversarial verification protocol these must be re-confirmed.

#### 1. Button Visibility and Full-Width Rendering (Test A)

**Test:** Open http://localhost:5173; add 2 ventanillas; confirm both cards show "Llamar siguiente" button at card bottom spanning full card width, visible before and after calling any ticket.
**Expected:** Button is full-width, visually distinct, present at all times regardless of ticket state (D-07, D-01).
**Why human:** CSS `width: 100%` and visual layout require browser rendering to confirm; grep confirms the property exists but not that it renders correctly across card widths.

#### 2. End-to-End Successful Call Flow (Test B)

**Test:** Add 2 tickets; click "Llamar siguiente" on Ventanilla 1 (should show Turno 1, queue chip disappears); click on Ventanilla 2 (should show Turno 2, queue empty); add Turno 3; click "Llamar siguiente" on Ventanilla 1 again (should replace Turno 1 with Turno 3).
**Expected:** Each call moves the queue head to the ventanilla display; previous ticket on a ventanilla is silently replaced.
**Why human:** Full user flow involving multiple DOM updates across queue strip and ventanilla cards requires browser observation; automated tests cover individual behaviors but not the complete visible state at each step.

#### 3. Empty-Queue Warning Placement and Auto-Dismiss (Test C)

**Test:** With empty queue, click "Llamar siguiente"; observe which card shows the warning; wait 2 seconds.
**Expected:** "No hay turnos en espera" appears inline inside ONLY the clicked card, disappears after 2 seconds, button remains clickable.
**Why human:** Per-card isolation of the warning (not a global toast) and the perceived 2-second timing require a human observer; automated CALL-02 test verifies the timer logic but not the visual containment.

#### 4. WR-01 Stale Warning Regression (Test D)

**Test:** Add ventanilla + ticket; call next (ticket assigned); click × on that ventanilla (removal warning appears); add another ticket; call next on the same ventanilla; verify removal warning disappears.
**Expected:** Removal warning "No se puede quitar: tiene un turno activo" clears when currentTicket is updated externally by CALL_NEXT.
**Why human:** Requires observing the state transition of the removal warning across a multi-step interaction sequence in the live browser.

---

### Gaps Summary

No automated gaps. All 14 must-have truths are verified. All 5 required artifacts exist, are substantive, and are correctly wired. Both requirement IDs (CALL-01, CALL-02) are fully satisfied. No debt markers found.

The only remaining items are the 4 visual/browser verification tests listed above. The SUMMARY.md records user approval on 2026-07-07 for all four tests; human re-confirmation will close this phase.

---

_Verified: 2026-07-07T17:05:00Z_
_Verifier: Claude (gsd-verifier)_
