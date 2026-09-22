import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Tab from './Tab'

const items = [
  { key: 'spring', label: '春天', content: '春季内容' },
  { key: 'summer', label: '夏天', content: '夏季内容' },
  { key: 'winter', label: '冬天', content: '冬季内容', disabled: true },
]

describe('Tab', () => {
  it('renders the first tab and swaps content on click', () => {
    render(<Tab items={items} />)

    expect(screen.getByRole('tab', { name: '春天' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByText('春季内容')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: '夏天' }))

    expect(screen.getByText('夏季内容')).toBeInTheDocument()
    expect(screen.queryByText('春季内容')).toBeNull()
    expect(screen.getByRole('tab', { name: '夏天' })).toHaveAttribute('aria-selected', 'true')
  })

  it('honours defaultActiveKey and reports changes through onChange', () => {
    const handleChange = vi.fn()

    render(<Tab items={items} defaultActiveKey="summer" onChange={handleChange} />)

    expect(screen.getByText('夏季内容')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: '春天' }))

    expect(handleChange).toHaveBeenCalledWith('spring')
  })

  it('stays on the controlled key until the owner updates it', () => {
    const handleChange = vi.fn()

    render(<Tab items={items} activeKey="spring" onChange={handleChange} />)

    fireEvent.click(screen.getByRole('tab', { name: '夏天' }))

    expect(handleChange).toHaveBeenCalledWith('summer')
    expect(screen.getByText('春季内容')).toBeInTheDocument()
  })

  it('ignores clicks on a disabled tab', () => {
    const handleChange = vi.fn()

    render(<Tab items={items} onChange={handleChange} />)

    const disabledTab = screen.getByRole('tab', { name: '冬天' })

    expect(disabledTab).toBeDisabled()

    fireEvent.click(disabledTab)

    expect(handleChange).not.toHaveBeenCalled()
    expect(screen.getByText('春季内容')).toBeInTheDocument()
  })

  it('labels the content panel with the active tab', () => {
    render(<Tab items={items} />)

    const panel = screen.getByRole('tabpanel')

    expect(panel).toHaveAttribute('aria-labelledby', screen.getByRole('tab', { name: '春天' }).id)
    expect(screen.getByRole('tab', { name: '春天' })).toHaveAttribute('aria-controls', panel.id)
  })

  it('keeps the tab strip inside the content panel by default', () => {
    render(<Tab items={items} />)

    expect(screen.getByRole('tabpanel')).toContainElement(screen.getByRole('tablist'))
  })

  describe('external navigation', () => {
    it('moves the tab strip out of the content panel', () => {
      const { container } = render(<Tab items={items} external />)

      const panel = screen.getByRole('tabpanel')
      const tablist = screen.getByRole('tablist')

      expect(panel).not.toContainElement(tablist)
      // 但两者仍然同属一个选项卡容器，且选项卡排在内容框之前。
      expect(container.firstElementChild).toContainElement(tablist)
      expect(
        panel.compareDocumentPosition(tablist) & Node.DOCUMENT_POSITION_PRECEDING,
      ).toBeTruthy()
      expect(screen.getByText('春季内容')).toBeInTheDocument()
    })

    it('places the tab strip after the content panel when position is bottom', () => {
      render(<Tab items={items} position="bottom" external />)

      const panel = screen.getByRole('tabpanel')
      const tablist = screen.getByRole('tablist')

      expect(panel).not.toContainElement(tablist)
      expect(
        panel.compareDocumentPosition(tablist) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy()
    })

    it('still switches content while the navigation is external', () => {
      render(<Tab items={items} external />)

      fireEvent.click(screen.getByRole('tab', { name: '夏天' }))

      expect(screen.getByText('夏季内容')).toBeInTheDocument()
    })
  })
})
