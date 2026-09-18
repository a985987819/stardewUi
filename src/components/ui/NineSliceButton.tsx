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
  type ReactNode,
} from 'react'
import { useNineSliceBackground } from '../../hooks/useNineSliceBackground'
import { drawDefaultButtonBackground } from '../../utils/defaultButtonCanvas'
import {
  SEASONAL_BUTTON_PALETTES,
} from '../../utils/seasonalButtonCanvas'
import { createDefaultButtonPalette } from '../../utils/defaultButtonTheme'
import { resolveAssetPath } from '../../utils/githubPages'
import StarLoading from './Loading'
import styles from './NineSliceButton.module.scss'

type NineSliceButtonVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'disabled'
  | 'dashed'
  | 'text'
  | 'link'
  | 'concise'
type NineSliceButtonSize = 'small' | 'medium' | 'large'
export type NineSliceButtonTheme = 'spring' | 'summer' | 'autumn' | 'winter'

type ButtonTone = {
  bg: string
  text: string
}

type ImageButtonVariant = Exclude<NineSliceButtonVariant, 'dashed' | 'text' | 'link'>
type ButtonColorMap = Record<ImageButtonVariant, ButtonTone>
type SteppedButtonTone = ButtonTone & { border: string }

export type StarNineSliceButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: NineSliceButtonVariant
  size?: NineSliceButtonSize
  block?: boolean
  theme?: NineSliceButtonTheme
  appearance?: 'regular' | 'classical'
  loading?: boolean
  icon?: ReactNode
  color?: string
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
const ICON_BUTTON_INSETS = { top: 80, right: 200, bottom: 80, left: 200 }
const DEFAULT_BUTTON_IMAGE_SRC = resolveAssetPath('/defaultBtn.png')

const DEFAULT_COLOR_MAP: ButtonColorMap = {
  default: { bg: '#F5E6CC', text: '#3A2E39' },
  primary: { bg: '#8B5A32', text: '#FFF4D6' },
  secondary: { bg: '#D6B477', text: '#4A2C1A' },
  success: { bg: '#71964A', text: '#FFF7DC' },
  warning: { bg: '#C28A45', text: '#FFF2D5' },
  danger: { bg: '#B85C4A', text: '#FFF0DD' },
  disabled: { bg: '#B0A999', text: '#E0D9C6' },
  concise: { bg: '#F5E6CC', text: '#3A2E39' },
}

const STEPPED_BUTTON_TONES: Partial<Record<NineSliceButtonVariant, SteppedButtonTone>> = {
  primary: { bg: '#8B5A32', border: '#4A2C1A', text: '#FFF4D6' },
  secondary: { bg: '#D6B477', border: '#76502D', text: '#4A2C1A' },
  success: { bg: '#71964A', border: '#40582C', text: '#FFF7DC' },
  danger: { bg: '#B85C4A', border: '#71372D', text: '#FFF0DD' },
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
      appearance = 'regular',
      loading = false,
      icon,
      color,
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
      isDisabled && variant !== 'text' && variant !== 'link' && variant !== 'dashed' && variant !== 'concise' ? 'disabled' : variant
    const renderedVariant = variant === 'default' ? 'default' : effectiveVariant
    const loadingSize = size === 'small' ? 14 : size === 'large' ? 18 : 16
    const hasIcon = icon !== undefined && icon !== null
    const isConcise = variant === 'concise'

    // Default and seasonal buttons deliberately share one canvas renderer. The
    // colour changes with the season, while the visible square-step frame stays
    // identical to the default button instead of switching to asset art.
    const steppedTone = STEPPED_BUTTON_TONES[variant]
    const usesPlainDefaultBackground =
      (variant === 'default' || Boolean(steppedTone)) && appearance !== 'classical' && !backgroundSrc
    const usesSeasonalBackground = Boolean(theme) && variant === 'default' && usesPlainDefaultBackground
    const usesRegularBackground = !isConcise && !usesPlainDefaultBackground && appearance !== 'classical' && !backgroundSrc
    const usesRegularImageBackground = usesRegularBackground && !usesPlainDefaultBackground && !hasIcon
    const usesRegularNineSliceBackground = usesRegularBackground && !usesPlainDefaultBackground && hasIcon
    const resolvedBackgroundSrc = backgroundSrc ? resolveAssetPath(backgroundSrc) : resolveAssetPath('/btnImg.png')
    const activeBackgroundSrc = usesRegularNineSliceBackground ? DEFAULT_BUTTON_IMAGE_SRC : resolvedBackgroundSrc
    const activeBackgroundInsets = usesRegularNineSliceBackground ? ICON_BUTTON_INSETS : backgroundInsets
    const [isHovered, setIsHovered] = useState(false)
    const [isPressed, setIsPressed] = useState(false)
    const defaultCanvasRef = useRef<HTMLCanvasElement | null>(null)

    const seasonalState = isDisabled
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
        effectiveVariant === 'secondary' ||
        effectiveVariant === 'success' ||
        effectiveVariant === 'warning' ||
        effectiveVariant === 'danger' ||
        effectiveVariant === 'disabled')

    const dashedVariant = effectiveVariant === 'dashed'

    const tone = useMemo(() => {
      if (
        effectiveVariant === 'default' ||
        effectiveVariant === 'primary' ||
        effectiveVariant === 'secondary' ||
        effectiveVariant === 'success' ||
        effectiveVariant === 'warning' ||
        effectiveVariant === 'danger' ||
        effectiveVariant === 'disabled'
      ) {
        return DEFAULT_COLOR_MAP[effectiveVariant]
      }
      return null
    }, [effectiveVariant])

    const seasonalPalette = usesSeasonalBackground && theme ? SEASONAL_BUTTON_PALETTES[theme] : null
    const plainDefaultPalette = useMemo(() => {
      if (!usesPlainDefaultBackground) {
        return null
      }

      if (seasonalPalette) {
        const fill =
          seasonalState === 'active'
            ? seasonalPalette.pressedFill
            : seasonalState === 'disabled'
              ? seasonalPalette.disabledFill
              : seasonalPalette.normalFill
        return createDefaultButtonPalette(
          seasonalPalette.border,
          fill,
          seasonalPalette.text[seasonalState]
        )
      }

      return steppedTone
        ? createDefaultButtonPalette(steppedTone.border, steppedTone.bg, steppedTone.text)
        : createDefaultButtonPalette(color)
    }, [color, seasonalPalette, seasonalState, steppedTone, usesPlainDefaultBackground])

    const plainDefaultColor = useMemo(() => {
      if (!plainDefaultPalette) {
        return null
      }

      if (seasonalPalette) {
        return seasonalPalette.text[seasonalState]
      }

      if (isDisabled) {
        return plainDefaultPalette.text.disabled
      }

      if (isPressed) {
        return plainDefaultPalette.text.active
      }

      if (isHovered) {
        return plainDefaultPalette.text.hover
      }

      return plainDefaultPalette.text.normal
    }, [isDisabled, isHovered, isPressed, plainDefaultPalette, seasonalPalette, seasonalState])

    const buttonStyle = useMemo(() => {
      if (usesPlainDefaultBackground && plainDefaultColor && plainDefaultPalette) {
        return {
          ...style,
          '--nine-slice-button-default-fill': plainDefaultPalette.fill,
          '--nine-slice-button-default-outer-border': plainDefaultPalette.outerBorder,
          '--nine-slice-button-default-inner-border': plainDefaultPalette.innerBorder,
          '--nine-slice-button-default-color': plainDefaultColor,
          '--nine-slice-button-default-disabled-overlay':
            isDisabled && !seasonalPalette ? plainDefaultPalette.disabledOverlay : 'transparent',
          fontWeight: isPressed ? 700 : style?.fontWeight,
        } as CSSProperties
      }

      return style
    }, [
      isDisabled,
      isPressed,
      plainDefaultColor,
      plainDefaultPalette,
      style,
      usesPlainDefaultBackground,
      seasonalPalette,
    ])

    const { hostRef, canvasProps } = useNineSliceBackground({
      enabled: !usesSeasonalBackground && (!usesRegularBackground || usesRegularNineSliceBackground),
      src: activeBackgroundSrc,
      insets: activeBackgroundInsets,
      className: styles['nine-slice-button__canvas'],
      zIndex: 0,
      imageSmoothingEnabled: false,
      backgroundColor: tone?.bg,
    })

    useEffect(() => {
      if (!usesPlainDefaultBackground || !plainDefaultPalette) {
        return
      }

      const canvas = defaultCanvasRef.current
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

        drawDefaultButtonBackground(ctx, {
          width: targetWidth,
          height: targetHeight,
          palette: plainDefaultPalette,
          dpr,
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
    }, [plainDefaultPalette, usesPlainDefaultBackground])

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
          hasIcon ? styles['nine-slice-button--icon'] : undefined,
          styles[`nine-slice-button--${size}`],
          block ? styles['nine-slice-button--block'] : undefined,
          className
        )}
      >
        {usesPlainDefaultBackground ? (
          <span className={styles['nine-slice-button__bg']}>
            <canvas
              ref={defaultCanvasRef}
              className={cls(
                styles['nine-slice-button__canvas'],
                styles['nine-slice-button__canvas--default']
              )}
              aria-hidden
            />
          </span>
        ) : null}
        {usesRegularImageBackground ? (
          <span className={styles['nine-slice-button__bg']}>
            <img
              src={DEFAULT_BUTTON_IMAGE_SRC}
              alt=""
              className={styles['nine-slice-button__plain-default-image']}
              aria-hidden
            />
          </span>
        ) : null}
        {imageVariant || usesRegularNineSliceBackground ? (
          <span className={styles['nine-slice-button__bg']} ref={hostRef as (node: HTMLSpanElement | null) => void}>
            <canvas {...canvasProps} />
          </span>
        ) : null}
        {dashedVariant ? (
          <span className={styles['nine-slice-button__bg']}>
            <canvas ref={dashedCanvasRef} className={styles['nine-slice-button__canvas']} aria-hidden />
          </span>
        ) : null}
        <span
          className={cls(
            styles['nine-slice-button__content'],
            hasIcon ? styles['nine-slice-button__content--stacked'] : undefined
          )}
        >
          {loading ? (
            <StarLoading active text="" size={loadingSize} className={styles['nine-slice-button__loading']} aria-hidden />
          ) : null}
          {children !== undefined && children !== null ? <span className={styles['nine-slice-button__label']}>{children}</span> : null}
          {icon ? (
            <span className={styles['nine-slice-button__icon']} aria-hidden="true">
              {icon}
            </span>
          ) : null}
        </span>
      </button>
    )
  }
)

StarNineSliceButton.displayName = 'StarNineSliceButton'

export default StarNineSliceButton
