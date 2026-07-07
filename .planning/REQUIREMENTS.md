# Requirements: Turnero de Sala de Espera

**Defined:** 2026-06-21
**Core Value:** Que cualquier ventanilla pueda llamar al siguiente turno de la cola compartida y la pantalla refleje correctamente, en todo momento, cuál es el turno actual de cada ventanilla y cuáles son los próximos en espera.

## v1 Requirements

### Cola (QUEUE)

- [x] **QUEUE-01**: Usuario puede agregar un nuevo turno a la cola con un botón "Agregar turno" (numeración automática incremental, basada en un contador independiente, no en la longitud de la cola)
- [x] **QUEUE-02**: Usuario puede ver la lista ordenada de turnos en espera (los próximos a ser llamados)

### Ventanillas (WINDOW)

- [x] **WINDOW-01**: Usuario puede configurar dinámicamente la cantidad de ventanillas (agregar nuevas ventanillas)
- [x] **WINDOW-02**: Usuario puede quitar una ventanilla, salvo que tenga un turno actual activo mostrado (la app debe bloquear/avisar en ese caso)
- [x] **WINDOW-03**: Cada ventanilla muestra su turno actual, o un estado vacío ("sin turno") si nunca llamó ninguno

### Llamado (CALL)

- [x] **CALL-01**: Usuario puede presionar "Llamar siguiente" en una ventanilla para tomar de forma atómica el próximo turno de la cola compartida (sin posibilidad de que dos ventanillas tomen el mismo turno en clics simultáneos)
- [x] **CALL-02**: Si la cola está vacía al presionar "Llamar siguiente", se muestra un mensaje indicando que no hay turnos en espera (el botón permanece habilitado)

### Feedback (FEEDBACK)

- [ ] **FEEDBACK-01**: Al llamar un turno se reproduce un sonido/beep, disparado de forma síncrona dentro del click (no en recarga de página ni por efectos posteriores)
- [ ] **FEEDBACK-02**: Al cambiar el turno actual de una ventanilla se muestra una animación de transición visual

### Diseño (DISPLAY)

- [ ] **DISPLAY-01**: Los números de turno se muestran en tamaño grande y alto contraste, legibles a distancia (criterio: legible en 5 segundos desde 3 metros), acorde a una pantalla de sala de espera

### Persistencia (PERSIST)

- [ ] **PERSIST-01**: El estado de la cola y de las ventanillas persiste en localStorage y se recupera correctamente al recargar la página (con manejo defensivo de datos corruptos o ausentes)

### Privacidad (PRIVACY)

- [ ] **PRIVACY-01**: La pantalla pública solo muestra números de turno, nunca nombres ni datos identificatorios de pacientes

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Operación avanzada

- **OPS-01**: Recall / "volver a llamar" un turno que no fue atendido
- **OPS-02**: Deshacer el último "llamar siguiente"

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Backend / API | App 100% cliente, sin servidor — el ejercicio se centra en recorrer el ciclo GSD, no en infraestructura |
| Autenticación / roles de usuario | No hay usuarios ni permisos; cualquiera que abra la página puede operar cualquier ventanilla |
| Colas separadas por ventanilla | Se eligió una única cola compartida para simplificar la lógica de "llamar siguiente" |
| Múltiples pantallas/vistas (routing) | Todo vive en una sola página |
| Sincronización entre pestañas/dispositivos | localStorage es por navegador; cualquier sync en tiempo real requeriría backend o BroadcastChannel, fuera de alcance |
| Recall / "call again" | Aumenta el estado y la superficie de UX sin ser pedido — diferido a v2 |
| Undo del último llamado | Semántica ambigua (orden de reinserción) y no solicitado — diferido a v2 |
| Analytics / reportes de tiempos de espera | No aporta al Core Value, que es de visualización, no de gestión |
| Impresión de tickets físicos | Requiere hardware, irrelevante para un ejercicio 100% software |
| Colas con prioridad/VIP | No solicitado, agrega lógica de ramificación al "llamar siguiente" sin base en los requirements |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| QUEUE-01 | Phase 2 | Complete |
| QUEUE-02 | Phase 2 | Complete |
| WINDOW-01 | Phase 3 | Complete |
| WINDOW-02 | Phase 3 | Complete |
| WINDOW-03 | Phase 3 | Complete |
| CALL-01 | Phase 4 | Complete |
| CALL-02 | Phase 4 | Complete |
| FEEDBACK-01 | Phase 5 | Pending |
| FEEDBACK-02 | Phase 6 | Pending |
| DISPLAY-01 | Phase 7 | Pending |
| PERSIST-01 | Phase 8 | Pending |
| PRIVACY-01 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-21*
*Last updated: 2026-06-21 after roadmap creation (12/12 v1 requirements mapped to 8 phases)*
