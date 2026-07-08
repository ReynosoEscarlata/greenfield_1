# Phase 7: Distance-Readable & Privacy-Safe Display - Context

**Gathered:** 2026-07-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Aumentar la legibilidad del display a distancia de sala de espera real: escalar tipografía de números de turno a 48px/bold, reestructurar el layout de ventanillas a máximo 2–3 columnas con números centrados, escalar la queue strip a 20–24px. Verificar formalmente que PRIVACY-01 está cubierto por diseño (no hay campos de nombre en ningún lado). Sin nuevas librerías — solo cambios de CSS y layout.

</domain>

<decisions>
## Implementation Decisions

### Tamaño de tipografía
- **D-01:** `.ventanilla-ticket` (número actual, "Turno N") → 48px / font-weight: bold (700). Legible a 3m en 5 segundos.
- **D-02:** `.ventanilla-label` ("Ventanilla 1") → ~20–22px. Crece proporcionalmente; es info secundaria pero debe ser legible desde la ventanilla.
- **D-03:** Queue strip (números de turnos en espera) → 20–24px. Los pacientes pueden ver si su número está próximo desde lejos.

### Layout de ventanillas
- **D-04:** Máximo 2–3 tarjetas de ventanilla por fila. Si hay más ventanillas configuradas, el grid las envuelve a una nueva fila manteniendo ese ancho mínimo por tarjeta. No se comprimen para encajar todas en una fila.
- **D-05:** El número de turno va centrado (text-align: center) dentro de la tarjeta. La etiqueta "Ventanilla N" también se centra para mantener jerarquía visual coherente.

### Privacidad (PRIVACY-01)
- **D-06:** La fase es auditoría y documentación — no se requieren cambios de UI activos. El código actual nunca renderiza nombres ni datos identificatorios; la pantalla solo muestra números de turno. Verificar por inspección de código y asentar en VERIFICATION.md.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` §DISPLAY-01, §PRIVACY-01 — criterios formales de la fase
- `.planning/ROADMAP.md` §Phase 7 — success criteria (legible a 3m en 5s; alto contraste; sin datos de paciente)

### Archivos fuente a leer antes de tocar
- `src/index.css` — todos los selectores CSS existentes; cambios van aquí (.ventanilla-ticket, .ventanilla-label, .ventanilla-card, .queue-strip, grid layout)
- `src/App.tsx` — VentanillaCard y App component; verificar que no hay renderings de datos personales en ningún path

### Restricciones de stack
- `CLAUDE.md` §What NOT to Use — sin librerías de animación ni de UI; cambios de CSS puro
- `CLAUDE.md` §Technology Stack — React 19 + TypeScript + Vite; sin dependencias nuevas

</canonical_refs>

<code_context>
## Existing Code Insights

### Estado actual de tipografía (src/index.css)
- `.ventanilla-ticket`: 16px / 400 — target principal del aumento
- `.ventanilla-label`: 16px / 600 — crece a 20–22px
- `.queue-strip` items: 16px / 400 — crece a 20–24px
- `.page-title`: 28px / 600 — más grande que cualquier otro elemento actualmente

### Layout actual de ventanillas
- Las tarjetas probablemente usan flex-wrap o grid auto-fill — limitar a `repeat(auto-fill, minmax(Xpx, 1fr))` o `max-width` para forzar 2–3 columnas

### Sin datos de paciente
- `src/App.tsx`: el reducer solo maneja `Ticket { id: number; number: number }` — sin campos de nombre
- No hay inputs de texto libre en el JSX que puedan capturar datos identificatorios
- La queue strip y VentanillaCard solo renderizan `ticket.number` (un entero)

</code_context>

<specifics>
## Specific Ideas

- El usuario eligió 48px como tamaño de número — conservador pero suficiente para 3m. El planner puede usar ese valor exacto.
- "Máx 2–3 por fila" es la restricción; si hay solo 1 ventanilla puede ocupar más ancho.
- PRIVACY-01 es verificación de código, no feature nueva — puede ir en el mismo plan de CSS o en un plan separado corto.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 7-Distance-Readable & Privacy-Safe Display*
*Context gathered: 2026-07-08*
