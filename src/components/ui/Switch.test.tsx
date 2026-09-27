import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Switch from './Switch'
import styles from './Switch.module.scss'

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

  it('carries the size class and derives the lit-slot palette from color', () => {
    render(<Switch size="large" color="#D7992E" checked aria-label="Mine lighting" />)

    const element = screen.getByRole('switch', { name: 'Mine lighting' })
    expect(element).toHaveClass(styles['star-switch--large'])
    expect(element.style.getPropertyValue('--switch-on-color')).toBe('#D7992E')
    expect(element.style.getPropertyValue('--switch-on-edge')).not.toBe('')
    expect(element.style.getPropertyValue('--switch-clip')).toContain('polygon')
  })

  it('slides the thumb to the right endpoint while checked and parks it left while unchecked', () => {
    const { rerender } = render(<Switch size="large" checked aria-label="Mine lighting" />)
    expect(screen.getByRole('switch', { name: 'Mine lighting' }).style.getPropertyValue('--switch-thumb-translate')).toBe('28px')

    rerender(<Switch size="large" aria-label="Closed gate" />)
    expect(screen.getByRole('switch', { name: 'Closed gate' }).style.getPropertyValue('--switch-thumb-translate')).toBe('0px')
  })

  it('keeps the slot and keyhole dot as decorative internal layers', () => {
    const { container } = render(<Switch checked aria-label="Gate latch" />)

    expect(container.querySelector(`.${styles['star-switch__track']}`)).toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelector(`.${styles['star-switch__slot']}`)).toBeInTheDocument()
    expect(container.querySelector(`.${styles['star-switch__thumb-dot']}`)).toBeInTheDocument()
  })

  it('honours a consumer click handler that prevents the state change', () => {
    const onChange = vi.fn()
    render(<Switch onChange={onChange} onClick={(event) => event.preventDefault()} aria-label="Paused setting" />)

    fireEvent.click(screen.getByRole('switch', { name: 'Paused setting' }))
    expect(onChange).not.toHaveBeenCalled()
  })
})
