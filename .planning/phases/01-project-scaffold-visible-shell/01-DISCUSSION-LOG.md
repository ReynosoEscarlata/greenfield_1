# Phase 1: Project Scaffold & Visible Shell - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-21
**Phase:** 1-project-scaffold-visible-shell
**Areas discussed:** Layout del shell, Estilo visual, Identidad/título

---

## Layout del shell

| Option | Description | Selected |
|--------|-------------|----------|
| Cola arriba, ventanillas abajo en grilla | Franja superior con la cola, grilla de tarjetas por ventanilla debajo | ✓ |
| Cola a la izquierda, ventanillas a la derecha | Layout en dos columnas | |
| Vos decidí | Dejar el layout a discreción de Claude | |

**User's choice:** Cola arriba, ventanillas abajo en grilla
**Notes:** Matches the conventional waiting-room "now serving" board layout.

---

## Estilo visual

| Option | Description | Selected |
|--------|-------------|----------|
| Un solo archivo CSS global | Todo el estilo en index.css/App.css | ✓ |
| CSS Modules por componente | Un .module.css por componente | |

**User's choice:** Un solo archivo CSS global
**Notes:** Consistent with research/STACK.md's zero-dependency, minimal-tooling recommendation.

---

## Identidad/título

| Option | Description | Selected |
|--------|-------------|----------|
| Sí, título "Turnero" desde ya | Branding visible desde la Fase 1 | ✓ |
| Genérica por ahora | Sin texto/branding específico | |

**User's choice:** Sí, título "Turnero" desde ya
**Notes:** No added cost, gives later phases real visual context.

---

## Claude's Discretion

- Exact folder/file structure (flat `src/` vs feature folders)
- Exact wording/styling of placeholder regions beyond the layout/identity decisions above

## Deferred Ideas

None — discussion stayed within phase scope.
