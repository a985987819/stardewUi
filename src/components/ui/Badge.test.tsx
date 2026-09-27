import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Badge from './Badge'
import styles from './Badge.module.scss'

describe('Badge', () => {
  it('renders the count in a standalone pixel plate', () => {
    render(<Badge count={7} aria-label="7 items" />)

    const badge = screen.getByLabelText('7 items')
    expect(badge).toHaveTextContent('7')
    expect(badge).toHaveClass(styles['star-badge--standalone'])
  })

  it('collapses counts above overflowCount to N+', () => {
    const { rerender } = render(<Badge count={120} data-testid="badge" />)
    expect(screen.getByTestId('badge')).toHaveTextContent('99+')

    rerender(<Badge count={99} data-testid="badge" />)
    expect(screen.getByTestId('badge')).toHaveTextContent('99')
  })

  it('hides at zero unless showZero is set', () => {
    const { rerender, container } = render(<Badge count={0} data-testid="badge" />)
    expect(screen.queryByTestId('badge')).not.toBeInTheDocument()

    rerender(<Badge count={0} showZero data-testid="badge" />)
    expect(screen.getByTestId('badge')).toHaveTextContent('0')

    expect(container).not.toBeEmptyDOMElement()
  })

  it('treats NaN, negative, and fractional counts as whole harvests', () => {
    const { rerender } = render(<Badge count={Number.NaN} data-testid="badge" />)
    expect(screen.queryByTestId('badge')).not.toBeInTheDocument()

    // Negative counts read as "nothing earned" instead of a negative plate.
    rerender(<Badge count={-5} data-testid="badge" />)
    expect(screen.queryByTestId('badge')).not.toBeInTheDocument()
    rerender(<Badge count={-5} showZero data-testid="badge" />)
    expect(screen.getByTestId('badge')).toHaveTextContent('0')

    // Fractions floor to the whole items actually earned.
    rerender(<Badge count={7.9} data-testid="badge" />)
    expect(screen.getByTestId('badge')).toHaveTextContent('7')
  })

  it('renders a square dot without a number in dot mode', () => {
    render(<Badge dot data-testid="dot" />)

    const dot = screen.getByTestId('dot')
    expect(dot).toHaveClass(styles['star-badge--dot'])
    expect(dot).toHaveTextContent('')
  })

  it('pins the badge to the wrapped content corner in wrap mode', () => {
    render(
      <Badge count={3}>
        <button type="button">背包</button>
      </Badge>,
    )

    expect(screen.getByRole('button', { name: '背包' })).toBeInTheDocument()
    const wrapper = screen.getByRole('button', { name: '背包' }).parentElement
    expect(wrapper).toHaveClass(styles['star-badge__wrapper'])
    expect(wrapper?.querySelector(`.${styles['star-badge']}`)).toHaveTextContent('3')
  })

  it('injects the fill colour and derived frame edge as CSS variables', () => {
    render(<Badge count={1} color="#308BE2" data-testid="badge" />)

    const badge = screen.getByTestId('badge')
    expect(badge.style.getPropertyValue('--star-badge-fill')).toBe('#308BE2')
    expect(badge.style.getPropertyValue('--star-badge-edge')).not.toBe('')
    expect(badge.style.getPropertyValue('--star-badge-clip')).toContain('polygon')
  })
})

describe('Badge text mode', () => {
  it('shows custom text instead of the count and stays visible at zero', () => {
    const { rerender } = render(<Badge text="NEW" color="#308BE2" data-testid="badge" />)

    const badge = screen.getByTestId('badge')
    expect(badge).toHaveTextContent('NEW')

    // text mode ignores the count family: zero without showZero stays visible.
    rerender(<Badge text="NEW" count={0} data-testid="badge" />)
    expect(screen.getByTestId('badge')).toHaveTextContent('NEW')
  })

  it('keeps dot mode dominant over text', () => {
    render(<Badge dot text="NEW" data-testid="badge" />)

    const badge = screen.getByTestId('badge')
    expect(badge).toHaveClass(styles['star-badge--dot'])
    expect(badge).toHaveTextContent('')
  })
})
