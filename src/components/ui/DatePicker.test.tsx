import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getMonthStartTimestamp, normalizeToDayTimestamp } from '../../utils/calendar'
import DatePicker from './DatePicker'
import { formatMonthLabel } from './calendarLabels'

function getDayButton(label: string) {
  return screen.getByRole('button', { name: label })
}

function getGrid() {
  return screen.getByRole('grid')
}

describe('DatePicker', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('single mode returns a normalized timestamp', () => {
    const handleChange = vi.fn()

    render(
      <DatePicker
        defaultValue={new Date(2024, 4, 1, 13, 30).getTime()}
        onChange={handleChange}
      />,
    )

    fireEvent.click(getDayButton('2024-05-13'))

    expect(handleChange).toHaveBeenCalledWith({
      dateTimestamp: normalizeToDayTimestamp('2024-05-13'),
    })
  })

  it('range mode returns a normalized ordered range', () => {
    const handleChange = vi.fn()
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2024, 4, 1, 9, 0, 0))

    render(
      <DatePicker
        mode="range"
        defaultValue={{
          startTimestamp: null,
          endTimestamp: null,
        }}
        onChange={handleChange}
      />,
    )

    fireEvent.click(getDayButton('2024-05-20'))
    fireEvent.click(getDayButton('2024-05-13'))

    expect(handleChange).toHaveBeenNthCalledWith(1, {
      startTimestamp: normalizeToDayTimestamp('2024-05-20'),
      endTimestamp: null,
    })
    expect(handleChange).toHaveBeenNthCalledWith(2, {
      startTimestamp: normalizeToDayTimestamp('2024-05-13'),
      endTimestamp: normalizeToDayTimestamp('2024-05-20'),
    })
  })

  it('completed range restarts on next click', () => {
    const handleChange = vi.fn()

    render(
      <DatePicker
        mode="range"
        defaultValue={{
          startTimestamp: normalizeToDayTimestamp('2024-05-13'),
          endTimestamp: normalizeToDayTimestamp('2024-05-20'),
        }}
        onChange={handleChange}
      />,
    )

    fireEvent.click(getDayButton('2024-05-25'))

    expect(handleChange).toHaveBeenCalledWith({
      startTimestamp: normalizeToDayTimestamp('2024-05-25'),
      endTimestamp: null,
    })
  })

  it('disabled date cannot be selected', () => {
    const handleChange = vi.fn()
    const disabledDate = normalizeToDayTimestamp('2024-05-13')

    render(
      <DatePicker
        defaultValue={normalizeToDayTimestamp('2024-05-01')}
        disabledDates={[disabledDate]}
        onChange={handleChange}
      />,
    )

    const disabledButton = getDayButton('2024-05-13')

    expect(disabledButton).toBeDisabled()

    fireEvent.click(disabledButton)

    expect(handleChange).not.toHaveBeenCalled()
  })

  it('min and max boundaries block out-of-range selection', () => {
    const handleChange = vi.fn()

    render(
      <DatePicker
        defaultValue={normalizeToDayTimestamp('2024-05-15')}
        minDate={normalizeToDayTimestamp('2024-05-10')}
        maxDate={normalizeToDayTimestamp('2024-05-20')}
        onChange={handleChange}
      />,
    )

    const beforeMinButton = getDayButton('2024-05-09')
    const afterMaxButton = getDayButton('2024-05-21')
    const inRangeButton = getDayButton('2024-05-15')

    expect(beforeMinButton).toBeDisabled()
    expect(afterMaxButton).toBeDisabled()
    expect(inRangeButton).not.toBeDisabled()

    fireEvent.click(beforeMinButton)
    fireEvent.click(afterMaxButton)
    fireEvent.click(inRangeButton)

    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith({
      dateTimestamp: normalizeToDayTimestamp('2024-05-15'),
    })
  })

  it('exposes selected and range semantics on day buttons', () => {
    render(
      <DatePicker
        mode="range"
        defaultValue={{
          startTimestamp: normalizeToDayTimestamp('2024-05-13'),
          endTimestamp: normalizeToDayTimestamp('2024-05-15'),
        }}
      />,
    )

    const startButton = getDayButton('2024-05-13')
    const middleButton = getDayButton('2024-05-14')
    const endButton = getDayButton('2024-05-15')

    expect(startButton).toHaveAttribute('data-selected', 'true')
    expect(startButton).toHaveAttribute('data-range-position', 'start')
    expect(startButton).toHaveAttribute('data-in-range', 'true')
    expect(startButton).not.toHaveAttribute('aria-selected')

    expect(middleButton).not.toHaveAttribute('data-selected')
    expect(middleButton).toHaveAttribute('data-in-range', 'true')
    expect(middleButton).not.toHaveAttribute('data-range-position')
    expect(middleButton).not.toHaveAttribute('aria-selected')

    expect(endButton).toHaveAttribute('data-selected', 'true')
    expect(endButton).toHaveAttribute('data-range-position', 'end')
    expect(endButton).toHaveAttribute('data-in-range', 'true')
    expect(endButton).not.toHaveAttribute('aria-selected')
  })

  it('allows month navigation while the selected value is controlled', () => {
    const handleChange = vi.fn()

    render(
      <DatePicker
        value={normalizeToDayTimestamp('2024-05-13')}
        onChange={handleChange}
      />,
    )

    const initialGridLabel = getGrid().getAttribute('aria-label')
    expect(initialGridLabel).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Next month' }))

    const navigatedGridLabel = getGrid().getAttribute('aria-label')
    expect(navigatedGridLabel).toBeTruthy()
    expect(navigatedGridLabel).not.toBe(initialGridLabel)

    fireEvent.click(getDayButton('2024-06-13'))

    expect(handleChange).toHaveBeenCalledWith({
      dateTimestamp: normalizeToDayTimestamp('2024-06-13'),
    })
  })

  it('resynchronizes internal selection state when mode and control ownership change', () => {
    const { rerender } = render(
      <DatePicker defaultValue={normalizeToDayTimestamp('2024-05-13')} />,
    )

    expect(getDayButton('2024-05-13')).toHaveAttribute('data-selected', 'true')

    rerender(
      <DatePicker
        mode="range"
        value={{
          startTimestamp: normalizeToDayTimestamp('2024-05-20'),
          endTimestamp: normalizeToDayTimestamp('2024-05-22'),
        }}
      />,
    )

    expect(getDayButton('2024-05-13')).not.toHaveAttribute('data-selected')
    expect(getDayButton('2024-05-20')).toHaveAttribute('data-selected', 'true')
    expect(getDayButton('2024-05-22')).toHaveAttribute('data-selected', 'true')

    rerender(
      <DatePicker
        defaultValue={normalizeToDayTimestamp('2024-05-25')}
      />,
    )

    expect(getDayButton('2024-05-20')).not.toHaveAttribute('data-selected')
    expect(getDayButton('2024-05-22')).not.toHaveAttribute('data-selected')
    expect(getDayButton('2024-05-25')).toHaveAttribute('data-selected', 'true')
  })

  it('preserves the last controlled selection when dropping control without a replacement default value', () => {
    const { rerender } = render(
      <DatePicker
        mode="range"
        value={{
          startTimestamp: normalizeToDayTimestamp('2024-05-20'),
          endTimestamp: normalizeToDayTimestamp('2024-05-22'),
        }}
      />,
    )

    expect(getDayButton('2024-05-20')).toHaveAttribute('data-selected', 'true')
    expect(getDayButton('2024-05-22')).toHaveAttribute('data-selected', 'true')

    rerender(<DatePicker mode="range" />)

    expect(getDayButton('2024-05-20')).toHaveAttribute('data-selected', 'true')
    expect(getDayButton('2024-05-22')).toHaveAttribute('data-selected', 'true')
    expect(getDayButton('2024-05-21')).toHaveAttribute('data-in-range', 'true')
  })

  describe('month navigation toolbar', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    it('jumps to a month picked from the year/month dropdown', () => {
      render(<DatePicker defaultValue={normalizeToDayTimestamp('2024-05-13')} />)

      fireEvent.click(
        screen.getByRole('button', { name: formatMonthLabel(getMonthStartTimestamp('2024-05-01')) }),
      )

      const panel = screen.getByRole('dialog', { name: '选择年月' })

      fireEvent.click(within(panel).getByRole('button', { name: '2024年11月' }))

      expect(getGrid()).toHaveAttribute(
        'aria-label',
        formatMonthLabel(getMonthStartTimestamp('2024-11-01')),
      )
    })

    it('returns to the UTC+8 today month without touching the selected value', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(Date.UTC(2026, 8, 22, 10, 0)))
      const handleChange = vi.fn()

      render(
        <DatePicker
          defaultValue={normalizeToDayTimestamp('2024-05-13')}
          onChange={handleChange}
        />,
      )

      fireEvent.click(screen.getByRole('button', { name: '回到今日' }))

      expect(getGrid()).toHaveAttribute(
        'aria-label',
        formatMonthLabel(getMonthStartTimestamp('2026-09-01')),
      )
      expect(handleChange).not.toHaveBeenCalled()
    })

    it('keeps the today button label configurable and removable', () => {
      const { rerender } = render(<DatePicker todayLabel="Today" />)

      expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument()

      rerender(<DatePicker showToday={false} />)

      expect(screen.queryByRole('button', { name: 'Today' })).toBeNull()
      expect(screen.queryByRole('button', { name: '回到今日' })).toBeNull()
    })
  })
})
