import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Collapse from './Collapse'
import type { CollapseItem } from './Collapse'

const items: CollapseItem[] = [
  { key: 'spring', label: '春季', content: '种防风草。' },
  { key: 'summer', label: '夏季', content: '种蓝莓。' },
  { key: 'winter', label: '冬季', content: '钓冰鱼。' },
  { key: 'locked', label: '温室', content: '还没解锁。', disabled: true },
]

describe('Collapse', () => {
  it('renders every header and opens only the default sections', () => {
    render(<Collapse items={items} defaultActiveKeys={['summer']} ariaLabel="季节手账" />)

    expect(screen.getByRole('group', { name: '季节手账' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '春季' })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByRole('button', { name: '夏季' })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('种蓝莓。')).toBeInTheDocument()
    expect(screen.queryByText('种防风草。')).not.toBeInTheDocument()
  })

  it('toggles a section and reports the next keys', () => {
    const onChange = vi.fn()
    render(<Collapse items={items} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: '春季' }))
    expect(onChange).toHaveBeenCalledWith(['spring'])
    expect(screen.getByText('种防风草。')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '春季' }))
    expect(onChange).toHaveBeenCalledWith([])
    expect(screen.queryByText('种防风草。')).not.toBeInTheDocument()
  })

  it('keeps a single section open in accordion mode', () => {
    render(<Collapse items={items} accordion defaultActiveKeys={['spring']} />)

    fireEvent.click(screen.getByRole('button', { name: '夏季' }))
    expect(screen.getByText('种蓝莓。')).toBeInTheDocument()
    expect(screen.queryByText('种防风草。')).not.toBeInTheDocument()

    // Clicking the open section closes it and opens nothing else.
    fireEvent.click(screen.getByRole('button', { name: '夏季' }))
    expect(screen.queryByText('种蓝莓。')).not.toBeInTheDocument()
  })

  it('follows controlled activeKeys', () => {
    const { rerender } = render(<Collapse items={items} activeKeys={['spring']} />)

    expect(screen.getByText('种防风草。')).toBeInTheDocument()

    rerender(<Collapse items={items} activeKeys={[]} />)
    expect(screen.queryByText('种防风草。')).not.toBeInTheDocument()
  })

  it('ignores clicks on disabled sections', () => {
    const onChange = vi.fn()
    render(<Collapse items={items} onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: '温室' }))

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.queryByText('还没解锁。')).not.toBeInTheDocument()
  })

  it('links each header to its panel through aria-controls', () => {
    render(<Collapse items={items} defaultActiveKeys={['winter']} />)

    const header = screen.getByRole('button', { name: '冬季' })
    const panelId = header.getAttribute('aria-controls')
    expect(panelId).toBeTruthy()
    expect(screen.getByText('钓冰鱼。').parentElement).toHaveAttribute('aria-labelledby', header.id)
  })
})
