import { render, screen, fireEvent, act } from '@testing-library/react'
import { VentanillaCard } from './App'

describe('WINDOW-03: Per-window current ticket display', () => {
  it('renders "sin turno" when currentTicket is null', () => {
    render(
      <VentanillaCard
        ventanilla={{ id: 1, number: 1, currentTicket: null }}
        onRemove={() => {}}
        onCallNext={() => {}}
        isQueueEmpty={false}
      />
    )
    expect(screen.getByText('sin turno')).toBeInTheDocument()
  })
})

describe('WINDOW-02: Remove with guard', () => {
  it('shows inline warning and does not call onRemove when active ticket is present', () => {
    const onRemove = vi.fn()
    render(
      <VentanillaCard
        ventanilla={{ id: 1, number: 1, currentTicket: { id: 5, number: 5 } }}
        onRemove={onRemove}
        onCallNext={() => {}}
        isQueueEmpty={false}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Quitar ventanilla 1' }))
    expect(screen.getByText('No se puede quitar: tiene un turno activo')).toBeInTheDocument()
    expect(onRemove).not.toHaveBeenCalled()
  })

  it('calls onRemove with the ventanilla id when no active ticket', () => {
    const onRemove = vi.fn()
    render(
      <VentanillaCard
        ventanilla={{ id: 2, number: 2, currentTicket: null }}
        onRemove={onRemove}
        onCallNext={() => {}}
        isQueueEmpty={false}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Quitar ventanilla 2' }))
    expect(onRemove).toHaveBeenCalledWith(2)
  })
})

describe('CALL-01: Llamar siguiente dispatches CALL_NEXT', () => {
  it('calls onCallNext with ventanilla id when queue is not empty', () => {
    const onCallNext = vi.fn()
    render(
      <VentanillaCard
        ventanilla={{ id: 1, number: 1, currentTicket: null }}
        onRemove={() => {}}
        onCallNext={onCallNext}
        isQueueEmpty={false}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /llamar siguiente/i }))
    expect(onCallNext).toHaveBeenCalledWith(1)
  })
})

describe('CALL-02: Empty-queue warning auto-dismiss', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows empty-queue warning on click and dismisses after 2 seconds', () => {
    render(
      <VentanillaCard
        ventanilla={{ id: 1, number: 1, currentTicket: null }}
        onRemove={() => {}}
        onCallNext={() => {}}
        isQueueEmpty={true}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /llamar siguiente/i }))
    expect(screen.getByText('No hay turnos en espera')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(screen.queryByText('No hay turnos en espera')).not.toBeInTheDocument()
  })
})

describe('WR-01: showWarning resets when currentTicket is cleared externally', () => {
  it('clears the removal warning when ventanilla prop transitions from active ticket to null', () => {
    const { rerender } = render(
      <VentanillaCard
        ventanilla={{ id: 1, number: 1, currentTicket: { id: 5, number: 5 } }}
        onRemove={() => {}}
        onCallNext={() => {}}
        isQueueEmpty={false}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Quitar ventanilla 1' }))
    expect(screen.getByText('No se puede quitar: tiene un turno activo')).toBeInTheDocument()

    rerender(
      <VentanillaCard
        ventanilla={{ id: 1, number: 1, currentTicket: null }}
        onRemove={() => {}}
        onCallNext={() => {}}
        isQueueEmpty={true}
      />
    )
    expect(screen.queryByText('No se puede quitar: tiene un turno activo')).not.toBeInTheDocument()
  })
})
