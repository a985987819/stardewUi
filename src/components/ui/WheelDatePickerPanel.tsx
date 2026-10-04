import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { normalizeToDayTimestamp } from '../../utils/calendar'
import { formatUnitSuffixes, toIntlLocale } from './calendarLabels'
import { useComponentCopy } from './useComponentCopy'
import WheelColumn from './WheelColumn'
import styles from './WheelPicker.module.scss'

/** 与 `getWheelWindowSize(5)` 同源，改这里要同时改 SCSS 里的可视行数。 */
const VISIBLE_COUNT = 5
const ROW_HEIGHT = 36

/** 年份的候选窗口：以当前年份为锚，前后各铺 50 年。 */
const YEARS_BEFORE_ANCHOR = 50

export interface WheelDatePickerPanelProps {
  /** 当前值。`null` 表示未定，面板会落在「今天」上但不会回写。 */
  value: number | null
  todayTimestamp: number
  minDate?: number
  maxDate?: number
  disabledDates?: ReadonlySet<number>
  onConfirm: (dateTimestamp: number) => void
  onCancel: () => void
  /**
   * 草稿日期的每次变化。上层用它记住「这份草稿是从哪个外部值派生出来的」，
   * 外部值一变就把草稿作废 —— 面板自己不需要知道这件事。
   */
  onDraftChange?: (dateTimestamp: number) => void
  /** 「确定 / 取消」的文案（演示页会随语言切换）。 */
  confirmLabel?: string
  cancelLabel?: string
  /** 三列的无障碍名称，例如 ['年', '月', '日']。 */
  columnLabels?: [string, string, string]
}

function getDaysInMonth(year: number, monthIndex: number) {
  // `new Date(year, month + 1, 0)` 是「下个月的第 0 天」＝本月最后一天，
  // 闰年与大小月都由它自己算，不用手写一张天数表。
  return new Date(year, monthIndex + 1, 0).getDate()
}

/**
 * 行内日期选择面板：年 / 月 / 日三列轮盘并排，底部「确定 / 取消」。
 *
 * 「三个同时弹出」指的是这三列在同一个面板里一起出现、各自独立滚动；谁都不
 * 需要等谁。取消要能撤销整段临时状态，所以面板内部持有一份草稿（草稿年、草稿
 * 月、草稿日），只有点「确定」才通过 `onConfirm` 交给上层。
 */
function WheelDatePickerPanel({
  value,
  todayTimestamp,
  minDate,
  maxDate,
  disabledDates,
  onConfirm,
  onCancel,
  onDraftChange,
  confirmLabel = '确定',
  cancelLabel = '取消',
  columnLabels = ['年', '月', '日'],
}: WheelDatePickerPanelProps) {
  // The panel is internal to DatePicker, which already resolves all four
  // strings from the host app's language and passes them down as props. The
  // defaults here exist only so the panel can be rendered on its own in a test.
  const copy = useComponentCopy()
  const suffixes = formatUnitSuffixes(toIntlLocale(copy.lang))
  const todayDate = new Date(todayTimestamp)
  const todayYear = todayDate.getFullYear()

  const seedTimestamp = value ?? todayTimestamp
  const seedDate = new Date(seedTimestamp)
  const seedYear = seedDate.getFullYear()
  const seedMonthIndex = seedDate.getMonth()
  const seedDay = seedDate.getDate()

  const [year, setYear] = useState(seedYear)
  const [monthIndex, setMonthIndex] = useState(seedMonthIndex)
  const [day, setDay] = useState(seedDay)

  // 年月改动会连带把「日」夹进当月范围，而夹过之后的日期才是真正的草稿；
  // `setDay` 的更新函数里拿不到「已经夹好的值」，所以在这里中转一下，
  // 等提交阶段再一起报给上层（见文件末尾的 `useLayoutEffect`）。
  const pendingDraftRef = useRef<number | null>(null)
  // The panel is mounted only while open, so focusing on mount is the same as
  // focusing on open. `preventScroll` because the panel already sits right under
  // the trigger and the browser's scroll-into-view would jump the page.
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    panelRef.current?.focus({ preventScroll: true })
  }, [])

  const isDateDisabled = useCallback(
    (timestamp: number) => {
      if (minDate !== undefined && timestamp < minDate) {
        return true
      }

      if (maxDate !== undefined && timestamp > maxDate) {
        return true
      }

      return disabledDates?.has(timestamp) ?? false
    },
    [disabledDates, maxDate, minDate],
  )

  const years = useMemo(() => {
    const anchor = Math.max(seedYear, todayYear)
    const newest = anchor + YEARS_BEFORE_ANCHOR
    const oldest = anchor - YEARS_BEFORE_ANCHOR

    return Array.from({ length: newest - oldest + 1 }, (_, index) => oldest + index)
  }, [seedYear, todayYear])

  const months = useMemo(
    () => Array.from({ length: 12 }, (_, index) => index),
    [],
  )

  // 日期列的长度跟着草稿年月走，所以 2 月只有 28/29 行。
  const days = useMemo(() => {
    const length = getDaysInMonth(year, monthIndex)

    return Array.from({ length }, (_, index) => index + 1)
  }, [monthIndex, year])

  // 草稿日期可能在切换年月后越界（1 月 31 日 → 2 月），此时轮盘先停在当月最后
  // 一天上，`value` 仍然是越界的 31 —— 这正是「未定」，要等用户真的滚过才回写。
  const clampedDay = Math.min(day, days.length)
  const draftTimestamp = normalizeToDayTimestamp(new Date(year, monthIndex, clampedDay))
  const isDisabled = isDateDisabled(draftTimestamp)

  const handleYearChange = (nextYear: number) => {
    setYear(nextYear)
    setDay((current) => {
      const nextDay = Math.min(current, getDaysInMonth(nextYear, monthIndex))
      pendingDraftRef.current = normalizeToDayTimestamp(new Date(nextYear, monthIndex, nextDay))

      return nextDay
    })
  }

  const handleMonthChange = (nextMonthIndex: number) => {
    setMonthIndex(nextMonthIndex)
    setDay((current) => {
      const nextDay = Math.min(current, getDaysInMonth(year, nextMonthIndex))
      pendingDraftRef.current = normalizeToDayTimestamp(new Date(year, nextMonthIndex, nextDay))

      return nextDay
    })
  }

  const handleDayChange = (nextDay: number) => {
    setDay(nextDay)
    onDraftChange?.(normalizeToDayTimestamp(new Date(year, monthIndex, nextDay)))
  }

  // 年月变更时草稿要在「日」被夹到当月最后一天**之后**再报出去，所以推迟到
  // 提交阶段：在 `setDay` 的更新函数里直接调 `onDraftChange` 会变成「渲染期间
  // 更新父组件」，React 会报警并且父组件的重置逻辑可能跑在错误的时机上。
  useLayoutEffect(() => {
    const pending = pendingDraftRef.current

    if (pending === null) {
      return
    }

    pendingDraftRef.current = null
    onDraftChange?.(pending)
  })

  return (
    <div
      ref={panelRef}
      // `role="dialog"` is a promise that the panel takes focus when it appears;
      // `tabIndex` is what makes the div focusable at all. Focus lands on the
      // container rather than a column so the first Tab reaches the year column
      // instead of skipping past it.
      tabIndex={-1}
      className={styles['date-picker-inline']}
      role="dialog"
      aria-label={copy.t('ui.datePicker.selectDate')}
    >
      <div className={styles['date-picker-inline__columns']}>
        <WheelColumn
          key="year"
          ariaLabel={columnLabels[0]}
          values={years}
          value={year}
          onChange={handleYearChange}
          format={(item) => `${item}${suffixes.year}`}
          fallbackValue={seedYear}
          rowHeight={ROW_HEIGHT}
          visibleCount={VISIBLE_COUNT}
        />
        <WheelColumn
          key="month"
          ariaLabel={columnLabels[1]}
          values={months}
          value={monthIndex}
          onChange={handleMonthChange}
          loop
          format={(item) => `${item + 1}${suffixes.month}`}
          fallbackValue={seedMonthIndex}
          rowHeight={ROW_HEIGHT}
          visibleCount={VISIBLE_COUNT}
        />
        <WheelColumn
          key="day"
          ariaLabel={columnLabels[2]}
          values={days}
          value={day}
          onChange={handleDayChange}
          loop
          format={(item) => `${item}${suffixes.day}`}
          fallbackValue={clampedDay}
          rowHeight={ROW_HEIGHT}
          visibleCount={VISIBLE_COUNT}
        />
      </div>

      <div className={styles['date-picker-inline__actions']}>
        <button
          type="button"
          className={styles['date-picker-inline__action']}
          disabled={isDisabled}
          onClick={() => onConfirm(draftTimestamp)}
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          className={styles['date-picker-inline__action']}
          onClick={onCancel}
        >
          {cancelLabel}
        </button>
      </div>
    </div>
  )
}

export default WheelDatePickerPanel
