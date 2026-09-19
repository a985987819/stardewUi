/// <reference types="node" />
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { DISPLAY_FRAME_CORNER_STEP, DISPLAY_FRAME_CORNER_STEPS } from './DisplayFrame'

const scss = readFileSync(resolve(process.cwd(), 'src/components/ui/DisplayFrame.module.scss'), 'utf8')

/** Reads a `$frame-*: <n>px` token out of the stylesheet. */
const px = (token: string) => {
  const match = scss.match(new RegExp(`\\${token}:\\s*(\\d+)px`))
  if (!match) throw new Error(`${token} is not declared in DisplayFrame.module.scss`)
  return Number(match[1])
}

describe('display frame band geometry', () => {
  it('keeps the four band thicknesses the frame is specified with', () => {
    // 6 / 3 / 3 / 3. These are the product spec, not tuning knobs — the frame is
    // meant to read as a chunky plate, and the outer dark band is deliberately
    // twice the width of everything inside it.
    expect(px('$frame-edge')).toBe(6)
    expect(px('$frame-band')).toBe(3)
    expect(px('$frame-accent')).toBe(3)
    expect(px('$frame-line')).toBe(3)
  })

  it('derives the root padding from the bands instead of hard-coding the total', () => {
    expect(scss).toMatch(/\$frame-inset:\s*\$frame-edge \+ \$frame-band \+ \$frame-accent \+ \$frame-line/)
    expect(scss).toMatch(/padding:\s*\$frame-inset/)
  })

  it('insets each band by the accumulated thickness outside it', () => {
    // Visible bands are 0/6/9/12/15. Writing those as literals instead of sums is
    // exactly how the four bands drift apart from the corner geometry.
    expect(scss).toMatch(/&__edge \{[\s\S]*?inset: 0;/)
    expect(scss).toMatch(/&__band \{[\s\S]*?inset: \$frame-edge;/)
    expect(scss).toMatch(/&__accent \{[\s\S]*?inset: \$frame-edge \+ \$frame-band;/)
    expect(scss).toMatch(/&__line \{[\s\S]*?inset: \$frame-edge \+ \$frame-band \+ \$frame-accent;/)
  })

  it('keeps the corner step no wider than the narrowest band', () => {
    // Walking diagonally into a corner meets the same band widths as walking in
    // from an edge only while `steps * step <= thinnest band`; beyond that the
    // staircase would swallow a whole band at the corner. TS owns the stair,
    // SCSS owns the bands, so the invariant is cross-checked here.
    const thinBand = Math.min(px('$frame-edge'), px('$frame-band'), px('$frame-accent'), px('$frame-line'))

    expect(DISPLAY_FRAME_CORNER_STEPS * DISPLAY_FRAME_CORNER_STEP).toBeLessThanOrEqual(thinBand)
  })
})
