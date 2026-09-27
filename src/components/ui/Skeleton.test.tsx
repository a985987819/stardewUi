import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Skeleton from './Skeleton'
import styles from './Skeleton.module.scss'

describe('Skeleton', () => {
  it('renders a title row and the default three paragraph rows while loading', () => {
    render(<Skeleton data-testid="skeleton" />)

    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton).toHaveAttribute('aria-busy', 'true')
    expect(skeleton.querySelectorAll(`.${styles['star-skeleton__row']}`)).toHaveLength(4)
    expect(skeleton.querySelector(`.${styles['star-skeleton__row--title']}`)).toBeInTheDocument()
  })

  it('respects rows, title, and avatar props', () => {
    const { rerender } = render(<Skeleton rows={5} data-testid="skeleton" />)
    expect(
      screen.getByTestId('skeleton').querySelectorAll(`.${styles['star-skeleton__row']}`),
    ).toHaveLength(6)

    rerender(<Skeleton title={false} data-testid="skeleton" />)
    expect(
      screen.getByTestId('skeleton').querySelector(`.${styles['star-skeleton__row--title']}`),
    ).not.toBeInTheDocument()

    rerender(<Skeleton avatar data-testid="skeleton" />)
    expect(
      screen.getByTestId('skeleton').querySelector(`.${styles['star-skeleton__avatar']}`),
    ).toBeInTheDocument()
  })

  it('shortens the last row to 60% and cycles the rhythm before it', () => {
    render(<Skeleton rows={3} title={false} data-testid="skeleton" />)

    const rows = screen.getByTestId('skeleton').querySelectorAll(`.${styles['star-skeleton__row']}`)
    expect(rows).toHaveLength(3)
    expect(rows[0]).toHaveStyle({ width: '100%' })
    expect(rows[1]).toHaveStyle({ width: '92%' })
    expect(rows[2]).toHaveStyle({ width: '60%' })
  })

  it('swaps to children once loading turns false', () => {
    const { rerender } = render(
      <Skeleton loading data-testid="skeleton">
        <p data-testid="content">收成清单已就绪。</p>
      </Skeleton>,
    )
    expect(screen.queryByTestId('content')).not.toBeInTheDocument()
    expect(screen.getByTestId('skeleton')).toHaveAttribute('aria-busy', 'true')

    rerender(
      <Skeleton loading={false}>
        <p data-testid="content">收成清单已就绪。</p>
      </Skeleton>,
    )
    expect(screen.getByTestId('content')).toHaveTextContent('收成清单已就绪。')
    expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument()
  })

  it('freezes the stripes when active is false', () => {
    render(<Skeleton active={false} data-testid="skeleton" />)

    expect(screen.getByTestId('skeleton')).toHaveClass(styles['star-skeleton--static'])
  })

  it('injects both staircase clip paths as CSS variables', () => {
    render(<Skeleton data-testid="skeleton" />)

    const skeleton = screen.getByTestId('skeleton')
    expect(skeleton.style.getPropertyValue('--star-skeleton-clip-row')).toContain('polygon')
    expect(skeleton.style.getPropertyValue('--star-skeleton-clip-avatar')).toContain('polygon')
  })
})

describe('Skeleton avatarShape', () => {
  it('keeps the stepped square by default and rounds it for circle', () => {
    const { rerender } = render(<Skeleton avatar data-testid="skeleton" />)
    const avatar = screen.getByTestId('skeleton').querySelector(`.${styles['star-skeleton__avatar']}`)
    expect(avatar).not.toHaveClass(styles['star-skeleton__avatar--circle'])

    rerender(<Skeleton avatar avatarShape="circle" data-testid="skeleton" />)
    expect(
      screen.getByTestId('skeleton').querySelector(`.${styles['star-skeleton__avatar']}`),
    ).toHaveClass(styles['star-skeleton__avatar--circle'])
  })
})
