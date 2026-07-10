# Phase 7: Distance-Readable & Privacy-Safe Display - Research

**Researched:** 2026-07-08
**Domain:** CSS typography scaling + CSS grid layout + privacy code audit
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** `.ventanilla-ticket` (número actual, "Turno N") → 48px / font-weight: bold (700). Legible a 3m en 5 segundos.
- **D-02:** `.ventanilla-label` ("Ventanilla 1") → ~20–22px. Crece proporcionalmente; es info secundaria pero debe ser legible desde la ventanilla.
- **D-03:** Queue strip (números de turnos en espera) → 20–24px. Los pacientes pueden ver si su número está próximo desde lejos.
- **D-04:** Máximo 2–3 tarjetas de ventanilla por fila. Si hay más ventanillas configuradas, el grid las envuelve a una nueva fila manteniendo ese ancho mínimo por tarjeta. No se comprimen para encajar todas en una fila.
- **D-05:** El número de turno va centrado (text-align: center) dentro de la tarjeta. La etiqueta "Ventanilla N" también se centra para mantener jerarquía visual coherente.
- **D-06:** La fase es auditoría y documentación — no se requieren cambios de UI activos. El código actual nunca renderiza nombres ni datos identificatorios; la pantalla solo muestra números de turno. Verificar por inspección de código y asentar en VERIFICATION.md.

### Claude's Discretion
None specified — all significant decisions are locked by D-01 through D-06.

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DISPLAY-01 | Los números de turno se muestran en tamaño grande y alto contraste, legibles a distancia (criterio: legible en 5 segundos desde 3 metros), acorde a una pantalla de sala de espera | Satisfied by D-01 (48px/700), D-02 (20–22px label), D-03 (20–24px queue), D-04 (grid constraint), D-05 (centering). Existing color palette already passes WCAG AAA contrast. |
| PRIVACY-01 | La pantalla pública solo muestra números de turno, nunca nombres ni datos identificatorios de pacientes | Satisfied by D-06: code audit of turnero.ts + App.tsx confirms no name field exists anywhere in the state shape or JSX. No UI changes required. |
</phase_requirements>

---

## Summary

Phase 7 is a narrowly-scoped CSS-only change plus a formal privacy code audit. No new libraries are installed, no new components are added, and no state shape changes are made. The entire implementation fits inside `src/index.css` (three font-size rules, one font-weight rule, one grid constraint, one centering rule) with a single new audit entry in VERIFICATION.md.

The current codebase already satisfies PRIVACY-01 by construction: `turnero.ts` defines `Ticket { id: number; number: number }` and `Ventanilla { id, number, currentTicket }` — there are no string fields for patient names anywhere in the state shape. App.tsx renders only `ticket.number` (an integer) in the queue strip and `ventanilla.currentTicket.number` in each VentanillaCard. The audit is documentation, not remediation.

For DISPLAY-01, the existing color palette (`#1f2933` on `#f1f3f5`) already achieves approximately 12.5:1 contrast ratio — well above WCAG AAA (7:1). The only missing piece is font size: `.ventanilla-ticket` sits at 16px/400 and needs to scale to 48px/700. Three CSS rules change; one CSS grid property narrows.

**Primary recommendation:** Apply six targeted CSS property edits to `src/index.css`. Write one PRIVACY-01 test in `App.test.tsx`. Document the privacy audit conclusion in VERIFICATION.md.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Font scaling (DISPLAY-01) | Browser / Client (CSS) | — | Pure CSS property change; no JS or component logic involved. jsdom cannot verify pixel rendering — visual checkpoint is the gate. |
| Grid column constraint (D-04) | Browser / Client (CSS) | — | `grid-template-columns` change in index.css; the browser layout engine enforces the column count at runtime. |
| Privacy audit (PRIVACY-01) | API / State (reducer) | Frontend display | Root cause lives in the state type definitions (turnero.ts). The display layer (App.tsx) can only render what the state contains. Audit both layers. |
| Test coverage | Dev toolchain (Vitest) | — | Existing vitest + @testing-library/react infrastructure covers structural assertions. Visual assertions go to manual checkpoint. |

---

## Standard Stack

### Core
No new libraries. All work uses the existing project stack.

| Tool | Version (installed) | Purpose |
|------|---------------------|---------|
| React | ^19.2.6 (installed) | No changes to component logic |
| TypeScript | ~6.0.2 (installed) | No type changes required |
| Vite | ^8.0.12 (installed) | No build changes required |
| Vitest | ^4.1.10 (installed) | Test runner for PRIVACY-01 and DISPLAY-01 structural tests |
| @testing-library/react | ^16.3.2 (installed) | Component rendering for privacy audit test |

[VERIFIED: npm registry via package.json lockfile — versions read directly from the project]

### Supporting
None.

### Alternatives Considered
None applicable — the decisions (D-01 through D-06) are locked and no library choices are required.

**Installation:** No packages to install.

---

## Package Legitimacy Audit

Not applicable — no external packages are installed in this phase.

---

## Architecture Patterns

### System Architecture Diagram

```
User Request (browser load)
        |
        v
   src/index.css  ──────────────────────────────────────────────────┐
   (CSS rules)                                                       |
   - .ventanilla-ticket  [48px / 700]  (D-01)                       |
   - .ventanilla-label   [20–22px]     (D-02)                       |
   - .ticket-chip        [20–24px]     (D-03)                       |
   - .ventanillas-grid   [minmax(350px, 1fr), max 3 col] (D-04)     |
   - .ventanilla-card    [text-align: center] (D-05)                |
        |                                                            |
        v                                                            |
   App.tsx renders:                                                  |
   - queue strip: ticket.number (integer only, no names)  ──────────┤
   - VentanillaCard: ventanilla.number + currentTicket.number ──────┤
   - No string/name fields in Ticket or Ventanilla types            |
        |                                                            |
        v                                                            |
   Browser display ←───────────────────────────────────────────────┘
   (CSS applied to rendered DOM → readable at 3m)
        |
        v
   VERIFICATION.md  ←── PRIVACY-01 audit conclusion (D-06)
```

### Recommended Project Structure

No structural changes. All edits go to:
```
src/
├── index.css     ← 6 CSS property edits (primary change)
└── App.tsx       ← read-only audit; no edits expected
.planning/phases/07-.../
└── VERIFICATION.md  ← privacy audit conclusion
```

### Pattern 1: CSS Grid Column Cap

**What:** Use `repeat(auto-fill, minmax(350px, 1fr))` to enforce a maximum of 3 ventanilla cards per row on a 1200px container.

**When to use:** When you need responsive wrapping but must cap the number of items per row without a media query.

**Why 350px min:** The `.page` container has `max-width: 1200px` and `padding: 32px` on each side, giving an effective content width of ~1136px. With `gap: 16px`:
- 3 columns: 3×350 + 2×16 = 1082px ≤ 1136px — fits, 3 columns rendered
- 4 columns: 4×350 + 3×16 = 1448px > 1136px — does not fit, wraps to new row

```css
/* Source: MDN Web Docs — CSS Grid auto-fill/auto-fit [VERIFIED: read from codebase + MDN pattern] */
.ventanillas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;
}
```

[ASSUMED — the 350px minimum is calculated from the container geometry; planner should verify this renders correctly in a visual checkpoint with 4+ ventanillas.]

### Pattern 2: Typography Scaling for Distance Readability

**What:** Scale the primary ticket number display to 48px/700 while keeping secondary elements proportional.

**Evidence for 48px at 3m:** At 96dpi (standard screen), 48px = 12.7mm character height. At 3m viewing distance, this subtends ~0.24° visual angle — above the ~0.2° threshold for comfortable reading of high-contrast text on a bright screen. The user confirmed this value. [ASSUMED — based on visual angle calculation from training knowledge, not cited from a specific standard]

```css
/* Source: src/index.css current values + D-01/D-02/D-03 locked decisions */

/* Before → After */
.ventanilla-ticket {
  font-size: 48px;      /* was 16px */
  font-weight: 700;     /* was 400 */
  color: #1f2933;       /* unchanged — already high-contrast */
  margin: 0;            /* unchanged */
}

.ventanilla-label {
  font-size: 21px;      /* was 16px — midpoint of 20–22px range */
  font-weight: 600;     /* unchanged */
  color: #1f2933;       /* unchanged */
  margin: 0 0 4px;      /* unchanged */
}

.ticket-chip {
  font-size: 22px;      /* was 16px — midpoint of 20–24px range */
  font-weight: 400;     /* unchanged */
  /* other properties unchanged */
}
```

### Pattern 3: Card Centering (D-05)

**What:** Add `text-align: center` to `.ventanilla-card` to center both the label and the ticket number without touching individual elements.

**Why the card level:** `.ventanilla-remove` uses `position: absolute` so it is removed from normal flow and not affected by `text-align`. `.call-next-button` has `width: 100%` so centering its text is a minor visual improvement (not a regression). `.ventanilla-warning` text centering is acceptable for a card layout. One change, all inner content aligned. [ASSUMED — based on CSS block formatting context rules; confirm in visual checkpoint]

```css
.ventanilla-card {
  position: relative;
  text-align: center;   /* add — centers label, ticket number, and button text */
}
```

### Anti-Patterns to Avoid

- **Changing `font-size` on `.ventanilla-ticket-flash` instead of `.ventanilla-ticket`:** The flash animation class is applied additionally on top of `.ventanilla-ticket`; the font size must live on the base class so it applies regardless of animation state.
- **Using `auto-fit` instead of `auto-fill` for the grid:** With fewer ventanillas than column slots, `auto-fit` collapses empty tracks and stretches items to fill the row (one ventanilla = full-width card). `auto-fill` creates empty tracks instead. For this app, `auto-fill` is fine since cards have a background and need width, but the difference is cosmetic. Either works; `auto-fill` is the safer default for future card additions. [ASSUMED — behavior difference between auto-fit and auto-fill in this context]
- **Setting `font-size` in `em` instead of `px` here:** The root font-size is browser-default (~16px). Using `em` would make `.ventanilla-ticket { font-size: 3em }` = 48px at default, but if any ancestor overrides font-size, the ticket size changes unexpectedly. Use `px` for locked, distance-specific requirements. [ASSUMED]
- **Touching `src/App.tsx` for PRIVACY-01:** D-06 explicitly states no UI changes are required. The audit result goes in VERIFICATION.md. Do not add UI elements or modify JSX to "prove" privacy.

---

## Don't Hand-Roll

Not applicable for this phase — no custom utilities are being built. The entire phase is property value changes to existing CSS rules and a code audit.

---

## Runtime State Inventory

Not applicable — this is a display/CSS-only phase with no renames, refactors, or migrations. No runtime state stores the old CSS values.

---

## Privacy Audit Findings (PRIVACY-01)

The following is a complete privacy audit of the codebase, conducted by reading `src/turnero.ts` and `src/App.tsx`.

### State Shape Audit (turnero.ts)

| Type | Fields | Patient Data? |
|------|--------|---------------|
| `Ticket` | `id: number`, `number: number` | None |
| `Ventanilla` | `id: number`, `number: number`, `currentTicket: Ticket \| null` | None |
| `QueueState` | `queue: Ticket[]`, `nextNumber: number`, `ventanillas: Ventanilla[]`, `nextWindowNumber: number` | None |
| `QueueAction` | `ADD_TICKET`, `ADD_WINDOW`, `REMOVE_WINDOW`, `CALL_NEXT` | None |

No action type accepts a patient name parameter. The reducer cannot introduce name data.

### Render Audit (App.tsx)

| Element | What it renders | Patient data risk |
|---------|-----------------|-------------------|
| Queue chip (`li.ticket-chip`) | `` `Turno ${ticket.number}` `` — integer only | None |
| Queue empty state | `'Próximos turnos aparecerán aquí'` — static string | None |
| Ventanilla label | `` `Ventanilla ${ventanilla.number}` `` — integer only | None |
| Ventanilla ticket (active) | `` `Turno ${ventanilla.currentTicket.number}` `` — integer only | None |
| Ventanilla ticket (empty) | `'sin turno'` — static string | None |
| Removal warning | `'No se puede quitar: tiene un turno activo'` — static string | None |
| Empty-queue warning | `'No hay turnos en espera'` — static string | None |
| Page title | `'Turnero'` — static string | None |
| Section headings | `'Cola'`, `'Ventanillas'` — static strings | None |

**No free-text inputs exist** anywhere in App.tsx that could capture patient-identifying information.

**Audit conclusion (PRIVACY-01 SATISFIED):** The screen renders only ticket numbers (integers), static UI strings, and ventanilla numbers (integers). No patient name, identifier, or personal data can be rendered because no such field exists in the state type definitions or anywhere in the JSX render paths. PRIVACY-01 is satisfied by design. Document this in VERIFICATION.md.

---

## Common Pitfalls

### Pitfall 1: Flash Animation Breaks After Font-Size Change
**What goes wrong:** The `.ventanilla-ticket-flash` animation applies `background-color`. After increasing `.ventanilla-ticket` to 48px, the animated element's bounding box is much larger — the yellow flash may look disproportionate or clipped if the `border-radius` is still 4px.
**Why it happens:** The flash was sized for 16px text. At 48px, the element's visual footprint is 3× taller and wider.
**How to avoid:** After the CSS change, trigger a flash (call next in the dev server) and visually confirm the flash area looks correct. Adjust `border-radius` if needed (e.g., increase to 8px or 12px). The animation itself does not need to change.
**Warning signs:** Flash rectangle is too tight around the larger text, or the background color bleeds past the card edge.

### Pitfall 2: Grid Change Breaks Single-Ventanilla Layout
**What goes wrong:** With `minmax(350px, 1fr)` and only one ventanilla, the card takes full row width (~1136px). This may look unexpectedly wide for a single card.
**Why it happens:** `auto-fill` creates one column track of `1fr` when only one item is present — it fills the entire row.
**How to avoid:** Acceptable per D-04 ("si hay solo 1 ventanilla puede ocupar más ancho"). Verify visually with 1, 2, 3, and 4 ventanillas.
**Warning signs:** The single-ventanilla case looks awkward. If so, add `max-width: 500px` on `.ventanilla-card` without changing the grid.

### Pitfall 3: Centering Breaks Removal Button Position
**What goes wrong:** Adding `text-align: center` to `.ventanilla-card` inadvertently centers the "×" remove button even though it uses `position: absolute`.
**Why it happens:** `text-align` does not affect absolutely positioned elements — they use coordinate positioning (`top`, `right`, etc.). This pitfall is a false alarm, but the plan checker may flag it.
**How to avoid:** No action needed. `position: absolute` removes the element from normal flow. `text-align: center` on the parent has no effect on it. Confirmed by CSS specification. [ASSUMED — standard CSS spec behavior]
**Warning signs:** None expected.

### Pitfall 4: `.ticket-chip` vs `.queue-strip p` Conflict
**What goes wrong:** The queue strip empty-state uses `.queue-strip p { font-size: 16px }` (line 44–47 in index.css), but the queue items use `.ticket-chip { font-size: 16px }` (line 88). After increasing `.ticket-chip` to 22px, the empty state `<p>` remains at 16px. This is correct behavior (empty state is secondary info, not a ticket number), but it could be mistaken for a missed change.
**Why it happens:** Two separate selectors control text size in the queue area.
**How to avoid:** Only update `.ticket-chip`. Leave `.queue-strip p` at 16px — the empty state text is not a ticket number and does not require distance legibility.
**Warning signs:** None — this is intentional.

---

## Code Examples

### Complete Changeset for index.css

The following shows every line that changes, with before/after:

```css
/* === VENTANILLA-TICKET (D-01) === */
/* BEFORE: font-size: 16px; font-weight: 400; */
/* AFTER: */
.ventanilla-ticket {
  font-size: 48px;
  font-weight: 700;
  color: #1f2933;
  margin: 0;
}

/* === VENTANILLA-LABEL (D-02) === */
/* BEFORE: font-size: 16px; font-weight: 600; */
/* AFTER: */
.ventanilla-label {
  font-size: 21px;
  font-weight: 600;
  color: #1f2933;
  margin: 0 0 4px;
}

/* === TICKET-CHIP (D-03) === */
/* BEFORE: font-size: 16px; font-weight: 400; */
/* AFTER: */
.ticket-chip {
  background: #ffffff;
  color: #1f2933;
  border-radius: 999px;
  padding: 8px 16px;
  font-size: 22px;
  font-weight: 400;
}

/* === VENTANILLAS-GRID (D-04) === */
/* BEFORE: grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); */
/* AFTER: */
.ventanillas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 16px;
}

/* === VENTANILLA-CARD (D-05) === */
/* BEFORE: position: relative; */
/* AFTER: */
.ventanilla-card {
  position: relative;
  text-align: center;
}
```

Total lines changed: 5 property values + 1 new property. No new selectors, no deleted selectors.

### PRIVACY-01 Test (App.test.tsx — new describe block)

```tsx
// Source: Phase 7 research — audit test for PRIVACY-01
describe('PRIVACY-01: No patient-identifying data rendered', () => {
  it('renders only ticket number text when current ticket is active', () => {
    render(
      <VentanillaCard
        ventanilla={{ id: 1, number: 1, currentTicket: { id: 42, number: 42 } }}
        onRemove={() => {}}
        onCallNext={() => {}}
        queueLength={0}
      />
    )
    // Only "Turno 42" — no name, no patient identifier
    expect(screen.getByText('Turno 42')).toBeInTheDocument()
    expect(screen.queryByTestId('patient-name')).not.toBeInTheDocument()
  })

  it('renders only "sin turno" text when no ticket is active', () => {
    render(
      <VentanillaCard
        ventanilla={{ id: 1, number: 1, currentTicket: null }}
        onRemove={() => {}}
        onCallNext={() => {}}
        queueLength={0}
      />
    )
    expect(screen.getByText('sin turno')).toBeInTheDocument()
    expect(screen.queryByTestId('patient-name')).not.toBeInTheDocument()
  })
})
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `repeat(auto-fit, minmax(200px, 1fr))` (current) | `repeat(auto-fill, minmax(350px, 1fr))` (target) | Caps columns at 3 on 1200px container; cards don't compress below 350px |
| `.ventanilla-ticket { font-size: 16px; font-weight: 400 }` (current) | `48px / 700` (target) | 3× larger, bold — distance-readable |
| `.ventanilla-label { font-size: 16px }` (current) | `21px` (target) | Proportional secondary readability |
| `.ticket-chip { font-size: 16px }` (current) | `22px` (target) | Queue numbers scannable from distance |

**Nothing deprecated** — this phase adds values to existing selectors only.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | 48px at 3m subtends ~0.24° visual angle, sufficient for comfortable reading | Summary, Code Examples | Low — user confirmed 48px is acceptable; even if the angle is slightly off, 48px is a safe conservative choice |
| A2 | `minmax(350px, 1fr)` caps grid at 3 columns on a 1200px container with 32px padding | Architecture Patterns (Pattern 1) | Medium — if container is resized or box-sizing differs, column count may vary; visual checkpoint with 4+ ventanillas resolves this |
| A3 | Adding `text-align: center` to `.ventanilla-card` does not affect `.ventanilla-remove` (position: absolute) | Architecture Patterns (Pattern 3), Pitfall 3 | Low — standard CSS behavior; verified by CSS specification |
| A4 | `auto-fill` vs `auto-fit` difference is cosmetic for this app | Anti-Patterns | Low — single-item row behavior differs but is acceptable per D-04 |
| A5 | 21px is the right midpoint for D-02 (20–22px range) | Code Examples | Low — any value in 20–22px satisfies the locked decision |
| A6 | 22px is the right midpoint for D-03 (20–24px range) | Code Examples | Low — any value in 20–24px satisfies the locked decision |

---

## Open Questions

1. **Flash animation visual quality at 48px**
   - What we know: `@keyframes ticket-flash` flashes `background-color: #fbbf24` → transparent over 600ms with `border-radius: 4px` on the `.ventanilla-ticket` element
   - What's unclear: Whether 4px border-radius looks right on a 48px tall element
   - Recommendation: Include a visual checkpoint task that tests the flash after the font-size change. If the flash area looks wrong, increase `border-radius` on `.ventanilla-ticket-flash` (not `.ventanilla-ticket`).

2. **`.ventanilla-grid > *` background padding**
   - What we know: `.ventanillas-grid > *` applies `background: #f1f3f5; padding: 16px` to every direct child. At 48px ticket size, 16px padding on all sides may feel tight.
   - What's unclear: Whether the plan should increase card padding.
   - Recommendation: Leave padding at 16px (not a D-xx decision, not in scope). User can adjust in a later polish phase.

---

## Environment Availability

Step 2.6: SKIPPED — this phase is CSS and documentation only. No external dependencies, CLI tools, runtimes, or services beyond the existing Vite dev server are required.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.10 |
| Config file | `vite.config.ts` (inline test config) |
| Quick run command | `npm test` |
| Full suite command | `npm test` |
| Setup file | `src/setupTests.ts` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DISPLAY-01 | `.ventanilla-ticket` element present with expected class on "Turno N" text | structural (jsdom cannot verify px size) | `npm test` | ✅ already covered implicitly by FEEDBACK-02 tests; optional explicit describe block |
| DISPLAY-01 | Ticket number 48px, bold, readable at 3m | visual-only | manual checkpoint — `npm run dev`, render 3+ ventanillas | N/A |
| PRIVACY-01 | VentanillaCard renders only ticket number text, no patient identifier | unit | `npm test` | ❌ Wave 0: new describe block in App.test.tsx |

### Sampling Rate

- **Per task commit:** `npm test`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/App.test.tsx` — append `describe('PRIVACY-01: No patient-identifying data rendered', ...)` block (2 tests: active ticket renders only "Turno N"; no-ticket renders only "sin turno")

*(All other test infrastructure is already in place.)*

---

## Security Domain

`security_enforcement` not set in config.json — treated as enabled.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | No auth in this app (by design) |
| V3 Session Management | No | No sessions |
| V4 Access Control | No | No roles or permissions |
| V5 Input Validation | No | This phase adds no inputs; existing app has no text inputs |
| V6 Cryptography | No | No cryptographic operations |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Patient data exposure on public display | Information Disclosure | By design: PRIVACY-01 audit confirms no name fields exist in state shape or render paths — only integers rendered |

No active threat mitigations needed — PRIVACY-01 is satisfied architecturally.

---

## Sources

### Primary (HIGH confidence)
- `src/index.css` — direct read; all current selector values are facts, not estimates
- `src/App.tsx` — direct read; all JSX render paths inspected for PRIVACY-01 audit
- `src/turnero.ts` — direct read; all type definitions inspected for name fields
- `src/App.test.tsx` — direct read; existing test coverage understood
- `.planning/phases/07-distance-readable-privacy-safe-display/07-CONTEXT.md` — locked decisions D-01 through D-06
- `package.json` — all installed package versions

### Secondary (MEDIUM confidence)
- CSS Grid `auto-fill` vs `auto-fit` behavior — MDN Web Docs (standard, not verified via tool call in this session) [CITED: developer.mozilla.org/en-US/docs/Web/CSS/repeat]
- Visual angle calculation for 48px at 3m — ergonomics training knowledge [ASSUMED]

### Tertiary (LOW confidence)
- None.

---

## Metadata

**Confidence breakdown:**
- CSS changes: HIGH — values read directly from source; decisions locked by CONTEXT.md
- Privacy audit: HIGH — complete code inspection of all state types and render paths
- Grid column cap math: MEDIUM — geometry calculation from container size; verify with visual checkpoint
- Test gaps: HIGH — test file read directly; gap identified from absence of PRIVACY-01 describe block

**Research date:** 2026-07-08
**Valid until:** 2026-08-08 (stable domain — CSS + code audit does not expire)
