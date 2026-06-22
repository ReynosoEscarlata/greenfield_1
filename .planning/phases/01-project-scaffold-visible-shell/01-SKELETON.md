# Walking Skeleton — Turnero de Sala de Espera

**Phase:** 1
**Generated:** 2026-06-21

## Capability Proven End-to-End

A developer can run `npm run dev` and see the Turnero waiting-room shell — title plus queue and ventanillas placeholder regions — render in the browser, and run `npm run build` to type-check and bundle it cleanly. This exercises the full client-only stack (Vite dev server → React render → TypeScript type-check → production bundle) with zero feature logic.

> Note: This project is client-only by design (no backend, no DB, no routing per CLAUDE.md). The "thinnest end-to-end slice" is therefore: project boots → type-checks → builds → renders the real placeholder shell layout in a browser. There is no server, database, or auth tier to traverse.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | React 19 + TypeScript, scaffolded via `create-vite` `react-ts` template | Locked by user/CLAUDE.md; standard for small SPAs; native first-class TS support |
| Build tool | Vite 8 (Rolldown/Oxc internals) | What the live `create-vite` template produces (RESEARCH.md verified Vite 8, superseding STACK.md's stale "Vite 7"); instant HMR, `tsc -b && vite build` as the type+bundle gate |
| Linter | Oxlint (template default) | Live template ships Oxlint, not ESLint (RESEARCH.md Pitfall 2) — kept as-is, zero extra setup, matches "no extra dependencies" |
| Data layer | None — in-client state only (localStorage in Phase 8) | No backend per CLAUDE.md; persistence deferred to Phase 8 via a hand-written `useLocalStorage` hook |
| State management | React built-in hooks (`useState`/`useReducer`), no external store | Single-screen app; Redux/Zustand are overkill (CLAUDE.md "What NOT to Use"). Reducer arrives in Phase 2 |
| Auth | None | No users/permissions in scope (CLAUDE.md) |
| Routing | None — single page/view | Explicitly out of scope; no React Router |
| Styling | Single global CSS file (`src/index.css`), plain CSS Grid/Flexbox, system font stack | D-02 locked; no CSS framework/Modules; `App.css` consolidated away to keep one global stylesheet |
| Deployment target | Local dev (`npm run dev`) / local production preview (`npm run build` + `npm run preview`) | Client-only static app; no hosting tier in scope this milestone |
| Directory layout | Flat scaffolded `src/` (App.tsx, main.tsx, index.css) | Claude's discretion (CONTEXT.md); no feature folders for a single static page — future components added flat under `src/` |
| Node runtime | Node `^20.19.0 || >=22.12.0` (target 22.12+ LTS) | Vite 8 engine requirement; local v21.7.3 is unsupported and must be switched first (RESEARCH.md Pitfall 1) |

## Stack Touched in Phase 1

- [x] Project scaffold (framework, build, lint — no test runner yet; Vitest deferred to Phase 2 when real logic exists)
- [ ] Routing — N/A (single page, no routing in project scope)
- [ ] Database — N/A (client-only, no DB ever; localStorage persistence in Phase 8)
- [x] UI — static shell rendered (title + queue strip + ventanillas grid placeholders); first interactive element ("Agregar turno") arrives Phase 2
- [x] Deployment — runs on local dev server (`npm run dev`); production bundle verified via `npm run build`

> The standard skeleton checklist assumes a server/DB stack. For this client-only, no-routing project, the equivalent "full slice" is: scaffold + render a real page + a working dev/build loop — all checked above. DB/routing items are permanently N/A for this project's scope, not deferred.

## Out of Scope (Deferred to Later Slices)

- Queue logic — adding/numbering tickets (Phase 2)
- Queue display list of waiting tickets (Phase 2)
- Configurable ventanillas, add/remove, current-ticket + empty state (Phase 3)
- "Llamar siguiente" atomic dequeue (Phase 4)
- Call sound feedback (Phase 5)
- Call transition animation (Phase 6)
- Distance-readable typography + privacy guarantees (Phase 7)
- localStorage persistence + corrupted-data recovery (Phase 8)
- Any state, `useState`, buttons, or event handlers (no interactivity in Phase 1 — pure static shell)
- Test runner (Vitest) — introduced Phase 2 when the queue reducer adds real logic worth unit-testing
- Backend, API, auth, routing, cross-tab sync — out of scope for the entire v1 milestone

## Subsequent Slice Plan

Each later phase adds one vertical user-facing slice on top of this skeleton without altering its architectural decisions (React+TS+Vite, client-only, single page, single global CSS):

- Phase 2: User adds a ticket ("Agregar turno") and sees it appear in the ordered waiting queue (introduces reducer + Vitest)
- Phase 3: User configures ventanillas (add/remove with active-ticket guard) and each shows current-ticket or "sin turno"
- Phase 4: User presses "Llamar siguiente" to atomically dequeue the next ticket into a ventanilla (Core Value complete)
- Phase 5: User hears a synchronous beep when a call takes a ticket
- Phase 6: User sees a scoped transition animation when a ventanilla's current ticket changes
- Phase 7: Ticket numbers become distance-readable (large/high-contrast) and the display stays privacy-safe (numbers only)
- Phase 8: Queue + ventanilla state persists across reloads via localStorage with defensive recovery
