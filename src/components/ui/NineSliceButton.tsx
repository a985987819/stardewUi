import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import { useNineSliceBackground } from '../../hooks/useNineSliceBackground'
import {
  drawSeasonalButtonBackground,
  getSeasonalButtonTextColor,
  loadSeasonalButtonImage,
  type SeasonalButtonVisualState,
} from '../../utils/seasonalButtonCanvas'
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
  appearance?: 'regular' | 'classical'
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
const DEFAULT_BUTTON_IMAGE_SRC = '/defaultBtn.png'

const DEFAULT_COLOR_MAP: ButtonColorMap = {
  default: { bg: '#F5E6CC', text: '#3A2E39' },
  primary: { bg: '#7A4E2D', text: '#FFE8B6' },
  warning: { bg: '#C28A45', text: '#FFF2D5' },
  danger: { bg: '#C62828', text: '#FFF2D5' },
  disabled: { bg: '#B0A999', text: '#E0D9C6' },
}

const PLAIN_DEFAULT_TEXT_COLORS = {
  normal: '#5D4037',
  hover: '#3E2723',
  active: '#2E1B15',
  disabled: '#B0BEC5',
} as const

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
      appearance = 'regular',
      loading = false,
      backgroundSrc,
      backgroundInsets = DEFAULT_INSETS,
      className,
      children,
      disabled,
      style,
      onBlur,
      onKeyDown,
      onKeyUp,
      onPointerCancel,
      onPointerDown,
      onPointerEnter,
      onPointerLeave,
      onPointerUp,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading
    const effectiveVariant =
      isDisabled && variant !== 'text' && variant !== 'link' && variant !== 'dashed' ? 'disabled' : variant
    const renderedVariant = variant === 'default' ? 'default' : effectiveVariant
    const loadingSize = size === 'small' ? 14 : size === 'large' ? 18 : 16

    const usesSeasonalBackground = Boolean(theme) && variant === 'default'
    const usesRegularBackground = !usesSeasonalBackground && appearance !== 'classical' && !backgroundSrc
    const usesPlainDefaultBackground = usesRegularBackground
    const resolvedBackgroundSrc = backgroundSrc ?? '/btnImg.png'
    const [isHovered, setIsHovered] = useState(false)
    const [isPressed, setIsPressed] = useState(false)
    const [seasonalImageVersion, setSeasonalImageVersion] = useState(0)
    const seasonalCanvasRef = useRef<HTMLCanvasElement | null>(null)
    const seasonalImageRef = useRef<Awaited<ReturnType<typeof loadSeasonalButtonImage>> | null>(null)

    const seasonalState: SeasonalButtonVisualState = isDisabled
      ? 'disabled'
      : isPressed
        ? 'active'
        : isHovered
          ? 'hover'
          : 'normal'

    const imageVariant =
      !usesSeasonalBackground &&
      !usesRegularBackground &&
      (effectiveVariant === 'default' ||
        effectiveVariant === 'primary' ||
        effectiveVariant === 'warning' ||
        effectiveVariant === 'danger' ||
        effectiveVariant === 'disabled')

    const dashedVariant = effectiveVariant === 'dashed'

    const tone = useMemo(() => {
      if (
        effectiveVariant === 'default' ||
        effectiveVariant === 'primary' ||
        effectiveVariant === 'warning' ||
        effectiveVariant === 'danger' ||
        effectiveVariant === 'disabled'
      ) {
        return DEFAULT_COLOR_MAP[effectiveVariant]
      }
      return null
    }, [effectiveVariant])

    const plainDefaultColor = useMemo(() => {
      if (!usesPlainDefaultBackground) {
        return null
      }

      if (isDisabled) {
        return PLAIN_DEFAULT_TEXT_COLORS.disabled
      }

      if (isPressed) {
        return PLAIN_DEFAULT_TEXT_COLORS.active
      }

      if (isHovered) {
        return PLAIN_DEFAULT_TEXT_COLORS.hover
      }

      return PLAIN_DEFAULT_TEXT_COLORS.normal
    }, [isDisabled, isHovered, isPressed, usesPlainDefaultBackground])

    const buttonStyle = useMemo(() => {
      if (usesSeasonalBackground && theme) {
        return {
          ...style,
          '--nine-slice-button-default-color': getSeasonalButtonTextColor(theme, seasonalState),
          '--nine-slice-button-disabled-color': getSeasonalButtonTextColor(theme, seasonalState),
          fontWeight: seasonalState === 'active' ? 700 : style?.fontWeight,
        } as CSSProperties
      }

      if (usesPlainDefaultBackground && plainDefaultColor) {
        return {
          ...style,
          '--nine-slice-button-default-color': plainDefaultColor,
          '--nine-slice-button-default-disabled-overlay': isDisabled
            ? 'rgba(240, 230, 210, 0.6)'
            : 'transparent',
          fontWeight: isPressed ? 700 : style?.fontWeight,
        } as CSSProperties
      }

      return style
    }, [isDisabled, plainDefaultColor, seasonalState, style, theme, usesPlainDefaultBackground, usesSeasonalBackground])

    const { hostRef, canvasProps } = useNineSliceBackground({
      enabled: !usesSeasonalBackground && !usesRegularBackground,
      src: resolvedBackgroundSrc,
      insets: backgroundInsets,
      className: styles['nine-slice-button__canvas'],
      zIndex: 0,
      imageSmoothingEnabled: false,
      backgroundColor: tone?.bg,
    })

    useEffect(() => {
      if (!usesSeasonalBackground || !theme) {
        seasonalImageRef.current = null
        setSeasonalImageVersion(0)
        return
      }

      let cancelled = false

      loadSeasonalButtonImage(theme)
        .then((loaded) => {
          if (cancelled) {
            return
          }

          seasonalImageRef.current = loaded
          setSeasonalImageVersion((value) => value + 1)
        })
        .catch(() => {
          if (!cancelled) {
            seasonalImageRef.current = null
            setSeasonalImageVersion(0)
          }
        })

      return () => {
        cancelled = true
      }
    }, [theme, usesSeasonalBackground])

    useEffect(() => {
      if (!usesSeasonalBackground || !theme) {
        return
      }

      const canvas = seasonalCanvasRef.current
      if (!canvas) {
        return
      }

      const redraw = () => {
        const image = seasonalImageRef.current
        if (!image) {
          return
        }

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

        drawSeasonalButtonBackground({
          ctx,
          image,
          theme,
          state: seasonalState,
          targetWidth,
          targetHeight,
        })
      }

      redraw()
      const observer = new ResizeObserver(redraw)
      observer.observe(canvas)
      window.addEventListener('resize', redraw)

      return () => {
        observer.disconnect()
        window.removeEventListener('resize', redraw)
      }
    }, [seasonalImageVersion, seasonalState, theme, usesSeasonalBackground])

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

    const handlePointerEnter = (event: PointerEvent<HTMLButtonElement>) => {
      setIsHovered(true)
      onPointerEnter?.(event)
    }

    const handlePointerLeave = (event: PointerEvent<HTMLButtonElement>) => {
      setIsHovered(false)
      setIsPressed(false)
      onPointerLeave?.(event)
    }

    const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
      if (event.button === 0) {
        setIsPressed(true)
      }
      onPointerDown?.(event)
    }

    const handlePointerUp = (event: PointerEvent<HTMLButtonElement>) => {
      setIsPressed(false)
      onPointerUp?.(event)
    }

    const handlePointerCancel = (event: PointerEvent<HTMLButtonElement>) => {
      setIsPressed(false)
      onPointerCancel?.(event)
    }

    const handleBlur = (event: FocusEvent<HTMLButtonElement>) => {
      setIsHovered(false)
      setIsPressed(false)
      onBlur?.(event)
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        setIsPressed(true)
      }
      onKeyDown?.(event)
    }

    const handleKeyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
      setIsPressed(false)
      onKeyUp?.(event)
    }

    return (
      <button
        {...rest}
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        style={buttonStyle}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onPointerCancel={handlePointerCancel}
        onPointerDown={handlePointerDown}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerUp={handlePointerUp}
        className={cls(
          styles['nine-slice-button'],
          styles[`nine-slice-button--${renderedVariant}`],
          usesSeasonalBackground ? styles['nine-slice-button--seasonal'] : undefined,
          usesPlainDefaultBackground ? styles['nine-slice-button--plain-default'] : undefined,
          styles[`nine-slice-button--${size}`],
          block ? styles['nine-slice-button--block'] : undefined,
          className
        )}
      >
        {usesSeasonalBackground ? (
          <span className={styles['nine-slice-button__bg']}>
            <canvas
              ref={seasonalCanvasRef}
              className={cls(
                styles['nine-slice-button__canvas'],
                styles['nine-slice-button__canvas--seasonal']
              )}
              aria-hidden
            />
          </span>
        ) : null}
        {usesPlainDefaultBackground ? (
          <span className={styles['nine-slice-button__bg']}>
            <img
              src={DEFAULT_BUTTON_IMAGE_SRC}
              alt=""
              className={cls(
                styles['nine-slice-button__plain-default-image'],
                isPressed ? styles['nine-slice-button__plain-default-image--pressed'] : undefined
              )}
              aria-hidden
            />
          </span>
        ) : null}
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
