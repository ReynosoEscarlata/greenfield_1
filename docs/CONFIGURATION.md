<!-- generated-by: gsd-doc-writer -->
# Configuration

Turnero de Sala de Espera is a fully client-side application: there is no backend, no
authentication, and no server-side configuration to manage. This document covers the two
places configuration-like behavior exists in this project — build-time tooling config and
client-side (localStorage) state persistence — plus the environment variables required
(none) and how per-environment behavior is handled.

## Environment variables

This project does not read any environment variables at runtime or at build time. There is
no `.env`, `.env.example`, or `import.meta.env.*` usage anywhere in `src/` or the Vite
config.

| Variable | Required | Default | Description |
|----------|----------|---------|--------------|
| — | — | — | No environment variables are used by this project. |

If environment variables are introduced in the future, Vite's standard convention applies:
any variable prefixed with `VITE_` in a `.env` file at the project root is exposed to
client code via `import.meta.env.VITE_*`. See the
[Vite env variables guide](https://vite.dev/guide/env-and-mode) for details.
<!-- VERIFY: Vite env variables guide URL may change; confirm against the Vite version pinned in package.json (^8.0.12) -->

## Config file format

There are no application-level config files (JSON/YAML/TOML) read at runtime. Configuration
that exists in this repository is all build/tooling configuration, consumed only during
`npm run dev` / `npm run build` / `npm run lint`, never at runtime by the deployed app:

| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite build/dev-server config. Registers the `@vitejs/plugin-react` and `@tailwindcss/vite` plugins, and configures Vitest (`test.environment: 'jsdom'`, `test.setupFiles: './src/setupTests.ts'`, `test.globals: true`). |
| `tsconfig.json` | Root TypeScript config; references `tsconfig.app.json` and `tsconfig.node.json` as project references. |
| `tsconfig.app.json` | TypeScript compiler options for application source (`src/`). |
| `tsconfig.node.json` | TypeScript compiler options for Node-context files (e.g. `vite.config.ts`). |
| `eslint.config.js` | ESLint flat config (ESLint 10) — lints `src/` using `typescript-eslint`, `eslint-plugin-react-hooks`, and `eslint-plugin-react-refresh`. |
| `package.json` | npm scripts (`dev`, `build`, `lint`, `preview`, `test`) and dependency versions. |

Example of the current Vite config (`vite.config.ts`):

```ts
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

## Required vs optional settings

There are no required runtime settings — the app has no startup validation, no required
environment variables, and no external service credentials. It runs immediately after
`npm install` + `npm run dev` with zero configuration.

The only "setting" the app depends on at runtime is the `localStorage` key it reads on
mount (see below), and that has a safe fallback if missing or invalid.

## Client-side state persistence (localStorage)

Instead of environment-based configuration, this app persists its entire queue/ventanilla
state to the browser's `localStorage` under a single key:

| Key | Shape | Written by | Read by |
|-----|-------|-------------|---------|
| `turnero-v1` | JSON-serialized `QueueState` (`{ queue: Ticket[], nextNumber: number, ventanillas: Ventanilla[], nextWindowNumber: number }`, defined in `src/turnero.ts`) | `src/App.tsx` — a `useEffect` that runs on every state change | `src/App.tsx` — `loadFromStorage()`, invoked once as the `useReducer` lazy initializer |

Behavior:
- On mount, `loadFromStorage()` (`src/App.tsx`) attempts `JSON.parse(localStorage.getItem('turnero-v1') ?? '')`. If the key is absent or the stored value is not valid JSON, it falls back to `initialState` from `src/turnero.ts` (empty queue, no ventanillas, counters starting at 1).
- On every state change, the current `QueueState` is serialized with `JSON.stringify` and written back to `turnero-v1`.
- There is no schema versioning beyond the `-v1` suffix in the key name; a future incompatible state-shape change would need a new key (e.g. `turnero-v2`) or a migration step.
- No other localStorage keys are used elsewhere in the codebase.

To reset the app to a clean state during development or testing, clear this key from the
browser (DevTools → Application → Local Storage → delete `turnero-v1`) or run
`localStorage.removeItem('turnero-v1')` in the browser console.

## Defaults

| Setting | Default | Set in |
|---------|---------|--------|
| Initial queue | `[]` (empty) | `initialState` in `src/turnero.ts` |
| Initial ticket counter (`nextNumber`) | `1` | `initialState` in `src/turnero.ts` |
| Initial ventanillas | `[]` (none configured) | `initialState` in `src/turnero.ts` |
| Initial ventanilla counter (`nextWindowNumber`) | `1` | `initialState` in `src/turnero.ts` |
| Call-next beep tone | 880Hz sine wave, 0.3 gain, 0.2s exponential decay | `src/useBeep.ts` |

Ventanillas (call windows) are not pre-configured in code — they are added and removed at
runtime by the user via the `ADD_WINDOW` / `REMOVE_WINDOW` actions in the reducer
(`src/turnero.ts`), and the resulting count is what gets persisted to `localStorage`.

## Per-environment overrides

There is no `NODE_ENV`-based branching, no `.env.development` / `.env.production` files, and
no deployment-platform-specific configuration in this codebase. The app behaves identically
in every environment: `npm run dev` (Vite dev server) and `npm run build` + `npm run preview`
(production build served locally) both use the same code path with no conditional logic.

Because there is no backend and no `has_deploy_config` detected in this project, there is
currently no deployment target requiring environment-specific secrets or URLs.
<!-- VERIFY: if a deployment target (e.g. static hosting) is added later, confirm whether that platform requires any platform-specific environment variables -->
