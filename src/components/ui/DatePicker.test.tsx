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

    fireEvent.click(screen.getByRole('button', { name: '下个月' }))

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

    it('jumps to a month picked from the year/month dropdown', () => {      render(<DatePicker defaultValue={normalizeToDayTimestamp('2024-05-13')} />)

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

  describe('inline interaction', () => {
    const getTrigger = () => screen.getByRole('button', { expanded: false })

    function getWheelColumn(name: string) {
      return screen.getByRole('listbox', { name })
    }

    /**
     * 把轮盘滚到某个绝对渲染坐标。
     *
     * `WheelColumn` 只在滚动停下来（整数对齐）时才提交，所以这里直接把
     * `scrollTop` 写成整行再派发 scroll，模拟一次「吸附完成」。
     */
    function scrollToOffset(column: HTMLElement, offset: number) {
      Object.defineProperty(column, 'scrollTop', {
        configurable: true,
        writable: true,
        value: offset * 36,
      })
      fireEvent.scroll(column)
    }

    it('keeps the calendar form as the default interaction', () => {
      render(<DatePicker defaultValue={normalizeToDayTimestamp('2024-05-13')} />)

      // 默认仍是月历：出现网格，不出现轮盘。
      expect(screen.getByRole('grid')).toBeInTheDocument()
      expect(screen.queryByRole('listbox')).toBeNull()
    })

    it('opens all three wheels from one trigger', () => {
      render(
        <DatePicker
          interaction="inline"
          defaultValue={normalizeToDayTimestamp('2024-05-13')}
        />,
      )

      expect(screen.queryByRole('dialog')).toBeNull()

      fireEvent.click(screen.getByRole('button', { expanded: false }))

      // 年 / 月 / 日三列同时出现，各自独立滚动。
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(getWheelColumn('年')).toBeInTheDocument()
      expect(getWheelColumn('月')).toBeInTheDocument()
      expect(getWheelColumn('日')).toBeInTheDocument()

      // 起始落点是当前值：2024 / 5月 / 13日 都停在窗口正中。
      expect(getWheelColumn('年').children[2]).toHaveTextContent('2024')
      expect(getWheelColumn('月').children[2]).toHaveTextContent('5月')
      expect(getWheelColumn('日').children[2]).toHaveTextContent('13')
    })

    it('renders the trigger as three segments', () => {
      render(
        <DatePicker interaction="inline" defaultValue={normalizeToDayTimestamp('2024-05-13')} />,
      )

      const trigger = getTrigger()

      expect(trigger).toHaveTextContent('2024')
      expect(trigger).toHaveTextContent('05')
      expect(trigger).toHaveTextContent('13')
    })

    it('confirms the wheel selection through onChange', () => {
      const handleChange = vi.fn()

      render(
        <DatePicker
          interaction="inline"
          defaultValue={normalizeToDayTimestamp('2024-05-13')}
          onChange={handleChange}
        />,
      )

      fireEvent.click(getTrigger())
      // 日期列的渲染坐标就是「第几天 - 1」，所以 13 日停在坐标 12；
      // 往后滚一格到坐标 13 即 14 日，然后确认。
      scrollToOffset(getWheelColumn('日'), 13)
      fireEvent.click(screen.getByRole('button', { name: '确定' }))

      expect(handleChange).toHaveBeenCalledWith({
        dateTimestamp: normalizeToDayTimestamp('2024-05-14'),
      })
    })

    it('discards the draft when cancelled', () => {
      const handleChange = vi.fn()

      render(
        <DatePicker
          interaction="inline"
          defaultValue={normalizeToDayTimestamp('2024-05-13')}
          onChange={handleChange}
        />,
      )

      fireEvent.click(getTrigger())
      // 日期列往后滚一格 → 坐标 12 → 13，草稿变成 14 日，但还没确认。
      scrollToOffset(getWheelColumn('日'), 13)
      fireEvent.click(screen.getByRole('button', { name: '取消' }))

      expect(handleChange).not.toHaveBeenCalled()
      expect(screen.queryByRole('dialog')).toBeNull()

      // 再打开一次，仍然停在确认过的 13 日上 —— 取消是真的撤销了。
      fireEvent.click(getTrigger())

      expect(getWheelColumn('日').children[2]).toHaveTextContent('13')
    })

    it('settles on the last day of the month when the draft day overflows', () => {
      const handleChange = vi.fn()

      render(
        <DatePicker
          interaction="inline"
          defaultValue={normalizeToDayTimestamp('2024-01-31')}
          onChange={handleChange}
        />,
      )

      fireEvent.click(getTrigger())
      // 31 日 → 2 月（月份列 5 月的坐标是 4，往前滚 3 格即坐标 1）；2 月没有
      // 31 日，要落到 29 日（2024 是闰年）。
      scrollToOffset(getWheelColumn('月'), 1)

      expect(getWheelColumn('日').children[2]).toHaveTextContent('29')

      fireEvent.click(screen.getByRole('button', { name: '确定' }))

      expect(handleChange).toHaveBeenCalledWith({
        dateTimestamp: normalizeToDayTimestamp('2024-02-29'),
      })
    })

    it('scrolls days by a full month length so it loops back to the start', () => {
      render(
        <DatePicker
          interaction="inline"
          defaultValue={normalizeToDayTimestamp('2024-05-31')}
          minDate={normalizeToDayTimestamp('2024-05-01')}
        />,
      )

      fireEvent.click(getTrigger())

      const days = getWheelColumn('日')

      // 31 号之后就接回 1 号：滚满一整圈之后高亮落在 1 日上。
      // 31 日的坐标是 30，再多一格就绕回 1 日（坐标 31）。
      scrollToOffset(days, 31)

      expect(days.children[2]).toHaveTextContent('1')
    })

    it('blocks confirmation when the draft date is out of range', () => {
      const handleChange = vi.fn()

      render(
        <DatePicker
          interaction="inline"
          defaultValue={normalizeToDayTimestamp('2024-05-13')}
          minDate={normalizeToDayTimestamp('2024-05-10')}
          maxDate={normalizeToDayTimestamp('2024-05-13')}
          onChange={handleChange}
        />,
      )

      fireEvent.click(getTrigger())
      // 往后滚两格到 15 日（坐标 14）—— 超过 maxDate，确定按钮应当禁用。
      scrollToOffset(getWheelColumn('日'), 14)

      expect(screen.getByRole('button', { name: '确定' })).toBeDisabled()

      // 滚回 13 日（坐标 12）就可以确认了。
      scrollToOffset(getWheelColumn('日'), 12)
      fireEvent.click(screen.getByRole('button', { name: '确定' }))

      expect(handleChange).toHaveBeenCalledWith({
        dateTimestamp: normalizeToDayTimestamp('2024-05-13'),
      })
    })

    it('honours custom confirm, cancel, and column labels', () => {
      render(<DatePicker interaction="inline" confirmLabel="OK" cancelLabel="Back" columnLabels={['Year', 'Month', 'Day']} />)

      fireEvent.click(getTrigger())

      expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument()
      expect(getWheelColumn('Year')).toBeInTheDocument()
      expect(getWheelColumn('Month')).toBeInTheDocument()
      expect(getWheelColumn('Day')).toBeInTheDocument()
    })

    it('keeps the trigger label in sync with a controlled value', () => {
      const { rerender } = render(
        <DatePicker interaction="inline" value={normalizeToDayTimestamp('2024-05-13')} />,
      )

      expect(getTrigger()).toHaveTextContent('2024')

      rerender(<DatePicker interaction="inline" value={normalizeToDayTimestamp('2025-01-02')} />)

      const trigger = getTrigger()

      expect(trigger).toHaveTextContent('2025')
      expect(trigger).toHaveTextContent('01')
      expect(trigger).toHaveTextContent('02')
    })

    it('falls back to today when no value is given', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(Date.UTC(2026, 8, 22, 10, 0)))

      render(<DatePicker interaction="inline" />)

      // 东八区口径下，UTC 2026-09-22T10:00 就是 9 月 22 日。
      fireEvent.click(getTrigger())

      const days = getWheelColumn('日')

      expect(getWheelColumn('年').children[2]).toHaveTextContent('2026')
      expect(getWheelColumn('月').children[2]).toHaveTextContent('9月')
      expect(days.children[2]).toHaveTextContent('22')
    })
  })
})
