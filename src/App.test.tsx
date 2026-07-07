import { render, screen, fireEvent } from '@testing-library/react'
import { VentanillaCard } from './App'

describe('WINDOW-03: Per-window current ticket display', () => {
  it('renders "sin turno" when currentTicket is null', () => {
    render(
      <VentanillaCard
        ventanilla={{ id: 1, number: 1, currentTicket: null }}
        onRemove={() => {}}
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
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Quitar ventanilla 2' }))
    expect(onRemove).toHaveBeenCalledWith(2)
  })
})
