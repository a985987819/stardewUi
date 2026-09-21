import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import DisplayFrame from './DisplayFrame'

describe('DisplayFrame', () => {
  it('renders its children on the inner surface', () => {
    render(
      <DisplayFrame>
        <span>1,240G</span>
      </DisplayFrame>
    )

    expect(screen.getByText('1,240G')).toBeInTheDocument()
  })

  it('clips the frame with the shared 2px corner stair', () => {
    const { container } = render(<DisplayFrame>data</DisplayFrame>)
    const root = container.firstElementChild as HTMLElement
    const clip = root.style.getPropertyValue('--display-frame-clip')

    expect(clip).toMatch(/^polygon\(/)
    // 1 step of 2px: the only offsets are 0 and 2px, so each corner loses a 2x2
    // block. A 4px offset here would mean the corner silently became a 4px step.
    expect(clip).toContain('2px 2px')
    expect(clip).not.toContain('4px')
  })

  it('keeps the four decorative bands out of the accessibility tree', () => {
    const { container } = render(<DisplayFrame>data</DisplayFrame>)

    const decorations = container.querySelectorAll('span[aria-hidden="true"]')
    expect(decorations).toHaveLength(4)
    for (const band of decorations) expect(band).toBeEmptyDOMElement()
  })

  it('forwards className, style and the remaining div props to the root', () => {
    render(
      <DisplayFrame className="grid-cell" data-testid="frame" style={{ width: 240 }}>
        data
      </DisplayFrame>
    )

    const root = screen.getByTestId('frame')
    expect(root).toHaveClass('grid-cell')
    // The inline style must survive alongside the injected clip variable.
    expect(root).toHaveStyle({ width: '240px' })
    expect(root.style.getPropertyValue('--display-frame-clip')).not.toBe('')
  })
})
