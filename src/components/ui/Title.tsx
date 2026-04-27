import {
  type CSSProperties,
  type ForwardedRef,
  type HTMLAttributes,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react'
import { classNames } from '../../utils/classNames'
import styles from './Title.module.scss'

export type TitleSize = 'small' | 'medium' | 'large'
export type TitleAlign = 'left' | 'center'
export type TitleTag = 'div' | 'h1' | 'h2' | 'h3' | 'p'

export interface StarTitleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children: string
  size?: TitleSize
  align?: TitleAlign
  as?: TitleTag
  backgroundSrc?: string
}

type LoadedImage = {
  element: HTMLImageElement
  width: number
  height: number
}

type TitlePreset = {
  fontSize: number
  lineGap: number
  paddingX: number
  paddingY: number
  minWidth: number
  maxWidth: number
  minHeight: number
}

type TitleLayout = {
  lines: string[]
  fontSize: number
  lineGap: number
  paddingX: number
  paddingY: number
  width: number
  height: number
  lineHeight: number
}

const IMAGE_CACHE = new Map<string, Promise<LoadedImage>>()
const measureCanvas = document.createElement('canvas')
const measureContext = measureCanvas.getContext('2d')

const TITLE_PRESETS: Record<TitleSize, TitlePreset> = {
  small: { fontSize: 34, lineGap: 10, paddingX: 122, paddingY: 54, minWidth: 420, maxWidth: 560, minHeight: 142 },
  medium: { fontSize: 48, lineGap: 12, paddingX: 152, paddingY: 62, minWidth: 520, maxWidth: 760, minHeight: 178 },
  large: { fontSize: 62, lineGap: 14, paddingX: 188, paddingY: 74, minWidth: 620, maxWidth: 980, minHeight: 228 },
}

const setRefValue = <T,>(ref: ForwardedRef<T>, value: T) => {
  if (typeof ref === 'function') {
    ref(value)
    return
  }

  if (ref) {
    ref.current = value
  }
}

const loadImage = (src: string) => {
  const cached = IMAGE_CACHE.get(src)
  if (cached) return cached

  const loading = new Promise<LoadedImage>((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve({ element: image, width: image.naturalWidth, height: image.naturalHeight })
    image.onerror = () => {
      IMAGE_CACHE.delete(src)
      reject(new Error(`Failed to load title background: ${src}`))
    }
    image.src = src
  })

  IMAGE_CACHE.set(src, loading)
  return loading
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

const normalizeLines = (content: string) =>
  content
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

const getFont = (fontSize: number) => `700 ${fontSize}px Stardew`

const measureLines = (lines: string[], fontSize: number) => {
  if (!measureContext) {
    return Math.max(...lines.map((line) => line.length * fontSize), 0)
  }

  measureContext.font = getFont(fontSize)
  return Math.max(...lines.map((line) => measureContext.measureText(line).width), 0)
}

const getTitleLayout = (content: string, size: TitleSize): TitleLayout => {
  const preset = TITLE_PRESETS[size]
  const lines = normalizeLines(content)
  const safeLines = lines.length > 0 ? lines : ['']

  let fontSize = preset.fontSize
  let maxTextWidth = measureLines(safeLines, fontSize)
  let width = maxTextWidth + preset.paddingX * 2

  if (width > preset.maxWidth) {
    const availableTextWidth = preset.maxWidth - preset.paddingX * 2
    const scale = availableTextWidth > 0 ? availableTextWidth / Math.max(maxTextWidth, 1) : 1
    fontSize = Math.max(Math.round(fontSize * scale), Math.round(preset.fontSize * 0.72))
    maxTextWidth = measureLines(safeLines, fontSize)
    width = maxTextWidth + preset.paddingX * 2
  }

  width = clamp(Math.round(width), preset.minWidth, preset.maxWidth)

  const lineHeight = Math.round(fontSize * 0.88)
  const textHeight = safeLines.length * lineHeight + Math.max(0, safeLines.length - 1) * preset.lineGap
  const height = Math.max(preset.minHeight, Math.round(textHeight + preset.paddingY * 2))

  return {
    lines: safeLines,
    fontSize,
    lineGap: preset.lineGap,
    paddingX: preset.paddingX,
    paddingY: preset.paddingY,
    width,
    height,
    lineHeight,
  }
}

const StarTitle = forwardRef<HTMLDivElement, StarTitleProps>(
  (
    { children, size = 'medium', align = 'center', as = 'h2', backgroundSrc = '/titleBg.png', className, style, ...rest },
    forwardedRef
  ) => {
    const hostRef = useRef<HTMLDivElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const imageRef = useRef<LoadedImage | null>(null)
    const HeadingTag = as
    const layout = useMemo(() => getTitleLayout(children, size), [children, size])

    const setHostRef = useCallback(
      (node: HTMLDivElement | null) => {
        hostRef.current = node
        setRefValue(forwardedRef, node)
      },
      [forwardedRef]
    )

    const draw = useCallback(() => {
      const host = hostRef.current
      const canvas = canvasRef.current
      const image = imageRef.current

      if (!host || !canvas || !image) return

      const width = Math.round(host.clientWidth)
      const height = Math.round(host.clientHeight)
      if (width <= 0 || height <= 0) return

      const dpr = window.devicePixelRatio || 1
      const targetWidth = Math.max(1, Math.round(width * dpr))
      const targetHeight = Math.max(1, Math.round(height * dpr))

      host.style.setProperty('--title-scale', `${width / layout.width}`)

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth
        canvas.height = targetHeight
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, targetWidth, targetHeight)
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(image.element, 0, 0, targetWidth, targetHeight)
    }, [layout.width])

    useEffect(() => {
      let cancelled = false
      imageRef.current = null

      loadImage(backgroundSrc)
        .then((loaded) => {
          if (cancelled) return
          imageRef.current = loaded
          draw()
        })
        .catch(() => {
          if (!cancelled) imageRef.current = null
        })

      return () => {
        cancelled = true
      }
    }, [backgroundSrc, draw])

    useEffect(() => {
      draw()
    }, [draw])

    useEffect(() => {
      let cancelled = false
      document.fonts?.ready.then(() => {
        if (!cancelled) draw()
      })

      return () => {
        cancelled = true
      }
    }, [draw])

    useEffect(() => {
      const host = hostRef.current
      if (!host) return

      const resizeObserver = new ResizeObserver(() => {
        draw()
      })

      resizeObserver.observe(host)
      window.addEventListener('resize', draw)

      return () => {
        resizeObserver.disconnect()
        window.removeEventListener('resize', draw)
      }
    }, [draw])

    const titleText = useMemo(() => normalizeLines(children).join('\n'), [children])
    const titleStyle = {
      ...style,
      width: `${layout.width}px`,
      maxWidth: '100%',
      aspectRatio: `${layout.width} / ${layout.height}`,
      '--title-scale': 1,
      '--title-font-size': layout.fontSize,
      '--title-line-height': layout.lineHeight,
      '--title-padding-x': layout.paddingX,
      '--title-padding-y': layout.paddingY,
      '--title-text-align': align,
    } as CSSProperties

    return (
      <div
        {...rest}
        ref={setHostRef}
        className={classNames(styles['title-board'], styles[`title-board--${size}`], styles[`title-board--${align}`], className)}
        style={titleStyle}
      >
        <canvas ref={canvasRef} className={styles['title-board__canvas']} aria-hidden />
        <div className={styles['title-board__content']}>
          <HeadingTag className={styles['title-board__heading']}>
            <span className={styles['title-board__shadow']} aria-hidden>
              {titleText}
            </span>
            <span className={styles['title-board__stroke']} aria-hidden>
              {titleText}
            </span>
            <span className={styles['title-board__fill']}>{titleText}</span>
          </HeadingTag>
        </div>
      </div>
    )
  }
)

StarTitle.displayName = 'StarTitle'

export default StarTitle
