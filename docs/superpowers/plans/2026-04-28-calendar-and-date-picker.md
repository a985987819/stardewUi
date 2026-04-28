# Calendar And Date Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `StarCalendar` and `StarDatePicker` as reusable pixel-style Gregorian date components with shared grid logic, demo pages, and automated tests.

**Architecture:** Implement a shared `CalendarGrid` plus `src/utils/calendar.ts` for date math, then layer a display-focused `StarCalendar` and a selection-focused `StarDatePicker` on top. Wire both into the existing docs/demo site through new component demo pages and route entries, keeping styles in SCSS modules and exports in the existing `src/components/ui/index.ts` barrel.

**Tech Stack:** React 19, TypeScript, SCSS modules, React Router 7, Vitest, Testing Library

---

## File Structure

### New files

- `src/utils/calendar.ts`
  - Shared date normalization, month generation, range helpers, and exported calendar types
- `src/utils/calendar.test.ts`
  - Unit tests for pure date utilities
- `src/components/ui/CalendarGrid.tsx`
  - Shared month grid renderer used by calendar display and picker
- `src/components/ui/CalendarGrid.module.scss`
  - Pixel-style grid visuals and state styles
- `src/components/ui/Calendar.tsx`
  - Read-only calendar with marker rendering and hover details
- `src/components/ui/Calendar.module.scss`
  - Calendar-specific shell, toolbar, marker, and tooltip styles
- `src/components/ui/DatePicker.tsx`
  - Single/range date picker built on `CalendarGrid`
- `src/components/ui/DatePicker.module.scss`
  - Picker shell, control row, result panel, and state styles
- `src/components/ui/Calendar.test.tsx`
  - Calendar behavior tests
- `src/components/ui/DatePicker.test.tsx`
  - Picker interaction tests
- `src/pages/CalendarDemo.tsx`
  - Calendar component documentation/demo page
- `src/pages/DatePickerDemo.tsx`
  - DatePicker component documentation/demo page

### Modified files

- `src/components/ui/index.ts`
  - Export new components and public types
- `src/pages/index.ts`
  - Export new demo pages
- `src/router/index.tsx`
  - Register `/components/calendar` and `/components/date-picker`
- `src/pages/Components.tsx`
  - Add component cards linking to new demos

## Task 1: Build and verify date utility layer

**Files:**
- Create: `src/utils/calendar.ts`
- Create: `src/utils/calendar.test.ts`

- [ ] **Step 1: Write the failing utility tests**

```ts
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

describe('calendar utils', () => {
  it('normalizes arbitrary date input to local day-start timestamps', () => {
    const value = normalizeToDayTimestamp('2026-04-28T15:45:12')
    const expected = new Date(2026, 3, 28).getTime()

    expect(value).toBe(expected)
  })

  it('returns the first day of the month at local midnight', () => {
    const value = getMonthStartTimestamp(new Date(2026, 3, 28).getTime())
    const expected = new Date(2026, 3, 1).getTime()

    expect(value).toBe(expected)
  })

  it('adds months across year boundaries', () => {
    const value = addMonths(new Date(2026, 11, 1).getTime(), 1)
    const expected = new Date(2027, 0, 1).getTime()

    expect(value).toBe(expected)
  })

  it('builds a 42-cell grid with Monday as the first column', () => {
    const cells = buildCalendarCells(new Date(2026, 3, 1).getTime())

    expect(cells).toHaveLength(42)
    expect(cells[0].dateTimestamp).toBe(new Date(2026, 2, 30).getTime())
    expect(cells[0].dayOfWeek).toBe(1)
    expect(cells[2].dateTimestamp).toBe(new Date(2026, 3, 1).getTime())
    expect(cells[2].inCurrentMonth).toBe(true)
  })

  it('compares day equality after normalization', () => {
    expect(isSameDay('2026-04-28T01:00:00', '2026-04-28T23:59:59')).toBe(true)
  })

  it('sorts reverse range input into ascending timestamps', () => {
    const result = sortRangeTimestamps(new Date(2026, 4, 8).getTime(), new Date(2026, 4, 3).getTime())

    expect(result).toEqual({
      startTimestamp: new Date(2026, 4, 3).getTime(),
      endTimestamp: new Date(2026, 4, 8).getTime(),
    })
  })

  it('treats inclusive boundaries as inside the range', () => {
    const start = new Date(2026, 4, 3).getTime()
    const end = new Date(2026, 4, 8).getTime()

    expect(isDayInRange(new Date(2026, 4, 3).getTime(), start, end)).toBe(true)
    expect(isDayInRange(new Date(2026, 4, 5).getTime(), start, end)).toBe(true)
    expect(isDayInRange(new Date(2026, 4, 8).getTime(), start, end)).toBe(true)
    expect(isDayInRange(new Date(2026, 4, 9).getTime(), start, end)).toBe(false)
  })
})
```

- [ ] **Step 2: Run the utility test file to verify RED**

Run: `npm run test:run -- src/utils/calendar.test.ts`

Expected: FAIL with module resolution errors for `./calendar` exports that do not exist yet.

- [ ] **Step 3: Implement the minimal date utility layer**

```ts
export type CalendarInput = number | string | Date

export type CalendarCell = {
  dateTimestamp: number
  dayNumber: number
  dayOfWeek: number
  inCurrentMonth: boolean
  isToday: boolean
}

const DAYS_PER_WEEK = 7
const GRID_CELL_COUNT = 42

function toDate(input: CalendarInput): Date {
  const date = input instanceof Date ? new Date(input.getTime()) : new Date(input)

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid calendar input: ${String(input)}`)
  }

  return date
}

export function normalizeToDayTimestamp(input: CalendarInput): number {
  const date = toDate(input)
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

export function getMonthStartTimestamp(input: CalendarInput): number {
  const date = toDate(input)
  return new Date(date.getFullYear(), date.getMonth(), 1).getTime()
}

export function addMonths(monthTimestamp: number, offset: number): number {
  const date = new Date(getMonthStartTimestamp(monthTimestamp))
  return new Date(date.getFullYear(), date.getMonth() + offset, 1).getTime()
}

export function isSameDay(left: CalendarInput, right: CalendarInput): boolean {
  return normalizeToDayTimestamp(left) === normalizeToDayTimestamp(right)
}

export function sortRangeTimestamps(first: number, second: number) {
  const start = normalizeToDayTimestamp(Math.min(first, second))
  const end = normalizeToDayTimestamp(Math.max(first, second))

  return { startTimestamp: start, endTimestamp: end }
}

export function isDayInRange(day: number, start: number | null, end: number | null): boolean {
  if (start == null || end == null) {
    return false
  }

  const normalizedDay = normalizeToDayTimestamp(day)
  return normalizedDay >= normalizeToDayTimestamp(start) && normalizedDay <= normalizeToDayTimestamp(end)
}

export function buildCalendarCells(monthTimestamp: number): CalendarCell[] {
  const monthStart = new Date(getMonthStartTimestamp(monthTimestamp))
  const firstDay = monthStart.getDay()
  const mondayIndex = firstDay === 0 ? 6 : firstDay - 1
  const gridStart = new Date(monthStart.getFullYear(), monthStart.getMonth(), 1 - mondayIndex)
  const today = normalizeToDayTimestamp(new Date())

  return Array.from({ length: GRID_CELL_COUNT }, (_, index) => {
    const current = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index)
    const dateTimestamp = current.getTime()

    return {
      dateTimestamp,
      dayNumber: current.getDate(),
      dayOfWeek: ((index % DAYS_PER_WEEK) + 1),
      inCurrentMonth: current.getMonth() === monthStart.getMonth(),
      isToday: dateTimestamp === today,
    }
  })
}
```

- [ ] **Step 4: Run the utility test file to verify GREEN**

Run: `npm run test:run -- src/utils/calendar.test.ts`

Expected: PASS for all utility cases.

- [ ] **Step 5: Commit the utility layer**

```bash
git add src/utils/calendar.ts src/utils/calendar.test.ts
git commit -m "feat: add calendar date utilities"
```

## Task 2: Build the shared CalendarGrid shell

**Files:**
- Create: `src/components/ui/CalendarGrid.tsx`
- Create: `src/components/ui/CalendarGrid.module.scss`
- Modify: `src/utils/calendar.ts`

- [ ] **Step 1: Write the failing shared grid test through the future picker/calendar surface**

```ts
import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CalendarGrid from './CalendarGrid'
import { buildCalendarCells } from '../../utils/calendar'

describe('CalendarGrid', () => {
  it('renders Monday-first weekday headers and 42 date cells', () => {
    render(
      <CalendarGrid
        cells={buildCalendarCells(new Date(2026, 3, 1).getTime())}
        monthLabel="2026年4月"
      />
    )

    expect(screen.getByText('一')).toBeInTheDocument()
    expect(screen.getByText('日')).toBeInTheDocument()
    expect(screen.getAllByRole('gridcell')).toHaveLength(42)
  })

  it('hides outside-month values when showOutsideDays is false', () => {
    render(
      <CalendarGrid
        cells={buildCalendarCells(new Date(2026, 3, 1).getTime())}
        monthLabel="2026年4月"
        showOutsideDays={false}
      />
    )

    expect(screen.getAllByText('1').length).toBeGreaterThan(0)
    expect(screen.queryByLabelText('2026-03-30')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the grid test to verify RED**

Run: `npm run test:run -- src/components/ui/CalendarGrid.test.tsx`

Expected: FAIL because `CalendarGrid.tsx` does not exist yet.

- [ ] **Step 3: Create the shared grid implementation and styles**

```tsx
import styles from './CalendarGrid.module.scss'
import { type CalendarCell } from '../../utils/calendar'
import { clsx } from 'clsx'

type CalendarGridProps = {
  cells: CalendarCell[]
  monthLabel: string
  showOutsideDays?: boolean
  onSelectDay?: (dayTimestamp: number) => void
  renderCellContent?: (cell: CalendarCell) => React.ReactNode
  isDisabled?: (dayTimestamp: number) => boolean
  getCellStateClassName?: (cell: CalendarCell) => string | undefined
}

const weekdayLabels = ['一', '二', '三', '四', '五', '六', '日']

function CalendarGrid({
  cells,
  monthLabel,
  showOutsideDays = true,
  onSelectDay,
  renderCellContent,
  isDisabled,
  getCellStateClassName,
}: CalendarGridProps) {
  return (
    <div className={styles['calendar-grid']} aria-label={monthLabel}>
      <div className={styles['calendar-grid__weekdays']} role="row">
        {weekdayLabels.map((label) => (
          <div key={label} className={styles['calendar-grid__weekday']} role="columnheader">
            {label}
          </div>
        ))}
      </div>

      <div className={styles['calendar-grid__body']} role="grid">
        {cells.map((cell) => {
          const disabled = isDisabled?.(cell.dateTimestamp) ?? false
          const label = new Date(cell.dateTimestamp).toISOString().slice(0, 10)

          return (
            <button
              key={cell.dateTimestamp}
              type="button"
              role="gridcell"
              aria-label={showOutsideDays || cell.inCurrentMonth ? label : undefined}
              disabled={disabled}
              className={clsx(
                styles['calendar-grid__cell'],
                !cell.inCurrentMonth && styles['calendar-grid__cell--outside'],
                cell.isToday && styles['calendar-grid__cell--today'],
                disabled && styles['calendar-grid__cell--disabled'],
                getCellStateClassName?.(cell)
              )}
              onClick={() => onSelectDay?.(cell.dateTimestamp)}
            >
              <span className={styles['calendar-grid__day-number']}>
                {showOutsideDays || cell.inCurrentMonth ? cell.dayNumber : ''}
              </span>
              {renderCellContent?.(cell)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default CalendarGrid
```

```scss
.calendar-grid {
  display: grid;
  gap: 0.5rem;
}

.calendar-grid__weekdays,
.calendar-grid__body {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.calendar-grid__weekday {
  padding: 0.5rem 0;
  text-align: center;
  font-weight: 700;
}

.calendar-grid__cell {
  position: relative;
  min-height: 6.5rem;
  border: 2px solid #2e2116;
  background: #f7ebc7;
  color: #2e2116;
}

.calendar-grid__cell--outside {
  opacity: 0.55;
}

.calendar-grid__cell--today {
  box-shadow: inset 0 0 0 2px #d58f2a;
}

.calendar-grid__cell--disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.calendar-grid__day-number {
  position: absolute;
  top: 0.35rem;
  left: 0.35rem;
}
```

- [ ] **Step 4: Add the missing dedicated grid test file and rerun**

```ts
import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CalendarGrid from './CalendarGrid'
import { buildCalendarCells } from '../../utils/calendar'

describe('CalendarGrid', () => {
  it('renders Monday-first weekday headers and 42 date cells', () => {
    render(
      <CalendarGrid
        cells={buildCalendarCells(new Date(2026, 3, 1).getTime())}
        monthLabel="2026年4月"
      />
    )

    expect(screen.getByText('一')).toBeInTheDocument()
    expect(screen.getByText('日')).toBeInTheDocument()
    expect(screen.getAllByRole('gridcell')).toHaveLength(42)
  })

  it('hides outside-month values when showOutsideDays is false', () => {
    render(
      <CalendarGrid
        cells={buildCalendarCells(new Date(2026, 3, 1).getTime())}
        monthLabel="2026年4月"
        showOutsideDays={false}
      />
    )

    const hiddenOutsideCell = screen.getAllByRole('gridcell').find((cell) => cell.textContent === '')
    expect(hiddenOutsideCell).toBeDefined()
  })
})
```

Run: `npm run test:run -- src/components/ui/CalendarGrid.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit the shared grid shell**

```bash
git add src/components/ui/CalendarGrid.tsx src/components/ui/CalendarGrid.module.scss src/components/ui/CalendarGrid.test.tsx
git commit -m "feat: add shared calendar grid"
```

## Task 3: Build StarCalendar with marker rendering and tooltip details

**Files:**
- Create: `src/components/ui/Calendar.tsx`
- Create: `src/components/ui/Calendar.module.scss`
- Create: `src/components/ui/Calendar.test.tsx`
- Modify: `src/utils/calendar.ts`
- Modify: `src/components/ui/index.ts`

- [ ] **Step 1: Write the failing calendar behavior tests**

```ts
import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Calendar from './Calendar'

describe('Calendar', () => {
  it('renders event markers on the matching day', () => {
    render(
      <Calendar
        defaultValue={new Date(2026, 3, 1).getTime()}
        items={[
          { date: new Date(2026, 3, 4).getTime(), title: '亚历克斯生日', iconKey: 'birthday' },
        ]}
        iconMap={{ birthday: <span data-testid="birthday-icon">B</span> }}
      />
    )

    expect(screen.getByTestId('birthday-icon')).toBeInTheDocument()
  })

  it('uses icon priority node over src over key', () => {
    render(
      <Calendar
        defaultValue={new Date(2026, 3, 1).getTime()}
        items={[
          {
            date: new Date(2026, 3, 10).getTime(),
            title: '优先级测试',
            iconKey: 'birthday',
            iconSrc: '/icon.png',
            iconNode: <span data-testid="icon-node">N</span>,
          },
        ]}
        iconMap={{ birthday: <span data-testid="icon-key">K</span> }}
      />
    )

    expect(screen.getByTestId('icon-node')).toBeInTheDocument()
    expect(screen.queryByTestId('icon-key')).not.toBeInTheDocument()
  })

  it('shows a +N summary when markers exceed the visible limit', () => {
    render(
      <Calendar
        defaultValue={new Date(2026, 3, 1).getTime()}
        maxVisibleMarkers={1}
        items={[
          { date: new Date(2026, 3, 15).getTime(), title: 'A', iconKey: 'festival' },
          { date: new Date(2026, 3, 15).getTime(), title: 'B', iconKey: 'festival' },
        ]}
        iconMap={{ festival: <span>F</span> }}
      />
    )

    expect(screen.getByText('+1')).toBeInTheDocument()
  })

  it('shows full item details on hover', () => {
    render(
      <Calendar
        defaultValue={new Date(2026, 3, 1).getTime()}
        items={[
          { date: new Date(2026, 3, 18).getTime(), title: '旅行商人', description: '晚上 8 点前来' },
        ]}
      />
    )

    fireEvent.pointerEnter(screen.getByRole('gridcell', { name: '2026-04-18' }))

    expect(screen.getByText('旅行商人')).toBeInTheDocument()
    expect(screen.getByText('晚上 8 点前来')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the calendar test file to verify RED**

Run: `npm run test:run -- src/components/ui/Calendar.test.tsx`

Expected: FAIL because `Calendar.tsx` does not exist.

- [ ] **Step 3: Implement the minimal calendar component**

```tsx
import { useState } from 'react'
import { StarNineSliceButton } from './index'
import CalendarGrid from './CalendarGrid'
import styles from './Calendar.module.scss'
import {
  addMonths,
  buildCalendarCells,
  getMonthStartTimestamp,
  normalizeToDayTimestamp,
  type CalendarInput,
} from '../../utils/calendar'

export type CalendarItem = {
  date: CalendarInput
  title: string
  description?: string
  iconKey?: string
  iconSrc?: string
  iconNode?: React.ReactNode
  tone?: 'default' | 'info' | 'success' | 'warning' | 'danger'
  meta?: Record<string, unknown>
}

type CalendarProps = {
  value?: number
  defaultValue?: number
  onMonthChange?: (monthTimestamp: number) => void
  items?: CalendarItem[]
  maxVisibleMarkers?: number
  iconMap?: Record<string, React.ReactNode | string>
  showOutsideDays?: boolean
  className?: string
}

function resolveMarker(item: CalendarItem, iconMap?: CalendarProps['iconMap']) {
  if (item.iconNode) return item.iconNode
  if (item.iconSrc) return <img src={item.iconSrc} alt="" />

  const mapped = item.iconKey ? iconMap?.[item.iconKey] : null
  return typeof mapped === 'string' ? <img src={mapped} alt="" /> : mapped ?? null
}

function Calendar({
  value,
  defaultValue,
  onMonthChange,
  items = [],
  maxVisibleMarkers = 3,
  iconMap,
  showOutsideDays = true,
  className,
}: CalendarProps) {
  const [innerMonth, setInnerMonth] = useState(getMonthStartTimestamp(defaultValue ?? Date.now()))
  const [hoveredDay, setHoveredDay] = useState<number | null>(null)
  const currentMonth = value ?? innerMonth
  const cells = buildCalendarCells(currentMonth)
  const grouped = items.reduce<Record<number, CalendarItem[]>>((acc, item) => {
    const key = normalizeToDayTimestamp(item.date)
    acc[key] ??= []
    acc[key].push(item)
    return acc
  }, {})

  function changeMonth(offset: number) {
    const next = addMonths(currentMonth, offset)
    if (value == null) setInnerMonth(next)
    onMonthChange?.(next)
  }

  const tooltipItems = hoveredDay == null ? [] : grouped[hoveredDay] ?? []

  return (
    <div className={className}>
      <div className={styles['calendar__toolbar']}>
        <StarNineSliceButton size="small" onClick={() => changeMonth(-1)}>
          上月
        </StarNineSliceButton>
        <h3>{new Date(currentMonth).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}</h3>
        <StarNineSliceButton size="small" onClick={() => changeMonth(1)}>
          下月
        </StarNineSliceButton>
      </div>

      <div className={styles['calendar__shell']}>
        <CalendarGrid
          cells={cells}
          monthLabel="calendar"
          showOutsideDays={showOutsideDays}
          renderCellContent={(cell) => {
            const dayItems = grouped[cell.dateTimestamp] ?? []
            const visible = dayItems.slice(0, maxVisibleMarkers)
            const remaining = dayItems.length - visible.length

            return (
              <div
                className={styles['calendar__markers']}
                onPointerEnter={() => setHoveredDay(cell.dateTimestamp)}
                onPointerLeave={() => setHoveredDay((current) => (current === cell.dateTimestamp ? null : current))}
              >
                {visible.map((item, index) => (
                  <span key={`${item.title}-${index}`} className={styles['calendar__marker']}>
                    {resolveMarker(item, iconMap)}
                  </span>
                ))}
                {remaining > 0 ? <span className={styles['calendar__more']}>+{remaining}</span> : null}
              </div>
            )
          }}
        />

        {tooltipItems.length > 0 ? (
          <aside className={styles['calendar__tooltip']}>
            {tooltipItems.map((item, index) => (
              <div key={`${item.title}-${index}`} className={styles['calendar__tooltip-item']}>
                <strong>{item.title}</strong>
                {item.description ? <p>{item.description}</p> : null}
              </div>
            ))}
          </aside>
        ) : null}
      </div>
    </div>
  )
}

export default Calendar
```

- [ ] **Step 4: Add minimal calendar styles and export surface, then rerun**

```scss
.calendar__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.calendar__shell {
  display: grid;
  gap: 1rem;
}

.calendar__markers {
  position: absolute;
  inset: 1.8rem 0.4rem 0.4rem 0.4rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  align-content: flex-start;
}

.calendar__marker {
  width: 1.5rem;
  height: 1.5rem;
}

.calendar__more {
  font-size: 0.75rem;
  font-weight: 700;
}

.calendar__tooltip {
  border: 2px solid #2e2116;
  background: #fff7dd;
  padding: 0.75rem 1rem;
}
```

```ts
export { default as StarCalendar } from './Calendar'
export type { CalendarItem } from './Calendar'
```

Run: `npm run test:run -- src/components/ui/Calendar.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit the calendar component**

```bash
git add src/components/ui/Calendar.tsx src/components/ui/Calendar.module.scss src/components/ui/Calendar.test.tsx src/components/ui/index.ts
git commit -m "feat: add calendar component"
```

## Task 4: Build StarDatePicker with single and range selection

**Files:**
- Create: `src/components/ui/DatePicker.tsx`
- Create: `src/components/ui/DatePicker.module.scss`
- Create: `src/components/ui/DatePicker.test.tsx`

- [ ] **Step 1: Write the failing picker tests**

```ts
import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import DatePicker from './DatePicker'

describe('DatePicker', () => {
  it('returns a normalized timestamp in single mode', () => {
    const handleChange = vi.fn()
    render(<DatePicker mode="single" defaultValue={new Date(2026, 3, 1).getTime()} onChange={handleChange} />)

    fireEvent.click(screen.getByRole('gridcell', { name: '2026-04-18' }))

    expect(handleChange).toHaveBeenCalledWith({ dateTimestamp: new Date(2026, 3, 18).getTime() })
  })

  it('returns a normalized ordered range in range mode', () => {
    const handleChange = vi.fn()
    render(<DatePicker mode="range" defaultValue={{ startTimestamp: null, endTimestamp: null }} onChange={handleChange} />)

    fireEvent.click(screen.getByRole('gridcell', { name: '2026-04-18' }))
    fireEvent.click(screen.getByRole('gridcell', { name: '2026-04-12' }))

    expect(handleChange).toHaveBeenLastCalledWith({
      startTimestamp: new Date(2026, 3, 12).getTime(),
      endTimestamp: new Date(2026, 3, 18).getTime(),
    })
  })

  it('restarts range selection after a completed range', () => {
    const handleChange = vi.fn()
    render(<DatePicker mode="range" onChange={handleChange} />)

    fireEvent.click(screen.getByRole('gridcell', { name: '2026-04-10' }))
    fireEvent.click(screen.getByRole('gridcell', { name: '2026-04-12' }))
    fireEvent.click(screen.getByRole('gridcell', { name: '2026-04-20' }))

    expect(handleChange).toHaveBeenLastCalledWith({
      startTimestamp: new Date(2026, 3, 20).getTime(),
      endTimestamp: null,
    })
  })

  it('blocks disabled dates from selection', () => {
    const handleChange = vi.fn()
    render(
      <DatePicker
        mode="single"
        onChange={handleChange}
        disabledDates={[new Date(2026, 3, 18).getTime()]}
      />
    )

    fireEvent.click(screen.getByRole('gridcell', { name: '2026-04-18' }))

    expect(handleChange).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run the picker test file to verify RED**

Run: `npm run test:run -- src/components/ui/DatePicker.test.tsx`

Expected: FAIL because `DatePicker.tsx` does not exist.

- [ ] **Step 3: Implement the minimal picker logic**

```tsx
import { useState } from 'react'
import CalendarGrid from './CalendarGrid'
import StarNineSliceButton from './NineSliceButton'
import styles from './DatePicker.module.scss'
import {
  addMonths,
  buildCalendarCells,
  getMonthStartTimestamp,
  isDayInRange,
  normalizeToDayTimestamp,
  sortRangeTimestamps,
} from '../../utils/calendar'

type RangeValue = { startTimestamp: number | null; endTimestamp: number | null }

type DatePickerProps = {
  mode?: 'single' | 'range'
  value?: number | RangeValue
  defaultValue?: number | RangeValue
  onChange?: (value: { dateTimestamp: number } | RangeValue) => void
  minDate?: number
  maxDate?: number
  disabledDates?: number[]
  showOutsideDays?: boolean
  className?: string
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
}: DatePickerProps) {
  const initialMonth = mode === 'single' && typeof defaultValue === 'number'
    ? getMonthStartTimestamp(defaultValue)
    : new Date(2026, 3, 1).getTime()

  const [currentMonth, setCurrentMonth] = useState(initialMonth)
  const [singleValue, setSingleValue] = useState<number | null>(typeof defaultValue === 'number' ? defaultValue : null)
  const [rangeValue, setRangeValue] = useState<RangeValue>(
    typeof defaultValue === 'object' && defaultValue != null
      ? defaultValue
      : { startTimestamp: null, endTimestamp: null }
  )

  const resolvedSingle = typeof value === 'number' ? value : singleValue
  const resolvedRange = typeof value === 'object' && value != null ? value : rangeValue
  const cells = buildCalendarCells(currentMonth)
  const disabledSet = new Set(disabledDates.map((item) => normalizeToDayTimestamp(item)))

  function isDisabled(dayTimestamp: number) {
    const normalized = normalizeToDayTimestamp(dayTimestamp)
    if (minDate != null && normalized < normalizeToDayTimestamp(minDate)) return true
    if (maxDate != null && normalized > normalizeToDayTimestamp(maxDate)) return true
    return disabledSet.has(normalized)
  }

  function selectDay(dayTimestamp: number) {
    if (isDisabled(dayTimestamp)) return

    const normalized = normalizeToDayTimestamp(dayTimestamp)

    if (mode === 'single') {
      if (value == null) setSingleValue(normalized)
      onChange?.({ dateTimestamp: normalized })
      return
    }

    const { startTimestamp, endTimestamp } = resolvedRange

    if (startTimestamp == null || (startTimestamp != null && endTimestamp != null)) {
      const next = { startTimestamp: normalized, endTimestamp: null }
      if (typeof value !== 'object' || value == null) setRangeValue(next)
      onChange?.(next)
      return
    }

    const next = sortRangeTimestamps(startTimestamp, normalized)
    if (typeof value !== 'object' || value == null) setRangeValue(next)
    onChange?.(next)
  }

  return (
    <div className={className}>
      <div className={styles['date-picker__toolbar']}>
        <StarNineSliceButton size="small" onClick={() => setCurrentMonth((prev) => addMonths(prev, -1))}>
          上月
        </StarNineSliceButton>
        <div>{new Date(currentMonth).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}</div>
        <StarNineSliceButton size="small" onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}>
          下月
        </StarNineSliceButton>
      </div>

      <CalendarGrid
        cells={cells}
        monthLabel="date-picker"
        showOutsideDays={showOutsideDays}
        onSelectDay={selectDay}
        isDisabled={isDisabled}
        getCellStateClassName={(cell) => {
          if (mode === 'single' && resolvedSingle != null && normalizeToDayTimestamp(cell.dateTimestamp) === normalizeToDayTimestamp(resolvedSingle)) {
            return styles['date-picker__cell--selected']
          }

          if (mode === 'range') {
            const day = normalizeToDayTimestamp(cell.dateTimestamp)
            if (resolvedRange.startTimestamp === day) return styles['date-picker__cell--range-start']
            if (resolvedRange.endTimestamp === day) return styles['date-picker__cell--range-end']
            if (isDayInRange(day, resolvedRange.startTimestamp, resolvedRange.endTimestamp)) {
              return styles['date-picker__cell--in-range']
            }
          }

          return undefined
        }}
      />
    </div>
  )
}

export default DatePicker
```

- [ ] **Step 4: Add minimal picker styles and rerun**

```scss
.date-picker__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.date-picker__cell--selected,
.date-picker__cell--range-start,
.date-picker__cell--range-end {
  box-shadow: inset 0 0 0 999px rgba(213, 143, 42, 0.28);
}

.date-picker__cell--in-range {
  box-shadow: inset 0 0 0 999px rgba(213, 143, 42, 0.14);
}
```

Run: `npm run test:run -- src/components/ui/DatePicker.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit the picker component**

```bash
git add src/components/ui/DatePicker.tsx src/components/ui/DatePicker.module.scss src/components/ui/DatePicker.test.tsx
git commit -m "feat: add date picker component"
```

## Task 5: Wire exports, demos, and routes

**Files:**
- Create: `src/pages/CalendarDemo.tsx`
- Create: `src/pages/DatePickerDemo.tsx`
- Modify: `src/pages/index.ts`
- Modify: `src/router/index.tsx`
- Modify: `src/pages/Components.tsx`
- Modify: `src/components/ui/index.ts`

- [ ] **Step 1: Write the failing demo route smoke test**

```ts
import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { router as appRouter } from '../router'

describe('calendar routes', () => {
  it('renders the calendar demo entry route', async () => {
    const routes = appRouter.routes
    const memoryRouter = createMemoryRouter(routes, { initialEntries: ['/components/calendar'] })

    render(<RouterProvider router={memoryRouter} />)

    expect(await screen.findByText('Calendar 日历')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run the route smoke test to verify RED**

Run: `npm run test:run -- src/pages/CalendarDemo.test.tsx`

Expected: FAIL because the page and route do not exist.

- [ ] **Step 3: Implement both demo pages and connect them**

```tsx
import { Bell, Flag, Gift } from 'lucide-react'
import StarApiTable from '../components/layout/ApiTable'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarCalendar } from '../components/ui'

const items = [
  { date: new Date(2026, 3, 4).getTime(), title: '村民生日', description: '上午 9 点开始', iconKey: 'gift' },
  { date: new Date(2026, 3, 13).getTime(), title: '节日提醒', description: '广场集合', iconKey: 'flag' },
  { date: new Date(2026, 3, 15).getTime(), title: '信件通知', description: '邮箱中查看', iconNode: <Bell size={16} /> },
]

const iconMap = {
  gift: <Gift size={16} />,
  flag: <Flag size={16} />,
}

function CalendarDemo() {
  return (
    <StarComponentPage title="Calendar 日历" description="像素风公历日历组件，支持日期数据和标识渲染。">
      <StarComponentDemo id="basic" title="基础日历" description="基础月份展示。">
        <StarCalendar defaultValue={new Date(2026, 3, 1).getTime()} />
      </StarComponentDemo>
      <StarComponentDemo id="events" title="带数据的日历" description="支持图标标识和悬浮信息。">
        <StarCalendar defaultValue={new Date(2026, 3, 1).getTime()} items={items} iconMap={iconMap} />
      </StarComponentDemo>
      <StarApiTable data={[{ property: 'items', description: '日期数据', type: 'CalendarItem[]', default: '[]' }]} />
    </StarComponentPage>
  )
}

export default CalendarDemo
```

```tsx
import { useState } from 'react'
import StarComponentDemo from '../components/layout/ComponentDemo'
import StarComponentPage from '../components/layout/ComponentPage'
import { StarDatePicker } from '../components/ui'

function DatePickerDemo() {
  const [singleValue, setSingleValue] = useState<string>('')
  const [rangeValue, setRangeValue] = useState<string>('')

  return (
    <StarComponentPage title="DatePicker 日期选择器" description="支持单日和区间选择，结果返回时间戳。">
      <StarComponentDemo id="single" title="单日选择" description="点击任意一天返回毫秒时间戳。">
        <StarDatePicker
          mode="single"
          onChange={(value) => 'dateTimestamp' in value && setSingleValue(String(value.dateTimestamp))}
        />
        <p>{singleValue}</p>
      </StarComponentDemo>
      <StarComponentDemo id="range" title="区间选择" description="两次点击形成区间。">
        <StarDatePicker
          mode="range"
          onChange={(value) =>
            'startTimestamp' in value && setRangeValue(`${value.startTimestamp ?? 'null'} - ${value.endTimestamp ?? 'null'}`)
          }
        />
        <p>{rangeValue}</p>
      </StarComponentDemo>
    </StarComponentPage>
  )
}

export default DatePickerDemo
```

```ts
export { default as CalendarDemo } from './CalendarDemo'
export { default as DatePickerDemo } from './DatePickerDemo'
```

```ts
import StarCalendarDemoPage from '../pages/CalendarDemo'
import StarDatePickerDemoPage from '../pages/DatePickerDemo'

{ path: 'components/calendar', element: <StarCalendarDemoPage /> },
{ path: 'components/date-picker', element: <StarDatePickerDemoPage /> },
```

```ts
{
  path: '/components/calendar',
  title: 'Calendar 日历',
  description: '月视图展示、月份跳转、日期标识和悬浮详情。',
  icon: <Square size={20} />,
},
{
  path: '/components/date-picker',
  title: 'DatePicker 日期选择器',
  description: '支持单日和区间选择，并返回时间戳。',
  icon: <Square size={20} />,
},
```

```ts
export { default as StarDatePicker } from './DatePicker'
```

- [ ] **Step 4: Run targeted tests and build to verify integration**

Run: `npm run test:run -- src/utils/calendar.test.ts src/components/ui/CalendarGrid.test.tsx src/components/ui/Calendar.test.tsx src/components/ui/DatePicker.test.tsx`

Expected: PASS.

Run: `npm run build`

Expected: PASS with no TypeScript errors.

- [ ] **Step 5: Commit demos and route wiring**

```bash
git add src/pages/CalendarDemo.tsx src/pages/DatePickerDemo.tsx src/pages/index.ts src/router/index.tsx src/pages/Components.tsx src/components/ui/index.ts
git commit -m "feat: add calendar demo pages"
```

## Task 6: Visual refinement and final verification

**Files:**
- Modify: `src/components/ui/CalendarGrid.module.scss`
- Modify: `src/components/ui/Calendar.module.scss`
- Modify: `src/components/ui/DatePicker.module.scss`
- Modify: `src/pages/CalendarDemo.tsx`
- Modify: `src/pages/DatePickerDemo.tsx`

- [ ] **Step 1: Compare demo output against the approved design requirements**

Checklist:

```md
- Monday-first weekday labels
- Pixel-style beige panel and deep border
- Calendar markers visible inside date cells
- Tooltip readable and anchored near the grid
- Single-day selection clearly highlighted
- Range start/end and in-range states visually distinct
- Returned timestamps visible in the demo page
```

- [ ] **Step 2: Refine the SCSS and demo copy**

```scss
.calendar-grid__cell {
  aspect-ratio: 1 / 1;
  background: linear-gradient(180deg, #f8efd1 0%, #f2e2b7 100%);
  image-rendering: pixelated;
}

.calendar__tooltip {
  max-width: 18rem;
  box-shadow: 4px 4px 0 rgba(46, 33, 22, 0.24);
}

.date-picker__cell--range-start,
.date-picker__cell--range-end {
  box-shadow: inset 0 0 0 999px rgba(126, 76, 18, 0.34);
}
```

- [ ] **Step 3: Run final verification**

Run: `npm run test:run`

Expected: PASS.

Run: `npm run build`

Expected: PASS.

- [ ] **Step 4: Commit the polished version**

```bash
git add src/components/ui/CalendarGrid.module.scss src/components/ui/Calendar.module.scss src/components/ui/DatePicker.module.scss src/pages/CalendarDemo.tsx src/pages/DatePickerDemo.tsx
git commit -m "style: polish calendar components"
```

## Self-Review

### Spec coverage

- Shared grid, calendar, picker, date utils: covered by Tasks 1-4
- Single day and range timestamp output: covered by Task 4
- Icon key and direct icon support: covered by Task 3
- Demo pages and route integration: covered by Task 5
- Pixel-style refinement and final validation: covered by Task 6

### Placeholder scan

- No `TODO`, `TBD`, or “similar to task” references remain
- Each task contains exact files, commands, and code snippets

### Type consistency

- Shared day timestamp representation is always normalized local midnight milliseconds
- `CalendarItem`, `CalendarCell`, and picker range shape stay consistent across tasks

