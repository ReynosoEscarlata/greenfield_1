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
