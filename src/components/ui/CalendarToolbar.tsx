import { useEffect, useRef, useState } from 'react'
import { addMonths, getMonthStartTimestamp } from '../../utils/calendar'
import { classNames } from '../../utils/classNames'
import {
  DEFAULT_CALENDAR_LOCALE,
  formatMonthButtonLabel,
  formatMonthLabel,
  formatMonthLabels,
  formatYearLabel,
  type CalendarLocale,
} from './calendarLabels'
import StarNineSliceButton from './NineSliceButton'
import { useComponentCopy } from './useComponentCopy'
import styles from './CalendarToolbar.module.scss'

const YEARS_PER_PAGE = 12

export interface CalendarToolbarProps {
  monthTimestamp: number
  todayTimestamp: number
  todayLabel: string
  showToday?: boolean
  /** Locale for month names and year formatting. Defaults to `zh-CN`. */
  locale?: CalendarLocale
  onSelectMonth: (monthTimestamp: number) => void
}

/**
 * Calendar 与 DatePicker 共用的一行工具栏：翻月箭头 + 年月快切 + 回到今日。
 *
 * 两个组件原本各写了一份等价的工具栏，年月下拉再复制一遍就会变成四份，所以这里
 * 只保留一个实现，靠 `CalendarCommon` 的令牌保证两边尺寸一致。
 */
function CalendarToolbar({
  monthTimestamp,
  todayTimestamp,
  todayLabel,
  showToday = true,
  locale = DEFAULT_CALENDAR_LOCALE,
  onSelectMonth,
}: CalendarToolbarProps) {
  const copy = useComponentCopy()
  const [isOpen, setIsOpen] = useState(false)
  const [isYearView, setIsYearView] = useState(false)
  const [visibleYear, setVisibleYear] = useState(() => new Date(monthTimestamp).getFullYear())
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Month names come from `Intl` rather than a hardcoded 1月–12月 table, which
  // is why the quick-jump grid can show `Jan…Dec` under an English locale.
  const monthLabels = formatMonthLabels(locale)

  const selectedYear = new Date(monthTimestamp).getFullYear()
  const selectedMonth = new Date(monthTimestamp).getMonth()
  const todayMonthTimestamp = getMonthStartTimestamp(todayTimestamp)
  const currentYear = new Date(todayMonthTimestamp).getFullYear()
  const currentMonth = new Date(todayMonthTimestamp).getMonth()
  const pageStartYear = Math.floor(visibleYear / YEARS_PER_PAGE) * YEARS_PER_PAGE
  const visibleYears = Array.from(
    { length: YEARS_PER_PAGE },
    (_, index) => pageStartYear + index,
  )

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }

      setIsOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const openPanel = () => {
    // 每次打开都从当前月份重新定位，避免停留上一次浏览到的年份。
    setVisibleYear(selectedYear)
    setIsYearView(false)
    setIsOpen(true)
  }

  const closePanel = () => {
    setIsOpen(false)
    triggerRef.current?.focus()
  }

  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false)
      return
    }

    openPanel()
  }

  const handleSelectMonth = (monthIndex: number) => {
    onSelectMonth(getMonthStartTimestamp(new Date(visibleYear, monthIndex, 1)))
    closePanel()
  }

  const handleSelectYear = (year: number) => {
    setVisibleYear(year)
    setIsYearView(false)
  }

  const handleSelectToday = () => {
    onSelectMonth(todayMonthTimestamp)
  }

  const handleStep = (offset: number) => {
    if (isYearView) {
      setVisibleYear((year) => year + offset * YEARS_PER_PAGE)
      return
    }

    setVisibleYear((year) => year + offset)
  }

  return (
    <div className={styles['calendar-toolbar']} ref={containerRef}>
      <div className={styles['calendar-toolbar__nav']}>
        <StarNineSliceButton
          type="button"
          variant="concise"
          size="small"
          aria-label={copy.t('ui.datePicker.prevMonth')}
          onClick={() => onSelectMonth(addMonths(monthTimestamp, -1))}
        >
          &lt;
        </StarNineSliceButton>

        <button
          type="button"
          ref={triggerRef}
          className={styles['calendar-toolbar__title']}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          onClick={handleToggle}
        >
          {formatMonthLabel(monthTimestamp, locale)}
          <span className={styles['calendar-toolbar__caret']} aria-hidden="true" />
        </button>

        <StarNineSliceButton
          type="button"
          variant="concise"
          size="small"
          aria-label={copy.t('ui.datePicker.nextMonth')}
          onClick={() => onSelectMonth(addMonths(monthTimestamp, 1))}
        >
          &gt;
        </StarNineSliceButton>
      </div>

      {showToday ? (
        <div className={styles['calendar-toolbar__today']}>
          <StarNineSliceButton
            type="button"
            variant="concise"
            size="small"
            aria-label={todayLabel}
            onClick={handleSelectToday}
          >
            {todayLabel}
          </StarNineSliceButton>
        </div>
      ) : null}

      {isOpen ? (
        <div className={styles['calendar-toolbar__panel']} role="dialog" aria-label={copy.t('ui.datePicker.selectMonth')}>
          <div className={styles['calendar-toolbar__panel-header']}>
            <StarNineSliceButton
              type="button"
              variant="concise"
              size="small"
              aria-label={isYearView ? copy.t('ui.datePicker.prevYears') : copy.t('ui.datePicker.prevYear')}
              onClick={() => handleStep(-1)}
            >
              &lt;
            </StarNineSliceButton>

            <button
              type="button"
              className={styles['calendar-toolbar__panel-title']}
              onClick={() => setIsYearView((value) => !value)}
            >
              {isYearView
                ? `${pageStartYear} - ${pageStartYear + YEARS_PER_PAGE - 1}`
                : formatYearLabel(visibleYear, locale)}
            </button>

            <StarNineSliceButton
              type="button"
              variant="concise"
              size="small"
              aria-label={isYearView ? copy.t('ui.datePicker.nextYears') : copy.t('ui.datePicker.nextYear')}
              onClick={() => handleStep(1)}
            >
              &gt;
            </StarNineSliceButton>
          </div>

          {isYearView ? (
            <div className={styles['calendar-toolbar__grid']}>
              {visibleYears.map((year) => (
                <button
                  key={year}
                  type="button"
                  className={classNames(
                    styles['calendar-toolbar__cell'],
                    year === selectedYear && styles['calendar-toolbar__cell--selected'],
                    year === currentYear && styles['calendar-toolbar__cell--today'],
                  )}
                  aria-current={year === currentYear ? 'date' : undefined}
                  onClick={() => handleSelectYear(year)}
                >
                  {formatYearLabel(year, locale)}
                </button>
              ))}
            </div>
          ) : (
            <div className={styles['calendar-toolbar__grid']}>
              {monthLabels.map((label, monthIndex) => (
                <button
                  key={label}
                  type="button"
                  className={classNames(
                    styles['calendar-toolbar__cell'],
                    visibleYear === selectedYear &&
                      monthIndex === selectedMonth &&
                      styles['calendar-toolbar__cell--selected'],
                    visibleYear === currentYear &&
                      monthIndex === currentMonth &&
                      styles['calendar-toolbar__cell--today'],
                  )}
                  aria-current={
                    visibleYear === currentYear && monthIndex === currentMonth ? 'date' : undefined
                  }
                  aria-label={formatMonthButtonLabel(visibleYear, monthIndex, locale)}
                  onClick={() => handleSelectMonth(monthIndex)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

export default CalendarToolbar
