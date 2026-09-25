import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Divider, { FENCE_POST_BODY_HEIGHT, FENCE_POST_BODY_WIDTH, FENCE_POST_FRAME_WIDTH, FENCE_POST_GAP, FENCE_POST_HEIGHT, FENCE_POST_HIGHLIGHT_THICKNESS, FENCE_POST_PITCH, FENCE_POST_RAIL_FRAME_WIDTH, FENCE_POST_RAIL_GAP, FENCE_POST_RAIL_HEIGHT, FENCE_POST_RAIL_LENGTH, FENCE_POST_RAIL_OFFSET, FENCE_POST_WIDTH, STAR_DIVIDER_CELL, STAR_DIVIDER_GAP, STAR_DIVIDER_HEIGHT, STAR_DIVIDER_PITCH, STAR_DIVIDER_WIDTH } from './Divider'
import styles from './Divider.module.scss'

const posts = (container: HTMLElement) => container.querySelectorAll('[class*="star-divider__post"]')
const frames = (container: HTMLElement) => container.querySelectorAll('[class*="star-divider__frame"]')
const rails = (container: HTMLElement) => container.querySelectorAll('[class*="star-divider__rail"]')
const stars = (container: HTMLElement) => container.querySelectorAll('svg')
const layer = (container: HTMLElement, name: 'shadow' | 'frame' | 'body' | 'highlight') =>
  container.querySelector(`[class*="star-divider__star-${name}"]`)

const pathData = (element: Element | null) => element?.getAttribute('d') ?? ''

/**
 * Every star layer is authored as runs of 1×1 squares (`M x y h w v1 h-w z`), so
 * a path can be measured back to the exact pixels it paints. That lets the tests
 * assert the shading rules rather than just "a path exists".
 */
function pathPixels(d: string) {
  const pixels: Array<{ x: number; y: number }> = []

  for (const [, x, y, width] of d.matchAll(/M(\d+) (\d+)h(\d+)v1h-\d+z/g)) {
    for (let offset = 0; offset < Number(width); offset += 1) {
      pixels.push({ x: Number(x) + offset, y: Number(y) })
    }
  }

  return pixels
}

function pathBounds(d: string) {
  const pixels = pathPixels(d)

  return {
    minX: Math.min(...pixels.map(({ x }) => x)),
    maxX: Math.max(...pixels.map(({ x }) => x)),
    minY: Math.min(...pixels.map(({ y }) => y)),
    maxY: Math.max(...pixels.map(({ y }) => y)),
  }
}

describe('Divider', () => {
  it('renders a horizontal fence separator with one post per count', () => {
    const { container } = render(<Divider count={3} />)
    const divider = screen.getByRole('separator')

    expect(divider).toHaveAttribute('aria-orientation', 'horizontal')
    expect(divider).toHaveClass(styles['star-divider'])
    expect(posts(container)).toHaveLength(3)
  })

  it('gives every post its own frame layer and keeps the posts decorative', () => {
    const { container } = render(<Divider count={2} />)

    expect(frames(container)).toHaveLength(2)
    posts(container).forEach((post) => expect(post).toHaveAttribute('aria-hidden'))
  })

  it('hangs an upper and a lower connecting rail on both sides of every post', () => {
    const { container } = render(<Divider count={2} />)

    expect(rails(container)).toHaveLength(4)
    expect(container.querySelectorAll('[class*="star-divider__rail--lower"]')).toHaveLength(2)
  })

  it('never renders fewer than one post', () => {
    const { container } = render(<Divider count={0} />)
    expect(posts(container)).toHaveLength(1)
  })

  it('falls back to a single post while the container width is unmeasured', () => {
    const { container } = render(<Divider />)
    expect(posts(container)).toHaveLength(1)
  })

  // 自动铺满是「宁可截断也不留空档」：一根横杆左右各伸半个间距，所以 n 格覆盖 n * 50px，
  // 格数要向上取整 —— 多出来的那格会被根节点的 overflow 截掉。
  // jsdom 里 clientWidth 恒为 0、计算样式也拿不到 padding，所以这两样都 mock 出来。
  it('rounds the fitted count up so the fence reaches the far edge', () => {
    const styleSpy = vi.spyOn(window, 'getComputedStyle').mockReturnValue({ paddingLeft: '15px', paddingRight: '15px' } as CSSStyleDeclaration)

    try {
      // 520px 容器：11 格（第 11 格被截），只排 10 格会在右端空掉 50px
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 520 })
      expect(posts(render(<Divider />).container)).toHaveLength(11)

      // 正好是整数个步距时不多排一格（500 = 10 × 50）
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 500 })
      expect(posts(render(<Divider />).container)).toHaveLength(10)

      // 比一格还窄也保底一格，超出的部分裁掉
      Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 50 })
      expect(posts(render(<Divider />).container)).toHaveLength(1)
    } finally {
      delete (HTMLElement.prototype as { clientWidth?: number }).clientWidth
      styleSpy.mockRestore()
    }
  })

  it('forwards extra props and classes to the root', () => {
    render(<Divider count={2} data-testid="fence" className="custom" />)
    const divider = screen.getByTestId('fence')

    expect(divider).toHaveClass('custom')
    expect(divider).toHaveClass(styles['star-divider'])
  })

  describe('colour', () => {
    const themeVars = (element: HTMLElement) => ({
      body: element.style.getPropertyValue('--star-divider-body'),
      frame: element.style.getPropertyValue('--star-divider-frame'),
      highlight: element.style.getPropertyValue('--star-divider-highlight'),
      shadow: element.style.getPropertyValue('--star-divider-shadow'),
    })

    it('publishes the default wood palette as custom properties', () => {
      render(<Divider count={2} />)

      expect(themeVars(screen.getByRole('separator'))).toEqual({
        body: '#fa9405',
        frame: '#9b440d',
        highlight: '#ffd9a3',
        shadow: '#492b18',
      })
    })

    // 改一个颜色，外框/高光/投影必须一起跟着重算，而不是只有主体变色。
    it('derives the whole lighting set from a custom colour', () => {
      render(<Divider count={2} color="#7699B5" />)

      expect(themeVars(screen.getByRole('separator'))).toEqual({
        body: '#7699b5',
        frame: '#4c4f55',
        highlight: '#d9dcd8',
        shadow: '#2c2b34',
      })
    })

    it('shares one palette across both motifs, and keeps a caller style override', () => {
      render(<Divider icon="star" count={2} color="#78ad55" style={{ width: 320 }} />)
      const divider = screen.getByRole('separator')

      expect(divider).toHaveAttribute('data-icon', 'star')
      expect(themeVars(divider).frame).toBe('#4d582a')
      // 调用方自己的 style 仍然生效，且不会把主题变量顶掉。
      expect(divider).toHaveStyle({ width: '320px' })
      expect(themeVars(divider).body).toBe('#78ad55')
    })

    it('falls back to the default wood when the colour cannot be parsed', () => {
      render(<Divider count={2} color="not-a-colour" />)

      expect(themeVars(screen.getByRole('separator')).body).toBe('#fa9405')
    })
  })

  // 这几个数字是产品规格：20×28 的栅栏，上/左/右三边 4px 实心框（底边无框），间隔 30px。改动必须是有意的。
  it('lays out the agreed post geometry', () => {
    expect(FENCE_POST_BODY_WIDTH).toBe(12)
    expect(FENCE_POST_BODY_HEIGHT).toBe(24)
    expect(FENCE_POST_FRAME_WIDTH).toBe(4)
    expect(FENCE_POST_WIDTH).toBe(FENCE_POST_BODY_WIDTH + FENCE_POST_FRAME_WIDTH * 2)
    expect(FENCE_POST_HEIGHT).toBe(FENCE_POST_BODY_HEIGHT + FENCE_POST_FRAME_WIDTH)
    expect(FENCE_POST_GAP).toBe(30)
  })

  // 横杆规格：5.5px 厚（上下各 1.5px 描边 + 2.5px 主体）、距上沿 6px、两根间隔 5px；
  // 各伸半个间距，相邻两格才会在正中对接。
  it('lays out the agreed rail geometry', () => {
    expect(FENCE_POST_RAIL_HEIGHT).toBe(5.5)
    expect(FENCE_POST_RAIL_FRAME_WIDTH).toBe(1.5)
    expect(FENCE_POST_RAIL_OFFSET * 2 + FENCE_POST_RAIL_HEIGHT * 2 + FENCE_POST_RAIL_GAP).toBe(FENCE_POST_HEIGHT)
    expect(FENCE_POST_RAIL_LENGTH * 2).toBe(FENCE_POST_GAP)
    expect(FENCE_POST_PITCH).toBe(FENCE_POST_WIDTH + FENCE_POST_GAP)
  })

  // 高光是贴在边框内侧的一条 3px #ffd9a3，所以必须比 4px 边框窄才装得下、也才看得出是"贴着边框"。
  it('keeps the highlight inside the frame', () => {
    expect(FENCE_POST_HIGHLIGHT_THICKNESS).toBe(3)
    expect(FENCE_POST_HIGHLIGHT_THICKNESS).toBeLessThan(FENCE_POST_FRAME_WIDTH)
  })

  describe('star icon', () => {
    it('keeps the fence by default', () => {
      const { container } = render(<Divider count={2} />)

      expect(screen.getByRole('separator')).toHaveAttribute('data-icon', 'fence')
      expect(stars(container)).toHaveLength(0)
    })

    it('swaps every post for a star, and drops the fence-only rails', () => {
      const { container } = render(<Divider icon="star" count={4} />)

      expect(screen.getByRole('separator')).toHaveAttribute('data-icon', 'star')
      expect(stars(container)).toHaveLength(4)
      expect(posts(container)).toHaveLength(0)
      expect(rails(container)).toHaveLength(0)
    })

    it('paints the four layers back to front, shadow first', () => {
      const { container } = render(<Divider icon="star" count={1} />)
      const order = [...stars(container)[0].querySelectorAll('path')].map((path) => path.getAttribute('class') ?? '')

      expect(order).toHaveLength(4)
      expect(order[0]).toContain('star-shadow')
      expect(order[1]).toContain('star-frame')
      expect(order[2]).toContain('star-body')
      expect(order[3]).toContain('star-highlight')
    })

    it('reuses the fence ink: every layer paints real pixels', () => {
      const { container } = render(<Divider icon="star" count={1} />)

      for (const name of ['shadow', 'frame', 'body', 'highlight'] as const) {
        expect(pathPixels(pathData(layer(container, name))).length, `${name} layer`).toBeGreaterThan(0)
      }
    })

    // 投影 = 整个上墨剪影（外描边 + 主体）向左下平移一格，所以它的像素数正好等于描边 + 主体，
    // 包围盒也正好整体偏移 (-1, +1)。
    it('drops the shadow as the whole silhouette, one cell down-left', () => {
      const { container } = render(<Divider icon="star" count={1} />)
      const frame = pathData(layer(container, 'frame'))
      const body = pathData(layer(container, 'body'))
      const shadow = pathData(layer(container, 'shadow'))

      expect(pathPixels(shadow)).toHaveLength(pathPixels(frame).length + pathPixels(body).length)

      const frameBounds = pathBounds(frame)
      const shadowBounds = pathBounds(shadow)
      expect(shadowBounds.minX).toBe(frameBounds.minX - 1)
      expect(shadowBounds.maxX).toBe(frameBounds.maxX - 1)
      expect(shadowBounds.minY).toBe(frameBounds.minY + 1)
      expect(shadowBounds.maxY).toBe(frameBounds.maxY + 1)
    })

    // 高光和栅栏一样只落在受光侧：贴主体的上沿与右沿，所以它一定被主体包住、且两条受光边都够得着；
    // 但左边那条边不点（见下一条），否则整圈描一圈白边就不像"受光"了。
    it('runs the highlight along the star top and right rim only', () => {
      const { container } = render(<Divider icon="star" count={1} />)
      const body = pathData(layer(container, 'body'))
      const highlight = pathData(layer(container, 'highlight'))

      const bodyBounds = pathBounds(body)
      const highlightBounds = pathBounds(highlight)

      expect(highlightBounds.minX).toBeGreaterThanOrEqual(bodyBounds.minX)
      expect(highlightBounds.maxX).toBeLessThanOrEqual(bodyBounds.maxX)
      expect(highlightBounds.minY).toBeGreaterThanOrEqual(bodyBounds.minY)
      expect(highlightBounds.maxY).toBeLessThanOrEqual(bodyBounds.maxY)

      expect(highlightBounds.minY).toBe(bodyBounds.minY)
      expect(highlightBounds.maxX).toBe(bodyBounds.maxX)
      // 是主体的一部分，不是整块：否则星星会被高光糊满。
      expect(pathPixels(highlight).length).toBeLessThan(pathPixels(body).length)
    })

    // 高光收在主对角线的右上那一半：贴着上、右两条受光边，但左边的尖角保持木色，
    // 于是它读起来是"一个方向的光"，而不是把整颗星描了一圈。
    it('keeps the highlight on the light side of the glyph', () => {
      const { container } = render(<Divider icon="star" count={1} />)
      const highlightBounds = pathBounds(pathData(layer(container, 'highlight')))
      const bodyBounds = pathBounds(pathData(layer(container, 'body')))

      expect(highlightBounds.minX).toBeGreaterThan(bodyBounds.minX)
      expect(highlightBounds.minY).toBeLessThan(bodyBounds.maxY)
    })

    // 星星规格：9×9 主体 + 四周各 1 格外描边 + 左/下各 1 格投影 = 12×12 格，格子 3px。
    it('lays out the agreed star geometry', () => {
      expect(STAR_DIVIDER_CELL).toBe(3)
      expect(STAR_DIVIDER_GAP).toBe(FENCE_POST_GAP)
      expect(STAR_DIVIDER_WIDTH).toBe(STAR_DIVIDER_CELL * 12)
      expect(STAR_DIVIDER_HEIGHT).toBe(STAR_DIVIDER_CELL * 12)
      expect(STAR_DIVIDER_PITCH).toBe(STAR_DIVIDER_WIDTH + STAR_DIVIDER_GAP)
    })

    // 主体就是那 41 格五角星剪影（1 + 3 + 3 + 9 + 7 + 5 + 5 + 4 + 4），换个形状必须是有意的。
    it('keeps the nine-by-nine five-pointed silhouette', () => {
      const { container } = render(<Divider icon="star" count={1} />)

      expect(pathPixels(pathData(layer(container, 'body')))).toHaveLength(41)
    })

    // 星星比栅栏宽（36 vs 20），自动铺满必须按自己的步距算：600px 容器 → 10 颗（600 / 66）。
    it('fits stars to their own pitch', () => {
      const styleSpy = vi.spyOn(window, 'getComputedStyle').mockReturnValue({ paddingLeft: '15px', paddingRight: '15px' } as CSSStyleDeclaration)

      try {
        Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, value: 600 })
        expect(stars(render(<Divider icon="star" />).container)).toHaveLength(10)

        // 同样宽度下栅栏是 12 格（600 / 50），两者互不影响
        expect(posts(render(<Divider />).container)).toHaveLength(12)
      } finally {
        delete (HTMLElement.prototype as { clientWidth?: number }).clientWidth
        styleSpy.mockRestore()
      }
    })
  })
})
