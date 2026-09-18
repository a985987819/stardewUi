import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Switch from './Switch'

describe('Switch', () => {
  it('exposes a switch role with the checked state', () => {
    render(<Switch checked aria-label="Barn lamp" />)

    expect(screen.getByRole('switch', { name: 'Barn lamp' })).toHaveAttribute('aria-checked', 'true')
  })

  it('reports the next value instead of the current one', () => {
    const onChange = vi.fn()
    render(<Switch checked={false} onChange={onChange} aria-label="Auto watering" />)

    fireEvent.click(screen.getByRole('switch', { name: 'Auto watering' }))

    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('stays inert while disabled', () => {
    const onChange = vi.fn()
    render(<Switch disabled onChange={onChange} aria-label="Locked" />)

    fireEvent.click(screen.getByRole('switch', { name: 'Locked' }))

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('switch', { name: 'Locked' })).toBeDisabled()
  })

  it('sizes the track from the shared size table and tints the on state', () => {
    render(<Switch size="large" color="#D7992E" checked aria-label="Mine lighting" />)

    const style = screen.getByRole('switch', { name: 'Mine lighting' }).style
    expect(style.getPropertyValue('--switch-track-width')).toBe('52px')
    expect(style.getPropertyValue('--switch-on-color')).toBe('#D7992E')
  })
})
