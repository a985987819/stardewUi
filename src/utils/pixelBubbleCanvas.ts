export type BubbleSide = 'top' | 'right' | 'bottom' | 'left'
export type BubbleAlign = 'start' | 'center' | 'end'
export type BubblePlacement =
  | 'none'
  | BubbleSide
  | 'top-start'
  | 'top-end'
  | 'right-start'
  | 'right-end'
  | 'bottom-start'
  | 'bottom-end'
  | 'left-start'
  | 'left-end'

export type ResolvedBubblePlacement = {
  side: BubbleSide | null
  align: BubbleAlign
}

export type DrawPixelBubbleOptions = {
  width: number
  height: number
  placement?: BubblePlacement
  fillColor?: string
  borderColor?: string
  borderWidth?: number
  cornerSize?: number
  arrowWidth?: number
  arrowDepth?: number
}

type Point = {
  x: number
  y: number
}

type Rect = {
  x: number
  y: number
  width: number
  height: number
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const alignForPlacement = (placement: BubblePlacement): ResolvedBubblePlacement => {
  if (placement === 'none') {
    return { side: null, align: 'center' }
  }

  const [side, maybeAlign] = placement.split('-') as [BubbleSide, BubbleAlign | undefined]
  return {
    side,
    align: maybeAlign ?? 'center',
  }
}

const getArrowCenter = (rect: Rect, side: BubbleSide, align: BubbleAlign, arrowWidth: number, cornerSize: number) => {
  const safeInset = cornerSize + arrowWidth / 2 + 4

  if (side === 'top' || side === 'bottom') {
    const min = rect.x + safeInset
    const max = rect.x + rect.width - safeInset

    if (align === 'start') return min
    if (align === 'end') return max
    return rect.x + rect.width / 2
  }

  const min = rect.y + safeInset
  const max = rect.y + rect.height - safeInset

  if (align === 'start') return min
  if (align === 'end') return max
  return rect.y + rect.height / 2
}

const buildBubblePolygon = (
  rect: Rect,
  side: BubbleSide | null,
  align: BubbleAlign,
  cornerSize: number,
  arrowWidth: number,
  arrowDepth: number
): Point[] => {
  const x = rect.x
  const y = rect.y
  const width = rect.width
  const height = rect.height
  const right = x + width
  const bottom = y + height
  const corner = Math.max(0, Math.min(cornerSize, Math.min(width, height) / 2))

  if (!side || arrowDepth <= 0 || arrowWidth <= 0) {
    return [
      { x: x + corner, y },
      { x: right - corner, y },
      { x: right, y: y + corner },
      { x: right, y: bottom - corner },
      { x: right - corner, y: bottom },
      { x: x + corner, y: bottom },
      { x, y: bottom - corner },
      { x, y: y + corner },
    ]
  }

  const arrowCenter = getArrowCenter(rect, side, align, arrowWidth, corner)
  const halfArrow = arrowWidth / 2
  const quarterArrow = Math.max(2, arrowWidth / 4)

  if (side === 'top') {
    const baseStart = clamp(arrowCenter - halfArrow, x + corner, right - corner)
    const baseEnd = clamp(arrowCenter + halfArrow, x + corner, right - corner)
    return [
      { x: x + corner, y },
      { x: baseStart, y },
      { x: arrowCenter - quarterArrow, y: y - arrowDepth / 2 },
      { x: arrowCenter, y: y - arrowDepth },
      { x: arrowCenter + quarterArrow, y: y - arrowDepth / 2 },
      { x: baseEnd, y },
      { x: right - corner, y },
      { x: right, y: y + corner },
      { x: right, y: bottom - corner },
      { x: right - corner, y: bottom },
      { x: x + corner, y: bottom },
      { x, y: bottom - corner },
      { x, y: y + corner },
    ]
  }

  if (side === 'right') {
    const baseStart = clamp(arrowCenter - halfArrow, y + corner, bottom - corner)
    const baseEnd = clamp(arrowCenter + halfArrow, y + corner, bottom - corner)
    return [
      { x: x + corner, y },
      { x: right - corner, y },
      { x: right, y: y + corner },
      { x: right, y: baseStart },
      { x: right + arrowDepth / 2, y: arrowCenter - quarterArrow },
      { x: right + arrowDepth, y: arrowCenter },
      { x: right + arrowDepth / 2, y: arrowCenter + quarterArrow },
      { x: right, y: baseEnd },
      { x: right, y: bottom - corner },
      { x: right - corner, y: bottom },
      { x: x + corner, y: bottom },
      { x, y: bottom - corner },
      { x, y: y + corner },
    ]
  }

  if (side === 'bottom') {
    const baseStart = clamp(arrowCenter - halfArrow, x + corner, right - corner)
    const baseEnd = clamp(arrowCenter + halfArrow, x + corner, right - corner)
    return [
      { x: x + corner, y },
      { x: right - corner, y },
      { x: right, y: y + corner },
      { x: right, y: bottom - corner },
      { x: baseEnd, y: bottom },
      { x: arrowCenter + quarterArrow, y: bottom + arrowDepth / 2 },
      { x: arrowCenter, y: bottom + arrowDepth },
      { x: arrowCenter - quarterArrow, y: bottom + arrowDepth / 2 },
      { x: baseStart, y: bottom },
      { x: x + corner, y: bottom },
      { x, y: bottom - corner },
      { x, y: y + corner },
    ]
  }

  const baseStart = clamp(arrowCenter - halfArrow, y + corner, bottom - corner)
  const baseEnd = clamp(arrowCenter + halfArrow, y + corner, bottom - corner)
  return [
    { x: x + corner, y },
    { x: right - corner, y },
    { x: right, y: y + corner },
    { x: right, y: bottom - corner },
    { x: right - corner, y: bottom },
    { x: x + corner, y: bottom },
    { x, y: baseEnd },
    { x: x - arrowDepth / 2, y: arrowCenter + quarterArrow },
    { x: x - arrowDepth, y: arrowCenter },
    { x: x - arrowDepth / 2, y: arrowCenter - quarterArrow },
    { x, y: baseStart },
    { x, y: y + corner },
  ]
}

const drawPolygon = (ctx: CanvasRenderingContext2D, points: Point[]) => {
  if (points.length === 0) {
    return
  }

  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let index = 1; index < points.length; index += 1) {
    ctx.lineTo(points[index].x, points[index].y)
  }
  ctx.closePath()
}

export const resolveBubblePlacement = (placement: BubblePlacement = 'none') => alignForPlacement(placement)

export const flipBubblePlacement = (placement: BubblePlacement = 'none'): BubblePlacement => {
  if (placement === 'none') {
    return 'none'
  }

  const { side, align } = alignForPlacement(placement)
  const oppositeSideMap: Record<BubbleSide, BubbleSide> = {
    top: 'bottom',
    right: 'left',
    bottom: 'top',
    left: 'right',
  }

  const oppositeSide = oppositeSideMap[side!]
  return align === 'center' ? oppositeSide : `${oppositeSide}-${align}`
}

export const drawPixelBubble = (ctx: CanvasRenderingContext2D, options: DrawPixelBubbleOptions) => {
  const {
    width,
    height,
    placement = 'none',
    fillColor = '#f8f7f3',
    borderColor = '#2f3440',
    borderWidth = 4,
    cornerSize = 10,
    arrowWidth = 20,
    arrowDepth = 12,
  } = options

  if (width <= 0 || height <= 0) {
    return
  }

  const { side, align } = alignForPlacement(placement)
  const bodyRect: Rect = {
    x: side === 'left' ? arrowDepth : 0,
    y: side === 'top' ? arrowDepth : 0,
    width: width - (side === 'left' || side === 'right' ? arrowDepth : 0),
    height: height - (side === 'top' || side === 'bottom' ? arrowDepth : 0),
  }

  const outerPoints = buildBubblePolygon(bodyRect, side, align, cornerSize, arrowWidth, arrowDepth)
  const innerRect: Rect = {
    x: bodyRect.x + borderWidth,
    y: bodyRect.y + borderWidth,
    width: Math.max(0, bodyRect.width - borderWidth * 2),
    height: Math.max(0, bodyRect.height - borderWidth * 2),
  }

  const innerPoints = buildBubblePolygon(
    innerRect,
    side,
    align,
    Math.max(0, cornerSize - borderWidth),
    Math.max(0, arrowWidth - borderWidth * 2),
    Math.max(0, arrowDepth - borderWidth)
  )

  ctx.clearRect(0, 0, width, height)
  ctx.imageSmoothingEnabled = false

  ctx.fillStyle = borderColor
  drawPolygon(ctx, outerPoints)
  ctx.fill()

  ctx.fillStyle = fillColor
  drawPolygon(ctx, innerPoints)
  ctx.fill()
}
