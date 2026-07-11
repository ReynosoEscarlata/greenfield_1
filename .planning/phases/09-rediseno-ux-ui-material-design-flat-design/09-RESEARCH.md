# Phase 9: Rediseño UX/UI con estilo Material Design y Flat Design - Research

**Researched:** 2026-07-10
**Domain:** Tailwind CSS v4 + Material Design 3 visual redesign in existing Vite 8 + React 19 + TypeScript 6 project
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- D-01: MD3 / Material You — superficies tonales, esquinas redondeadas, variantes filled/tonal/outlined
- D-02: Solo modo claro. Sin dark mode.
- D-03: Elevación via surface tones (fondo tintado), no box-shadow pronunciadas
- D-04: Color primario `#1976D2`
- D-05: Fondo página `#FFFFFF`
- D-06: Primary container `#BBDEFB`
- D-07: Error color `#B3261E`
- D-08: Flash animation color: `rgba(25, 118, 210, 0.25)` → transparent
- D-09: "Llamar siguiente" = Filled pill `bg-[#1976D2] text-white rounded-full`
- D-10: "Agregar turno" = Filled Tonal pill `bg-[#BBDEFB] text-[#1565C0] rounded-full`
- D-11: "Agregar ventanilla" = Outlined pill `border border-[#1976D2] text-[#1976D2] bg-transparent rounded-full`
- D-12: "×" button = Icon button MD3, rounded-full, hover bg suave
- D-13: Queue chips = Outlined MD3 `border border-[#1976D2] text-[#1976D2] bg-white rounded-full`
- D-14: Card border-radius = 12px (rounded-xl)
- D-15: Título 'Turnero' = text-4xl font-normal (36px/400)
- D-16: Section headings = text-[22px] font-normal
- D-17: Ticket number = text-5xl font-bold (48px/700) — UNCHANGED from Phase 7
- D-18: Fuente Roboto via Google Fonts; cargar weights 400, 700 únicamente
- D-19: Top App Bar MD3 sticky, bg `#1976D2`, text white
- D-20: Top App Bar sticky top-0 z-10
- D-21: "Agregar turno" permanece debajo del top bar en el body
- D-22: Queue section = surface variant `bg-[#BBDEFB] rounded-xl`
- D-23: Instalar tailwindcss + @tailwindcss/vite como devDependencies
- D-24: Colores MD3 definidos en `@theme {}` en index.css
- D-25: index.css reemplazado casi completamente con `@import "tailwindcss"` + `@theme {}` + residuales
- D-26: `.ventanilla-ticket-flash` y `@keyframes ticket-flash` se mantienen como CSS puro (no migrar a Tailwind)
- D-27: JSX de App.tsx reescrito con clases Tailwind
- D-28: Tests NO se modifican; todos los 33 deben pasar

### Claude's Discretion
- Ninguna area marcada como discreción de Claude — todas las decisiones están bloqueadas.

### Deferred Ideas (OUT OF SCOPE)
- Ninguna — la discusión se mantuvo dentro del alcance del rediseño visual.
</user_constraints>

---

## Summary

Phase 9 is a pure visual redesign: install Tailwind CSS v4, replace `index.css`, rewrite `className` strings in `App.tsx`, and add a sticky Top App Bar. No new logic, no new components, no new routes. The scope is exactly four files: `vite.config.ts`, `index.html`, `src/index.css`, `src/App.tsx`.

The critical technical challenge is correctly setting up Tailwind v4 in a project that already has Vite 8 + Vitest in the same config file, and understanding the specific behaviors of v4 that differ from v3 (especially `@import "tailwindcss"` replacing the old three-directive pattern, and the `@theme` block for custom color tokens).

The most important invariant is that `.ventanilla-ticket-flash` must remain as a named CSS class in plain CSS outside any `@layer` or `@utility` directive. The FEEDBACK-02 tests in `App.test.tsx` query for this class by name (`toHaveClass('ventanilla-ticket-flash')`). Moving it to a Tailwind `@utility` or renaming it would silently break those three tests.

**Primary recommendation:** Install `tailwindcss@^4` + `@tailwindcss/vite@^4` as devDependencies, add the plugin to `vite.config.ts` (alongside the existing vitest config), replace `index.css` with `@import "tailwindcss"` + `@theme {}` + plain CSS residuals (flash animation, ventanillas grid), and rewrite `App.tsx` classNames following the exact mapping in `09-UI-SPEC.md`. Run `npm test` after each file change to catch regressions early.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| MD3 color tokens | CSS / Build | — | `@theme {}` in index.css; generates utility classes at build time; zero runtime JS |
| Top App Bar layout | Browser / Client (React JSX) | CSS | New `<header>` element with Tailwind classes; sticky behavior via CSS `position: sticky` |
| Button visual hierarchy (filled/tonal/outlined) | CSS / Build | — | Tailwind utilities on existing button elements; no new components or behavior |
| Flash animation | CSS | React (key prop trigger) | `@keyframes` in index.css; React `key` prop causes re-mount which resets the animation |
| Ventanillas grid layout | CSS | — | `grid-template-columns` in residual `.ventanillas-grid` class; React only applies the className string |
| Font loading | HTML (index.html) | CSS | Google Fonts `<link>` in `<head>`; CSS sets `font-family` in `@theme` and `body` |
| Test invariants | React JSX | CSS | `className` string must include `ventanilla-ticket-flash` literal; CSS class definition keeps animation |

---

## Standard Stack

### Core (devDependencies to install)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| tailwindcss | 4.3.2 | CSS utility framework + @theme token system | Latest stable (July 9 2026); official tailwindlabs package; v4 uses CSS-first config |
| @tailwindcss/vite | 4.3.2 | Vite plugin that integrates Tailwind v4 into Vite's CSS pipeline | Official companion plugin; replaces PostCSS setup; works with Vite 6, 7, 8 |

[VERIFIED: npm registry] — both packages at 4.3.2, published 2026-07-09, from `github.com/tailwindlabs/tailwindcss`. slopcheck result: [OK] for both.

### External Assets

| Asset | Source | Purpose | Notes |
|-------|--------|---------|-------|
| Roboto font | `fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap` | MD3 typography | CDN request at page load; fallback `sans-serif` if offline |

### NOT installing (confirmed out of scope)

| Package | Why excluded |
|---------|-------------|
| `@tailwindcss/typography` | No prose content |
| `@tailwindcss/forms` | No form inputs beyond buttons |
| Any component library | CLAUDE.md §What NOT to Use |
| `framer-motion` | CLAUDE.md §What NOT to Use |

**Installation command:**
```bash
npm install -D tailwindcss @tailwindcss/vite
```

**Version verification (run before task):**
```bash
npm view tailwindcss version        # → 4.3.2 (latest)
npm view @tailwindcss/vite version  # → 4.3.2 (latest)
```

---

## Package Legitimacy Audit

| Package | Registry | Age | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-------------|-----------|-------------|
| tailwindcss | npm | ~8 years | github.com/tailwindlabs/tailwindcss | [OK] | Approved |
| @tailwindcss/vite | npm | ~2 years | github.com/tailwindlabs/tailwindcss | [OK] | Approved |

**Postinstall scripts:** Neither package defines a `postinstall` script. [VERIFIED: npm registry]

**Packages removed due to slopcheck [SLOP] verdict:** none

**Packages flagged as suspicious [SUS]:** none

---

## Architecture Patterns

### System Architecture Diagram

```
index.html
  └── <link> Google Fonts Roboto (CDN, weight 400+700)
  └── <script> main.tsx

main.tsx
  └── imports ./index.css  ──→  Vite CSS pipeline
  │                               └── @tailwindcss/vite plugin
  │                                     ├── reads @import "tailwindcss"
  │                                     ├── reads @theme {} → generates utility classes
  │                                     └── passes through plain CSS (.ventanilla-ticket-flash, .ventanillas-grid)
  └── renders <App />

App.tsx (runtime)
  ├── <header className="sticky top-0 z-10 bg-md-primary ...">   ← NEW top bar
  └── <div className="max-w-[1200px] mx-auto ...">              ← existing .page div
        ├── <button className="bg-md-primary-container ...">     ← Agregar turno
        ├── <section className="bg-md-primary-container rounded-xl ...">  ← queue strip
        │     └── <li className="border border-md-primary rounded-full ...">  ← chips
        └── <section className="mt-6">
              └── <div className="grid gap-4 ventanillas-grid">  ← residual class for columns
                    └── <VentanillaCard />
                          └── <p className="text-5xl font-bold text-gray-900 [+ventanilla-ticket-flash]">
```

### Recommended File Structure (unchanged — only content changes)

```
src/
├── index.css          ← REPLACE: @import + @theme + animation + grid classes
├── App.tsx            ← REWRITE classNames only; add <header> Top App Bar
├── main.tsx           ← unchanged (already imports ./index.css)
├── turnero.ts         ← unchanged (pure reducer logic)
├── useBeep.ts         ← unchanged
└── App.test.tsx       ← unchanged (must stay green)
index.html             ← ADD Google Fonts <link> in <head>
vite.config.ts         ← ADD tailwindcss() plugin (preserve vitest test config)
```

### Pattern 1: Tailwind v4 Installation in Existing Vite Config

**What:** Add `@tailwindcss/vite` plugin to existing `vite.config.ts` that already has react plugin AND vitest test config.

**When to use:** Any Vite project with both vitest and Tailwind v4.

**Critical:** Preserve the `/// <reference types="vitest/config" />` directive and the `test:` block — they are required for vitest to run with jsdom.

```typescript
// Source: tailwindcss.com/docs/installation (Vite guide) + existing vite.config.ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    globals: true,
  },
})
```

[CITED: tailwindcss.com/docs/installation]

### Pattern 2: index.css Full Replacement Structure

**What:** The complete structure of the new `index.css`. Order matters: `@import` must be first; `@theme` must be top-level (not nested); plain CSS residuals go after.

```css
/* Source: tailwindcss.com/docs/theme + 09-UI-SPEC.md */

@import "tailwindcss";

@theme {
  --color-md-primary: #1976D2;
  --color-md-primary-container: #BBDEFB;
  --color-md-on-primary: #FFFFFF;
  --color-md-on-primary-container: #1565C0;
  --color-md-error: #B3261E;
  --font-sans: 'Roboto', sans-serif;
}

body {
  margin: 0;
  background: #FFFFFF;
  font-family: 'Roboto', sans-serif;
}

/* RESIDUAL: animation — kept as plain CSS so .ventanilla-ticket-flash class name
   is preserved for App.test.tsx FEEDBACK-02 tests (D-26) */
@keyframes ticket-flash {
  from {
    background-color: rgba(25, 118, 210, 0.25);
  }
  to {
    background-color: transparent;
  }
}

.ventanilla-ticket-flash {
  animation: ticket-flash 600ms ease-out forwards;
  border-radius: 8px;
}

/* RESIDUAL: grid columns — kept as plain CSS because
   repeat(auto-fill, minmax(350px, 1fr)) is a Phase 7 display invariant (DISPLAY-01)
   and the arbitrary Tailwind class would be verbose and fragile */
.ventanillas-grid {
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
}
```

[CITED: tailwindcss.com/docs/theme + 09-UI-SPEC.md Component Contract]

### Pattern 3: @theme Color Token Naming

**What:** How CSS variable names in `@theme` become Tailwind utility classes.

The `--color-*` namespace generates utilities for all color-accepting properties:

```
--color-md-primary: #1976D2
  → bg-md-primary
  → text-md-primary
  → border-md-primary
  → ring-md-primary
  → fill-md-primary
  → (etc.)
```

The `--font-*` namespace generates font-family utilities:
```
--font-sans: 'Roboto', sans-serif
  → font-sans (overrides default Tailwind sans stack)
```

[VERIFIED: tailwindcss.com/docs/theme]

### Pattern 4: Hover Arbitrary Color in v4

**What:** Hover states with exact hex colors not in the theme.

```html
<!-- Valid in Tailwind v4 — arbitrary hex color works with hover: modifier -->
<button class="bg-md-primary hover:bg-[#1565C0]">Llamar siguiente</button>

<!-- Valid in v4 — opacity modifier with @theme color -->
<button class="border border-md-primary hover:bg-md-primary/10">Agregar ventanilla</button>
```

[CITED: tailwindcss.com/docs/adding-custom-styles]

### Pattern 5: Coexistence of Plain CSS Classes and Tailwind Utilities

**What:** A DOM element can have both Tailwind utility classes and a plain CSS class. They operate on different properties without conflict.

```jsx
// App.tsx — ventanilla ticket with flash class
<p
  key={ventanilla.currentTicket?.id ?? 'empty'}
  className={
    ventanilla.currentTicket !== null
      ? 'text-5xl font-bold text-gray-900 ventanilla-ticket-flash'
      : 'text-5xl font-bold text-gray-900'
  }
>
```

- Tailwind classes (`text-5xl font-bold text-gray-900`) set font-size, font-weight, color
- `.ventanilla-ticket-flash` sets animation + border-radius
- No property conflicts — both sets of styles apply simultaneously

**Important:** In CSS cascade layers, unlayered styles (plain CSS outside `@layer`) have higher precedence than layered styles (Tailwind utilities are in the `tailwind` cascade layer). This means `.ventanilla-ticket-flash` styles cannot be overridden by Tailwind utilities — a feature, not a bug, for animation preservation.

[CITED: tailwindcss.com/docs/adding-custom-styles + MDN CSS cascade layers]

### Anti-Patterns to Avoid

- **Migrating `.ventanilla-ticket-flash` to `@utility`:** `@utility` defines a Tailwind utility class — valid Tailwind v4 pattern for custom utilities. BUT the class name `ventanilla-ticket-flash` would no longer be queryable as a plain DOM class via `element.classList.contains()`. Actually it would still work, but there is a subtlety: `@utility` registers it as a Tailwind utility which means it enters the Tailwind cascade layer. This changes cascade priority. More importantly, the instruction from D-26 is explicit — keep it as plain CSS. Do not migrate.

- **Using `@layer utilities { .ventanilla-ticket-flash }` (v3 pattern):** This is the v3 way to add custom utilities. In v4, `@layer utilities` is ignored/deprecated. The correct v4 equivalent is `@utility`, but for the reasons above, avoid both — write the class outside any layer.

- **`@tailwind base; @tailwind components; @tailwind utilities;` (v3 import):** These three directives do NOT work in Tailwind v4. The v4 replacement is `@import "tailwindcss";`. Writing the old directives in v4 will produce no output or errors.

- **Old important modifier syntax:** `!text-5xl` (v3) does not work in v4. The v4 syntax is `text-5xl!`. Not used in this phase but note for other phases.

- **Old CSS variable arbitrary syntax:** `bg-[--my-color]` (v3) is replaced by `bg-(--my-color)` in v4. Not used in this phase (we use named tokens from `@theme` directly and hex arbitrary values), but be aware.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| MD3 color token system | Custom CSS variables in `:root` only | `@theme {}` block in Tailwind v4 | `@theme` generates utility classes (`bg-md-primary`) automatically from the variable; `:root` only creates a variable, no utility class |
| Responsive sticky header | JS scroll detection | `sticky top-0 z-10` CSS via Tailwind | CSS `position: sticky` handles this natively; no JS needed |
| 8-point spacing | Inline styles or custom spacing values | Tailwind spacing scale (`px-4`, `py-3`, `gap-4`) | Default Tailwind spacing is multiples of 4px — matches MD3's 8-point grid; direct mapping |
| Font size `22px` outside Tailwind scale | `style={{ fontSize: '22px' }}` | `text-[22px]` arbitrary value | Tailwind arbitrary values handle off-scale sizes cleanly |

**Key insight:** `@theme` is the canonical way to bridge a design system's named tokens (MD3 color names) to Tailwind's utility class API. It is strictly better than only using `:root` CSS variables.

---

## Common Pitfalls

### Pitfall 1: Breaking Vitest Config When Adding Tailwind Plugin

**What goes wrong:** Developer replaces entire `vite.config.ts` with minimal Tailwind setup, removing the `/// <reference types="vitest/config" />` directive and/or the `test:` block. `npm test` silently fails or produces "unknown config option" errors.

**Why it happens:** Tailwind's install docs show a minimal `vite.config.ts` without the vitest integration. Copying it verbatim overwrites the existing test setup.

**How to avoid:** Add only the two lines needed — the import and the plugin reference — to the existing config. Leave `test:`, `environment: 'jsdom'`, `setupFiles`, and `globals` untouched.

**Warning signs:** `npm test` errors after `vite.config.ts` edit.

### Pitfall 2: `@import` Must Come Before `@theme`

**What goes wrong:** CSS file with `@theme {}` before `@import "tailwindcss"` causes Tailwind to not recognize the `@theme` block or fails to generate utilities from it.

**Why it happens:** CSS `@import` rules must be at the top of the stylesheet (before any other rules except `@charset` and `@layer`). Tailwind's `@theme` depends on the Tailwind base being imported first.

**How to avoid:** Always start `index.css` with `@import "tailwindcss";` as the very first line.

**Warning signs:** Theme-derived utility classes like `bg-md-primary` not working; browser DevTools showing no custom properties in `:root`.

### Pitfall 3: `.ventanilla-ticket-flash` Tests Break if Class is Renamed/Removed

**What goes wrong:** Renaming `.ventanilla-ticket-flash` to `.ticket-flash` or migrating it to a Tailwind utility causes FEEDBACK-02 tests to fail with: `Expected element to have class: ventanilla-ticket-flash`.

**Why it happens:** `App.test.tsx` lines 168, 180, 192, 202 use `toHaveClass('ventanilla-ticket-flash')` directly. The test queries the exact string.

**How to avoid:** Keep the class name `ventanilla-ticket-flash` exactly as-is in both `index.css` (definition) and `App.tsx` (className string). Do not touch the `key` prop logic.

**Warning signs:** Three FEEDBACK-02 tests fail after phase.

### Pitfall 4: Hover Variant Wrapped in `@media (hover: hover)` in v4

**What goes wrong:** Hover styles don't trigger as expected on non-standard pointer devices or test environments.

**Why it happens:** Tailwind v4 wraps all `hover:` variants in `@media (hover: hover)` by default. This is correct for touch screens but may be surprising if the developer expects hover styles to apply unconditionally.

**How to avoid:** For a clinic display (mouse-driven), this is acceptable — all interactive stations use mice. No action needed. If unconditional hover were needed, use `@custom-variant hover (&:hover);` in index.css.

**Warning signs:** Hover styles don't appear on a touch device (acceptable/expected for this use case).

### Pitfall 5: Arbitrary Grid Value — Comma vs Underscore Syntax

**What goes wrong:** Writing `grid-cols-[repeat(auto-fill,_minmax(350px,_1fr))]` with underscores inside `minmax` causes the class to be malformed.

**Why it happens:** In Tailwind v4 arbitrary values, underscores represent spaces. Commas stay as commas. `minmax(350px, 1fr)` has a space after the comma — so the correct encoding is `minmax(350px,_1fr)`. But this is why the UI-SPEC recommends keeping `.ventanillas-grid` as a residual CSS class — it avoids this encoding complexity entirely.

**How to avoid:** Use approach 1 from the UI-SPEC: keep `.ventanillas-grid` CSS class in `index.css` with the plain `grid-template-columns` declaration. Apply `grid gap-4 ventanillas-grid` as the `className` on the grid div.

**Warning signs:** Grid shows single column instead of auto-fill multi-column layout.

### Pitfall 6: Default Border Color Changed in v4

**What goes wrong:** A `border` class without a color modifier (e.g., just `border`) renders with `currentColor` instead of `gray-200` (the v3 default). The "Agregar ventanilla" outlined button uses `border border-md-primary` — this is fine because it specifies the color. But any other `border` without a color class would look different from v3.

**Why it happens:** Tailwind v4 changed the default border color from `gray-200` to `currentColor`.

**How to avoid:** Always pair `border` with a color class (`border-md-primary`, `border-gray-200`, etc.). In this phase, all `border` usages are paired with color classes per the UI-SPEC mapping.

**Warning signs:** Outline buttons have wrong border color; borders look like text color.

---

## Code Examples

Verified patterns from official documentation and current project analysis:

### Complete vite.config.ts After Phase 9

```typescript
// Source: existing vite.config.ts + tailwindcss.com/docs/installation (Vite)
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    globals: true,
  },
})
```

### Complete index.html After Phase 9

```html
<!-- Source: existing index.html + 09-UI-SPEC.md + Google Fonts CDN -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Turnero</title>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### Top App Bar (new `<header>` in App.tsx)

```jsx
// Source: 09-UI-SPEC.md Component Contract + 09-CONTEXT.md D-19, D-20
<header className="sticky top-0 z-10 bg-md-primary text-white px-4 py-3">
  <h1 className="text-4xl font-normal m-0">Turnero</h1>
</header>
```

### Ventanilla card ticket paragraph with flash class

```jsx
// Source: existing App.tsx line 65-74 — className strings updated, key prop and logic UNCHANGED
<p
  key={ventanilla.currentTicket?.id ?? 'empty'}
  className={
    ventanilla.currentTicket !== null
      ? 'text-5xl font-bold text-gray-900 ventanilla-ticket-flash'
      : 'text-5xl font-bold text-gray-900'
  }
>
  {ventanilla.currentTicket === null
    ? 'sin turno'
    : `Turno ${ventanilla.currentTicket.number}`}
</p>
```

### Ventanillas grid div (residual class approach)

```jsx
// Source: 09-UI-SPEC.md — approach 1 recommended (residual CSS class for grid columns)
<div className="grid gap-4 ventanillas-grid">
  {/* ... */}
</div>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@tailwind base; @tailwind components; @tailwind utilities;` | `@import "tailwindcss";` | Tailwind v4.0 (stable 2025) | Single import replaces three directives; simpler CSS entry point |
| `tailwind.config.js` (JS config file) | `@theme {}` in CSS | Tailwind v4.0 | CSS-first configuration; no JS config file needed for basic customization |
| `@layer utilities { .custom { ... } }` | `@utility custom { ... }` | Tailwind v4.0 | New `@utility` directive for custom utilities; `@layer utilities` deprecated |
| `bg-[--css-var]` (variable in arbitrary value) | `bg-(--css-var)` | Tailwind v4.0 | Parentheses shorthand auto-wraps in `var()`; square bracket syntax also still valid |
| `!text-5xl` (important modifier prefix) | `text-5xl!` (important modifier suffix) | Tailwind v4.0 | Modifier moves to end of class name |

**Deprecated/outdated:**
- Three-directive `@tailwind` import pattern: replaced by `@import "tailwindcss"` in v4
- `tailwind.config.js` for color/font customization: replaced by `@theme {}` in CSS
- `@layer utilities` for custom utilities: replaced by `@utility` directive

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `@tailwindcss/vite@4.3.2` is compatible with `vite@8.0.12` (project's actual Vite version, not v7 as CLAUDE.md states) | Standard Stack | Install succeeds but plugin may not wire up correctly — check `npm run dev` output for CSS processing errors |
| A2 | `hover:bg-md-primary/10` opacity modifier syntax works with custom `@theme` colors in v4 | Pattern 4 | Button hover state falls back to solid color without opacity — cosmetic only, not functional |

**A1 rationale:** CLAUDE.md states Vite 7 but `package.json` shows `vite@8.0.12`. The `@tailwindcss/vite` package supports Vite 5+. Vite 8 should be compatible based on the Vite major version policy, but this was not explicitly verified against official Tailwind-Vite 8 compatibility docs. [ASSUMED]

**A2 rationale:** The opacity modifier `/10` is a documented Tailwind v4 feature. When combined with a custom `@theme` `--color-*` variable, Tailwind generates `background-color: color-mix(in oklab, var(--color-md-primary) 10%, transparent)` or equivalent. The mechanism is documented for built-in colors; extension to custom `@theme` colors is implied by the CSS variable architecture. [ASSUMED]

---

## Open Questions (RESOLVED)

1. **`@tailwindcss/vite` with Vite 8** — RESOLVED
   - Resolution: `@tailwindcss/vite` package description states "Vite plugin" with compatibility for Vite 5+. Vite 8 is within the supported range. Plan 09-01 Task 1 includes a `npm run dev` smoke test as the first Wave 1 action to confirm no CSS pipeline errors.

2. **`box-border` global not needed?** — RESOLVED
   - Resolution: Keep `box-border` on the `.page` div className as specified in UI-SPEC. Redundant but harmless with Tailwind v4 preflight. Explicit is better than implicit for a clinic display where CSS regressions are hard to spot.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | npm install | ✓ | v22.23.0 | — |
| npm | package installation | ✓ | (with Node 22) | — |
| Vite | dev server + build | ✓ | 8.0.12 (via package.json) | — |
| Internet (fonts.googleapis.com) | Google Fonts CDN | unknown | — | System `sans-serif` fallback; app functional without Roboto |
| tailwindcss | CSS compilation | ✗ (not installed) | — | — |
| @tailwindcss/vite | Vite CSS integration | ✗ (not installed) | — | — |

**Missing dependencies with no fallback:**
- `tailwindcss` and `@tailwindcss/vite` — must be installed in Wave 0 before any CSS changes. Install command: `npm install -D tailwindcss @tailwindcss/vite`

**Missing dependencies with fallback:**
- Google Fonts (Roboto) — system `sans-serif` if network unavailable. App remains functional.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.10 |
| Config file | `vite.config.ts` (embedded `test:` block) |
| Quick run command | `npm test` |
| Full suite command | `npm test` (all 33 tests, ~3 seconds) |
| Test setup | `src/setupTests.ts` — mocks AudioContext, imports jest-dom |

### Phase Requirements → Test Map

Phase 9 adds no new requirements. All v1 requirements are already validated. The test suite serves as a regression harness:

| Test Suite | Behavior Verified | Test Type | Automated Command | File Exists? |
|------------|------------------|-----------|-------------------|-------------|
| FEEDBACK-02 (3 tests) | `.ventanilla-ticket-flash` class present in DOM when ticket non-null; absent when null | unit | `npm test -- --reporter=verbose` | ✅ src/App.test.tsx |
| WINDOW-03, WINDOW-02 (3 tests) | ventanilla display, remove guard | unit | `npm test` | ✅ |
| CALL-01, CALL-02 (2 tests) | call next dispatch, empty queue warning | unit | `npm test` | ✅ |
| WR-01 (1 test) | warning reset on external state change | unit | `npm test` | ✅ |
| FEEDBACK-01 (2 tests) | beep on successful call | unit | `npm test` | ✅ |
| PRIVACY-01 (2 tests) | no patient data in DOM | unit | `npm test` | ✅ |
| PERSIST-01 (5 tests) | localStorage persistence | unit | `npm test` | ✅ |
| turnero.test.ts (14 tests) | reducer pure logic | unit | `npm test` | ✅ |

**Baseline:** 33 tests, 2 test files, all passing as of 2026-07-10 (verified by running `npm test`).

### Sampling Rate
- **Per task commit:** `npm test` — full suite (~3 seconds; always fast)
- **Per wave merge:** `npm test` — full suite
- **Phase gate:** All 33 tests green before `/gsd:verify-work`

### Wave 0 Gaps
None — existing test infrastructure covers all phase requirements. Wave 0 work is installation only (`npm install -D tailwindcss @tailwindcss/vite`), not test scaffolding.

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No auth in this app |
| V3 Session Management | no | No sessions |
| V4 Access Control | no | No access control |
| V5 Input Validation | no | Phase 9 adds no new input paths |
| V6 Cryptography | no | No crypto |

### Known Threat Patterns for CDN Fonts

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Compromised Google Fonts CDN | Tampering (HTML/CSS injection via malicious stylesheet) | Self-host fonts if security is critical; for this clinic display use case, Google Fonts CDN is acceptable |
| Third-party script injection | Tampering | Google Fonts `<link>` loads only CSS (no JS); safe for this use case |

**Security posture unchanged from prior phases.** Phase 9 adds one external CDN request (Google Fonts CSS) and one devDependency build tool. Neither introduces a runtime attack surface in the browser.

---

## Project Constraints (from CLAUDE.md)

Directives extracted from `CLAUDE.md` that apply to Phase 9:

| Directive | Implication for Phase 9 |
|-----------|------------------------|
| Tech stack: React + TypeScript + Vite | Tailwind v4 integrates via Vite plugin — compliant |
| No backend | No change — Phase 9 has no backend concerns |
| Single page/view | Top App Bar added to the single view — compliant |
| No auth | No change |
| `useState`/`useReducer` for state — no external state libs | No state changes in Phase 9 — compliant |
| No `framer-motion` | Animations use CSS `@keyframes` — compliant |
| No component libraries | No shadcn, no MUI — compliant |
| No class components | All existing code uses function components — unchanged |
| `@tailwindcss/vite` is the user-approved exception to "no extra dependencies" | Tailwind v4 install is explicitly approved by D-23 in CONTEXT.md |
| GSD workflow enforcement | Phase is being executed through GSD — compliant |

---

## Sources

### Primary (HIGH confidence)
- `tailwindcss.com/docs/theme` — `@theme` block syntax, namespace-to-utility mapping, top-level definition requirement
- `tailwindcss.com/docs/installation` — Vite installation steps (`npm install`, vite.config.ts changes, `@import "tailwindcss"`)
- `tailwindcss.com/docs/upgrade-guide` — v3 → v4 breaking changes (import syntax, hover media query, important modifier, CSS var arbitrary syntax)
- `tailwindcss.com/docs/adding-custom-styles` — arbitrary values, `[#hex]` syntax, coexistence with custom CSS, `@layer` behavior
- `tailwindcss.com/docs/grid-template-columns` — `grid-cols-[...]` arbitrary value syntax, underscore encoding

### Secondary (MEDIUM confidence)
- npm registry (verified via `npm view`): `tailwindcss@4.3.2` and `@tailwindcss/vite@4.3.2`, both published 2026-07-09, both from `github.com/tailwindlabs/tailwindcss`
- `src/App.test.tsx` (direct read): FEEDBACK-02 test structure confirmed — 3 tests call `toHaveClass('ventanilla-ticket-flash')`
- `package.json` (direct read): actual Vite version is 8.0.12 (not v7 as CLAUDE.md states); TypeScript 6.0.2

### Tertiary (LOW confidence)
- `@tailwindcss/vite` compatibility with Vite 8 — inferred from Vite plugin API stability; not explicitly verified [ASSUMED: A1]
- `hover:bg-md-primary/10` opacity modifier with custom `@theme` colors — inferred from CSS variable architecture [ASSUMED: A2]

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — official npm registry, slopcheck OK, tailwindlabs GitHub confirmed
- Architecture: HIGH — all patterns verified against official Tailwind v4 docs + direct codebase read
- Pitfalls: HIGH — v4 breaking changes sourced from official upgrade guide; test invariant confirmed by reading App.test.tsx directly
- Assumptions: 2 items tagged [ASSUMED] — both low-risk (Vite 8 compat, opacity modifier behavior)

**Research date:** 2026-07-10
**Valid until:** 2026-08-10 (Tailwind v4 is in active development; check for new minor versions before planning execution)
