import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PixelStepButton } from './PixelStepButton'
import styles from './PixelStepButton.module.scss'

describe('PixelStepButton', () => {
  it('renders the button label', () => {
    render(<PixelStepButton>Click me</PixelStepButton>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('renders four edge elements for the border', () => {
    const { container } = render(<PixelStepButton>Step</PixelStepButton>)
    const edges = container.querySelectorAll(`.${styles['ps-btn__edge']}`)
    expect(edges).toHaveLength(4)
  })

  it('renders corner step elements for level 1 (1 step per corner)', () => {
    const { container } = render(<PixelStepButton>Step</PixelStepButton>)
    const steps = container.querySelectorAll(`.${styles['ps-btn__step']}`)
    expect(steps).toHaveLength(4)
  })

  it('renders corner step elements for level 2 (3 steps per corner)', () => {
    const { container } = render(<PixelStepButton steps={2}>Step</PixelStepButton>)
    const steps = container.querySelectorAll(`.${styles['ps-btn__step']}`)
    expect(steps).toHaveLength(12)
  })

  it('renders corner step elements for level 3 (5 steps per corner)', () => {
    const { container } = render(<PixelStepButton steps={3}>Step</PixelStepButton>)
    const steps = container.querySelectorAll(`.${styles['ps-btn__step']}`)
    expect(steps).toHaveLength(20)
  })

  it('renders the surface element with clip-path', () => {
    const { container } = render(<PixelStepButton>Step</PixelStepButton>)
    const surface = container.querySelector(`.${styles['ps-btn__surface']}`)
    expect(surface).toBeInTheDocument()
  })

  it('disables the button when the disabled prop is set', () => {
    render(<PixelStepButton disabled>Disabled</PixelStepButton>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    expect(btn.classList.contains(styles['ps-btn--disabled'])).toBe(true)
  })

  it('disables the button and shows loading state when loading is true', () => {
    const { container } = render(<PixelStepButton loading>Loading</PixelStepButton>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    expect(btn.classList.contains(styles['ps-btn--loading'])).toBe(true)
    expect(btn.getAttribute('aria-busy')).toBe('true')
    expect(container.querySelectorAll(`.${styles['ps-btn__spinner-dot']}`)).toHaveLength(3)
  })

  it('applies block class when block prop is true', () => {
    render(<PixelStepButton block>Full</PixelStepButton>)
    expect(screen.getByRole('button').classList.contains(styles['ps-btn--block'])).toBe(true)
  })

  it('passes custom color via CSS variable', () => {
    render(<PixelStepButton color="#c62828">Red</PixelStepButton>)
    const btn = screen.getByRole('button')
    expect(btn.style.getPropertyValue('--ps-btn-color')).toBe('#c62828')
  })

  it('generates a surface clip-path with staircase polygon', () => {
    render(<PixelStepButton>Step</PixelStepButton>)
    const btn = screen.getByRole('button')
    const clip = btn.style.getPropertyValue('--ps-btn-surface-clip')
    expect(clip).toContain('polygon(')
  })

  it('sets horizontal and vertical inset based on step level', () => {
    const { container: c1 } = render(<PixelStepButton steps={1}>S1</PixelStepButton>)
    const inset1 = (c1.querySelector('button') as HTMLElement).style.getPropertyValue('--ps-btn-horizontal-inset')

    const { container: c2 } = render(<PixelStepButton steps={2}>S2</PixelStepButton>)
    const inset2 = (c2.querySelector('button') as HTMLElement).style.getPropertyValue('--ps-btn-horizontal-inset')

    expect(parseFloat(inset2)).toBeGreaterThan(parseFloat(inset1))
  })
})
