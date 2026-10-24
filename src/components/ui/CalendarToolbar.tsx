import { useEffect, useRef, useState } from 'react'
import { addMonths, getMonthStartTimestamp } from '../../utils/calendar'
import { classNames } from '../../utils/classNames'
import { formatMonthLabel, formatMonthShortLabel, formatYearLabel } from './calendarLabels'
import StarNineSliceButton from './NineSliceButton'
import styles from './CalendarToolbar.module.scss'

const YEARS_PER_PAGE = 12

export interface CalendarToolbarProps {
  monthTimestamp: number
  todayTimestamp: number
  todayLabel: string
  showToday?: boolean
  /** BCP-47 locale for month/year labels and aria text; defaults to `'zh-CN'`. */
  locale?: string
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
  locale = 'zh-CN',
  onSelectMonth,
}: CalendarToolbarProps) {
  const isZh = locale.toLowerCase().startsWith('zh')
  const monthLabels = Array.from({ length: 12 }, (_, monthIndex) =>
    formatMonthShortLabel(locale, monthIndex)
  )
  const previousMonthLabel = isZh ? '上个月' : 'Previous month'
  const nextMonthLabel = isZh ? '下个月' : 'Next month'
  const panelLabel = isZh ? '选择年月' : 'Select month and year'
  const [isOpen, setIsOpen] = useState(false)
  const [isYearView, setIsYearView] = useState(false)
  // 年/月两档视图的步进 aria 文案依赖 isYearView，必须在 state 之后取值。
  const previousStepLabel = isZh
    ? (isYearView ? '上一组年份' : '上一年')
    : (isYearView ? 'Previous years' : 'Previous year')
  const nextStepLabel = isZh
    ? (isYearView ? '下一组年份' : '下一年')
    : (isYearView ? 'Next years' : 'Next year')
  const [visibleYear, setVisibleYear] = useState(() => new Date(monthTimestamp).getFullYear())
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

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
          aria-label={previousMonthLabel}
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
          {formatMonthLabel(locale, monthTimestamp)}
          <span className={styles['calendar-toolbar__caret']} aria-hidden="true" />
        </button>

        <StarNineSliceButton
          type="button"
          variant="concise"
          size="small"
          aria-label={nextMonthLabel}
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
        <div className={styles['calendar-toolbar__panel']} role="dialog" aria-label={panelLabel}>
          <div className={styles['calendar-toolbar__panel-header']}>
            <StarNineSliceButton
              type="button"
              variant="concise"
              size="small"
              aria-label={previousStepLabel}
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
                : formatYearLabel(locale, visibleYear)}
            </button>

            <StarNineSliceButton
              type="button"
              variant="concise"
              size="small"
              aria-label={nextStepLabel}
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
                  {formatYearLabel(locale, year)}
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
                  aria-label={formatMonthLabel(
                    locale,
                    new Date(visibleYear, monthIndex, 1).getTime()
                  )}
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
