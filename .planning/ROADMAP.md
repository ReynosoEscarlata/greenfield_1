# Roadmap: Turnero de Sala de Espera

## Overview

This roadmap delivers a client-only React + TypeScript + Vite waiting-room queue display through vertical slices: each phase ships an observable, end-to-end user capability rather than a horizontal technical layer. We start with a visible app shell, then layer in adding tickets and viewing the queue, configuring windows, calling the next ticket atomically, sound feedback, transition animation, distance-readable/privacy-safe display, and finally localStorage persistence — in that order because each later phase's underlying state shape depends on the previous one being correct and stable. Mode is MVP: every phase after the first produces something a user can see and interact with in the browser, building toward the Core Value of a queue/window display that is always correct and race-free.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Project Scaffold & Visible Shell** - App boots with Vite/React/TS and renders a static page shell in the browser (completed 2026-06-22)
- [x] **Phase 2: Add Ticket & View Queue** - User can add tickets and see them appear in the ordered waiting queue end-to-end (completed 2026-07-07)
- [x] **Phase 3: Configurable Ventanillas** - User can add/remove windows and see each window's current-ticket state, including the empty state (completed 2026-07-07)
- [x] **Phase 4: Call Next (Atomic Dequeue)** - User can press "Llamar siguiente" on any window to atomically pull the next ticket from the shared queue, including the empty-queue case (completed 2026-07-07)
- [x] **Phase 5: Call Sound Feedback** - User hears a beep synchronously when a call action takes a ticket (completed 2026-07-08)
- [ ] **Phase 6: Call Transition Animation** - User sees a visual transition animation when a window's current ticket changes
- [ ] **Phase 7: Distance-Readable & Privacy-Safe Display** - User can read ticket numbers from across a room, and the screen never reveals patient-identifying data
- [ ] **Phase 8: Persistence Across Reloads** - User's queue and window state survive a page reload, with defensive recovery from corrupted/missing data

## Phase Details

### Phase 1: Project Scaffold & Visible Shell
**Goal**: A working React + TypeScript + Vite app boots in the browser and renders a static page shell (title/layout placeholders), proving the toolchain and dev loop work before any feature logic is added
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: None (foundational scaffold; no v1 requirement maps directly to bootstrapping the toolchain)
**Success Criteria** (what must be TRUE):
  1. Running the dev server shows a rendered page in the browser (not a blank screen or build error)
  2. The project is TypeScript-checked and builds without errors
  3. A minimal layout shell exists with placeholder regions for queue and ventanillas, ready for Phase 2+ to fill in
**Plans**: 1 plan

Plans:
- [x] 01-01-PLAN.md — Scaffold Vite/React/TS and render static visible shell (title + queue/ventanillas placeholders)

### Phase 2: Add Ticket & View Queue
**Goal**: Users can add a new ticket to the shared queue and see the ordered list of waiting tickets update immediately — the first true end-to-end vertical slice of the Core Value
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: QUEUE-01, QUEUE-02
**Success Criteria** (what must be TRUE):
  1. User clicks "Agregar turno" and a new ticket appears at the end of the visible queue with the next sequential number
  2. Ticket numbers increment from an independent counter, never collide, and never reset based on queue length after removals
  3. User can see the full ordered list of upcoming tickets at any time
**Plans**: 1 plan

Plans:
- [x] 02-01-PLAN.md — Install vitest, implement queueReducer (Ticket type + ADD_TICKET action), wire "Agregar turno" button and conditional chip list into App.tsx, append CSS rules

### Phase 3: Configurable Ventanillas
**Goal**: Users can dynamically configure how many call windows exist, and each window visibly displays its own current-ticket state (including an explicit empty state) — extending the vertical slice from "queue only" to "queue + windows" without yet wiring the call action
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: WINDOW-01, WINDOW-02, WINDOW-03
**Success Criteria** (what must be TRUE):
  1. User can add a new ventanilla and it appears on screen ready to operate
  2. User can remove a ventanilla that has no active current ticket
  3. If a user tries to remove a ventanilla that has an active current ticket, the app blocks the removal and shows a warning instead of silently discarding the ticket
  4. Each ventanilla visibly shows "sin turno" until it has called a ticket at least once
**Plans**: 2 plans

Plans:

**Wave 1**
- [x] 03-01-PLAN.md — Extend turnero.ts (Ventanilla type, QueueState, ADD_TICKET spread fix, ADD_WINDOW/REMOVE_WINDOW), extend turnero.test.ts (WINDOW-01/02/03 unit tests), create App.test.tsx scaffold (failing integration tests), add test script to package.json (completed 2026-07-07)

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 03-02-PLAN.md — Update App.tsx (VentanillaCard component, ventanillas section, Agregar ventanilla button, WINDOW-02 guard), update index.css (migrate stale selectors, add card/button/warning styles), visual checkpoint

**Cross-cutting constraints:**
- `ADD_TICKET` spread fix must land in Wave 1 — without it, any window add followed by ticket add silently drops ventanilla state
- `VentanillaCard` must be a named export from `App.tsx` so Wave 1's `App.test.tsx` integration tests can render it in isolation

### Phase 4: Call Next (Atomic Dequeue)
**Goal**: Users can press "Llamar siguiente" on any ventanilla and reliably take the next ticket from the shared queue with no possibility of duplicate or skipped tickets across simultaneous clicks, completing the Core Value end-to-end
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: CALL-01, CALL-02
**Success Criteria** (what must be TRUE):
  1. User presses "Llamar siguiente" on a ventanilla and that ventanilla's current ticket updates to the head of the queue, which is simultaneously removed from the visible queue
  2. Rapidly pressing "Llamar siguiente" on two different ventanillas never assigns the same ticket to both
  3. If the queue is empty when "Llamar siguiente" is pressed, the user sees a message stating there are no waiting tickets, and the button remains usable afterward
**Plans**: 2 plans

Plans:

**Wave 1**
- [x] 04-01-PLAN.md — Write RED tests (turnero.test.ts CALL-01/WR-02 unit tests + App.test.tsx CALL-01/CALL-02/WR-01 integration tests + update existing tests with new required props); implement CALL_NEXT reducer case and WR-02 REMOVE_WINDOW guard in turnero.ts

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 04-02-PLAN.md — Extend VentanillaCard in App.tsx (onCallNext + isQueueEmpty props, WR-01 useEffect, CALL-02 useEffect, handleCallNext, Llamar siguiente button + empty-queue warning JSX, App dispatch wiring); add .call-next-button CSS; visual checkpoint

**Cross-cutting constraints:**
- CALL_NEXT must land in turnero.ts before App.tsx wires dispatch — TypeScript enforces the QueueAction union at the call site
- Existing App.test.tsx VentanillaCard renders must receive onCallNext and isQueueEmpty in Wave 1 to prevent TypeScript errors when Wave 2 extends the prop signature

### Phase 5: Call Sound Feedback
**Goal**: Users hear an audible beep at the exact moment a ventanilla successfully calls a ticket, reinforcing the call event without affecting page-load or reload behavior
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: FEEDBACK-01
**Success Criteria** (what must be TRUE):
  1. User hears a beep immediately when pressing "Llamar siguiente" and a ticket is successfully taken
  2. No beep plays on page load or on reload, even though the same state change (current ticket being set) occurs during hydration
  3. No beep plays when "Llamar siguiente" is pressed on an empty queue (no ticket taken)
**Plans**: 2 plans

Plans:

**Wave 1**
- [x] 05-01-PLAN.md — TDD RED: create useBeep stub, extend setupTests.ts with AudioContext mock, update App.test.tsx (vi.mock + 7 isQueueEmpty→queueLength prop renames + FEEDBACK-01 describe block)

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 05-02-PLAN.md — TDD GREEN: implement useBeep.ts (lazy singleton AudioContext, 880 Hz/200ms beep with decay envelope), update App.tsx (import useBeep, rename prop isQueueEmpty→queueLength, add playBeep() in handleCallNext, update JSX prop pass-through)

**Cross-cutting constraints:**
- playBeep() must be called BEFORE onCallNext() in handleCallNext — guarantees synchrony inside the user gesture (browser autoplay policy)
- exponentialRampToValueAtTime target must be 0.001 not 0 — spec requires positive non-zero value for exponential ramp

### Phase 6: Call Transition Animation
**Goal**: Users see a visible, brief transition animation whenever a ventanilla's current ticket changes, giving clear visual confirmation of which window just changed
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: FEEDBACK-02
**Success Criteria** (what must be TRUE):
  1. User sees a transition animation on a ventanilla's display the moment its current ticket changes after a successful call
  2. The animation is scoped to the ventanilla that changed, not the whole page
  3. The animation does not interfere with rapid sequential calls (no stuck or overlapping animation states)
**Plans**: 2 plans

Plans:

**Wave 1**
- [ ] 06-01-PLAN.md — TDD RED: append FEEDBACK-02 describe block (3 test cases) to App.test.tsx; tests must fail because flash class not yet applied in VentanillaCard

**Wave 2** *(blocked on Wave 1 RED confirmation)*
- [ ] 06-02-PLAN.md — TDD GREEN: add @keyframes ticket-flash + .ventanilla-ticket-flash to index.css; add key prop + conditional flash className to VentanillaCard <p> in App.tsx; visual checkpoint

**Cross-cutting constraints:**
- key prop fallback must be the string 'empty' (not null/undefined) — React silently falls back to index reconciliation on null/undefined keys
- flash class applied only when currentTicket !== null — per D-07; no animation on null transition or page load

### Phase 7: Distance-Readable & Privacy-Safe Display
**Goal**: The shared display is usable as an actual waiting-room screen — ticket numbers are legible from across a room, and the screen never exposes patient-identifying information by design
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: DISPLAY-01, PRIVACY-01
**Success Criteria** (what must be TRUE):
  1. A person standing roughly 3 meters from the screen can read the current ticket number for any ventanilla within 5 seconds
  2. Ticket numbers and queue entries use high-contrast, large typography distinct from the rest of the UI
  3. No name, identifier, or other patient-identifying data is rendered anywhere on the screen — only ticket numbers
**Plans**: TBD

Plans:
- [ ] 07-01: TBD
**UI hint**: yes

### Phase 8: Persistence Across Reloads
**Goal**: Users' queue and ventanilla state survive a full page reload, with the app recovering gracefully to a sane default state if localStorage data is missing or corrupted
**Mode:** mvp
**Depends on**: Phase 4 (final state shape stable; Phases 5-7 are independent feedback/display layers that persistence does not depend on)
**Requirements**: PERSIST-01
**Success Criteria** (what must be TRUE):
  1. User adds tickets, configures windows, and calls some tickets, then reloads the page — the queue and every ventanilla's current ticket are exactly as they were before reload
  2. If localStorage contains corrupted or malformed data, the app loads a sane default empty state instead of crashing
  3. Reloading the page with valid persisted state never triggers the call sound or transition animation (no "beep/animate on load" regression)
**Plans**: TBD

Plans:
- [ ] 08-01: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Project Scaffold & Visible Shell | 1/1 | Complete   | 2026-06-22 |
| 2. Add Ticket & View Queue | 1/1 | Complete   | 2026-07-07 |
| 3. Configurable Ventanillas | 2/2 | Complete   | 2026-07-07 |
| 4. Call Next (Atomic Dequeue) | 2/2 | Complete    | 2026-07-07 |
| 5. Call Sound Feedback | 2/2 | Complete   | 2026-07-08 |
| 6. Call Transition Animation | 0/2 | Not started | - |
| 7. Distance-Readable & Privacy-Safe Display | 0/TBD | Not started | - |
| 8. Persistence Across Reloads | 0/TBD | Not started | - |
