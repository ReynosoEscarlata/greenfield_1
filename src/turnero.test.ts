import { queueReducer, initialState } from './turnero'

describe('QUEUE-01: Independent ticket counter', () => {
  it('QUEUE-01-A: first ADD_TICKET dispatch produces a ticket with number 1', () => {
    const state = queueReducer(initialState, { type: 'ADD_TICKET' })
    expect(state.queue[0].number).toBe(1)
  })

  it('QUEUE-01-B: three sequential ADD_TICKET dispatches produce tickets with numbers [1, 2, 3]', () => {
    let state = queueReducer(initialState, { type: 'ADD_TICKET' })
    state = queueReducer(state, { type: 'ADD_TICKET' })
    state = queueReducer(state, { type: 'ADD_TICKET' })
    expect(state.queue.map((t) => t.number)).toEqual([1, 2, 3])
  })

  it('QUEUE-01-C: counter does not reset when queue array is zeroed (independent of queue.length)', () => {
    let state = queueReducer(initialState, { type: 'ADD_TICKET' })
    // nextNumber is now 2; simulate Phase 4 removal by zeroing the array
    state = { ...state, queue: [] }
    state = queueReducer(state, { type: 'ADD_TICKET' })
    expect(state.queue[0].number).toBe(2) // not 1 — counter does not reset with queue.length
  })
})

describe('QUEUE-02: Ordered waiting list', () => {
  it('QUEUE-02-A: three ADD_TICKET dispatches preserve insertion order', () => {
    let state = queueReducer(initialState, { type: 'ADD_TICKET' })
    state = queueReducer(state, { type: 'ADD_TICKET' })
    state = queueReducer(state, { type: 'ADD_TICKET' })
    expect(state.queue[0].number).toBe(1)
    expect(state.queue[1].number).toBe(2)
    expect(state.queue[2].number).toBe(3)
  })

  it('QUEUE-02-B: initialState.queue is empty', () => {
    expect(initialState.queue).toHaveLength(0)
  })
})

describe('WINDOW-01: Add windows', () => {
  it('WINDOW-01-A: ADD_WINDOW adds a ventanilla with number 1 to empty state', () => {
    const state = queueReducer(initialState, { type: 'ADD_WINDOW' })
    expect(state.ventanillas).toHaveLength(1)
    expect(state.ventanillas[0].number).toBe(1)
  })

  it('WINDOW-01-B: nextWindowNumber increments with each ADD_WINDOW', () => {
    let state = queueReducer(initialState, { type: 'ADD_WINDOW' })
    state = queueReducer(state, { type: 'ADD_WINDOW' })
    expect(state.ventanillas[0].number).toBe(1)
    expect(state.ventanillas[1].number).toBe(2)
  })

  it('WINDOW-01-C: counter never reuses a number after removal (D-10)', () => {
    let state = queueReducer(initialState, { type: 'ADD_WINDOW' })  // Ventanilla 1
    state = queueReducer(state, { type: 'ADD_WINDOW' })              // Ventanilla 2
    state = queueReducer(state, { type: 'REMOVE_WINDOW', id: 1 })   // remove Ventanilla 1
    state = queueReducer(state, { type: 'ADD_WINDOW' })              // should be Ventanilla 3
    expect(state.ventanillas.map(v => v.number)).toContain(3)
    expect(state.ventanillas.map(v => v.number)).not.toContain(1)
  })
})

describe('WINDOW-02: Remove with guard', () => {
  it('WINDOW-02-A: REMOVE_WINDOW removes the ventanilla when currentTicket is null', () => {
    let state = queueReducer(initialState, { type: 'ADD_WINDOW' })
    state = queueReducer(state, { type: 'REMOVE_WINDOW', id: 1 })
    expect(state.ventanillas).toHaveLength(0)
  })
})

describe('WINDOW-03: Per-window current ticket display', () => {
  it('WINDOW-03-A: new ventanilla has currentTicket = null', () => {
    const state = queueReducer(initialState, { type: 'ADD_WINDOW' })
    expect(state.ventanillas[0].currentTicket).toBeNull()
  })

  it('Regression — ADD_TICKET spread: ADD_WINDOW then ADD_TICKET preserves ventanillas', () => {
    let state = queueReducer(initialState, { type: 'ADD_WINDOW' })
    state = queueReducer(state, { type: 'ADD_TICKET' })
    expect(state.ventanillas).toHaveLength(1)
  })
})
