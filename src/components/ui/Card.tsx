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

function toCardCssVariables(baseColor: string): CardCssVariables {
  const palette = createCardPalette(baseColor)

  return {
    '--card-frame-border-base': palette.frame.borderBase,
    '--card-frame-border-inner': palette.frame.borderInner,
    '--card-frame-border-outer': palette.frame.borderOuter,
    '--card-frame-highlight-top': palette.frame.highlightTop,
    '--card-frame-shadow-right': palette.frame.shadowRight,
    '--card-header-border-base': palette.header.borderBase,
    '--card-header-border-inner': palette.header.borderInner,
    '--card-header-border-outer': palette.header.borderOuter,
    '--card-header-highlight-top': palette.header.highlightTop,
    '--card-header-shadow-right': palette.header.shadowRight,
    '--card-header-stripe-1': palette.header.stripes[0],
    '--card-header-stripe-2': palette.header.stripes[1],
    '--card-header-stripe-3': palette.header.stripes[2],
    '--card-header-stripe-4': palette.header.stripes[3],
    '--card-body-border-base': palette.body.borderBase,
    '--card-body-border-inner': palette.body.borderInner,
    '--card-body-border-outer': palette.body.borderOuter,
    '--card-body-highlight-top': palette.body.highlightTop,
    '--card-body-shadow-right': palette.body.shadowRight,
    '--card-body-stripe-1': palette.body.stripes[0],
    '--card-body-stripe-2': palette.body.stripes[1],
    '--card-body-stripe-3': palette.body.stripes[2],
    '--card-body-stripe-4': palette.body.stripes[3],
    '--card-body-stripe-5': palette.body.stripes[4],
    '--card-body-stripe-6': palette.body.stripes[5],
    '--card-body-stripe-7': palette.body.stripes[6],
    '--card-body-stripe-8': palette.body.stripes[7],
    '--card-text-primary': palette.text.primary,
    '--card-text-secondary': palette.text.secondary,
    '--card-text-shadow': palette.text.shadow,
  }
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
        <header className={styles['stardew-card__header']}>
          <h3 className={styles['stardew-card__title']}>{title}</h3>
          {headerExtra ? <div className={styles['stardew-card__extra']}>{headerExtra}</div> : null}
        </header>
      ) : null}
      <section className={styles['stardew-card__body']}>
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
