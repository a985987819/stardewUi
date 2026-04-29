import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { CalendarCell } from '../../utils/calendar'
import { classNames } from '../../utils/classNames'
import styles from './CalendarGrid.module.scss'

const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'] as const
const DAYS_PER_WEEK = 7

export type CalendarGridCellButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type' | 'disabled' | 'onClick'>

export interface CalendarGridProps {
  cells: CalendarCell[]
  monthLabel?: string
  showOutsideDays?: boolean
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

function CalendarGrid({ cells, monthLabel, showOutsideDays = true, onSelectDay, renderCellContent, isDisabled, getCellStateClassName, getCellButtonProps }: CalendarGridProps) {
  const weeks = chunkCells(cells)

  return (
    <div className={styles['calendar-grid']}>
      {monthLabel ? <div className={styles['calendar-grid__month-label']}>{monthLabel}</div> : null}
      <div className={styles['calendar-grid__grid']} role="grid" aria-label={monthLabel}>
        <div className={styles['calendar-grid__rowgroup']} role="rowgroup">
          <div className={styles['calendar-grid__row']} role="row">
            {WEEKDAY_LABELS.map((label) => <div key={label} className={styles['calendar-grid__weekday']} role="columnheader">{label}</div>)}
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
                      <button {...buttonProps} type="button" className={classNames(styles['calendar-grid__button'], buttonProps?.className)} disabled={disabled} onClick={() => { if (!disabled) onSelectDay?.(cell.dateTimestamp) }}>
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
