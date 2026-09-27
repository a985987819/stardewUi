import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Select from './Select'
import styles from './Select.module.scss'

const options = [
  { value: 'parsnip', label: '防风草' },
  { value: 'potato', label: '土豆' },
  { value: 'strawberry', label: '草莓', disabled: true },
]

describe('Select', () => {
  it('shows the placeholder until an option is chosen, then opens the folded panel', () => {
    render(<Select options={options} placeholder="选择作物" aria-label="作物" />)

    const trigger = screen.getByRole('button', { name: '作物' })
    expect(trigger).toHaveTextContent('选择作物')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('listbox', { name: '作物' })).not.toBeInTheDocument()

    fireEvent.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('listbox', { name: '作物' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '防风草' })).toBeInTheDocument()
  })

  it('commits the clicked option, closes the panel, and shows its label', () => {
    const onChange = vi.fn()
    render(<Select options={options} onChange={onChange} aria-label="作物" />)

    fireEvent.click(screen.getByRole('button', { name: '作物' }))
    fireEvent.click(screen.getByRole('option', { name: '土豆' }))

    expect(onChange).toHaveBeenCalledWith('potato')
    expect(screen.queryByRole('listbox', { name: '作物' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '作物' })).toHaveTextContent('土豆')
  })

  it('reports the next value in controlled mode without flipping on its own', () => {
    const onChange = vi.fn()
    render(<Select options={options} value="parsnip" onChange={onChange} aria-label="作物" />)

    const trigger = screen.getByRole('button', { name: '作物' })
    expect(trigger).toHaveTextContent('防风草')

    fireEvent.click(trigger)
    const parsnip = screen.getByRole('option', { name: '防风草' })
    expect(parsnip).toHaveAttribute('aria-selected', 'true')

    fireEvent.click(screen.getByRole('option', { name: '土豆' }))

    expect(onChange).toHaveBeenCalledWith('potato')
    expect(trigger).toHaveTextContent('防风草')
  })

  it('marks the defaultValue option as selected before any interaction', () => {
    render(<Select options={options} defaultValue="potato" aria-label="作物" />)

    fireEvent.click(screen.getByRole('button', { name: '作物' }))

    expect(screen.getByRole('option', { name: '土豆' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('option', { name: '防风草' })).toHaveAttribute('aria-selected', 'false')
  })

  it('does not change individually disabled or globally disabled options', () => {
    const onChange = vi.fn()
    const { rerender } = render(<Select options={options} onChange={onChange} aria-label="作物" />)

    fireEvent.click(screen.getByRole('button', { name: '作物' }))
    const locked = screen.getByRole('option', { name: '草莓' })
    expect(locked).toBeDisabled()
    fireEvent.click(locked)
    expect(onChange).not.toHaveBeenCalled()

    rerender(<Select options={options} disabled onChange={onChange} aria-label="作物" />)
    expect(screen.getByRole('button', { name: '作物' })).toBeDisabled()
  })

  it('closes the panel on Escape and on outside clicks', () => {
    render(<Select options={options} aria-label="作物" />)

    fireEvent.click(screen.getByRole('button', { name: '作物' }))
    expect(screen.getByRole('listbox', { name: '作物' })).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('listbox', { name: '作物' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '作物' }))
    fireEvent.click(document.body)
    expect(screen.queryByRole('listbox', { name: '作物' })).not.toBeInTheDocument()
  })

  it('supports vertical scale variants and the block layout', () => {
    const { container, rerender } = render(<Select options={options} size="small" block />)
    expect(container.firstElementChild).toHaveClass(
      styles['star-select--small'],
      styles['star-select--block'],
    )

    rerender(<Select options={options} size="medium" />)
    expect(container.firstElementChild).toHaveClass(styles['star-select--medium'])

    rerender(<Select options={options} size="large" />)
    expect(container.firstElementChild).toHaveClass(styles['star-select--large'])
  })
})
