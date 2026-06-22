# Architecture Research

**Domain:** Client-only React+TS+Vite single-page queue/ticket display ("turnero")
**Researched:** 2026-06-21
**Confidence:** HIGH (standard React patterns, verified against multiple sources, no novel domain risk)

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                              UI Layer                               │
├───────────────────────────────────────────────────────────────────-┤
│ ┌───────────────┐ ┌───────────────────┐ ┌──────────────────────┐  │
│ │ AddTicketButton│ │ QueueList (next   │ │ VentanillaPanel × N  │  │
│ │ "Agregar turno"│ │  turns, in order)  │ │ (current ticket +    │  │
│ │                │ │                    │ │  "Llamar siguiente") │  │
│ └───────┬────────┘ └────────┬───────────┘ └──────────┬───────────┘  │
│         │                   │                          │            │
│ ┌───────┴────────┐          │              ┌───────────┴─────────┐ │
│ │ VentanillaConfig│          │              │ CallTransitionFX +  │ │
│ │ (add/remove     │          │              │ Sound (per call)    │ │
│ │  windows)       │          │              └──────────────────--─┘ │
│ └────────────────┘          │                                      │
├──────────────────────────────┴──────────────────────────────────────┤
│                          App / Container                            │
│           (owns dispatch, wires actions to handlers)                 │
├───────────────────────────────────────────────────────────────────-─┤
│                       State Layer (single reducer)                  │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  turneroReducer(state, action) → AppState                   │   │
│  │  state = { queue: Ticket[], nextNumber: number,              │   │
│  │            ventanillas: Ventanilla[] }                       │   │
│  └─────────────────────────────────────────────────────────────┘   │
├───────────────────────────────────────────────────────────────────-┤
│                       Persistence Layer                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  useLocalStorageState / lazy init + useEffect sync           │   │
│  │  key: "turnero:v1" → JSON.stringify(state)                   │   │
│  └─────────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────-┘
```

This is intentionally a **single-tier client app**: one state container, one persistence adapter, and a tree of presentational/interactive components below it. There is no service layer, no API layer, and no routing layer — all of which would be over-engineering for this scope per PROJECT.md (single page, no backend, no auth).

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `App` | Owns the single state instance (via custom hook), wires action dispatchers to children, renders layout | Function component, calls `useTurneroState()` once at the top |
| `useTurneroState` (custom hook) | Wraps `useReducer` + localStorage load/save; is the **only** place that touches `localStorage` | Custom hook returning `[state, dispatch]` or named action callbacks |
| `turneroReducer` | Pure function encoding all queue/ventanilla business rules (add ticket, call next, add/remove ventanilla) | Plain `.ts` file, fully unit-testable without React |
| `QueueList` | Renders the shared waiting queue (next tickets in order) | Presentational, receives `queue: Ticket[]` as props, no logic |
| `AddTicketButton` | Triggers `ADD_TICKET` action | Dumb button, calls `onAddTicket()` prop |
| `VentanillaPanel` | Renders one window's current ticket + "Llamar siguiente" button; triggers `CALL_NEXT` for its own id | Receives `ventanilla` object + `onCallNext(id)` callback; owns local animation state only |
| `VentanillaConfig` | Add/remove ventanillas dynamically | Calls `ADD_VENTANILLA` / `REMOVE_VENTANILLA` actions |
| Sound/animation utilities | Side-effects triggered by state *changes*, not state itself | `useEffect` on `ventanilla.currentTicket` change → play beep + apply CSS transition class |

## Recommended Project Structure

```
src/
├── state/
│   ├── types.ts            # Ticket, Ventanilla, AppState, Action union types
│   ├── turneroReducer.ts   # Pure reducer: ADD_TICKET, CALL_NEXT, ADD_VENTANILLA, REMOVE_VENTANILLA
│   ├── turneroReducer.test.ts
│   └── useTurneroState.ts  # useReducer + localStorage load (lazy init) + save (useEffect)
├── persistence/
│   └── localStorage.ts     # loadState(), saveState() — JSON parse/stringify, versioned key, try/catch
├── components/
│   ├── App.tsx              # Composition root, owns useTurneroState()
│   ├── AddTicketButton.tsx
│   ├── QueueList.tsx
│   ├── VentanillaPanel.tsx
│   ├── VentanillaConfig.tsx
│   └── CallTransition.tsx   # Wraps current-ticket display, applies enter/exit animation class
├── effects/
│   └── useCallSound.ts      # Custom hook: plays beep when a watched value changes
├── styles/
│   └── *.css (or CSS modules)
└── main.tsx                 # Vite entry point
```

### Structure Rationale

- **`state/`** is isolated from React rendering concerns — the reducer and types can be unit-tested with plain Vitest/Jest, no DOM, no rendering. This is the most valuable testing surface in the whole app (queue correctness is the Core Value).
- **`persistence/`** is a thin adapter so localStorage specifics (key naming, versioning, parse failure handling) don't leak into the reducer or components. Swappable later if persistence strategy changes.
- **`components/`** are kept "dumb" wherever possible — they receive data and callbacks as props, no component reaches into localStorage or owns business state directly (except transient UI-only state like "is this ticket mid-animation").
- **`effects/`** isolates the two pieces of polish (sound, animation triggers) that are explicitly *not* core logic per PROJECT.md ("mejora la experiencia... sin agregar complejidad") — keeping them separable means they can be built/tested last without touching the reducer.
- No `services/`, `api/`, `routes/`, or `hooks/contexts/` folder — there is no backend, no routing, and (per the data-flow analysis below) no real need for Context API given the shallow single-page tree.

## Architectural Patterns

### Pattern 1: Single Reducer as Source of Truth (lifted state, no Context)

**What:** One `useReducer` call in `App`, state and dispatch passed down as props (or destructured callbacks) to children. No Context Provider.

**When to use:** When the component tree is shallow (here: App → a handful of direct children, at most 2 levels deep) and state doesn't need to skip more than one or two levels. This app's tree is: App → {AddTicketButton, QueueList, VentanillaConfig, VentanillaPanel×N}. All children are direct children of App.

**Trade-offs:** Avoids the boilerplate and indirection of Context for an app this small. If a future milestone adds deeper nesting (e.g., a VentanillaPanel that itself has nested sub-components needing dispatch), promote to Context at that point — don't pre-build it now. This matches GSD's "don't expand scope" guidance in PROJECT.md.

**Example:**
```typescript
// App.tsx
function App() {
  const { state, addTicket, callNext, addVentanilla, removeVentanilla } = useTurneroState();

  return (
    <>
      <AddTicketButton onAdd={addTicket} />
      <QueueList queue={state.queue} />
      <VentanillaConfig
        ventanillas={state.ventanillas}
        onAdd={addVentanilla}
        onRemove={removeVentanilla}
      />
      {state.ventanillas.map(v => (
        <VentanillaPanel key={v.id} ventanilla={v} onCallNext={() => callNext(v.id)} />
      ))}
    </>
  );
}
```

### Pattern 2: Reducer + Lazy-Init localStorage Hydration + useEffect Persistence

**What:** `useReducer(reducer, undefined, initFromLocalStorage)` for hydration on mount (runs once, before first render commits), paired with a `useEffect` that re-serializes and writes to localStorage whenever state changes.

**When to use:** Any client-only app needing "survive a refresh" persistence without a backend. This is the standard, most-cited pattern for `useReducer` + localStorage (see Sources).

**Trade-offs:** `useEffect`-based saving means a write happens on every state change (fine at this scale — a handful of tickets/windows, no perf concern). Lazy init (third arg to `useReducer`) avoids reading localStorage on every render, only on mount. Must wrap `JSON.parse`/`localStorage.getItem` in try/catch — corrupted or missing data should fall back to a sane default empty state rather than crashing the app.

**Example:**
```typescript
// useTurneroState.ts
const STORAGE_KEY = "turnero:v1";

function init(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultState;
  } catch {
    return defaultState;
  }
}

export function useTurneroState() {
  const [state, dispatch] = useReducer(turneroReducer, undefined, init);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return {
    state,
    addTicket: () => dispatch({ type: "ADD_TICKET" }),
    callNext: (ventanillaId: string) => dispatch({ type: "CALL_NEXT", ventanillaId }),
    addVentanilla: () => dispatch({ type: "ADD_VENTANILLA" }),
    removeVentanilla: (id: string) => dispatch({ type: "REMOVE_VENTANILLA", id }),
  };
}
```

### Pattern 3: Side-Effects-on-Change for Polish (sound + animation), Decoupled from Core Reducer

**What:** Sound and transition animation are triggered by *watching* a value (e.g., `ventanilla.currentTicket.id`) in a `useEffect`/CSS-transition, not by encoding "play sound" as part of the reducer's job.

**When to use:** Always, for this kind of "nice-to-have feedback" requirement. The reducer should remain a pure function (no `Audio()` calls, no DOM access) so it stays unit-testable and so undo/replay/persistence logic never has unwanted side effects (e.g., reloading from localStorage on refresh should NOT replay a beep).

**Trade-offs:** Slight indirection (effect watches a derived value rather than reacting to the action directly), but this is exactly what keeps the reducer pure and testable, and prevents the classic bug of "sound plays again on page reload because state changed."

```typescript
// VentanillaPanel.tsx
function VentanillaPanel({ ventanilla, onCallNext }: Props) {
  const prevTicketId = usePrevious(ventanilla.currentTicket?.id);

  useEffect(() => {
    if (ventanilla.currentTicket?.id !== prevTicketId && prevTicketId !== undefined) {
      playBeep();
    }
  }, [ventanilla.currentTicket?.id]);

  return (
    <div className={hasJustChanged ? "ticket-transition" : ""}>
      {/* current ticket display */}
    </div>
  );
}
```

Note: on initial mount (hydrating from localStorage), `prevTicketId` is `undefined`, which intentionally suppresses the beep — avoids "beep on page load."

## Data Flow

### Action Flow (e.g., "Llamar siguiente")

```
User clicks "Llamar siguiente" on VentanillaPanel(id=2)
    ↓
onCallNext(2) prop callback
    ↓
dispatch({ type: "CALL_NEXT", ventanillaId: 2 })
    ↓
turneroReducer(state, action):
  - takes head of state.queue
  - sets ventanillas[2].currentTicket = head
  - removes head from state.queue
  - returns new AppState
    ↓
React re-renders with new state
    ↓
useEffect([state]) → localStorage.setItem(...)
useEffect([ventanilla.currentTicket]) in VentanillaPanel(2) → beep + animation class
```

### State Management

```
useTurneroState (custom hook, called once in App)
    ↓ lazy init reads
localStorage ──────────────► AppState (hydrated)
    ↓
useReducer(turneroReducer, AppState)
    ↓ (state, dispatch passed as props/callbacks)
App ──► AddTicketButton / QueueList / VentanillaConfig / VentanillaPanel[]
    ↑ (onClick → dispatch)
    └── user interactions flow back up via callback props
```

### Key Data Flows

1. **Add ticket:** Button click → `ADD_TICKET` action → reducer appends `{ id: nextNumber, createdAt }` to `queue`, increments `nextNumber` → re-render shows new ticket in `QueueList`.
2. **Call next (per window):** Button click on a specific `VentanillaPanel` → `CALL_NEXT` action with that window's id → reducer pops queue head into that window's `currentTicket` → both `QueueList` (one shorter) and that `VentanillaPanel` (new current ticket) re-render → sound/animation effect fires off the ticket-id change.
3. **Configure windows:** `ADD_VENTANILLA`/`REMOVE_VENTANILLA` actions mutate the `ventanillas` array; removing a window with a `currentTicket` does **not** return that ticket to the queue per current scope (decide explicitly in reducer — likely just drops it, since "out of scope: returning called tickets" isn't mentioned, flag for roadmap clarification).
4. **Persistence round-trip:** Every dispatch → state change → `useEffect` write to localStorage. On reload: lazy `init()` reads back, reducer/components are unaware persistence ever happened — they just see a hydrated initial state.

## Scaling Considerations

This app's realistic scale ceiling is tiny — single browser tab, single physical waiting room, at most dozens of tickets and a handful of windows. "Scaling" here means robustness, not throughput.

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Normal use (1 clinic, few windows, queue of tens of tickets) | Current architecture (single reducer, localStorage) is sufficient indefinitely — no changes needed |
| Queue grows very large (hundreds of tickets accumulated over a long day without reset) | Still fine algorithmically (array shift is O(n) but n stays small); consider a "reset/clear queue" action for end-of-day if not already planned |
| Multiple tabs/devices wanting to see the same queue | Out of scope per PROJECT.md ("no hay sincronización entre dispositivos"); if revisited later, the clean extension point is a `storage` event listener (cross-tab sync within same browser) — not multi-device, which would require a backend |

### Scaling Priorities

1. **Not a real bottleneck, but a real risk:** localStorage quota/corruption or `JSON.parse` failure on malformed data — mitigate with try/catch + fallback to default state (see Pattern 2). This is the most likely real-world failure mode for this app, not performance.
2. **Second-order concern:** if "call next" needs to be undoable (operator error: called wrong ticket), that's a feature decision, not an architecture one — but the reducer's pure, action-based design makes adding an `UNDO_CALL` action straightforward later without restructuring.

## Anti-Patterns

### Anti-Pattern 1: Scattering ticket/queue logic across components with multiple `useState` calls

**What people do:** Each `VentanillaPanel` keeps its own `useState` for "current ticket," and the queue lives in a separate `useState` in `App`, with handler functions threading updates between them ad hoc.

**Why it's wrong:** The Core Value of this app ("la pantalla refleje correctamente, en todo momento, cuál es el turno actual de cada ventanilla") is precisely a data-consistency guarantee across the shared queue and N windows. Splitting this into independent `useState` slices makes it easy to update one without the other (e.g., remove from queue but forget to set window's current ticket), and untestable without rendering the full tree.
**Do this instead:** One reducer, one `AppState` shape containing both `queue` and `ventanillas`, so each action is a single atomic transition — "call next" either fully succeeds (ticket moves from queue to window) or doesn't happen at all (queue empty).

### Anti-Pattern 2: Reaching for Context API, Redux, or Zustand prematurely

**What people do:** Add a state management library or Context Provider "to be safe" before the app's component tree justifies it.

**Why it's wrong:** Per PROJECT.md, the explicit purpose of this project is to practice the GSD lifecycle on a small, scoped exercise. A single-page app with a shallow, known component tree (App + direct children) does not need prop-drilling mitigation — there's nothing to drill more than one level. Adding Redux/Zustand/Context here is pure ceremony with no payoff, and adds surface area to test and reason about.
**Do this instead:** Lifted `useReducer` state in `App`, passed via props/callbacks (Pattern 1). Revisit only if a future milestone genuinely adds tree depth that causes painful prop drilling.

### Anti-Pattern 3: Coupling sound/animation side effects into the reducer

**What people do:** Call `new Audio().play()` or trigger DOM/animation logic directly inside the reducer's `CALL_NEXT` case "since that's where the call happens."

**Why it's wrong:** Reducers must be pure functions (no side effects, no DOM/Audio API calls) for React's rendering model to behave predictably (e.g., React 18 Strict Mode double-invokes reducers in dev, which would double-beep). It also makes the reducer untestable without mocking browser APIs, and causes the bug where rehydrating from localStorage on page load "replays" a beep because the reducer ran again.
**Do this instead:** Keep the reducer pure; trigger sound/animation from a `useEffect` that watches the *result* of state changes in the component layer (Pattern 3), explicitly skipping the effect on initial mount/hydration.

## Integration Points

### External Services

None. This app has zero external service integrations by design (no backend, no auth, no APIs) per PROJECT.md's "Out of Scope" section.

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Browser `localStorage` (Web Storage API) | Direct read/write via `persistence/localStorage.ts` adapter | Synchronous API; wrap in try/catch for quota-exceeded or disabled-storage (private browsing) edge cases |
| Browser `Audio`/Web Audio API (for beep) | `new Audio(src).play()` or a short synthesized tone via `AudioContext` | Browsers often block autoplay of audio without a prior user gesture — but since the sound is triggered by a user's own button click ("Llamar siguiente"), this satisfies the user-gesture requirement and should not be blocked |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `App` ↔ `useTurneroState` | Direct hook call, returns `{ state, action callbacks }` | App is the only consumer of this hook — keeps state ownership singular |
| `useTurneroState` ↔ `turneroReducer` | Direct function reference passed to `useReducer` | Reducer has zero React or browser API dependencies — pure `(state, action) => state` |
| `useTurneroState` ↔ `persistence/localStorage.ts` | Function calls (`loadState()`, `saveState()`) inside the hook | Only this hook touches localStorage; components and reducer never do |
| `App` ↔ presentational components | Props down (`state` slices), callbacks down (`onAddTicket`, `onCallNext`) | One-directional; no component reaches "sideways" into another component's state |
| `VentanillaPanel` ↔ sound/animation effects | `useEffect` inside the component watching its own `ventanilla.currentTicket` prop | Effect is local to each panel — each window's beep/animation fires independently of others |

## Sources

- [Sync to localStorage with React useReducer Hook — Ben Ilegbodu](https://www.benmvp.com/blog/sync-localstorage-react-usereducer-hook/) — MEDIUM/HIGH confidence, detailed walkthrough of lazy-init + useEffect persistence pattern, matches recommendation in Pattern 2
- [Persisting useReducer with a custom React Hook — DEV Community](https://dev.to/sgolovine/persisting-usereducer-with-a-custom-react-hook-1j27) — MEDIUM confidence, corroborates custom-hook wrapping approach
- [State persistence in React with TypeScript and useStickyReducer](https://adueck.github.io/blog/persisting-state-in-react-with-typescript-and-use-reducer/) — MEDIUM confidence, TypeScript-specific variant of the same pattern
- [A guide to the React useReducer Hook — LogRocket Blog](https://blog.logrocket.com/react-usereducer-hook-ultimate-guide/) — MEDIUM confidence, general useReducer best practices (pure reducer, action types)
- [React official docs: useReducer](https://react.dev/reference/react/useReducer) — HIGH confidence (official), basis for lazy-init and pure-function guidance — verify current API signature before implementation
- General React community consensus (multiple corroborating Medium/DEV.to articles, see WebSearch results) on Context+useReducer being appropriate only at moderate complexity, not for small shallow trees — MEDIUM confidence, used to justify Anti-Pattern 2's "skip Context" recommendation

---
*Architecture research for: client-only React+TS+Vite queue/ticket display app*
*Researched: 2026-06-21*
