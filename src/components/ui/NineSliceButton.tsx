import { forwardRef, useEffect, useMemo, useRef, type ButtonHTMLAttributes, type CSSProperties } from 'react'
import { useNineSliceBackground } from '../../hooks/useNineSliceBackground'
import StarLoading from './Loading'
import styles from './NineSliceButton.module.scss'

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
export type NineSliceButtonTheme = 'spring' | 'summer' | 'autumn' | 'winter'

type ButtonTone = {
  bg: string
  text: string
}

type ImageButtonVariant = Exclude<NineSliceButtonVariant, 'dashed' | 'text' | 'link'>
type ButtonColorMap = Record<ImageButtonVariant, ButtonTone>

export type StarNineSliceButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: NineSliceButtonVariant
  size?: NineSliceButtonSize
  block?: boolean
  theme?: NineSliceButtonTheme
  loading?: boolean
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

const DEFAULT_COLOR_MAP: ButtonColorMap = {
  default: { bg: '#F5E6CC', text: '#3A2E39' },
  primary: { bg: '#7A4E2D', text: '#FFE8B6' },
  warning: { bg: '#C28A45', text: '#FFF2D5' },
  danger: { bg: '#C62828', text: '#FFF2D5' },
  disabled: { bg: '#B0A999', text: '#E0D9C6' },
}

const SEASONAL_DEFAULT_TONES: Record<NineSliceButtonTheme, ButtonTone> = {
  spring: { bg: '#A8D5BA', text: '#2F5233' },
  summer: { bg: '#4DA6FF', text: '#F9F9F9' },
  autumn: { bg: '#D97B3E', text: '#FFF2D5' },
  winter: { bg: '#6BAED6', text: '#2E4057' },
}

const drawDashedBorder = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dpr: number,
  borderColor: string
) => {
  const lineWidth = Math.max(1, Math.round(dpr))
  const dashLength = 6 * dpr
  const gapLength = 4 * dpr

  ctx.clearRect(0, 0, width, height)
  ctx.strokeStyle = borderColor
  ctx.lineWidth = lineWidth
  ctx.setLineDash([dashLength, gapLength])
  ctx.strokeRect(lineWidth / 2, lineWidth / 2, width - lineWidth, height - lineWidth)
}

const StarNineSliceButton = forwardRef<HTMLButtonElement, StarNineSliceButtonProps>(
  (
    {
      variant = 'default',
      size = 'medium',
      block = false,
      theme,
      loading = false,
      backgroundSrc = '/btnImg.png',
      backgroundInsets = DEFAULT_INSETS,
      className,
      children,
      disabled,
      style,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading
    const effectiveVariant =
      isDisabled && variant !== 'text' && variant !== 'link' && variant !== 'dashed' ? 'disabled' : variant
    const loadingSize = size === 'small' ? 14 : size === 'large' ? 18 : 16

    const seasonalDefaultTone = useMemo(
      () => (theme && effectiveVariant === 'default' ? SEASONAL_DEFAULT_TONES[theme] : null),
      [effectiveVariant, theme]
    )

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
        return effectiveVariant === 'default' && seasonalDefaultTone
          ? seasonalDefaultTone
          : DEFAULT_COLOR_MAP[effectiveVariant]
      }
      return null
    }, [effectiveVariant, seasonalDefaultTone])

    const buttonStyle = useMemo(() => {
      if (!seasonalDefaultTone) {
        return style
      }

      return {
        ...style,
        '--nine-slice-button-default-color': seasonalDefaultTone.text,
      } as CSSProperties
    }, [seasonalDefaultTone, style])

    const { hostRef, canvasProps } = useNineSliceBackground({
      src: backgroundSrc,
      insets: backgroundInsets,
      className: styles['nine-slice-button__canvas'],
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
        drawDashedBorder(ctx, targetWidth, targetHeight, dpr, DEFAULT_COLOR_MAP.default.text)
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
        disabled={isDisabled}
        aria-busy={loading || undefined}
        style={buttonStyle}
        className={cls(
          styles['nine-slice-button'],
          styles[`nine-slice-button--${effectiveVariant}`],
          seasonalDefaultTone ? styles[`nine-slice-button--theme-${theme}`] : undefined,
          styles[`nine-slice-button--${size}`],
          block ? styles['nine-slice-button--block'] : undefined,
          className
        )}
      >
        {imageVariant ? (
          <span className={styles['nine-slice-button__bg']} ref={hostRef as (node: HTMLSpanElement | null) => void}>
            <canvas {...canvasProps} />
          </span>
        ) : null}
        {dashedVariant ? (
          <span className={styles['nine-slice-button__bg']}>
            <canvas ref={dashedCanvasRef} className={styles['nine-slice-button__canvas']} aria-hidden />
          </span>
        ) : null}
        <span className={styles['nine-slice-button__content']}>
          {loading ? (
            <StarLoading active text="" size={loadingSize} className={styles['nine-slice-button__loading']} aria-hidden />
          ) : null}
          {children !== undefined && children !== null ? <span className={styles['nine-slice-button__label']}>{children}</span> : null}
        </span>
      </button>
    )
  }
)

StarNineSliceButton.displayName = 'StarNineSliceButton'

export default StarNineSliceButton
