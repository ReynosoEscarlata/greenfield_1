# Phase 6: Call Transition Animation - Pattern Map

**Mapped:** 2026-07-07
**Files analyzed:** 3 (2 modified source files + 1 modified test file)
**Analogs found:** 3 / 3

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/index.css` | utility/style | transform | `.ventanilla-ticket` class (lines 117-122) + `.ventanilla-warning` (lines 141-145) | role-match |
| `src/App.tsx` | component | event-driven | `key={ticket.id}` on `<li>` list items (line 104) + existing ternary className on `<p>` (lines 64-68) | exact |
| `src/App.test.tsx` | test | request-response | `describe('WR-01: ...)` block (lines 99-122) using `rerender` | exact |

---

## Pattern Assignments

### `src/index.css` (utility class + @keyframes rule)

**Analog:** `.ventanilla-ticket` (lines 117-122) and `.ventanilla-warning` (lines 141-145)

**Existing CSS block structure pattern** (lines 117-122 and 141-145):
```css
/* Single-responsibility blocks, no nesting, property order:
   font/text props first, then box model, then position */

.ventanilla-ticket {
  font-size: 16px;
  font-weight: 400;
  color: #1f2933;
  margin: 0;
}

.ventanilla-warning {
  font-size: 13px;
  color: #c0392b;
  margin: 6px 0 0;
}
```

**Insertion point:** Add the two new rules immediately after `.ventanilla-ticket` (after line 122) and before `.ventanilla-remove` (line 124). This keeps animation modifier class adjacent to the element class it extends.

**New CSS to add (verbatim from UI-SPEC §Animation Contract):**
```css
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

**Key CSS decisions:**
- `#fbbf24` — warm amber (Tailwind amber-400); high contrast against `#f1f3f5` card background
- `600ms ease-out` — fast impact, graceful fade; short enough for rapid calls
- `forwards` fill-mode — element rests at `background-color: transparent` after animation completes
- `border-radius: 4px` — softens highlight rectangle against card background (xs token per spacing scale)
- No vendor prefixes needed — `@keyframes` and `animation` are universally supported on modern browsers

---

### `src/App.tsx` — `<p className="ventanilla-ticket">` in `VentanillaCard` (lines 64-68)

**Analog 1 (key prop):** `<li key={ticket.id}` in App.tsx line 104
```tsx
// Existing pattern — key prop on list items (line 104)
{state.queue.map((ticket) => (
  <li key={ticket.id} className="ticket-chip">
    Turno {ticket.number}
  </li>
))}
```
The same `key` prop mechanism applies to non-list elements to force unmount/remount on data change.

**Analog 2 (conditional content):** The existing `<p className="ventanilla-ticket">` (lines 64-68)
```tsx
// CURRENT code at lines 64-68 — the target element before modification
<p className="ventanilla-ticket">
  {ventanilla.currentTicket === null
    ? 'sin turno'
    : `Turno ${ventanilla.currentTicket.number}`}
</p>
```

**Analog 3 (conditional rendering guard):** `useEffect` guard on `ventanilla.currentTicket` (lines 22-26)
```tsx
// Existing prop-watching pattern in VentanillaCard (lines 22-26)
useEffect(() => {
  if (ventanilla.currentTicket === null) {
    setShowWarning(false)
  }
}, [ventanilla.currentTicket])
```
The same `ventanilla.currentTicket` condition guards the animation class — null → no class; non-null → add class.

**Replacement JSX (verbatim from UI-SPEC §Trigger Mechanism, replaces lines 64-68):**
```tsx
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

**Key implementation notes:**
- `key={ventanilla.currentTicket?.id ?? 'empty'}` — optional chaining returns `number | undefined`; `?? 'empty'` converts `undefined` to string `'empty'`, producing valid `number | string` React key. Never use `?? null` or `?? undefined` — React silently falls back to index reconciliation.
- Inner text content (lines 65-67) is **unchanged** — only `key` and `className` are added.
- No new imports required. No new state. No `useEffect`. No `animationend` listener.
- No changes to `VentanillaCard` props interface — `ventanilla: Ventanilla` already carries `currentTicket`.

---

### `src/App.test.tsx` — FEEDBACK-02 describe block (append after line 154)

**Analog:** `describe('WR-01: ...')` block (lines 99-122) — uses `rerender` to simulate prop change, matching FEEDBACK-02-C rapid-call test.

**Existing rerender pattern** (lines 99-122):
```tsx
describe('WR-01: showWarning resets when currentTicket is cleared externally', () => {
  it('clears the removal warning when ventanilla prop transitions from active ticket to null', () => {
    const { rerender } = render(
      <VentanillaCard
        ventanilla={{ id: 1, number: 1, currentTicket: { id: 5, number: 5 } }}
        onRemove={() => {}}
        onCallNext={() => {}}
        queueLength={1}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Quitar ventanilla 1' }))
    expect(screen.getByText('No se puede quitar: tiene un turno activo')).toBeInTheDocument()

    rerender(
      <VentanillaCard
        ventanilla={{ id: 1, number: 1, currentTicket: null }}
        onRemove={() => {}}
        onCallNext={() => {}}
        queueLength={0}
      />
    )
    expect(screen.queryByText('No se puede quitar: tiene un turno activo')).not.toBeInTheDocument()
  })
})
```

**Existing simple-render + class assertion pattern** (lines 10-22):
```tsx
describe('WINDOW-03: Per-window current ticket display', () => {
  it('renders "sin turno" when currentTicket is null', () => {
    render(
      <VentanillaCard
        ventanilla={{ id: 1, number: 1, currentTicket: null }}
        onRemove={() => {}}
        onCallNext={() => {}}
        queueLength={1}
      />
    )
    expect(screen.getByText('sin turno')).toBeInTheDocument()
  })
})
```

**New FEEDBACK-02 describe block to append (verbatim from RESEARCH.md §Code Examples):**
```tsx
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

**Key test notes:**
- `screen.getByText('Turno 5')` returns the `<p>` element directly — text is a direct child of `<p>`, no `.closest()` needed.
- `toHaveClass('ventanilla-ticket-flash')` passes even when element also has `ventanilla-ticket` — partial class list match.
- No `vi.useFakeTimers()` needed — no timers involved in animation class logic.
- No `mockPlay.mockClear()` needed — `handleCallNext` is not called in FEEDBACK-02 tests (queueLength=0 for tests A and B; test C renders directly with non-null ticket, not via button click).
- jsdom does not execute CSS animations — tests verify class presence only, not visual animation playback.

---

## Shared Patterns

### Conditional className Pattern
**Source:** App.tsx lines 64-68 (existing), extended in this phase
**Apply to:** `<p className="ventanilla-ticket">` in VentanillaCard only

The project uses inline ternary for conditional class assignment — no `clsx`, no `classnames` library:
```tsx
className={
  condition
    ? 'base-class modifier-class'
    : 'base-class'
}
```

### React `key` Prop for Remount
**Source:** App.tsx line 104 (`key={ticket.id}`) and lines 126-132 (`key={v.id}`)
**Apply to:** The `<p className="ventanilla-ticket">` element for animation reset only

Key prop on non-list elements uses the same syntax as list keys. The fallback string `'empty'` is mandatory — never `null`/`undefined`.

### CSS Modifier Class Convention
**Source:** `src/index.css` throughout — all modifier classes use full BEM-style names
**Apply to:** `.ventanilla-ticket-flash` follows the existing `.[component]-[element]-[modifier]` naming pattern (e.g., `ventanilla-card`, `ventanilla-ticket`, `ventanilla-warning`, `ventanilla-remove`).

### Test Describe Block Naming
**Source:** App.test.tsx — all describe blocks follow `'REQ-ID: Human-readable description'`
**Apply to:** New FEEDBACK-02 describe block: `'FEEDBACK-02: Flash class on ticket change'`

---

## No Analog Found

No files in this phase lack a codebase analog. All three modified files have direct existing patterns to copy from.

---

## Metadata

**Analog search scope:** `src/App.tsx`, `src/index.css`, `src/App.test.tsx` (all three files modified in this phase read in full)
**Files scanned:** 3 source files + 3 planning docs (CONTEXT.md, RESEARCH.md, UI-SPEC.md)
**Pattern extraction date:** 2026-07-07
