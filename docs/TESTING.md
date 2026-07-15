<!-- generated-by: gsd-doc-writer -->
# Testing

This document describes how tests are organized and run in the Turnero de Sala de Espera project.

## Test framework and setup

Tests run on [Vitest](https://vitest.dev) `^4.1.10` with [`@testing-library/react`](https://testing-library.com/docs/react-testing-library/intro/) `^16.3.2` and [`@testing-library/jest-dom`](https://github.com/testing-library/jest-dom) `^6.9.1` for DOM assertions. The `jsdom` package (`^29.1.1`) provides the simulated browser environment.

Configuration lives in `vite.config.ts`:

```ts
test: {
  environment: 'jsdom',
  setupFiles: './src/setupTests.ts',
  globals: true,
},
```

- `environment: 'jsdom'` — tests run against a simulated DOM, needed since components render with React Testing Library.
- `globals: true` — Vitest globals (`describe`, `it`, `expect`, `vi`, etc.) are available without explicit imports.
- `setupFiles: './src/setupTests.ts'` — runs once before the test suite. It imports `@testing-library/jest-dom` matchers and installs a mock `AudioContext` (`global.AudioContext`), since jsdom does not implement the Web Audio API used by `useBeep`.

No manual setup is required beyond `npm install` — the test environment is fully configured in the repo.

## Running tests

Run the full suite once (used in CI-style checks):

```bash
npm run test
```

This runs `vitest run`, which is the `test` script defined in `package.json`.

There is currently no `test:watch` or `test:coverage` script defined in `package.json`. To run Vitest directly in watch mode or against a single file, invoke the Vitest CLI:

```bash
# Watch mode
npx vitest

# Run a single test file
npx vitest run src/turnero.test.ts
```

## Writing new tests

Test files sit alongside the source file they cover, using the `*.test.ts` (logic) or `*.test.tsx` (components) suffix — there is no separate `tests/` or `__tests__/` directory:

| Source file | Test file |
|---|---|
| `src/turnero.ts` | `src/turnero.test.ts` |
| `src/App.tsx` | `src/App.test.tsx` |

Conventions observed in the existing suite:

- Tests are grouped with `describe` blocks named after a requirement ID (e.g., `describe('QUEUE-01: Independent ticket counter', ...)`, `describe('WINDOW-02: Remove with guard', ...)`), followed by individual `it` cases referencing sub-IDs (e.g., `QUEUE-01-A`, `QUEUE-01-B`). Follow this pattern when adding tests tied to a specific requirement or bug fix.
- Reducer/logic tests (`src/turnero.test.ts`) import `queueReducer` and `initialState` directly from `src/turnero.ts` and assert on the returned state, including referential equality checks for no-op actions (e.g., `expect(state).toBe(before)`).
- Component tests (`src/App.test.tsx`) use `render`, `screen`, `fireEvent`, and `act` from `@testing-library/react`. External effects are mocked with `vi.mock(...)` — see the `./useBeep` mock at the top of `src/App.test.tsx` for the pattern to follow when a component test needs to isolate a hook with side effects (audio, timers, etc.).
- Timer-based behavior (e.g., auto-dismissing warnings) uses `vi.useFakeTimers()` / `vi.useRealTimers()` in `beforeEach`/`afterEach`, combined with `act(() => vi.advanceTimersByTime(ms))`.
- Tests touching persistence (`PERSIST-01` in `src/App.test.tsx`) read and write `localStorage` directly and call `localStorage.clear()` in `beforeEach` to avoid cross-test state leakage.

There is no shared test-helper file beyond `src/setupTests.ts` (global setup only, no reusable render/query helpers at this time).

## Coverage requirements

No coverage threshold is configured. There is no `coverage` block in `vite.config.ts`, no `.nycrc`, and no `c8` configuration in `package.json`.

## CI integration

No CI/CD workflow is configured in this repository (`.github/workflows/` does not exist). Tests are currently run manually via `npm run test`.
