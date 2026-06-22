# Pitfalls Research

**Domain:** Client-only React+TS+Vite waiting-room queue/ticket display ("turnero") with localStorage persistence, shared mutable queue, multiple "ventanilla" call buttons, audio + animation feedback
**Researched:** 2026-06-21
**Confidence:** HIGH (browser storage/audio APIs verified via MDN/Chrome docs; React state pitfalls verified via React docs + multiple corroborating sources)

## Critical Pitfalls

### Pitfall 1: Concurrent "Llamar siguiente" clicks corrupt the shared queue (lost update / duplicate ticket)

**What goes wrong:**
Two ventanillas click "Llamar siguiente" in quick succession (or the same ventanilla is double-clicked). If "take next ticket" is implemented as two separate steps — read current queue state, then write queue minus the popped ticket — both clicks can read the *same* "next ticket" before either write lands. Result: two ventanillas end up showing the same ticket number, or the queue array gets shortened twice and silently drops a real ticket.

**Why it happens:**
React state updates are asynchronous and batched. A naive implementation does:
```js
const next = queue[0];
setCurrentTicket(windowId, next);
setQueue(queue.slice(1));
```
If `queue` is a stale closure value (captured at render time, not the latest state), a second click handler firing before re-render commits sees the same stale `queue[0]`. This is a textbook "stale closure + non-atomic read-then-write" bug, made worse here because there is no backend to serialize the operation — the only serialization available is React's own render/commit cycle.

**How to avoid:**
- Always use the **functional updater form** of `setState` (`setQueue(prev => prev.slice(1))`) or, better, model the whole queue+ventanillas as one object updated via `useReducer` with a single `CALL_NEXT` action. A reducer guarantees the "read current state, compute next state" step is atomic with respect to React's own dispatch queue — two rapid dispatches are processed sequentially against the latest state, not against a stale snapshot.
- Treat "pop ticket from queue" and "assign ticket to ventanilla" as **one atomic action/reducer case**, never two separate `setState` calls that can interleave.
- Disable (or debounce) the "Llamar siguiente" button for the ventanilla that just clicked until the state update has committed, to prevent literal double-clicks from firing two dispatches for the same intent.
- Add a guard: if the queue is empty, the action is a no-op (don't let two clicks both succeed if only one ticket remains).

**Warning signs:**
- Same ticket number ever appears on two ventanillas simultaneously.
- Queue length decreases by more than 1 per click in manual testing.
- Bug only reproduces with fast double-clicks or two browser windows clicking near-simultaneously — intermittent, hard to catch in casual testing.

**Phase to address:**
Core queue logic / state management phase (the phase that implements the reducer and "Llamar siguiente" action), before persistence or audio/animation are layered on. Write the reducer and unit-test the "two near-simultaneous CALL_NEXT" case explicitly.

---

### Pitfall 2: Treating multiple ventanillas as "multiple browser tabs/windows" instead of "components sharing one in-page state tree"

**What goes wrong:**
The word "ventanilla" and the phrase "race conditions across windows" naturally suggest this needs cross-tab synchronization (storage events, BroadcastChannel). But PROJECT.md explicitly scopes this as **one single page/view** — all ventanillas render as components within the same React tree, in the same browser tab. Building cross-tab sync machinery (storage event listeners, BroadcastChannel) for a problem that doesn't exist in this app's actual scope is wasted complexity and risks introducing real bugs (e.g., listening to your own `storage` writes, which don't fire in the writing tab anyway — verified via MDN).

**Why it happens:**
"Race condition between ventanillas" sounds like a distributed-systems problem, pattern-matching to multi-tab solutions devs have read about. The actual race is purely a same-tab, same-render-tree concurrency issue (Pitfall 1), solvable entirely with `useReducer`/functional updates — no cross-tab machinery needed.

**How to avoid:**
- Re-confirm scope before implementation: single page, single React tree, all ventanillas are sibling components reading/dispatching against one shared state object (via Context + reducer, or prop-drilled state from a single parent).
- Do NOT implement `window.addEventListener('storage', ...)` syncing — it's out of scope per PROJECT.md ("no hay sincronización entre dispositivos / pestañas") and adds real complexity (handling stale writes, JSON parse races, event ordering) for zero user-facing benefit.
- If a second tab is opened on the same machine, accept that it will show stale data until manually refreshed — this is acceptable and explicitly out of scope, not a bug to fix.

**Warning signs:**
- Any code referencing `window.addEventListener('storage', ...)` or `BroadcastChannel` appearing in the plan — flag for scope review immediately.
- Roadmap phase descriptions mentioning "sync between windows" — likely scope creep, not a real requirement.

**Phase to address:**
Roadmap/planning phase — catch this at requirement-interpretation time, before any phase is scoped to build it.

---

### Pitfall 3: localStorage read/write without versioning or corruption handling breaks on first schema change

**What goes wrong:**
The straightforward `JSON.parse(localStorage.getItem('turnero'))` on app load works fine until: (a) the user has old data from a previous dev iteration with a different shape (e.g., you later add a `ventanillaName` field or change `queue` from array-of-numbers to array-of-objects), or (b) `localStorage.getItem` returns `null` (first visit, or storage was cleared) and `JSON.parse(null)` returns the literal value `null`, which then gets destructured and throws. Either case crashes the app on load with a white screen, and the user's only recovery is to manually clear localStorage via devtools — unacceptable for a clinic-facing display.

**Why it happens:**
It's tempting to ship the simplest possible persistence (`JSON.parse(localStorage.getItem(key))` straight into `useState` initializer) since the app is small and "I control the shape." But the shape *will* change during the GSD execution phases (e.g., adding window count, ticket prefix, or timestamps later), and there's no migration path unless one is designed up front.

**How to avoid:**
- Wrap every `localStorage` read in try/catch; on any parse failure or shape mismatch, fall back to a known-good default state rather than crashing.
- Store a `schemaVersion` field in the persisted object from day one (even if it's just `1`). On load, check the version; if it doesn't match the current version, either migrate or reset to defaults — never trust an unversioned blob.
- Validate the parsed shape minimally (e.g., `Array.isArray(data.queue)` and `Array.isArray(data.ventanillas)`) before trusting it — don't assume `JSON.parse` succeeding means the shape is correct.
- Centralize all reads/writes through one small persistence module (`loadState()` / `saveState()`) rather than scattering `localStorage.getItem/setItem` calls through components — makes the validation/versioning logic a single chokepoint.

**Warning signs:**
- App previously worked, then started showing a blank screen after a code change that altered state shape — classic symptom of unversioned persisted data colliding with new code.
- No try/catch anywhere around `JSON.parse(localStorage...)`.

**Phase to address:**
Persistence phase (the phase implementing localStorage save/load) — bake versioning and defensive parsing in from the first commit of this phase, not retrofitted later.

---

### Pitfall 4: localStorage write-on-every-render causes either stale persisted state or excessive writes, and read-back during hydration causes a flash of empty/default state

**What goes wrong:**
Two related issues: (1) If persistence is wired via a `useEffect` that writes on every state change but the dependency array is wrong (missing deps, or writing inside the same effect that reads), the persisted copy can lag one update behind the in-memory state — so a refresh shows a queue state one action older than what was on screen. (2) On initial mount, if state starts as an empty default and localStorage is read asynchronously or in a second effect, the UI flashes "cola vacía / sin ventanillas" for a frame before the real persisted state loads in — visible flicker on every page load, which looks broken on a clinic display that's reloaded periodically.

**Why it happens:**
Easiest implementation pattern is `useState(initialDefault)` + a separate `useEffect(() => { load from localStorage }, [])` that calls `setState` after mount. This is always one render behind: first render shows defaults, second render (after the effect runs) shows real data.

**How to avoid:**
- Initialize state synchronously from localStorage in the `useState` initializer function itself (`useState(() => loadState())`), not in a `useEffect`. This reads from storage before the first paint, eliminating the flash.
- Persist via a `useEffect` keyed on the actual state value (`useEffect(() => saveState(state), [state])`), so every committed state change is written — and only after commit, not speculatively before.
- Avoid writing to localStorage on every keystroke-level change if any text input is ever added (not currently in scope, but worth noting) — debounce if that ever happens. For this app's scope (button clicks only), writing on every state change is fine; the action frequency is low (manual clicks), so no debouncing is needed.

**Warning signs:**
- Visible flash of "no tickets" / default UI on page load before real data appears.
- Refreshing right after clicking "Llamar siguiente" sometimes loses that last action.

**Phase to address:**
Persistence phase — specifically the hydration/initialization step. Verify by hard-refreshing immediately after every action type (add ticket, call next, add/remove ventanilla) during manual testing.

---

### Pitfall 5: Audio playback silently fails because of browser autoplay/user-gesture policies

**What goes wrong:**
The "beep" sound is played by calling `.play()` on an `<audio>` element or via the Web Audio API when a ticket is called. If this call happens in a context the browser doesn't recognize as tied to a direct user gesture (e.g., triggered inside a `setTimeout`, inside a `.then()` chain after an async operation, or — critically — on initial automatic actions before any click has happened on the page), the browser blocks playback and `play()` returns a rejected Promise. If that rejection isn't handled, it can throw an unhandled promise rejection in the console (cosmetic, but looks broken) and the user simply never hears the beep, with no visible error in the UI. Verified via MDN/Chrome for Developers: "Playback of any media that includes audio is generally blocked if the playback is programmatically initiated in a tab which has not yet had any user interaction," and `play()`'s returned Promise rejects with a `DOMException` when blocked.

**Why it happens:**
"Llamar siguiente" IS a direct click handler, so in the common case the gesture requirement is satisfied — but it's easy to break this by, for example, calling `.play()` from inside a `useEffect` that reacts to state change (the effect runs *after* the click, asynchronously, and browsers are inconsistent about treating effect-triggered calls as still "from" the original gesture) rather than directly in the onClick handler. It's also broken if the page is reloaded and an effect tries to "catch up" and replay a sound for state that changed via persistence load (not a real user click) — there's no gesture at all in that case.

**How to avoid:**
- Call `audio.play()` (or `audioContext.resume()` + play) **synchronously inside the button's onClick handler**, not inside a `useEffect` that merely reacts to the resulting state change. This keeps it unambiguously tied to the user gesture.
- Never auto-play a sound on page load/hydration (e.g., don't replay the "last call" beep when restoring from localStorage) — there's no user gesture at that point and it will be silently blocked anyway; it would also be a poor UX surprise.
- Always `.catch()` the Promise returned by `.play()` and fail silently (or log) rather than letting it surface as an unhandled rejection.
- Pre-create/prime the `Audio` object once (not a new `new Audio()` on every call) to avoid load-time delays that make the beep feel laggy.
- Provide a visible feedback (the animation) as the primary signal and treat audio as enhancement — if sound is blocked for any reason (autoplay policy, muted tab, no speakers), the app must still be fully usable from the animation/visual state alone.

**Warning signs:**
- Beep works when manually testing single clicks but silently stops working in scenarios involving async chains, multiple rapid calls, or after a page reload.
- Console shows `DOMException: play() failed because the user didn't interact with the document first` or unhandled promise rejection warnings.

**Phase to address:**
Audio/feedback phase (the phase implementing the beep on "Llamar siguiente"). Verify by testing: fresh page load (no prior interaction) → click "Llamar siguiente" as the very first interaction → beep must play (this is the gesture-satisfying case) — and separately verify reloading the page never auto-plays a beep on its own.

---

### Pitfall 6: Animation doesn't trigger (or double-triggers/flickers) when the "current ticket" value changes

**What goes wrong:**
Two opposite failure modes are both common: (1) The transition animation is implemented as a CSS class tied to a value, but when the *same* ticket number is set again (e.g., calling next when queue is empty leaves the ticket unchanged, or a no-op dispatch still triggers a re-render), React doesn't see a "change" worth animating, or conversely the animation re-triggers spuriously on unrelated re-renders (e.g., parent re-renders for a different ventanilla's update, and a CSS animation keyed only to mount/unmount restarts even though the ticket value didn't change for that specific ventanilla). (2) Using `key={ticketNumber}` to force remount-based animations is correct for triggering enter animations on each new value — but if `ticketNumber` can repeat (e.g., queue wraps or resets), React sees the same key and won't remount/re-animate, even though conceptually this is a "new call" the user expects feedback for.

**Why it happens:**
React's reconciliation is value/key based, not "did a user action happen" based. Visual transition libraries (CSS transitions, `react-transition-group`) need an explicit trigger (key change, or `in` prop flip) that's decoupled from the raw data value, because the raw data value alone doesn't capture "this was just freshly assigned" semantics — especially relevant here since ticket numbers are monotonically increasing in normal operation but the *visual event* that matters is "ventanilla X's current ticket was just updated," which can be the same numeric value in edge cases (e.g., re-render with same state due to an unrelated sibling action).

**How to avoid:**
- Track a separate "last call timestamp" or monotonically incrementing "call sequence id" per ventanilla in state (not derived from the ticket number itself), and use *that* as the animation trigger/key. This guarantees the animation fires once per actual "Llamar siguiente" action, decoupled from whether the displayed ticket number happens to repeat.
- Keep each ventanilla's animation state scoped to that ventanilla's own component (don't let a shared/global re-render cause all ventanillas to re-animate when only one changed) — use `React.memo` on the ventanilla component keyed by its own props, or ensure the reducer/context selector pattern only re-renders the ventanilla whose ticket actually changed.
- Match CSS transition `timeout`/duration values exactly to the actual animation CSS duration if using a library like `react-transition-group` — mismatched timeouts are a well-documented cause of visible flicker (component removed from DOM before the CSS transition visually finishes, or left lingering after).
- Test the empty-queue edge case explicitly: clicking "Llamar siguiente" with no tickets left should produce a clear "no hay turnos" state change (and ideally its own subtle feedback), not silently do nothing or animate a stale ticket again.

**Warning signs:**
- Animation doesn't play on the very first call to a ventanilla (no previous value to "transition from").
- Animation plays on ventanilla A when only ventanilla B was updated (over-broad re-render scope).
- Visual flash/jump where the old ticket number flickers back briefly before settling — duration mismatch between JS timeout and CSS duration.

**Phase to address:**
Animation/UI polish phase. Verify by manually clicking every ventanilla's "Llamar siguiente" in sequence, including clicking the same ventanilla twice in a row and clicking with an empty queue, confirming animation plays exactly once per actual action and is scoped to the correct ventanilla.

---

### Pitfall 7: Scope creep undermines the actual goal (finishing the GSD lifecycle end-to-end)

**What goes wrong:**
PROJECT.md is explicit: the real goal is practicing the full GSD lifecycle, and the app is deliberately small. The most likely failure mode for *this specific project* is not a technical bug — it's scope expansion during planning or execution: adding "just one more feature" (multi-tab sync, ticket priority levels, sound customization, themes, undo, ventanilla-specific queues "for realism," analytics, printable tickets, etc.) that feels small in isolation but compounds into a project that never reaches "done," defeating the stated purpose.

**Why it happens:**
Each individual addition seems reasonable and "almost free" once the core app exists, and natural domain thinking (a real clinic turnero) keeps suggesting realistic features that were explicitly excluded (auth, per-ventanilla queues, multi-device sync). Without a strong anchor back to PROJECT.md's "Out of Scope" list, these creep in one at a time during seemingly unrelated phases (e.g., "while I'm in the ventanilla component, let me also add a name field").

**How to avoid:**
- Treat PROJECT.md's "Out of Scope" section as a hard boundary during roadmap creation and execution — any new idea that matches or resembles an out-of-scope item gets explicitly rejected and logged, not quietly absorbed.
- Roadmap should have a small, fixed number of phases mapped directly to the "Active" requirements list already in PROJECT.md (queue, add ticket, ventanillas, call next, persistence, sound, animation) — resist adding phases for anything not on that list.
- When in doubt during execution, the test is: "Does this serve finishing the GSD lifecycle end-to-end, or does it serve making the demo app more realistic?" Only the former is the actual goal.

**Warning signs:**
- Roadmap phase count growing beyond ~5-7 phases for a project this size.
- Any phase description introducing a noun not present in PROJECT.md's Active requirements (e.g., "operator login," "ticket categories," "print receipt").
- Time spent polishing audio/animation beyond "clearly works and looks intentional" — diminishing returns territory for a practice exercise.

**Phase to address:**
Roadmap creation (immediately after this research) — the roadmap itself is the primary defense. Re-check at every phase transition per PROJECT.md's own "Evolution" process.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Storing queue/ventanillas as separate `useState` calls instead of one reducer | Faster to start coding | Re-introduces the read-then-write race from Pitfall 1; harder to keep atomic | Never for this app — use `useReducer` from the start given the explicit shared-queue race concern |
| Skipping `schemaVersion` field because "I know the shape won't change" | Slightly less code on day one | Breaks ungracefully the moment any field is added/renamed later in the same milestone | Only acceptable if the project is truly throwaway and will never be touched again — not the case here, since GSD execution happens over multiple phases |
| Using `new Audio()` + `.play()` inline without preloading | Zero setup | Slight delay/lag on first beep, repeated object allocation | Acceptable for this app's scale (low click frequency) — not worth optimizing further |
| Hardcoding 2-3 ventanillas instead of building the dynamic add/remove UI early | Faster initial demo | Requirements explicitly call for dynamic ventanilla count — deferring this is deferring a stated requirement, not a real shortcut | Never — it's in the Active requirements list, build it directly |

## Integration Gotchas

This app has no external service integrations (explicitly no backend, no auth, no APIs) — the only "integration" surface is browser platform APIs.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|-------------------|
| Web Storage API (localStorage) | Assuming `getItem` always returns valid JSON or non-null | Always validate + try/catch + versioned fallback (Pitfall 3) |
| `<audio>` / Web Audio API | Calling `.play()` outside a direct gesture handler or on hydration | Trigger only inside the click handler itself; never auto-play on load (Pitfall 5) |
| `storage` event (cross-tab) | Implementing it because "ventanillas" sounds multi-window | Not needed — explicitly out of scope per PROJECT.md (Pitfall 2) |

## Performance Traps

Given the explicit small scope (single page, single user, low click frequency, no backend), classic performance traps (large lists, network waterfalls, bundle size at scale) are not realistic concerns here. The only traps that matter at this scale:

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Re-rendering every ventanilla on every queue change | All ventanilla components flash/re-animate when only the queue display (not their own ticket) changed | Scope state subscriptions so only the "próximos en cola" list re-renders on queue change, and only the affected ventanilla re-renders on its own ticket change (memoization or context selectors) | Visually noticeable even with just 3-5 ventanillas — not a "scale" issue, a correctness/UX issue from day one |
| Writing full state to localStorage synchronously on every click | Each click does a synchronous JSON.stringify + write | Negligible at this scale (small object, infrequent clicks) — not worth optimizing, just noted so it isn't "fixed" with unnecessary debouncing that then reintroduces Pitfall 4 | Never breaks at this app's scale |

## Security Mistakes

PROJECT.md explicitly has no auth and no backend, so most security concerns (data breaches, auth bypass, injection) don't apply. The realistic concerns are narrower:

| Mistake | Risk | Prevention |
|---------|------|------------|
| Trusting localStorage content as inherently safe to deserialize | A user (or anyone with devtools access on the shared clinic machine) can edit localStorage directly and inject unexpected shapes | Validate shape on load (ties to Pitfall 3) — don't `JSON.parse` and trust blindly, even though there's no "attacker" in the traditional sense here, just resilience against manual tampering or bugs |
| None related to auth/network | N/A — explicitly out of scope | N/A |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|------------------|
| "Llamar siguiente" gives no feedback when the queue is empty | Operator clicks repeatedly thinking it's broken | Show explicit "no hay turnos en espera" state/disable the button when queue is empty |
| No confirmation of which ventanilla just changed | On a shared display with several ventanillas, an operator/patient may not notice which one updated | Animation (already planned) should be visually localized to the specific ventanilla that changed, not a global flash |
| Ticket numbering resets unexpectedly after a refresh due to a persistence bug | Confusing/incorrect numbers shown to patients in a real clinic context | Persist the "next ticket number" counter explicitly, not just derived from queue length (queue length shrinks as tickets are called, so number must be tracked independently — verify this is in the data model) |
| Sound always plays even when the operator wants it muted (e.g., quiet office) | Minor annoyance, but real for an always-on display | Not in current requirements — flag as a possible future nice-to-have, not required for MVP; explicitly out of scope unless added to PROJECT.md |

## "Looks Done But Isn't" Checklist

- [ ] **Llamar siguiente button**: Often missing the empty-queue disabled/no-op state — verify clicking with zero tickets in queue does nothing harmful and gives clear feedback.
- [ ] **Persistence**: Often missing schema versioning and try/catch around parse — verify by manually corrupting the localStorage value in devtools and reloading; app must not crash.
- [ ] **Audio beep**: Often "works" only in the developer's manual click-testing flow — verify it still plays correctly after a hard page reload followed by the first click (true fresh-session gesture test), and that no unhandled promise rejection appears in console.
- [ ] **Animation**: Often only tested with the "happy path" of sequential distinct ticket numbers — verify it behaves sensibly when the queue is empty and "Llamar siguiente" is clicked with no change to show.
- [ ] **Dynamic ventanilla count**: Often built as add-only — verify removing a ventanilla doesn't crash if that ventanilla currently has an assigned ticket, and verify the removed ventanilla's state is cleaned up (not orphaned in storage).
- [ ] **Ticket numbering**: Often implicitly derived from array length/index — verify the "next ticket number" is a persisted, independent counter that only increments, never recalculated from current queue length (which would cause number reuse/collisions after tickets are called).

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|-----------------|
| Race condition causing duplicate/lost ticket (Pitfall 1) | LOW | Refactor the "call next" logic into a single reducer action; add a unit test reproducing two rapid dispatches; no data migration needed since state is ephemeral/derived |
| Corrupted/unversioned localStorage causing crash on load (Pitfall 3) | LOW | Add try/catch + version check; on detection of bad data, reset to default state and inform via console (no user-facing data loss matters much here since it's a low-stakes display app) |
| Audio silently not playing due to autoplay policy (Pitfall 5) | LOW | Move `.play()` call to be directly synchronous within the onClick handler if it was previously in an effect; add `.catch()` handling |
| Scope creep already built into early phases (Pitfall 7) | MEDIUM | Identify and explicitly cut the out-of-scope feature, document the decision in PROJECT.md's Key Decisions table, and continue — don't let sunk cost keep an unscoped feature alive |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|-------------------|----------------|
| Concurrent "Llamar siguiente" race (Pitfall 1) | Core queue/state management phase | Unit test: dispatch two `CALL_NEXT` actions back-to-back against the reducer; assert exactly one ticket is consumed and no duplicate assignment occurs |
| Misreading scope as multi-tab/cross-window (Pitfall 2) | Roadmap/planning phase | Roadmap contains no phase or task referencing `storage` events or `BroadcastChannel`; PROJECT.md Out of Scope section re-confirmed before phase 1 starts |
| Unversioned/uncaught localStorage parse failures (Pitfall 3) | Persistence phase | Manually corrupt localStorage value in devtools, reload app, confirm graceful fallback to default state instead of crash |
| Hydration flash / stale write timing (Pitfall 4) | Persistence phase | Hard refresh immediately after each action type (add ticket, call next, add/remove ventanilla); confirm no flash of default state and no lost last action |
| Autoplay-blocked audio (Pitfall 5) | Audio/feedback phase | Fresh page load with zero prior interaction, click "Llamar siguiente" as first action, confirm beep plays and no unhandled promise rejection in console |
| Animation not triggering / over-triggering / flicker (Pitfall 6) | Animation/UI polish phase | Click each ventanilla in sequence, click same ventanilla twice, click with empty queue; confirm animation fires exactly once per real action and is scoped to the correct ventanilla |
| Scope creep beyond PROJECT.md Active requirements (Pitfall 7) | Roadmap creation + every phase transition | Each phase's deliverables map 1:1 to an item in PROJECT.md's Active requirements list; any new idea is explicitly logged as deferred/rejected, not silently implemented |

## Sources

- [React docs — Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state) — MEDIUM/HIGH confidence, official docs
- [Fixing Race Conditions in React with useEffect — Max Rozen](https://maxrozen.com/race-conditions-fetching-data-react-with-useeffect) — MEDIUM confidence, community source, pattern corroborated by React docs' functional-updater guidance
- [MDN — Autoplay guide for media and Web Audio APIs](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay) — HIGH confidence, official browser documentation
- [Chrome for Developers — Autoplay policy in Chrome](https://developer.chrome.com/blog/autoplay) — HIGH confidence, official vendor documentation
- [Chromium — Autoplay Policy Design Rationale](https://www.chromium.org/audio-video/autoplay/autoplay-policy-design-rationale/) — HIGH confidence, official source explaining gesture requirement
- [MDN — Window: storage event](https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event) (referenced via search results on cross-tab sync) — HIGH confidence; confirms `storage` event does not fire in the writing tab, only other tabs — supports Pitfall 2's reasoning that this mechanism is irrelevant to a single-tab app
- [GitHub reactjs/react-transition-group issue #157 — flicker/timeout mismatch discussion](https://github.com/reactjs/react-transition-group/issues/157) — MEDIUM confidence, community-reported and widely corroborated pattern
- Project-specific reasoning derived directly from `.planning/PROJECT.md` (explicit scope boundaries: single page, no backend, no auth, no cross-device/tab sync, shared single queue) — HIGH confidence, primary source

---
*Pitfalls research for: client-only React+TS+Vite waiting-room queue display app*
*Researched: 2026-06-21*
