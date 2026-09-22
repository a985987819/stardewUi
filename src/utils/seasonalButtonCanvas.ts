import autumnButtonImageSrc from '../assets/autumnBtn.png'
import springButtonImageSrc from '../assets/springBtn.png'
import summerButtonImageSrc from '../assets/summerBtn.png'
import winterButtonImageSrc from '../assets/winterBtn.png'
import { STAR_COLORS } from '../styles/colorTokens'

type HTMLImageWithSize = HTMLImageElement & {
  naturalWidth: number
  naturalHeight: number
}

type LoadedImage = {
  element: HTMLImageWithSize
  width: number
  height: number
}

export type SeasonalButtonTheme = 'spring' | 'summer' | 'autumn' | 'winter'
export type SeasonalButtonVisualState = 'normal' | 'hover' | 'active' | 'disabled'

type SeasonalButtonPalette = {
  normalFill: string
  pressedFill: string
  disabledFill: string
  border: string
  text: Record<SeasonalButtonVisualState, string>
}

type SeasonalButtonSourceConfig = {
  src: string
  leftCap: number
  rightCap: number
  topHeight: number
  bottomHeight: number
  decorationX: number
  decorationWidth: number
}

type DrawSeasonalButtonOptions = {
  ctx: CanvasRenderingContext2D
  image: LoadedImage
  theme: SeasonalButtonTheme
  state: SeasonalButtonVisualState
  targetWidth: number
  targetHeight: number
}

const imageCache = new Map<string, Promise<LoadedImage>>()

const loadImage = (src: string) => {
  const cached = imageCache.get(src)
  if (cached) {
    return cached
  }

  const loading = new Promise<LoadedImage>((resolve, reject) => {
    const img = new Image() as HTMLImageWithSize
    img.decoding = 'async'
    img.onload = () => {
      resolve({
        element: img,
        width: img.naturalWidth,
        height: img.naturalHeight,
      })
    }
    img.onerror = () => {
      imageCache.delete(src)
      reject(new Error(`Failed to load seasonal button image: ${src}`))
    }
    img.src = src
  })

  imageCache.set(src, loading)
  return loading
}

export const SEASONAL_BUTTON_PALETTES: Record<SeasonalButtonTheme, SeasonalButtonPalette> = {
  spring: {
    normalFill: STAR_COLORS.season.spring.fill,
    pressedFill: STAR_COLORS.season.spring.pressedFill,
    disabledFill: STAR_COLORS.season.spring.disabledFill,
    border: STAR_COLORS.season.spring.border,
    text: {
      normal: STAR_COLORS.season.spring.text,
      hover: STAR_COLORS.season.spring.text,
      active: STAR_COLORS.season.spring.text,
      disabled: STAR_COLORS.season.spring.text,
    },
  },
  summer: {
    normalFill: STAR_COLORS.season.summer.fill,
    pressedFill: STAR_COLORS.season.summer.pressedFill,
    disabledFill: STAR_COLORS.season.summer.disabledFill,
    border: STAR_COLORS.season.summer.border,
    text: {
      normal: STAR_COLORS.season.summer.text,
      hover: STAR_COLORS.season.summer.text,
      active: STAR_COLORS.season.summer.text,
      disabled: STAR_COLORS.season.summer.text,
    },
  },
  autumn: {
    normalFill: STAR_COLORS.season.autumn.fill,
    pressedFill: STAR_COLORS.season.autumn.pressedFill,
    disabledFill: STAR_COLORS.season.autumn.disabledFill,
    border: STAR_COLORS.season.autumn.border,
    text: {
      normal: STAR_COLORS.season.autumn.text,
      hover: STAR_COLORS.season.autumn.text,
      active: STAR_COLORS.season.autumn.text,
      disabled: STAR_COLORS.season.autumn.text,
    },
  },
  winter: {
    normalFill: STAR_COLORS.season.winter.fill,
    pressedFill: STAR_COLORS.season.winter.pressedFill,
    disabledFill: STAR_COLORS.season.winter.disabledFill,
    border: STAR_COLORS.season.winter.border,
    text: {
      normal: STAR_COLORS.season.winter.text,
      hover: STAR_COLORS.season.winter.text,
      active: STAR_COLORS.season.winter.text,
      disabled: STAR_COLORS.season.winter.text,
    },
  },
}

const SEASONAL_BUTTON_SOURCES: Record<SeasonalButtonTheme, SeasonalButtonSourceConfig> = {
  spring: {
    src: springButtonImageSrc,
    leftCap: 36,
    rightCap: 36,
    topHeight: 70,
    bottomHeight: 36,
    decorationX: 194,
    decorationWidth: 220,
  },
  summer: {
    src: summerButtonImageSrc,
    leftCap: 34,
    rightCap: 34,
    topHeight: 62,
    bottomHeight: 34,
    decorationX: 188,
    decorationWidth: 232,
  },
  autumn: {
    src: autumnButtonImageSrc,
    leftCap: 42,
    rightCap: 42,
    topHeight: 76,
    bottomHeight: 38,
    decorationX: 216,
    decorationWidth: 196,
  },
  winter: {
    src: winterButtonImageSrc,
    leftCap: 38,
    rightCap: 38,
    topHeight: 64,
    bottomHeight: 36,
    decorationX: 108,
    decorationWidth: 425,
  },
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

const applyOverlayWithinOpaquePixels = (
  ctx: CanvasRenderingContext2D,
  color: string,
  width: number,
  height: number
) => {
  ctx.save()
  ctx.globalCompositeOperation = 'source-atop'
  ctx.fillStyle = color
  ctx.fillRect(0, 0, width, height)
  ctx.restore()
}

const applyStateOverlay = (
  ctx: CanvasRenderingContext2D,
  state: SeasonalButtonVisualState,
  width: number,
  height: number
) => {
  if (state === 'hover') {
    applyOverlayWithinOpaquePixels(ctx, STAR_COLORS.canvas.seasonalHoverOverlay, width, height)
    return
  }

  if (state === 'disabled') {
    applyOverlayWithinOpaquePixels(ctx, STAR_COLORS.canvas.seasonalDisabledOverlay, width, height)
  }
}

export const getSeasonalButtonTextColor = (
  theme: SeasonalButtonTheme,
  state: SeasonalButtonVisualState
) => SEASONAL_BUTTON_PALETTES[theme].text[state]

export const getSeasonalButtonSource = (theme: SeasonalButtonTheme) =>
  SEASONAL_BUTTON_SOURCES[theme]

export const loadSeasonalButtonImage = (theme: SeasonalButtonTheme) =>
  loadImage(SEASONAL_BUTTON_SOURCES[theme].src)

export const drawSeasonalButtonBackground = ({
  ctx,
  image,
  theme,
  state,
  targetWidth,
  targetHeight,
}: DrawSeasonalButtonOptions) => {
  if (targetWidth <= 0 || targetHeight <= 0) {
    return
  }

  const source = SEASONAL_BUTTON_SOURCES[theme]
  const palette = SEASONAL_BUTTON_PALETTES[theme]

  const baseScale = Math.min(
    targetHeight / image.height,
    targetWidth / (source.leftCap + source.rightCap + source.decorationWidth)
  )

  const leftWidth = Math.max(1, Math.round(source.leftCap * baseScale))
  const rightWidth = Math.max(1, Math.round(source.rightCap * baseScale))
  const topHeight = Math.max(1, Math.round(source.topHeight * baseScale))
  const bottomHeight = Math.max(1, Math.round(source.bottomHeight * baseScale))

  const maxDecorationWidth = Math.max(1, targetWidth - leftWidth - rightWidth)
  const decorationWidth = Math.max(
    1,
    Math.min(Math.round(source.decorationWidth * baseScale), maxDecorationWidth)
  )

  const centerWidth = Math.max(0, targetWidth - leftWidth - rightWidth)
  const centerHeight = Math.max(0, targetHeight - topHeight - bottomHeight)
  const decorationX = Math.round((targetWidth - decorationWidth) / 2)
  const decorationRight = decorationX + decorationWidth
  const topLeftStretchWidth = Math.max(0, decorationX - leftWidth)
  const topRightStretchWidth = Math.max(0, targetWidth - rightWidth - decorationRight)

  const srcMiddleHeight = Math.max(0, image.height - source.topHeight - source.bottomHeight)
  const srcCenterWidth = Math.max(0, image.width - source.leftCap - source.rightCap)
  const srcTopLeftStretchWidth = Math.max(0, source.decorationX - source.leftCap)
  const srcTopRightStretchWidth = Math.max(
    0,
    image.width - source.rightCap - source.decorationX - source.decorationWidth
  )

  ctx.save()
  ctx.imageSmoothingEnabled = false
  ctx.clearRect(0, 0, targetWidth, targetHeight)

  drawPatch(
    ctx,
    image.element,
    0,
    0,
    source.leftCap,
    source.topHeight,
    0,
    0,
    leftWidth,
    topHeight
  )
  drawPatch(
    ctx,
    image.element,
    image.width - source.rightCap,
    0,
    source.rightCap,
    source.topHeight,
    targetWidth - rightWidth,
    0,
    rightWidth,
    topHeight
  )
  drawPatch(
    ctx,
    image.element,
    0,
    image.height - source.bottomHeight,
    source.leftCap,
    source.bottomHeight,
    0,
    targetHeight - bottomHeight,
    leftWidth,
    bottomHeight
  )
  drawPatch(
    ctx,
    image.element,
    image.width - source.rightCap,
    image.height - source.bottomHeight,
    source.rightCap,
    source.bottomHeight,
    targetWidth - rightWidth,
    targetHeight - bottomHeight,
    rightWidth,
    bottomHeight
  )

  drawPatch(
    ctx,
    image.element,
    source.leftCap,
    0,
    srcTopLeftStretchWidth,
    source.topHeight,
    leftWidth,
    0,
    topLeftStretchWidth,
    topHeight
  )
  drawPatch(
    ctx,
    image.element,
    source.decorationX + source.decorationWidth,
    0,
    srcTopRightStretchWidth,
    source.topHeight,
    decorationRight,
    0,
    topRightStretchWidth,
    topHeight
  )
  drawPatch(
    ctx,
    image.element,
    source.decorationX,
    0,
    source.decorationWidth,
    source.topHeight,
    decorationX,
    0,
    decorationWidth,
    topHeight
  )

  drawPatch(
    ctx,
    image.element,
    0,
    source.topHeight,
    source.leftCap,
    srcMiddleHeight,
    0,
    topHeight,
    leftWidth,
    centerHeight
  )
  drawPatch(
    ctx,
    image.element,
    image.width - source.rightCap,
    source.topHeight,
    source.rightCap,
    srcMiddleHeight,
    targetWidth - rightWidth,
    topHeight,
    rightWidth,
    centerHeight
  )
  drawPatch(
    ctx,
    image.element,
    source.leftCap,
    source.topHeight,
    srcCenterWidth,
    srcMiddleHeight,
    leftWidth,
    topHeight,
    centerWidth,
    centerHeight
  )

  drawPatch(
    ctx,
    image.element,
    source.leftCap,
    image.height - source.bottomHeight,
    srcCenterWidth,
    source.bottomHeight,
    leftWidth,
    targetHeight - bottomHeight,
    centerWidth,
    bottomHeight
  )

  ctx.fillStyle =
    state === 'active'
      ? palette.pressedFill
      : state === 'disabled'
        ? palette.disabledFill
        : palette.normalFill
  ctx.globalCompositeOperation = 'destination-over'
  ctx.fillRect(leftWidth, topHeight, centerWidth, centerHeight)
  ctx.globalCompositeOperation = 'source-over'

  applyStateOverlay(ctx, state, targetWidth, targetHeight)

  ctx.restore()
}
