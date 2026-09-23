import { useEffect, useRef, type CanvasHTMLAttributes } from 'react'
import { classNames } from '../../utils/classNames'
import styles from './PixelText.module.scss'

export type PixelTextRenderMode = 'pixelated' | 'source'

export interface StarPixelTextProps extends Omit<CanvasHTMLAttributes<HTMLCanvasElement>, 'children'> {
  /** Text to rasterize. Takes precedence over children when both are supplied. */
  text?: string | number
  /** Plain text that is rasterized when `text` is not supplied. */
  children?: string | number
  /** Size of each visible square pixel in CSS pixels. Defaults to 8. */
  pixelSize?: number
  /** Font size used by the source canvas before it is reduced. Defaults to 120. */
  fontSize?: number
  /** CSS font family used to draw the source text. Defaults to an emoji-safe stack. */
  fontFamily?: string
  /** Extra empty space around the source glyph in CSS pixels. Defaults to 12. */
  padding?: number
  /** Draw the source Canvas without downsampling, or the default chunky pixel result. */
  renderMode?: PixelTextRenderMode
}

const DEFAULT_FONT_FAMILY = "'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif"

function positiveNumber(value: number | undefined, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.max(1, Math.round(value)) : fallback
}

function getText(text: StarPixelTextProps['text'], children: StarPixelTextProps['children']) {
  const value = text ?? children ?? ''
  return String(value)
}

/**
 * Rasterizes text through a tiny intermediary canvas, then scales it up with
 * smoothing disabled. `source` retains that exact same canvas geometry without
 * sampling, so a before/after reveal can stack both layers pixel-perfectly.
 */
function drawPixelText(
  canvas: HTMLCanvasElement,
  text: string,
  { pixelSize, fontSize, fontFamily, padding, renderMode }: Required<Pick<StarPixelTextProps, 'pixelSize' | 'fontSize' | 'fontFamily' | 'padding' | 'renderMode'>>,
) {
  const source = document.createElement('canvas')
  const sourceContext = source.getContext('2d')
  if (!sourceContext) return

  const font = `${fontSize}px ${fontFamily}`
  sourceContext.font = font
  sourceContext.textBaseline = 'alphabetic'
  const metrics = sourceContext.measureText(text || ' ')
  const left = Math.ceil(Math.abs(metrics.actualBoundingBoxLeft))
  const right = Math.ceil(metrics.actualBoundingBoxRight || metrics.width)
  const ascent = Math.ceil(metrics.actualBoundingBoxAscent || fontSize * 0.8)
  const descent = Math.ceil(metrics.actualBoundingBoxDescent || fontSize * 0.24)
  const sourceWidth = Math.max(1, left + right + padding * 2)
  const sourceHeight = Math.max(1, ascent + descent + padding * 2)

  source.width = sourceWidth
  source.height = sourceHeight
  sourceContext.imageSmoothingEnabled = false
  sourceContext.font = font
  sourceContext.textBaseline = 'alphabetic'
  sourceContext.fillText(text, padding + left, padding + ascent)

  const tiny = document.createElement('canvas')
  tiny.width = Math.max(1, Math.ceil(sourceWidth / pixelSize))
  tiny.height = Math.max(1, Math.ceil(sourceHeight / pixelSize))
  const tinyContext = tiny.getContext('2d')
  if (!tinyContext) return
  tinyContext.imageSmoothingEnabled = false
  tinyContext.clearRect(0, 0, tiny.width, tiny.height)
  tinyContext.drawImage(source, 0, 0, tiny.width, tiny.height)

  canvas.width = tiny.width * pixelSize
  canvas.height = tiny.height * pixelSize
  const outputContext = canvas.getContext('2d')
  if (!outputContext) return
  outputContext.imageSmoothingEnabled = false
  outputContext.clearRect(0, 0, canvas.width, canvas.height)
  if (renderMode === 'source') {
    outputContext.drawImage(source, 0, 0)
    return
  }
  outputContext.drawImage(tiny, 0, 0, canvas.width, canvas.height)
}

/** Canvas-powered chunky-pixel text renderer, especially useful for emoji. */
function StarPixelText({
  text,
  children,
  pixelSize = 8,
  fontSize = 120,
  fontFamily = DEFAULT_FONT_FAMILY,
  padding = 12,
  renderMode = 'pixelated',
  className,
  style,
  'aria-label': ariaLabel,
  ...rest
}: StarPixelTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const resolvedText = getText(text, children)
  const resolvedPixelSize = positiveNumber(pixelSize, 8)
  const resolvedFontSize = positiveNumber(fontSize, 120)
  const resolvedPadding = positiveNumber(padding, 12)

  useEffect(() => {
    let cancelled = false
    const paint = () => {
      if (!cancelled && canvasRef.current) {
        drawPixelText(canvasRef.current, resolvedText, {
          pixelSize: resolvedPixelSize,
          fontSize: resolvedFontSize,
          fontFamily,
          padding: resolvedPadding,
          renderMode,
        })
      }
    }

    paint()
    // Emoji/font glyphs can become available after initial paint in the browser.
    void document.fonts?.ready?.then(paint)
    return () => { cancelled = true }
  }, [fontFamily, renderMode, resolvedFontSize, resolvedPadding, resolvedPixelSize, resolvedText])

  return (
    <canvas
      {...rest}
      ref={canvasRef}
      className={classNames(styles['star-pixel-text'], className)}
      style={style}
      role="img"
      aria-label={ariaLabel ?? resolvedText}
      data-testid="star-pixel-text-canvas"
    />
  )
}

export { StarPixelText }
export default StarPixelText
