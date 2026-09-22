/// <reference types="node" />
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { BACK_TO_TOP_FLIGHT_MS } from './BackToTop'

const scss = readFileSync(resolve(process.cwd(), 'src/components/ui/BackToTop.module.scss'), 'utf8')

describe('back to top flight styles', () => {
  it('flies for exactly as long as the component thinks it does', () => {
    // The two are one value in two languages: the stylesheet plays the animation,
    // the component schedules the hand-off at the end of it.
    expect(scss).toContain(`$flight-duration: ${BACK_TO_TOP_FLIGHT_MS}ms`)
    expect(scss).toMatch(/animation:\s*star-back-to-top-flight\s*\$flight-duration\s*\$flight-ease\s*forwards/)
  })

  it('climbs upwards and fades out in the same breath', () => {
    const keyframes = /@keyframes star-back-to-top-flight\s*\{[\s\S]*?\n\}/.exec(scss)?.[0] ?? ''

    expect(keyframes).toContain('opacity: 0')
    // A negative Y is up. The distance is a variable, sitting next to the duration
    // at the top of the file so the two are tuned together.
    expect(keyframes).toContain('translateY(-$flight-rise)')
  })

  it('fades on a monotonic curve, so the plane cannot fade back in mid-flight', () => {
    const ease = /^\$flight-ease:\s*(.+);$/m.exec(scss)?.[1] ?? ''
    const points = (ease.match(/-?\d*\.?\d+/g) ?? []).map(Number)

    expect(ease).toMatch(/^cubic-bezier\(/)
    expect(points).toHaveLength(4)
    // Every control point inside `0..1` keeps the curve moving forwards only. A
    // negative `y1` / `y2` — the shape behind the old Rating fade, where the
    // opacity dropped to 0 and sprang back to 1 — is the one thing to rule out.
    for (const point of points) {
      expect(point).toBeGreaterThanOrEqual(0)
      expect(point).toBeLessThanOrEqual(1)
    }
  })

  it('switches the flight off for reduced motion, leaving the hidden style in charge', () => {
    expect(scss).toMatch(
      /@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?&\[data-motion='flying'\]\s*\{\s*animation:\s*none;/
    )
  })
})
