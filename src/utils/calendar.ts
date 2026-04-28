export type CalendarInput = number | string | Date

export type CalendarDayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7

export interface CalendarCell {
  dateTimestamp: number
  dayNumber: number
  dayOfWeek: CalendarDayOfWeek
  inCurrentMonth: boolean
  isToday: boolean
}

const DAYS_IN_WEEK = 7
const CALENDAR_CELLS = 42
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const ISO_LOCAL_DATETIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/
const ISO_OFFSET_DATETIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|[+-]\d{2}:\d{2})$/

function createValidatedLocalDate(
  year: number,
  monthIndex: number,
  day: number,
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0,
): Date {
  const date = new Date(year, monthIndex, day, hours, minutes, seconds, milliseconds)

  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== monthIndex ||
    date.getDate() !== day ||
    date.getHours() !== hours ||
    date.getMinutes() !== minutes ||
    date.getSeconds() !== seconds ||
    date.getMilliseconds() !== milliseconds
  ) {
    throw new Error('Invalid calendar input')
  }

  return date
}

function parseMilliseconds(millisecondsText?: string): number {
  if (!millisecondsText) {
    return 0
  }

  return Number(millisecondsText.padEnd(3, '0'))
}

function toValidDate(input: CalendarInput): Date {
  if (input instanceof Date) {
    const date = new Date(input.getTime())

    if (Number.isNaN(date.getTime())) {
      throw new Error('Invalid calendar input')
    }

    return date
  }

  if (typeof input === 'string') {
    const dateOnlyMatch = DATE_ONLY_PATTERN.exec(input)

    if (dateOnlyMatch) {
      const [, yearText, monthText, dayText] = dateOnlyMatch
      return createValidatedLocalDate(Number(yearText), Number(monthText) - 1, Number(dayText))
    }

    const isoLocalDateTimeMatch = ISO_LOCAL_DATETIME_PATTERN.exec(input)

    if (isoLocalDateTimeMatch) {
      const [, yearText, monthText, dayText, hourText, minuteText, secondText, millisecondText] = isoLocalDateTimeMatch

      return createValidatedLocalDate(
        Number(yearText),
        Number(monthText) - 1,
        Number(dayText),
        Number(hourText),
        Number(minuteText),
        secondText ? Number(secondText) : 0,
        parseMilliseconds(millisecondText),
      )
    }

    const isoOffsetDateTimeMatch = ISO_OFFSET_DATETIME_PATTERN.exec(input)

    if (isoOffsetDateTimeMatch) {
      const date = new Date(input)

      if (Number.isNaN(date.getTime())) {
        throw new Error('Invalid calendar input')
      }

      return date
    }

    throw new Error('Invalid calendar input')
  }

  const date = new Date(input)

  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid calendar input')
  }

  return date
}

function getDayOfWeek(date: Date): CalendarDayOfWeek {
  const day = date.getDay()

  return (day === 0 ? 7 : day) as CalendarDayOfWeek
}

export function normalizeToDayTimestamp(input: CalendarInput): number {
  const date = toValidDate(input)

  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

export function getMonthStartTimestamp(input: CalendarInput): number {
  const date = toValidDate(input)

  return new Date(date.getFullYear(), date.getMonth(), 1).getTime()
}

export function addMonths(monthTimestamp: CalendarInput, offset: number): number {
  const monthStart = getMonthStartTimestamp(monthTimestamp)
  const date = new Date(monthStart)

  return new Date(date.getFullYear(), date.getMonth() + offset, 1).getTime()
}

export function isSameDay(left: CalendarInput, right: CalendarInput): boolean {
  return normalizeToDayTimestamp(left) === normalizeToDayTimestamp(right)
}

export function sortRangeTimestamps(first: CalendarInput, second: CalendarInput): [number, number] {
  const normalized = [
    normalizeToDayTimestamp(first),
    normalizeToDayTimestamp(second),
  ].sort((left, right) => left - right)

  return [normalized[0], normalized[1]]
}

export function isDayInRange(
  day: CalendarInput,
  start?: CalendarInput,
  end?: CalendarInput,
): boolean {
  if (start === undefined || end === undefined) {
    return false
  }

  const [rangeStart, rangeEnd] = sortRangeTimestamps(start, end)
  const dayTimestamp = normalizeToDayTimestamp(day)

  return dayTimestamp >= rangeStart && dayTimestamp <= rangeEnd
}

export function buildCalendarCells(monthTimestamp: CalendarInput): CalendarCell[] {
  const currentMonthStart = getMonthStartTimestamp(monthTimestamp)
  const currentMonthDate = new Date(currentMonthStart)
  const firstDayOffset = getDayOfWeek(currentMonthDate) - 1
  const firstVisibleDate = new Date(
    currentMonthDate.getFullYear(),
    currentMonthDate.getMonth(),
    1 - firstDayOffset,
  )
  const todayTimestamp = normalizeToDayTimestamp(new Date())

  return Array.from({ length: CALENDAR_CELLS }, (_, index) => {
    const cellDate = new Date(
      firstVisibleDate.getFullYear(),
      firstVisibleDate.getMonth(),
      firstVisibleDate.getDate() + index,
    )
    const dateTimestamp = normalizeToDayTimestamp(cellDate)

    return {
      dateTimestamp,
      dayNumber: cellDate.getDate(),
      dayOfWeek: (((index % DAYS_IN_WEEK) + 1) as CalendarDayOfWeek),
      inCurrentMonth: cellDate.getMonth() === currentMonthDate.getMonth(),
      isToday: dateTimestamp === todayTimestamp,
    }
  })
}
