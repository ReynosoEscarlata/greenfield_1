<!-- generated-by: gsd-doc-writer -->
# Getting Started

This guide gets you from a fresh clone to a running Turnero de Sala de Espera app.

## Prerequisites

- **Node.js**: `v20.19+` or `v22.12+` (required by Vite 8; verified locally with `v22.23.0`). No `.nvmrc` or `.node-version` file is pinned in this repo — use any Node version satisfying the range above.
- **npm** (bundled with Node.js) — the project uses `package-lock.json`, so `npm` is the expected package manager (no `yarn.lock` or `pnpm-lock.yaml` present).
- No database, external service, or environment variables are required — the app has no backend and no `.env` file.

## Installation Steps

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd greenfield_1
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## First Run

Start the Vite dev server:

```bash
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`) in your browser. You should see the Turnero screen with an **Agregar turno** button, an **Agregar ventanilla** button, the shared queue, and a grid of ventanillas.

To verify everything works end-to-end without opening a browser, run the test suite instead:

```bash
npm run test
```

## Common Setup Issues

- **Wrong Node version** — Vite 8 requires Node `20.19+` or `22.12+`. If `npm install` or `npm run dev` fails with an engine or syntax error, check your version with `node -v` and upgrade if needed.
- **Port `5173` already in use** — Vite will automatically try the next available port (`5173`, `5174`, ...) and print the actual URL in the terminal; use that URL rather than assuming `5173`.
- **Stale state after code changes to the reducer** — since all state is persisted to `localStorage` under the key `turnero-v1`, changes to the shape of stored data (e.g., while developing `src/turnero.ts`) can leave incompatible state in `localStorage`. Clear it via your browser devtools (Application/Storage tab) or `localStorage.removeItem('turnero-v1')` in the console if the app behaves unexpectedly after a pull.

## Next Steps

- See `docs/ARCHITECTURE.md` for how the queue/ventanilla state model and component structure work.
- See `docs/CONFIGURATION.md` for details on persisted state and any configurable values.
- See the root `README.md` for the full list of npm scripts and project structure.
