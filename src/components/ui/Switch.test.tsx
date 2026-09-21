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

  it('sizes the framed track, moves the checked marker, and derives its palette', () => {
    render(<Switch size="large" color="#D7992E" checked aria-label="Mine lighting" />)

    const style = screen.getByRole('switch', { name: 'Mine lighting' }).style
    expect(style.getPropertyValue('--switch-track-width')).toBe('70px')
    expect(style.getPropertyValue('--switch-on-color')).toBe('#D7992E')
    expect(style.getPropertyValue('--switch-fill')).toBe('#D7992E')
    expect(style.getPropertyValue('--switch-border')).not.toBe('')
    expect(style.getPropertyValue('--switch-thumb-translate')).toBe('30px')
  })

  it('parks an unchecked marker at the left endpoint', () => {
    render(<Switch size="large" aria-label="Closed gate" />)

    expect(screen.getByRole('switch', { name: 'Closed gate' }).style.getPropertyValue('--switch-thumb-translate')).toBe('0px')
  })

  it('keeps the divider rail and progress-cell marker layers decorative', () => {
    const { container } = render(<Switch checked aria-label="Gate latch" />)

    expect(container.querySelectorAll('[class*="stardew-switch__rail"]')).toHaveLength(2)
    expect(container.querySelector('[class*="stardew-switch__thumb"]')).toHaveAttribute('aria-hidden', 'true')
  })

  it('honours a consumer click handler that prevents the state change', () => {
    const onChange = vi.fn()
    render(<Switch onChange={onChange} onClick={(event) => event.preventDefault()} aria-label="Paused setting" />)

    fireEvent.click(screen.getByRole('switch', { name: 'Paused setting' }))
    expect(onChange).not.toHaveBeenCalled()
  })
})
