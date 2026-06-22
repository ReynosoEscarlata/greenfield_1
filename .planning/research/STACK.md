# Stack Research

**Domain:** Small no-backend React SPA (clinic waiting-room queue/ticket display, "turnero")
**Researched:** 2026-06-21
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | ^19.2 | UI rendering | Current stable major version (19.2.7 as of June 2026). Native, mature TypeScript support; functional components + hooks are the standard pattern for small SPAs. User already specified React. |
| TypeScript | ^5.7+ (whatever `create-vite` react-ts template pins) | Type safety | Catches state-shape bugs early — important here since the queue/ventanilla model has several interdependent pieces of state (queue array, per-window current ticket, window count). User-specified. |
| Vite | ^7.x (scaffolded via `create-vite@latest`) | Build tool / dev server | De facto standard for new React SPAs in 2025-2026: instant HMR, zero-config TS support, tiny prod bundles. `npm create vite@latest` (create-vite 9.x) scaffolds Vite 7 + the `react-ts` template out of the box. No need to hand-roll webpack/CRA (CRA is deprecated). |

### Supporting Libraries

**None are required.** This app's entire feature set (shared queue, configurable windows, sound on call, transition animation, localStorage persistence) is implementable with React's built-in hooks plus native browser APIs. Adding state-management, animation, or sound libraries would contradict the project's explicit goal of a small, dependency-light learning exercise.

| Library | Version | Purpose | When to Use (NOT here) |
|---------|---------|---------|------------------------|
| — | — | — | No supporting libraries recommended for this scope. See "What NOT to Use" below for libraries to skip and native alternatives. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint (+ `typescript-eslint`) | Linting | Ships pre-configured in the Vite `react-ts` template (current templates default to ESLint 9 flat config + Oxlint rules in some recent scaffolds). Keep default config; don't add extra plugins for a project this size. |
| Prettier (optional) | Formatting | Optional — only add if the user wants consistent formatting; not load-bearing for a solo learning exercise. |
| Vite dev server | Local dev | `npm run dev`; no proxy/backend config needed since there is no API. |

## Installation

```bash
# Scaffold project (creates Vite 7 + React 19 + TypeScript template)
npm create vite@latest turnero -- --template react-ts
cd turnero
npm install

# No additional runtime dependencies needed.
# (Optional, only if user wants stricter formatting:)
npm install -D prettier
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `useState`/`useReducer` in a single top-level component (or one custom hook) | Zustand | If the app grows beyond one view and state needs to be read/written from many unrelated component trees (prop drilling becomes painful). Not the case here — single screen, single queue. |
| Hand-written `useLocalStorage` hook (~15-20 lines) | `usehooks-ts` package | If the team wants a battle-tested hook with SSR-safety and cross-tab sync handled for them, or plans to reuse many other hooks (`useDebounce`, `useMediaQuery`, etc.) across a larger app. This project has no SSR, no cross-tab sync requirement (explicitly out of scope), and needs only one hook — writing it is less overhead than auditing a dependency. |
| Native `HTMLAudioElement` (`new Audio(url).play()` or an `<audio>` ref) | `use-sound` (Josh Comeau) or `howler.js` | If you need volume control, audio sprites, multiple overlapping sounds, or playback-rate control. A single "beep on call" effect doesn't need any of that; `use-sound` adds ~1kb + a ~9kb async Howler chunk for no real benefit here. |
| CSS transitions/animations (`transition`, `@keyframes`) triggered by a state/key change, optionally with React's `<CSSTransition>`-free "remount via `key` prop" trick | `framer-motion` / `motion` (the renamed Motion library) or `react-transition-group` | Reach for Motion if you need gesture-driven, physics-based, or orchestrated multi-element animations. Reach for `react-transition-group` if you need robust enter/exit lifecycle hooks across many mount/unmount cases. A single "ticket number changes, fade/slide briefly" effect is textbook CSS-transition territory. |
| Vite + `react-ts` template | Next.js / Remix | If the app needed routing, SSR, or multiple pages/routes. Explicitly out of scope here (single page, no backend). |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Redux / Redux Toolkit | Massive ceremony (actions, reducers, slices, store config) for a single page with ~3 pieces of state. Pure overkill for a learning exercise meant to stay small. | `useState`/`useReducer` colocated in the root `App` component or one small custom hook (`useTurnero`). |
| Zustand / Jotai / Recoil | Solves prop-drilling and cross-tree state sharing — problems this single-screen app does not have. Adds a dependency and a new mental model for no payoff. | React's built-in `useState`/`useReducer` + passing props/callbacks down (the component tree is shallow: App → QueueList / Ventanilla[]). |
| `framer-motion` / Motion library | ~30-50kb+ for spring physics and gesture support the app doesn't need; a simple "ticket changed" flash/slide doesn't need a physics engine. | Plain CSS `transition`/`@keyframes`, triggered by toggling a class or changing a `key` to force re-mount. |
| `howler.js` / `use-sound` | Built for managing many simultaneous sound effects, sprites, and fine playback control. Here it's one short beep, fired occasionally. | Native `Audio` object: `const audio = new Audio('/beep.mp3'); audio.play();` (re-create or reset `currentTime = 0` before each `.play()` to allow rapid re-triggering). |
| Create React App (CRA) | Officially deprecated/unmaintained; slow dev server (Webpack-based), no longer recommended by the React team. | Vite (`npm create vite@latest`). |
| `localforage` / IndexedDB wrappers | Built for storing large amounts of structured/binary data beyond `localStorage`'s ~5-10MB string limit. This app stores a small JSON blob (queue array + window state) — well within `localStorage` limits. | `localStorage.setItem`/`getItem` with `JSON.stringify`/`JSON.parse`, wrapped in a tiny custom hook. |
| React Router | The project is explicitly single-page/single-view (no routing requirement, stated as out of scope). | None needed — conditionally render within one component tree if any view-switching is ever needed. |
| Class components / legacy lifecycle methods | Outdated pattern; all current React docs, templates, and tooling assume function components + hooks. | Function components with hooks (`useState`, `useEffect`, `useReducer`). |

## Stack Patterns by Variant

**If the user later wants the queue to sync across browser tabs/devices (currently out of scope):**
- Add the `storage` event listener (native, no library) to react to `localStorage` changes from other tabs, or introduce a backend with WebSockets/SSE.
- Because: `localStorage` alone is single-browser/single-tab-authoritative; true multi-device sync requires a server, which is explicitly excluded from this milestone.

**If the window/ventanilla count or queue logic grows noticeably more complex (e.g., per-window skip/priority rules):**
- Migrate from a flat `useState` to `useReducer` with a typed action union (`{ type: 'ADD_TICKET' } | { type: 'CALL_NEXT'; windowId: string } | ...`).
- Because: `useReducer` keeps complex multi-field state transitions predictable and testable without adding an external state library.

**If sound needs to work reliably on iOS Safari (autoplay restrictions):**
- Ensure the `Audio.play()` call happens synchronously inside a user-initiated click handler (the "Llamar siguiente" button click) — this satisfies browser autoplay policies without any library.
- Because: mobile browsers block autoplay outside direct user gestures; library wrappers don't bypass this, the trigger context matters.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Vite 7.x | Node.js 20.19+ or 22.12+ | Verified via WebSearch (create-vite docs): Vite 7 dropped support for older Node 18/20 minor versions; ensure local Node meets this floor before scaffolding. |
| React 19.2.x | TypeScript 5.x + `@types/react` ^19.2 | `@types/react` 19.2.17 (June 2026) matches React 19.2.x; the `react-ts` Vite template pins compatible versions automatically — avoid manually mixing React 19 with `@types/react` 18.x. |
| `create-vite` react-ts template | ESLint 9 flat config | Recent template revisions ship ESLint 9 (flat config) plus optional Oxlint integration; if customizing lint rules, use the flat-config format, not the legacy `.eslintrc`. |

## Sources

- WebSearch, verified against multiple results — `npm create vite@latest` / create-vite 9.x scaffolds Vite 7, Node 20.19+/22.12+ required. MEDIUM-HIGH confidence (consistent across vite.dev guide reference and npm package description).
- WebSearch — react.dev blog references confirm React 19.2.7 (June 1, 2026) as current stable; `@types/react` 19.2.17 (June 2026) tracks it. MEDIUM confidence (WebSearch-derived, not Context7-verified directly, but sourced from react.dev official blog links).
- WebSearch, multiple sources (Medium/Josh W. Comeau `use-sound` docs, MDN Web Audio best practices) — native `HTMLAudioElement` recommended over libraries for simple one-off sound effects; libraries add 1-10kb for features (volume/sprites/rate control) unneeded here. HIGH confidence (MDN is authoritative; consistent with library authors' own scoping guidance).
- WebSearch, multiple sources (LogRocket, Syncfusion, Motion docs) — CSS transitions / `react-transition-group` recommended for simple enter/exit effects; Motion/Framer Motion explicitly called out as "overkill for simple transitions" in current 2026 comparisons. MEDIUM-HIGH confidence (multiple independent sources agree).
- WebSearch, multiple sources (freeCodeCamp, Zustand GitHub README, Medium) — consensus that `useState`/built-in hooks suffice for small apps without prop-drilling pain; Zustand positioned as the next step only when complexity grows. HIGH confidence (aligns with official Zustand README's own positioning and is uncontested across sources).
- WebSearch — usehooks-ts vs hand-written `useLocalStorage` hook tradeoffs (SSR-safety, cross-tab sync vs minimal footprint). MEDIUM confidence (blog/community sources, not official React docs) — decision here favors hand-written hook because this project has no SSR and no cross-tab sync requirement (explicitly out of scope per PROJECT.md).
- `C:\Users\Richi\OneDrive\Desktop\Challenges claude\challenge_2\greenfield_1\.planning\PROJECT.md` — source of project constraints (no backend, no auth, single page, localStorage persistence, configurable ventanillas, sound + animation on call).

---
*Stack research for: small no-backend React+TS+Vite queue display SPA*
*Researched: 2026-06-21*
