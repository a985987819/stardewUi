type Point = {
  x: number
  y: number
}

export interface DrawPixelPanelOptions {
  width: number
  height: number
  fillColor?: string
  borderColor?: string
  borderWidth?: number
  stepSize?: number
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

const buildPixelPanelPolygon = (width: number, height: number, stepSize: number): Point[] => {
  const step = Math.max(1, stepSize)
  const outerInset = Math.min(step * 2, Math.floor(Math.min(width, height) / 3))
  const innerInset = Math.min(step, Math.floor(Math.min(width, height) / 4))

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

export const drawPixelPanel = (ctx: CanvasRenderingContext2D, options: DrawPixelPanelOptions) => {
  const {
    width,
    height,
    fillColor = '#f8f0dc',
    borderColor = '#9e460f',
    borderWidth = 4,
    stepSize = 6,
  } = options

  ctx.clearRect(0, 0, width, height)
  ctx.imageSmoothingEnabled = false

  const outerPolygon = buildPixelPanelPolygon(width, height, stepSize)
  const innerPolygon = insetPolygon(outerPolygon, borderWidth, width, height)

  tracePolygon(ctx, outerPolygon)
  ctx.fillStyle = borderColor
  ctx.fill()

  tracePolygon(ctx, innerPolygon)
  ctx.fillStyle = fillColor
  ctx.fill()

  const sparkle = Math.max(1, Math.round(stepSize / 2))
  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)'
  ctx.fillRect(borderWidth * 2, borderWidth * 2, Math.max(0, width - borderWidth * 4), sparkle)
  ctx.fillRect(borderWidth * 2, borderWidth * 2, sparkle, Math.max(0, height - borderWidth * 4))
}
