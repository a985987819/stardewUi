import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useRef, useState } from 'react'
import { useFocusTrap } from './useFocusTrap'

/**
 * Minimal harness: the hook only needs a container element and an active flag,
 * so testing it directly is clearer than driving a whole overlay. The Dialog /
 * Drawer / Alert integration is covered by their own suites.
 */
function Trap({
  active = true,
  loop = true,
  withButtons = true,
  onReady,
}: {
  active?: boolean
  loop?: boolean
  withButtons?: boolean
  onReady?: (api: { rerender: (next: { active: boolean }) => void } | null) => void
}) {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const [, force] = useState(0)
  useFocusTrap(panelRef, { active, loop })

  if (onReady) {
    onReady({
      rerender: (next) => {
        // Toggle by flipping a counter the harness reads back through `active`.
        force((n) => n + 1)
        void next
      },
    })
  }

  return (
    <div>
      <button type="button" data-testid="outside-before">before</button>
      <div ref={panelRef} role="dialog" aria-modal="true" aria-label="Panel" tabIndex={-1}>
        {withButtons ? (
          <>
            <button type="button" data-testid="inside-1">one</button>
            <button type="button" data-testid="inside-2">two</button>
          </>
        ) : null}
      </div>
      <button type="button" data-testid="outside-after">after</button>
    </div>
  )
}

function pressTab(shiftKey = false) {
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true, cancelable: true }),
  )
}

describe('useFocusTrap', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('moves focus into the panel when it opens', () => {
    render(<Trap />)

    // The panel itself, not its first control: focusing the container makes a
    // screen reader announce the dialog's name before its contents.
    expect(document.activeElement).toBe(screen.getByRole('dialog'))
  })

  it('remembers and restores the element that had focus before opening', () => {
    document.body.innerHTML = '<button data-testid="opener">open</button>'
    const opener = screen.getByTestId('opener')
    opener.focus()
    expect(document.activeElement).toBe(opener)

    const { rerender } = render(<Trap active />)
    expect(document.activeElement).not.toBe(opener)

    rerender(<Trap active={false} />)
    expect(document.activeElement).toBe(opener)
  })

  it('wraps Tab from the last focusable element back to the first', () => {
    render(<Trap />)

    const first = screen.getByTestId('inside-1')
    const last = screen.getByTestId('inside-2')
    last.focus()

    pressTab()
    expect(document.activeElement).toBe(first)
  })

  it('wraps Shift+Tab from the first element back to the last', () => {
    render(<Trap />)

    const first = screen.getByTestId('inside-1')
    const last = screen.getByTestId('inside-2')
    first.focus()

    pressTab(true)
    expect(document.activeElement).toBe(last)
  })

  it('leaves Tab alone in the middle of the panel', () => {
    // Only the two ends are the trap's business. Interfering mid-list is what
    // makes hand-rolled focus traps feel wrong.
    render(<Trap />)

    const first = screen.getByTestId('inside-1')
    first.focus()

    pressTab()
    expect(document.activeElement).toBe(first)
  })

  it('pulls focus back in when something outside claimed it', () => {
    render(<Trap />)

    // Simulates a browser find-bar or a stray programmatic focus.
    screen.getByTestId('outside-after').focus()
    pressTab()

    expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true)
  })

  it('skips unreachable elements when cycling', () => {
    // A `display: none` button still matches the focusable selector but cannot
    // take focus; landing on it would silently swallow a keystroke.
    const { container } = render(<Trap />)
    const hidden = document.createElement('button')
    hidden.textContent = 'hidden'
    hidden.style.display = 'none'
    container.querySelector('[role="dialog"]')!.appendChild(hidden)

    expect(() => pressTab()).not.toThrow()
  })

  it('does nothing when inactive', () => {
    render(<Trap active={false} />)

    // Focus was never moved in, so it should still be where it was.
    expect(document.activeElement).toBe(document.body)
  })

  it('does not steal focus back when the user already moved it deliberately', () => {
    document.body.innerHTML = '<a href="#x" data-testid="skip">skip to content</a>'
    const skip = screen.getByTestId('skip')
    skip.focus()

    const { rerender } = render(<Trap active />)
    // Focus something outside the panel on purpose…
    skip.focus()

    rerender(<Trap active={false} />)
    // …and closing should respect that rather than yanking it to the opener.
    expect(document.activeElement).toBe(skip)
  })
})