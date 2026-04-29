import { describe, expect, it } from 'vitest'
import { getDefaultButtonFrameMetrics } from './defaultButtonCanvas'

describe('defaultButtonCanvas', () => {
  it('keeps the requested border and gap metrics at 1x scale', () => {
    const metrics = getDefaultButtonFrameMetrics(120, 44, 1)

    expect(metrics.outerBorderWidth).toBe(2)
    expect(metrics.innerBorderWidth).toBe(2)
    expect(metrics.innerBorderGap).toBe(0.5)
    expect(metrics.cornerRadius).toBeGreaterThan(0)
    expect(metrics.cornerRadius).toBeLessThanOrEqual(10)
  })

  it('scales frame metrics with device pixel ratio', () => {
    const metrics = getDefaultButtonFrameMetrics(240, 88, 2)

    expect(metrics.outerBorderWidth).toBe(4)
    expect(metrics.innerBorderWidth).toBe(4)
    expect(metrics.innerBorderGap).toBe(1)
    expect(metrics.innerShadowOffsetY).toBeGreaterThanOrEqual(1)
  })

  it('clamps the corner radius to avoid distortion on compact buttons', () => {
    const metrics = getDefaultButtonFrameMetrics(48, 24, 1)

    expect(metrics.cornerRadius).toBeLessThanOrEqual(12)
    expect(metrics.cornerRadius).toBeGreaterThan(0)
  })
})
