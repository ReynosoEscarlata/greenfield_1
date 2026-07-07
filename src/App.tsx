import { useReducer } from 'react'
import { queueReducer, initialState } from './turnero'

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
      <section className="ventanillas-grid">
        <h2>Ventanillas</h2>
        <p>Las ventanillas configuradas aparecerán aquí</p>
      </section>
    </div>
  )
}

export default App
