import { describe, expect, it } from 'vitest'
import { DEFAULT_BUTTON_CORNER_STEPS, getDefaultButtonFrameMetrics } from './defaultButtonCanvas'

const CASES = [
  [120, 44, 1],
  [240, 88, 2],
  [48, 24, 1],
  [300, 120, 3],
  [1600, 400, 1],
] as const

describe('defaultButtonCanvas', () => {
  it('keeps the requested border and gap metrics at 1x scale', () => {
    const metrics = getDefaultButtonFrameMetrics(120, 44, 1)

    expect(metrics.outerBorderWidth).toBe(2)
    expect(metrics.innerBorderWidth).toBe(2)
    expect(metrics.innerBorderGap).toBe(0.5)
    expect(metrics.cornerSteps).toBe(DEFAULT_BUTTON_CORNER_STEPS)
    expect(metrics.cornerSteps).toBe(1)
    expect(metrics.cornerSpan).toBe(metrics.cornerStep * DEFAULT_BUTTON_CORNER_STEPS)
  })

  it('scales frame metrics with device pixel ratio', () => {
    const metrics = getDefaultButtonFrameMetrics(240, 88, 2)

    expect(metrics.outerBorderWidth).toBe(4)
    expect(metrics.innerBorderWidth).toBe(4)
    expect(metrics.innerBorderGap).toBe(1)
    expect(metrics.innerShadowOffsetY).toBeGreaterThanOrEqual(1)
  })

  it('keeps every corner riser on a whole device pixel', () => {
    for (const [width, height, dpr] of CASES) {
      expect(Number.isInteger(getDefaultButtonFrameMetrics(width, height, dpr).cornerStep)).toBe(true)
    }
  })

  it('clamps the corner staircase so opposite corners never overlap', () => {
    for (const [width, height, dpr] of CASES) {
      const metrics = getDefaultButtonFrameMetrics(width, height, dpr)

      expect(metrics.cornerStep).toBeGreaterThanOrEqual(1)
      expect(metrics.cornerSpan * 2).toBeLessThan(Math.min(width, height))
    }
  })

  it('caps the corner riser so large buttons keep a fine staircase', () => {
    expect(getDefaultButtonFrameMetrics(1600, 400, 1).cornerStep).toBeLessThanOrEqual(6)
  })
})
