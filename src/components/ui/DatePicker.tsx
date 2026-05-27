import { useEffect, useRef, useState } from 'react'
import {
  getMonthStartTimestamp,
  normalizeToDayTimestamp,
} from '../../utils/calendar'
import { classNames } from '../../utils/classNames'
import Calendar from './Calendar'
import type { CalendarRangeValue } from './Calendar'
import styles from './DatePicker.module.scss'

type DatePickerMode = 'single' | 'range'

type StarDatePickerValue = number | CalendarRangeValue

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
      return getMonthStartTimestamp(source.startTimestamp!)
    }

    if (source.endTimestamp !== null) {
      return getMonthStartTimestamp(source.endTimestamp!)
    }
  }

  return getMonthStartTimestamp(Date.now())
}

function normalizeRangeValue(value?: StarDatePickerValue): CalendarRangeValue {
  if (value === undefined || typeof value === 'number') {
    return { startTimestamp: null, endTimestamp: null }
  }

  return {
    startTimestamp:
      value.startTimestamp === null ? null : normalizeToDayTimestamp(value.startTimestamp),
    endTimestamp: value.endTimestamp === null ? null : normalizeToDayTimestamp(value.endTimestamp),
  }
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
  const [internalSingleValue, setInternalSingleValue] = useState<number | null>(() => {
    if (mode !== 'single') return null
    if (typeof value === 'number') return normalizeToDayTimestamp(value)
    if (typeof defaultValue === 'number') return normalizeToDayTimestamp(defaultValue)
    return null
  })
  const [internalRangeValue, setInternalRangeValue] = useState<CalendarRangeValue>(() => {
    if (mode !== 'range') return { startTimestamp: null, endTimestamp: null }
    return normalizeRangeValue(value ?? defaultValue)
  })
  const previousModeRef = useRef<DatePickerMode>(mode)
  const previousControlledRef = useRef(isControlled)
  const lastControlledSingleValueRef = useRef<number | null>(getSingleSelectionValue(value))
  const lastControlledRangeValueRef = useRef<CalendarRangeValue>(normalizeRangeValue(value))

  const selectedSingleValue =
    mode === 'single'
      ? typeof value === 'number'
        ? normalizeToDayTimestamp(value)
        : internalSingleValue
      : null
  const selectedRangeValue =
    mode === 'range'
      ? normalizeRangeValue(isControlled ? value : internalRangeValue)
      : { startTimestamp: null, endTimestamp: null }

  useEffect(() => {
    if (!isControlled) return
    lastControlledSingleValueRef.current = getSingleSelectionValue(value)
    lastControlledRangeValueRef.current = normalizeRangeValue(value)
  }, [isControlled, value])

  useEffect(() => {
    const modeChanged = previousModeRef.current !== mode
    const controlChanged = previousControlledRef.current !== isControlled

    if (!modeChanged && !controlChanged) return

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
      setInternalRangeValue({ startTimestamp: null, endTimestamp: null })
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

  const normalizedMinDate = minDate === undefined ? undefined : normalizeToDayTimestamp(minDate)
  const normalizedMaxDate = maxDate === undefined ? undefined : normalizeToDayTimestamp(maxDate)
  const disabledDateSet = new Set(
    disabledDates.map((dayTimestamp) => normalizeToDayTimestamp(dayTimestamp)),
  )

  const isDisabled = (dayTimestamp: number) => {
    if (normalizedMinDate !== undefined && dayTimestamp < normalizedMinDate) return true
    if (normalizedMaxDate !== undefined && dayTimestamp > normalizedMaxDate) return true
    return disabledDateSet.has(dayTimestamp)
  }

  const handleSelectDay = (dayTimestamp: number) => {
    if (isDisabled(dayTimestamp)) return
    const normalizedDay = normalizeToDayTimestamp(dayTimestamp)

    if (mode === 'single') {
      if (!isControlled) setInternalSingleValue(normalizedDay)
      onChange?.({ dateTimestamp: normalizedDay })
    }
  }

  const handleSelectRange = (range: CalendarRangeValue) => {
    if (mode !== 'range') return
    if (range.startTimestamp !== null && isDisabled(range.startTimestamp)) return
    if (range.endTimestamp !== null && isDisabled(range.endTimestamp)) return

    if (!isControlled) setInternalRangeValue(range)
    onChange?.(range)
  }

  return (
    <section className={classNames(styles['date-picker'], className)}>
      <Calendar
        value={undefined}
        defaultValue={getInitialMonth(mode, value, defaultValue)}
        showOutsideDays={showOutsideDays}
        selectedDate={mode === 'single' ? selectedSingleValue ?? undefined : undefined}
        onSelectDate={handleSelectDay}
        selectedRange={mode === 'range' ? selectedRangeValue : undefined}
        onSelectRange={mode === 'range' ? handleSelectRange : undefined}
        isDisabled={isDisabled}
      />
    </section>
  )
}

export default DatePicker
