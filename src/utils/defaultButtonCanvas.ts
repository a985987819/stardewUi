import type { createDefaultButtonPalette } from './defaultButtonTheme'

type Point = {
  x: number
  y: number
}

type DefaultButtonPalette = ReturnType<typeof createDefaultButtonPalette>

export type DefaultButtonFrameMetrics = {
  /** Staircase segments per corner. */
  cornerSteps: number
  /** Size of one staircase segment, in device pixels. */
  cornerStep: number
  /** Total corner span: `cornerSteps * cornerStep`. */
  cornerSpan: number
  outerBorderWidth: number
  innerBorderWidth: number
  innerBorderGap: number
  innerShadowOffsetY: number
}

/** One clean square step per corner keeps the button silhouette compact. */
export const DEFAULT_BUTTON_CORNER_STEPS = 1
const MAX_CORNER_STEP = 6

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
 * Staircase that climbs from the vertical edge up to the horizontal edge.
 * The first point sits on the vertical edge, the last one on the horizontal
 * edge, so four of these concatenate into one clockwise polygon.
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

const buildButtonPolygon = (width: number, height: number, steps: number, step: number): Point[] => {
  const stair = buildCornerStair(steps, step)

  return [
    ...stair,
    ...[...stair].reverse().map(({ x, y }) => ({ x: width - x, y })),
    ...stair.map(({ x, y }) => ({ x: width - x, y: height - y })),
    ...[...stair].reverse().map(({ x, y }) => ({ x, y: height - y })),
  ]
}

const insetPolygon = (points: Point[], inset: number, width: number, height: number): Point[] =>
  points.map(({ x, y }) => ({
    x: Math.min(width, Math.max(0, x < width / 2 ? x + inset : x - inset)),
    y: Math.min(height, Math.max(0, y < height / 2 ? y + inset : y - inset)),
  }))

export const getDefaultButtonFrameMetrics = (width: number, height: number, dpr: number): DefaultButtonFrameMetrics => {
  const minSide = Math.max(1, Math.min(width, height))
  const scaledDpr = Math.max(1, dpr)
  const steps = DEFAULT_BUTTON_CORNER_STEPS

  // Keep the single step legible on compact buttons and ensure it remains on a
  // whole device pixel so the corner rasterises crisp rather than soft.
  const maxSpan = Math.floor(minSide / 3)
  const cornerStep = Math.max(
    1,
    Math.min(
      Math.round(minSide / (steps * 2.6)),
      Math.round(MAX_CORNER_STEP * scaledDpr),
      Math.floor(maxSpan / steps)
    )
  )

  return {
    cornerSteps: steps,
    cornerStep,
    cornerSpan: cornerStep * steps,
    outerBorderWidth: 2 * scaledDpr,
    innerBorderWidth: 2 * scaledDpr,
    innerBorderGap: 0.5 * scaledDpr,
    innerShadowOffsetY: Math.max(1, Math.round(1.5 * scaledDpr)),
  }
}

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

  ctx.clearRect(0, 0, width, height)
  ctx.imageSmoothingEnabled = false

  const outerPolygon = buildButtonPolygon(width, height, metrics.cornerSteps, metrics.cornerStep)
  const fillPolygon = insetPolygon(outerPolygon, metrics.outerBorderWidth, width, height)
  const innerBorderPolygon = insetPolygon(
    outerPolygon,
    metrics.outerBorderWidth + metrics.innerBorderGap + metrics.innerBorderWidth / 2,
    width,
    height
  )

  tracePolygon(ctx, outerPolygon)
  ctx.fillStyle = palette.outerBorder
  ctx.fill()

  tracePolygon(ctx, fillPolygon)
  ctx.fillStyle = palette.fill
  ctx.fill()

  ctx.save()
  ctx.translate(0, metrics.innerShadowOffsetY)
  tracePolygon(ctx, innerBorderPolygon)
  ctx.strokeStyle = 'rgba(66, 39, 17, 0.28)'
  ctx.lineWidth = metrics.innerBorderWidth
  ctx.lineJoin = 'miter'
  ctx.stroke()
  ctx.restore()

  tracePolygon(ctx, innerBorderPolygon)
  ctx.strokeStyle = palette.innerBorder
  ctx.lineWidth = metrics.innerBorderWidth
  ctx.lineJoin = 'miter'
  ctx.stroke()

  // Keep the top highlight clear of the corner staircase, otherwise it would
  // spill into the notch the polygon leaves behind.
  const highlightInset = Math.max(metrics.outerBorderWidth * 2, metrics.cornerSpan)
  const highlightHeight = Math.max(1, Math.round(2 * dpr))

  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
  ctx.fillRect(
    highlightInset,
    metrics.outerBorderWidth * 2,
    Math.max(0, width - highlightInset * 2),
    highlightHeight
  )
}
