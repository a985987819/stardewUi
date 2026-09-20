import {
  resolveBubblePlacement,
  type BubbleAlign,
  type BubblePlacement,
  type BubbleSide,
} from './pixelBubbleCanvas'
import {
  buildGapFrameInnerRects,
  buildGapFrameRects,
  type PixelPoint,
  type PixelRect,
} from './pixelCorners'
import { WOOD_PANEL_THEME, type WoodPanelTheme } from './woodPanelTheme'

type Point = PixelPoint
type Rect = { x: number; y: number; width: number; height: number }

export interface DrawWoodPanelOptions {
  width: number
  height: number
  placement?: BubblePlacement
  theme?: WoodPanelTheme
  /** Thickness of the outer frame, in device pixels. */
  borderWidth?: number
  /** Thickness of the inner bevel ring, in device pixels. */
  frameWidth?: number
  arrowWidth?: number
  arrowDepth?: number
}

const tracePolygon = (ctx: CanvasRenderingContext2D, points: Point[]) => {
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

const fillPolygon = (ctx: CanvasRenderingContext2D, points: Point[], color: string) => {
  if (!points.length) {
    return
  }

  tracePolygon(ctx, points)
  ctx.fillStyle = color
  ctx.fill()
}

const fillRect = (ctx: CanvasRenderingContext2D, rect: PixelRect, color: string) => {
  if (rect.width <= 0 || rect.height <= 0) {
    return
  }

  ctx.fillStyle = color
  ctx.fillRect(rect.x, rect.y, rect.width, rect.height)
}

const translate = (points: Point[], dx: number, dy: number): Point[] =>
  points.map(({ x, y }) => ({ x: x + dx, y: y + dy }))

const translateRects = (rects: PixelRect[], dx: number, dy: number): PixelRect[] =>
  rects.map((rect) => ({ ...rect, x: rect.x + dx, y: rect.y + dy }))

const insetPolygon = (points: Point[], inset: number, width: number, height: number): Point[] =>
  points.map(({ x, y }) => ({
    x: Math.min(width, Math.max(0, x < width / 2 ? x + inset : x - inset)),
    y: Math.min(height, Math.max(0, y < height / 2 ? y + inset : y - inset)),
  }))

const getArrowCenter = (rect: Rect, side: BubbleSide, align: BubbleAlign, arrowWidth: number, span: number) => {
  const safeInset = span + arrowWidth / 2 + 2

  if (side === 'top' || side === 'bottom') {
    const min = rect.x + safeInset
    const max = rect.x + rect.width - safeInset

    if (align === 'start') return Math.min(min, max)
    if (align === 'end') return Math.max(min, max)
    return (min + max) / 2
  }

  const min = rect.y + safeInset
  const max = rect.y + rect.height - safeInset

  if (align === 'start') return Math.min(min, max)
  if (align === 'end') return Math.max(min, max)
  return (min + max) / 2
}

/** The five-point triangle that pokes out of one side of the panel. */
const buildArrowPoints = (side: BubbleSide, rect: Rect, center: number, half: number, depth: number): Point[] => {
  const left = rect.x
  const right = rect.x + rect.width
  const top = rect.y
  const bottom = rect.y + rect.height
  const shoulder = half * 0.55

  switch (side) {
    case 'top':
      return [
        { x: center - half, y: top },
        { x: center - shoulder, y: top - depth / 2 },
        { x: center, y: top - depth },
        { x: center + shoulder, y: top - depth / 2 },
        { x: center + half, y: top },
      ]
    case 'bottom':
      return [
        { x: center - half, y: bottom },
        { x: center - shoulder, y: bottom + depth / 2 },
        { x: center, y: bottom + depth },
        { x: center + shoulder, y: bottom + depth / 2 },
        { x: center + half, y: bottom },
      ]
    case 'left':
      return [
        { x: left, y: center - half },
        { x: left - depth / 2, y: center - shoulder },
        { x: left - depth, y: center },
        { x: left - depth / 2, y: center + shoulder },
        { x: left, y: center + half },
      ]
    default:
      return [
        { x: right, y: center - half },
        { x: right + depth / 2, y: center - shoulder },
        { x: right + depth, y: center },
        { x: right + depth / 2, y: center + shoulder },
        { x: right, y: center + half },
      ]
  }
}

interface WoodPanelGeometry {
  /** The panel body, excluding the arrow's protrusion. */
  bodyRect: Rect
  /** Border thickness — also the corner gap and the block size. */
  thickness: number
  /** Outer (dark) band of the frame. */
  borderWidth: number
  /** Inner (lit) band of the frame. */
  frameWidth: number
  /** The four shortened edges and the four corner blocks. */
  frameRects: PixelRect[]
  /** The inner band of every edge and block. */
  bevelRects: PixelRect[]
  /** The surface stencil, in canvas coordinates. */
  surfacePoints: Point[]
  arrowPoints: Point[]
  side: BubbleSide | null
  width: number
  height: number
  theme: WoodPanelTheme
}

/**
 * Resolves the gap-border geometry of the panel.
 *
 * House style (`cornerLevel = 1` gap border): with a frame thickness `t`,
 * every edge stops `2t` short of each corner, a `t x t` block bridges the break
 * at `(t, t)`, and the `2t x 2t` corner square is left open. The surface loses a
 * matching `t` step per corner. Here `t` is the whole frame
 * (`borderWidth + frameWidth`), so the bevel band ends up inside the edges.
 */
const resolveWoodPanelGeometry = ({
  width,
  height,
  placement = 'none',
  theme = WOOD_PANEL_THEME,
  borderWidth = 6,
  frameWidth = 4,
  arrowWidth = 26,
  arrowDepth = 12,
}: DrawWoodPanelOptions): WoodPanelGeometry | null => {
  if (width <= 0 || height <= 0) {
    return null
  }

  const { side, align } = resolveBubblePlacement(placement)
  const thickness = borderWidth + frameWidth

  // The arrow lives in the panel's own box, exactly like `drawPixelBubble`, so
  // the body rect shrinks by the arrow depth on whichever side carries it.
  const bodyRect: Rect = {
    x: side === 'left' ? arrowDepth : 0,
    y: side === 'top' ? arrowDepth : 0,
    width: width - (side === 'left' || side === 'right' ? arrowDepth : 0),
    height: height - (side === 'top' || side === 'bottom' ? arrowDepth : 0),
  }

  if (bodyRect.width <= 0 || bodyRect.height <= 0) {
    return null
  }

  const frameRects = translateRects(buildGapFrameRects(bodyRect.width, bodyRect.height, thickness), bodyRect.x, bodyRect.y)
  const bevelRects = translateRects(
    buildGapFrameInnerRects(bodyRect.width, bodyRect.height, thickness, frameWidth),
    bodyRect.x,
    bodyRect.y
  )
  // The surface runs edge to edge underneath the frame; the frame (and the
  // corner blocks on it) paint over everything that reaches into the ring.
  const surfaceWidth = Math.max(0, bodyRect.width - thickness * 2)
  const surfaceHeight = Math.max(0, bodyRect.height - thickness * 2)
  const surfacePoints = translate(
    [
      { x: 0, y: 0 },
      { x: surfaceWidth, y: 0 },
      { x: surfaceWidth, y: surfaceHeight },
      { x: 0, y: surfaceHeight },
    ],
    bodyRect.x + thickness,
    bodyRect.y + thickness
  )

  const arrowPoints: Point[] = []
  const edgeLength = side === 'top' || side === 'bottom' ? bodyRect.width : bodyRect.height
  const span = thickness * 2
  const canHostArrow = Boolean(side) && arrowDepth > 0 && arrowWidth > 0 && edgeLength - span * 2 >= arrowWidth + 2

  if (side && canHostArrow) {
    const center = getArrowCenter(bodyRect, side, align, arrowWidth, span)
    arrowPoints.push(...buildArrowPoints(side, bodyRect, center, arrowWidth / 2, arrowDepth))
  }

  return {
    bodyRect,
    thickness,
    borderWidth,
    frameWidth,
    frameRects,
    bevelRects,
    surfacePoints,
    arrowPoints,
    side,
    width,
    height,
    theme,
  }
}

/**
 * Draws the panel: gap frame, surface and grain.
 *
 * This is the *back* layer. `drawWoodPanelFrame` re-draws the frame on top of the
 * content, because DOM children with their own backgrounds would otherwise poke
 * out of the corner breaks.
 */
export const drawWoodPanel = (ctx: CanvasRenderingContext2D, options: DrawWoodPanelOptions) => {
  const geometry = resolveWoodPanelGeometry(options)
  if (!geometry) {
    return
  }

  const { bodyRect, thickness, frameRects, bevelRects, surfacePoints, arrowPoints, width, height, theme } = geometry

  ctx.clearRect(0, 0, width, height)
  ctx.imageSmoothingEnabled = false

  // Surface + grain, clipped to the stepped surface stencil. Grain bands run
  // edge to edge inside it, like the card body stripes.
  ctx.save()
  tracePolygon(ctx, surfacePoints)
  ctx.clip()

  fillRect(ctx, bodyRect, theme.surface)

  const grainTop = bodyRect.y + thickness
  const grainLeft = bodyRect.x + thickness
  const grainHeight = Math.max(0, bodyRect.height - thickness * 2)
  const grainWidth = Math.max(0, bodyRect.width - thickness * 2)
  const bandHeight = Math.max(1, Math.round(grainHeight / 12))
  let bandIndex = 0

  for (let y = grainTop; y < grainTop + grainHeight; y += bandHeight) {
    ctx.fillStyle = theme.grain[bandIndex % theme.grain.length]
    ctx.fillRect(grainLeft, Math.round(y), grainWidth, bandHeight)
    bandIndex += 1
  }

  ctx.fillStyle = theme.topHighlight
  ctx.fillRect(grainLeft, grainTop, grainWidth, Math.max(1, Math.round(thickness / 6)))

  ctx.restore()

  // Frame: edges and blocks in the border colour, then their lit inner bands.
  for (const rect of frameRects) {
    fillRect(ctx, rect, theme.border)
  }

  for (const rect of bevelRects) {
    fillRect(ctx, rect, theme.frame)
  }

  // Arrow: a border-coloured wedge with the bevel band inset into it, so it
  // reads as part of the frame rather than a sticker on top of it.
  if (arrowPoints.length) {
    fillPolygon(ctx, arrowPoints, theme.border)
    fillPolygon(
      ctx,
      insetPolygon(arrowPoints, geometry.borderWidth, bodyRect.x + bodyRect.width, bodyRect.y + bodyRect.height),
      theme.frame
    )
  }
}

/**
 * Draws only the frame — edges, blocks and arrow — leaving the surface
 * transparent.
 *
 * Rendered on a second canvas stacked *above* the DOM content, so the frame owns
 * the top layer. Content that reaches into the frame (a header whose square
 * corner runs into a stepped corner, an image, anything a consumer drops in) is
 * covered by the frame instead of poking out of it.
 */
export const drawWoodPanelFrame = (ctx: CanvasRenderingContext2D, options: DrawWoodPanelOptions) => {
  const geometry = resolveWoodPanelGeometry(options)
  if (!geometry) {
    return
  }

  const { bodyRect, borderWidth, frameRects, bevelRects, arrowPoints, width, height, theme } = geometry

  ctx.clearRect(0, 0, width, height)
  ctx.imageSmoothingEnabled = false

  for (const rect of frameRects) {
    fillRect(ctx, rect, theme.border)
  }

  for (const rect of bevelRects) {
    fillRect(ctx, rect, theme.frame)
  }

  if (arrowPoints.length) {
    fillPolygon(ctx, arrowPoints, theme.border)
    fillPolygon(
      ctx,
      insetPolygon(arrowPoints, borderWidth, bodyRect.x + bodyRect.width, bodyRect.y + bodyRect.height),
      theme.frame
    )
  }
}
