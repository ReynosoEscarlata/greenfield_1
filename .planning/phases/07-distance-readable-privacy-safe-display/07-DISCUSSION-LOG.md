# Phase 7: Distance-Readable & Privacy-Safe Display - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-08
**Phase:** 07-distance-readable-privacy-safe-display
**Areas discussed:** Tamaño del número de turno, Adaptación del layout, Cola de turnos en espera, Alcance de PRIVACY-01

---

## Tamaño del número de turno

| Option | Description | Selected |
|--------|-------------|----------|
| 48px / bold | Legible a 3m con esfuerzo. Mínimo seguro. Mantiene tarjetas compactas. | ✓ |
| 64px / bold | Punto de equilibrio. Muy legible a 3m. | |
| 96px / bold | Pantalla de sala de espera real. El número domina la tarjeta. | |
| Tú decidí (72px ajustable) | Punto de partida ajustable visualmente. | |

**User's choice:** 48px / bold
**Notes:** Tamaño conservador pero suficiente para 3m.

### Seguimiento: ¿La etiqueta "Ventanilla N" también crece?

| Option | Description | Selected |
|--------|-------------|----------|
| Crece proporcionalmente (20–22px) | Jerarquía visual clara: etiqueta mediana + número grande. | ✓ |
| Queda en 16px | Solo el número escala. | |

**User's choice:** Crece proporcionalmente (20–22px)

---

## Adaptación del layout

| Option | Description | Selected |
|--------|-------------|----------|
| Solo escala el texto, tarjetas quedan como están | Mínimo cambio, máxima estabilidad. | |
| Tarjetas más anchas y centradas | Aspecto más de "display público". | |
| Menos tarjetas por fila (máx 2–3) | Fuerza tamaño mínimo por tarjeta para garantizar legibilidad. | ✓ |

**User's choice:** Menos tarjetas por fila (máx 2–3 por fila aunque haya más ventanillas)

### Seguimiento: ¿El número va centrado?

| Option | Description | Selected |
|--------|-------------|----------|
| Centrado | Aspecto más de pantalla pública. Ojo visual claro desde lejos. | ✓ |
| Izquierda (como ahora) | Mínimo cambio de layout. | |

**User's choice:** Centrado

---

## Cola de turnos en espera

| Option | Description | Selected |
|--------|-------------|----------|
| Sí, también escalan (20–24px) | Los pacientes pueden ver su número desde lejos. | ✓ |
| No, quedan en 16px | La cola es info secundaria para el operador. | |

**User's choice:** Sí, también escalan (ej. 20–24px)

---

## Alcance de PRIVACY-01

| Option | Description | Selected |
|--------|-------------|----------|
| Auditar el código y documentar | Verificar formalmente que no hay datos personales; asentar en VERIFICATION.md. | ✓ |
| Agregar guard visual explícito en UI | Indicador de "modo público" u otros cambios activos de UI. | |

**User's choice:** Auditar el código y documentar que no hay datos personales.
**Notes:** El código actual solo renderiza `ticket.number` (entero). No hay inputs de nombre ni datos identificatorios en ningún path.

---

## Claude's Discretion

Ningún área fue delegada a Claude — el usuario tomó todas las decisiones.

## Deferred Ideas

Ninguna — la discusión se mantuvo dentro del scope de la fase.
