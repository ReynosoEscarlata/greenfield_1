# Deferred Items — 260714-sd4

Out-of-scope issues discovered during execution, not fixed per scope-boundary rule.

## `npm run build` fails: `src/setupTests.ts(28,1): error TS2304: Cannot find name 'global'`

- **File:** `src/setupTests.ts` (not in this plan's `files_modified`)
- **Introduced by:** commit `acd489d` (chore(05-01): create useBeep stub and extend setupTests with AudioContext mock), pre-existing before this quick task started.
- **Impact:** `tsc -b` fails during `npm run build`, even though `vitest run` (the full test suite, 39/39 tests) passes cleanly. Likely missing `"types": ["node"]` (or similar) in the relevant `tsconfig` for test files, so the ambient `global` Node type isn't visible to the type-checker.
- **Not fixed here:** unrelated to CLEAR_TICKET / Eliminar turno feature; touching `setupTests.ts` or `tsconfig` is out of scope for this quick task's files_modified list.
- **Suggested follow-up:** a small quick task or phase touching `tsconfig.app.json` / `tsconfig.test.json` (whichever governs `src/setupTests.ts`) to add `"types": ["node"]` or replace `global.AudioContext = ...` with `globalThis.AudioContext = ...`.
