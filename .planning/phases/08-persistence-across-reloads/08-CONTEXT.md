# Phase 8: Persistence Across Reloads - Context

**Gathered:** 2026-07-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire `QueueState` (all 4 fields: `queue`, `nextNumber`, `ventanillas`, `nextWindowNumber`) to localStorage — save on every state change via `useEffect`, hydrate on page load via a lazy initializer for `useReducer`, and recover defensively from corrupted or absent data. No new runtime dependencies. Implemented as a hand-written hook (~15–20 lines) per CLAUDE.md recommendation.

The no-beep/no-animation regression is a verification concern, not an implementation concern: the beep fires only inside `handleCallNext` (user-gesture handler) and the flash animation uses the key-prop trick (no animation on first mount). Phase 8 must verify these explicitly per ROADMAP success criterion 3.

</domain>

<decisions>
## Implementation Decisions

### Corruption recovery
- **D-01:** Silent reset — when localStorage data is missing or fails to parse, fall back to `initialState` with no user-facing notice. Clean and minimal; matches the no-backend, single-screen spirit of the project.

### Storage key
- **D-02:** Use `"turnero-v1"` as the localStorage key. The `v1` suffix enables clean invalidation if the state shape changes in a future version (bump to `"turnero-v2"`) without relying on corruption recovery to discard stale data.

### Validation depth
- **D-03:** JSON.parse try/catch only. If `JSON.parse` throws (SyntaxError — truncated or invalid JSON), fall back to `initialState`. No structural shape check needed — the key is versioned (D-02), so shape mismatches from old code versions are handled by bumping the key prefix.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements and roadmap
- `.planning/REQUIREMENTS.md` §PERSIST-01 — formal requirement (persist queue + ventanillas; defensive recovery from corrupted/absent data; no beep/flash on reload)
- `.planning/ROADMAP.md` §Phase 8 — success criteria (3 criteria, including explicit no-beep/no-animation regression check)

### Source files to read before touching
- `src/turnero.ts` — `QueueState` type (4 fields), `initialState`, `queueReducer`; this is what gets serialized/deserialized
- `src/App.tsx` — `useReducer(queueReducer, initialState)` at line 92; persistence hook replaces `initialState` arg with a lazy initializer `() => loadFromStorage()`; the `useEffect` to save goes in the `App` function body

### Stack constraints
- `CLAUDE.md` §Alternatives Considered — hand-written `useLocalStorage` hook (~15–20 lines) is the recommended approach; `usehooks-ts` package explicitly not recommended for this scope
- `CLAUDE.md` §What NOT to Use — no new runtime dependencies

### Prior phase decisions affecting Phase 8
- `.planning/phases/06-call-transition-animation/06-CONTEXT.md` §D-06 — animation safe by design: key-prop trick fires only on mount-with-new-key, not on first mount; Phase 8 must verify explicitly
- `.planning/phases/05-call-sound-feedback/05-CONTEXT.md` (Phase 5 execution) — beep fires synchronously in `handleCallNext` inside user gesture; hydrating state via `initialState` or lazy initializer does not trigger beep

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/turnero.ts` exports: `QueueState` (the type to persist), `initialState` (the fallback), `queueReducer` (unchanged by this phase)
- `src/App.tsx` line 92: `const [state, dispatch] = useReducer(queueReducer, initialState)` — the second arg becomes a lazy initializer: `useReducer(queueReducer, undefined, () => loadFromStorage())`

### Established Patterns
- Hand-written hooks: `src/useBeep.ts` is the existing custom hook pattern; a new `src/useLocalStorage.ts` (or inline helper) follows the same convention
- `useEffect` with no deps (or `[state]`) to save: `useEffect(() => { localStorage.setItem('turnero-v1', JSON.stringify(state)) }, [state])`
- Lazy initializer pattern for `useReducer`: third-arg function `init` called once on mount — avoids reading localStorage on every render

### Integration Points
- `App.tsx` `useReducer` call: add lazy initializer to hydrate from localStorage
- `App.tsx` body: add `useEffect([state])` to save on every state change
- No changes needed to `turnero.ts`, `useBeep.ts`, `VentanillaCard`, or CSS

### No-regression proof points (verify in tests)
- Beep: `useBeep.play()` is called only in `VentanillaCard.handleCallNext` inside click handler — not triggered by hydration
- Flash: `<p key={ventanilla.currentTicket?.id ?? 'empty'}>` — first mount sets key once, no remount, no animation
- Both should be verified with a test that renders `VentanillaCard` with a non-null `currentTicket` and asserts no beep and no flash class on initial render

</code_context>

<specifics>
## Specific Ideas

- localStorage key: `"turnero-v1"` (exact string)
- Corruption handling: `try { return JSON.parse(localStorage.getItem('turnero-v1') ?? '') } catch { return initialState }`
- Hook can be a simple inline helper in `App.tsx` (not a separate file) if the implementation is <10 lines — the CLAUDE.md recommendation is for a hook when reuse is expected; here a single call site is fine either way
- ROADMAP success criterion 3 (no beep/flash on reload with persisted non-null state) should be an explicit automated test case, not just a visual check

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 8-Persistence Across Reloads*
*Context gathered: 2026-07-09*
