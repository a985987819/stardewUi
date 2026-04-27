import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import StarEmptyState, { EMPTY_STATE_DEFAULT_IMAGE_SRC } from './EmptyState'
import styles from './EmptyState.module.css'

describe('StarEmptyState', () => {
  it('renders the default image and message', () => {
    render(<StarEmptyState />)

    expect(screen.getByText('没有更多数据了')).toBeInTheDocument()
    expect(screen.getByAltText('暂无数据')).toHaveAttribute('src', EMPTY_STATE_DEFAULT_IMAGE_SRC)
  })

  it('can hide the image', () => {
    render(<StarEmptyState showImage={false} />)

    expect(screen.queryByAltText('暂无数据')).not.toBeInTheDocument()
    expect(screen.getByText('没有更多数据了')).toBeInTheDocument()
  })

  it('can hide the message', () => {
    render(<StarEmptyState showMessage={false} />)

    expect(screen.queryByText('没有更多数据了')).not.toBeInTheDocument()
    expect(screen.getByAltText('暂无数据')).toBeInTheDocument()
  })

  it('uses the horizontal layout class when configured', () => {
    const { container } = render(<StarEmptyState direction="horizontal" />)

    expect(container.firstChild).toHaveClass(styles['stardew-empty-state--horizontal'])
  })

  it('supports custom content', () => {
    render(<StarEmptyState imageSrc="/custom-empty.png" imageAlt="自定义空状态" message="这里什么都没有" />)

    expect(screen.getByAltText('自定义空状态')).toHaveAttribute('src', '/custom-empty.png')
    expect(screen.getByText('这里什么都没有')).toBeInTheDocument()
  })
})
