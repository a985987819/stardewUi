import { createElement, useEffect, useRef, type HTMLAttributes } from 'react'
import { classNames } from '../../utils/classNames'
import styles from './Title.module.scss'

export type StarTitleLevel = 1 | 2 | 3 | 4 | 5 | 6

export interface StarTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Heading level used for document semantics. Defaults to h2. */
  level?: StarTitleLevel
  /** Plain text to draw into the pixel canvas. */
  children?: string | number
  /** Shows the hard pixel cast shadow. Defaults to true. */
  showShadow?: boolean
  /** Main fill color. The highlight and surface flecks are derived from this value. */
  color?: string
  /** Space in pixels inserted between glyphs. Defaults to 4. */
  letterSpacing?: number
  /** Canvas font size in pixels. Defaults to 50. */
  fontSize?: number
}

const TITLE_FONT_SIZE = 50
const TITLE_PADDING = 6
const TITLE_SHADOW_OFFSET = 5
const TITLE_SHADOW_LENGTH = 4
const TITLE_LETTER_SPACING = 4
const TITLE_OUTLINE_OFFSETS: readonly (readonly [number, number])[] = [
  [-3, 0], [3, 0], [0, -3], [0, 3], [-2, -2], [2, -2], [-2, 2], [2, 2],
  [-3, -1], [3, -1], [-3, 1], [3, 1], [-1, -3], [1, -3], [-1, 3], [1, 3],
]
const TITLE_OUTLINE_TEETH: readonly (readonly [number, number])[] = [
  [-4, -1], [-4, 1], [4, -1], [4, 1], [-1, -4], [1, -4], [-1, 4], [1, 4],
]

const TITLE_FILL = [206, 159, 0] as const
const TITLE_OUTLINE = [73, 50, 19] as const
const TITLE_OUTLINE_CHIP = [101, 70, 27] as const
const TITLE_SHADOW = [41, 58, 44, 153] as const

type TitleRgb = readonly [number, number, number]

interface TitlePalette {
  fill: TitleRgb
  highlight: TitleRgb
  fleckLight: TitleRgb
  fleckDark: TitleRgb
}

interface TitlePaintOptions {
  color?: string
  fontSize: number
  letterSpacing: number
  showShadow: boolean
}

function getTitleText(children: StarTitleProps['children']): string {
  if (typeof children === 'string' || typeof children === 'number') return String(children)
  return ''
}

function clampByte(value: number) {
  return Math.min(255, Math.max(0, Math.round(value)))
}

function rgbToHsl([red, green, blue]: TitleRgb) {
  const r = red / 255
  const g = green / 255
  const b = blue / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const lightness = (max + min) / 2
  const delta = max - min
  if (delta === 0) return { hue: 0, saturation: 0, lightness }

  const saturation = delta / (1 - Math.abs(2 * lightness - 1))
  const hue = ((max === r ? (g - b) / delta : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4) * 60 + 360) % 360
  return { hue, saturation, lightness }
}

function hslToRgb(hue: number, saturation: number, lightness: number): TitleRgb {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
  const sector = hue / 60
  const second = chroma * (1 - Math.abs((sector % 2) - 1))
  const [r, g, b] = sector < 1 ? [chroma, second, 0]
    : sector < 2 ? [second, chroma, 0]
      : sector < 3 ? [0, chroma, second]
        : sector < 4 ? [0, second, chroma]
          : sector < 5 ? [second, 0, chroma]
            : [chroma, 0, second]
  const match = lightness - chroma / 2
  return [clampByte((r + match) * 255), clampByte((g + match) * 255), clampByte((b + match) * 255)]
}

/** Derives highlight and fleck colors from the visible fill while keeping the sprite contrast crisp. */
// eslint-disable-next-line react-refresh/only-export-components -- tests verify the deterministic color derivation separately from canvas paint.
export function deriveTitlePalette(fill: TitleRgb): TitlePalette {
  const { hue, saturation, lightness } = rgbToHsl(fill)
  return {
    fill,
    highlight: hslToRgb((hue + 10) % 360, Math.max(0.2, saturation * 0.95), lightness + (1 - lightness) * 0.34),
    fleckLight: hslToRgb((hue + 2) % 360, saturation, lightness + (1 - lightness) * 0.13),
    fleckDark: hslToRgb((hue + 357) % 360, saturation, lightness * 0.78),
  }
}

function resolveTitleFill(color: string | undefined): TitleRgb {
  if (!color) return TITLE_FILL
  const probe = document.createElement('canvas')
  probe.width = 1
  probe.height = 1
  const context = probe.getContext('2d', { willReadFrequently: true })
  if (!context) return TITLE_FILL
  context.fillStyle = '#ce9f00'
  context.fillStyle = color
  context.fillRect(0, 0, 1, 1)
  const [red, green, blue] = context.getImageData(0, 0, 1, 1).data
  return [red, green, blue]
}

function normalizePositive(value: number | undefined, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(1, value) : fallback
}

function normalizeSpacing(value: number | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(0, value) : TITLE_LETTER_SPACING
}

function setPixel(data: Uint8ClampedArray, width: number, x: number, y: number, color: readonly number[]) {
  if (x < 0 || y < 0 || x >= width) return
  const index = (y * width + x) * 4
  data[index] = color[0]
  data[index + 1] = color[1]
  data[index + 2] = color[2]
  data[index + 3] = color[3] ?? 255
}

/** A repeatable pseudo-random value so decorative noise never flickers on rerender. */
function pixelNoise(x: number, y: number, seed: number) {
  let value = (Math.imul(x, 73_856_093) ^ Math.imul(y, 19_349_663) ^ seed) >>> 0
  value = Math.imul(value ^ (value >>> 16), 2_246_822_507) >>> 0
  return (value ^ (value >>> 13)) >>> 0
}

function textSeed(text: string) {
  let seed = 2_166_136_261
  for (const character of text) {
    seed = Math.imul(seed ^ character.charCodeAt(0), 16_777_619) >>> 0
  }
  return seed
}

function drawPixelTitle(canvas: HTMLCanvasElement, text: string, options: TitlePaintOptions) {
  const maskCanvas = document.createElement('canvas')
  const measureContext = maskCanvas.getContext('2d', { willReadFrequently: true })
  if (!measureContext) return

  const font = `bold ${options.fontSize}px Stardew, monospace`
  measureContext.font = font
  const characters = Array.from(text || ' ')
  const metrics = measureContext.measureText(text || ' ')
  const ascent = Math.ceil(metrics.actualBoundingBoxAscent || options.fontSize)
  const descent = Math.ceil(metrics.actualBoundingBoxDescent || options.fontSize * 0.25)
  const characterWidths = characters.map((character) => Math.ceil(measureContext.measureText(character).width))
  const glyphWidth = characterWidths.reduce((total, characterWidth) => total + characterWidth, 0)
  const width = glyphWidth + options.letterSpacing * (characters.length - 1) + TITLE_PADDING * 2
  const shadowHeight = options.showShadow ? TITLE_SHADOW_OFFSET + TITLE_SHADOW_LENGTH : 0
  const height = ascent + descent + TITLE_PADDING * 2 + shadowHeight

  maskCanvas.width = width
  maskCanvas.height = height
  const maskContext = maskCanvas.getContext('2d', { willReadFrequently: true })
  if (!maskContext) return

  maskContext.imageSmoothingEnabled = false
  maskContext.font = font
  maskContext.textBaseline = 'alphabetic'
  maskContext.fillStyle = '#fff'
  let cursorX = TITLE_PADDING
  for (let index = 0; index < characters.length; index += 1) {
    maskContext.fillText(characters[index], cursorX, TITLE_PADDING + ascent)
    cursorX += characterWidths[index] + options.letterSpacing
  }

  const maskImage = maskContext.getImageData(0, 0, width, height)
  if (!maskImage) return
  const mask = maskImage.data
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) return
  context.imageSmoothingEnabled = false

  const image = context.createImageData(width, height)
  if (!image) return
  const hasInk = (x: number, y: number) =>
    x >= 0 && y >= 0 && x < width && y < height && mask[(y * width + x) * 4 + 3] > 31
  const seed = textSeed(text)
  const palette = deriveTitlePalette(resolveTitleFill(options.color))

  if (options.showShadow) {
    // Layer 1: a 4px cast shadow beginning 5px beneath each letter. It uses
    // the requested 60% opacity and remains a hard sprite offset rather than a blur.
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (!hasInk(x, y)) continue
        for (let length = 0; length < TITLE_SHADOW_LENGTH; length += 1) {
          setPixel(image.data, width, x, y + TITLE_SHADOW_OFFSET + length, TITLE_SHADOW)
        }
      }
    }
  }

  // Layer 2: discrete square offsets form the 3px outline. Uneven, occasional
  // one-pixel teeth extend it to 4px, then a few warm-brown chips fragment the
  // surface: the silhouette stays legible but its edge stops reading as a
  // mechanically perfect vector ring.
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!hasInk(x, y)) continue
      for (const [offsetX, offsetY] of TITLE_OUTLINE_OFFSETS) {
        setPixel(image.data, width, x + offsetX, y + offsetY, TITLE_OUTLINE)
      }

      const isEdgePixel = !hasInk(x - 1, y) || !hasInk(x + 1, y) || !hasInk(x, y - 1) || !hasInk(x, y + 1)
      if (isEdgePixel && pixelNoise(x, y, seed) % 7 === 0) {
        const [toothX, toothY] = TITLE_OUTLINE_TEETH[pixelNoise(x, y, seed ^ 0x9e37_79b9) % TITLE_OUTLINE_TEETH.length]
        setPixel(image.data, width, x + toothX, y + toothY, TITLE_OUTLINE)
      }
    }
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4
      const isOutline = image.data[index] === TITLE_OUTLINE[0] && image.data[index + 1] === TITLE_OUTLINE[1]
      if (isOutline && pixelNoise(x, y, seed ^ 0x85eb_ca6b) % 29 === 0) {
        setPixel(image.data, width, x, y, TITLE_OUTLINE_CHIP)
      }
    }
  }

  // Layers 3 and 4: the 2px inside edge facing the upper-right is lit. This
  // makes the 45° highlight visible across every glyph, rather than relying on
  // a single CSS gradient stripe that can miss the text completely.
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!hasInk(x, y)) continue
      const receivesTopRightLight = !hasInk(x + 1, y - 1) || !hasInk(x + 2, y - 2)
      const noise = pixelNoise(x, y, seed ^ 0xc2b2_ae35) % 97
      const fill = receivesTopRightLight
        ? palette.highlight
        : noise < 3
          ? palette.fleckLight
          : noise < 5
            ? palette.fleckDark
            : palette.fill
      setPixel(image.data, width, x, y, fill)
    }
  }

  context.putImageData(image, 0, 0)
}

/** Layered canvas title with a hard pixel outline and directional in-glyph light. */
function StarTitle({
  level = 2,
  children,
  className,
  color,
  fontSize,
  letterSpacing,
  showShadow = true,
  style,
  ...rest
}: StarTitleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const text = getTitleText(children)
  const Heading = `h${level}` as keyof HTMLElementTagNameMap
  const resolvedFontSize = normalizePositive(fontSize, TITLE_FONT_SIZE)
  const resolvedLetterSpacing = normalizeSpacing(letterSpacing)

  useEffect(() => {
    let cancelled = false
    const paint = () => {
      if (!cancelled && canvasRef.current) {
        drawPixelTitle(canvasRef.current, text, {
          color,
          fontSize: resolvedFontSize,
          letterSpacing: resolvedLetterSpacing,
          showShadow,
        })
      }
    }

    paint()
    // Repaint after the bundled bitmap font replaces the initial fallback font.
    void document.fonts?.ready?.then(paint)
    return () => { cancelled = true }
  }, [color, resolvedFontSize, resolvedLetterSpacing, showShadow, text])

  return createElement(
    Heading,
    {
      ...rest,
      className: classNames(styles['star-title'], className),
      style: { ...style, fontSize: `${resolvedFontSize}px` },
    },
    <canvas ref={canvasRef} className={styles['star-title__canvas']} aria-hidden="true" data-testid="star-title-canvas" />,
    <span className={styles['star-title__accessible']}>{text}</span>,
  )
}

export { StarTitle }
export default StarTitle
