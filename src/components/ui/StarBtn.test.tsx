import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StarBtn } from './StarBtn'
import styles from './StarBtn.module.scss'

describe('StarBtn', () => {
  it('renders the button label', () => {
    render(<StarBtn>Click me</StarBtn>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('renders four edge elements for the border', () => {
    const { container } = render(<StarBtn>Btn</StarBtn>)
    const edges = container.querySelectorAll(`.${styles['star-btn__edge']}`)
    expect(edges).toHaveLength(4)
  })

  it('renders corner step elements for level 1 (1 step per corner)', () => {
    const { container } = render(<StarBtn>Btn</StarBtn>)
    const steps = container.querySelectorAll(`.${styles['star-btn__step']}`)
    expect(steps).toHaveLength(4)
  })

  it('renders corner step elements for level 2 (3 steps per corner)', () => {
    const { container } = render(<StarBtn steps={2}>Btn</StarBtn>)
    const steps = container.querySelectorAll(`.${styles['star-btn__step']}`)
    expect(steps).toHaveLength(12)
  })

  it('renders the fill element', () => {
    const { container } = render(<StarBtn>Btn</StarBtn>)
    expect(container.querySelector(`.${styles['star-btn__fill']}`)).toBeInTheDocument()
  })

  it('renders the highlight element', () => {
    const { container } = render(<StarBtn>Btn</StarBtn>)
    expect(container.querySelector(`.${styles['star-btn__highlight']}`)).toBeInTheDocument()
  })

  it('disables the button when the disabled prop is set', () => {
    render(<StarBtn disabled>Disabled</StarBtn>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    expect(btn.classList.contains(styles['star-btn--disabled'])).toBe(true)
  })

  it('disables the button and shows loading state when loading is true', () => {
    const { container } = render(<StarBtn loading>Loading</StarBtn>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    expect(btn.classList.contains(styles['star-btn--loading'])).toBe(true)
    expect(btn.getAttribute('aria-busy')).toBe('true')
    expect(container.querySelectorAll(`.${styles['star-btn__spinner-dot']}`)).toHaveLength(3)
  })

  it('applies block class when block prop is true', () => {
    render(<StarBtn block>Full</StarBtn>)
    expect(screen.getByRole('button').classList.contains(styles['star-btn--block'])).toBe(true)
  })

  it('passes custom color via CSS variable', () => {
    render(<StarBtn color="#c62828">Red</StarBtn>)
    const btn = screen.getByRole('button')
    expect(btn.style.getPropertyValue('--btn-fill')).toBeTruthy()
    expect(btn.style.getPropertyValue('--btn-border')).toBeTruthy()
  })

  it('applies seasonal theme palette', () => {
    render(<StarBtn theme="spring">Spring</StarBtn>)
    const btn = screen.getByRole('button')
    expect(btn.style.getPropertyValue('--btn-fill')).toBeTruthy()
  })

  it('renders icon element when icon prop is provided', () => {
    const { container } = render(<StarBtn icon={<span data-testid="icon" />}>Icon</StarBtn>)
    expect(container.querySelector(`.${styles['star-btn__icon']}`)).toBeInTheDocument()
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('applies icon class when icon prop is provided', () => {
    render(<StarBtn icon={<span />}>Icon</StarBtn>)
    expect(screen.getByRole('button').classList.contains(styles['star-btn--icon'])).toBe(true)
  })

  it('clamps steps to max 2 for non-icon buttons', () => {
    const { container: c1 } = render(<StarBtn steps={1}>S1</StarBtn>)
    const inset1 = (c1.querySelector('button') as HTMLElement).style.getPropertyValue('--btn-horizontal-inset')

    const { container: c2 } = render(<StarBtn steps={2}>S2</StarBtn>)
    const inset2 = (c2.querySelector('button') as HTMLElement).style.getPropertyValue('--btn-horizontal-inset')

    expect(parseFloat(inset2)).toBeGreaterThan(parseFloat(inset1))
  })

  it('allows steps up to 3 for icon buttons', () => {
    const { container } = render(<StarBtn steps={3} icon={<span />}>S3</StarBtn>)
    const steps = container.querySelectorAll(`.${styles['star-btn__step']}`)
    expect(steps).toHaveLength(20)
  })
})
