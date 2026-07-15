---
phase: 9
slug: rediseno-ux-ui-material-design-flat-design
status: closed
threats_open: 0
asvs_level: default
created: 2026-07-15
---

# Security Audit Log

## Phase 9 — Rediseño UX/UI Material Design / Flat Design

**Audit date:** 2026-07-14
**Scope:** Plans 09-01 (Tailwind v4 infra), 09-02 (CSS foundation), 09-03 (App.tsx className rewrite)
**ASVS Level:** default

### Threat Register Verification

| Threat ID | Category | Disposition | Verification | Result |
|-----------|----------|-------------|---------------|--------|
| T-09-01 | Tampering | accept | npm package origin (tailwindcss, @tailwindcss/vite) | CLOSED (accepted risk, logged below) |
| T-09-02 | Tampering | accept | Google Fonts CDN `<link>` in index.html | CLOSED (accepted risk, logged below) |
| T-09-SC | Tampering | mitigate | `git show df1fc60 -- package.json` shows exactly two new devDependencies added: `@tailwindcss/vite@^4.3.2` and `tailwindcss@^4.3.2`. No later commit in Phase 9 (09-02, 09-03) touches package.json (`git log --oneline -- package.json` shows only df1fc60 within Phase 9). package.json in working tree confirms both pins present and no other unexplained devDependencies were introduced. | **CLOSED** — evidence: `package.json:19,31` (`"@tailwindcss/vite": "^4.3.2"`, `"tailwindcss": "^4.3.2"`); commit df1fc60 diff shows no other package additions |
| T-09-03 | Tampering | accept | CSS cascade — plain CSS vs Tailwind layers | CLOSED (accepted risk, logged below) |
| T-09-04 | Tampering | mitigate | Grep for `ventanilla-ticket-flash` string in App.tsx truthy className ternary branch, plus `npm test` FEEDBACK-02 suite (3 tests) asserting `toHaveClass('ventanilla-ticket-flash')` | **CLOSED** — evidence: `src/App.tsx:70` — `'text-5xl font-bold text-gray-900 ventanilla-ticket-flash'` present in the `ventanilla.currentTicket !== null` branch of the className ternary (lines 68-72); `src/App.test.tsx:167-217` FEEDBACK-02 suite (3 tests) passes — confirmed via `npm test` run: 39/39 passed, 0 failed |
| T-09-05 | Information Disclosure | accept | PRIVACY-01 regression suite in App.test.tsx | CLOSED (accepted risk, logged below) |

### Accepted Risks Log

- **T-09-01** — `tailwindcss` and `@tailwindcss/vite` npm packages accepted as trusted devDependency installs. Both are published under the official `tailwindlabs` npm org, verified via slopcheck `[OK]` per `09-RESEARCH.md §Package Legitimacy Audit`, no `postinstall` scripts present. Residual risk: standard npm supply-chain trust (same as any devDependency in this project). Owner: project maintainer.
- **T-09-02** — Google Fonts CDN `<link rel="stylesheet">` in `index.html` accepted. Loads CSS only (no JS execution channel), Google Fonts is a widely-trusted CDN, and the clinic waiting-room display runs in a controlled environment (D-02: no public/untrusted network exposure). Residual risk: CDN availability/tracking via font request (Google can observe request timing/IP); accepted as non-sensitive for a public waiting-room display with no patient data in the request.
- **T-09-03** — Unlayered plain CSS (`.ventanilla-ticket-flash`, `.ventanillas-grid` in `src/index.css`) intentionally has higher cascade priority than Tailwind's `@layer`-scoped utilities. This is a deliberate design choice (RESEARCH.md Pattern 5) so animation/grid-layout styles cannot be silently overridden by utility classes. Not a vulnerability — accepted as intended cascade behavior.
- **T-09-05** — Phase 9 introduces no new render paths or data sources; only `className` strings were changed across all three plans. Existing PRIVACY-01 automated tests (`src/App.test.tsx` PRIVACY-01 suite) continue to run in the 39-test suite and assert no `data-testid="patient-name"` or patient-identifying text is rendered. Any future regression introducing patient data into the DOM will be caught by this existing suite.

### Unregistered Flags

None. All three plan SUMMARY.md files (`09-01`, `09-02`, `09-03`) report `## Threat Flags: None` — no new attack surface (network endpoints, auth paths, file access patterns, schema changes) was introduced during implementation beyond what is already covered by the Phase 9 threat register.

### Verification Commands Run

```
git show df1fc60 -- package.json   # confirms exactly 2 new devDependencies
git log --oneline -- package.json vite.config.ts   # confirms no drift after df1fc60 in Phase 9
npm test                            # 39 passed, 0 failed (2 test files)
```
