<!-- generated-by: gsd-doc-writer -->
# Architecture

## System Overview

Turnero is a client-only single-page application that manages a shared waiting-room ticket
queue and an arbitrary number of "ventanillas" (service windows). There is no backend and no
network layer: all state lives in memory inside a single React reducer and is persisted to
the browser's `localStorage` so it survives page reloads. The app has exactly one screen —
there is no routing. Its two primary interactions are: adding a ticket to the shared queue,
and a ventanilla calling the next ticket out of that queue (an atomic dequeue that also
triggers an audio beep and a CSS flash animation on the receiving card).

## Component Diagram

```
main.tsx
  └─ App (src/App.tsx)
       ├─ useReducer(queueReducer, initialState)   [src/turnero.ts]
       ├─ localStorage persistence (load on init, save on every state change)
       ├─ "Agregar turno" button          -> dispatch(ADD_TICKET)
       ├─ "Agregar ventanilla" button      -> dispatch(ADD_WINDOW)
       ├─ Cola (queue) list                (renders state.queue)
       └─ Ventanillas grid
            └─ VentanillaCard (per ventanilla, defined in src/App.tsx)
                 ├─ useBeep()              [src/useBeep.ts] - WebAudio beep on call
                 ├─ "Llamar siguiente"      -> dispatch(CALL_NEXT, windowId)
                 └─ "×" remove button       -> dispatch(REMOVE_WINDOW, id)
```

Data flow direction: user click → `dispatch` → `queueReducer` (pure function) → new
`QueueState` → React re-renders `App` and all `VentanillaCard` children → `useEffect`
persists the new state to `localStorage`.

## Data Flow

1. On first mount, `App` initializes its reducer state lazily via `loadFromStorage()`
   (`src/App.tsx`), which reads the `turnero-v1` key from `localStorage` and parses it as
   JSON. If the key is missing or invalid, it falls back to `initialState` from
   `src/turnero.ts`.
2. User clicks "Agregar turno" → `dispatch({ type: 'ADD_TICKET' })` → `queueReducer` appends
   a new `Ticket` (using the independent `nextNumber` counter) to `state.queue`.
3. User clicks "Agregar ventanilla" → `dispatch({ type: 'ADD_WINDOW' })` → `queueReducer`
   appends a new `Ventanilla` (using the independent `nextWindowNumber` counter, starting
   with `currentTicket: null`) to `state.ventanillas`.
4. On a `VentanillaCard`, clicking "Llamar siguiente" (`handleCallNext` in `src/App.tsx`):
   - If `queueLength === 0`, shows a local "No hay turnos en espera" warning for 2 seconds
     and does not dispatch.
   - Otherwise, calls `useBeep().play()` synchronously (required by browser autoplay policy
     for the WebAudio API), then `dispatch({ type: 'CALL_NEXT', windowId })`.
   - `queueReducer` shifts the first ticket off `state.queue` and assigns it to the matching
     ventanilla's `currentTicket`. This is the atomic dequeue: a ticket can only ever be
     assigned to one ventanilla because the shift and assignment happen together in a single
     reducer transition.
5. Clicking the "×" remove button on a `VentanillaCard` (`handleRemove`) dispatches
   `REMOVE_WINDOW`. The reducer refuses the removal (no-op) if the ventanilla currently has
   an active ticket, to prevent silently losing which ticket was being served.
6. After every dispatch, `App`'s `useEffect` (keyed on `state`) writes the full `QueueState`
   back to `localStorage` under `turnero-v1`, so a page reload restores the same queue,
   ventanillas, and counters.
7. `VentanillaCard` re-mounts its ticket `<p>` element (via a changing `key` prop tied to
   `currentTicket?.id`) whenever the current ticket changes, which retriggers the
   `ventanilla-ticket-flash` CSS animation defined in `src/index.css`.

## Key Abstractions

- **`QueueState`** (`src/turnero.ts`) — the single source of truth for the whole app: the
  shared `queue: Ticket[]`, the `ventanillas: Ventanilla[]`, and two independent
  ever-incrementing counters, `nextNumber` and `nextWindowNumber`. These counters are
  deliberately never derived from array lengths, so ticket/ventanilla numbers stay stable
  and unique even after removals.
- **`queueReducer`** (`src/turnero.ts`) — a pure reducer implementing a discriminated
  `QueueAction` union (`ADD_TICKET`, `ADD_WINDOW`, `REMOVE_WINDOW`, `CALL_NEXT`). All state
  transitions — including the atomic dequeue in `CALL_NEXT` and the data-loss guard in
  `REMOVE_WINDOW` — are centralized here rather than scattered across components.
- **`Ticket` / `Ventanilla` types** (`src/turnero.ts`) — `Ticket` has a stable `id` decoupled
  from its display `number`; `Ventanilla` similarly separates `id` (React key / dispatch
  target) from `number` (display label) and holds `currentTicket: Ticket | null`.
- **`App` component** (`src/App.tsx`) — the sole stateful component. It owns the reducer via
  `useReducer`, loads/saves `localStorage`, and renders the queue list and the ventanillas
  grid.
- **`VentanillaCard` component** (`src/App.tsx`) — one per ventanilla. Owns only local UI
  state (transient warnings for "cannot remove — has active ticket" and "queue is empty"),
  and delegates all persisted-state changes back up to `App` via `onRemove`/`onCallNext`
  callback props.
- **`useBeep` hook** (`src/useBeep.ts`) — wraps a lazily-created singleton `AudioContext` and
  exposes a `play()` function that synthesizes a short sine-wave beep via
  `OscillatorNode`/`GainNode`. Failures are swallowed silently so audio issues never block
  the call-next flow.

## Directory Structure Rationale

```
src/
  main.tsx        Entry point — mounts <App /> into #root inside <StrictMode>.
  App.tsx         The only screen: header, "Agregar turno", queue list, ventanillas grid,
                  and the VentanillaCard component (per-ventanilla card + its local UI state).
  turnero.ts      Domain model and logic: Ticket/Ventanilla/QueueState types, QueueAction
                  union, initialState, and the pure queueReducer.
  useBeep.ts      Small reusable hook: plays a WebAudio beep on demand.
  index.css       Tailwind CSS v4 entry point plus Material Design 3-inspired color tokens
                  (--color-md-*) and the ticket-flash keyframe animation.
  App.test.tsx    Component/UI tests for App and VentanillaCard (Testing Library + Vitest).
  turnero.test.ts Unit tests for queueReducer covering all four actions and edge cases.
  setupTests.ts   Vitest/Testing Library global test setup (e.g. jest-dom matchers).
public/
  favicon.svg     Static asset served as-is by Vite.
```

There is no `components/`, `hooks/`, or `lib/` subdivision because the app is intentionally a
single screen with a shallow component tree (`App` → `VentanillaCard`) — splitting further
would add indirection without benefit at this scope. State management is confined to one
reducer (`turnero.ts`) rather than spread across multiple files or an external state library,
per the project's stated constraint of no backend and minimal dependencies.
