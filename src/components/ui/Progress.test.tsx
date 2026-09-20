import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Progress from './Progress'
import styles from './Progress.module.scss'

describe('Progress', () => {
  it('renders an accessible clamped progress value, custom palette, and segmented cells', () => {
    const { container } = render(<Progress value={48} max={80} segmentSize={20} color="#7699B5" showLabel />)

    const progress = screen.getByRole('progressbar')
    expect(progress).toHaveAttribute('aria-valuenow', '48')
    expect(progress).toHaveAttribute('aria-valuemax', '80')
    expect(progress.style.getPropertyValue('--star-progress-fill')).toBe('#7699b5')
    expect(progress.style.getPropertyValue('--star-progress-segment-count')).toBe('4')
    expect(screen.getByText('48 / 80')).toBeInTheDocument()
    expect(container.querySelectorAll('[data-slot="progress-cell"]')).toHaveLength(4)
    expect(container.querySelectorAll('[data-filled]')).toHaveLength(2)
  })

  it('clamps values above the maximum', () => {
    render(<Progress value={120} max={100} />)

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100')
  })

  it('defaults to ten-point cells and the crimson health palette', () => {
    const { container } = render(<Progress value={20} />)
    const progress = screen.getByRole('progressbar')

    expect(progress.style.getPropertyValue('--star-progress-fill')).toBe('#ce053c')
    expect(progress.style.getPropertyValue('--star-progress-border')).toBe('#7f2110')
    expect(progress.style.getPropertyValue('--star-progress-shadow')).toBe('#ba7f53')
    expect(progress.style.getPropertyValue('--star-progress-highlight')).toBe('#f9606c')
    expect(container.querySelectorAll('[data-slot="progress-cell"]')).toHaveLength(10)
  })

  it('adds and removes exactly one completed cell per ten-point change', () => {
    const { container, rerender } = render(<Progress value={10} />)
    rerender(<Progress value={20} />)
    expect(container.querySelectorAll('[data-filled]')).toHaveLength(2)
    expect(container.querySelectorAll('[data-motion="in"]')).toHaveLength(1)

    rerender(<Progress value={10} />)
    expect(container.querySelectorAll('[data-filled]')).toHaveLength(1)
    expect(container.querySelectorAll('[data-motion="out"]')).toHaveLength(1)
  })

  it('uses fixed 15 by 25 pixel cells rather than stretching to the container', () => {
    const { container } = render(<Progress value={10} />)
    const cell = container.querySelector('[data-slot="progress-cell"]') as HTMLElement

    expect(cell).toBeInTheDocument()
    expect(cell.className).toContain('star-progress__cell')
  })

  it('offers a compact HUD variant with a distinct root class', () => {
    const { container } = render(<Progress value={20} variant="compact" />)

    expect(container.firstElementChild).toHaveClass(styles['star-progress--compact'])
  })
})
