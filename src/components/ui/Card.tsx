import { type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { classNames } from '../../utils/classNames'
import { getCardLighting } from '../../utils/cardLighting'
import styles from './Card.module.scss'

export type CardColor =
  | 'night-village'
  | 'forest-farm'
  | 'wooden-cabin'
  | 'lake-night'
  | 'flower-festival'
  | 'mine-starry'
  | 'farmland'
  | 'orchard-grass'
  | 'workshop-ore'
  | 'night-celebration'

export interface StarCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode
  children: ReactNode
  variant?: 'default' | 'outlined' | 'elevated'
  size?: 'small' | 'medium' | 'large'
  color?: CardColor
  headerExtra?: ReactNode
  footer?: ReactNode
  hoverable?: boolean
  showTitle?: boolean
}

const CARD_EDGE_COLORS: Record<CardColor | 'default', string> = {
  default: '#fa9305',
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
  const lighting = getCardLighting(CARD_EDGE_COLORS[color ?? 'default'])
  const cardStyle = {
    ...style,
    '--card-top-highlight': lighting.topHighlight,
    '--card-right-edge-shadow': lighting.rightEdgeShadow,
    '--card-divider-shadow': lighting.dividerShadow,
    '--card-title-text-shadow': lighting.titleTextShadow,
  } as CSSProperties

  const cardClass = classNames(
    styles['stardew-card'],
    styles[`stardew-card--${variant}`],
    styles[`stardew-card--${size}`],
    color && styles[`stardew-card--color-${color}`],
    hasTitle && styles['stardew-card--with-title'],
    hoverable && styles['stardew-card--hoverable'],
    onClick && styles['stardew-card--clickable'],
    className
  )

  return (
    <div {...rest} className={cardClass} style={cardStyle} onClick={onClick}>
      <span className={styles['stardew-card__frame']} aria-hidden />
      {hasTitle ? (
        <div className={styles['stardew-card__header']}>
          <h3 className={styles['stardew-card__title']}>{title}</h3>
          {headerExtra ? <div className={styles['stardew-card__extra']}>{headerExtra}</div> : null}
        </div>
      ) : null}
      <div className={styles['stardew-card__body']}>{children}</div>
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
