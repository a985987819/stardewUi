import { type HTMLAttributes, type ReactNode } from 'react'
import { classNames } from '../../utils/classNames'
import './Card.scss'

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

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
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

function Card({
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
}: CardProps) {
  const hasTitle = showTitle && Boolean(title)

  const cardClass = classNames(
    'stardew-card',
    `stardew-card--${variant}`,
    `stardew-card--${size}`,
    color && `stardew-card--color-${color}`,
    hasTitle && 'stardew-card--with-title',
    hoverable && 'stardew-card--hoverable',
    onClick && 'stardew-card--clickable',
    className
  )

  return (
    <div {...rest} className={cardClass} onClick={onClick}>
      {hasTitle ? (
        <div className="stardew-card__header">
          <div className="stardew-card__title-tag">
            <h3 className="stardew-card__title">{title}</h3>
          </div>
          {headerExtra ? <div className="stardew-card__extra">{headerExtra}</div> : null}
        </div>
      ) : null}
      <div className="stardew-card__body">{children}</div>
      {footer ? <div className="stardew-card__footer">{footer}</div> : null}
    </div>
  )
}

interface CardImageProps {
  src: string
  alt: string
  className?: string
}

function CardImage({ src, alt, className = '' }: CardImageProps) {
  return (
    <div className={`stardew-card__image ${className}`}>
      <img src={src} alt={alt} />
    </div>
  )
}

interface CardMetaProps {
  title?: string
  description?: string
  className?: string
}

function CardMeta({ title, description, className = '' }: CardMetaProps) {
  return (
    <div className={`stardew-card__meta ${className}`}>
      {title ? <h4 className="stardew-card__meta-title">{title}</h4> : null}
      {description ? <p className="stardew-card__meta-desc">{description}</p> : null}
    </div>
  )
}

Card.Image = CardImage
Card.Meta = CardMeta

export { Card, CardImage, CardMeta }
export default Card
