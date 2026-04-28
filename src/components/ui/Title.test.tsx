import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Title from './Title'
import styles from './Title.module.scss'

class ResizeObserverMock {
  observe() {}

  disconnect() {}
}

class ImageMock {
  onload: null | (() => void) = null
  onerror: null | (() => void) = null
  decoding = 'async'
  naturalWidth = 1448
  naturalHeight = 698

  set src(_value: string) {
    this.onload?.()
  }
}

vi.stubGlobal('ResizeObserver', ResizeObserverMock)
vi.stubGlobal('Image', ImageMock)
HTMLCanvasElement.prototype.getContext = vi.fn(() => null)

describe('Title', () => {
  it('renders the title content as a heading by default', () => {
    render(<Title>农场任务</Title>)

    expect(screen.getByRole('heading', { name: '农场任务' })).toBeInTheDocument()
  })

  it('applies size and align modifier classes', () => {
    const { container } = render(
      <Title size="large" align="left">
        工坊公告
      </Title>
    )

    expect(container.firstChild).toHaveClass(styles['title-board'], styles['title-board--large'], styles['title-board--left'])
  })

  it('supports semantic tag overrides', () => {
    render(<Title as="h1">季节公告</Title>)

    expect(screen.getByRole('heading', { level: 1, name: '季节公告' })).toBeInTheDocument()
  })
})
