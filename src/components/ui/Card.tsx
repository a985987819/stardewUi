import { type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { classNames } from '../../utils/classNames'
import { createCardPalette } from '../../utils/cardLighting'
import styles from './Card.module.scss'

const DEFAULT_CARD_EDGE_COLOR = '#fa9305'

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

export interface StarCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
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

function isPresetCardColor(color?: CardThemeColor): color is CardColor {
  return Boolean(color && color in CARD_EDGE_COLORS)
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
  const palette = createCardPalette(baseColor)
  const cardStyle = {
    ...style,
    '--card-bg': palette.background,
    '--card-bg-light': palette.backgroundLight,
    '--card-bg-dark': palette.backgroundDark,
    '--card-border-dark': palette.borderDark,
    '--card-border-light': palette.borderLight,
    '--card-inner-border': palette.innerBorder,
    '--card-text': palette.text,
    '--card-text-secondary': palette.textSecondary,
    '--card-section-bg': palette.sectionBackground,
    '--card-top-highlight': palette.topHighlight,
    '--card-right-edge-shadow': palette.rightEdgeShadow,
    '--card-divider-shadow': palette.dividerShadow,
    '--card-title-text-shadow': palette.titleTextShadow,
    '--card-header-stripe-1': palette.headerStripes[0],
    '--card-header-stripe-2': palette.headerStripes[1],
    '--card-header-stripe-3': palette.headerStripes[2],
    '--card-header-stripe-4': palette.headerStripes[3],
    '--card-body-stripe-1': palette.bodyStripes[0],
    '--card-body-stripe-2': palette.bodyStripes[1],
    '--card-body-stripe-3': palette.bodyStripes[2],
    '--card-body-stripe-4': palette.bodyStripes[3],
    '--card-body-stripe-5': palette.bodyStripes[4],
    '--card-body-stripe-6': palette.bodyStripes[5],
    '--card-body-stripe-7': palette.bodyStripes[6],
    '--card-body-stripe-8': palette.bodyStripes[7],
    '--card-footer-top': palette.footerTop,
    '--card-footer-bottom': palette.footerBottom,
    '--card-footer-border': palette.footerBorder,
    '--card-image-divider': palette.imageDivider,
    '--card-body-top-glow': palette.bodyTopGlow,
    '--card-body-bottom-shadow': palette.bodyBottomShadow,
    '--card-body-right-shadow': palette.bodyRightShadow,
    '--card-body-left-glow': palette.bodyLeftGlow,
  } as CSSProperties

  const cardClass = classNames(
    styles['stardew-card'],
    styles[`stardew-card--${variant}`],
    styles[`stardew-card--${size}`],
    isPresetCardColor(color) && styles[`stardew-card--color-${color}`],
    hasTitle && styles['stardew-card--with-title'],
    hoverable && styles['stardew-card--hoverable'],
    onClick && styles['stardew-card--clickable'],
    className
  )

  return (
    <div {...rest} className={cardClass} style={cardStyle} onClick={onClick}>
      <span className={styles['stardew-card__frame']} aria-hidden />
      {hasTitle ? (
        <div data-slot="card-header" className={styles['stardew-card__header']} style={{ justifyContent: 'flex-start' }}>
          {/* <CardSurfaceCanvas stripes={palette.headerStripes} slot="card-header-surface" /> */}
          <h3 className={styles['stardew-card__title']}>{title}</h3>
          {headerExtra ? <div className={styles['stardew-card__extra']}>{headerExtra}</div> : null}
        </div>
      ) : null}
      <div className={styles['stardew-card__body']}>
        {/* <CardSurfaceCanvas stripes={palette.bodyStripes} slot="card-body-surface" /> */}
        <span
          data-slot="card-body-overlay"
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            boxShadow: `inset 0 1px 0 var(--card-body-top-glow), inset 2px 0 0 var(--card-body-left-glow), inset -4px 0 0 var(--card-body-right-shadow), inset 0 -3px 0 var(--card-body-bottom-shadow)`,
          }}
        />
        <div className={styles['stardew-card__body-content']}>{children}</div>
      </div>
      {footer ? <div className={styles['stardew-card__footer']}>{footer}</div> : null}
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
