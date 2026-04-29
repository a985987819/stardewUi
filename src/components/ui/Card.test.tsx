import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import Card from './Card'
import styles from './Card.module.scss'

describe('Card', () => {
  it('renders children and footer content', () => {
    render(<Card footer={<span>底部内容</span>}>卡片内容</Card>)

    expect(screen.getByText('卡片内容')).toBeInTheDocument()
    expect(screen.getByText('底部内容')).toBeInTheDocument()
  })

  it('does not render canvas elements', () => {
    const { container } = render(<Card>内容</Card>)

    expect(container.querySelector('canvas')).not.toBeInTheDocument()
  })

  it('applies clickable and hoverable classes based on interaction props', () => {
    const handleClick = vi.fn()
    const { container } = render(
      <Card hoverable onClick={handleClick}>
        内容
      </Card>
    )
    const card = container.firstElementChild as HTMLElement

    expect(card).toHaveClass(styles['stardew-card--hoverable'])
    expect(card).toHaveClass(styles['stardew-card--clickable'])

    fireEvent.click(card)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('accepts custom className', () => {
    const { container } = render(<Card className="my-custom-card">内容</Card>)

    expect(container.firstElementChild).toHaveClass('my-custom-card')
  })

  it('keeps Card.Meta API behavior', () => {
    const { container } = render(
      <Card>
        <Card.Meta title="Meta标题" description="Meta描述" className="my-meta" />
      </Card>
    )

    expect(screen.getByText('Meta标题')).toBeInTheDocument()
    expect(screen.getByText('Meta描述')).toBeInTheDocument()
    expect(container.querySelector('.my-meta')).toBeInTheDocument()
  })

  it('keeps Card.Image API behavior', () => {
    const { container } = render(
      <Card>
        <Card.Image src="/test.png" alt="测试图片" className="my-image" />
      </Card>
    )

    const image = screen.getByAltText('测试图片')
    expect(image).toHaveAttribute('src', '/test.png')
    expect(container.querySelector('.my-image')).toBeInTheDocument()
  })
})
