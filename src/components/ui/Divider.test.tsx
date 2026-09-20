import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Divider, { FENCE_POST_BODY_HEIGHT, FENCE_POST_BODY_WIDTH, FENCE_POST_FRAME_WIDTH, FENCE_POST_GAP, FENCE_POST_HEIGHT, FENCE_POST_WIDTH } from './Divider'
import styles from './Divider.module.scss'

const posts = (container: HTMLElement) => container.querySelectorAll('[class*="star-divider__post"]')
const frames = (container: HTMLElement) => container.querySelectorAll('[class*="star-divider__frame"]')

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
})
