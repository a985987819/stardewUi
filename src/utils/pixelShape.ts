export type PixelClipPath = {
  clipPath: string
  width: number
  height: number
}

export type PixelCornerSize = 'none' | 'small' | 'medium' | 'large'

const PIXEL_CORNER_MAP: Record<PixelCornerSize, number> = {
  none: 0,
  small: 2,
  medium: 4,
  large: 6,
}

export function createPixelCircleClip(size: number): PixelClipPath {
  const s = Math.max(1, Math.round(size))
  const r = Math.floor(s / 2)
  const q = Math.max(1, Math.floor(r / 2))

  const points: string[] = []

  const addCorner = (startX: number, startY: number, cornerX: number, cornerY: number, endX: number, endY: number) => {
    points.push(`${startX}px ${startY}px`)
    points.push(`${cornerX}px ${cornerY}px`)
    points.push(`${endX}px ${endY}px`)
  }

  addCorner(q, 0, r, 0, s - q, 0)
  points.push(`${s - q}px 0`)
  addCorner(s, q, s, r, s, s - q)
  points.push(`${s} ${s - q}`)
  addCorner(s - q, s, r, s, q, s)
  points.push(`${q} ${s}`)
  addCorner(0, s - q, 0, r, 0, q)
  points.push(`0 ${q}`)

  return {
    clipPath: `polygon(${points.join(', ')})`,
    width: s,
    height: s,
  }
}

export function createPixelRoundedRectClip(
  width: number,
  height: number,
  cornerSize: PixelCornerSize = 'medium'
): PixelClipPath {
  const w = Math.max(1, Math.round(width))
  const h = Math.max(1, Math.round(height))
  const c = PIXEL_CORNER_MAP[cornerSize]

  if (c === 0) {
    return {
      clipPath: `polygon(0 0, ${w}px 0, ${w}px ${h}px, 0 ${h}px)`,
      width: w,
      height: h,
    }
  }

  const points = [
    `${c}px 0`,
    `${w - c}px 0`,
    `${w}px ${c}px`,
    `${w}px ${h - c}px`,
    `${w - c}px ${h}px`,
    `${c}px ${h}px`,
    `0 ${h - c}px`,
    `0 ${c}px`,
  ]

  return {
    clipPath: `polygon(${points.join(', ')})`,
    width: w,
    height: h,
  }
}

export function createPixelPillClip(width: number, height: number): PixelClipPath {
  const w = Math.max(1, Math.round(width))
  const h = Math.max(1, Math.round(height))
  const r = Math.floor(h / 2)
  const q = Math.max(1, Math.floor(r / 2))

  const points = [
    `${q}px 0`,
    `${w - q}px 0`,
    `${w}px ${q}px`,
    `${w}px ${h - q}px`,
    `${w - q}px ${h}px`,
    `${q}px ${h}px`,
    `0 ${h - q}px`,
    `0 ${q}px`,
  ]

  return {
    clipPath: `polygon(${points.join(', ')})`,
    width: w,
    height: h,
  }
}

export function createPixelCornerClip(
  width: number,
  height: number,
  corners: {
    topLeft?: PixelCornerSize
    topRight?: PixelCornerSize
    bottomRight?: PixelCornerSize
    bottomLeft?: PixelCornerSize
  }
): PixelClipPath {
  const w = Math.max(1, Math.round(width))
  const h = Math.max(1, Math.round(height))
  const tl = PIXEL_CORNER_MAP[corners.topLeft ?? 'none']
  const tr = PIXEL_CORNER_MAP[corners.topRight ?? 'none']
  const br = PIXEL_CORNER_MAP[corners.bottomRight ?? 'none']
  const bl = PIXEL_CORNER_MAP[corners.bottomLeft ?? 'none']

  const points = [
    `${tl}px 0`,
    `${w - tr}px 0`,
    tr > 0 ? `${w}px ${tr}px` : `${w}px 0`,
    `${w}px ${h - br}px`,
    br > 0 ? `${w - br}px ${h}px` : `${w}px ${h}px`,
    `${bl}px ${h}px`,
    bl > 0 ? `0 ${h - bl}px` : `0 ${h}px`,
    `0 ${tl}px`,
  ]

  return {
    clipPath: `polygon(${points.join(', ')})`,
    width: w,
    height: h,
  }
}

export function createPixelSwitchThumbClip(size: number): PixelClipPath {
  return createPixelCircleClip(size)
}

export function createPixelSwitchTrackClip(width: number, height: number): PixelClipPath {
  return createPixelPillClip(width, height)
}

export const pixelShapeUtils = {
  createPixelCircleClip,
  createPixelRoundedRectClip,
  createPixelPillClip,
  createPixelCornerClip,
  createPixelSwitchThumbClip,
  createPixelSwitchTrackClip,
}
