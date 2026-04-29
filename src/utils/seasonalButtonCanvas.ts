import { resolveAssetPath } from './githubPages'

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
  fill: string
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
  const resolvedSrc = resolveAssetPath(src)
  const cached = imageCache.get(resolvedSrc)
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
      imageCache.delete(resolvedSrc)
      reject(new Error(`Failed to load seasonal button image: ${resolvedSrc}`))
    }
    img.src = resolvedSrc
  })

  imageCache.set(resolvedSrc, loading)
  return loading
}

export const SEASONAL_BUTTON_PALETTES: Record<SeasonalButtonTheme, SeasonalButtonPalette> = {
  spring: {
    fill: '#E8F5D9',
    border: '#4CAF50',
    text: {
      normal: '#2E7D32',
      hover: '#1B5E20',
      active: '#1B5E20',
      disabled: '#B0BEC5',
    },
  },
  summer: {
    fill: '#D4F1F9',
    border: '#0288D1',
    text: {
      normal: '#01579B',
      hover: '#004D80',
      active: '#004D80',
      disabled: '#B0BEC5',
    },
  },
  autumn: {
    fill: '#FFE0B2',
    border: '#E65100',
    text: {
      normal: '#BF360C',
      hover: '#9E2C00',
      active: '#9E2C00',
      disabled: '#B0BEC5',
    },
  },
  winter: {
    fill: '#F5F9FC',
    border: '#2196F3',
    text: {
      normal: '#0D47A1',
      hover: '#0D47A1',
      active: '#0D47A1',
      disabled: '#CFD8DC',
    },
  },
}

const SEASONAL_BUTTON_SOURCES: Record<SeasonalButtonTheme, SeasonalButtonSourceConfig> = {
  spring: {
    src: '/springBtn.png',
    leftCap: 36,
    rightCap: 36,
    topHeight: 70,
    bottomHeight: 36,
    decorationX: 194,
    decorationWidth: 220,
  },
  summer: {
    src: '/summerBtn.png',
    leftCap: 34,
    rightCap: 34,
    topHeight: 62,
    bottomHeight: 34,
    decorationX: 188,
    decorationWidth: 232,
  },
  autumn: {
    src: '/autumnBtn.png',
    leftCap: 42,
    rightCap: 42,
    topHeight: 76,
    bottomHeight: 38,
    decorationX: 216,
    decorationWidth: 196,
  },
  winter: {
    src: '/winterBtn.png',
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
    applyOverlayWithinOpaquePixels(ctx, 'rgba(255, 255, 255, 0.04)', width, height)
    return
  }

  if (state === 'disabled') {
    applyOverlayWithinOpaquePixels(ctx, 'rgba(248, 250, 252, 0.32)', width, height)
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

  ctx.fillStyle = palette.fill
  ctx.globalCompositeOperation = 'destination-over'
  ctx.fillRect(leftWidth, topHeight, centerWidth, centerHeight)
  ctx.globalCompositeOperation = 'source-over'

  applyStateOverlay(ctx, state, targetWidth, targetHeight)

  ctx.restore()
}
