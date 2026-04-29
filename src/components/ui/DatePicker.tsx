import { useEffect, useMemo, useRef, useState } from 'react'
import {
  addMonths,
  buildCalendarCells,
  getMonthStartTimestamp,
  isDayInRange,
  isSameDay,
  normalizeToDayTimestamp,
  sortRangeTimestamps,
  type CalendarCell,
} from '../../utils/calendar'
import { classNames } from '../../utils/classNames'
import CalendarGrid from './CalendarGrid'
import StarNineSliceButton from './NineSliceButton'
import styles from './DatePicker.module.scss'

type DatePickerMode = 'single' | 'range'

interface StarDatePickerRangeValue {
  startTimestamp: number | null
  endTimestamp: number | null
}

type StarDatePickerValue = number | StarDatePickerRangeValue

type StarDatePickerChangeValue =
  | { dateTimestamp: number }
  | { startTimestamp: number | null; endTimestamp: number | null }

export interface StarDatePickerProps {
  mode?: DatePickerMode
  value?: StarDatePickerValue
  defaultValue?: StarDatePickerValue
  onChange?: (value: StarDatePickerChangeValue) => void
  minDate?: number
  maxDate?: number
  disabledDates?: number[]
  showOutsideDays?: boolean
  className?: string
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

function normalizeRangeValue(value?: StarDatePickerValue): StarDatePickerRangeValue {
  if (value === undefined || typeof value === 'number') {
    return {
      startTimestamp: null,
      endTimestamp: null,
    }
  }

  return {
    startTimestamp:
      value.startTimestamp === null ? null : normalizeToDayTimestamp(value.startTimestamp),
    endTimestamp: value.endTimestamp === null ? null : normalizeToDayTimestamp(value.endTimestamp),
  }
}

function getInitialMonth(
  mode: DatePickerMode,
  value?: StarDatePickerValue,
  defaultValue?: StarDatePickerValue,
) {
  const source = value ?? defaultValue

  if (mode === 'single' && typeof source === 'number') {
    return getMonthStartTimestamp(source)
  }

  if (mode === 'range' && source && typeof source !== 'number') {
    if (source.startTimestamp !== null) {
      return getMonthStartTimestamp(source.startTimestamp)
    }

    if (source.endTimestamp !== null) {
      return getMonthStartTimestamp(source.endTimestamp)
    }
  }

  return getMonthStartTimestamp(Date.now())
}

function getMonthFromValue(mode: DatePickerMode, value?: StarDatePickerValue): number | null {
  if (mode === 'single' && typeof value === 'number') {
    return getMonthStartTimestamp(value)
  }

  if (mode === 'range' && value && typeof value !== 'number') {
    if (value.startTimestamp !== null) {
      return getMonthStartTimestamp(value.startTimestamp)
    }

    if (value.endTimestamp !== null) {
      return getMonthStartTimestamp(value.endTimestamp)
    }
  }

  return null
}

function getSingleSelectionValue(value?: StarDatePickerValue): number | null {
  if (typeof value === 'number') {
    return normalizeToDayTimestamp(value)
  }

  return null
}

function DatePicker({
  mode = 'single',
  value,
  defaultValue,
  onChange,
  minDate,
  maxDate,
  disabledDates = [],
  showOutsideDays = true,
  className,
}: StarDatePickerProps) {
  const isControlled = value !== undefined
  const [internalMonth, setInternalMonth] = useState(() =>
    getInitialMonth(mode, value, defaultValue),
  )
  const [internalSingleValue, setInternalSingleValue] = useState<number | null>(() => {
    if (mode !== 'single') {
      return null
    }

    if (typeof value === 'number') {
      return normalizeToDayTimestamp(value)
    }

    if (typeof defaultValue === 'number') {
      return normalizeToDayTimestamp(defaultValue)
    }

    return null
  })
  const [internalRangeValue, setInternalRangeValue] = useState<StarDatePickerRangeValue>(() => {
    if (mode !== 'range') {
      return {
        startTimestamp: null,
        endTimestamp: null,
      }
    }

    return normalizeRangeValue(value ?? defaultValue)
  })
  const lastControlledMonthRef = useRef<number | null>(getMonthFromValue(mode, value))
  const previousModeRef = useRef<DatePickerMode>(mode)
  const previousControlledRef = useRef(isControlled)
  const lastControlledSingleValueRef = useRef<number | null>(getSingleSelectionValue(value))
  const lastControlledRangeValueRef = useRef<StarDatePickerRangeValue>(normalizeRangeValue(value))

  const selectedSingleValue =
    mode === 'single'
      ? typeof value === 'number'
        ? normalizeToDayTimestamp(value)
        : internalSingleValue
      : null
  const selectedRangeValue =
    mode === 'range'
      ? normalizeRangeValue(isControlled ? value : internalRangeValue)
      : {
          startTimestamp: null,
          endTimestamp: null,
        }

  const monthTimestamp = internalMonth

  useEffect(() => {
    if (!isControlled) {
      lastControlledMonthRef.current = null
      return
    }

    const nextControlledMonth = getMonthFromValue(mode, value)

    if (
      nextControlledMonth !== null &&
      nextControlledMonth !== lastControlledMonthRef.current
    ) {
      setInternalMonth(nextControlledMonth)
    }

    lastControlledMonthRef.current = nextControlledMonth
  }, [isControlled, mode, value])

  useEffect(() => {
    if (!isControlled) {
      return
    }

    lastControlledSingleValueRef.current = getSingleSelectionValue(value)
    lastControlledRangeValueRef.current = normalizeRangeValue(value)
  }, [isControlled, value])

  useEffect(() => {
    const modeChanged = previousModeRef.current !== mode
    const controlChanged = previousControlledRef.current !== isControlled

    if (!modeChanged && !controlChanged) {
      return
    }

    previousModeRef.current = mode
    previousControlledRef.current = isControlled

    if (mode === 'single') {
      const nextSingleValue = isControlled
        ? getSingleSelectionValue(value)
        : defaultValue !== undefined
          ? getSingleSelectionValue(defaultValue)
          : controlChanged
            ? lastControlledSingleValueRef.current
            : getSingleSelectionValue(defaultValue)

      setInternalSingleValue(nextSingleValue)
      setInternalRangeValue({
        startTimestamp: null,
        endTimestamp: null,
      })
      return
    }

    const nextRangeValue = isControlled
      ? normalizeRangeValue(value)
      : defaultValue !== undefined
        ? normalizeRangeValue(defaultValue)
        : controlChanged
          ? lastControlledRangeValueRef.current
          : normalizeRangeValue(defaultValue)

    setInternalRangeValue(nextRangeValue)
    setInternalSingleValue(null)
  }, [defaultValue, isControlled, mode, value])

  const cells = useMemo(() => buildCalendarCells(monthTimestamp), [monthTimestamp])
  const normalizedMinDate = minDate === undefined ? undefined : normalizeToDayTimestamp(minDate)
  const normalizedMaxDate = maxDate === undefined ? undefined : normalizeToDayTimestamp(maxDate)
  const disabledDateSet = useMemo(
    () => new Set(disabledDates.map((dayTimestamp) => normalizeToDayTimestamp(dayTimestamp))),
    [disabledDates],
  )

  const isDisabled = (dayTimestamp: number) => {
    if (normalizedMinDate !== undefined && dayTimestamp < normalizedMinDate) {
      return true
    }

    if (normalizedMaxDate !== undefined && dayTimestamp > normalizedMaxDate) {
      return true
    }

    return disabledDateSet.has(dayTimestamp)
  }

  const updateMonthForDay = (dayTimestamp: number) => {
    setInternalMonth(getMonthStartTimestamp(dayTimestamp))
  }

  const handleSelectDay = (dayTimestamp: number) => {
    if (isDisabled(dayTimestamp)) {
      return
    }

    const normalizedDay = normalizeToDayTimestamp(dayTimestamp)
    updateMonthForDay(normalizedDay)

    if (mode === 'single') {
      if (!isControlled) {
        setInternalSingleValue(normalizedDay)
      }

      onChange?.({ dateTimestamp: normalizedDay })
      return
    }

    const { startTimestamp, endTimestamp } = selectedRangeValue

    if (startTimestamp === null || endTimestamp !== null) {
      const nextValue = {
        startTimestamp: normalizedDay,
        endTimestamp: null,
      }

      if (!isControlled) {
        setInternalRangeValue(nextValue)
      }

      onChange?.(nextValue)
      return
    }

    const [sortedStart, sortedEnd] = sortRangeTimestamps(startTimestamp, normalizedDay)
    const nextValue = {
      startTimestamp: sortedStart,
      endTimestamp: sortedEnd,
    }

    if (!isControlled) {
      setInternalRangeValue(nextValue)
    }

    onChange?.(nextValue)
  }

  const changeMonth = (offset: number) => {
    setInternalMonth((currentMonth) => addMonths(currentMonth, offset))
  }

  const getCellStateClassName = (cell: CalendarCell) => {
    if (mode === 'single') {
      return selectedSingleValue !== null && isSameDay(cell.dateTimestamp, selectedSingleValue)
        ? styles['date-picker__cell--selected']
        : undefined
    }

    const { startTimestamp, endTimestamp } = selectedRangeValue
    const isRangeStart =
      startTimestamp !== null && isSameDay(cell.dateTimestamp, startTimestamp)
    const isRangeEnd = endTimestamp !== null && isSameDay(cell.dateTimestamp, endTimestamp)
    const inRange =
      startTimestamp !== null && isDayInRange(cell.dateTimestamp, startTimestamp, endTimestamp ?? startTimestamp)

    return classNames(
      isRangeStart && styles['date-picker__cell--range-start'],
      isRangeEnd && styles['date-picker__cell--range-end'],
      inRange && styles['date-picker__cell--in-range'],
    )
  }

  const getCellButtonProps = (cell: CalendarCell) => {
    if (mode === 'single') {
      const isSelected =
        selectedSingleValue !== null && isSameDay(cell.dateTimestamp, selectedSingleValue)

      return {
        'aria-label': formatDayLabel(cell.dateTimestamp),
        'data-selected': isSelected ? 'true' : undefined,
      }
    }

    const { startTimestamp, endTimestamp } = selectedRangeValue
    const isRangeStart =
      startTimestamp !== null && isSameDay(cell.dateTimestamp, startTimestamp)
    const isRangeEnd = endTimestamp !== null && isSameDay(cell.dateTimestamp, endTimestamp)
    const inRange =
      startTimestamp !== null && isDayInRange(cell.dateTimestamp, startTimestamp, endTimestamp ?? startTimestamp)

    return {
      'aria-label': formatDayLabel(cell.dateTimestamp),
      'data-selected': isRangeStart || isRangeEnd ? 'true' : undefined,
      'data-range-position': isRangeStart ? 'start' : isRangeEnd ? 'end' : undefined,
      'data-in-range': inRange ? 'true' : undefined,
    }
  }

  return (
    <section className={classNames(styles['date-picker'], className)}>
      <div className={styles['date-picker__toolbar']}>
        <StarNineSliceButton
          type="button"
          variant="concise"
          size="small"
          aria-label="Previous month"
          onClick={() => changeMonth(-1)}
        >
          &lt;
        </StarNineSliceButton>
        <div className={styles['date-picker__month']}>{formatMonthLabel(monthTimestamp)}</div>
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
        onSelectDay={handleSelectDay}
        isDisabled={isDisabled}
        getCellStateClassName={getCellStateClassName}
        getCellButtonProps={getCellButtonProps}
      />
    </section>
  )
}

export default DatePicker
