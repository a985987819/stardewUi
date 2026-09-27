import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Radio from './Radio'
import styles from './Radio.module.scss'

const options = [
  { value: 'wood', label: '木质栅栏' },
  { value: 'stone', label: '石质墙体' },
  { value: 'hardwood', label: '硬木围栏', disabled: true },
]

describe('Radio', () => {
  it('marks the initial option as selected and exposes radiogroup semantics', () => {
    render(<Radio options={options} defaultValue="wood" aria-label="围栏样式" />)

    const group = screen.getByRole('radiogroup', { name: '围栏样式' })
    expect(group).toHaveClass(styles['star-radio--horizontal'])
    expect(screen.getByRole('radio', { name: '木质栅栏' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: '石质墙体' })).toHaveAttribute('aria-checked', 'false')
  })

  it('selects one option in uncontrolled mode and keeps the selection sticky', () => {
    const onChange = vi.fn()
    render(<Radio options={options} onChange={onChange} aria-label="围栏样式" />)

    fireEvent.click(screen.getByRole('radio', { name: '石质墙体' }))
    expect(onChange).toHaveBeenCalledWith('stone')

    onChange.mockClear()
    fireEvent.click(screen.getByRole('radio', { name: '石质墙体' }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('reports the next value in controlled mode without flipping on its own', () => {
    const onChange = vi.fn()
    render(<Radio options={options} value="wood" onChange={onChange} />)

    fireEvent.click(screen.getByRole('radio', { name: '石质墙体' }))

    expect(onChange).toHaveBeenCalledWith('stone')
    expect(screen.getByRole('radio', { name: '木质栅栏' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: '石质墙体' })).toHaveAttribute('aria-checked', 'false')
  })

  it('does not change individually disabled or globally disabled options', () => {
    const onChange = vi.fn()
    const { rerender } = render(<Radio options={options} onChange={onChange} />)

    const locked = screen.getByRole('radio', { name: '硬木围栏' })
    expect(locked).toBeDisabled()
    fireEvent.click(locked)
    expect(onChange).not.toHaveBeenCalled()

    rerender(<Radio options={options} disabled onChange={onChange} />)
    const stone = screen.getByRole('radio', { name: '石质墙体' })
    expect(stone).toBeDisabled()
    fireEvent.click(stone)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('supports vertical layout and all three size classes', () => {
    const { container, rerender } = render(<Radio options={options} direction="vertical" size="small" />)
    expect(container.firstElementChild).toHaveClass(styles['star-radio--vertical'], styles['star-radio--small'])

    rerender(<Radio options={options} size="medium" />)
    expect(container.firstElementChild).toHaveClass(styles['star-radio--medium'])

    rerender(<Radio options={options} size="large" />)
    expect(container.firstElementChild).toHaveClass(styles['star-radio--large'])
  })

  it('keeps the dot mounted across a state change so enter and exit motions can play', async () => {
    const { container } = render(<Radio options={options} />)

    expect(container.querySelector(`.${styles['star-radio__dot']}`)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('radio', { name: '木质栅栏' }))

    await vi.waitFor(() => expect(container.querySelector('[data-motion="in"]')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('radio', { name: '石质墙体' }))
    await vi.waitFor(() => expect(container.querySelector('[data-motion="out"]')).toBeInTheDocument())
  })
})
