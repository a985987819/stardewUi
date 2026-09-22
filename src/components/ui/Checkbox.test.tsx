import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Checkbox from './Checkbox'
import styles from './Checkbox.module.scss'

const options = [
  { value: 'parsnip', label: '防风草' },
  { value: 'potato', label: '土豆' },
  { value: 'strawberry', label: '草莓', disabled: true },
]

describe('Checkbox', () => {
  it('lays options out horizontally by default and toggles an uncontrolled value', () => {
    render(<Checkbox options={options} defaultValue={['parsnip']} aria-label="春季作物" />)

    const group = screen.getByRole('group', { name: '春季作物' })
    expect(group).toHaveClass(styles['star-checkbox--horizontal'])
    expect(screen.getByRole('checkbox', { name: '防风草' })).toHaveAttribute('aria-checked', 'true')

    fireEvent.click(screen.getByRole('checkbox', { name: '土豆' }))

    expect(screen.getByRole('checkbox', { name: '土豆' })).toHaveAttribute('aria-checked', 'true')
  })

  it('reports the full next selection in controlled mode', () => {
    const onChange = vi.fn()
    render(<Checkbox options={options} value={['potato']} onChange={onChange} />)

    fireEvent.click(screen.getByRole('checkbox', { name: '防风草' }))

    expect(onChange).toHaveBeenCalledWith(['potato', 'parsnip'])
    expect(screen.getByRole('checkbox', { name: '防风草' })).toHaveAttribute('aria-checked', 'false')
  })

  it('supports vertical layout, round frames, and all three size classes', () => {
    const { container, rerender } = render(<Checkbox options={options} direction="vertical" shape="round" size="small" />)
    expect(container.firstElementChild).toHaveClass(styles['star-checkbox--vertical'], styles['star-checkbox--round'], styles['star-checkbox--small'])

    rerender(<Checkbox options={options} size="medium" />)
    expect(container.firstElementChild).toHaveClass(styles['star-checkbox--medium'])

    rerender(<Checkbox options={options} size="large" />)
    expect(container.firstElementChild).toHaveClass(styles['star-checkbox--large'])
  })

  it('does not change individually disabled or globally disabled options', () => {
    const onChange = vi.fn()
    const { rerender } = render(<Checkbox options={options} onChange={onChange} />)

    const locked = screen.getByRole('checkbox', { name: '草莓' })
    expect(locked).toBeDisabled()
    fireEvent.click(locked)
    expect(onChange).not.toHaveBeenCalled()

    rerender(<Checkbox options={options} disabled onChange={onChange} />)
    const potato = screen.getByRole('checkbox', { name: '土豆' })
    expect(potato).toBeDisabled()
    fireEvent.click(potato)
    expect(onChange).not.toHaveBeenCalled()
  })
})
