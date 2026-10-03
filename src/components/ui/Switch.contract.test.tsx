import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { resetWarningHistory } from '../../utils/devWarnings'
import Switch from './Switch'

describe('Switch controlled / uncontrolled contract', () => {
  it('toggles on its own when neither checked nor onChange is supplied', () => {
    // Regression guard. The switch used to be controlled-only, so a bare
    // `<StarSwitch />` accepted clicks and silently changed nothing — which
    // reads as a broken component, not as a controlled-input contract. Every
    // other input in the library (Input, Textarea, Checkbox, Radio, Select,
    // Rating) has always supported the uncontrolled mode.
    render(<Switch aria-label="Barn lamp" />)

    const control = screen.getByRole('switch', { name: 'Barn lamp' })
    expect(control).toHaveAttribute('aria-checked', 'false')

    fireEvent.click(control)
    expect(control).toHaveAttribute('aria-checked', 'true')

    fireEvent.click(control)
    expect(control).toHaveAttribute('aria-checked', 'false')
  })

  it('starts from defaultChecked in the uncontrolled mode', () => {
    render(<Switch defaultChecked aria-label="Auto watering" />)

    expect(screen.getByRole('switch', { name: 'Auto watering' })).toHaveAttribute('aria-checked', 'true')
  })

  it('ignores defaultChecked once checked takes over', () => {
    const { rerender } = render(<Switch defaultChecked aria-label="Sound" />)
    expect(screen.getByRole('switch', { name: 'Sound' })).toHaveAttribute('aria-checked', 'true')

    rerender(<Switch checked={false} defaultChecked aria-label="Sound" />)
    expect(screen.getByRole('switch', { name: 'Sound' })).toHaveAttribute('aria-checked', 'false')
  })

  it('does not move on its own when checked is supplied', () => {
    // The controlled contract: the parent owns the value, so the visual state
    // must not budge even briefly. This is what distinguishes controlled from
    // uncontrolled, and getting it wrong would desync the thumb from `aria`.
    const onChange = vi.fn()
    render(<Switch checked={false} onChange={onChange} aria-label="Mine lighting" />)

    const control = screen.getByRole('switch', { name: 'Mine lighting' })
    fireEvent.click(control)

    expect(onChange).toHaveBeenCalledWith(true)
    expect(control).toHaveAttribute('aria-checked', 'false')
  })

  it('keeps the thumb travel in sync with the visible state', () => {
    // The travel is a CSS variable; if it followed `checked` instead of the
    // resolved value the thumb would slide the wrong way in uncontrolled mode.
    const { rerender } = render(<Switch size="large" aria-label="Greenhouse" />)
    const control = screen.getByRole('switch', { name: 'Greenhouse' })
    expect(control.style.getPropertyValue('--switch-thumb-translate')).toBe('0px')

    fireEvent.click(control)
    expect(control.style.getPropertyValue('--switch-thumb-translate')).toBe('28px')

    rerender(<Switch size="large" defaultChecked aria-label="Greenhouse" />)
    expect(control.style.getPropertyValue('--switch-thumb-translate')).toBe('28px')
  })

  it('stays inert while disabled, in both modes', () => {
    const onChange = vi.fn()
    const { rerender } = render(<Switch disabled onChange={onChange} aria-label="Locked" />)

    fireEvent.click(screen.getByRole('switch', { name: 'Locked' }))
    expect(onChange).not.toHaveBeenCalled()

    rerender(<Switch disabled checked onChange={onChange} aria-label="Locked" />)
    fireEvent.click(screen.getByRole('switch', { name: 'Locked' }))
    expect(onChange).not.toHaveBeenCalled()
  })
})

describe('Switch form participation', () => {
  it('submits its state through a hidden input named by the name prop', () => {
    // A `<button name>` is not a form field: the browser never includes it in
    // FormData. Without the hidden input the value silently vanishes on submit,
    // which is the failure the docs site could not show because every demo
    // wires `onChange` to state.
    const { container } = render(<Switch name="autoWatering" aria-label="Auto watering" />)

    const form = document.createElement('form')
    form.appendChild(container.querySelector('input[name="autoWatering"]')!)
    const data = new FormData(form)

    expect(data.get('autoWatering')).toBe('false')

    fireEvent.click(screen.getByRole('switch', { name: 'Auto watering' }))
    expect(new FormData(form).get('autoWatering')).toBe('true')
  })

  it('adds no hidden input when no name is given', () => {
    const { container } = render(<Switch aria-label="Sound" />)
    expect(container.querySelector('input[name]')).toBeNull()
  })

  it('keeps the hidden input out of the accessibility tree', () => {
    // The button already announces role="switch"; a second live control would
    // make a screen reader read the same setting twice.
    const { container } = render(<Switch name="x" aria-label="Sound" />)
    expect(container.querySelector('input[name="x"]')).toHaveAttribute('aria-hidden', 'true')
  })
})

describe('Switch colour diagnostics', () => {
  beforeEach(() => {
    resetWarningHistory()
    vi.restoreAllMocks()
  })

  it('warns when the colour cannot produce a matching edge tint', () => {
    // Silently falling back to the default palette was the most expensive
    // failure mode in the library: the developer had no way to know the prop
    // had been discarded, so they blamed the library, the palette, or their own
    // stylesheet — usually all three, in that order.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<Switch color="red" aria-label="Barn lamp" />)

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Switch'))
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('#71964A'))
  })

  it('stays quiet for a hex colour', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<Switch color="#D7992E" aria-label="Mine lighting" />)

    expect(warn).not.toHaveBeenCalled()
  })

  it('still renders the requested colour as the slot fill', () => {
    // The fill is a plain CSS custom property, so a named colour the browser
    // understands does render — only the derived edge falls back. Collapsing
    // both would throw away a value that was working.
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<Switch color="red" checked aria-label="Barn lamp" />)

    const control = screen.getByRole('switch', { name: 'Barn lamp' })
    expect(control.style.getPropertyValue('--switch-on-color')).toBe('red')
  })
})