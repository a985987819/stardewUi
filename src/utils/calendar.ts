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

/**
 * 「今日」默认按东八区（Asia/Shanghai）计算。中国大陆不使用夏令时，偏移全年
 * 固定为 +08:00，所以这里可以直接用常量分钟数而不是完整时区数据库。
 */
export const CHINA_STANDARD_TIME_OFFSET_MINUTES = 8 * 60
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

/**
 * 指定时区下「今天」的那一天，返回值仍然是与 `buildCalendarCells` 同源的
 * **本地零点时间戳**：先把瞬间平移到目标时区读出年月日，再按本地日历日建时间戳。
 * 这样跨时区算出来的「今日」能和日历格子直接比较，不会因为浏览器时区而错位。
 *
 * `now` 放在第二位是为了让组件里可以只传偏移量：`Date.now()` 默认值留在本模块内，
 * 组件渲染路径上就不会出现 `Date.now()` 这类杂质调用（react-hooks/purity）。
 */
export function getTodayTimestamp(
  offsetMinutes: number = CHINA_STANDARD_TIME_OFFSET_MINUTES,
  now: CalendarInput = Date.now(),
): number {
  const instant = toValidDate(now).getTime()
  const shifted = new Date(instant + offsetMinutes * 60_000)

  return new Date(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()).getTime()
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

export function groupCalendarItemsByDay<Item extends { date: CalendarInput }>(
  items: Item[],
): Record<number, Item[]> {
  return items.reduce<Record<number, Item[]>>((accumulator, item) => {
    const dayTimestamp = normalizeToDayTimestamp(item.date)
    const dayItems = accumulator[dayTimestamp] ?? []
    dayItems.push(item)
    accumulator[dayTimestamp] = dayItems
    return accumulator
  }, {})
}

export function buildCalendarCells(
  monthTimestamp: CalendarInput,
  todayTimestamp: CalendarInput = getTodayTimestamp(),
): CalendarCell[] {
  const currentMonthStart = getMonthStartTimestamp(monthTimestamp)
  const currentMonthDate = new Date(currentMonthStart)
  const firstDayOffset = getDayOfWeek(currentMonthDate) - 1
  const firstVisibleDate = new Date(
    currentMonthDate.getFullYear(),
    currentMonthDate.getMonth(),
    1 - firstDayOffset,
  )
  const normalizedTodayTimestamp = normalizeToDayTimestamp(todayTimestamp)

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
      isToday: dateTimestamp === normalizedTodayTimestamp,
    }
  })
}
