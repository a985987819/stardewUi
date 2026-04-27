import { type HTMLAttributes, type ReactNode } from 'react'
import { classNames } from '../../utils/classNames'
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
  ...rest
}: StarCardProps) {
  const hasTitle = showTitle && Boolean(title)

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
    <div {...rest} className={cardClass} onClick={onClick}>
      <span className={styles['stardew-card__frame']} aria-hidden />
      <span className={styles['stardew-card__outline']} aria-hidden />
      {hasTitle ? (
        <div className={styles['stardew-card__header']}>
          <div className={styles['stardew-card__title-tag']}>
            <h3 className={styles['stardew-card__title']}>{title}</h3>
          </div>
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
export { StarCard as Card, StarCardImage as CardImage, StarCardMeta as CardMeta }
export default StarCard
