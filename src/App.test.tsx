const mockPlay = vi.fn()

vi.mock('./useBeep', () => ({
  useBeep: () => ({ play: mockPlay }),
}))

import { render, screen, fireEvent, act } from '@testing-library/react'
import { VentanillaCard } from './App'

describe('WINDOW-03: Per-window current ticket display', () => {
  it('renders "sin turno" when currentTicket is null', () => {
    render(
      <VentanillaCard
        ventanilla={{ id: 1, number: 1, currentTicket: null }}
        onRemove={() => {}}
        onCallNext={() => {}}
        queueLength={1}
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
        queueLength={1}
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
        queueLength={1}
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
        queueLength={1}
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
        queueLength={0}
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
        queueLength={1}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Quitar ventanilla 1' }))
    expect(screen.getByText('No se puede quitar: tiene un turno activo')).toBeInTheDocument()

    rerender(
      <VentanillaCard
        ventanilla={{ id: 1, number: 1, currentTicket: null }}
        onRemove={() => {}}
        onCallNext={() => {}}
        queueLength={0}
      />
    )
    expect(screen.queryByText('No se puede quitar: tiene un turno activo')).not.toBeInTheDocument()
  })
})

describe('FEEDBACK-01: Beep on successful call', () => {
  beforeEach(() => {
    mockPlay.mockClear()
  })

  it('calls play() when queue has tickets', () => {
    render(
      <VentanillaCard
        ventanilla={{ id: 1, number: 1, currentTicket: null }}
        onRemove={() => {}}
        onCallNext={() => {}}
        queueLength={1}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /llamar siguiente/i }))
    expect(mockPlay).toHaveBeenCalledOnce()
  })

  it('does not call play() when queue is empty', () => {
    render(
      <VentanillaCard
        ventanilla={{ id: 1, number: 1, currentTicket: null }}
        onRemove={() => {}}
        onCallNext={() => {}}
        queueLength={0}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: /llamar siguiente/i }))
    expect(mockPlay).not.toHaveBeenCalled()
  })
})

describe('FEEDBACK-02: Flash class on ticket change', () => {
  it('applies ventanilla-ticket-flash class when currentTicket is non-null', () => {
    render(
      <VentanillaCard
        ventanilla={{ id: 1, number: 1, currentTicket: { id: 5, number: 5 } }}
        onRemove={() => {}}
        onCallNext={() => {}}
        queueLength={0}
      />
    )
    expect(screen.getByText('Turno 5')).toHaveClass('ventanilla-ticket-flash')
  })

  it('does not apply ventanilla-ticket-flash class when currentTicket is null', () => {
    render(
      <VentanillaCard
        ventanilla={{ id: 1, number: 1, currentTicket: null }}
        onRemove={() => {}}
        onCallNext={() => {}}
        queueLength={0}
      />
    )
    expect(screen.getByText('sin turno')).not.toHaveClass('ventanilla-ticket-flash')
  })

  it('applies flash class on the new element after rapid ticket change (D-05)', () => {
    const { rerender } = render(
      <VentanillaCard
        ventanilla={{ id: 1, number: 1, currentTicket: { id: 10, number: 10 } }}
        onRemove={() => {}}
        onCallNext={() => {}}
        queueLength={0}
      />
    )
    expect(screen.getByText('Turno 10')).toHaveClass('ventanilla-ticket-flash')

    rerender(
      <VentanillaCard
        ventanilla={{ id: 1, number: 1, currentTicket: { id: 11, number: 11 } }}
        onRemove={() => {}}
        onCallNext={() => {}}
        queueLength={0}
      />
    )
    expect(screen.getByText('Turno 11')).toHaveClass('ventanilla-ticket-flash')
  })
})

describe('PRIVACY-01: No patient-identifying data rendered', () => {
  it('renders only ticket number text when current ticket is active', () => {
    render(
      <VentanillaCard
        ventanilla={{ id: 1, number: 1, currentTicket: { id: 42, number: 42 } }}
        onRemove={() => {}}
        onCallNext={() => {}}
        queueLength={0}
      />
    )
    expect(screen.getByText('Turno 42')).toBeInTheDocument()
    expect(screen.queryByTestId('patient-name')).not.toBeInTheDocument()
  })

  it('renders only "sin turno" text when no ticket is active', () => {
    render(
      <VentanillaCard
        ventanilla={{ id: 1, number: 1, currentTicket: null }}
        onRemove={() => {}}
        onCallNext={() => {}}
        queueLength={0}
      />
    )
    expect(screen.getByText('sin turno')).toBeInTheDocument()
    expect(screen.queryByTestId('patient-name')).not.toBeInTheDocument()
  })
})
