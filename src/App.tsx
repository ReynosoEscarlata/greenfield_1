import { useState, useReducer, useEffect } from 'react'
import { queueReducer, initialState } from './turnero'
import type { Ventanilla, QueueState } from './turnero'
import { useBeep } from './useBeep'

export function VentanillaCard({
  ventanilla,
  onRemove,
  onCallNext,
  onClearTicket,
  queueLength,
}: Readonly<{
  ventanilla: Ventanilla
  onRemove: (id: number) => void
  onCallNext: (id: number) => void
  onClearTicket: (id: number) => void
  queueLength: number
}>) {
  const [showWarning, setShowWarning] = useState(false)
  const [showEmptyWarning, setShowEmptyWarning] = useState(false)
  const { play: playBeep } = useBeep()

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
    if (queueLength === 0) {
      setShowEmptyWarning(true)
      return
    }
    playBeep()
    onCallNext(ventanilla.id)
  }

  return (
    <div className="bg-md-primary-container rounded-xl p-4 text-center relative">
      <button
        type="button"
        className="absolute top-2 right-2 bg-transparent border-none rounded-full w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 cursor-pointer"
        onClick={handleRemove}
        aria-label={`Quitar ventanilla ${ventanilla.number}`}
      >
        ×
      </button>
      <h3 className="text-[22px] font-normal text-gray-800 mb-1">Ventanilla {ventanilla.number}</h3>
      <p
        key={ventanilla.currentTicket?.id ?? 'empty'}
        className={
          ventanilla.currentTicket !== null
            ? 'text-5xl font-bold text-gray-900 ventanilla-ticket-flash'
            : 'text-5xl font-bold text-gray-900'
        }
      >
        {ventanilla.currentTicket === null
          ? 'sin turno'
          : `Turno ${ventanilla.currentTicket.number}`}
      </p>
      <button type="button" className="bg-md-primary text-white rounded-full px-6 py-3 text-base font-normal w-full mt-2 cursor-pointer border-none hover:bg-[#1565C0]" onClick={handleCallNext}>
        Llamar siguiente
      </button>
      {ventanilla.currentTicket !== null && (
        <button
          type="button"
          className="border border-md-error text-md-error bg-transparent rounded-full px-6 py-3 text-base font-normal w-full mt-2 cursor-pointer hover:bg-md-error/10"
          onClick={() => onClearTicket(ventanilla.id)}
          aria-label={`Eliminar turno de ventanilla ${ventanilla.number}`}
        >
          Eliminar turno
        </button>
      )}
      {showWarning && (
        <p className="text-base text-md-error mt-2">
          No se puede quitar: tiene un turno activo
        </p>
      )}
      {showEmptyWarning && (
        <p className="text-base text-md-error mt-2">No hay turnos en espera</p>
      )}
    </div>
  )
}

function loadFromStorage(): QueueState {
  try {
    return JSON.parse(localStorage.getItem('turnero-v1') ?? '') as QueueState
  } catch {
    return initialState
  }
}

function App() {
  const [state, dispatch] = useReducer(queueReducer, undefined, loadFromStorage)
  useEffect(() => {
    localStorage.setItem('turnero-v1', JSON.stringify(state))
  }, [state])

  return (
    <>
      <header className="sticky top-0 z-10 bg-md-primary text-white px-4 py-3">
        <h1 className="text-4xl font-normal m-0">Turnero</h1>
      </header>
      <div className="max-w-[1200px] mx-auto px-8 py-8 box-border">
        <button
          type="button"
          className="bg-md-primary-container text-md-on-primary-container rounded-full px-6 py-3 text-base font-normal cursor-pointer border-none mb-6 hover:bg-[#90CAF9]"
          onClick={() => dispatch({ type: 'ADD_TICKET' })}
        >
          Agregar turno
        </button>
        <section className="bg-md-primary-container rounded-xl p-6 mb-6">
          <h2 className="text-[22px] font-normal text-gray-800 mb-2">Cola</h2>
          {state.queue.length === 0 ? (
            <p className="text-base font-normal text-gray-600">Próximos turnos aparecerán aquí</p>
          ) : (
            <ul className="flex flex-wrap gap-2 list-none m-0 p-0">
              {state.queue.map((ticket) => (
                <li key={ticket.id} className="border border-md-primary text-md-primary rounded-full px-4 py-2 text-[22px] font-normal bg-white">
                  Turno {ticket.number}
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="mt-6">
          <h2 className="text-[22px] font-normal text-gray-800 mb-2">Ventanillas</h2>
          <button
            type="button"
            className="border border-md-primary text-md-primary rounded-full px-6 py-3 text-base font-normal bg-transparent cursor-pointer mb-4 hover:bg-md-primary/10"
            onClick={() => dispatch({ type: 'ADD_WINDOW' })}
          >
            Agregar ventanilla
          </button>
          <div className="grid gap-4 ventanillas-grid">
            {state.ventanillas.length === 0 ? (
              <p className="text-base font-normal text-gray-600 col-span-full">
                Presiona Agregar ventanilla para comenzar
              </p>
            ) : (
              state.ventanillas.map((v) => (
                <VentanillaCard
                  key={v.id}
                  ventanilla={v}
                  onRemove={(id) => dispatch({ type: 'REMOVE_WINDOW', id })}
                  onCallNext={(id) => dispatch({ type: 'CALL_NEXT', windowId: id })}
                  onClearTicket={(id) => dispatch({ type: 'CLEAR_TICKET', windowId: id })}
                  queueLength={state.queue.length}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </>
  )
}

export default App
