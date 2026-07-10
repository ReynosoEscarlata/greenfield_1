# Phase 5: Call Sound Feedback - Context

**Gathered:** 2026-07-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Agregar un beep sintético que se reproduce cuando "Llamar siguiente" despacha exitosamente un turno (FEEDBACK-01). El sonido debe dispararse de forma síncrona dentro del click handler — no en un `useEffect` ni en recarga de página. Si la cola está vacía al presionar el botón, el beep NO suena (solo el mensaje "No hay turnos en espera" ya provisto por Phase 4).

Animación de transición visual (FEEDBACK-02) → Phase 6. Persistencia en localStorage (PERSIST-01) → Phase 8. Ambos explícitamente fuera de scope aquí.

</domain>

<decisions>
## Implementation Decisions

### Fuente del Sonido
- **D-01:** Usar Web Audio API con un oscilador sintético — sin archivos de audio, sin assets en `/public`. Un par de líneas en el click handler generan el tono en tiempo real.
- **D-02:** Características del beep: frecuencia 880 Hz (La5), duración 200ms, con envelope de decaimiento exponencial (para que corte limpio, no suene abrupto). Volumen moderado (`gain` ~0.3).

### Condición de Reproducción
- **D-03:** El beep suena solo cuando hay un turno en la cola para desencolar (`queueLength > 0`). Si la cola estaba vacía al hacer click, no suena — el feedback ya viene del mensaje "No hay turnos en espera" (Phase 4 D-05). Esto es coherente con la experiencia real de un turnero.

### Ubicación de la Lógica de Audio
- **D-04:** La lógica del beep vive en un custom hook `useBeep` en `src/useBeep.ts`. El hook expone una función `play()`. VentanillaCard lo invoca en su click handler, condicionado por `queueLength > 0`.
- **D-05:** La condición `queueLength > 0` se evalúa en VentanillaCard usando una nueva prop `queueLength: number` pasada desde App.tsx (`queueLength={state.queue.length}`). Esto mantiene la lógica de decisión colocada en el componente que hace el click, sin cambiar la firma de `onCallNext`.

### API de VentanillaCard
- **D-06:** Nueva prop `queueLength: number` agregada a `VentanillaCard` — siguiendo el patrón `Readonly<{...}>` del proyecto (SonarLint S6759). En el click handler: `if (queueLength > 0) playBeep(); onCallNext(ventanilla.id);` — el beep se llama antes de `onCallNext` para garantizar sincronía dentro del gesto del usuario.

### Manejo de Errores de AudioContext
- **D-07:** `useBeep` wrappea la construcción y reproducción en `try/catch` silencioso. Si el browser bloquea AudioContext (contextos de autoplay muy restrictivos, embeds), el click sigue funcionando sin errores visibles — el llamado de turno procede igualmente. No se muestra ningún mensaje al usuario sobre el fallo de audio.

### Test Coverage
- **D-08:** Mock global de `AudioContext` en `src/setupTests.ts` (ya existe el archivo). El mock implementa los métodos mínimos necesarios (`createOscillator`, `createGain`, `destination`, `currentTime`). Los tests de integración en `App.test.tsx` verifican:
  - Beep se llama cuando `queue.length > 0` antes del click (AudioContext instanciado)
  - Beep NO se llama cuando la cola está vacía (AudioContext no instanciado)
- Tests unitarios del reducer: no se requieren cambios al reducer para esta fase (el reducer ya funciona correctamente con CALL_NEXT de Phase 4).
- TDD: fase Red (tests failing) committeada antes de la implementación, fase Green después — siguiendo el patrón del proyecto.

### Claude's Discretion
- Organización interna de `useBeep.ts` (si usar `useCallback`, si guardar el AudioContext entre llamadas o crear uno nuevo por beep).
- CSS/estilo: ninguno necesario para esta fase.
- Nombre exacto de los `vi.fn()` en el mock de AudioContext dentro de setupTests.ts.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requisitos del proyecto
- `.planning/REQUIREMENTS.md` — FEEDBACK-01 requirement text (fase 5 scope)
- `.planning/PROJECT.md` — Core Value statement; Out of Scope list; restricción "sin backend"
- `.planning/ROADMAP.md` — Phase 5 success criteria y dependencia sobre Phase 4

### Estado actual del código (executor MUST read antes de modificar)
- `src/App.tsx` — VentanillaCard component actual; patrón `Readonly<{...}>` de props; cómo se pasan props desde App
- `src/turnero.ts` — QueueState shape actual; `state.queue` array (para saber cómo acceder a `queue.length`)
- `src/setupTests.ts` — Archivo de setup existente donde se agregará el mock global de AudioContext
- `src/App.test.tsx` — Estructura de tests de integración existente (render, screen, fireEvent pattern, describe/it/expect)
- `src/turnero.test.ts` — Estructura de tests unitarios del reducer (para confirmar que no se requieren cambios)
- `src/index.css` — CSS existente para referencia (esta fase no agrega estilos, pero se puede confirmar)

### Fase previa — contexto de Phase 4 (patrones a extender)
- `.planning/phases/04-call-next-atomic-dequeue/04-CONTEXT.md` — Props API de VentanillaCard (onCallNext, Readonly pattern), showWarning pattern, D-06/D-07/D-08 que esta fase extiende

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `VentanillaCard` (`src/App.tsx`) — se extiende con `queueLength: number` prop nueva. Ya tiene el click handler de `onCallNext` donde se inserta la llamada a `playBeep()`.
- `src/setupTests.ts` — ya existe; es el lugar correcto para el mock global de `AudioContext`.
- `src/App.test.tsx` — ya tiene el patrón de tests de integración con `render`, `screen`, `fireEvent`; se extienden los describe blocks existentes.

### Established Patterns
- **`Readonly<{...}>` props:** VentanillaCard usa props tipadas como `Readonly<{...}>` (SonarLint S6759) — mantener para la prop `queueLength`.
- **TDD Red/Green:** Fase Red (tests failing) committeada antes de la implementación, fase Green después.
- **`try/catch` silencioso para APIs del browser:** Patrón ya establecido en el proyecto para guardar errores sin interrumpir el flujo del usuario.
- **Custom hooks en `src/`:** Patrón validado por `useReducer` extraído en `src/turnero.ts`; `useBeep` sigue la misma lógica de separación.

### Integration Points
- `App.tsx` → `VentanillaCard`: agregar `queueLength={state.queue.length}` a cada instancia de VentanillaCard.
- `VentanillaCard` click handler: insertar `if (queueLength > 0) playBeep();` antes de `onCallNext(ventanilla.id)`.
- `src/setupTests.ts`: agregar `global.AudioContext = vi.fn().mockImplementation(...)`.

</code_context>

<specifics>
## Specific Ideas

- Beep exactamente: 880 Hz, 200ms, gain inicial 0.3 con decaimiento exponencial a ~0.001 al final (envelope limpio, sin click de audio).
- La prop nueva se llama exactamente `queueLength` (no `queueSize`, no `hasQueue`).
- El hook se llama `useBeep` y exporta una función `play()` — nombre consistente con la convención de hooks del proyecto.
- El mock de `AudioContext` va en `src/setupTests.ts` (no en el archivo de test individual) para que esté disponible globalmente.

</specifics>

<deferred>
## Deferred Ideas

- Animación de transición cuando cambia el turno actual de la ventanilla → Phase 6 (FEEDBACK-02)
- Persistencia en localStorage → Phase 8 (PERSIST-01)
- Configuración del tono del beep por el usuario (frecuencia/volumen) → fuera de scope del proyecto por completo (no está en requirements)
- Múltiples tonos según tipo de llamado (urgente vs normal) → no requerido, fuera de scope

</deferred>

---

*Phase: 5-call-sound-feedback*
*Context gathered: 2026-07-07*
