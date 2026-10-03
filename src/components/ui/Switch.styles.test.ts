/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Locks Switch's depth and motion language in the stylesheet.
 *
 * These are the properties that cannot be verified by a DOM test: jsdom never
 * computes `filter` or `clip-path`, so a regression here would pass every
 * behavioural test while the switch quietly flattened into a sticker. Asserted
 * textually for the same reason.
 */

const scss = readFileSync(resolve(process.cwd(), 'src/components/ui/Switch.module.scss'), 'utf8')
const tsx = readFileSync(resolve(process.cwd(), 'src/components/ui/Switch.tsx'), 'utf8')

describe('Switch depth language', () => {
  it('casts one hard offset shadow for the whole track, with no blur', () => {
    // Rating's signature: a stepped drop-shadow down and right. A `blur()` here
    // would read as smooth modern UI rather than pixel UI.
    expect(scss).toMatch(/__track\s*\{[\s\S]*?filter:\s*drop-shadow\(2px 3px 0[^)]*\)/)
    expect(scss).not.toMatch(/drop-shadow\([^)]*blur/)
  })

  it('gives the thumb a second, shorter shadow so it floats above the groove', () => {
    expect(scss).toMatch(/__thumb\s*\{[\s\S]*?filter:\s*drop-shadow\(1px 2px 0[^)]*\)/)
  })

  it('keeps every shadow hard-edged (no blur radius anywhere)', () => {
    const shadows = [...scss.matchAll(/(?:box-shadow|filter):([^;]*);/g)].map((m) => m[1])
    expect(shadows.length).toBeGreaterThan(0)

    for (const shadow of shadows) {
      expect(shadow, `blurred shadow would break the pixel look: ${shadow.trim()}`).not.toMatch(/\d\s*px\s+blur|blur\(/)
    }
  })

  it('lights the top edge and darkens the bottom on both raised faces', () => {
    // The house bevel: lit from above, shadowed below.
    const housing = scss.match(/&__housing\s*\{[\s\S]*?\n {2}\}/)?.[0]
    const thumb = scss.match(/&__thumb\s*\{[\s\S]*?\n {2}\}/)?.[0]

    expect(housing).toMatch(/inset 0 2px 0/)
    expect(housing).toMatch(/inset 0 -2px 0/)
    expect(thumb).toMatch(/inset 0 2px 0/)
    expect(thumb).toMatch(/inset 0 -2px 0/)
  })

  it('sinks the whole panel while pressed so it meets the page', () => {
    expect(scss).toMatch(/&:active:not\(\.star-switch--disabled\) &__thumb\s*\{[\s\S]*?--switch-thumb-lift:\s*1px/)
    expect(scss).toMatch(/&:active:not\(\.star-switch--disabled\) \.star-switch__track\s*\{[\s\S]*?drop-shadow\(1px 1px 0/)
  })
})

describe('Switch motion', () => {
  it('steps the travel at 2px per frame instead of a fixed five jumps', () => {
    // The old timing was `steps(5)` regardless of size, so a large switch moved
    // 5.6px per frame and visibly hopped. The step count is now derived from the
    // geometry so every frame lands on the 2px pixel grid.
    expect(scss).toMatch(/transition:[\s\S]*?transform var\(--star-motion-duration-base\) steps\(var\(--switch-travel-steps\)\)/)
    expect(tsx).toContain("'--switch-travel-steps'")
    expect(tsx).toContain('SWITCH_TRAVEL_STEP_PX')
    expect(tsx).toMatch(/thumbTravel\(trackWidth, thumbSize\)/)
  })

  it('derives the step count from the same travel distance the transform uses', () => {
    // One source for both: if these ever diverge the last frame lands between
    // pixels and the thumb appears to smear on the last frame.
    expect(tsx).toMatch(/const travel = thumbTravel\(trackWidth, thumbSize\)/)
    expect(tsx).toMatch(/'--switch-thumb-translate': `\$\{checked \? travel : 0\}px`/)
    expect(tsx).toMatch(/'--switch-travel-steps': String\(Math\.max\(1, Math\.round\(travel \/ SWITCH_TRAVEL_STEP_PX\)\)\)/)
  })

  it('cross-fades colour on a real curve rather than a 3-step ramp', () => {
    // A stepped colour ramp read as a strobe; colour has no pixel-grid
    // constraint the way geometry does.
    expect(scss).not.toMatch(/background 1\d{2}ms steps/)
    expect(scss).toMatch(/&__slot\s*\{[\s\S]*?transition:[\s\S]*?background var\(--star-motion-duration-base\) var\(--star-motion-ease-standard\)/)
  })

  it('uses the shared motion tokens rather than inline millisecond values', () => {
    const inline = [...scss.matchAll(/transition:\s*([^;]*)/g)]
      .map((m) => m[1])
      .filter((value) => /\d+m?s\b/.test(value) && !value.includes('var(--star-motion'))

    expect(inline, `these transitions bypass the shared tokens: ${inline.join(' | ')}`).toEqual([])
  })

  it('has a reduced-motion fallback for every animated layer', () => {
    const block = scss.match(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*)\}/)?.[1] ?? ''

    for (const selector of ['.star-switch', '__track', '__slot', '__thumb', '__thumb-dot']) {
      expect(block, `no reduced-motion rule for ${selector}`).toContain(selector)
    }
  })
})

describe('Switch geometry stays in sync with the stylesheet', () => {
  it('declares the same three sizes in both places', () => {
    for (const size of ['small', 'medium', 'large'] as const) {
      expect(scss).toMatch(new RegExp(`&--${size}\\s*\\{[\\s\\S]*?--switch-track-width`))
      expect(tsx).toMatch(new RegExp(`${size}:\\s*\\{\\s*trackWidth:`))
    }
  })

  it('keeps the frame width identical in TS and SCSS', () => {
    // `FRAME_WIDTH` in TS feeds the thumb travel; `$switch-frame-width` in SCSS
    // feeds the slot inset. If they drift the thumb overshoots the groove.
    expect(tsx).toMatch(/const FRAME_WIDTH = 3/)
    expect(scss).toMatch(/\$switch-frame-width:\s*3px/)
    expect(tsx).toContain('FRAME_WIDTH + THUMB_GUTTER')
  })
})