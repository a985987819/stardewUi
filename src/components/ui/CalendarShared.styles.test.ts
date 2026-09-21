/// <reference types="node" />
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const read = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8')

const common = read('src/components/ui/CalendarCommon.module.scss')
const calendar = read('src/components/ui/Calendar.module.scss')
const datePicker = read('src/components/ui/DatePicker.module.scss')
const grid = read('src/components/ui/CalendarGrid.module.scss')

describe('calendar + date picker shared styles', () => {
  it('owns the sizing tokens in one place', () => {
    // Both components read their geometry from CalendarCommon, so "same size"
    // is structural rather than two stylesheets kept in sync by hand.
    expect(common).toContain('$calendar-width')
    expect(common).toContain('$cell-height')
    expect(common).toContain('$day-font-size')
    expect(common).toContain('$marker-size')
    expect(common).toContain('@mixin calendar-container')
    expect(common).toContain('@mixin calendar-day-number')
    expect(common).toContain('@mixin calendar-marker-row')
  })

  it('makes both components take the container from the shared mixin', () => {
    for (const scss of [calendar, datePicker]) {
      expect(scss).toContain('@use "./CalendarCommon.module.scss" as common')
      expect(scss).toContain('common.calendar-container')
    }
  })

  it('pins the shared width so a flex/grid parent cannot shrink one of them', () => {
    // `max-width` alone lets a flex item shrink to its content, which is how the
    // calendar ended up at ~265px while the date picker was ~630px.
    expect(common.match(/width:\s*100%/)).not.toBeNull()
    expect(common).toMatch(/max-width:\s*\$calendar-width/)
  })

  it('sizes the grid cells from the shared tokens instead of fractions of themselves', () => {
    expect(grid).toContain('common.$cell-height')
    expect(grid).toContain('@include common.calendar-day-number')
    expect(grid).toContain('@include common.calendar-marker-row')

    // The old `calc(100% / 9)` day box let a 1.4rem number fill the whole cell,
    // leaving the status markers nowhere to go.
    expect(grid).not.toContain('calc(100% / 9')
  })

  it('keeps the grid from overflowing its container', () => {
    expect(grid).toContain('repeat(7, minmax(0, 1fr))')
  })
})
