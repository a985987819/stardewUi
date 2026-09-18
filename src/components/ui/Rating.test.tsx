import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Rating from './Rating'

describe('Rating', () => {
  it('uses hearts and exposes the current score as a slider', () => {
    render(<Rating defaultValue={3} aria-label="友情评分" />)

    const rating = screen.getByRole('slider', { name: '友情评分' })
    expect(rating).toHaveAttribute('aria-valuenow', '3')
    expect(screen.getAllByRole('button')).toHaveLength(5)
  })

  it('selects a full icon first, then toggles that icon to a half with a double pointer action', () => {
    const onChange = vi.fn()
    render(<Rating allowHalf onChange={onChange} />)

    const secondHeart = screen.getAllByRole('button')[1]
    fireEvent.pointerUp(secondHeart, { isPrimary: true })
    fireEvent.pointerUp(secondHeart, { isPrimary: true })

    expect(onChange.mock.calls).toEqual([[2], [1.5]])
  })

  it('supports keyboard increments with half points', () => {
    const onChange = vi.fn()
    render(<Rating defaultValue={2} allowHalf onChange={onChange} />)

    fireEvent.keyDown(screen.getByRole('slider'), { key: 'ArrowRight' })
    expect(onChange).toHaveBeenCalledWith(2.5)
  })

  it('does not change a disabled score', () => {
    const onChange = vi.fn()
    render(<Rating defaultValue={2} disabled onChange={onChange} />)

    const rating = screen.getByRole('slider')
    fireEvent.keyDown(rating, { key: 'ArrowRight' })
    fireEvent.click(screen.getAllByRole('button')[3])

    expect(rating).toHaveAttribute('aria-disabled', 'true')
    expect(onChange).not.toHaveBeenCalled()
  })
})
