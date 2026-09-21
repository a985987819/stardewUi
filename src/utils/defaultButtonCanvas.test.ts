import { describe, expect, it } from 'vitest'
import {
  DEFAULT_BUTTON_FRAME_WIDTH,
  getDefaultButtonFrameMetrics,
} from './defaultButtonCanvas'
import { GAP_CORNER_LEVEL } from './pixelCorners'

const CASES = [
  [120, 44, 1],
  [240, 88, 2],
  [48, 24, 1],
  [300, 120, 3],
  [1600, 400, 1],
] as const

describe('defaultButtonCanvas', () => {
  it('keeps the requested frame metrics at 1x scale', () => {
    const metrics = getDefaultButtonFrameMetrics(120, 44, 1)

    expect(metrics.cornerLevel).toBe(GAP_CORNER_LEVEL)
    expect(metrics.frameWidth).toBe(DEFAULT_BUTTON_FRAME_WIDTH)
    // Every edge stops one thickness short of each corner; the corner block is
    // `2t` and closes the ring, so the border stays continuous.
    expect(metrics.edgeInset).toBe(DEFAULT_BUTTON_FRAME_WIDTH)
    expect(metrics.outerBorderWidth).toBe(DEFAULT_BUTTON_FRAME_WIDTH / 2)
    expect(metrics.innerBorderWidth).toBe(DEFAULT_BUTTON_FRAME_WIDTH / 2)
    expect(metrics.innerShadowOffsetY).toBeGreaterThanOrEqual(1)
  })

  it('scales frame metrics with device pixel ratio', () => {
    const metrics = getDefaultButtonFrameMetrics(240, 88, 2)

    expect(metrics.frameWidth).toBe(8)
    expect(metrics.outerBorderWidth).toBe(4)
    expect(metrics.innerBorderWidth).toBe(4)
    expect(metrics.innerShadowOffsetY).toBeGreaterThanOrEqual(1)
  })

  it('keeps the thickness on a whole device pixel at every size', () => {
    for (const [width, height, dpr] of CASES) {
      expect(Number.isInteger(getDefaultButtonFrameMetrics(width, height, dpr).frameWidth)).toBe(true)
    }
  })

  it('matches the edge shortening to the frame thickness', () => {
    for (const [width, height, dpr] of CASES) {
      const metrics = getDefaultButtonFrameMetrics(width, height, dpr)

      // One number drives the ring: edges stop t short, blocks are 2t.
      expect(metrics.edgeInset).toBe(metrics.frameWidth)
    }
  })

  it('shrinks the frame on very small buttons so opposite edges never meet', () => {
    const metrics = getDefaultButtonFrameMetrics(14, 14, 1)

    expect(metrics.frameWidth).toBeLessThan(DEFAULT_BUTTON_FRAME_WIDTH)
    // Edge inset eats t at both ends of each side; the side must stay positive.
    expect(metrics.frameWidth * 2).toBeLessThan(14)
  })
})
