import { describe, expect, it } from 'vitest'
import {
  GAP_CORNER_LEVEL,
  buildGapFrameInnerRects,
  buildGapFrameRects,
  buildStairCornerPoints,
  buildSteppedRectPoints,
  createGapFillClipPath,
  createGapFrameClipPath,
  createInsetRectClipPath,
  createSteppedRectClipPath,
  mapStairToCorner,
} from './pixelCorners'

describe('pixelCorners', () => {
  it('uses the gap-border corner level 1 as the house style', () => {
    expect(GAP_CORNER_LEVEL).toBe(1)
  })

  it('builds four shortened edges and four corner blocks for thickness 6', () => {
    const rects = buildGapFrameRects(200, 150, 6)

    expect(rects).toEqual([
      { x: 6, y: 0, width: 188, height: 6 }, // top edge, t short at both ends
      { x: 6, y: 144, width: 188, height: 6 }, // bottom edge
      { x: 0, y: 6, width: 6, height: 138 }, // left edge
      { x: 194, y: 6, width: 6, height: 138 }, // right edge
      { x: 0, y: 0, width: 12, height: 12 }, // 2t x 2t corner blocks closing the ring
      { x: 188, y: 0, width: 12, height: 12 },
      { x: 0, y: 138, width: 12, height: 12 },
      { x: 188, y: 138, width: 12, height: 12 },
    ])
  })

  it('keeps the ring continuous — every edge reaches its corner blocks', () => {
    const rects = buildGapFrameRects(200, 150, 6)
    const [top, bottom, left, right, tl, tr, bl, br] = rects

    // Each edge starts exactly one thickness in, so the 2t blocks overlap it.
    expect(top.x).toBe(6)
    expect(tl.x + tl.width).toBeGreaterThanOrEqual(top.x)
    expect(tr.x).toBeLessThanOrEqual(top.x + top.width)
    expect(left.y).toBe(6)
    expect(tl.y + tl.height).toBeGreaterThanOrEqual(left.y)
    expect(bl.y).toBeLessThanOrEqual(left.y + left.height)
    expect(bottom.y + bottom.height).toBe(150)
    expect(right.x + right.width).toBe(200)
    expect(br.x + br.width).toBe(200)
    expect(br.y + br.height).toBe(150)

    // The very corner pixel is border, not page: it belongs to the block.
    const cornerInsideBlock = (block: typeof tl) =>
      block.x === 0 && block.y === 0 && block.width >= 6 && block.height >= 6
    expect(cornerInsideBlock(tl)).toBe(true)
  })

  it('lights the inner half of each edge and the inward quarter of each block', () => {
    const inner = buildGapFrameInnerRects(200, 150, 6)

    expect(inner[0]).toEqual({ x: 6, y: 3, width: 188, height: 3 }) // top edge lower half
    expect(inner[2]).toEqual({ x: 3, y: 6, width: 3, height: 138 }) // left edge right half
    expect(inner[4]).toEqual({ x: 9, y: 9, width: 3, height: 3 }) // top-left block, inward quarter
  })

  it('clamps degenerate sizes instead of emitting negative rects', () => {
    for (const rect of buildGapFrameRects(8, 8, 4)) {
      expect(rect.width).toBeGreaterThanOrEqual(0)
      expect(rect.height).toBeGreaterThanOrEqual(0)
      expect(rect.x).toBeGreaterThanOrEqual(0)
      expect(rect.y).toBeGreaterThanOrEqual(0)
    }
  })

  it('describes each corner as a single square step', () => {
    expect(buildStairCornerPoints(1, 4)).toEqual([
      { x: 0, y: 4 },
      { x: 4, y: 4 },
      { x: 4, y: 0 },
    ])

    const stair = buildStairCornerPoints(2, 6)

    // Two levels, each one full block: the step is 2t wide and 2t tall.
    expect(stair).toEqual([
      { x: 0, y: 12 },
      { x: 6, y: 12 },
      { x: 6, y: 6 },
      { x: 12, y: 6 },
      { x: 12, y: 0 },
    ])
  })

  it('mirrors the stair around the rectangle so opposite corners stay clockwise', () => {
    const stair = buildStairCornerPoints(1, 1)

    expect(mapStairToCorner(stair, 'top-left', 10, 10)).toEqual(stair)
    expect(mapStairToCorner(stair, 'top-right', 10, 10)).toEqual([
      { x: 9, y: 0 },
      { x: 9, y: 1 },
      { x: 10, y: 1 },
    ])
    expect(mapStairToCorner(stair, 'bottom-right', 10, 10)).toEqual([
      { x: 10, y: 9 },
      { x: 9, y: 9 },
      { x: 9, y: 10 },
    ])
    expect(mapStairToCorner(stair, 'bottom-left', 10, 10)).toEqual([
      { x: 1, y: 10 },
      { x: 1, y: 9 },
      { x: 0, y: 9 },
    ])
  })

  it('builds a closed polygon for the four stepped corners', () => {
    const points = buildSteppedRectPoints(40, 40, 1, 6)

    expect(points).toHaveLength(12)
    expect(points[0]).toEqual({ x: 0, y: 6 })
    expect(points[2]).toEqual({ x: 6, y: 0 })

    for (const { x, y } of points) {
      expect(x).toBeGreaterThanOrEqual(0)
      expect(y).toBeGreaterThanOrEqual(0)
      expect(x).toBeLessThanOrEqual(40)
      expect(y).toBeLessThanOrEqual(40)
    }
  })

  it('emits the same corner as a CSS clip-path, using calc() for the far edges', () => {
    expect(createSteppedRectClipPath(1, 1)).toBe(
      'polygon(0 1px, 1px 1px, 1px 0, calc(100% - 1px) 0, calc(100% - 1px) 1px, 100% 1px, ' +
        '100% calc(100% - 1px), calc(100% - 1px) calc(100% - 1px), calc(100% - 1px) 100%, ' +
        '1px 100%, 1px calc(100% - 1px), 0 calc(100% - 1px))'
    )
  })

  it('clips the fill to a plain rectangle inset by the thickness', () => {
    const fill = createGapFillClipPath(6)

    expect(fill).toBe(
      'polygon(6px 6px, calc(100% - 6px) 6px, calc(100% - 6px) calc(100% - 6px), 6px calc(100% - 6px))'
    )

    // Frame clip and fill clip coincide: the ring paints over the boundary, and
    // the corner blocks close it, so nothing is carved away any more.
    expect(createGapFrameClipPath(6)).toBe(fill)
  })

  it('builds an inset rectangle clip with per-side offsets', () => {
    expect(createInsetRectClipPath({ top: 10, right: 20, bottom: 30, left: 40 })).toBe(
      'polygon(40px 10px, calc(100% - 20px) 10px, calc(100% - 20px) calc(100% - 30px), 40px calc(100% - 30px))'
    )
    expect(createInsetRectClipPath()).toBe('polygon(0 0, 100% 0, 100% 100%, 0 100%)')
  })
})
