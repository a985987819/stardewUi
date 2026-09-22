import { useMemo, useState, type ReactNode } from 'react'
import {
  buildCalendarCells,
  getMonthStartTimestamp,
  getTodayTimestamp,
  groupCalendarItemsByDay,
  type CalendarCell,
  type CalendarInput,
} from '../../utils/calendar'
import { classNames } from '../../utils/classNames'
import CalendarGrid from './CalendarGrid'
import CalendarToolbar from './CalendarToolbar'
import styles from './Calendar.module.scss'

export interface CalendarItem {
  date: CalendarInput
  title: string
  description?: string
  iconKey?: string
  iconSrc?: string
  iconNode?: ReactNode
  tone?: string
  meta?: ReactNode
}

export interface StarCalendarProps {
  value?: number
  defaultValue?: number
  onMonthChange?: (monthTimestamp: number) => void
  items?: CalendarItem[]
  maxVisibleMarkers?: number
  iconMap?: Record<string, ReactNode | string>
  showOutsideDays?: boolean
  /** 「回到今日」按钮文案 */
  todayLabel?: string
  /** 是否显示「回到今日」按钮 */
  showToday?: boolean
  /** 计算「今日」所用的时区偏移（分钟），默认 480 即东八区 */
  todayOffsetMinutes?: number
  className?: string
}

const DEFAULT_MAX_VISIBLE_MARKERS = 3
const DEFAULT_TODAY_LABEL = '回到今日'

function getInitialMonth(value?: number, defaultValue?: number) {
  if (value !== undefined) {
    return getMonthStartTimestamp(value)
  }

  if (defaultValue !== undefined) {
    return getMonthStartTimestamp(defaultValue)
  }

  return getMonthStartTimestamp(Date.now())
}

function formatDayLabel(dayTimestamp: number) {
  const date = new Date(dayTimestamp)
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')

  return `${year}-${month}-${day}`
}

function resolveMarker(
  item: CalendarItem,
  iconMap?: Record<string, ReactNode | string>,
) {
  if (item.iconNode) {
    return item.iconNode
  }

  if (item.iconSrc) {
    return <img src={item.iconSrc} alt={item.title} className={styles['calendar__marker-image']} />
  }

  if (item.iconKey) {
    const mappedIcon = iconMap?.[item.iconKey]

    if (typeof mappedIcon === 'string') {
      return <img src={mappedIcon} alt={item.title} className={styles['calendar__marker-image']} />
    }

    if (mappedIcon) {
      return mappedIcon
    }
  }

  return <span className={styles['calendar__marker-dot']} aria-hidden="true" />
}

function Calendar({
  value,
  defaultValue,
  onMonthChange,
  items = [],
  maxVisibleMarkers = DEFAULT_MAX_VISIBLE_MARKERS,
  iconMap,
  showOutsideDays = true,
  todayLabel = DEFAULT_TODAY_LABEL,
  showToday = true,
  todayOffsetMinutes,
  className,
}: StarCalendarProps) {
  const [internalMonth, setInternalMonth] = useState(() => getInitialMonth(value, defaultValue))
  const [activeDayTimestamp, setActiveDayTimestamp] = useState<number | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const isControlled = value !== undefined
  const monthTimestamp = isControlled ? getMonthStartTimestamp(value) : internalMonth
  // 「今日」按东八区算，与「回到今日」落点保持同一个口径：格子高亮和按钮跳转
  // 都读这一个值，所以跨时区访问时不会出现「按钮跳过去但没高亮」。
  const todayTimestamp = getTodayTimestamp(todayOffsetMinutes)

  const cells = useMemo(
    () => buildCalendarCells(monthTimestamp, todayTimestamp),
    [monthTimestamp, todayTimestamp],
  )
  const itemsByDay = useMemo(() => groupCalendarItemsByDay(items), [items])
  const activeItems = activeDayTimestamp !== null ? itemsByDay[activeDayTimestamp] ?? [] : []

  // Drop the hovered day when the visible month changes. Adjusting state during
  // render is React's recommended replacement for a "reset on prop change" effect
  // and avoids committing an extra frame with a stale highlighted day.
  const [syncedMonthTimestamp, setSyncedMonthTimestamp] = useState(monthTimestamp)

  if (syncedMonthTimestamp !== monthTimestamp) {
    setSyncedMonthTimestamp(monthTimestamp)
    setActiveDayTimestamp(null)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPosition({ x: e.clientX + 12, y: e.clientY + 12 })
  }

  const changeMonth = (nextMonth: number) => {
    // 翻月、下拉选月、「回到今日」都走这一条路径：目标月份和当前一致时不再重
    // 复通知，避免「回到今日」在本月内触发一次无意义的 onMonthChange。
    if (nextMonth === monthTimestamp) {
      return
    }

    if (!isControlled) {
      setInternalMonth(nextMonth)
    }

    setActiveDayTimestamp(null)
    onMonthChange?.(nextMonth)
  }

  const renderCellContent = (cell: CalendarCell) => {
    const cellItems = itemsByDay[cell.dateTimestamp] ?? []

    if (cellItems.length === 0) {
      return null
    }

    const visibleItems = cellItems.slice(0, maxVisibleMarkers)
    const remainingCount = cellItems.length - visibleItems.length

    return (
      <span className={styles['calendar__markers']}>
        {visibleItems.map((item, index) => (
          <span
            key={`${item.title}-${index}`}
            className={classNames(styles['calendar__marker'], item.tone && styles[`calendar__marker--${item.tone}`])}
            aria-label={item.title}
          >
            {resolveMarker(item, iconMap)}
          </span>
        ))}
        {remainingCount > 0 ? (
          <span className={styles['calendar__marker-summary']}>+{remainingCount}</span>
        ) : null}
      </span>
    )
  }

  return (
    <section className={classNames(styles.calendar, className)}>
      <CalendarToolbar
        monthTimestamp={monthTimestamp}
        todayTimestamp={todayTimestamp}
        todayLabel={todayLabel}
        showToday={showToday}
        onSelectMonth={changeMonth}
      />

      <CalendarGrid
        cells={cells}
        showOutsideDays={showOutsideDays}
        onSelectDay={(dayTimestamp) => setActiveDayTimestamp(dayTimestamp)}
        renderCellContent={renderCellContent}
        getCellButtonProps={(cell) => ({
          'aria-label': formatDayLabel(cell.dateTimestamp),
          onMouseEnter: (e: React.MouseEvent) => {
            setActiveDayTimestamp(cell.dateTimestamp)
            handleMouseMove(e)
          },
          onMouseMove: handleMouseMove,
          onMouseLeave: () => setActiveDayTimestamp((current) => (current === cell.dateTimestamp ? null : current)),
          onFocus: () => setActiveDayTimestamp(cell.dateTimestamp),
          onBlur: () => setActiveDayTimestamp((current) => (current === cell.dateTimestamp ? null : current)),
        })}
      />

      {activeItems.length > 0 ? (
        <div
          className={styles['calendar__details']}
          role="status"
          aria-live="polite"
          style={{
            left: tooltipPosition.x,
            top: tooltipPosition.y,
          }}
        >
          <div className={styles['calendar__details-title']}>{formatDayLabel(activeDayTimestamp as number)}</div>
          <ul className={styles['calendar__details-list']}>
            {activeItems.map((item, index) => (
              <li key={`${item.title}-${index}`} className={styles['calendar__details-item']}>
                <div className={styles['calendar__details-item-title']}>{item.title}</div>
                {item.description ? (
                  <div className={styles['calendar__details-item-description']}>{item.description}</div>
                ) : null}
                {item.meta ? <div className={styles['calendar__details-item-meta']}>{item.meta}</div> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}

export default Calendar
