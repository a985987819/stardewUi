import { forwardRef, useEffect, useMemo, useRef, type ButtonHTMLAttributes } from 'react'
import { useNineSliceBackground } from '../../hooks/useNineSliceBackground'
import './NineSliceButton.css'

type NineSliceButtonVariant =
  | 'default'
  | 'primary'
  | 'warning'
  | 'danger'
  | 'disabled'
  | 'dashed'
  | 'text'
  | 'link'
type NineSliceButtonSize = 'small' | 'medium' | 'large'

export type NineSliceButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: NineSliceButtonVariant
  size?: NineSliceButtonSize
  block?: boolean
  backgroundSrc?: string
  backgroundInsets?: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

const cls = (...classNames: Array<string | false | undefined>) => classNames.filter(Boolean).join(' ')

const DEFAULT_INSETS = { top: 8, right: 8, bottom: 8, left: 8 }

const COLOR_MAP: Record<Exclude<NineSliceButtonVariant, 'dashed' | 'text' | 'link'>, { bg: string; text: string }> = {
  default: { bg: '#F5E6CC', text: '#3A2E39' },
  primary: { bg: '#7A4E2D', text: '#FFE8B6' },
  warning: { bg: '#C28A45', text: '#FFF2D5' },
  danger: { bg: '#C62828', text: '#FFF2D5' },
  disabled: { bg: '#B0A999', text: '#E0D9C6' },
}

const drawDashedBorder = (ctx: CanvasRenderingContext2D, width: number, height: number, dpr: number) => {
  const lineWidth = Math.max(1, Math.round(dpr))
  const dashLength = 6 * dpr
  const gapLength = 4 * dpr

  ctx.clearRect(0, 0, width, height)
  ctx.strokeStyle = '#6f5135'
  ctx.lineWidth = lineWidth
  ctx.setLineDash([dashLength, gapLength])
  ctx.strokeRect(lineWidth / 2, lineWidth / 2, width - lineWidth, height - lineWidth)
}

const NineSliceButton = forwardRef<HTMLButtonElement, NineSliceButtonProps>(
  (
    {
      variant = 'default',
      size = 'medium',
      block = false,
      backgroundSrc = '/btnImg.png',
      backgroundInsets = DEFAULT_INSETS,
      className,
      children,
      disabled,
      ...rest
    },
    ref
  ) => {
    const effectiveVariant =
      disabled && variant !== 'text' && variant !== 'link' && variant !== 'dashed' ? 'disabled' : variant

    const imageVariant =
      effectiveVariant === 'default' ||
      effectiveVariant === 'primary' ||
      effectiveVariant === 'warning' ||
      effectiveVariant === 'danger' ||
      effectiveVariant === 'disabled'

    const dashedVariant = effectiveVariant === 'dashed'

    const tone = useMemo(() => {
      if (
        effectiveVariant === 'default' ||
        effectiveVariant === 'primary' ||
        effectiveVariant === 'warning' ||
        effectiveVariant === 'danger' ||
        effectiveVariant === 'disabled'
      ) {
        return COLOR_MAP[effectiveVariant]
      }
      return null
    }, [effectiveVariant])

    const { hostRef, canvasProps } = useNineSliceBackground({
      src: backgroundSrc,
      insets: backgroundInsets,
      className: 'nine-slice-button__canvas',
      zIndex: 0,
      imageSmoothingEnabled: false,
      backgroundColor: tone?.bg,
    })

    const dashedCanvasRef = useRef<HTMLCanvasElement | null>(null)

    useEffect(() => {
      if (!dashedVariant) {
        return
      }

      const canvas = dashedCanvasRef.current
      if (!canvas) {
        return
      }

      const redraw = () => {
        const width = Math.round(canvas.clientWidth)
        const height = Math.round(canvas.clientHeight)
        if (width <= 0 || height <= 0) {
          return
        }

        const dpr = window.devicePixelRatio || 1
        const targetWidth = Math.max(1, Math.round(width * dpr))
        const targetHeight = Math.max(1, Math.round(height * dpr))

        if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
          canvas.width = targetWidth
          canvas.height = targetHeight
          canvas.style.width = `${width}px`
          canvas.style.height = `${height}px`
        }

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          return
        }
        drawDashedBorder(ctx, targetWidth, targetHeight, dpr)
      }

      redraw()
      const observer = new ResizeObserver(redraw)
      observer.observe(canvas)
      window.addEventListener('resize', redraw)

      return () => {
        observer.disconnect()
        window.removeEventListener('resize', redraw)
      }
    }, [dashedVariant])

    return (
      <button
        {...rest}
        ref={ref}
        disabled={disabled}
        className={cls(
          'nine-slice-button',
          `nine-slice-button--${effectiveVariant}`,
          `nine-slice-button--${size}`,
          block && 'nine-slice-button--block',
          className
        )}
      >
        {imageVariant ? (
          <span className="nine-slice-button__bg" ref={hostRef as (node: HTMLSpanElement | null) => void}>
            <canvas {...canvasProps} />
          </span>
        ) : null}
        {dashedVariant ? (
          <span className="nine-slice-button__bg">
            <canvas ref={dashedCanvasRef} className="nine-slice-button__canvas" aria-hidden />
          </span>
        ) : null}
        <span className="nine-slice-button__content">{children}</span>
      </button>
    )
  }
)

NineSliceButton.displayName = 'NineSliceButton'

export default NineSliceButton
