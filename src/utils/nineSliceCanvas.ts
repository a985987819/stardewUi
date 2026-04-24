export type NineSliceInsets = {
  top: number
  right: number
  bottom: number
  left: number
}

export type NineSliceDrawOptions = {
  image: CanvasImageSource
  targetWidth: number
  targetHeight: number
  sourceWidth: number
  sourceHeight: number
  insets: NineSliceInsets
  clearBeforeDraw?: boolean
}

const clampNonNegative = (value: number) => (value < 0 ? 0 : value)

const clampInsets = (
  insets: NineSliceInsets,
  sourceWidth: number,
  sourceHeight: number
): NineSliceInsets => {
  const top = clampNonNegative(insets.top)
  const right = clampNonNegative(insets.right)
  const bottom = clampNonNegative(insets.bottom)
  const left = clampNonNegative(insets.left)

  const horizontal = left + right
  const vertical = top + bottom

  if (horizontal <= sourceWidth && vertical <= sourceHeight) {
    return { top, right, bottom, left }
  }

  const horizontalScale = horizontal > 0 ? Math.min(1, sourceWidth / horizontal) : 1
  const verticalScale = vertical > 0 ? Math.min(1, sourceHeight / vertical) : 1

  return {
    top: top * verticalScale,
    right: right * horizontalScale,
    bottom: bottom * verticalScale,
    left: left * horizontalScale,
  }
}

const drawPatch = (
  ctx: CanvasRenderingContext2D,
  image: CanvasImageSource,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  dx: number,
  dy: number,
  dw: number,
  dh: number
) => {
  if (sw <= 0 || sh <= 0 || dw <= 0 || dh <= 0) {
    return
  }
  ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
}

export const drawNineSlice = (
  ctx: CanvasRenderingContext2D,
  options: NineSliceDrawOptions
) => {
  const {
    image,
    targetWidth,
    targetHeight,
    sourceWidth,
    sourceHeight,
    insets,
    clearBeforeDraw = true,
  } = options

  if (targetWidth <= 0 || targetHeight <= 0 || sourceWidth <= 0 || sourceHeight <= 0) {
    return
  }

  if (clearBeforeDraw) {
    ctx.clearRect(0, 0, targetWidth, targetHeight)
  }

  const safeInsets = clampInsets(insets, sourceWidth, sourceHeight)

  const srcLeft = safeInsets.left
  const srcRight = safeInsets.right
  const srcTop = safeInsets.top
  const srcBottom = safeInsets.bottom

  const srcCenterWidth = Math.max(0, sourceWidth - srcLeft - srcRight)
  const srcCenterHeight = Math.max(0, sourceHeight - srcTop - srcBottom)

  const targetHorizontalScale =
    srcLeft + srcRight > 0 ? Math.min(1, targetWidth / (srcLeft + srcRight)) : 1
  const targetVerticalScale =
    srcTop + srcBottom > 0 ? Math.min(1, targetHeight / (srcTop + srcBottom)) : 1

  const dstLeft = srcLeft * targetHorizontalScale
  const dstRight = srcRight * targetHorizontalScale
  const dstTop = srcTop * targetVerticalScale
  const dstBottom = srcBottom * targetVerticalScale

  const dstCenterWidth = Math.max(0, targetWidth - dstLeft - dstRight)
  const dstCenterHeight = Math.max(0, targetHeight - dstTop - dstBottom)

  drawPatch(ctx, image, 0, 0, srcLeft, srcTop, 0, 0, dstLeft, dstTop)
  drawPatch(
    ctx,
    image,
    sourceWidth - srcRight,
    0,
    srcRight,
    srcTop,
    targetWidth - dstRight,
    0,
    dstRight,
    dstTop
  )
  drawPatch(
    ctx,
    image,
    0,
    sourceHeight - srcBottom,
    srcLeft,
    srcBottom,
    0,
    targetHeight - dstBottom,
    dstLeft,
    dstBottom
  )
  drawPatch(
    ctx,
    image,
    sourceWidth - srcRight,
    sourceHeight - srcBottom,
    srcRight,
    srcBottom,
    targetWidth - dstRight,
    targetHeight - dstBottom,
    dstRight,
    dstBottom
  )

  drawPatch(
    ctx,
    image,
    srcLeft,
    0,
    srcCenterWidth,
    srcTop,
    dstLeft,
    0,
    dstCenterWidth,
    dstTop
  )
  drawPatch(
    ctx,
    image,
    srcLeft,
    sourceHeight - srcBottom,
    srcCenterWidth,
    srcBottom,
    dstLeft,
    targetHeight - dstBottom,
    dstCenterWidth,
    dstBottom
  )
  drawPatch(
    ctx,
    image,
    0,
    srcTop,
    srcLeft,
    srcCenterHeight,
    0,
    dstTop,
    dstLeft,
    dstCenterHeight
  )
  drawPatch(
    ctx,
    image,
    sourceWidth - srcRight,
    srcTop,
    srcRight,
    srcCenterHeight,
    targetWidth - dstRight,
    dstTop,
    dstRight,
    dstCenterHeight
  )

  drawPatch(
    ctx,
    image,
    srcLeft,
    srcTop,
    srcCenterWidth,
    srcCenterHeight,
    dstLeft,
    dstTop,
    dstCenterWidth,
    dstCenterHeight
  )
}

