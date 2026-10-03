import '@testing-library/jest-dom/vitest'
import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StarCheckbox, StarInput, StarRadio, StarRating, StarSelect, StarSwitch, StarTextarea } from './index'

/**
 * Ref forwarding for the components that render a natively focusable element.
 *
 * The point of these is focus control: "focus the field after clearing it",
 * "jump here from a keyboard shortcut". A ref pointing at a wrapper `div`
 * would type-check and then silently do nothing, so each case asserts both that
 * the ref is populated *and* that the node it points at is the one that takes
 * focus.
 */
describe('interactive components expose a usable ref', () => {
  it('StarSwitch forwards to the button, which is what receives focus', () => {
    const ref = createRef<HTMLButtonElement>()
    render(<StarSwitch ref={ref} aria-label="Barn lamp" />)

    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
    ref.current?.focus()
    expect(document.activeElement).toBe(ref.current)
  })

  it('StarInput forwards to the inner input, not the wrapper', () => {
    const ref = createRef<HTMLInputElement>()
    render(<StarInput ref={ref} aria-label="Seed name" />)

    expect(ref.current).toBeInstanceOf(HTMLInputElement)
    ref.current?.focus()
    expect(document.activeElement).toBe(ref.current)
    expect(ref.current).toBe(screen.getByRole('textbox'))
  })

  it('StarTextarea forwards to the inner textarea', () => {
    const ref = createRef<HTMLTextAreaElement>()
    render(<StarTextarea ref={ref} aria-label="Quest note" />)

    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
    ref.current?.focus()
    expect(document.activeElement).toBe(ref.current)
  })

  it('StarSelect forwards to its root element', () => {
    // Select has no native control of its own — the trigger is a button built
    // from divs — so the root group is the honest target. The test documents
    // that rather than pretending a focusable control exists.
    const ref = createRef<HTMLDivElement>()
    render(<StarSelect ref={ref} options={[{ value: 'a', label: 'A' }]} aria-label="Tool" />)

    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('StarCheckbox forwards to the group root', () => {
    const ref = createRef<HTMLDivElement>()
    render(<StarCheckbox ref={ref} options={[{ value: 'a', label: 'A' }]} />)

    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(ref.current).toBe(screen.getByRole('group'))
  })

  it('StarRadio forwards to the group root', () => {
    const ref = createRef<HTMLDivElement>()
    render(<StarRadio ref={ref} options={[{ value: 'a', label: 'A' }]} />)

    expect(ref.current).toBeInstanceOf(HTMLDivElement)
  })

  it('StarRating forwards to the slider, which is the focusable element', () => {
    const ref = createRef<HTMLDivElement>()
    render(<StarRating ref={ref} aria-label="Friendship" />)

    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    // The root carries role="slider" and tabIndex, so it is what a keyboard
    // user actually lands on.
    expect(ref.current).toHaveAttribute('role', 'slider')
    ref.current?.focus()
    expect(document.activeElement).toBe(ref.current)
  })

  it('keeps the internal ref working alongside the forwarded one', () => {
    // Rating and Textarea already kept a local ref for their own bookkeeping.
    // Merging is easy to get wrong: if the public ref clobbered the local one,
    // the component's own focus/measurement logic would break — and that is the
    // kind of regression no caller would notice until much later.
    const ref = createRef<HTMLTextAreaElement>()
    const { rerender } = render(<StarTextarea ref={ref} aria-label="Note" autoFocus />)

    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
    expect(document.activeElement).toBe(ref.current)

    // Rerendering must not detach either ref.
    rerender(<StarTextarea ref={ref} aria-label="Note" autoFocus defaultValue="text" />)
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })
})
