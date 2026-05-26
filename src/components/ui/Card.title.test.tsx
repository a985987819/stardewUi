import '@testing-library/jest-dom/vitest'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Card from './Card'

describe('Card title area', () => {
  it('does not render title area by default', () => {
    render(<Card title="默认卡片">内容</Card>)

    expect(screen.queryByRole('heading', { name: '默认卡片' })).not.toBeInTheDocument()
  })

  it('renders title area when showTitle is enabled', () => {
    render(
      <Card title="默认卡片" showTitle>
        内容
      </Card>
    )

    expect(screen.getByRole('heading', { name: '默认卡片' })).toBeInTheDocument()
  })

  it('applies grouped card palette variables from the edge color', () => {
    const { container } = render(
      <Card title="Big Chest" showTitle>
        Content
      </Card>
    )

    expect(container.firstElementChild).toHaveStyle({
      '--card-frame-shadow-right': '#6d2605',
    })
  })

  it('exposes the text shadow variable for card text', () => {
    const { container } = render(
      <Card title="Big Chest" showTitle>
        Content
      </Card>
    )

    expect((container.firstElementChild as HTMLElement).style.getPropertyValue('--card-text-shadow')).toBe(
      'rgba(56, 26, 5, 0.35)'
    )
  })

  it('renders header extra only alongside title area', () => {
    const { rerender } = render(
      <Card title="默认卡片" headerExtra={<span>额外操作</span>}>
        内容
      </Card>
    )

    expect(screen.queryByText('额外操作')).not.toBeInTheDocument()

    rerender(
      <Card title="默认卡片" showTitle headerExtra={<span>额外操作</span>}>
        内容
      </Card>
    )

    expect(screen.getByRole('heading', { name: '默认卡片' })).toBeInTheDocument()
    expect(screen.getByText('额外操作')).toBeInTheDocument()
  })
})
