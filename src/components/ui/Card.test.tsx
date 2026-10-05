import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Card from './Card'
import styles from './Card.module.scss'

describe('Card', () => {
  describe('基础渲染', () => {
    it('应该正确渲染卡片内容', () => {
      render(<Card>卡片内容</Card>)
      expect(screen.getByText('卡片内容')).toBeInTheDocument()
    })

    it('应该渲染标题', () => {
      render(<Card title="卡片标题" showTitle>内容</Card>)
      expect(screen.getByText('卡片标题')).toBeInTheDocument()
    })

    it('应该渲染headerExtra', () => {
      render(
        <Card title="标题" showTitle headerExtra={<span data-testid="extra">额外内容</span>}>
          内容
        </Card>
      )
      expect(screen.getByTestId('extra')).toBeInTheDocument()
    })

    it('应该渲染footer', () => {
      render(<Card footer={<span data-testid="footer">底部内容</span>}>内容</Card>)
      expect(screen.getByTestId('footer')).toBeInTheDocument()
    })
  })

  describe('变体样式', () => {
    it('应该应用默认变体样式', () => {
      const { container } = render(<Card>内容</Card>)
      expect(container.firstChild).toHaveClass(styles['stardew-card--default'])
    })

    it('应该应用outlined变体样式', () => {
      const { container } = render(<Card variant="outlined">内容</Card>)
      expect(container.firstChild).toHaveClass(styles['stardew-card--outlined'])
    })

    it('应该应用elevated变体样式', () => {
      const { container } = render(<Card variant="elevated">内容</Card>)
      expect(container.firstChild).toHaveClass(styles['stardew-card--elevated'])
    })
  })

  describe('尺寸', () => {
    it('应该应用medium尺寸', () => {
      const { container } = render(<Card>内容</Card>)
      expect(container.firstChild).toHaveClass(styles['stardew-card--medium'])
    })

    it('应该应用small尺寸', () => {
      const { container } = render(<Card size="small">内容</Card>)
      expect(container.firstChild).toHaveClass(styles['stardew-card--small'])
    })

    it('应该应用large尺寸', () => {
      const { container } = render(<Card size="large">内容</Card>)
      expect(container.firstChild).toHaveClass(styles['stardew-card--large'])
    })
  })

  describe('配色主题', () => {
    it('treats a custom color as the visible card surface and derives its lighting layers', () => {
      const { container } = render(<Card color="#7699B5">内容</Card>)
      const card = container.firstChild as HTMLElement

      expect(card.style.getPropertyValue('--card-bg')).toBe('#7699b5')
      expect(card.style.getPropertyValue('--card-border-dark')).not.toBe('#7699b5')
      expect(card.style.getPropertyValue('--card-body-right-shadow')).toMatch(/^rgba\(/)
    })

    // The named palettes arrive through `surface`, and they land in the same
    // `--card-bg` custom property a raw CSS colour does — there is no preset
    // class, because a class could only carry a fixed value while the colour
    // needs to drive the derived lighting layers. So each preset is checked by
    // the body colour it actually resolves to.
    it.each([
      ['night-village', '#774b62'],
      ['forest-farm', '#82b651'],
      ['wooden-cabin', '#d36c2a'],
      ['lake-night', '#4988c3'],
      ['flower-festival', '#bd7e99'],
      ['mine-starry', '#6a7dc9'],
      ['farmland', '#cc7f47'],
      ['orchard-grass', '#6aa545'],
      ['workshop-ore', '#6b7e90'],
      ['night-celebration', '#3d56ce'],
    ] as const)('resolves the %s surface preset', (preset, expected) => {
      const { container } = render(<Card surface={preset}>内容</Card>)
      const card = container.firstChild as HTMLElement

      expect(card.style.getPropertyValue('--card-bg')).toBe(expected)
    })

    it('lets surface win over color when both are given', () => {
      const { container } = render(
        <Card surface="night-village" color="#123456">
          内容
        </Card>,
      )
      const card = container.firstChild as HTMLElement

      expect(card.style.getPropertyValue('--card-bg')).toBe('#774b62')
    })
  })

  describe('交互功能', () => {
    it('应该响应点击事件', () => {
      const handleClick = vi.fn()
      const { container } = render(<Card onClick={handleClick}>内容</Card>)

      fireEvent.click(container.firstChild as Element)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('应该有hoverable样式', () => {
      const { container } = render(<Card hoverable>内容</Card>)
      expect(container.firstChild).toHaveClass(styles['stardew-card--hoverable'])
    })

    it('应该有clickable样式当提供onClick时', () => {
      const { container } = render(<Card onClick={() => { }}>内容</Card>)
      expect(container.firstChild).toHaveClass(styles['stardew-card--clickable'])
    })
  })

  describe('自定义类名', () => {
    it('应该接受自定义类名', () => {
      const { container } = render(<Card className="my-custom-card">内容</Card>)
      expect(container.firstChild).toHaveClass('my-custom-card')
    })
  })

  describe('Card.Meta', () => {
    it('应该渲染Meta标题', () => {
      render(
        <Card>
          <Card.Meta title="Meta标题" />
        </Card>
      )
      expect(screen.getByText('Meta标题')).toBeInTheDocument()
    })

    it('应该渲染Meta描述', () => {
      render(
        <Card>
          <Card.Meta description="Meta描述" />
        </Card>
      )
      expect(screen.getByText('Meta描述')).toBeInTheDocument()
    })

    it('应该同时渲染Meta标题和描述', () => {
      render(
        <Card>
          <Card.Meta title="标题" description="描述" />
        </Card>
      )
      expect(screen.getByText('标题')).toBeInTheDocument()
      expect(screen.getByText('描述')).toBeInTheDocument()
    })

    it('应该接受自定义类名', () => {
      const { container } = render(
        <Card>
          <Card.Meta title="标题" className="my-meta" />
        </Card>
      )
      expect(container.querySelector('.my-meta')).toBeInTheDocument()
    })
  })

  describe('Card.Image', () => {
    it('应该渲染图片', () => {
      render(
        <Card>
          <Card.Image src="/test.png" alt="测试图片" />
        </Card>
      )
      const img = screen.getByAltText('测试图片')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', '/test.png')
    })

    it('应该接受自定义类名', () => {
      const { container } = render(
        <Card>
          <Card.Image src="/test.png" alt="测试" className="my-image" />
        </Card>
      )
      expect(container.querySelector('.my-image')).toBeInTheDocument()
    })
  })
})
