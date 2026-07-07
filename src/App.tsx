import { useState, useReducer, useEffect } from 'react'
import { queueReducer, initialState } from './turnero'
import type { Ventanilla } from './turnero'

export function VentanillaCard({
  ventanilla,
  onRemove,
  onCallNext,
  isQueueEmpty,
}: Readonly<{
  ventanilla: Ventanilla
  onRemove: (id: number) => void
  onCallNext: (id: number) => void
  isQueueEmpty: boolean
}>) {
  const [showWarning, setShowWarning] = useState(false)
  const [showEmptyWarning, setShowEmptyWarning] = useState(false)

  // WR-01 fix: reset removal warning when currentTicket is cleared externally
  useEffect(() => {
    if (ventanilla.currentTicket === null) {
      setShowWarning(false)
    }
  }, [ventanilla.currentTicket])

  // CALL-02: auto-dismiss empty-queue warning after 2 seconds
  useEffect(() => {
    if (!showEmptyWarning) return
    const timer = setTimeout(() => setShowEmptyWarning(false), 2000)
    return () => clearTimeout(timer)
  }, [showEmptyWarning])

  function handleRemove() {
    if (ventanilla.currentTicket !== null) {
      setShowWarning(true)
      return
    }
    setShowWarning(false)
    onRemove(ventanilla.id)
  }

  function handleCallNext() {
    if (isQueueEmpty) {
      setShowEmptyWarning(true)
      return
    }
    onCallNext(ventanilla.id)
  }

  return (
    <div className="ventanilla-card">
      <button
        type="button"
        className="ventanilla-remove"
        onClick={handleRemove}
        aria-label={`Quitar ventanilla ${ventanilla.number}`}
      >
        ×
      </button>
      <h3 className="ventanilla-label">Ventanilla {ventanilla.number}</h3>
      <p className="ventanilla-ticket">
        {ventanilla.currentTicket === null
          ? 'sin turno'
          : `Turno ${ventanilla.currentTicket.number}`}
      </p>
      <button type="button" className="call-next-button" onClick={handleCallNext}>
        Llamar siguiente
      </button>
      {showWarning && (
        <p className="ventanilla-warning">
          No se puede quitar: tiene un turno activo
        </p>
      )}
      {showEmptyWarning && (
        <p className="ventanilla-warning">No hay turnos en espera</p>
      )}
    </div>
  )
}

function App() {
  const [state, dispatch] = useReducer(queueReducer, initialState)

  return (
    <div className="page">
      <h1 className="page-title">Turnero</h1>
      <button
        type="button"
        className="add-ticket-button"
        onClick={() => dispatch({ type: 'ADD_TICKET' })}
      >
        Agregar turno
      </button>
      <section className="queue-strip">
        <h2>Cola</h2>
        {state.queue.length === 0 ? (
          <p>Próximos turnos aparecerán aquí</p>
        ) : (
          <ul className="ticket-list">
            {state.queue.map((ticket) => (
              <li key={ticket.id} className="ticket-chip">
                Turno {ticket.number}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="ventanillas-section">
        <h2>Ventanillas</h2>
        <button
          type="button"
          className="add-window-button"
          onClick={() => dispatch({ type: 'ADD_WINDOW' })}
        >
          Agregar ventanilla
        </button>
        <div className="ventanillas-grid">
          {state.ventanillas.length === 0 ? (
            <p className="ventanillas-empty">
              Presiona Agregar ventanilla para comenzar
            </p>
          ) : (
            state.ventanillas.map((v) => (
              <VentanillaCard
                key={v.id}
                ventanilla={v}
                onRemove={(id) => dispatch({ type: 'REMOVE_WINDOW', id })}
                onCallNext={(id) => dispatch({ type: 'CALL_NEXT', windowId: id })}
                isQueueEmpty={state.queue.length === 0}
              />
            ))
          )}
        </div>
      </section>
    </div>
  )
}

export default App
