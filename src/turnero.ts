// Ticket represents a single waiting ticket in the queue.
// id === number in v1; they are kept separate because id is the stable React key
// and number is the display value — they diverge if a future recall feature (OPS-01, deferred v2)
// ever renumbers displayed tickets.
export type Ticket = {
  id: number
  number: number
}

// Ventanilla represents a call window (physical service desk).
// id is the stable React key and CALL_NEXT reference (Phase 4).
// number is the display value ("Ventanilla 1", etc.) — ever-incrementing per D-10.
// currentTicket is null when no ticket has been called (shows "sin turno"),
// or a Ticket object once Phase 4 sets it via CALL_NEXT.
// NOTE: Do NOT name this type Window — that shadows the TypeScript global Window interface.
export type Ventanilla = {
  id: number
  number: number
  currentTicket: Ticket | null
}

// QueueState holds the full reducer state.
// nextNumber is an independent counter that NEVER derives from queue.length —
// this is the foundational QUEUE-01 invariant that Phase 4 (CALL_NEXT) depends on.
// nextWindowNumber mirrors nextNumber for windows — also independent, never reset (D-10).
export type QueueState = {
  queue: Ticket[]
  nextNumber: number
  ventanillas: Ventanilla[]
  nextWindowNumber: number
}

// QueueAction is a discriminated union.
export type QueueAction =
  | { type: 'ADD_TICKET' }
  | { type: 'ADD_WINDOW' }
  | { type: 'REMOVE_WINDOW'; id: number }
  | { type: 'CALL_NEXT'; windowId: number }
  | { type: 'CLEAR_TICKET'; windowId: number }

export const initialState: QueueState = {
  queue: [],
  nextNumber: 1,
  ventanillas: [],
  nextWindowNumber: 1,
}

export function queueReducer(state: QueueState, action: QueueAction): QueueState {
  switch (action.type) {
    case 'ADD_TICKET': {
      const ticket: Ticket = {
        id: state.nextNumber,
        number: state.nextNumber,
      }
      // CRITICAL: spread ...state first so all QueueState fields (ventanillas,
      // nextWindowNumber, etc.) are preserved. Without the spread, every ADD_TICKET
      // call silently drops fields added after queue/nextNumber (T-03-01 mitigation).
      return {
        ...state,
        queue: [...state.queue, ticket],
        nextNumber: state.nextNumber + 1,
      }
    }
    case 'ADD_WINDOW': {
      // counter uses nextWindowNumber directly — never derived from ventanillas.length (D-10)
      const ventanilla: Ventanilla = {
        id: state.nextWindowNumber,
        number: state.nextWindowNumber,
        currentTicket: null,
      }
      return {
        ...state,
        ventanillas: [...state.ventanillas, ventanilla],
        nextWindowNumber: state.nextWindowNumber + 1,
      }
    }
    case 'REMOVE_WINDOW': {
      const target = state.ventanillas.find((v) => v.id === action.id)
      if (target !== undefined && target.currentTicket !== null) {
        return state  // no-op: data-loss prevention (WR-02 fix, T-04-01 mitigation)
      }
      return {
        ...state,
        ventanillas: state.ventanillas.filter((v) => v.id !== action.id),
      }
    }
    case 'CALL_NEXT': {
      if (state.queue.length === 0) return state  // no-op: UI handles feedback
      const [nextTicket, ...remainingQueue] = state.queue
      return {
        ...state,
        queue: remainingQueue,
        ventanillas: state.ventanillas.map((v) =>
          v.id === action.windowId
            ? { ...v, currentTicket: nextTicket }
            : v
        ),
      }
    }
    case 'CLEAR_TICKET': {
      // El turno se descarta: NO se devuelve a state.queue (política del producto).
      return {
        ...state,
        ventanillas: state.ventanillas.map((v) =>
          v.id === action.windowId
            ? { ...v, currentTicket: null }
            : v
        ),
      }
    }
    default:
      return state
  }
}
