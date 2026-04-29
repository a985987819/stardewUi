export interface DrawCardSurfaceStripesOptions {
  width: number
  height: number
  stripes: readonly string[]
  direction?: 'vertical' | 'horizontal'
}

export interface CardStripeSegment {
  color: string
  start: number
  size: number
}

export function getCardStripeSegments(length: number, stripes: readonly string[]): CardStripeSegment[] {
  if (length <= 0 || stripes.length === 0) {
    return []
  }

  return stripes
    .map((color, index) => {
      const start = Math.round((index * length) / stripes.length)
      const end = index === stripes.length - 1 ? length : Math.round(((index + 1) * length) / stripes.length)

      return {
        color,
        start,
        size: Math.max(0, end - start),
      }
    })
    .filter((segment) => segment.size > 0)
}

export function drawCardSurfaceStripes(
  ctx: CanvasRenderingContext2D,
  { width, height, stripes, direction = 'vertical' }: DrawCardSurfaceStripesOptions
) {
  if (width <= 0 || height <= 0) {
    return
  }

  ctx.clearRect(0, 0, width, height)
  ctx.imageSmoothingEnabled = false

  const segments = getCardStripeSegments(direction === 'vertical' ? height : width, stripes)

  for (const segment of segments) {
    ctx.fillStyle = segment.color

    if (direction === 'vertical') {
      ctx.fillRect(0, segment.start, width, segment.size)
      continue
    }

    ctx.fillRect(segment.start, 0, segment.size, height)
  }
}
