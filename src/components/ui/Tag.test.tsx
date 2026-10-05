import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Tag from './Tag'
import styles from './Tag.module.scss'

describe('Tag', () => {
  it('renders its children and passes through a custom className', () => {
    const { container } = render(<Tag className="is-pinned">铱星品质</Tag>)

    expect(screen.getByText('铱星品质')).toBeInTheDocument()
    expect(container.firstElementChild).toHaveClass('is-pinned', styles['star-tag'])
  })

  it('applies a tone preset modifier class', () => {
    const { container, rerender } = render(<Tag tone="green">新鲜作物</Tag>)
    expect(container.firstElementChild).toHaveClass(styles['star-tag--green'])

    rerender(<Tag tone="blue">深海鱼</Tag>)
    expect(container.firstElementChild).toHaveClass(styles['star-tag--blue'])
    expect(container.firstElementChild).not.toHaveClass(styles['star-tag--green'])
  })

  it('lets an explicit color override the tone preset', () => {
    const { container } = render(
      <Tag tone="green" color="#4a7c2f">
        新鲜作物
      </Tag>,
    )
    const tag = container.firstElementChild as HTMLElement

    // The preset still supplies the class, but the inline custom properties win,
    // so the ring / text / accent all land on the given colour.
    expect(tag).toHaveClass(styles['star-tag--green'])
    expect(tag.style.getPropertyValue('--tag-ring')).toBe('#4a7c2f')
    expect(tag.style.getPropertyValue('--tag-text')).toBe('#4a7c2f')
    expect(tag.style.getPropertyValue('--tag-accent')).toBe('#4a7c2f')
  })

  it('keeps the default tag free of a preset modifier class', () => {
    const { container } = render(<Tag>普通品质</Tag>)

    expect(container.firstElementChild).not.toHaveClass(styles['star-tag--green'])
    expect(container.firstElementChild).not.toHaveClass(styles['star-tag--red'])
  })

  it('hides the close button until closable is set', () => {
    const { rerender } = render(<Tag>防风草</Tag>)
    expect(screen.queryByRole('button', { name: '移除' })).not.toBeInTheDocument()

    rerender(<Tag closable closeLabel="移除">防风草</Tag>)
    expect(screen.getByRole('button', { name: '移除' })).toBeInTheDocument()
  })

  it('removes itself and reports onClose when the close button is pressed', () => {
    const onClose = vi.fn()
    const { container } = render(
      <Tag closable closeLabel="移除" onClose={onClose}>
        土豆
      </Tag>,
    )

    fireEvent.click(screen.getByRole('button', { name: '移除' }))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(container).toBeEmptyDOMElement()
  })
})
