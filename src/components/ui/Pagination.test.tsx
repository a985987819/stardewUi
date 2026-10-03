import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Pagination from './Pagination'
import styles from './Pagination.module.scss'

describe('Pagination', () => {
  it('renders one chip per page with the first active', () => {
    render(<Pagination total={45} pageSize={10} ariaLabel="公告分页" />)

    expect(screen.getByRole('navigation', { name: '公告分页' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Page 5' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Page 6' })).not.toBeInTheDocument()
  })

  it('steps forward and back, reporting page and pageSize', () => {
    const onChange = vi.fn()
    render(<Pagination total={45} pageSize={10} onChange={onChange} />)

    const prev = screen.getByRole('button', { name: 'Previous page' })
    expect(prev).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onChange).toHaveBeenLastCalledWith(2, 10)
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page')

    fireEvent.click(prev)
    expect(onChange).toHaveBeenLastCalledWith(1, 10)
  })

  it('jumps to a visible chip and folds the run with an ellipsis on long lists', () => {
    const onChange = vi.fn()
    render(<Pagination total={300} onChange={onChange} />)

    // 30 pages with the active page at 1: chips read 1, 2, …, 30.
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Page 2' })).toBeInTheDocument()
    expect(screen.getByText('…')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Page 15' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Page 2' }))
    expect(onChange).toHaveBeenCalledWith(2, 10)
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page')
  })

  it('bridges long page runs with ellipses around the active page', () => {
    render(<Pagination total={300} defaultCurrent={15} />)

    const pages = screen
      .getAllByRole('button')
      .filter((button) => button.getAttribute('aria-label')?.startsWith('Page '))
      .map((button) => button.textContent)
    expect(pages).toEqual(['1', '14', '15', '16', '30'])

    const prev = screen.getByRole('button', { name: 'Previous page' })
    fireEvent.click(prev)
    expect(screen.getByRole('button', { name: 'Page 14' })).toHaveAttribute('aria-current', 'page')
  })

  it('follows controlled current changes', () => {
    const { rerender } = render(<Pagination total={120} current={2} />)

    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page')

    rerender(<Pagination total={120} current={4} />)
    expect(screen.getByRole('button', { name: 'Page 4' })).toHaveAttribute('aria-current', 'page')
  })

  it('renders nothing for a single page when hideOnSinglePage is set', () => {
    const { container, rerender } = render(<Pagination total={8} hideOnSinglePage />)
    expect(container).toBeEmptyDOMElement()

    rerender(<Pagination total={8} />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('collapses NaN and negative totals to an empty board instead of leaking NaN', () => {
    const { container, rerender } = render(<Pagination total={Number.NaN} />)
    expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument()
    expect(container.textContent).not.toContain('NaN')

    rerender(<Pagination total={-20} />)
    expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument()
    expect(container.textContent).not.toContain('-')
  })

  it('renders the custom total copy with the visible range', () => {
    render(<Pagination total={45} defaultCurrent={2} showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条 / 共 ${total} 条`} />)

    expect(screen.getByText('第 11-20 条 / 共 45 条')).toBeInTheDocument()
  })

  it('stamps the active chip with the ink modifier class', () => {
    render(<Pagination total={30} defaultCurrent={3} />)

    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveClass(styles['is-active'])
  })
})

describe('Pagination size changer', () => {
  it('starts at defaultPageSize and re-anchors the page when the size changes', () => {
    const onChange = vi.fn()
    const onShowSizeChange = vi.fn()
    render(
      <Pagination
        total={45}
        defaultPageSize={5}
        defaultCurrent={9}
        showSizeChanger
        pageSizeOptions={[5, 10, 20]}
        onChange={onChange}
        onShowSizeChange={onShowSizeChange}
      />,
    )

    // 45 items at 5 per page → 9 pages; the pager opens on the last page.
    expect(screen.getByRole('button', { name: 'Page 9' })).toHaveAttribute('aria-current', 'page')

    // First visible item was 41; at 20 per page that re-anchors to page 3 of 3.
    fireEvent.change(screen.getByRole('combobox', { name: '每页条数' }), {
      target: { value: '20' },
    })
    expect(onShowSizeChange).toHaveBeenCalledWith(3, 20)
    expect(onChange).toHaveBeenCalledWith(3, 20)
    expect(screen.getByRole('button', { name: 'Page 3' })).toHaveAttribute('aria-current', 'page')
  })

  it('keeps a controlled pageSize owned by the outside', () => {
    const onChange = vi.fn()
    render(
      <Pagination total={45} pageSize={10} current={2} showSizeChanger pageSizeOptions={[5, 10]} onChange={onChange} />,
    )

    fireEvent.change(screen.getByRole('combobox', { name: '每页条数' }), {
      target: { value: '5' },
    })

    // The callback reports the re-anchored page at the new size...
    expect(onChange).toHaveBeenCalledWith(3, 5)
    // ...but the controlled size still drives the chips (5 pages of 10).
    expect(screen.getByRole('button', { name: 'Page 5' })).toBeInTheDocument()
  })

  it('joins the active size into the options when it is missing', () => {
    render(<Pagination total={45} pageSize={7} showSizeChanger />)

    const combo = screen.getByRole('combobox', { name: '每页条数' })
    expect(combo).toHaveValue('7')
  })
})
