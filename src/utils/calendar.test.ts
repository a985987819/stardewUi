import { describe, expect, it } from 'vitest'
import {
  addMonths,
  buildCalendarCells,
  getMonthStartTimestamp,
  isDayInRange,
  isSameDay,
  normalizeToDayTimestamp,
  sortRangeTimestamps,
} from './calendar'

function withSimulatedDateOnlyUtcDrift<T>(callback: () => T): T {
  const RealDate = Date

  class FakeDate extends RealDate {
    constructor(...args: ConstructorParameters<DateConstructor>) {
      if (
        args.length === 1 &&
        typeof args[0] === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(args[0])
      ) {
        const [year, month, day] = args[0].split('-').map(Number)
        super(year, month - 1, day - 1, 17, 0, 0, 0)
        return
      }

      super(...args)
    }
  }

  globalThis.Date = FakeDate as DateConstructor

  try {
    return callback()
  } finally {
    globalThis.Date = RealDate
  }
}

describe('calendar utilities', () => {
  it('normalizes inputs to local midnight timestamps', () => {
    const input = new Date(2026, 3, 15, 18, 45, 12, 99)

    expect(normalizeToDayTimestamp(input)).toBe(new Date(2026, 3, 15).getTime())
  })

  it('treats date-only strings as local calendar days instead of UTC-shifted dates', () => {
    const expected = new Date(2026, 3, 1).getTime()

    const normalized = withSimulatedDateOnlyUtcDrift(() => normalizeToDayTimestamp('2026-04-01'))

    expect(normalized).toBe(expected)
  })

  it('accepts stable ISO-like datetime strings and normalizes them to the local calendar day', () => {
    expect(normalizeToDayTimestamp('2026-04-01T18:45:00')).toBe(new Date(2026, 3, 1).getTime())
  })

  it('rejects ambiguous locale-dependent date strings', () => {
    expect(() => normalizeToDayTimestamp('04/01/2026')).toThrow('Invalid calendar input')
  })

  it('derives the month start timestamp', () => {
    const input = new Date(2026, 3, 15, 18, 45)

    expect(getMonthStartTimestamp(input)).toBe(new Date(2026, 3, 1).getTime())
  })

  it('adds months across year boundaries while staying on the first day', () => {
    const decemberStart = new Date(2026, 11, 1).getTime()

    expect(addMonths(decemberStart, 1)).toBe(new Date(2027, 0, 1).getTime())
    expect(addMonths(decemberStart, -2)).toBe(new Date(2026, 9, 1).getTime())
  })

  it('builds a 42-cell Monday-first grid for April 2026', () => {
    const cells = buildCalendarCells(new Date(2026, 3, 1).getTime())

    expect(cells).toHaveLength(42)
    expect(cells[0]).toMatchObject({
      dateTimestamp: new Date(2026, 2, 30).getTime(),
      dayNumber: 30,
      dayOfWeek: 1,
      inCurrentMonth: false,
    })
    expect(cells[2]).toMatchObject({
      dateTimestamp: new Date(2026, 3, 1).getTime(),
      dayNumber: 1,
      dayOfWeek: 3,
      inCurrentMonth: true,
    })
    expect(cells[6]?.dayOfWeek).toBe(7)
    expect(cells[7]).toMatchObject({
      dateTimestamp: new Date(2026, 3, 6).getTime(),
      dayOfWeek: 1,
    })
  })

  it('compares same-day values while ignoring time', () => {
    const left = new Date(2026, 3, 15, 0, 1)
    const right = new Date(2026, 3, 15, 23, 59, 59, 999)

    expect(isSameDay(left, right)).toBe(true)
    expect(isSameDay(left, new Date(2026, 3, 16, 0, 0))).toBe(false)
  })

  it('sorts reversed range endpoints into ascending timestamps', () => {
    const start = new Date(2026, 3, 20, 18, 0)
    const end = new Date(2026, 3, 10, 9, 30)

    expect(sortRangeTimestamps(start, end)).toEqual([
      new Date(2026, 3, 10).getTime(),
      new Date(2026, 3, 20).getTime(),
    ])
  })

  it('checks inclusive day membership in a complete range', () => {
    const start = new Date(2026, 3, 10)
    const end = new Date(2026, 3, 20)

    expect(isDayInRange(new Date(2026, 3, 10, 23, 59), start, end)).toBe(true)
    expect(isDayInRange(new Date(2026, 3, 15, 8, 0), start, end)).toBe(true)
    expect(isDayInRange(new Date(2026, 3, 20, 0, 1), start, end)).toBe(true)
    expect(isDayInRange(new Date(2026, 3, 21), start, end)).toBe(false)
    expect(isDayInRange(new Date(2026, 3, 15), start, undefined)).toBe(false)
  })

  it('applies date-only string parsing consistently across exported helpers', () => {
    const results = withSimulatedDateOnlyUtcDrift(() => {
      const cells = buildCalendarCells('2026-04-01')

      return {
        monthStart: getMonthStartTimestamp('2026-04-18'),
        sameDay: isSameDay('2026-04-01', new Date(2026, 3, 1, 22, 0)),
        sortedRange: sortRangeTimestamps('2026-04-20', '2026-04-10'),
        inRange: isDayInRange('2026-04-15', '2026-04-10', '2026-04-20'),
        aprilFirstCell: cells[2]?.dateTimestamp,
      }
    })

    expect(results.monthStart).toBe(new Date(2026, 3, 1).getTime())
    expect(results.sameDay).toBe(true)
    expect(results.sortedRange).toEqual([
      new Date(2026, 3, 10).getTime(),
      new Date(2026, 3, 20).getTime(),
    ])
    expect(results.inRange).toBe(true)
    expect(results.aprilFirstCell).toBe(new Date(2026, 3, 1).getTime())
  })
})
