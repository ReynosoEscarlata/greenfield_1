<!-- generated-by: gsd-doc-writer -->
# Development Guide

This guide covers local development setup, available scripts, code style, and contribution
workflow for the Turnero de Sala de Espera project.

## Local Setup

The project has no backend and no environment variables — setup is just installing
dependencies and starting the dev server.

1. Clone the repository:
   ```bash
   git clone https://github.com/ReynosoEscarlata/greenfield_1.git
   cd greenfield_1
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open the printed local URL (typically `http://localhost:5173`) in your browser. Vite's Hot
   Module Replacement (HMR) will reload the app automatically as you edit files in `src/`.

Requires Node.js `v22.23.0` or compatible (Vite 8 requires Node 20.19+ or 22.12+).

## Build Commands

All scripts are defined in `package.json`:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Type-check the project (`tsc -b`) and build a production bundle to `dist/` |
| `npm run preview` | Serve the production build from `dist/` locally, for a final sanity check |
| `npm run lint` | Run ESLint over the project |
| `npm run test` | Run the test suite once with Vitest |

## Code Style

**ESLint** — configured via `eslint.config.js` (flat config format). The config extends:
- `@eslint/js` recommended rules
- `typescript-eslint` recommended rules
- `eslint-plugin-react-hooks` recommended rules (enforces Rules of Hooks)
- `eslint-plugin-react-refresh` Vite-specific rules (ensures components are Fast-Refresh safe)

Run it with:
```bash
npm run lint
```

No Prettier or Biome configuration is present in this repository — formatting is not currently
automated. Match the existing code style (2-space indentation, single quotes, no semicolons) when
editing files.

There is no `.editorconfig` file in this repository.

## Branch Conventions

No branch naming convention is documented in this repository (no `CONTRIBUTING.md` or PR
template is present). The default branch is `master`.

## PR Process

No `.github/PULL_REQUEST_TEMPLATE.md` or `CONTRIBUTING.md` exists in this repository, and no
CI workflow is configured to run automatically on pull requests. When submitting changes:

- Run `npm run lint` and `npm run test` locally before opening a pull request — there is no CI
  gate enforcing this yet.
- Run `npm run build` to confirm the project still type-checks and builds.
- Keep pull requests focused on a single change (one feature or fix at a time).
- Describe what changed and why in the PR description, since no template exists to prompt this.
