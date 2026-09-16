import {
  resolveBubblePlacement,
  type BubbleAlign,
  type BubblePlacement,
  type BubbleSide,
} from './pixelBubbleCanvas'
import { WOOD_PANEL_THEME, type WoodPanelTheme } from './woodPanelTheme'

type Point = { x: number; y: number }
type Rect = { x: number; y: number; width: number; height: number }
type Corner = 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left'

export interface DrawWoodPanelOptions {
  width: number
  height: number
  placement?: BubblePlacement
  theme?: WoodPanelTheme
  /** Thickness of the outer frame, in device pixels. */
  borderWidth?: number
  /** Thickness of the inner bevel ring, in device pixels. */
  frameWidth?: number
  /** Staircase segments per corner. 3 gives the "三级阶梯" corner. */
  cornerSteps?: number
  /** Preferred size of one staircase segment, in device pixels. */
  stepSize?: number
  arrowWidth?: number
  arrowDepth?: number
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

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

/**
 * Staircase that climbs from the left edge up to the top edge, clockwise.
 * The first point sits on the left edge, the last one on the top edge.
 */
const buildCornerStair = (steps: number, step: number): Point[] => {
  const span = steps * step
  const points: Point[] = []

  for (let index = 0; index < steps; index += 1) {
    points.push({ x: index * step, y: span - index * step })
    points.push({ x: (index + 1) * step, y: span - index * step })
  }

  points.push({ x: span, y: 0 })

  return points
}

/**
 * Places a local staircase at one corner while keeping the polygon clockwise,
 * so the four corners can simply be concatenated in order.
 */
const mapStairToCorner = (stair: Point[], corner: Corner, rect: Rect): Point[] => {
  const right = rect.x + rect.width
  const bottom = rect.y + rect.height

  switch (corner) {
    case 'top-left':
      return stair.map(({ x, y }) => ({ x: rect.x + x, y: rect.y + y }))
    case 'top-right':
      return [...stair].reverse().map(({ x, y }) => ({ x: right - x, y: rect.y + y }))
    case 'bottom-right':
      return stair.map(({ x, y }) => ({ x: right - x, y: bottom - y }))
    default:
      return [...stair].reverse().map(({ x, y }) => ({ x: rect.x + x, y: bottom - y }))
  }
}

const getArrowCenter = (rect: Rect, side: BubbleSide, align: BubbleAlign, arrowWidth: number, span: number) => {
  const safeInset = span + arrowWidth / 2 + 2

  if (side === 'top' || side === 'bottom') {
    const min = rect.x + safeInset
    const max = rect.x + rect.width - safeInset

    if (align === 'start') return Math.min(min, max)
    if (align === 'end') return Math.max(min, max)
    return rect.x + rect.width / 2
  }

  const min = rect.y + safeInset
  const max = rect.y + rect.height - safeInset

  if (align === 'start') return Math.min(min, max)
  if (align === 'end') return Math.max(min, max)
  return rect.y + rect.height / 2
}

/**
 * Pixel arrow pointing away from the panel. Traversed in the same direction the
 * owning edge is walked, so the points can be spliced straight into the outline.
 */
const buildArrowPoints = (side: BubbleSide, rect: Rect, center: number, half: number, depth: number): Point[] => {
  const right = rect.x + rect.width
  const bottom = rect.y + rect.height
  const shoulder = Math.max(1, Math.round(half / 2))

  switch (side) {
    case 'top':
      return [
        { x: center - half, y: rect.y },
        { x: center - shoulder, y: rect.y - depth / 2 },
        { x: center, y: rect.y - depth },
        { x: center + shoulder, y: rect.y - depth / 2 },
        { x: center + half, y: rect.y },
      ]
    case 'bottom':
      return [
        { x: center + half, y: bottom },
        { x: center + shoulder, y: bottom + depth / 2 },
        { x: center, y: bottom + depth },
        { x: center - shoulder, y: bottom + depth / 2 },
        { x: center - half, y: bottom },
      ]
    case 'left':
      return [
        { x: rect.x, y: center + half },
        { x: rect.x - depth / 2, y: center + shoulder },
        { x: rect.x - depth, y: center },
        { x: rect.x - depth / 2, y: center - shoulder },
        { x: rect.x, y: center - half },
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

/**
 * Caps the corner staircase so opposite corners never overlap and the arrow
 * always has a straight edge to sit on.
 */
const resolveCornerSpan = (
  rect: Rect,
  side: BubbleSide | null,
  steps: number,
  preferredStep: number,
  arrowWidth: number
) => {
  const minSide = Math.min(rect.width, rect.height)
  const edgeLength = side === 'top' || side === 'bottom' ? rect.width : rect.height

  let limit = Math.floor(minSide / 3)

  if (side) {
    limit = Math.min(limit, Math.floor((edgeLength - arrowWidth - 6) / 2))
  }

  const wanted = steps * preferredStep

  return Math.max(steps, Math.min(wanted, Math.max(steps, limit)))
}

const buildPanelPolygon = (
  rect: Rect,
  side: BubbleSide | null,
  align: BubbleAlign,
  steps: number,
  step: number,
  arrowWidth: number,
  arrowDepth: number
): Point[] => {
  const stair = buildCornerStair(steps, step)
  const span = steps * step
  const right = rect.x + rect.width
  const bottom = rect.y + rect.height

  const hasArrow = Boolean(side) && arrowDepth > 0 && arrowWidth > 0
  const edgeLength = side === 'top' || side === 'bottom' ? rect.width : rect.height
  const canHostArrow = hasArrow && edgeLength - span * 2 >= arrowWidth + 2

  const points: Point[] = []

  points.push(...mapStairToCorner(stair, 'top-left', rect))

  if (side === 'top' && canHostArrow) {
    const center = getArrowCenter(rect, side, align, arrowWidth, span)
    const start = clamp(center - arrowWidth / 2, rect.x + span, right - span)
    const end = clamp(center + arrowWidth / 2, rect.x + span, right - span)
    points.push(...buildArrowPoints(side, rect, (start + end) / 2, (end - start) / 2, arrowDepth))
  }

  points.push(...mapStairToCorner(stair, 'top-right', rect))

  if (side === 'right' && canHostArrow) {
    const center = getArrowCenter(rect, side, align, arrowWidth, span)
    const start = clamp(center - arrowWidth / 2, rect.y + span, bottom - span)
    const end = clamp(center + arrowWidth / 2, rect.y + span, bottom - span)
    points.push(...buildArrowPoints(side, rect, (start + end) / 2, (end - start) / 2, arrowDepth))
  }

  points.push(...mapStairToCorner(stair, 'bottom-right', rect))

  if (side === 'bottom' && canHostArrow) {
    const center = getArrowCenter(rect, side, align, arrowWidth, span)
    const start = clamp(center - arrowWidth / 2, rect.x + span, right - span)
    const end = clamp(center + arrowWidth / 2, rect.x + span, right - span)
    points.push(...buildArrowPoints(side, rect, (start + end) / 2, (end - start) / 2, arrowDepth))
  }

  points.push(...mapStairToCorner(stair, 'bottom-left', rect))

  if (side === 'left' && canHostArrow) {
    const center = getArrowCenter(rect, side, align, arrowWidth, span)
    const start = clamp(center - arrowWidth / 2, rect.y + span, bottom - span)
    const end = clamp(center + arrowWidth / 2, rect.y + span, bottom - span)
    points.push(...buildArrowPoints(side, rect, (start + end) / 2, (end - start) / 2, arrowDepth))
  }

  return points
}

/**
 * CSS `clip-path` matching the surface rectangle of the drawn panel.
 *
 * The canvas paints the frame, but the popup's header/body/footer are DOM
 * elements with their own backgrounds. Without this clip they would square off
 * the staircase corners the canvas just carved. Generated from the same
 * geometry as `buildCornerStair` so the two never drift apart.
 */
export const getWoodPanelSurfaceClipPath = (cornerSteps: number, stepSize: number): string => {
  const steps = Math.max(1, Math.round(cornerSteps))
  const step = Math.max(1, stepSize)
  const stair = buildCornerStair(steps, step)
  const points: string[] = []

  const at = (value: number) => `${value}px`
  const fromEnd = (value: number) => `calc(100% - ${value}px)`

  // Walked clockwise, corner by corner, to mirror the canvas polygon exactly.
  for (const { x, y } of stair) {
    points.push(`${at(x)} ${at(y)}`)
  }

  for (let index = stair.length - 1; index >= 0; index -= 1) {
    points.push(`${fromEnd(stair[index].x)} ${at(stair[index].y)}`)
  }

  for (const { x, y } of stair) {
    points.push(`${fromEnd(x)} ${fromEnd(y)}`)
  }

  for (let index = stair.length - 1; index >= 0; index -= 1) {
    points.push(`${at(stair[index].x)} ${fromEnd(stair[index].y)}`)
  }

  return `polygon(${points.join(', ')})`
}

const insetPolygon = (points: Point[], inset: number, width: number, height: number): Point[] =>
  points.map(({ x, y }) => ({
    x: Math.min(width, Math.max(0, x < width / 2 ? x + inset : x - inset)),
    y: Math.min(height, Math.max(0, y < height / 2 ? y + inset : y - inset)),
  }))

const fillPolygon = (ctx: CanvasRenderingContext2D, points: Point[], color: string) => {
  tracePolygon(ctx, points)
  ctx.fillStyle = color
  ctx.fill()
}

export const drawWoodPanel = (ctx: CanvasRenderingContext2D, options: DrawWoodPanelOptions) => {
  const {
    width,
    height,
    placement = 'none',
    theme = WOOD_PANEL_THEME,
    borderWidth = 6,
    frameWidth = 4,
    cornerSteps = 3,
    stepSize = 6,
    arrowWidth = 26,
    arrowDepth = 12,
  } = options

  if (width <= 0 || height <= 0) {
    return
  }

  const { side, align } = resolveBubblePlacement(placement)

  // The arrow lives in the panel's own box, exactly like `drawPixelBubble`, so
  // the body rect shrinks by the arrow depth on whichever side carries it.
  const bodyRect: Rect = {
    x: side === 'left' ? arrowDepth : 0,
    y: side === 'top' ? arrowDepth : 0,
    width: width - (side === 'left' || side === 'right' ? arrowDepth : 0),
    height: height - (side === 'top' || side === 'bottom' ? arrowDepth : 0),
  }

  const span = resolveCornerSpan(bodyRect, side, cornerSteps, stepSize, arrowWidth)
  const step = span / cornerSteps
  const outer = buildPanelPolygon(bodyRect, side, align, cornerSteps, step, arrowWidth, arrowDepth)

  if (outer.length === 0) {
    return
  }

  const inset = borderWidth + frameWidth
  const innerRect: Rect = {
    x: bodyRect.x + inset,
    y: bodyRect.y + inset,
    width: Math.max(0, bodyRect.width - inset * 2),
    height: Math.max(0, bodyRect.height - inset * 2),
  }

  const hairline = Math.max(1, Math.round(borderWidth / 3))

  ctx.clearRect(0, 0, width, height)
  ctx.imageSmoothingEnabled = false

  fillPolygon(ctx, outer, theme.border)
  fillPolygon(ctx, insetPolygon(outer, borderWidth, width, height), theme.frame)
  fillPolygon(ctx, insetPolygon(outer, inset, width, height), theme.surface)

  if (innerRect.width <= 0 || innerRect.height <= 0) {
    return
  }

  ctx.save()
  tracePolygon(ctx, outer)
  ctx.clip()

  const bandHeight = Math.max(hairline, Math.round(innerRect.height / 12))
  let bandIndex = 0

  for (let y = innerRect.y; y < innerRect.y + innerRect.height; y += bandHeight) {
    ctx.fillStyle = theme.grain[bandIndex % theme.grain.length]
    ctx.fillRect(innerRect.x, Math.round(y), innerRect.width, bandHeight)
    bandIndex += 1
  }

  // Three uneven streaks keep the grain from reading as a regular gradient.
  ctx.fillStyle = theme.bottomShade

  for (const ratio of [0.24, 0.52, 0.78]) {
    ctx.fillRect(innerRect.x, Math.round(innerRect.y + innerRect.height * ratio), innerRect.width, hairline)
  }

  ctx.fillStyle = theme.topHighlight
  ctx.fillRect(innerRect.x, innerRect.y, innerRect.width, hairline)
  ctx.fillRect(innerRect.x, innerRect.y, hairline, innerRect.height)

  ctx.fillStyle = theme.bottomShade
  ctx.fillRect(innerRect.x, innerRect.y + innerRect.height - hairline, innerRect.width, hairline)

  ctx.restore()
}
