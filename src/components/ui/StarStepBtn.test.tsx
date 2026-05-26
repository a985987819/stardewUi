import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StarStepBtn } from './StarStepBtn'
import styles from './StarStepBtn.module.scss'

describe('StarStepBtn', () => {
  it('renders the button label', () => {
    render(<StarStepBtn>Click me</StarStepBtn>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('renders four edge elements for the border', () => {
    const { container } = render(<StarStepBtn>Step</StarStepBtn>)
    const edges = container.querySelectorAll(`.${styles['sb__edge']}`)
    expect(edges).toHaveLength(4)
  })

  it('renders corner step elements for level 1 (1 step per corner)', () => {
    const { container } = render(<StarStepBtn>Step</StarStepBtn>)
    const steps = container.querySelectorAll(`.${styles['sb__step']}`)
    expect(steps).toHaveLength(4)
  })

  it('renders corner step elements for level 2 (3 steps per corner)', () => {
    const { container } = render(<StarStepBtn steps={2}>Step</StarStepBtn>)
    const steps = container.querySelectorAll(`.${styles['sb__step']}`)
    expect(steps).toHaveLength(12)
  })

  it('renders the surface element with clip-path', () => {
    const { container } = render(<StarStepBtn>Step</StarStepBtn>)
    const surface = container.querySelector(`.${styles['sb__surface']}`)
    expect(surface).toBeInTheDocument()
  })

  it('disables the button when the disabled prop is set', () => {
    render(<StarStepBtn disabled>Disabled</StarStepBtn>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    expect(btn.classList.contains(styles['sb--disabled'])).toBe(true)
  })

  it('disables the button and shows loading state when loading is true', () => {
    const { container } = render(<StarStepBtn loading>Loading</StarStepBtn>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    expect(btn.classList.contains(styles['sb--loading'])).toBe(true)
    expect(btn.getAttribute('aria-busy')).toBe('true')
    expect(container.querySelectorAll(`.${styles['sb__spinner-dot']}`)).toHaveLength(3)
  })

  it('applies block class when block prop is true', () => {
    render(<StarStepBtn block>Full</StarStepBtn>)
    expect(screen.getByRole('button').classList.contains(styles['sb--block'])).toBe(true)
  })

  it('passes custom color via CSS variable', () => {
    render(<StarStepBtn color="#c62828">Red</StarStepBtn>)
    const btn = screen.getByRole('button')
    expect(btn.style.getPropertyValue('--sb-fill')).toBe('#c62828')
  })

  it('applies seasonal theme colors', () => {
    render(<StarStepBtn theme="spring">Spring</StarStepBtn>)
    const btn = screen.getByRole('button')
    expect(btn.style.getPropertyValue('--sb-fill')).toBe('#8BC34A')
  })

  it('renders icon element', () => {
    const { container } = render(<StarStepBtn icon={<span data-testid="icon">⚡</span>}>Icon</StarStepBtn>)
    expect(container.querySelector(`.${styles['sb__icon']}`)).toBeInTheDocument()
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('applies icon modifier class', () => {
    render(<StarStepBtn icon={<span>⚡</span>}>Icon</StarStepBtn>)
    expect(screen.getByRole('button').classList.contains(styles['sb--icon'])).toBe(true)
  })

  it('generates a surface clip-path with staircase polygon', () => {
    render(<StarStepBtn>Step</StarStepBtn>)
    const btn = screen.getByRole('button')
    const clip = btn.style.getPropertyValue('--sb-surface-clip')
    expect(clip).toContain('polygon(')
  })

  it('handles high step levels by increasing minimum height', () => {
    const { container: c1 } = render(<StarStepBtn steps={5}>Big</StarStepBtn>)
    const btn = c1.querySelector('button') as HTMLElement
    const clip = btn.style.getPropertyValue('--sb-surface-clip')
    expect(clip).toContain('polygon(')
    const minH = btn.style.getPropertyValue('--sb-min-h')
    expect(Number(minH.replace('px', ''))).toBeGreaterThan(38)
  })
})
