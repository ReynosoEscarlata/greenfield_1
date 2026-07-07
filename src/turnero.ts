// Ticket represents a single waiting ticket in the queue.
// id === number in v1; they are kept separate because id is the stable React key
// and number is the display value — they diverge if a future recall feature (OPS-01, deferred v2)
// ever renumbers displayed tickets.
export type Ticket = {
  id: number
  number: number
}

// QueueState holds the full reducer state.
// nextNumber is an independent counter that NEVER derives from queue.length —
// this is the foundational QUEUE-01 invariant that Phase 4 (CALL_NEXT) depends on.
export type QueueState = {
  queue: Ticket[]
  nextNumber: number
}

// QueueAction is a discriminated union.
// Phase 4 extension point: add { type: 'CALL_NEXT'; windowId: string } here.
export type QueueAction =
  | { type: 'ADD_TICKET' }

export const initialState: QueueState = {
  queue: [],
  nextNumber: 1,
}

export function queueReducer(state: QueueState, action: QueueAction): QueueState {
  switch (action.type) {
    case 'ADD_TICKET': {
      const ticket: Ticket = {
        id: state.nextNumber,
        number: state.nextNumber,
      }
      return {
        queue: [...state.queue, ticket],
        nextNumber: state.nextNumber + 1,
      }
    }
    default:
      return state
  }
}
