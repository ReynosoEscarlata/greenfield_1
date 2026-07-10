# Phase 6: Call Transition Animation - Research

**Researched:** 2026-07-07
**Domain:** CSS @keyframes animation — React key prop remount trigger
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Yellow flash / highlight — ticket number briefly glows yellow/orange then fades back to normal.
- **D-02:** Implemented with CSS `@keyframes` on `background-color` (no animation library). Per CLAUDE.md constraint.
- **D-03:** Animate only the `<p className="ventanilla-ticket">` element — not the whole `.ventanilla-card`.
- **D-04:** Use the React `key` prop trick: give the `.ventanilla-ticket` element a key derived from `ventanilla.currentTicket?.id`. When ticket changes, React unmounts/remounts the element, resetting CSS animation automatically.
- **D-05:** Restart animation from the beginning on rapid successive calls — automatic via key prop trick.
- **D-06:** No animation on page load/reload, even if `currentTicket` is non-null in persisted state. Key-prop approach handles this at first mount (currently satisfied naturally because Phase 8 persistence is not yet implemented).
- **D-07:** No animation when `currentTicket` becomes `null`.

### Claude's Discretion

None — discussion stayed within phase scope.

### Deferred Ideas (OUT OF SCOPE)

None.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FEEDBACK-02 | When a ventanilla's current ticket changes, a transition animation is shown | CSS `@keyframes ticket-flash` + `.ventanilla-ticket-flash` class + React `key` prop on `<p className="ventanilla-ticket">` triggers per-element remount animation |
</phase_requirements>

---

## Summary

Phase 6 is a minimal, well-scoped change: two files, no new packages, no new components. The UI-SPEC already supplies the exact CSS and JSX verbatim (see `06-UI-SPEC.md`). Research confirms there are no technical blockers, no React 19 regressions, and universal browser support for the chosen approach.

The implementation mechanism — React `key` prop remount to restart a CSS `@keyframes` animation — is established, idiomatic React. When `ventanilla.currentTicket?.id` changes as a key value, React unmounts the old `<p>` element and mounts a fresh one, which starts the animation from frame 0 automatically. No event listeners, no extra state, no animation library needed.

Testing in jsdom (the current Vitest environment) verifies class presence/absence only — jsdom does not execute CSS animations. This is both expected and sufficient for FEEDBACK-02: the testable behaviors are (a) flash class present when `currentTicket !== null`, (b) flash class absent when `currentTicket === null`, and (c) flash class still present after a rapid rerender with a new ticket. The actual animation visual is verified by manual checkpoint only.

**Primary recommendation:** Implement as a single plan with two waves — Wave 1 adds RED tests (FEEDBACK-02 describe block in `App.test.tsx`), Wave 2 makes them GREEN (CSS in `index.css` + JSX in `App.tsx`). Total file changes: 3 files, ~15 lines of new code.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Animation trigger | Browser / Client | — | React key prop is pure client-side reconciler behavior; no server or API involvement |
| Animation rendering | Browser / Client | — | CSS `@keyframes` is executed by the browser paint engine |
| Trigger condition logic | Browser / Client | — | `ventanilla.currentTicket !== null` evaluated in JSX at render time; no backend check needed |
| Animation state reset | Browser / Client | — | DOM element unmount + remount by React reconciler clears all browser-side CSS animation state |

---

## Standard Stack

### Core

No new packages. The implementation uses only capabilities already present in the project.

| Technology | Version (pinned) | Purpose | Confidence |
|------------|-----------------|---------|------------|
| CSS `@keyframes` | CSS Level 3 — baseline universal | Define the flash animation | HIGH — universally supported, no install needed |
| React `key` prop | React 19.2.6 (already installed) | Force `<p>` remount on ticket change | HIGH — fundamental reconciler feature, no changes in React 19 |
| `@testing-library/jest-dom` | 6.9.1 (already installed) | `toHaveClass` matcher for class assertions in jsdom | HIGH — already in use across existing tests |

### Supporting

No new libraries. All dependencies needed for Phase 6 are already installed.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS `@keyframes` | `framer-motion` / Motion library | +30-50 kB, gesture physics overkill for a single fade; CLAUDE.md explicitly forbids animation libraries |
| Key prop remount | `animationend` listener + state toggle | More complex: requires `useState`, an effect to reset class, and careful cleanup; fails on rapid calls if state toggle races |
| Key prop remount | CSS `:hover` or `:focus` pseudo-class | Does not trigger on programmatic ticket changes |

**Installation:** No new installs — `npm install` is not needed for this phase.

---

## Package Legitimacy Audit

**No npm packages added in this phase.** This section is not applicable.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| (none) | — | — | — | — | — | — |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

---

## Architecture Patterns

### System Architecture Diagram

```
User click "Llamar siguiente"
         |
         v
handleCallNext() [App.tsx — already implemented]
         |
         v
dispatch({ type: 'CALL_NEXT', windowId })  ← existing reducer action
         |
         v
queueReducer [turnero.ts]
  ventanilla.currentTicket = head of queue  ← state update
         |
         v
React re-renders VentanillaCard
  ventanilla.currentTicket changed
         |
         v
<p key={ventanilla.currentTicket?.id ?? 'empty'}
   className="ventanilla-ticket ventanilla-ticket-flash">
         |
    key changed?
    ┌──── YES ────┐                   ┌──── NO (no-op) ────┐
    v             |                   v
React unmounts   |            (key unchanged — no remount)
 old <p>         |
    v             |
React mounts     |
 new <p>         |
    v
CSS animation starts from frame 0
  @keyframes ticket-flash:
    0%:   background-color #fbbf24 (amber)
  100%:   background-color transparent
  duration: 600ms ease-out forwards
         |
         v
Animation completes → element rests at background-color: transparent
(card background #f1f3f5 shows through)
```

### Recommended Project Structure

No structural changes. Phase 6 modifies two existing files only:

```
src/
├── App.tsx          # Add key prop + conditional className to <p className="ventanilla-ticket">
├── index.css        # Add @keyframes ticket-flash + .ventanilla-ticket-flash class
└── App.test.tsx     # Add FEEDBACK-02 describe block (3 test cases)
```

### Pattern 1: React Key Prop Remount for Animation Restart

**What:** Give a non-list element a `key` derived from data that changes on each meaningful update. React treats key change as "different element" — unmounts old, mounts fresh.

**When to use:** When you need a CSS animation to replay every time a specific piece of data changes, without managing animation state in React.

**Example (from UI-SPEC — verbatim implementation):**
```jsx
// Source: 06-UI-SPEC.md Animation Contract — Trigger Mechanism (D-04)
<p
  key={ventanilla.currentTicket?.id ?? 'empty'}
  className={
    ventanilla.currentTicket !== null
      ? 'ventanilla-ticket ventanilla-ticket-flash'
      : 'ventanilla-ticket'
  }
>
  {ventanilla.currentTicket === null
    ? 'sin turno'
    : `Turno ${ventanilla.currentTicket.number}`}
</p>
```

**Why `'empty'` as fallback:** When `currentTicket` is `null`, the key is the string `'empty'`. When a ticket is assigned, the key becomes the ticket's numeric `id` (1, 2, 3…). These are always distinct → key change always happens on null→ticket and ticket-A→ticket-B transitions. String `'empty'` vs number `1` are unambiguously different React keys.

### Pattern 2: CSS @keyframes Flash Animation

**What:** Animate `background-color` from a highlight color to transparent, fading out quickly.

**Example (from UI-SPEC — verbatim CSS):**
```css
/* Source: 06-UI-SPEC.md Animation Contract — @keyframes Rule */
@keyframes ticket-flash {
  from {
    background-color: #fbbf24;
  }
  to {
    background-color: transparent;
  }
}

.ventanilla-ticket-flash {
  animation: ticket-flash 600ms ease-out forwards;
  border-radius: 4px;
}
```

**`forwards` fill-mode:** After 600ms, the element retains `background-color: transparent` (the `to` value). Without `forwards`, some browsers may snap the element back to its unset/initial state briefly before the next paint. `forwards` prevents this.

**`border-radius: 4px`:** Prevents the amber highlight from being a hard-edged rectangle against the card background. Applies only while the class is present.

### Pattern 3: Testing CSS Class Presence in jsdom

**What:** jsdom (the Vitest test environment) does not execute CSS animations or apply stylesheets. Tests can only verify that the element has the correct CSS class — not that the animation visually played.

**Standard approach with `@testing-library/jest-dom`:**
```tsx
// Source: @testing-library/jest-dom docs — toHaveClass matcher
// FEEDBACK-02-A: flash class present when currentTicket is non-null
const el = screen.getByText('Turno 5')
expect(el).toHaveClass('ventanilla-ticket-flash')

// FEEDBACK-02-B: flash class absent when currentTicket is null
const el = screen.getByText('sin turno')
expect(el).not.toHaveClass('ventanilla-ticket-flash')

// FEEDBACK-02-C: flash class persists after rapid rerender (D-05)
const { rerender } = render(
  <VentanillaCard ventanilla={{ id: 1, number: 1, currentTicket: { id: 10, number: 10 } }} ... />
)
expect(screen.getByText('Turno 10')).toHaveClass('ventanilla-ticket-flash')
rerender(
  <VentanillaCard ventanilla={{ id: 1, number: 1, currentTicket: { id: 11, number: 11 } }} ... />
)
expect(screen.getByText('Turno 11')).toHaveClass('ventanilla-ticket-flash')
```

**`screen.getByText('Turno N')`** returns the `<p>` element directly because the text is a direct child of `<p>` — no need to call `.closest('p')`.

**`toHaveClass`** accepts partial class lists — `toHaveClass('ventanilla-ticket-flash')` passes even when the element also has class `ventanilla-ticket`. [VERIFIED: testing-library/jest-dom docs]

### Anti-Patterns to Avoid

- **Animating the whole `.ventanilla-card`:** D-03 locks animation scope to `<p className="ventanilla-ticket">` only. Animating the card changes the remove button, label, and call-next button appearance.
- **Using `useState` + `animationend` listener to toggle class:** More code, more failure modes (rapid calls can outrace the reset), harder to test. Key prop trick is simpler and more robust.
- **Using `useEffect` to apply the flash class:** Effect runs after paint — may produce a flash-of-no-animation on first frame. Key prop remount is synchronous within the render pass.
- **Applying `forwards` fill-mode without `border-radius`:** The amber rectangle has sharp corners against the card. `border-radius: 4px` is part of the UI-SPEC contract.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Animation restart on rapid calls | `animationend` event + `setTimeout` reset | React `key` prop remount | Key prop is synchronous, zero-state, guaranteed restart on every key change; `animationend` can miss events under heavy re-renders |
| Animation state cleanup | Manual `removeEventListener` in useEffect | React key prop (unmount-on-key-change) | React's unmount of the old `<p>` removes the DOM element; browser cleans up all associated CSS state automatically |
| Animation library | Any npm package | Native CSS `@keyframes` | CLAUDE.md explicitly forbids animation libraries; CSS `@keyframes` is universally supported and zero-dependency |

**Key insight:** The entire mechanism is 3 lines of JSX and 8 lines of CSS. Any hand-rolled solution adds complexity for no benefit.

---

## Common Pitfalls

### Pitfall 1: Flash Class Applied on First Mount with Persisted Ticket (D-06 — Phase 8 risk)

**What goes wrong:** If `currentTicket` is non-null on first mount (after Phase 8 adds localStorage persistence), the flash class WILL be applied on initial render → animation fires on page load. This is a D-06 violation ("no animation on page load").

**Why it happens:** The key prop trick does not prevent first-mount animation. It only triggers remount on subsequent key changes. On first mount, a new `<p>` with the flash class mounts → animation runs regardless of whether this is a "page load" or a "user called a ticket."

**How to avoid (Phase 8 concern, NOT Phase 6):** Phase 6 is safe because Phase 8 (persistence) is not yet implemented — on load, all ventanillas start with `currentTicket: null` → no flash class → no animation. Phase 8 will need an explicit `isHydrating` flag or an "apply flash class only when the ticket was set in this session" guard. ROADMAP Phase 8 success criteria item #3 explicitly covers this.

**Warning signs:** After Phase 8 is implemented, adding tickets and reloading will trigger spurious flash on page load.

### Pitfall 2: `transparent` Color Interpolation Artifact

**What goes wrong:** CSS `transparent` is `rgba(0,0,0,0)` — it has black RGB channels. When animating `background-color` from `#fbbf24` (amber) TO `transparent`, the interpolation passes through colors that blend toward dark/black at mid-animation opacity levels, potentially producing a slightly grayish intermediate state.

**Why it happens:** The browser interpolates all four channels (R, G, B, A) independently. At 50% animation: `rgba(125, 95, 18, 0.5)` — not pure amber-at-50%-opacity, but a muted amber-brown.

**How to avoid:** Use `rgba(251, 191, 36, 0)` as the `to` value instead of `transparent`. This interpolates purely through amber (R/G/B channels stay constant, only alpha changes), producing a cleaner fade.

**Assessment for this project:** At 600ms ease-out (fast impact, slow tail), the mid-animation state is brief. The card background is `#f1f3f5` (very light gray), so the artifact is almost invisible. The UI-SPEC uses `transparent` (documented decision). This is LOW priority — the artifact is negligible in practice, but noting it for completeness.

**Warning signs:** If the flash animation appears to have a slightly grayish/muddy tint during the fade, switch `transparent` → `rgba(251, 191, 36, 0)`.

### Pitfall 3: Key Type Mismatch between `'empty'` String and Ticket ID Number

**What goes wrong:** A developer changes the fallback from `'empty'` to `null` or `undefined`. React keys must be `string | number`; `null`/`undefined` keys cause React to silently fall back to index-based reconciliation, breaking the remount trigger.

**Why it happens:** Optional chaining `ventanilla.currentTicket?.id` returns `number | undefined`. The `?? 'empty'` fallback converts `undefined` to the string `'empty'`, producing `number | string` — valid key types.

**How to avoid:** Keep `?? 'empty'` as written. Never use `?? null` or `?? undefined` for React keys.

**Warning signs:** Animation stops restarting on calls after a ticket-to-ticket transition; browser DevTools shows key as `undefined` on the `<p>` element.

### Pitfall 4: `forwards` Without Prior Understanding of No-Fill Equivalence

**What goes wrong:** Removing `forwards` from the animation shorthand, assuming it's unnecessary because `background-color` defaults to unset (= transparent anyway).

**Why it actually works without `forwards` too:** The default `background-color` on `.ventanilla-ticket` is unset (effectively transparent). So with or without `forwards`, the element visually rests at transparent after the animation. This means removing `forwards` would NOT cause a visible regression.

**Recommendation:** Keep `forwards` as specified. It's more semantically correct (explicitly declares intent), and some future CSS engines or browser behaviors may differ. The UI-SPEC documents it, making the intention clear to future maintainers.

---

## Code Examples

### Complete CSS Addition (verbatim from UI-SPEC)

```css
/* Source: 06-UI-SPEC.md Animation Contract */
@keyframes ticket-flash {
  from {
    background-color: #fbbf24;
  }
  to {
    background-color: transparent;
  }
}

.ventanilla-ticket-flash {
  animation: ticket-flash 600ms ease-out forwards;
  border-radius: 4px;
}
```

### Complete JSX Change (verbatim from UI-SPEC, replaces lines 64-68 in App.tsx)

```tsx
/* Source: 06-UI-SPEC.md Animation Contract — Trigger Mechanism */
<p
  key={ventanilla.currentTicket?.id ?? 'empty'}
  className={
    ventanilla.currentTicket !== null
      ? 'ventanilla-ticket ventanilla-ticket-flash'
      : 'ventanilla-ticket'
  }
>
  {ventanilla.currentTicket === null
    ? 'sin turno'
    : `Turno ${ventanilla.currentTicket.number}`}
</p>
```

**Current code at lines 64-68 (App.tsx) for reference:**
```tsx
<p className="ventanilla-ticket">
  {ventanilla.currentTicket === null
    ? 'sin turno'
    : `Turno ${ventanilla.currentTicket.number}`}
</p>
```

The replacement adds `key={...}` and the conditional `className`. The content (inner text) is unchanged.

### FEEDBACK-02 Test Describe Block

```tsx
// To add in App.test.tsx
describe('FEEDBACK-02: Flash class on ticket change', () => {
  it('applies ventanilla-ticket-flash class when currentTicket is non-null', () => {
    render(
      <VentanillaCard
        ventanilla={{ id: 1, number: 1, currentTicket: { id: 5, number: 5 } }}
        onRemove={() => {}}
        onCallNext={() => {}}
        queueLength={0}
      />
    )
    expect(screen.getByText('Turno 5')).toHaveClass('ventanilla-ticket-flash')
  })

  it('does not apply ventanilla-ticket-flash class when currentTicket is null', () => {
    render(
      <VentanillaCard
        ventanilla={{ id: 1, number: 1, currentTicket: null }}
        onRemove={() => {}}
        onCallNext={() => {}}
        queueLength={0}
      />
    )
    expect(screen.getByText('sin turno')).not.toHaveClass('ventanilla-ticket-flash')
  })

  it('applies flash class on the new element after rapid ticket change (D-05)', () => {
    const { rerender } = render(
      <VentanillaCard
        ventanilla={{ id: 1, number: 1, currentTicket: { id: 10, number: 10 } }}
        onRemove={() => {}}
        onCallNext={() => {}}
        queueLength={0}
      />
    )
    expect(screen.getByText('Turno 10')).toHaveClass('ventanilla-ticket-flash')

    rerender(
      <VentanillaCard
        ventanilla={{ id: 1, number: 1, currentTicket: { id: 11, number: 11 } }}
        onRemove={() => {}}
        onCallNext={() => {}}
        queueLength={0}
      />
    )
    expect(screen.getByText('Turno 11')).toHaveClass('ventanilla-ticket-flash')
  })
})
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `animationend` listener + class toggle | React key prop remount | Established pattern ~React 16+ | Zero state, zero listeners, automatic restart |
| `framer-motion` / animation libraries | Plain CSS `@keyframes` | React ecosystem shift, ~2022+ | Zero bundle cost for simple transitions |
| Vendor-prefixed `@-webkit-keyframes` | Unprefixed `@keyframes` | Chrome 43+, Firefox 16+, Safari 9+ | Modern targets need no prefixes |

**Deprecated/outdated:**
- `-webkit-animation`, `-moz-animation`, `-ms-animation` prefixes: Not needed. All modern browsers support the unprefixed `animation` property. [ASSUMED — training knowledge; consistent with caniuse.com baseline data]

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Vendor prefixes not needed for `@keyframes` / `animation` on this project's target browsers | State of the Art | Low: prefix would need to be added for very old browsers; visual-only regression, not functional |
| A2 | `transparent` color interpolation artifact is negligible at 600ms ease-out on `#f1f3f5` card background | Common Pitfalls §2 | Low: visual-only; fix is changing one color value in CSS |
| A3 | No React 19 regressions with key-prop remount for non-list elements | Architecture Patterns §1 | LOW: If wrong, animation would not restart; mitigation is an animationend + class reset approach |

---

## Open Questions (RESOLVED)

1. **D-06 after Phase 8 — how to suppress flash on hydration?**
   - What we know: Phase 6 code applies flash class whenever `currentTicket !== null`, including first mount.
   - What's unclear: Phase 8 will persist state to localStorage. On reload, ventanillas will have non-null `currentTicket` → flash fires on hydration (D-06 violation).
   - Recommendation: Leave for Phase 8. The ROADMAP Phase 8 success criteria #3 explicitly covers this. Options: (a) `isHydrating` flag cleared after first render, (b) only apply flash class inside event handler via a ref-tracked "justCalled" flag, (c) separate `shouldAnimate` prop set by parent on actual CALL_NEXT dispatch. Research this in Phase 8.
   - **RESOLVED: Deferred to Phase 8. ROADMAP Phase 8 success criteria item 3 covers hydration suppression. No action required in Phase 6.**

---

## Environment Availability

Step 2.6: SKIPPED — this phase adds no external tools, services, runtimes, or CLI utilities. All required capabilities (React 19, Vitest, jsdom, `@testing-library/jest-dom`) are already installed and confirmed working (23 tests passing as of Phase 5 completion).

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.10 + `@testing-library/react` 16.3.2 |
| Config file | `vite.config.ts` (test.environment: 'jsdom', test.setupFiles: './src/setupTests.ts', test.globals: true) |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FEEDBACK-02 | Flash class present on `<p>` when `currentTicket !== null` | unit (jsdom) | `npm test` | ❌ Wave 1 adds FEEDBACK-02 describe block to `App.test.tsx` |
| FEEDBACK-02 | Flash class absent when `currentTicket === null` | unit (jsdom) | `npm test` | ❌ Wave 1 |
| FEEDBACK-02 | Flash class present on new element after rapid ticket change (D-05) | unit (jsdom) | `npm test` | ❌ Wave 1 |
| FEEDBACK-02 (visual) | Animation actually plays and restarts on rapid call | visual / manual | — | manual only — jsdom cannot run CSS animations |

### Sampling Rate

- **Per task commit:** `npm test`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

None — existing test infrastructure covers all Phase 6 needs:
- `App.test.tsx` exists (add new describe block only — no new file)
- `setupTests.ts` requires NO changes for animation tests
- `@testing-library/jest-dom` already installed and imported in setupTests.ts
- Vitest jsdom environment already configured in `vite.config.ts`

---

## Security Domain

This phase adds CSS and modifies JSX rendering logic. No user input is processed, no data is stored, no authentication or authorization is involved. ASVS categories are not applicable.

| ASVS Category | Applies | Rationale |
|---------------|---------|-----------|
| V2 Authentication | no | No auth in project |
| V3 Session Management | no | No sessions |
| V4 Access Control | no | No permissions |
| V5 Input Validation | no | No new input — `currentTicket.id` is a reducer-generated integer, never user-supplied |
| V6 Cryptography | no | No encryption |

---

## Sources

### Primary (HIGH confidence)
- `06-UI-SPEC.md` (approved 2026-07-07) — verbatim CSS and JSX implementation contract
- `06-CONTEXT.md` (2026-07-08) — locked decisions D-01 through D-07
- `src/App.tsx` — confirmed existing code structure; lines 63-68 are the animation target
- `src/index.css` — confirmed existing selectors; `.ventanilla-ticket` at lines 117-122
- `src/App.test.tsx` — confirmed existing test patterns (describe blocks, fireEvent, rerender)
- `src/setupTests.ts` — confirmed `@testing-library/jest-dom` already imported; no changes needed
- `vite.config.ts` — confirmed `environment: 'jsdom'`, `globals: true`, `setupFiles` path
- `package.json` — confirmed `@testing-library/jest-dom: ^6.9.1` installed

### Secondary (MEDIUM confidence)
- WebSearch (testing-library/jest-dom npm page) — confirmed `toHaveClass` matcher semantics: accepts partial class list, returns true if element has the listed class alongside others
- WebSearch (multiple React key prop articles) — confirmed key prop remount is fundamental reconciler behavior unchanged in React 19; no concurrent mode regressions
- WebSearch (CSS-Tricks `@keyframes` almanac) — confirmed `animation-fill-mode: forwards` and `background-color` animation are universally supported in modern browsers

### Tertiary (LOW confidence)
- [A1] Vendor prefixes not needed — based on training knowledge and consistent web search signals; not verified against a specific caniuse.com page in this session
- [A2] Transparent interpolation artifact — based on Josh W. Comeau color-shifting article (joshwcomeau.com/animation/color-shifting/) and training knowledge; not verified against a live browser test

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; all tech already confirmed working in 23 passing tests
- Architecture: HIGH — implementation is fully specified verbatim in approved UI-SPEC
- Pitfalls: MEDIUM — Pitfall 1 (D-06 Phase 8 interaction) is HIGH; Pitfall 2 (transparent artifact) is LOW priority

**Research date:** 2026-07-07
**Valid until:** 2026-08-07 (stable domain; CSS `@keyframes` and React key prop behavior do not change on short timescales)
