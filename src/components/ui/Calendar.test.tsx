import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getMonthStartTimestamp } from '../../utils/calendar'
import Calendar from './Calendar'
import { formatMonthLabel } from './calendarLabels'

const MAY_2024 = new Date(2024, 4, 1).getTime()
// 直接复用组件里的格式化实现，避免把 Intl 的“2024年5月”写死在断言里。
const MAY_2024_LABEL = formatMonthLabel(MAY_2024)

function getDayButton(label: string) {
  return screen.getByRole('button', { name: label })
}

describe('Calendar', () => {
  it('renders event markers on the matching day', () => {
    render(
      <Calendar
        value={MAY_2024}
        items={[
          {
            date: '2024-05-13',
            title: 'Egg Festival',
            description: 'Town square gathering.',
          },
        ]}
      />,
    )

    const dayButton = getDayButton('2024-05-13')

    expect(within(dayButton).getByLabelText('Egg Festival')).toBeInTheDocument()
  })

  it('uses icon priority node over src over key', () => {
    render(
      <Calendar
        value={MAY_2024}
        iconMap={{
          seed: <span data-testid="key-icon">Key icon</span>,
        }}
        items={[
          {
            date: '2024-05-13',
            title: 'Node icon item',
            iconNode: <span data-testid="node-icon">Node icon</span>,
            iconSrc: '/icon-src.png',
            iconKey: 'seed',
          },
          {
            date: '2024-05-13',
            title: 'Src icon item',
            iconSrc: '/icon-src.png',
            iconKey: 'seed',
          },
          {
            date: '2024-05-13',
            title: 'Key icon item',
            iconKey: 'seed',
          },
        ]}
      />,
    )

    const dayButton = getDayButton('2024-05-13')

    expect(within(dayButton).getByTestId('node-icon')).toBeInTheDocument()
    expect(within(dayButton).getByAltText('Src icon item')).toHaveAttribute('src', '/icon-src.png')
    expect(within(dayButton).getByTestId('key-icon')).toBeInTheDocument()
    expect(within(dayButton).queryByAltText('Node icon item')).toBeNull()
  })

  it('shows +N summary when markers exceed visible limit', () => {
    render(
      <Calendar
        value={MAY_2024}
        maxVisibleMarkers={2}
        items={[
          { date: '2024-05-13', title: 'One' },
          { date: '2024-05-13', title: 'Two' },
          { date: '2024-05-13', title: 'Three' },
          { date: '2024-05-13', title: 'Four' },
        ]}
      />,
    )

    const dayButton = getDayButton('2024-05-13')

    expect(within(dayButton).getAllByLabelText(/^(One|Two)$/)).toHaveLength(2)
    expect(within(dayButton).getByText('+2')).toBeInTheDocument()
  })

  it('shows full item details on hover or focus', () => {
    render(
      <Calendar
        value={MAY_2024}
        items={[
          {
            date: '2024-05-13',
            title: 'Egg Festival',
            description: 'Town square gathering.',
          },
          {
            date: '2024-05-13',
            title: 'Harvey Visit',
            description: 'Clinic checkup reminder.',
          },
        ]}
      />,
    )

    const dayButton = getDayButton('2024-05-13')

    fireEvent.mouseEnter(dayButton)

    expect(screen.getByText('Egg Festival')).toBeInTheDocument()
    expect(screen.getByText('Town square gathering.')).toBeInTheDocument()
    expect(screen.getByText('Harvey Visit')).toBeInTheDocument()
    expect(screen.getByText('Clinic checkup reminder.')).toBeInTheDocument()

    fireEvent.mouseLeave(dayButton)

    expect(screen.queryByText('Egg Festival')).toBeNull()

    fireEvent.focus(dayButton)

    expect(screen.getByText('Egg Festival')).toBeInTheDocument()
    expect(screen.getByText('Town square gathering.')).toBeInTheDocument()
    expect(screen.getByText('Harvey Visit')).toBeInTheDocument()
    expect(screen.getByText('Clinic checkup reminder.')).toBeInTheDocument()
  })

  it('shows full item details on click for pointer users', () => {
    render(
      <Calendar
        value={MAY_2024}
        items={[
          {
            date: '2024-05-13',
            title: 'Luau Prep',
            description: 'Bring a gold-quality ingredient.',
          },
        ]}
      />,
    )

    const dayButton = getDayButton('2024-05-13')

    fireEvent.click(dayButton)

    expect(screen.getByText('Luau Prep')).toBeInTheDocument()
    expect(screen.getByText('Bring a gold-quality ingredient.')).toBeInTheDocument()
  })

  it('clears stale details when a controlled value changes to another month', () => {
    const { rerender } = render(
      <Calendar
        value={MAY_2024}
        items={[
          {
            date: '2024-05-13',
            title: 'Egg Festival',
            description: 'Town square gathering.',
          },
        ]}
      />,
    )

    fireEvent.click(getDayButton('2024-05-13'))

    expect(screen.getByText('Egg Festival')).toBeInTheDocument()

    rerender(
      <Calendar
        value={new Date(2024, 5, 1).getTime()}
        items={[
          {
            date: '2024-05-13',
            title: 'Egg Festival',
            description: 'Town square gathering.',
          },
        ]}
      />,
    )

    expect(screen.queryByText('Egg Festival')).toBeNull()
  })

  it('shows details for a valid day timestamp of zero', () => {
    render(
      <Calendar
        value={new Date(1970, 0, 1).getTime()}
        items={[
          {
            date: new Date(1970, 0, 1).getTime(),
            title: 'New Year',
            description: 'The first day of the Unix epoch.',
          },
        ]}
      />,
    )

    fireEvent.click(getDayButton('1970-01-01'))

    expect(screen.getByText('New Year')).toBeInTheDocument()
    expect(screen.getByText('The first day of the Unix epoch.')).toBeInTheDocument()
  })

  it('clicking month navigation triggers onMonthChange with the normalized month start timestamp', () => {
    const handleMonthChange = vi.fn()

    render(
      <Calendar
        value={MAY_2024}
        onMonthChange={handleMonthChange}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Next month' }))

    expect(handleMonthChange).toHaveBeenCalledWith(getMonthStartTimestamp('2024-06-01'))
  })

  describe('year and month quick switch', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    function openMonthPanel() {
      fireEvent.click(screen.getByRole('button', { name: MAY_2024_LABEL }))

      return screen.getByRole('dialog', { name: '选择年月' })
    }

    it('jumps to a month picked from the dropdown and closes the panel', () => {
      const handleMonthChange = vi.fn()

      render(<Calendar value={MAY_2024} onMonthChange={handleMonthChange} />)

      const panel = openMonthPanel()

      fireEvent.click(within(panel).getByRole('button', { name: '2024年9月' }))

      expect(handleMonthChange).toHaveBeenCalledWith(getMonthStartTimestamp('2024-09-01'))
      expect(screen.queryByRole('dialog')).toBeNull()
    })

    it('picks a year first and then a month of that year', () => {
      const handleMonthChange = vi.fn()

      render(<Calendar value={MAY_2024} onMonthChange={handleMonthChange} />)

      const panel = openMonthPanel()

      // 标题在月视图里显示年份，点一下切到年份网格。
      fireEvent.click(within(panel).getByRole('button', { name: '2024年' }))
      fireEvent.click(within(panel).getByRole('button', { name: '2026年' }))
      fireEvent.click(within(panel).getByRole('button', { name: '2026年2月' }))

      expect(handleMonthChange).toHaveBeenCalledWith(getMonthStartTimestamp('2026-02-01'))
    })

    it('pages the year grid by twelve years at a time', () => {
      render(<Calendar value={MAY_2024} />)

      const panel = openMonthPanel()

      fireEvent.click(within(panel).getByRole('button', { name: '2024年' }))

      // 2024 落在 2016-2027 这一页。
      expect(within(panel).getByRole('button', { name: '2016年' })).toBeInTheDocument()

      fireEvent.click(within(panel).getByRole('button', { name: 'Next years' }))

      expect(within(panel).queryByRole('button', { name: '2016年' })).toBeNull()
      expect(within(panel).getByRole('button', { name: '2028年' })).toBeInTheDocument()

      fireEvent.click(within(panel).getByRole('button', { name: 'Previous years' }))

      expect(within(panel).getByRole('button', { name: '2016年' })).toBeInTheDocument()
    })

    it('steps a single year while the month grid is visible', () => {
      render(<Calendar value={MAY_2024} />)

      const panel = openMonthPanel()

      fireEvent.click(within(panel).getByRole('button', { name: 'Next year' }))

      expect(within(panel).getByRole('button', { name: '2025年' })).toBeInTheDocument()
      expect(within(panel).getByRole('button', { name: '2025年5月' })).toBeInTheDocument()
    })

    it('closes on outside pointer down and on Escape', () => {
      render(<Calendar value={MAY_2024} />)

      openMonthPanel()
      fireEvent.pointerDown(document.body)
      expect(screen.queryByRole('dialog')).toBeNull()

      openMonthPanel()
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(screen.queryByRole('dialog')).toBeNull()
      expect(screen.getByRole('button', { name: MAY_2024_LABEL })).toHaveFocus()
    })
  })

  describe('back to today', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    it('jumps to the month of today in UTC+8', () => {
      // 2026-09-22 18:00 东八区（同一瞬间在 UTC 是 09-22 10:00）。
      vi.useFakeTimers()
      vi.setSystemTime(new Date(Date.UTC(2026, 8, 22, 10, 0)))
      const handleMonthChange = vi.fn()

      render(<Calendar value={MAY_2024} onMonthChange={handleMonthChange} />)

      fireEvent.click(screen.getByRole('button', { name: '回到今日' }))

      expect(handleMonthChange).toHaveBeenCalledWith(getMonthStartTimestamp('2026-09-01'))
    })

    it('marks the UTC+8 day as today even when the browser date differs', () => {
      // 东八区已经是 09-22，UTC 还停在 09-21：高亮必须跟着东八区走。
      vi.useFakeTimers()
      vi.setSystemTime(new Date(Date.UTC(2026, 8, 21, 17, 0)))

      render(<Calendar defaultValue={getMonthStartTimestamp('2026-09-01')} />)

      expect(screen.getByRole('button', { name: '2026-09-22' })).toHaveAttribute(
        'aria-current',
        'date',
      )
      expect(screen.getByRole('button', { name: '2026-09-21' })).not.toHaveAttribute('aria-current')
    })

    it('does not fire onMonthChange when the calendar already shows this month', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(Date.UTC(2026, 8, 22, 10, 0)))
      const handleMonthChange = vi.fn()

      render(
        <Calendar value={getMonthStartTimestamp('2026-09-01')} onMonthChange={handleMonthChange} />,
      )

      fireEvent.click(screen.getByRole('button', { name: '回到今日' }))

      expect(handleMonthChange).not.toHaveBeenCalled()
    })

    it('hides the today button and accepts a custom label', () => {
      const { rerender } = render(<Calendar value={MAY_2024} todayLabel="Today" />)

      expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument()

      rerender(<Calendar value={MAY_2024} showToday={false} />)

      expect(screen.queryByRole('button', { name: 'Today' })).toBeNull()
      expect(screen.queryByRole('button', { name: '回到今日' })).toBeNull()
    })
  })
})
