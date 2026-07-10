# Phase 9: Rediseño UX/UI con estilo Material Design y Flat Design - Context

**Gathered:** 2026-07-09
**Status:** Ready for planning

<domain>
## Phase Boundary

Rediseño visual completo de la app usando Material Design 3 (Material You) + Tailwind CSS v4. Sin nueva funcionalidad. Los cambios son:

1. **Instalación de Tailwind CSS v4** via `@tailwindcss/vite` (devDependency)
2. **Reemplazo de index.css** con variables `@theme` de colores MD3 y clases de animación residuales
3. **Reescritura de JSX** en `App.tsx` para aplicar clases Tailwind en lugar de las clases CSS custom actuales
4. **Top App Bar** MD3 sticky con fondo primario azul
5. **Tests de comportamiento sin cambios** — `ventanilla-ticket-flash` se preserva como clase CSS para que los tests de Phase 6 sigan pasando

No se agregan rutas, componentes nuevos, ni lógica de estado. El look es MD3/Material You + Flat Design, modo claro únicamente.

</domain>

<decisions>
## Implementation Decisions

### Material Design generation
- **D-01:** Usar MD3 / Material You (la generación actual, 2021–hoy) — superficies tonales, esquinas redondeadas generosas, variantes de botón tonal/filled/outlined. La generación más compatible con Flat Design.
- **D-02:** Solo modo claro (light mode). Sin `@media (prefers-color-scheme: dark)`. La pantalla de sala de espera opera en ambiente controlado.
- **D-03:** Elevación de tarjetas mediante **surface tones** (fondo tintado con primary-container), no con box-shadow pronunciadas. Approach nativo de MD3.

### Color primario y paleta
- **D-04:** Color primario: `#1976D2` (Azul médico / MD Blue 700)
- **D-05:** Fondo general de página: blanco puro `#FFFFFF`
- **D-06:** Primary container (fondo de tarjetas y queue strip): `#BBDEFB` (blue-100 de Tailwind es una aproximación válida; o definir `--color-md-primary-container: #BBDEFB` exacto en `@theme`)
- **D-07:** Color de error/warning: Rojo MD3 `#B3261E` — reemplaza el `#c0392b` actual
- **D-08:** Color de la animación ticket-flash: azul primario con opacidad — cambiar de `#fbbf24` (ámbar) a `rgba(25, 118, 210, 0.25)` para coherencia con la paleta MD3

### Jerarquía de botones
- **D-09:** "Llamar siguiente" (CTA principal por tarjeta) = **Filled**: `background: #1976D2`, `color: #FFFFFF`, `border-radius: 9999px` (pill)
- **D-10:** "Agregar turno" (acción global) = **Filled Tonal**: `background: #BBDEFB (~primary-container)`, `color: #1565C0 (~on-primary-container)`, `border-radius: 9999px`
- **D-11:** "Agregar ventanilla" (acción administrativa) = **Outlined**: `border: 1.5px solid #1976D2`, `background: transparent`, `color: #1976D2`, `border-radius: 9999px`
- **D-12:** Botón "×" de quitar ventanilla = **Icon button MD3**: transparente en reposo, fondo circular suave (`rounded-full`) al hover. Tamaño y posición similares a los actuales.
- **D-13:** Chips de turno en cola = **Outlined chips MD3**: `border: 1.5px solid #1976D2`, `color: #1976D2`, `background: #FFFFFF`, `border-radius: 9999px`
- **D-14:** `border-radius` de tarjetas ventanilla = **12px** (medium MD3 card radius)

### Tipografía
- **D-15:** Título principal 'Turnero' = Display Small MD3: `font-size: 36px`, `font-weight: 400` — en Tailwind: `text-4xl font-normal`
- **D-16:** Títulos de sección ('Cola', 'Ventanillas') = Title Large MD3: `font-size: 22px`, `font-weight: 500` — en Tailwind: `text-[22px] font-medium`
- **D-17:** Número de turno actual (por ventanilla) = mantener `48px / font-weight: 700` (text-5xl font-bold) — decisión de Phase 7, confirmada
- **D-18:** Fuente: Roboto via Google Fonts (agregar `<link>` en `index.html`). La font-family en `@theme` o en el `body`: `'Roboto', sans-serif`

### Header / Top App Bar
- **D-19:** Agregar un **Top App Bar MD3** al tope de la página: fondo `#1976D2`, texto/título `#FFFFFF`
- **D-20:** El top bar es **sticky** (`sticky top-0 z-10`) — útil cuando hay muchas ventanillas y se hace scroll
- **D-21:** El botón "Agregar turno" permanece **debajo** del top bar, en el body de la página (no es una trailing action de la barra)

### Sección Cola (queue strip)
- **D-22:** La sección Cola adopta estilo **surface variant MD3**: fondo `#BBDEFB` (primary-container), `border-radius: 12px`. Se convierte en una card diferenciada del fondo blanco.

### Implementación con Tailwind CSS v4
- **D-23:** Instalar **Tailwind CSS v4** como devDependency: `npm install -D tailwindcss @tailwindcss/vite`. Configurar el plugin en `vite.config.ts` (`plugins: [react(), tailwindcss()]`).
- **D-24:** Los colores MD3 personalizados se definen en `index.css` via `@theme`: `--color-md-primary: #1976D2`, `--color-md-primary-container: #BBDEFB`, `--color-md-on-primary: #FFFFFF`, `--color-md-error: #B3261E`, etc. Tailwind genera clases `bg-md-primary`, `text-md-primary`, etc. automáticamente.
- **D-25:** El CSS existente de `index.css` se **reemplaza casi completamente** con el bloque `@import "tailwindcss"` + `@theme {}` + las clases residuales necesarias.
- **D-26:** Las clases de animación (`@keyframes ticket-flash` + `.ventanilla-ticket-flash`) se **mantienen en CSS puro** (no se migran a `@theme` de Tailwind) para que los tests de Phase 6 que buscan `ventanilla-ticket-flash` en el DOM sigan pasando sin cambios. El `@keyframes` actualiza el color de `#fbbf24` a `rgba(25, 118, 210, 0.25)` (D-08).
- **D-27:** El JSX de `App.tsx` se reescribe para usar clases Tailwind en lugar de las clases custom actuales (`.add-ticket-button`, `.queue-strip`, `.ventanilla-card`, etc.). El atributo `className` de cada elemento recibe clases Tailwind.
- **D-28:** Los tests funcionales existentes (`App.test.tsx`, `turnero.test.ts`) **no se modifican**. Solo se actualiza código de presentación, no de comportamiento.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Source files a modificar
- `src/App.tsx` — componente raíz y `VentanillaCard`; todas las `className` se reescriben con Tailwind. Leer antes de tocar.
- `src/index.css` — CSS actual completo (~182 líneas); será reemplazado en su mayor parte. Leer para entender qué clases están en uso.
- `index.html` — agregar `<link>` de Google Fonts para Roboto
- `vite.config.ts` — agregar el plugin `@tailwindcss/vite`

### Tests que NO deben romperse
- `src/App.test.tsx` — busca `ventanilla-ticket-flash` explícitamente en los tests de Phase 6 (describe block `FEEDBACK-02`). La clase debe permanecer en el DOM tras el rediseño.
- `src/turnero.test.ts` — tests de reducer puro; no toca clases CSS, no se ve afectado.

### Decisiones de fases anteriores que aplican
- `.planning/phases/06-call-transition-animation/06-CONTEXT.md` §D-06/D-07 — el flash usa `key` prop + clase condicional. El planner debe respetar el mecanismo (solo cambiar el color en `@keyframes`, no la lógica de aplicación de la clase).
- `.planning/phases/07-distance-readable-privacy-safe-display/07-CONTEXT.md` §D-01 — número de turno a 48px confirmado; esta fase no lo reduce.
- `.planning/REQUIREMENTS.md` — todos los requirements v1 ya están validados; esta fase no agrega ni modifica requirements.

### Stack constraints
- `CLAUDE.md` §Conventions / What NOT to Use — se confirma que Tailwind v4 es la excepción elegida por el usuario; el principio de "sin dependencias extra" se aplica a dependencias runtime, no a devDependencies de build.
- `CLAUDE.md` §Technology Stack — Vite 7 + React 19 + TypeScript; Tailwind CSS v4 usa `@tailwindcss/vite` plugin (compatible con Vite 7).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `VentanillaCard` en `src/App.tsx:6–89` — componente ya extractado; solo cambiar `className` strings. Props y lógica sin cambios.
- `loadFromStorage()` y `App` function en `src/App.tsx:91–160` — sin cambios en esta fase; solo JSX className.
- `src/useBeep.ts` — sin cambios; no tiene clases CSS.
- `src/turnero.ts` — sin cambios; lógica pura.

### Clases CSS actuales a reemplazar con Tailwind
| Clase actual | Dónde se usa | Reemplazo Tailwind aproximado |
|---|---|---|
| `.page` | div raíz | `max-w-[1200px] mx-auto px-8 py-8 box-border` |
| `.page-title` | h1 | Eliminado — pasa a `<header>` Top App Bar |
| `.queue-strip` | section Cola | `bg-md-primary-container rounded-xl p-6 mb-6` |
| `.add-ticket-button` | botón Agregar turno | `bg-md-primary-container text-[#1565C0] rounded-full px-6 py-3 text-base font-medium` |
| `.add-window-button` | botón Agregar ventanilla | `border border-md-primary text-md-primary rounded-full px-6 py-3 text-base font-medium bg-transparent` |
| `.ventanilla-card` | div tarjeta | `bg-md-primary-container rounded-xl p-4 text-center relative` |
| `.ventanilla-label` | h3 ventanilla | `text-[22px] font-medium text-gray-800 mb-1` |
| `.ventanilla-ticket` | p número turno | `text-5xl font-bold text-gray-900` |
| `.call-next-button` | botón Llamar siguiente | `bg-md-primary text-white rounded-full px-6 py-3 text-base font-medium w-full mt-2` |
| `.ticket-chip` | li chip cola | `border border-md-primary text-md-primary rounded-full px-4 py-2 text-xl font-normal bg-white` |
| `.ventanilla-warning` | p advertencias | `text-[13px] text-md-error mt-1.5` |
| `.ventanilla-remove` | button × | `absolute top-2 right-2 bg-transparent border-none rounded-full w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100` |
| `.ventanilla-ticket-flash` | animación flash | **MANTENER EN CSS PURO** — no migrar a Tailwind |

### Integration Points
- `vite.config.ts`: agregar `import tailwindcss from '@tailwindcss/vite'` y plugin
- `index.html`: agregar Google Fonts Roboto link
- `index.css`: reemplazar contenido con `@import "tailwindcss"` + `@theme {}` + `@keyframes ticket-flash` + `.ventanilla-ticket-flash`
- `App.tsx`: reemplazar todas las `className` strings; agregar elemento `<header>` Top App Bar antes del `<div className="page">`

</code_context>

<specifics>
## Specific Ideas

- Color primario exacto: `#1976D2` (no el `blue-700` de Tailwind por defecto que es `#1D4ED8` — definir en `@theme` con el valor exacto)
- Primary container exacto: `#BBDEFB` (o derivar con Tailwind `blue-100` = `#DBEAFE` — verificar cuál queda más auténtico a MD3; definir en `@theme` para control exacto)
- Top App Bar: elemento `<header>` al tope del DOM, fuera del `.page` container, sticky con `bg-md-primary text-white px-4 py-3 text-4xl font-normal sticky top-0 z-10`
- Animación flash actualizada: `from { background-color: rgba(25, 118, 210, 0.25); } to { background-color: transparent; }` — misma duración 600ms ease-out
- Fuente Roboto: `<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">` en `<head>` de `index.html`
- El contenedor de ventanillas grid mantiene `repeat(auto-fill, minmax(350px, 1fr))` — la restricción de Phase 7 de max 3 tarjetas/fila se mantiene con el mismo `minmax`

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within the visual redesign scope.

</deferred>

---

*Phase: 9-Rediseño UX/UI con estilo Material Design y Flat Design*
*Context gathered: 2026-07-09*
