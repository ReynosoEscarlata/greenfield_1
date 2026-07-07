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
- [ ] **Phase 3: Configurable Ventanillas** - User can add/remove windows and see each window's current-ticket state, including the empty state
- [ ] **Phase 4: Call Next (Atomic Dequeue)** - User can press "Llamar siguiente" on any window to atomically pull the next ticket from the shared queue, including the empty-queue case
- [ ] **Phase 5: Call Sound Feedback** - User hears a beep synchronously when a call action takes a ticket
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
**Plans**: TBD

Plans:
- [ ] 03-01: TBD

### Phase 4: Call Next (Atomic Dequeue)
**Goal**: Users can press "Llamar siguiente" on any ventanilla and reliably take the next ticket from the shared queue with no possibility of duplicate or skipped tickets across simultaneous clicks, completing the Core Value end-to-end
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: CALL-01, CALL-02
**Success Criteria** (what must be TRUE):
  1. User presses "Llamar siguiente" on a ventanilla and that ventanilla's current ticket updates to the head of the queue, which is simultaneously removed from the visible queue
  2. Rapidly pressing "Llamar siguiente" on two different ventanillas never assigns the same ticket to both
  3. If the queue is empty when "Llamar siguiente" is pressed, the user sees a message stating there are no waiting tickets, and the button remains usable afterward
**Plans**: TBD

Plans:
- [ ] 04-01: TBD

### Phase 5: Call Sound Feedback
**Goal**: Users hear an audible beep at the exact moment a ventanilla successfully calls a ticket, reinforcing the call event without affecting page-load or reload behavior
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: FEEDBACK-01
**Success Criteria** (what must be TRUE):
  1. User hears a beep immediately when pressing "Llamar siguiente" and a ticket is successfully taken
  2. No beep plays on page load or on reload, even though the same state change (current ticket being set) occurs during hydration
  3. No beep plays when "Llamar siguiente" is pressed on an empty queue (no ticket taken)
**Plans**: TBD

Plans:
- [ ] 05-01: TBD

### Phase 6: Call Transition Animation
**Goal**: Users see a visible, brief transition animation whenever a ventanilla's current ticket changes, giving clear visual confirmation of which window just changed
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: FEEDBACK-02
**Success Criteria** (what must be TRUE):
  1. User sees a transition animation on a ventanilla's display the moment its current ticket changes after a successful call
  2. The animation is scoped to the ventanilla that changed, not the whole page
  3. The animation does not interfere with rapid sequential calls (no stuck or overlapping animation states)
**Plans**: TBD

Plans:
- [ ] 06-01: TBD

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
| 3. Configurable Ventanillas | 0/TBD | Not started | - |
| 4. Call Next (Atomic Dequeue) | 0/TBD | Not started | - |
| 5. Call Sound Feedback | 0/TBD | Not started | - |
| 6. Call Transition Animation | 0/TBD | Not started | - |
| 7. Distance-Readable & Privacy-Safe Display | 0/TBD | Not started | - |
| 8. Persistence Across Reloads | 0/TBD | Not started | - |
