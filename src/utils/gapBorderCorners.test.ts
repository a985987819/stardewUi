import { describe, expect, it } from 'vitest'
import { createGapBorderCorners, type CreateGapBorderCornersOptions } from './gapBorderCorners'

/**
 * The `StarGapBorder` components are gone; this generator is the surviving
 * reference for the house-style "gap border" corner, so pin its contract down.
 *
 * With `level`, `thickness` and `cornerGap`:
 *   stepCount       = level * 2 - 1        steps per corner
 *   horizontalInset = cornerGap + stepCount * thickness
 * and the four sides stop `horizontalInset` short of each corner, leaving a
 * staircase of `stepCount` squares to fill the gap.
 */

/** `cssVariables` is typed as `CSSProperties`, so read the custom props off a loose copy. */
const vars = (options?: CreateGapBorderCornersOptions) =>
  createGapBorderCorners(options).cssVariables as Record<string, string>

describe('createGapBorderCorners', () => {
  it('defaults to one step per corner with the documented insets', () => {
    const { cornerSteps } = createGapBorderCorners()

    expect(cornerSteps).toHaveLength(4)
    expect(vars()['--gap-border-thickness']).toBe('8px')
    // cornerGap (8) + stepCount (1) * thickness (8)
    expect(vars()['--gap-border-horizontal-inset']).toBe('16px')
    expect(vars()['--gap-border-vertical-inset']).toBe('16px')
    expect(vars()['--gap-border-color']).toBe('#5f4322')
    expect(vars()['--gap-border-background']).toBe('#f7efc5')
  })

  it('adds two steps per corner for every extra level', () => {
    expect(createGapBorderCorners({ level: 1 }).cornerSteps).toHaveLength(4 * 1)
    expect(createGapBorderCorners({ level: 2 }).cornerSteps).toHaveLength(4 * 3)
    expect(createGapBorderCorners({ level: 3 }).cornerSteps).toHaveLength(4 * 5)
  })

  it('starts each corner at the gap and walks one step inward per block', () => {
    const { cornerSteps } = createGapBorderCorners({ level: 2, borderThickness: 4, cornerGap: 4 })

    // inset = 4 + 3 * 4 = 16; step 0 sits at 16 - 4 = 12, step 1 at 8, step 2 at 4.
    expect(cornerSteps[0]).toEqual({ key: 'top-left-0', style: { left: 12, top: 4 } })
    expect(cornerSteps[1]).toEqual({ key: 'top-left-1', style: { left: 8, top: 8 } })
    expect(cornerSteps[2]).toEqual({ key: 'top-left-2', style: { left: 4, top: 12 } })
    // Every corner walks the same staircase, anchored to its own sides.
    expect(cornerSteps[3]).toEqual({ key: 'top-right-0', style: { right: 12, top: 4 } })
    expect(cornerSteps[6]).toEqual({ key: 'bottom-right-0', style: { right: 12, bottom: 4 } })
    expect(cornerSteps[9]).toEqual({ key: 'bottom-left-0', style: { left: 12, bottom: 4 } })
  })

  it('scales the inset with the level so the sides always clear the staircase', () => {
    // cornerGap 8 + stepCount * thickness 8 → level 2 gives 3 steps, level 3 gives 5.
    expect(vars({ level: 2 })['--gap-border-horizontal-inset']).toBe('32px')
    expect(vars({ level: 3 })['--gap-border-horizontal-inset']).toBe('48px')
  })

  it('falls back to a plain cut corner when there is no staircase', () => {
    const { cornerSteps, surfaceClipPath } = createGapBorderCorners({ level: 0, cornerGap: 8 })

    expect(cornerSteps).toHaveLength(0)
    expect(surfaceClipPath).toBe(
      'polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px)'
    )
  })

  it('clips the surface with a staircase that matches the corner blocks', () => {
    const { surfaceClipPath } = createGapBorderCorners({ level: 1 })

    expect(surfaceClipPath.startsWith('polygon(')).toBe(true)
    // 2 points on the top edge, 3 more where the remaining sides start, and
    // 2 per staircase block around all four corners.
    expect(surfaceClipPath.split(',').length).toBe(5 + 8 * 1)
  })
})
