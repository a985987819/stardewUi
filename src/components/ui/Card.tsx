import { type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { classNames } from '../../utils/classNames'
import { createCardPalette } from '../../utils/cardLighting'
import styles from './Card.module.scss'

const DEFAULT_CARD_EDGE_COLOR = '#dc7b05'

const CARD_EDGE_COLORS = {
  'night-village': '#2f1e27',
  'forest-farm': '#48652c',
  'wooden-cabin': '#6f3a18',
  'lake-night': '#274d70',
  'flower-festival': '#82445f',
  'mine-starry': '#34458a',
  farmland: '#7a4824',
  'orchard-grass': '#355123',
  'workshop-ore': '#39434c',
  'night-celebration': '#202f76',
} as const

export type CardColor = keyof typeof CARD_EDGE_COLORS
export type CardThemeColor = CardColor | string

export interface StarCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'color'> {
  title?: ReactNode
  children: ReactNode
  variant?: 'default' | 'outlined' | 'elevated'
  size?: 'small' | 'medium' | 'large'
  color?: CardThemeColor
  headerExtra?: ReactNode
  footer?: ReactNode
  hoverable?: boolean
  showTitle?: boolean
}

type CardCssVariables = CSSProperties & {
  '--card-frame-border-base': string
  '--card-frame-border-inner': string
  '--card-frame-border-outer': string
  '--card-frame-highlight-top': string
  '--card-frame-shadow-right': string
  '--card-header-border-base': string
  '--card-header-border-inner': string
  '--card-header-border-outer': string
  '--card-header-highlight-top': string
  '--card-header-shadow-right': string
  '--card-header-stripe-1': string
  '--card-header-stripe-2': string
  '--card-header-stripe-3': string
  '--card-header-stripe-4': string
  '--card-body-border-base': string
  '--card-body-border-inner': string
  '--card-body-border-outer': string
  '--card-body-highlight-top': string
  '--card-body-shadow-right': string
  '--card-body-stripe-1': string
  '--card-body-stripe-2': string
  '--card-body-stripe-3': string
  '--card-body-stripe-4': string
  '--card-body-stripe-5': string
  '--card-body-stripe-6': string
  '--card-body-stripe-7': string
  '--card-body-stripe-8': string
  '--card-text-primary': string
  '--card-text-secondary': string
  '--card-text-shadow': string
}

function isPresetCardColor(color?: CardThemeColor): color is CardColor {
  return Boolean(color && color in CARD_EDGE_COLORS)
}

interface CardSurfaceCanvasProps {
  stripes: readonly string[]
  slot: 'card-header-surface' | 'card-body-surface'
}

function CardSurfaceCanvas({ stripes, slot }: CardSurfaceCanvasProps) {
  const hostRef = useRef<HTMLSpanElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const draw = useCallback(() => {
    const host = hostRef.current
    const canvas = canvasRef.current

    if (!host || !canvas) {
      return
    }

    const width = Math.round(host.clientWidth)
    const height = Math.round(host.clientHeight)

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

    drawCardSurfaceStripes(ctx, {
      width: targetWidth,
      height: targetHeight,
      stripes,
    })
  }, [stripes])

  useEffect(() => {
    draw()
  }, [draw])

  useEffect(() => {
    const host = hostRef.current
    if (!host) {
      return
    }

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', draw)
      return () => {
        window.removeEventListener('resize', draw)
      }
    }

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

  return (
    <span ref={hostRef} data-slot={slot} className={styles['stardew-card__surface']} aria-hidden>
      <canvas ref={canvasRef} className={styles['stardew-card__surface-canvas']} />
    </span>
  )
}

function StarCard({
  title,
  children,
  variant = 'default',
  size = 'medium',
  color,
  className = '',
  headerExtra,
  footer,
  hoverable = false,
  showTitle = false,
  onClick,
  style,
  ...rest
}: StarCardProps) {
  const hasTitle = showTitle && Boolean(title)
  const baseColor = isPresetCardColor(color) ? CARD_EDGE_COLORS[color] : color ?? DEFAULT_CARD_EDGE_COLOR

  const cardClass = classNames(
    styles['stardew-card'],
    styles[`stardew-card--${variant}`],
    styles[`stardew-card--${size}`],
    hasTitle && styles['stardew-card--with-title'],
    hoverable && styles['stardew-card--hoverable'],
    onClick && styles['stardew-card--clickable'],
    className
  )

  const cardStyle: CSSProperties = {
    ...toCardCssVariables(baseColor),
    ...style,
  }

  return (
    <div {...rest} className={cardClass} onClick={onClick} style={cardStyle}>
      {hasTitle ? (
        <div data-slot="card-header" className={styles['stardew-card__header']} style={{ justifyContent: 'flex-start' }}>
          <CardSurfaceCanvas stripes={palette.headerStripes} slot="card-header-surface" />
          <span
            data-slot="card-header-overlay"
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              boxShadow: `inset -4px 0 0 var(--card-right-edge-shadow), inset 0 2px 0 var(--card-top-highlight), inset 0 -3px 0 var(--card-divider-shadow)`,
            }}
          />
          <h3 className={styles['stardew-card__title']}>{title}</h3>
          {headerExtra ? <div className={styles['stardew-card__extra']}>{headerExtra}</div> : null}
        </header>
      ) : null}
      <div className={styles['stardew-card__body']}>
        <CardSurfaceCanvas stripes={palette.bodyStripes} slot="card-body-surface" />
        <span
          data-slot="card-body-overlay"
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            boxShadow: `inset 0 1px 0 var(--card-body-top-glow), inset 2px 0 0 var(--card-body-left-glow), inset -4px 0 0 var(--card-body-right-shadow), inset 0 -3px 0 var(--card-body-bottom-shadow)`,
          }}
        />
        <div className={styles['stardew-card__body-content']}>{children}</div>
      </section>
      {footer ? <footer className={styles['stardew-card__footer']}>{footer}</footer> : null}
    </div>
  )
}

interface StarCardImageProps {
  src: string
  alt: string
  className?: string
}

function StarCardImage({ src, alt, className = '' }: StarCardImageProps) {
  return (
    <div className={classNames(styles['stardew-card__image'], className)}>
      <img src={src} alt={alt} />
    </div>
  )
}

interface StarCardMetaProps {
  title?: string
  description?: string
  className?: string
}

function StarCardMeta({ title, description, className = '' }: StarCardMetaProps) {
  return (
    <div className={classNames(styles['stardew-card__meta'], className)}>
      {title ? <h4 className={styles['stardew-card__meta-title']}>{title}</h4> : null}
      {description ? <p className={styles['stardew-card__meta-desc']}>{description}</p> : null}
    </div>
  )
}

StarCard.Image = StarCardImage
StarCard.Meta = StarCardMeta

export { StarCard, StarCardImage, StarCardMeta }
export default StarCard
