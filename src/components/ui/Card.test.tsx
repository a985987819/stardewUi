import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Card from './Card'

describe('Card', () => {
  describe('基础渲染', () => {
    it('应该正确渲染卡片内容', () => {
      render(<Card>卡片内容</Card>)
      expect(screen.getByText('卡片内容')).toBeInTheDocument()
    })

    it('应该渲染标题', () => {
      render(<Card title="卡片标题">内容</Card>)
      expect(screen.getByText('卡片标题')).toBeInTheDocument()
    })

    it('应该渲染headerExtra', () => {
      render(
        <Card title="标题" headerExtra={<span data-testid="extra">额外内容</span>}>
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
      expect(container.firstChild).toHaveClass('stardew-card--default')
    })

    it('应该应用outlined变体样式', () => {
      const { container } = render(<Card variant="outlined">内容</Card>)
      expect(container.firstChild).toHaveClass('stardew-card--outlined')
    })

    it('应该应用elevated变体样式', () => {
      const { container } = render(<Card variant="elevated">内容</Card>)
      expect(container.firstChild).toHaveClass('stardew-card--elevated')
    })
  })

  describe('尺寸', () => {
    it('应该应用medium尺寸', () => {
      const { container } = render(<Card>内容</Card>)
      expect(container.firstChild).toHaveClass('stardew-card--medium')
    })

    it('应该应用small尺寸', () => {
      const { container } = render(<Card size="small">内容</Card>)
      expect(container.firstChild).toHaveClass('stardew-card--small')
    })

    it('应该应用large尺寸', () => {
      const { container } = render(<Card size="large">内容</Card>)
      expect(container.firstChild).toHaveClass('stardew-card--large')
    })
  })

  describe('配色主题', () => {
    it('应该应用night-village配色', () => {
      const { container } = render(<Card color="night-village">内容</Card>)
      expect(container.firstChild).toHaveClass('stardew-card--color-night-village')
    })

    it('应该应用forest-farm配色', () => {
      const { container } = render(<Card color="forest-farm">内容</Card>)
      expect(container.firstChild).toHaveClass('stardew-card--color-forest-farm')
    })

    it('应该应用wooden-cabin配色', () => {
      const { container } = render(<Card color="wooden-cabin">内容</Card>)
      expect(container.firstChild).toHaveClass('stardew-card--color-wooden-cabin')
    })

    it('应该应用lake-night配色', () => {
      const { container } = render(<Card color="lake-night">内容</Card>)
      expect(container.firstChild).toHaveClass('stardew-card--color-lake-night')
    })

    it('应该应用flower-festival配色', () => {
      const { container } = render(<Card color="flower-festival">内容</Card>)
      expect(container.firstChild).toHaveClass('stardew-card--color-flower-festival')
    })

    it('应该应用mine-starry配色', () => {
      const { container } = render(<Card color="mine-starry">内容</Card>)
      expect(container.firstChild).toHaveClass('stardew-card--color-mine-starry')
    })

    it('应该应用farmland配色', () => {
      const { container } = render(<Card color="farmland">内容</Card>)
      expect(container.firstChild).toHaveClass('stardew-card--color-farmland')
    })

    it('应该应用orchard-grass配色', () => {
      const { container } = render(<Card color="orchard-grass">内容</Card>)
      expect(container.firstChild).toHaveClass('stardew-card--color-orchard-grass')
    })

    it('应该应用workshop-ore配色', () => {
      const { container } = render(<Card color="workshop-ore">内容</Card>)
      expect(container.firstChild).toHaveClass('stardew-card--color-workshop-ore')
    })

    it('应该应用night-celebration配色', () => {
      const { container } = render(<Card color="night-celebration">内容</Card>)
      expect(container.firstChild).toHaveClass('stardew-card--color-night-celebration')
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
      expect(container.firstChild).toHaveClass('stardew-card--hoverable')
    })

    it('应该有clickable样式当提供onClick时', () => {
      const { container } = render(<Card onClick={() => {}}>内容</Card>)
      expect(container.firstChild).toHaveClass('stardew-card--clickable')
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
