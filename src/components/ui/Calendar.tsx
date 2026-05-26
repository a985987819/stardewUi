import { useMemo, useState, type ReactNode } from 'react'
import {
  addMonths,
  buildCalendarCells,
  getMonthStartTimestamp,
  groupCalendarItemsByDay,
  type CalendarCell,
  type CalendarInput,
} from '../../utils/calendar'
import { classNames } from '../../utils/classNames'
import CalendarGrid from './CalendarGrid'
import StarNineSliceButton from './NineSliceButton'
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
  className?: string
}

const DEFAULT_MAX_VISIBLE_MARKERS = 3

function getInitialMonth(value?: number, defaultValue?: number) {
  if (value !== undefined) {
    return getMonthStartTimestamp(value)
  }

  if (defaultValue !== undefined) {
    return getMonthStartTimestamp(defaultValue)
  }

  return getMonthStartTimestamp(Date.now())
}

function formatMonthLabel(monthTimestamp: number) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
  }).format(new Date(monthTimestamp))
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
  className,
}: StarCalendarProps) {
  const [internalMonth, setInternalMonth] = useState(() => getInitialMonth(value, defaultValue))
  const [activeDayTimestamp, setActiveDayTimestamp] = useState<number | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const isControlled = value !== undefined
  const monthTimestamp = isControlled ? getMonthStartTimestamp(value) : internalMonth

  const cells = useMemo(() => buildCalendarCells(monthTimestamp), [monthTimestamp])
  const itemsByDay = useMemo(() => groupCalendarItemsByDay(items), [items])
  const visibleDayTimestamps = useMemo(() => new Set(cells.map((cell) => cell.dateTimestamp)), [cells])
  const resolvedActiveDayTimestamp =
    activeDayTimestamp !== null && visibleDayTimestamps.has(activeDayTimestamp)
      ? activeDayTimestamp
      : null
  const activeItems = resolvedActiveDayTimestamp !== null ? itemsByDay[resolvedActiveDayTimestamp] ?? [] : []

  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPosition({ x: e.clientX + 12, y: e.clientY + 12 })
  }

  const changeMonth = (offset: number) => {
    const nextMonth = addMonths(monthTimestamp, offset)

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
      <div className={styles['calendar__toolbar']}>
        <StarNineSliceButton
          type="button"
          variant="concise"
          size="small"
          aria-label="Previous month"
          onClick={() => changeMonth(-1)}
        >
          &lt;
        </StarNineSliceButton>
        <div className={styles['calendar__month']}>{formatMonthLabel(monthTimestamp)}</div>
        <StarNineSliceButton
          type="button"
          variant="concise"
          size="small"
          aria-label="Next month"
          onClick={() => changeMonth(1)}
        >
          &gt;
        </StarNineSliceButton>
      </div>

      <CalendarGrid
        monthLabel={formatMonthLabel(monthTimestamp)}
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
          <div className={styles['calendar__details-title']}>{formatDayLabel(resolvedActiveDayTimestamp as number)}</div>
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
