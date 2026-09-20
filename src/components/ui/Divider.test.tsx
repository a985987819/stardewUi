import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Divider, { FENCE_POST_BODY_HEIGHT, FENCE_POST_BODY_WIDTH, FENCE_POST_FRAME_WIDTH, FENCE_POST_GAP, FENCE_POST_HEIGHT, FENCE_POST_HIGHLIGHT_THICKNESS, FENCE_POST_PITCH, FENCE_POST_RAIL_FRAME_WIDTH, FENCE_POST_RAIL_GAP, FENCE_POST_RAIL_HEIGHT, FENCE_POST_RAIL_LENGTH, FENCE_POST_RAIL_OFFSET, FENCE_POST_WIDTH } from './Divider'
import styles from './Divider.module.scss'

const posts = (container: HTMLElement) => container.querySelectorAll('[class*="star-divider__post"]')
const frames = (container: HTMLElement) => container.querySelectorAll('[class*="star-divider__frame"]')
const rails = (container: HTMLElement) => container.querySelectorAll('[class*="star-divider__rail"]')

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

  it('forwards extra props and classes to the root', () => {
    render(<Divider count={2} data-testid="fence" className="custom" />)
    const divider = screen.getByTestId('fence')

    expect(divider).toHaveClass('custom')
    expect(divider).toHaveClass(styles['star-divider'])
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
})
