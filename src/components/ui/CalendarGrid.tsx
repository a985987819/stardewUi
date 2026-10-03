import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { CalendarCell } from '../../utils/calendar'
import { classNames } from '../../utils/classNames'
import {
  DEFAULT_CALENDAR_LOCALE,
  formatWeekdayLabels,
  type CalendarLocale,
} from './calendarLabels'
import styles from './CalendarGrid.module.scss'

const DAYS_PER_WEEK = 7

export type CalendarGridCellButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type' | 'disabled' | 'onClick'>

export interface CalendarGridProps {
  cells: CalendarCell[]
  monthLabel?: string
  showOutsideDays?: boolean
  /** Locale for the weekday header row. Defaults to `zh-CN`. */
  locale?: CalendarLocale
  onSelectDay?: (dayTimestamp: number) => void
  renderCellContent?: (cell: CalendarCell) => ReactNode
  isDisabled?: (dayTimestamp: number) => boolean
  getCellStateClassName?: (cell: CalendarCell) => string | undefined
  getCellButtonProps?: (cell: CalendarCell) => CalendarGridCellButtonProps | undefined
}

function chunkCells(cells: CalendarCell[]): CalendarCell[][] {
  const weeks: CalendarCell[][] = []
  for (let index = 0; index < cells.length; index += DAYS_PER_WEEK) weeks.push(cells.slice(index, index + DAYS_PER_WEEK))
  return weeks
}

function CalendarGrid({ cells, monthLabel, showOutsideDays = true, locale = DEFAULT_CALENDAR_LOCALE, onSelectDay, renderCellContent, isDisabled, getCellStateClassName, getCellButtonProps }: CalendarGridProps) {
  const weeks = chunkCells(cells)
  // `Intl` supplies both the Chinese 一二三四五六日 and the English initials,
  // so the header no longer needs a hand-maintained table per language.
  const weekdayLabels = formatWeekdayLabels(locale)

  return (
    <div className={styles['calendar-grid']}>
      {/* `monthLabel` is used as the grid's accessible name only. Both Calendar
          and DatePicker already show the month in their toolbar, so rendering it
          here as well duplicated the label (and its unstyled width was what
          pushed the date picker wider than the calendar). */}
      <div className={styles['calendar-grid__grid']} role="grid" aria-label={monthLabel}>
        <div className={styles['calendar-grid__rowgroup']} role="rowgroup">
          <div className={styles['calendar-grid__row']} role="row">
            {weekdayLabels.map((label) => <div key={label} className={styles['calendar-grid__weekday']} role="columnheader">{label}</div>)}
          </div>
        </div>
        <div className={styles['calendar-grid__rowgroup']} role="rowgroup">
          {weeks.map((week, weekIndex) => (
            <div key={`week-${weekIndex}`} className={styles['calendar-grid__row']} role="row">
              {week.map((cell) => {
                const hiddenOutsideDay = !showOutsideDays && !cell.inCurrentMonth
                const disabled = hiddenOutsideDay || (isDisabled?.(cell.dateTimestamp) ?? false)
                const buttonProps = getCellButtonProps?.(cell)
                return (
                  <div key={cell.dateTimestamp} role="gridcell" className={classNames(styles['calendar-grid__cell'], !cell.inCurrentMonth && styles['calendar-grid__cell--outside-month'], cell.isToday && styles['calendar-grid__cell--today'], disabled && styles['calendar-grid__cell--disabled'], hiddenOutsideDay && styles['calendar-grid__cell--hidden-outside'], getCellStateClassName?.(cell))}>
                    {hiddenOutsideDay ? <div className={classNames(styles['calendar-grid__button'], styles['calendar-grid__button--placeholder'])} aria-hidden="true"><span className={styles['calendar-grid__day-number']} /></div> : (
                      <button aria-current={cell.isToday ? 'date' : undefined} {...buttonProps} type="button" className={classNames(styles['calendar-grid__button'], buttonProps?.className)} disabled={disabled} onClick={() => { if (!disabled) onSelectDay?.(cell.dateTimestamp) }}>
                        <span className={styles['calendar-grid__day-number']}>{cell.dayNumber}</span>
                        {renderCellContent ? <span className={styles['calendar-grid__content']}>{renderCellContent(cell)}</span> : null}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CalendarGrid
