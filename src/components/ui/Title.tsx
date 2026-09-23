import { createElement, useEffect, useRef, type HTMLAttributes } from 'react'
import { classNames } from '../../utils/classNames'
import styles from './Title.module.scss'

export type StarTitleLevel = 1 | 2 | 3 | 4 | 5 | 6

export interface StarTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Heading level used for document semantics. Defaults to h2. */
  level?: StarTitleLevel
  /** Plain text to draw into the pixel canvas. */
  children?: string | number
}

const TITLE_FONT_SIZE = 50
const TITLE_FONT = `bold ${TITLE_FONT_SIZE}px Stardew, monospace`
const TITLE_PADDING = 6
const TITLE_SHADOW_OFFSET = 5
const TITLE_SHADOW_LENGTH = 4
const TITLE_LETTER_SPACING = 8
const TITLE_OUTLINE_OFFSETS: readonly (readonly [number, number])[] = [
  [-3, 0], [3, 0], [0, -3], [0, 3], [-2, -2], [2, -2], [-2, 2], [2, 2],
  [-3, -1], [3, -1], [-3, 1], [3, 1], [-1, -3], [1, -3], [-1, 3], [1, 3],
]
const TITLE_OUTLINE_TEETH: readonly (readonly [number, number])[] = [
  [-4, -1], [-4, 1], [4, -1], [4, 1], [-1, -4], [1, -4], [-1, 4], [1, 4],
]

const TITLE_FILL = [206, 159, 0] as const
const TITLE_HIGHLIGHT = [251, 241, 58] as const
const TITLE_OUTLINE = [73, 50, 19] as const
const TITLE_OUTLINE_CHIP = [101, 70, 27] as const
const TITLE_FLECK_LIGHT = [224, 181, 17] as const
const TITLE_FLECK_DARK = [178, 126, 0] as const
const TITLE_SHADOW = [41, 58, 44, 179] as const

function getTitleText(children: StarTitleProps['children']): string {
  if (typeof children === 'string' || typeof children === 'number') return String(children)
  return ''
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

function drawPixelTitle(canvas: HTMLCanvasElement, text: string) {
  const maskCanvas = document.createElement('canvas')
  const measureContext = maskCanvas.getContext('2d', { willReadFrequently: true })
  if (!measureContext) return

  measureContext.font = TITLE_FONT
  const characters = Array.from(text || ' ')
  const metrics = measureContext.measureText(text || ' ')
  const ascent = Math.ceil(metrics.actualBoundingBoxAscent || TITLE_FONT_SIZE)
  const descent = Math.ceil(metrics.actualBoundingBoxDescent || TITLE_FONT_SIZE * 0.25)
  const characterWidths = characters.map((character) => Math.ceil(measureContext.measureText(character).width))
  const glyphWidth = characterWidths.reduce((total, characterWidth) => total + characterWidth, 0)
  const width = glyphWidth + TITLE_LETTER_SPACING * (characters.length - 1) + TITLE_PADDING * 2
  const height = ascent + descent + TITLE_PADDING * 2 + TITLE_SHADOW_OFFSET + TITLE_SHADOW_LENGTH

  maskCanvas.width = width
  maskCanvas.height = height
  const maskContext = maskCanvas.getContext('2d', { willReadFrequently: true })
  if (!maskContext) return

  maskContext.imageSmoothingEnabled = false
  maskContext.font = TITLE_FONT
  maskContext.textBaseline = 'alphabetic'
  maskContext.fillStyle = '#fff'
  let cursorX = TITLE_PADDING
  for (let index = 0; index < characters.length; index += 1) {
    maskContext.fillText(characters[index], cursorX, TITLE_PADDING + ascent)
    cursorX += characterWidths[index] + TITLE_LETTER_SPACING
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

  // Layer 1: a 4px cast shadow beginning 5px beneath each letter. The offset
  // separates it from the 3–4px outline; the repeated hard pixels preserve the
  // deliberate game-sprite silhouette instead of blurring it into a glow.
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!hasInk(x, y)) continue
      for (let length = 0; length < TITLE_SHADOW_LENGTH; length += 1) {
        setPixel(image.data, width, x, y + TITLE_SHADOW_OFFSET + length, TITLE_SHADOW)
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
        ? TITLE_HIGHLIGHT
        : noise < 3
          ? TITLE_FLECK_LIGHT
          : noise < 5
            ? TITLE_FLECK_DARK
            : TITLE_FILL
      setPixel(image.data, width, x, y, fill)
    }
  }

  context.putImageData(image, 0, 0)
}

/** Layered canvas title with a hard pixel outline and directional in-glyph light. */
function StarTitle({ level = 2, children, className, ...rest }: StarTitleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const text = getTitleText(children)
  const Heading = `h${level}` as keyof HTMLElementTagNameMap

  useEffect(() => {
    let cancelled = false
    const paint = () => {
      if (!cancelled && canvasRef.current) drawPixelTitle(canvasRef.current, text)
    }

    paint()
    // Repaint after the bundled bitmap font replaces the initial fallback font.
    void document.fonts?.ready?.then(paint)
    return () => { cancelled = true }
  }, [text])

  return createElement(
    Heading,
    { ...rest, className: classNames(styles['star-title'], className) },
    <canvas ref={canvasRef} className={styles['star-title__canvas']} aria-hidden="true" data-testid="star-title-canvas" />,
    <span className={styles['star-title__accessible']}>{text}</span>,
  )
}

export { StarTitle }
export default StarTitle
