# Phase 5: Call Sound Feedback - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-07
**Phase:** 05-call-sound-feedback
**Areas discussed:** Fuente del sonido

---

## Fuente del sonido

### ¿Cómo generás el beep?

| Option | Description | Selected |
|--------|-------------|----------|
| Web Audio API | Oscilador sintético en JavaScript — sin archivos, sin assets en /public. Tono limpio, reproducible instantáneamente, funciona offline. | ✓ |
| Archivo .mp3 en /public | `new Audio('/beep.mp3').play()` — más familiar, requiere tener o generar el archivo. | |

**User's choice:** Web Audio API  
**Notes:** Sin assets externos, tono generado en código.

---

### ¿Dónde vive la lógica del beep?

| Option | Description | Selected |
|--------|-------------|----------|
| Custom hook `useBeep` | `src/useBeep.ts` expone `play()`. Separa la lógica de audio del componente, facilita testear/mockear. | ✓ |
| Inline en VentanillaCard | Función definida directamente dentro del componente, sin hook aparte. | |

**User's choice:** Custom hook `useBeep`  
**Notes:** Consistente con el patrón de extracción ya establecido en el proyecto (`src/turnero.ts`).

---

### ¿Cuándo debe sonar el beep?

| Option | Description | Selected |
|--------|-------------|----------|
| Solo al desencolar un turno | Beep solo si `queue.length > 0` al momento del click. Si cola vacía, no suena — el mensaje "No hay turnos en espera" ya da feedback. | ✓ |
| Siempre al hacer click | Beep en cada click de "Llamar siguiente", haya o no turno en cola. | |

**User's choice:** Solo al desencolar un turno  
**Notes:** Más coherente con la experiencia real de un turnero — el beep significa "turno llamado", no "botón presionado".

---

### ¿Cómo sabe VentanillaCard si la cola está vacía?

| Option | Description | Selected |
|--------|-------------|----------|
| Nueva prop `queueLength` | App.tsx pasa `queueLength={state.queue.length}`. Simple, tipado, sigue el patrón de props existente. | ✓ |
| `onCallNext` devuelve boolean | Callback retorna `true` si se desencol ó, `false` si no. Requiere cambiar la firma del callback y potencialmente el reducer. | |

**User's choice:** Nueva prop `queueLength`  
**Notes:** Menor superficie de cambio — el callback `onCallNext` mantiene su firma actual.

---

### ¿Qué características tiene el beep sintético?

| Option | Description | Selected |
|--------|-------------|----------|
| Tono corto y agudo (880 Hz, 200ms) | Pitido clásico de turnero: frecuencia alta, duración breve, envelope de decaimiento rápido. | ✓ |
| Tono más grave y largo (440 Hz, 400ms) | Beep más bajo y sostenido, más audible en ambientes ruidosos pero más presencia. | |
| Vos decidís | Claude elige los valores concretos. | |

**User's choice:** 880 Hz, 200ms  
**Notes:** Tono agudo y corto — classic clinic beeper feel.

---

### ¿Cómo cubren los tests el useBeep?

| Option | Description | Selected |
|--------|-------------|----------|
| Mock global de `AudioContext` en `setupTests.ts` | Mock en el archivo de setup global existente. Tests verifican que AudioContext fue/no fue invocado según `queue.length`. | ✓ |
| Solo tests del condicional | Spy sobre `useBeep`'s `play()`, sin mock de AudioContext. | |

**User's choice:** Mock global de `AudioContext` en `setupTests.ts`  
**Notes:** Consistente con el patrón TDD del proyecto; `setupTests.ts` ya existe.

---

## Claude's Discretion

- Organización interna de `useBeep.ts` (si usar `useCallback`, si reutilizar AudioContext entre llamadas o crear uno nuevo por beep)
- Nombre exacto de los mocks en `vi.fn()` dentro del mock de AudioContext
- CSS/estilo: ninguno necesario para esta fase

## Deferred Ideas

- Animación de transición visual → Phase 6 (FEEDBACK-02, ya en roadmap)
- Persistencia en localStorage → Phase 8 (PERSIST-01, ya en roadmap)
- Configuración del tono por el usuario → fuera de scope completo del proyecto
- Múltiples tonos según tipo de llamado → no requerido, no en requirements
