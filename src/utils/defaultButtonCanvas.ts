import type { createDefaultButtonPalette } from './defaultButtonTheme'

type Point = {
  x: number
  y: number
}

type DefaultButtonPalette = ReturnType<typeof createDefaultButtonPalette>

export type DefaultButtonFrameMetrics = {
  cornerRadius: number
  stepSize: number
  outerBorderWidth: number
  innerBorderWidth: number
  innerBorderGap: number
  innerShadowOffsetY: number
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

const clampInset = (value: number, width: number, height: number) =>
  Math.min(value, Math.max(1, Math.floor(Math.min(width, height) / 2) - 1))

const buildButtonPolygon = (width: number, height: number, cornerRadius: number, stepSize: number): Point[] => {
  const outerInset = clampInset(cornerRadius, width, height)
  const innerInset = clampInset(Math.max(stepSize, Math.round(outerInset * 0.42)), width, height)

  return [
    { x: outerInset, y: 0 },
    { x: width - outerInset, y: 0 },
    { x: width - innerInset, y: innerInset },
    { x: width, y: outerInset },
    { x: width, y: height - outerInset },
    { x: width - innerInset, y: height - innerInset },
    { x: width - outerInset, y: height },
    { x: outerInset, y: height },
    { x: innerInset, y: height - innerInset },
    { x: 0, y: height - outerInset },
    { x: 0, y: outerInset },
    { x: innerInset, y: innerInset },
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

  return {
    cornerRadius: clampInset(Math.round(10 * scaledDpr), width, height),
    stepSize: Math.max(1, Math.round(Math.min(minSide / 8, 4 * scaledDpr))),
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

  const outerPolygon = buildButtonPolygon(width, height, metrics.cornerRadius, metrics.stepSize)
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

  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
  ctx.fillRect(
    metrics.outerBorderWidth * 2,
    metrics.outerBorderWidth * 2,
    Math.max(0, width - metrics.outerBorderWidth * 4),
    Math.max(1, Math.round(2 * dpr))
  )
}
