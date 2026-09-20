import {
  GAP_CORNER_LEVEL,
  buildGapFrameInnerRects,
  buildGapFrameRects,
  buildSteppedRectPoints,
  type PixelPoint,
  type PixelRect,
} from './pixelCorners'
import type { createDefaultButtonPalette } from './defaultButtonTheme'

type DefaultButtonPalette = ReturnType<typeof createDefaultButtonPalette>

export type DefaultButtonFrameMetrics = {
  /** Corner level of the gap border. Always `1`: one break + one block per corner. */
  cornerLevel: number
  /** Border thickness, in device pixels. Doubles as the corner gap and block size. */
  frameWidth: number
  /** How far each edge stops short of a corner: `frameWidth` (one `t` per end). */
  edgeInset: number
  outerBorderWidth: number
  innerBorderWidth: number
  innerShadowOffsetY: number
}

/**
 * Gap-border thickness for the drawn button, in CSS pixels — the same house
 * style as the `cornerLevel = 1` gap border (see `pixelCorners`).
 *
 * It is also the corner gap and the size of the block that bridges it, so the
 * drawn frame matches the card's 6px frame proportionally while staying slim
 * enough for a 34px tall button.
 */
export const DEFAULT_BUTTON_FRAME_WIDTH = 4

const tracePolygon = (ctx: CanvasRenderingContext2D, points: PixelPoint[]) => {
  if (!points.length) {
    return
  }

  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)

  for (let index = 1; index < points.length; index += 1) {
    ctx.lineTo(points[index].x, points[index].y)
  }

  ctx.closePath()
}

const fillRect = (ctx: CanvasRenderingContext2D, rect: PixelRect, color: string) => {
  if (rect.width <= 0 || rect.height <= 0) {
    return
  }

  ctx.fillStyle = color
  ctx.fillRect(rect.x, rect.y, rect.width, rect.height)
}

export const getDefaultButtonFrameMetrics = (width: number, height: number, dpr: number): DefaultButtonFrameMetrics => {
  const minSide = Math.max(1, Math.min(width, height))
  const scaledDpr = Math.max(1, dpr)

  // Whole device pixels keep the blocks crisp. The clamp keeps the four edges
  // from overlapping each other on very small buttons: every edge loses
  // `2 * frameWidth` at both ends, and opposite edges must not meet.
  const frameWidth = Math.max(
    1,
    Math.min(Math.round(DEFAULT_BUTTON_FRAME_WIDTH * scaledDpr), Math.floor(minSide / 6))
  )

  return {
    cornerLevel: GAP_CORNER_LEVEL,
    frameWidth,
    edgeInset: frameWidth,
    // The frame is a single thickness of `frameWidth`, split into an outer band
    // of `frameWidth / 2` … which is exactly the outer/inner pair below.
    outerBorderWidth: frameWidth / 2,
    innerBorderWidth: frameWidth / 2,
    innerShadowOffsetY: Math.max(1, Math.round(1.5 * scaledDpr)),
  }
}

/**
 * Draws the button in the house gap-border style.
 *
 * Shape, with `t = frameWidth`:
 *  - four edges of thickness `t`, each stopping `t` short of every corner
 *  - one `2t x 2t` block per corner that closes the ring — the border is
 *    continuous, so no corner ever shows the page through
 *  - the fill runs edge to edge underneath; its visible boundary keeps a
 *    single `t` step where it meets each block
 *
 * The fill is painted first and the frame covers its outer band, so no clip is
 * needed — nothing inside the ring is ever left transparent.
 */
export const drawDefaultButtonBackground = (
  ctx: CanvasRenderingContext2D,
  {
    width,
    height,
    palette,
    dpr,
  }: {
    width: number
    height: number
    palette: DefaultButtonPalette
    dpr: number
  }
) => {
  const metrics = getDefaultButtonFrameMetrics(width, height, dpr)
  const t = metrics.frameWidth
  const hairline = Math.max(1, Math.round(dpr))

  ctx.clearRect(0, 0, width, height)
  ctx.imageSmoothingEnabled = false

  ctx.save()
  // Clip to the frame-fill shape (two steps of `t`): keeps the edges and the
  // corner blocks, leaves the `2t x 2t` corner break empty.
  tracePolygon(ctx, buildSteppedRectPoints(width, height, 2, t))
  ctx.clip()

  // Fill spans the whole box; the frame painted below covers all but its centre.
  fillRect(ctx, { x: 0, y: 0, width, height }, palette.fill)

  // Frame, dark. Blocks and edges are the only things that reach the corners.
  for (const rect of buildGapFrameRects(width, height, t)) {
    fillRect(ctx, rect, palette.outerBorder)
  }

  // Bevel: the inner half of every edge and the quarter of every block that
  // faces the content, so the frame reads as lit from the upper left.
  for (const rect of buildGapFrameInnerRects(width, height, t)) {
    fillRect(ctx, rect, palette.innerBorder)
  }

  // The fill's visible boundary is one step of `t` inset by `t` — the same
  // stencil the DOM gap border puts an inset box-shadow on.
  const visibleFill = buildSteppedRectPoints(width - t * 2, height - t * 2, 1, t).map(({ x, y }) => ({
    x: x + t,
    y: y + t,
  }))

  ctx.save()
  ctx.translate(0, metrics.innerShadowOffsetY)
  tracePolygon(ctx, visibleFill)
  ctx.strokeStyle = 'rgba(66, 39, 17, 0.28)'
  ctx.lineWidth = hairline
  ctx.stroke()
  ctx.restore()

  // Top highlight hairline, clear of the corner breaks.
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
  ctx.fillRect(t * 2, t + hairline, Math.max(0, width - t * 4), hairline)

  ctx.restore()
}
